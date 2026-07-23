import type { InputActionId, InputBindingsMap } from "./types";

/** Default bindings — keyboard/mouse + standard gamepad (XInput-style). */
export const DEFAULT_BINDINGS: InputBindingsMap = {
  confirm: {
    keyboard: [{ type: "keyboard", code: "Enter" }],
    mouse: [{ type: "mouse", button: 0 }],
    gamepad: [{ type: "gamepad_button", button: 0 }],
  },
  cancel: {
    keyboard: [{ type: "keyboard", code: "Escape" }],
    gamepad: [{ type: "gamepad_button", button: 1 }],
  },
  menu: {
    // Esc is cancel/back only — Settings opens with O so stores never fight Esc.
    keyboard: [{ type: "keyboard", code: "KeyO" }],
    gamepad: [{ type: "gamepad_button", button: 9 }],
  },
  map: {
    keyboard: [{ type: "keyboard", code: "KeyM" }],
    gamepad: [{ type: "gamepad_button", button: 3 }],
  },
  interact: {
    keyboard: [{ type: "keyboard", code: "KeyE" }],
    gamepad: [{ type: "gamepad_button", button: 0 }],
  },
  inventory: {
    keyboard: [{ type: "keyboard", code: "KeyI" }],
    gamepad: [{ type: "gamepad_button", button: 2 }],
  },
  quest_log: {
    keyboard: [{ type: "keyboard", code: "KeyJ" }],
    gamepad: [{ type: "gamepad_button", button: 4 }],
  },
  move_up: {
    keyboard: [{ type: "keyboard", code: "KeyW" }, { type: "keyboard", code: "ArrowUp" }],
    gamepad: [{ type: "gamepad_axis", axis: 1, direction: -1 }],
  },
  move_down: {
    keyboard: [{ type: "keyboard", code: "KeyS" }, { type: "keyboard", code: "ArrowDown" }],
    gamepad: [{ type: "gamepad_axis", axis: 1, direction: 1 }],
  },
  move_left: {
    keyboard: [{ type: "keyboard", code: "KeyA" }, { type: "keyboard", code: "ArrowLeft" }],
    gamepad: [{ type: "gamepad_axis", axis: 0, direction: -1 }],
  },
  move_right: {
    keyboard: [{ type: "keyboard", code: "KeyD" }, { type: "keyboard", code: "ArrowRight" }],
    gamepad: [{ type: "gamepad_axis", axis: 0, direction: 1 }],
  },
  pause: {
    keyboard: [{ type: "keyboard", code: "KeyP" }],
    gamepad: [{ type: "gamepad_button", button: 9 }],
  },
};

export const INPUT_ACTION_META: Record<
  InputActionId,
  { label: string; category: "navigation" | "ui" | "movement" }
> = {
  confirm: { label: "Confirm / Select", category: "ui" },
  cancel: { label: "Cancel / Back", category: "ui" },
  menu: { label: "Menu / Settings", category: "ui" },
  map: { label: "Travel Map", category: "navigation" },
  interact: { label: "Interact / Talk", category: "ui" },
  inventory: { label: "Inventory", category: "navigation" },
  quest_log: { label: "Quest Log", category: "navigation" },
  move_up: { label: "Move Up", category: "movement" },
  move_down: { label: "Move Down", category: "movement" },
  move_left: { label: "Move Left", category: "movement" },
  move_right: { label: "Move Right", category: "movement" },
  pause: { label: "Pause", category: "ui" },
};

export const ALL_ACTION_IDS = Object.keys(INPUT_ACTION_META) as InputActionId[];
