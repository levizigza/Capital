import type { GamepadPromptLayout, InputDeviceKind, PhysicalBinding, PromptTheme } from "../types";

/**
 * Maps physical inputs → Xelu pack filenames under /input-prompts/xelu/.
 * Run `npm run assets:xelu-prompts` to sync from OpenGameArt (CC0).
 */
const KEYBOARD_DARK: Record<string, string> = {
  KeyA: "xelu/keyboard/dark/A_Key_Dark.png",
  KeyB: "xelu/keyboard/dark/B_Key_Dark.png",
  KeyC: "xelu/keyboard/dark/C_Key_Dark.png",
  KeyD: "xelu/keyboard/dark/D_Key_Dark.png",
  KeyE: "xelu/keyboard/dark/E_Key_Dark.png",
  KeyI: "xelu/keyboard/dark/I_Key_Dark.png",
  KeyJ: "xelu/keyboard/dark/J_Key_Dark.png",
  KeyM: "xelu/keyboard/dark/M_Key_Dark.png",
  KeyP: "xelu/keyboard/dark/P_Key_Dark.png",
  KeyW: "xelu/keyboard/dark/W_Key_Dark.png",
  KeyS: "xelu/keyboard/dark/S_Key_Dark.png",
  ArrowUp: "xelu/keyboard/dark/Arrow_Up_Key_Dark.png",
  ArrowDown: "xelu/keyboard/dark/Arrow_Down_Key_Dark.png",
  ArrowLeft: "xelu/keyboard/dark/Arrow_Left_Key_Dark.png",
  ArrowRight: "xelu/keyboard/dark/Arrow_Right_Key_Dark.png",
  Enter: "xelu/keyboard/dark/Enter_Key_Dark.png",
  Escape: "xelu/keyboard/dark/Esc_Key_Dark.png",
  Space: "xelu/keyboard/dark/Space_Key_Dark.png",
};

const KEYBOARD_LIGHT: Record<string, string> = {
  KeyA: "xelu/keyboard/light/A_Key_Light.png",
  KeyB: "xelu/keyboard/light/B_Key_Light.png",
  KeyC: "xelu/keyboard/light/C_Key_Light.png",
  KeyD: "xelu/keyboard/light/D_Key_Light.png",
  KeyE: "xelu/keyboard/light/E_Key_Light.png",
  KeyI: "xelu/keyboard/light/I_Key_Light.png",
  KeyJ: "xelu/keyboard/light/J_Key_Light.png",
  KeyM: "xelu/keyboard/light/M_Key_Light.png",
  KeyP: "xelu/keyboard/light/P_Key_Light.png",
  KeyW: "xelu/keyboard/light/W_Key_Light.png",
  KeyS: "xelu/keyboard/light/S_Key_Light.png",
  ArrowUp: "xelu/keyboard/light/Arrow_Up_Key_Light.png",
  ArrowDown: "xelu/keyboard/light/Arrow_Down_Key_Light.png",
  ArrowLeft: "xelu/keyboard/light/Arrow_Left_Key_Light.png",
  ArrowRight: "xelu/keyboard/light/Arrow_Right_Key_Light.png",
  Enter: "xelu/keyboard/light/Enter_Key_Light.png",
  Escape: "xelu/keyboard/light/Esc_Key_Light.png",
  Space: "xelu/keyboard/light/Space_Key_Light.png",
};

const MOUSE_DARK: Record<number, string> = {
  0: "xelu/keyboard/dark/Mouse_Left_Key_Dark.png",
  1: "xelu/keyboard/dark/Mouse_Middle_Key_Dark.png",
  2: "xelu/keyboard/dark/Mouse_Right_Key_Dark.png",
};

const MOUSE_LIGHT: Record<number, string> = {
  0: "xelu/keyboard/light/Mouse_Left_Key_Light.png",
  1: "xelu/keyboard/light/Mouse_Middle_Key_Light.png",
  2: "xelu/keyboard/light/Mouse_Right_Key_Light.png",
};

const XBOX_SERIES_BUTTONS: Record<number, string> = {
  0: "xelu/xbox-series/dark/XboxSeriesX_A.png",
  1: "xelu/xbox-series/dark/XboxSeriesX_B.png",
  2: "xelu/xbox-series/dark/XboxSeriesX_X.png",
  3: "xelu/xbox-series/dark/XboxSeriesX_Y.png",
  4: "xelu/xbox-series/dark/XboxSeriesX_LB.png",
  5: "xelu/xbox-series/dark/XboxSeriesX_RB.png",
  9: "xelu/xbox-series/dark/XboxSeriesX_Menu.png",
};

const XBOX_SERIES_AXES: Record<string, string> = {
  "0:-1": "xelu/xbox-series/dark/XboxSeriesX_Dpad_Left.png",
  "0:1": "xelu/xbox-series/dark/XboxSeriesX_Dpad_Right.png",
  "1:-1": "xelu/xbox-series/dark/XboxSeriesX_Dpad_Up.png",
  "1:1": "xelu/xbox-series/dark/XboxSeriesX_Dpad_Down.png",
};

const SWITCH_BUTTONS: Record<number, string> = {
  0: "xelu/switch/dark/Switch_B.png",
  1: "xelu/switch/dark/Switch_A.png",
  2: "xelu/switch/dark/Switch_Y.png",
  3: "xelu/switch/dark/Switch_X.png",
};

const FALLBACK_SVG: Record<string, string> = {
  keyboard: "/input-prompts/fallback/keyboard_generic.svg",
  mouse: "/input-prompts/fallback/mouse_generic.svg",
  gamepad: "/input-prompts/fallback/gamepad_generic.svg",
};

function prefixBase(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path}`.replace(/([^:]\/)\/+/g, "$1");
}

export function resolvePromptPath(
  binding: PhysicalBinding,
  device: InputDeviceKind,
  layout: GamepadPromptLayout,
  theme: PromptTheme
): string {
  if (binding.type === "keyboard") {
    const map = theme === "light" ? KEYBOARD_LIGHT : KEYBOARD_DARK;
    return prefixBase(map[binding.code] ?? FALLBACK_SVG.keyboard);
  }

  if (binding.type === "mouse") {
    const map = theme === "light" ? MOUSE_LIGHT : MOUSE_DARK;
    return prefixBase(map[binding.button] ?? FALLBACK_SVG.mouse);
  }

  if (binding.type === "gamepad_button") {
    if (layout === "switch") {
      return prefixBase(SWITCH_BUTTONS[binding.button] ?? FALLBACK_SVG.gamepad);
    }
    if (layout === "xbox-series" || layout === "generic") {
      return prefixBase(XBOX_SERIES_BUTTONS[binding.button] ?? FALLBACK_SVG.gamepad);
    }
    return prefixBase(FALLBACK_SVG.gamepad);
  }

  if (binding.type === "gamepad_axis") {
    const key = `${binding.axis}:${binding.direction}`;
    if (layout === "xbox-series" || layout === "generic") {
      return prefixBase(XBOX_SERIES_AXES[key] ?? FALLBACK_SVG.gamepad);
    }
    return prefixBase(FALLBACK_SVG.gamepad);
  }

  return prefixBase(FALLBACK_SVG.keyboard);
}

export function formatBindingLabel(binding: PhysicalBinding): string {
  if (binding.type === "keyboard") {
    const labels: Record<string, string> = {
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
      Space: "Space",
      Enter: "Enter",
      Escape: "Esc",
    };
    if (labels[binding.code]) return labels[binding.code];
    if (binding.code.startsWith("Key")) return binding.code.slice(3);
    return binding.code;
  }
  if (binding.type === "mouse") {
    return ["LMB", "MMB", "RMB"][binding.button] ?? `Mouse ${binding.button}`;
  }
  if (binding.type === "gamepad_button") {
    const xbox = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "View", "Menu"];
    return xbox[binding.button] ?? `Btn ${binding.button}`;
  }
  const dir = binding.direction < 0 ? "-" : "+";
  return `Axis ${binding.axis}${dir}`;
}
