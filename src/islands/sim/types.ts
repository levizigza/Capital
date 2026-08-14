/**
 * Headless Harbor economy simulation — types.
 * @see docs/ECONOMY_SIM.md
 */

export type AgentStrategyId =
  | "conservative"
  | "aggressive"
  | "random"
  | "optimizer"
  | "collector"
  | "long_term_investor"
  | "short_term_trader"
  | "resource_hoarder"
  | "balanced";

export const AGENT_STRATEGY_IDS: readonly AgentStrategyId[] = [
  "conservative",
  "aggressive",
  "random",
  "optimizer",
  "collector",
  "long_term_investor",
  "short_term_trader",
  "resource_hoarder",
  "balanced",
] as const;

/** Forced macro bias for condition sweeps (still uses advanceEconomy unless sticky). */
export type EconomyBias = "natural" | "sticky_boom" | "sticky_recession" | "sticky_normal";

export type SimCondition = {
  id: string;
  startingCoins: number;
  maxTurns: number;
  economyBias: EconomyBias;
  /** Minigame base success rate before strategy bias */
  minigameBaseSuccess: number;
};

export type SimConfig = {
  seed: number;
  gamesPerStrategy: number;
  strategies: AgentStrategyId[];
  conditions: SimCondition[];
  /** Flag if a strategy is top across this fraction of conditions */
  dominanceConditionShare: number;
  /** Win-rate gap vs next that counts as dominant within a condition */
  dominanceWinGapPp: number;
};

export type MilestoneId =
  | "first_asset"
  | "cashflow_30"
  | "escape_streak_1"
  | "harbor_freedom"
  | "first_seal"
  | "carpet_polish"
  | "plaza_pass";

export type SimGameResult = {
  strategy: AgentStrategyId;
  conditionId: string;
  seed: number;
  turns: number;
  won: boolean;
  /** Harbor Freedom within maxTurns */
  freedomTurn: number | null;
  finalCoins: number;
  finalCashflow: number;
  finalAssets: number;
  finalLiabilities: number;
  seals: number;
  dealsAccepted: number;
  dealsDeclined: number;
  sealsBought: number;
  shopSpend: number;
  minigameAttempts: number;
  minigameSuccesses: number;
  /** Turns with pouch < 10 */
  scarcityTurns: number;
  /** Turns with net CF < 0 */
  negativeCfTurns: number;
  /** Turns with pouch === 0 after resolve */
  bankruptTurns: number;
  deadlock: boolean;
  collapse: boolean;
  runawayLeader: boolean;
  milestoneTurns: Partial<Record<MilestoneId, number>>;
  peakCoins: number;
  peakCashflow: number;
};

export type StrategyConditionStats = {
  strategy: AgentStrategyId;
  conditionId: string;
  games: number;
  winRate: number;
  meanFinalCoins: number;
  meanFinalCashflow: number;
  meanFreedomTurn: number | null;
  meanSeals: number;
  meanDealsAccepted: number;
  scarcityRate: number;
  deadlockRate: number;
  collapseRate: number;
  runawayRate: number;
  /** Share of games that bought ≥1 asset */
  assetAdoptionRate: number;
};

export type DominanceFlag = {
  strategy: AgentStrategyId;
  /** Conditions where this strategy had the highest win rate (ties broken by mean CF) */
  toppedConditionIds: string[];
  shareOfConditions: number;
  meanWinRate: number;
  reason: string;
};

export type ImbalanceFinding = {
  kind:
    | "strategy_dominance"
    | "resource_inflation"
    | "resource_scarcity"
    | "runaway_leaders"
    | "deadlocks"
    | "economic_collapse"
    | "feedback_loop"
    | "milestone_skew";
  severity: "info" | "watch" | "alert";
  title: string;
  /** WHY this emerged from the measured rules — never an auto-fix */
  why: string;
  evidence: string[];
  /** Strategies implicated, if any */
  strategies?: AgentStrategyId[];
};

export type SimBatchReport = {
  generatedAt: string;
  config: SimConfig;
  totalGames: number;
  byStrategyCondition: StrategyConditionStats[];
  dominanceFlags: DominanceFlag[];
  findings: ImbalanceFinding[];
  /** Human-readable report (markdown) */
  markdown: string;
};
