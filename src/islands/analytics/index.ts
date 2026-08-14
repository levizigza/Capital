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

export { scrubAnalyticsPayload, ANALYTICS_BANNED_KEYS } from "./privacy";
export { GAME_METRIC_INVESTIGATIONS, metricForEvent } from "./gameMetrics";
export {
  trackSessionHeartbeat,
  trackCoreLoopCycle,
  trackLocationOutcome,
  trackResourceDelta,
  trackStrategySelected,
  trackFeatureUsed,
  trackAbandonPoint,
  trackProgressionMilestone,
  trackDecisionMade,
  trackRetryAttempt,
  trackSystemInteracted,
  resetGameplayTelemetryCounters,
} from "./trackGameplay";
export { featureFromHubModal } from "./schemas";
export type {
  FeatureId,
  CoreLoopPhase,
  ProgressionMilestoneId,
} from "./schemas";

export { default as AnalyticsExportView } from "./AnalyticsExportView";
