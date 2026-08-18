/**
 * Privacy-conscious FTUE telemetry — event names, segments, and payload contracts.
 * Design: docs/ftue/FTUE_TELEMETRY.md
 *
 * Primary success metrics are comprehension & autonomy (transfer, freeplay, recovery) —
 * never tutorial_completed alone.
 */

export const FTUE_VERSION = "ashore_v1" as const;

export const FTUE_EVENT_NAMES = [
  "ftue_started",
  "first_control_received",
  "first_meaningful_action",
  "decision_presented",
  "decision_committed",
  "consequence_displayed",
  "concept_introduced",
  "concept_practiced",
  "hint_offered",
  "hint_requested",
  "hint_used",
  "failure_occurred",
  "retry_started",
  "retry_successful",
  "transfer_started",
  "transfer_success",
  "transfer_failure",
  "guidance_reduced",
  "autonomy_unlocked",
  "tutorial_skipped",
  "tutorial_replayed",
  "freeplay_entered",
  "session_ended",
  "return_session",
] as const;

export type FtueEventName = (typeof FTUE_EVENT_NAMES)[number];

export type ExperienceModeSegment = "new" | "experienced" | "returning";
export type SkipStatusSegment = "none" | "teach_skipped" | "ftue_boot_skipped";
export type HintUsageSegment = "none" | "low" | "high";
export type FailurePatternSegment = "none" | "single" | "repeated";
export type PlatformSegment = "web" | "mobile_web" | "qa";

/** Attached to every FTUE event (after privacy sanitize). */
export type FtueSegmentContext = {
  ftue_version: string;
  experiment_variant: string;
  platform: PlatformSegment;
  experience_mode: ExperienceModeSegment;
  skip_status: SkipStatusSegment;
  hint_usage: HintUsageSegment;
  failure_pattern: FailurePatternSegment;
  concept_id?: string;
};

/** Allowlisted payload keys — anything else is stripped. */
export const FTUE_PAYLOAD_ALLOWLIST = new Set([
  "ftue_version",
  "experiment_variant",
  "platform",
  "experience_mode",
  "skip_status",
  "hint_usage",
  "failure_pattern",
  "concept_id",
  "sessionId",
  "elapsedMs",
  "screen",
  "source",
  "reason",
  "kind",
  "phase",
  "questId",
  "minigameId",
  "islandId",
  "organId",
  "scenarioId",
  "choiceId",
  "graphId",
  "nodeId",
  "npcId",
  "beat",
  "step",
  "action",
  "hintsUsed",
  "attempts",
  "success",
  "via",
  "surface",
  "mode",
  "gateId",
  "failureKind",
  "assistTier",
  "transferAttempts",
  "guidedSuccess",
  "replay",
  "daysSinceLast",
]);

/** Metric ids — tutorial_completed is intentionally absent as a primary KPI. */
export const FTUE_PRIMARY_METRICS = [
  "time_to_first_action",
  "time_to_first_decision",
  "time_to_first_consequence",
  "time_to_first_core_loop",
  "guided_success_rate",
  "independent_transfer_rate",
  "hint_dependency",
  "failure_recovery_rate",
  "freeplay_conversion",
  "d1_retention",
  "d7_retention",
  "d30_retention",
] as const;

export type FtuePrimaryMetricId = (typeof FTUE_PRIMARY_METRICS)[number];

export type FtueMetricsSnapshot = {
  /** Explicitly secondary — shell finish, not learning success. */
  tutorial_completion_rate: number | null;
  time_to_first_action_ms: number | null;
  time_to_first_decision_ms: number | null;
  time_to_first_consequence_ms: number | null;
  time_to_first_core_loop_ms: number | null;
  guided_success_rate: number | null;
  independent_transfer_rate: number | null;
  hint_dependency: number | null;
  failure_recovery_rate: number | null;
  freeplay_conversion: number | null;
  d1_retention: number | null;
  d7_retention: number | null;
  d30_retention: number | null;
  sessions: number;
  ftue_starts: number;
};
