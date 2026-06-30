// ---------------------------------------------------------------------------
// Deterministic test runs — headless quest/minigame sessions with seeded RNG
// ---------------------------------------------------------------------------

import {
  createDeckState,
  drawFromDeck,
  resolveChoice,
} from "@/content/events/engine";
import type { ScenarioDeckState } from "@/content/events/types";
import { initSession, dispatch, type SessionState } from "@/mechanics/engine";
import type { GameState, ModuleRef } from "@/mechanics/types";

import { mulberry32 } from "@/lib/seededRng";

// Register all mechanic modules (side-effect imports)
import "@/mechanics/modules/EarnSpendModule";
import "@/mechanics/modules/ChangeMakingModule";
import "@/mechanics/modules/EventDeckModule";

export type EventDeckTestRunConfig = {
  seed: number;
  deckId: string;
  draws: number;
  choiceIndex?: number;
  economyPhase?: "boom" | "normal" | "recession";
  gameOverrides?: Partial<GameState>;
};

export type EventDeckTestRunResult = {
  seed: number;
  deckId: string;
  eventIds: string[];
  choiceIndices: number[];
  finalMoney: number;
  finalScore: number;
  drawCount: number;
};

/** Run an EventDeck session deterministically without React. */
export function runEventDeckTestRun(config: EventDeckTestRunConfig): EventDeckTestRunResult {
  const rng = mulberry32(config.seed);
  let deckState: ScenarioDeckState = createDeckState([config.deckId]);
  let game = {
    money: 50,
    score: 0,
    turn: 1,
    maxTurns: 20,
    difficulty: "normal" as const,
    flags: {},
    counters: {},
    economyPhase: config.economyPhase ?? "normal",
    ...config.gameOverrides,
  };

  const eventIds: string[] = [];
  const choiceIndices: number[] = [];
  const choiceIndex = config.choiceIndex ?? 0;

  for (let i = 0; i < config.draws; i++) {
    const draw = drawFromDeck(
      deckState,
      config.deckId,
      game,
      undefined,
      config.economyPhase ?? "normal",
      rng,
    );
    if (!draw.event) break;

    eventIds.push(draw.event.id);
    deckState = { ...deckState, activeEvent: draw.event, activeDeckId: config.deckId };

    const resolved = resolveChoice(deckState, choiceIndex);
    choiceIndices.push(choiceIndex);
    deckState = resolved.newDeckState;
    game = applyEffectsToGame(game, resolved.effects);
  }

  return {
    seed: config.seed,
    deckId: config.deckId,
    eventIds,
    choiceIndices,
    finalMoney: game.money,
    finalScore: game.score,
    drawCount: deckState.drawCount,
  };
}

function applyEffectsToGame(game: GameState, effects: import("@/mechanics/types").Effect[]): GameState {
  let next = { ...game, flags: { ...game.flags }, counters: { ...game.counters } };
  for (const effect of effects) {
    switch (effect.type) {
      case "addMoney":
        next = { ...next, money: next.money + effect.amount };
        break;
      case "removeMoney":
        next = { ...next, money: Math.max(0, next.money - effect.amount) };
        break;
      case "addScore":
        next = { ...next, score: next.score + effect.amount };
        break;
      case "setFlag":
        next = { ...next, flags: { ...next.flags, [effect.key]: effect.value } };
        break;
      case "incrementCounter":
        next = {
          ...next,
          counters: {
            ...next.counters,
            [effect.key]: (next.counters[effect.key] || 0) + effect.delta,
          },
        };
        break;
      case "advanceTurn":
        next = { ...next, turn: next.turn + 1 };
        break;
      default:
        break;
    }
  }
  return next;
}

export type ModularMinigameTestRunConfig = {
  seed: number;
  modules: ModuleRef[];
  actions: Array<{ moduleId: string; type: string; payload?: Record<string, unknown> }>;
  gameOverrides?: Partial<GameState>;
};

export type ModularMinigameTestRunResult = {
  seed: number;
  finalMoney: number;
  finalScore: number;
  finalTurn: number;
  telemetryEvents: string[];
};

/**
 * Run a modular minigame session via the mechanics engine.
 * EventDeck draws use seed + action index for deterministic RNG when module config includes seed.
 */
export function runModularMinigameTestRun(
  config: ModularMinigameTestRunConfig,
): ModularMinigameTestRunResult {
  const modulesWithSeed = config.modules.map((m) =>
    m.id === "EventDeck"
      ? { ...m, config: { ...m.config, seed: config.seed } }
      : m,
  );

  let session: SessionState = initSession(modulesWithSeed, config.gameOverrides);
  const telemetryEvents: string[] = [];

  for (const action of config.actions) {
    const result = dispatch(session, action.moduleId, {
      type: action.type,
      payload: action.payload,
    });
    session = result.state;
    for (const t of result.telemetry) {
      telemetryEvents.push(t.event);
    }
  }

  return {
    seed: config.seed,
    finalMoney: session.game.money,
    finalScore: session.game.score,
    finalTurn: session.game.turn,
    telemetryEvents,
  };
}
