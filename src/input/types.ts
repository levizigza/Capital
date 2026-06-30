/** Semantic game actions (rebindable). */
export type InputActionId =
  | "confirm"
  | "cancel"
  | "menu"
  | "map"
  | "interact"
  | "inventory"
  | "quest_log"
  | "move_up"
  | "move_down"
  | "move_left"
  | "move_right"
  | "pause";

export type InputDeviceKind = "keyboard" | "mouse" | "gamepad";

/** Gamepad prompt set shown in UI (maps to Xelu asset folders). */
export type GamepadPromptLayout = "xbox-series" | "playstation" | "switch" | "generic";

export type PromptTheme = "dark" | "light";

export type KeyboardBinding = {
  type: "keyboard";
  code: string;
};

export type MouseBinding = {
  type: "mouse";
  button: number;
};

export type GamepadButtonBinding = {
  type: "gamepad_button";
  button: number;
};

export type GamepadAxisBinding = {
  type: "gamepad_axis";
  axis: number;
  direction: 1 | -1;
  threshold?: number;
};

export type PhysicalBinding =
  | KeyboardBinding
  | MouseBinding
  | GamepadButtonBinding
  | GamepadAxisBinding;

export type ActionBindingSet = {
  keyboard?: KeyboardBinding[];
  mouse?: MouseBinding[];
  gamepad?: (GamepadButtonBinding | GamepadAxisBinding)[];
};

export type InputBindingsMap = Record<InputActionId, ActionBindingSet>;

export type InputSettingsV1 = {
  version: 1;
  bindings: InputBindingsMap;
  /** User override for gamepad prompt art when a pad is connected */
  gamepadPromptLayout?: GamepadPromptLayout;
  promptTheme?: PromptTheme;
};

export type CapturedInput = PhysicalBinding & { device: InputDeviceKind };
