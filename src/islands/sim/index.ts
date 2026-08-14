/**
 * Headless Harbor economy simulation framework.
 * @see docs/ECONOMY_SIM.md
 */

export { createRng, rngInt, rngPick, withMathRandom } from "./rng";
export type { Rng } from "./rng";

export {
  AGENT_STRATEGY_IDS,
  type AgentStrategyId,
  type SimConfig,
  type SimCondition,
  type SimGameResult,
  type SimBatchReport,
  type DominanceFlag,
  type ImbalanceFinding,
  type StrategyConditionStats,
  type MilestoneId,
  type EconomyBias,
} from "./types";

export { getAgentPolicy, viewFrom } from "./agents";
export type { AgentPolicy, AgentView, ShopOption } from "./agents";

export { runSimGame, simHarborIsland } from "./game";

export {
  DEFAULT_CONDITIONS,
  defaultSimConfig,
  runSimBatch,
  reportToJson,
} from "./batch";

export {
  buildStats,
  flagDominance,
  detectImbalances,
  renderReportMarkdown,
} from "./metrics";
