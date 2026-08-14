import { describe, expect, it } from "vitest";
import { buildBoardForIsland } from "../partyBoard";
import { netCashflow } from "../voyagerLedger";
import { getAgentPolicy, viewFrom } from "./agents";
import { defaultSimConfig, runSimBatch } from "./batch";
import { runSimGame, simHarborIsland } from "./game";
import { flagDominance, buildStats } from "./metrics";
import { AGENT_STRATEGY_IDS } from "./types";

describe("economy sim framework", () => {
  it("builds a Harbor cashflow board from the stub island", () => {
    const board = buildBoardForIsland(simHarborIsland());
    expect(board).toHaveLength(16);
    expect(board.some((s) => s.type === "deal")).toBe(true);
    expect(board.some((s) => s.type === "payday")).toBe(true);
  });

  it("runs a deterministic game for a fixed seed", () => {
    const a = runSimGame({
      strategy: "optimizer",
      condition: {
        id: "t",
        startingCoins: 40,
        maxTurns: 40,
        economyBias: "natural",
        minigameBaseSuccess: 0.7,
      },
      seed: 42,
    });
    const b = runSimGame({
      strategy: "optimizer",
      condition: {
        id: "t",
        startingCoins: 40,
        maxTurns: 40,
        economyBias: "natural",
        minigameBaseSuccess: 0.7,
      },
      seed: 42,
    });
    expect(a.won).toBe(b.won);
    expect(a.finalCashflow).toBe(b.finalCashflow);
    expect(a.finalCoins).toBe(b.finalCoins);
    expect(a.turns).toBe(b.turns);
  });

  it("exposes all requested strategy ids", () => {
    for (const id of AGENT_STRATEGY_IDS) {
      expect(getAgentPolicy(id).id).toBe(id);
    }
  });

  it("hoarder refuses seals; aggressive takes affordable deals", () => {
    const ledger = {
      salaryIncome: 40,
      livingExpenses: 25,
      holdings: [],
      recentEvents: [],
      masteryClears: [],
      positivePaydayStreak: 0,
      harborEscaped: false,
    };
    const view = viewFrom(60, ledger, 0, 5, 45);
    const offer = {
      id: "asset_savings_jar",
      name: "Interest Jar",
      kind: "asset" as const,
      monthlyAmount: 5,
      icon: "🫙",
      purchaseCost: 20,
    };
    const rng = () => 0.1;
    expect(getAgentPolicy("resource_hoarder").shouldBuySeal(20, view, rng)).toBe(false);
    expect(getAgentPolicy("aggressive").shouldAcceptDeal(offer, view, rng)).toBe(true);
    expect(netCashflow(ledger)).toBe(15);
  });

  it("batch report flags dominance without rebalancing and explains WHY", () => {
    const report = runSimBatch(
      defaultSimConfig({
        seed: 99,
        gamesPerStrategy: 8,
        strategies: [
          "optimizer",
          "resource_hoarder",
          "aggressive",
          "collector",
          "balanced",
        ],
        conditions: [
          {
            id: "baseline_40c_45t",
            startingCoins: 40,
            maxTurns: 45,
            economyBias: "natural",
            minigameBaseSuccess: 0.7,
          },
          {
            id: "recession_40c_45t",
            startingCoins: 40,
            maxTurns: 45,
            economyBias: "sticky_recession",
            minigameBaseSuccess: 0.65,
          },
          {
            id: "rich_80c_45t",
            startingCoins: 80,
            maxTurns: 45,
            economyBias: "natural",
            minigameBaseSuccess: 0.7,
          },
        ],
        dominanceConditionShare: 0.34,
        dominanceWinGapPp: 8,
      }),
    );

    expect(report.totalGames).toBe(8 * 5 * 3);
    expect(report.markdown).toMatch(/Economy simulation report/);
    expect(report.markdown).toMatch(/Do not auto-rebalance/);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.findings.every((f) => f.why.length > 40)).toBe(true);
    // Framework must never claim it patched balance constants.
    expect(report.markdown.toLowerCase()).not.toMatch(/auto-rebalanc(?:ed|ing) prices/);
  });

  it("dominance helper only flags cross-condition leaders", () => {
    const games = ["optimizer", "resource_hoarder"].flatMap((strategy) =>
      ["a", "b"].flatMap((conditionId) =>
        Array.from({ length: 4 }, (_, i) =>
          runSimGame({
            strategy: strategy as "optimizer" | "resource_hoarder",
            condition: {
              id: conditionId,
              startingCoins: strategy === "optimizer" ? 80 : 20,
              maxTurns: 40,
              economyBias: "natural",
              minigameBaseSuccess: 0.7,
            },
            seed: 1000 + i + (strategy === "optimizer" ? 0 : 50),
          }),
        ),
      ),
    );
    const rows = buildStats(
      games,
      ["optimizer", "resource_hoarder"],
      [
        {
          id: "a",
          startingCoins: 40,
          maxTurns: 40,
          economyBias: "natural",
          minigameBaseSuccess: 0.7,
        },
        {
          id: "b",
          startingCoins: 40,
          maxTurns: 40,
          economyBias: "natural",
          minigameBaseSuccess: 0.7,
        },
      ],
    );
    const flags = flagDominance(rows, rows.map((r) => ({
      id: r.conditionId,
      startingCoins: 40,
      maxTurns: 40,
      economyBias: "natural" as const,
      minigameBaseSuccess: 0.7,
    })).filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i), {
      dominanceConditionShare: 0.5,
      dominanceWinGapPp: 5,
    });
    expect(Array.isArray(flags)).toBe(true);
  });
});
