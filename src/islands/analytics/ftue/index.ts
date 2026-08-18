export {
  FTUE_VERSION,
  FTUE_EVENT_NAMES,
  FTUE_PRIMARY_METRICS,
  FTUE_PAYLOAD_ALLOWLIST,
} from "./types";
export type {
  FtueEventName,
  FtueSegmentContext,
  FtueMetricsSnapshot,
  FtuePrimaryMetricId,
  ExperienceModeSegment,
  SkipStatusSegment,
  HintUsageSegment,
  FailurePatternSegment,
  PlatformSegment,
} from "./types";

export { sanitizeFtuePayload, assertNoPiiInPayload } from "./privacy";

export {
  setFtueExperienceMode,
  setFtueSkipStatus,
  noteFtueHintUsed,
  noteFtueFailure,
  resetFtueSessionStats,
  buildFtueSegmentContext,
  resolvePlatform,
  recordRetentionDay,
  loadRetentionDays,
  localDayKey,
  clearRetentionDaysForTests,
} from "./context";

export {
  trackFtue,
  trackFtueOnce,
  trackFirstControlReceived,
  trackFirstMeaningfulAction,
  trackDecisionPresented,
  trackDecisionCommitted,
  trackConsequenceDisplayed,
  trackFreeplayEntered,
  resetFtueOnceGuards,
  hasFtueOnce,
} from "./track";

export { trackConceptLifecycleFtue, filterFtueEvents, isFtueEventName } from "./lifecycle";

export {
  analyzeFtueMetrics,
  analyzeFtueMetricsBySegment,
  computeRetentionRates,
  primaryMetricValues,
} from "./metrics";
