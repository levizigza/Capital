import { describe, expect, it } from "vitest";

import { mulberry32 } from "@/lib/seededRng";
import { simulateDraws, loadDeckById } from "@/content/events/engine";
import { createDefaultGameState } from "@/mechanics/engine";

import {
  runEventDeckTestRun,
  runModularMinigameTestRun,
} from "./runMinigameTest";

describe("deterministic minigame test runs", () => {
  it("event deck draws are reproducible with the same seed", () => {
    const config = {
      seed: 42,
      deckId: "finance_kids",
      draws: 5,
      choiceIndex: 0,
      gameOverrides: { money: 50 },
    };

    const runA = runEventDeckTestRun(config);
    const runB = runEventDeckTestRun(config);

    expect(runA.eventIds).toEqual(runB.eventIds);
    expect(runA).toMatchSnapshot();
  });

  it("different seeds produce different event sequences", () => {
    const runA = runEventDeckTestRun({
      seed: 1,
      deckId: "finance_kids",
      draws: 5,
      choiceIndex: 0,
    });
    const runB = runEventDeckTestRun({
      seed: 999,
      deckId: "finance_kids",
      draws: 5,
      choiceIndex: 0,
    });

    expect(runA.eventIds).not.toEqual(runB.eventIds);
  });

  it("simulateDraws distribution is stable with seeded RNG", () => {
    const deck = loadDeckById("finance_kids");
    expect(deck).toBeDefined();
    if (!deck) return;

    const game = createDefaultGameState({ money: 50 });
    const rng = mulberry32(12345);
    const result = simulateDraws(deck, game, 100, undefined, "normal", rng);

    expect(result.totalDraws).toBe(100);
    expect(result.draws.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });

  it("modular EventDeck session is deterministic via module seed config", () => {
    const modules = [
      {
        id: "EventDeck",
        config: { deckIds: ["finance_kids"], maxDraws: 3 },
      },
    ];

    const actions = [
      { moduleId: "EventDeck", type: "draw" },
      { moduleId: "EventDeck", type: "choose", payload: { choiceIndex: 0 } },
      { moduleId: "EventDeck", type: "draw" },
      { moduleId: "EventDeck", type: "choose", payload: { choiceIndex: 0 } },
    ];

    const runA = runModularMinigameTestRun({ seed: 777, modules, actions });
    const runB = runModularMinigameTestRun({ seed: 777, modules, actions });

    expect(runA).toEqual(runB);
    expect(runA).toMatchSnapshot();
  });

  it("coincraft coin sort minigame session runs without error", () => {
    const result = runModularMinigameTestRun({
      seed: 100,
      modules: [
        {
          id: "EarnSpend",
          config: {
            startingBalance: 0,
            earnOptions: [{ id: "job", label: "Job", amount: 15 }],
            spendOptions: [{ id: "item", label: "Item", cost: 10 }],
          },
        },
      ],
      actions: [
        { moduleId: "EarnSpend", type: "earn", payload: { optionId: "job" } },
        { moduleId: "EarnSpend", type: "spend", payload: { optionId: "item" } },
      ],
    });

    expect(result.finalMoney).toBeGreaterThanOrEqual(0);
    expect(result.telemetryEvents.length).toBeGreaterThan(0);
    expect(result).toMatchSnapshot();
  });
});
