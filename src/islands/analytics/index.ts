export { analytics } from "../analytics";
export type { AnalyticsSink } from "../analytics";

export {
  getOrStartSession,
  getSessionId,
  getElapsedMs,
  getCurrentScreen,
  resetSession,
  sessionContext,
} from "./session";
export type { AnalyticsScreen } from "./session";

export { trackScreenEnter, trackScreenExit } from "./screenTracking";

export {
  analyzeFunnel,
  FUNNEL_STAGES,
  FUNNEL_WINDOW_MS,
  groupEventsBySession,
} from "./funnel";
export type {
  FunnelAnalysis,
  FunnelStageCount,
  DropOffPoint,
  SessionSummary,
} from "./funnel";

export * from "./ftue";

export {
  analyzeFtueFunnel,
  FTUE_STEPS,
  FTUE_STEP_COUNT,
  shouldSkipAshoreTeach,
  trackCoreLoopFirstSuccess,
} from "../ftueTelemetry";
export type { FtueFunnelAnalysis, FtueStepId } from "../ftueTelemetry";

export {
  loadAnalyticsEvents,
  clearAnalyticsEvents,
  exportAnalyticsCsv,
  exportAnalyticsJson,
  eventsToCsv,
  eventsToJson,
  ANALYTICS_KV_KEY,
  MAX_ANALYTICS_EVENTS,
} from "./export";

export {
  analyzeHealthDashboard,
  evaluateHealthDamageFlags,
} from "./healthDashboard";
export type {
  HealthDashboardSnapshot,
  HealthCategorySnapshot,
  HealthDamageFlag,
  HealthDamageFlagId,
  HealthMetric,
  HealthCategoryId,
} from "./healthDashboard";

export { default as AnalyticsExportView } from "./AnalyticsExportView";
