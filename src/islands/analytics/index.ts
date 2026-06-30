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

export { default as AnalyticsExportView } from "./AnalyticsExportView";
