// ---------------------------------------------------------------------------
// Mechanic Module Engine
// ---------------------------------------------------------------------------
// Orchestrates multiple modules in a single minigame session.
// All state is immutable — each apply() returns a new snapshot.
// ---------------------------------------------------------------------------

import { getModule } from "./registry";
import type {
  GameState,
  ModuleState,
  ModuleAction,
  Effect,
  TelemetryEntry,
  ModuleUIModel,
  ModuleRef,
} from "./types";

/** Full session state: shared game state + per-module slices. */
export type SessionState = {
  game: GameState;
  modules: Record<string, ModuleState>;
};

/** Result of dispatching an action through the engine. */
export type DispatchResult = {
  state: SessionState;
  effects: Effect[];
  telemetry: TelemetryEntry[];
};

/** Create a default GameState. Callers can override fields. */
export function createDefaultGameState(
  overrides?: Partial<GameState>,
): GameState {
  return {
    money: 0,
    score: 0,
    turn: 1,
    maxTurns: 10,
    difficulty: "normal",
    flags: {},
    counters: {},
    ...overrides,
  };
}

/**
 * Initialise a session from an array of ModuleRefs (as stored in island JSON)
 * and an optional GameState override.
 */
export function initSession(
  moduleRefs: ModuleRef[],
  gameOverrides?: Partial<GameState>,
): SessionState {
  const game = createDefaultGameState(gameOverrides);
  const modules: Record<string, ModuleState> = {};

  for (const ref of moduleRefs) {
    const mod = getModule(ref.id);
    if (!mod) {
      console.warn(`[engine] Module "${ref.id}" not found in registry — skipping.`);
      continue;
    }
    modules[ref.id] = mod.init(ref.config, game);
  }

  return { game, modules };
}

/**
 * Dispatch an action to a specific module, returning the new session state
 * plus accumulated effects and telemetry.
 */
export function dispatch(
  session: SessionState,
  targetModuleId: string,
  action: ModuleAction,
): DispatchResult {
  const mod = getModule(targetModuleId);
  if (!mod) {
    console.warn(`[engine] dispatch: module "${targetModuleId}" not found.`);
    return { state: session, effects: [], telemetry: [] };
  }

  const moduleState = session.modules[targetModuleId];
  if (!moduleState) {
    console.warn(`[engine] dispatch: no state for module "${targetModuleId}".`);
    return { state: session, effects: [], telemetry: [] };
  }

  const result = mod.apply(action, moduleState, session.game);

  // Apply effects to shared game state
  let game = { ...session.game };
  for (const effect of result.effects) {
    game = applyEffect(game, effect);
  }

  const newModules = {
    ...session.modules,
    [targetModuleId]: result.newState,
  };

  return {
    state: { game, modules: newModules },
    effects: result.effects,
    telemetry: result.telemetry,
  };
}

/** Gather UI models from all active modules. */
export function getUIModels(session: SessionState): ModuleUIModel[] {
  const models: ModuleUIModel[] = [];

  for (const [id, moduleState] of Object.entries(session.modules)) {
    const mod = getModule(id);
    if (!mod) continue;
    models.push(mod.getUIModel(moduleState, session.game));
  }

  return models;
}

// ---------------------------------------------------------------------------
// Internal: apply a single Effect to the shared GameState
// ---------------------------------------------------------------------------
function applyEffect(game: GameState, effect: Effect): GameState {
  switch (effect.type) {
    case "addMoney":
      return { ...game, money: game.money + effect.amount };
    case "removeMoney":
      return { ...game, money: Math.max(0, game.money - effect.amount) };
    case "addScore":
      return { ...game, score: game.score + effect.amount };
    case "setFlag":
      return { ...game, flags: { ...game.flags, [effect.key]: effect.value } };
    case "incrementCounter":
      return {
        ...game,
        counters: {
          ...game.counters,
          [effect.key]: (game.counters[effect.key] || 0) + effect.delta,
        },
      };
    case "advanceTurn":
      return { ...game, turn: game.turn + 1 };
    case "showMessage":
    case "playSound":
    case "endGame":
      // These are handled by the UI layer, not state
      return game;
    default:
      return game;
  }
}
