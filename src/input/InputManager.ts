import type {
  CapturedInput,
  GamepadPromptLayout,
  InputActionId,
  InputBindingsMap,
  InputDeviceKind,
  PhysicalBinding,
} from "./types";

type Listener = (action: InputActionId) => void;
type DeviceListener = (device: InputDeviceKind, layout: GamepadPromptLayout) => void;

const AXIS_THRESHOLD = 0.55;
const REPEAT_GUARD_MS = 180;

function detectGamepadLayout(id: string): GamepadPromptLayout {
  const lower = id.toLowerCase();
  if (lower.includes("xbox") || lower.includes("xinput") || lower.includes("045e")) return "xbox-series";
  if (lower.includes("playstation") || lower.includes("054c") || lower.includes("dual")) return "playstation";
  if (lower.includes("switch") || lower.includes("057e")) return "switch";
  return "generic";
}

function bindingMatches(
  binding: PhysicalBinding,
  ctx: {
    code?: string;
    mouseButton?: number;
    gamepadButton?: number;
    gamepadAxis?: { axis: number; value: number };
  }
): boolean {
  if (binding.type === "keyboard" && ctx.code === binding.code) return true;
  if (binding.type === "mouse" && ctx.mouseButton === binding.button) return true;
  if (binding.type === "gamepad_button" && ctx.gamepadButton === binding.button) return true;
  if (binding.type === "gamepad_axis" && ctx.gamepadAxis) {
    const { axis, value } = ctx.gamepadAxis;
    if (axis !== binding.axis) return false;
    const th = binding.threshold ?? AXIS_THRESHOLD;
    return binding.direction < 0 ? value < -th : value > th;
  }
  return false;
}

export class InputManager {
  private bindings: InputBindingsMap;
  private listeners = new Map<InputActionId, Set<Listener>>();
  private deviceListeners = new Set<DeviceListener>();
  private activeDevice: InputDeviceKind = "keyboard";
  private gamepadLayout: GamepadPromptLayout = "xbox-series";
  private heldKeys = new Set<string>();
  private lastFire = new Map<InputActionId, number>();
  private rafId: number | null = null;
  private started = false;
  private pointerDownButton: number | null = null;

  constructor(bindings: InputBindingsMap) {
    this.bindings = bindings;
  }

  setBindings(bindings: InputBindingsMap) {
    this.bindings = bindings;
  }

  getActiveDevice(): InputDeviceKind {
    return this.activeDevice;
  }

  getGamepadLayout(): GamepadPromptLayout {
    return this.gamepadLayout;
  }

  subscribe(action: InputActionId, fn: Listener): () => void {
    if (!this.listeners.has(action)) this.listeners.set(action, new Set());
    this.listeners.get(action)!.add(fn);
    return () => this.listeners.get(action)?.delete(fn);
  }

  onDeviceChange(fn: DeviceListener): () => void {
    this.deviceListeners.add(fn);
    fn(this.activeDevice, this.gamepadLayout);
    return () => this.deviceListeners.delete(fn);
  }

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.onBlur);
    this.tick();
  }

  stop() {
    if (!this.started) return;
    this.started = false;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.onBlur);
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private setDevice(device: InputDeviceKind, layout?: GamepadPromptLayout) {
    if (layout) this.gamepadLayout = layout;
    if (this.activeDevice === device && !layout) return;
    this.activeDevice = device;
    for (const fn of this.deviceListeners) fn(device, this.gamepadLayout);
  }

  private emit(action: InputActionId) {
    const now = Date.now();
    const last = this.lastFire.get(action) ?? 0;
    if (now - last < REPEAT_GUARD_MS) return;
    this.lastFire.set(action, now);
    for (const fn of this.listeners.get(action) ?? []) fn(action);
  }

  private matchAndEmit(ctx: Parameters<typeof bindingMatches>[1]) {
    for (const [actionId, set] of Object.entries(this.bindings) as [InputActionId, typeof this.bindings[InputActionId]][]) {
      if (!set) continue;
      const all: PhysicalBinding[] = [
        ...(set.keyboard ?? []),
        ...(set.mouse ?? []),
        ...(set.gamepad ?? []),
      ];
      if (all.some((b) => bindingMatches(b, ctx))) this.emit(actionId);
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.setDevice("keyboard");
    this.heldKeys.add(e.code);
    this.matchAndEmit({ code: e.code });
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.heldKeys.delete(e.code);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.setDevice("mouse");
    this.pointerDownButton = e.button;
    this.matchAndEmit({ mouseButton: e.button });
  };

  private onMouseUp = () => {
    this.pointerDownButton = null;
  };

  private onBlur = () => {
    this.heldKeys.clear();
    this.pointerDownButton = null;
  };

  private tick = () => {
    const pads = navigator.getGamepads?.() ?? [];
    for (const pad of pads) {
      if (!pad?.connected) continue;
      this.setDevice("gamepad", detectGamepadLayout(pad.id));
      for (let i = 0; i < pad.buttons.length; i++) {
        if (pad.buttons[i]?.pressed) this.matchAndEmit({ gamepadButton: i });
      }
      for (let axis = 0; axis < pad.axes.length; axis++) {
        const value = pad.axes[axis];
        if (Math.abs(value) > AXIS_THRESHOLD) {
          this.matchAndEmit({ gamepadAxis: { axis, value } });
        }
      }
      break;
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  /** Capture next physical input (for rebind UI). */
  waitForCapture(signal: AbortSignal): Promise<CapturedInput> {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        window.removeEventListener("keydown", onKey, true);
        window.removeEventListener("mousedown", onMouse, true);
        signal.removeEventListener("abort", onAbort);
        if (this.rafIdCapture != null) cancelAnimationFrame(this.rafIdCapture);
      };

      const onAbort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };

      const onKey = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        resolve({ type: "keyboard", code: e.code, device: "keyboard" });
      };

      const onMouse = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        resolve({ type: "mouse", button: e.button, device: "mouse" });
      };

      const poll = () => {
        if (signal.aborted) return;
        const pads = navigator.getGamepads?.() ?? [];
        for (const pad of pads) {
          if (!pad) continue;
          for (let i = 0; i < pad.buttons.length; i++) {
            if (pad.buttons[i]?.pressed) {
              cleanup();
              resolve({ type: "gamepad_button", button: i, device: "gamepad" });
              return;
            }
          }
        }
        this.rafIdCapture = requestAnimationFrame(poll);
      };

      signal.addEventListener("abort", onAbort);
      window.addEventListener("keydown", onKey, true);
      window.addEventListener("mousedown", onMouse, true);
      this.rafIdCapture = requestAnimationFrame(poll);
    });
  }

  private rafIdCapture: number | null = null;
}
