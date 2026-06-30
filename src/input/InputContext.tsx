import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { InputManager } from "./InputManager";
import { loadInputSettings, persistInputSettings, resetBindingsToDefault } from "./storage";
import type {
  CapturedInput,
  GamepadPromptLayout,
  InputActionId,
  InputBindingsMap,
  InputDeviceKind,
  InputSettingsV1,
  PromptTheme,
} from "./types";

type InputContextValue = {
  settings: InputSettingsV1;
  bindings: InputBindingsMap;
  activeDevice: InputDeviceKind;
  gamepadLayout: GamepadPromptLayout;
  promptTheme: PromptTheme;
  updateSettings: (patch: Partial<InputSettingsV1>) => void;
  setBinding: (action: InputActionId, captured: CapturedInput) => void;
  resetAllBindings: () => void;
  captureNextInput: (signal: AbortSignal) => Promise<CapturedInput>;
  subscribe: (action: InputActionId, fn: () => void) => () => void;
};

const InputContext = createContext<InputContextValue | null>(null);

export function InputProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<InputSettingsV1>(() => loadInputSettings());
  const [activeDevice, setActiveDevice] = useState<InputDeviceKind>("keyboard");
  const [gamepadLayout, setGamepadLayout] = useState<GamepadPromptLayout>("xbox-series");
  const managerRef = useRef<InputManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new InputManager(settings.bindings);
  }

  useEffect(() => {
    managerRef.current?.setBindings(settings.bindings);
    persistInputSettings(settings);
  }, [settings]);

  useEffect(() => {
    const mgr = managerRef.current!;
    mgr.start();
    const off = mgr.onDeviceChange((device, layout) => {
      setActiveDevice(device);
      setGamepadLayout(settings.gamepadPromptLayout ?? layout);
    });
    return () => {
      off();
      mgr.stop();
    };
  }, [settings.gamepadPromptLayout]);

  const updateSettings = useCallback((patch: Partial<InputSettingsV1>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setBinding = useCallback((action: InputActionId, captured: CapturedInput) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const slot = { ...next.bindings[action] };
      if (captured.type === "keyboard") {
        slot.keyboard = [{ type: "keyboard", code: captured.code }];
      } else if (captured.type === "mouse") {
        slot.mouse = [{ type: "mouse", button: captured.button }];
      } else if (captured.type === "gamepad_button") {
        slot.gamepad = [{ type: "gamepad_button", button: captured.button }];
      } else if (captured.type === "gamepad_axis") {
        slot.gamepad = [captured];
      }
      next.bindings[action] = slot;
      return next;
    });
  }, []);

  const resetAllBindings = useCallback(() => {
    setSettings(resetBindingsToDefault());
  }, []);

  const captureNextInput = useCallback((signal: AbortSignal) => {
    return managerRef.current!.waitForCapture(signal);
  }, []);

  const subscribe = useCallback((action: InputActionId, fn: () => void) => {
    return managerRef.current!.subscribe(action, fn);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      bindings: settings.bindings,
      activeDevice,
      gamepadLayout: settings.gamepadPromptLayout ?? gamepadLayout,
      promptTheme: settings.promptTheme ?? "dark",
      updateSettings,
      setBinding,
      resetAllBindings,
      captureNextInput,
      subscribe,
    }),
    [
      settings,
      activeDevice,
      gamepadLayout,
      updateSettings,
      setBinding,
      resetAllBindings,
      captureNextInput,
      subscribe,
    ]
  );

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}

export function useInput(): InputContextValue {
  const ctx = useContext(InputContext);
  if (!ctx) throw new Error("useInput must be used within InputProvider");
  return ctx;
}

export function useInputOptional(): InputContextValue | null {
  return useContext(InputContext);
}
