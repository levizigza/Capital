// ---------------------------------------------------------------------------
// Mechanic Module System — Core Types
// ---------------------------------------------------------------------------
// Each module is a self-contained, data-driven game mechanic that can be
// composed with other modules to build minigames. All behaviour is driven
// by a JSON-serialisable config object — no hardcoded values in components.
// ---------------------------------------------------------------------------

/** Shared game-level state visible to all modules in a minigame session. */
export type GameState = {
  money: number;
  score: number;
  turn: number;
  maxTurns: number;
  difficulty: "easy" | "normal" | "hard";
  flags: Record<string, boolean>;
  counters: Record<string, number>;
  /** Current dynamic economy phase (set by island save, read by modules) */
  economyPhase?: import("@/islands/economy").EconomyPhase;
  /** Active learning profile — drives event copy scaling and effect penalties */
  learningProfileId?: import("@/islands/learningProfile").LearningProfileId;
};

/** Per-module state — each module manages its own slice. */
export type ModuleState = Record<string, unknown>;

/** An action dispatched to a module (type + payload). */
export type ModuleAction = {
  type: string;
  payload?: Record<string, unknown>;
};

/** Side-effects a module can produce when an action is applied. */
export type Effect =
  | { type: "addMoney"; amount: number }
  | { type: "removeMoney"; amount: number }
  | { type: "addScore"; amount: number }
  | { type: "setFlag"; key: string; value: boolean }
  | { type: "incrementCounter"; key: string; delta: number }
  | { type: "advanceTurn" }
  | { type: "showMessage"; text: string; variant?: "info" | "success" | "warning" | "error" }
  | { type: "playSound"; soundId: string }
  | { type: "endGame"; success: boolean };

/** A single telemetry entry emitted by a module for analytics. */
export type TelemetryEntry = {
  event: string;
  data?: Record<string, unknown>;
  ts: number;
};

/** The result of applying an action to a module. */
export type ApplyResult = {
  newState: ModuleState;
  effects: Effect[];
  telemetry: TelemetryEntry[];
};

/** UI hints a module exposes for the renderer. */
export type ModuleUIModel = {
  /** Unique module id so the renderer knows which panel to draw. */
  moduleId: string;
  /** Human label for this module's UI section. */
  label: string;
  /** Arbitrary data the renderer uses — typed per-module. */
  data: Record<string, unknown>;
  /** Actions the UI can dispatch back to this module. */
  availableActions: { type: string; label: string; disabled?: boolean }[];
};

// ---------------------------------------------------------------------------
// The MechanicModule interface
// ---------------------------------------------------------------------------

export interface MechanicModule {
  /** Globally unique module identifier (matches registry key). */
  readonly id: string;

  /** Human-readable name for debug/editor UIs. */
  readonly displayName: string;

  /**
   * Initialise module state from a JSON config + the shared game state.
   * Called once when the minigame session starts.
   */
  init(config: Record<string, unknown>, gameState: GameState): ModuleState;

  /**
   * Pure function: given an action and current states, return new module
   * state plus any side-effects and telemetry entries.
   */
  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    gameState: GameState,
  ): ApplyResult;

  /**
   * Derive a render-friendly view-model from the current states.
   * Called every frame / re-render — must be cheap.
   */
  getUIModel(moduleState: ModuleState, gameState: GameState): ModuleUIModel;
}

// ---------------------------------------------------------------------------
// Module reference as stored in island JSON minigame specs
// ---------------------------------------------------------------------------

export type ModuleRef = {
  /** Registry key, e.g. "EarnSpend", "EnvelopeBudget" */
  id: string;
  /** JSON-serialisable config passed to module.init() */
  config: Record<string, unknown>;
};
