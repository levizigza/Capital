/**
 * Batch Monte Carlo runner for Harbor economy strategies.
 * Produces reports — never mutates live balance constants.
 */

import { runSimGame } from "./game";
import {
  buildStats,
  detectImbalances,
  finalizeFindings,
  flagDominance,
  renderReportMarkdown,
} from "./metrics";
import {
  AGENT_STRATEGY_IDS,
  type AgentStrategyId,
  type SimBatchReport,
  type SimCondition,
  type SimConfig,
  type SimGameResult,
} from "./types";

export const DEFAULT_CONDITIONS: SimCondition[] = [
  {
    id: "baseline_40c_45t",
    startingCoins: 40,
    maxTurns: 45,
    economyBias: "natural",
    minigameBaseSuccess: 0.7,
  },
  {
    id: "poor_20c_45t",
    startingCoins: 20,
    maxTurns: 45,
    economyBias: "natural",
    minigameBaseSuccess: 0.7,
  },
  {
    id: "rich_80c_45t",
    startingCoins: 80,
    maxTurns: 45,
    economyBias: "natural",
    minigameBaseSuccess: 0.7,
  },
  {
    id: "short_40c_30t",
    startingCoins: 40,
    maxTurns: 30,
    economyBias: "natural",
    minigameBaseSuccess: 0.7,
  },
  {
    id: "long_40c_60t",
    startingCoins: 40,
    maxTurns: 60,
    economyBias: "natural",
    minigameBaseSuccess: 0.7,
  },
  {
    id: "boom_40c_45t",
    startingCoins: 40,
    maxTurns: 45,
    economyBias: "sticky_boom",
    minigameBaseSuccess: 0.7,
  },
  {
    id: "recession_40c_45t",
    startingCoins: 40,
    maxTurns: 45,
    economyBias: "sticky_recession",
    minigameBaseSuccess: 0.65,
  },
];

export function defaultSimConfig(partial?: Partial<SimConfig>): SimConfig {
  return {
    seed: 20260814,
    gamesPerStrategy: 50,
    strategies: [...AGENT_STRATEGY_IDS],
    conditions: DEFAULT_CONDITIONS,
    dominanceConditionShare: 0.5,
    dominanceWinGapPp: 12,
    ...partial,
  };
}

/**
 * Run the full strategy × condition grid.
 * For thousands of games: gamesPerStrategy * strategies * conditions
 * e.g. 50 × 9 × 7 = 3,150 games.
 */
export function runSimBatch(config: SimConfig = defaultSimConfig()): SimBatchReport {
  const games: SimGameResult[] = [];
  let gameIndex = 0;

  for (const condition of config.conditions) {
    for (const strategy of config.strategies) {
      for (let i = 0; i < config.gamesPerStrategy; i++) {
        const seed = (config.seed + gameIndex * 9973 + i * 131) >>> 0;
        games.push(
          runSimGame({
            strategy: strategy as AgentStrategyId,
            condition,
            seed,
          }),
        );
        gameIndex += 1;
      }
    }
  }

  const byStrategyCondition = buildStats(games, config.strategies, config.conditions);
  const dominanceFlags = flagDominance(byStrategyCondition, config.conditions, config);
  const findings = finalizeFindings(
    detectImbalances(games, byStrategyCondition, dominanceFlags, config.conditions),
    config,
  );

  const partial = {
    generatedAt: new Date().toISOString(),
    config,
    totalGames: games.length,
    byStrategyCondition,
    dominanceFlags,
    findings,
  };

  return {
    ...partial,
    markdown: renderReportMarkdown(partial),
  };
}

/** Compact JSON-serializable summary for CI artifacts */
export function reportToJson(report: SimBatchReport): string {
  const { markdown: _md, ...rest } = report;
  return JSON.stringify({ ...rest, markdownLength: report.markdown.length }, null, 2);
}
