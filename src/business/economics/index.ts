/**
 * Capital business economics engine.
 * Vendor-neutral · no fabricated accounting · multi-objective alerts.
 */

export type {
  EconomicsAlert,
  EconomicsAlertSeverity,
  EconomicsDerived,
  EconomicsInputs,
  EconomicsNullReason,
  EconomicsPeriodId,
  EconomicsSnapshot,
  EconomicsThresholds,
  Money,
} from "./types";
export { DEFAULT_ECONOMICS_THRESHOLDS } from "./types";

export {
  calcArpu,
  calcCac,
  calcCacPaybackPeriods,
  calcContributionProfit,
  calcConversionRate,
  calcChurnFromRetention,
  calcGrossProfit,
  calcLtv,
  calcLtvToCac,
  calcMargin,
  calcNetRevenue,
  calcOperatingProfit,
  calcPeriodChange,
  calcRefundRate,
  calcVariableDeliveryCost,
  resolveChurnRate,
  resolveRetentionRate,
} from "./equations";

export { computeEconomicsSnapshot, emptyEconomicsInputs } from "./compute";
export { evaluateEconomicsAlerts } from "./thresholds";
export {
  ECONOMICS_TREND_STORAGE_KEY,
  createEmptyTrendStore,
  getSnapshot,
  listSnapshots,
  loadTrendStoreFromLocalStorage,
  parseTrendStore,
  priorSnapshot,
  recordSnapshot,
  saveTrendStoreToLocalStorage,
  serializeTrendStore,
  upsertSnapshot,
  type EconomicsTrendStore,
} from "./trends";
