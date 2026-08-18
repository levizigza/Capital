/**
 * Privacy-conscious learning / FTUE telemetry — event names, segments, metrics.
 * Design: docs/design/LEARNING_TELEMETRY.md · docs/ftue/FTUE_TELEMETRY.md
 *
 * King KPI: independent_transfer_rate.
 * Never treat tutorial_completed as primary success.
 */

export { FTUE_VERSION } from "../../ftueExperiments";

/** Canonical learning events + legacy aliases still accepted by metrics. */
export const FTUE_EVENT_NAMES = [
  "ftue_started",
  "first_control_received",
  "first_meaningful_action",
  "first_meaningful_decision",
  "first_complete_loop",
  "decision_presented",
  "decision_time",
  "decision_selected",
  "decision_changed",
  "decision_committed", // legacy alias of decision_selected
  "consequence_displayed",
  "concept_introduced",
  "concept_practiced",
  "hint_offered",
  "hint_requested",
  "hint_used",
  "failure",
  "recovery",
  "failure_occurred", // legacy
  "retry_started",
  "retry_successful", // legacy alias of recovery
  "ai_intervention",
  "transfer_started",
  "transfer_success",
  "transfer_failure",
  "reflection_started",
  "reflection_completed",
  "guidance_reduced",
  "autonomy_unlocked",
  "tutorial_skipped",
  "tutorial_replayed",
  "freeplay_started",
  "freeplay_entered", // legacy
  "session_end",
  "session_ended", // legacy
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
  experiment_id: string;
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
  "experiment_id",
  "experiment_variant",
  "platform",
  "experience_mode",
  "skip_status",
  "hint_usage",
  "failure_pattern",
  "concept_id",
  "sessionId",
  "elapsedMs",
  "dwellMs",
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
  "fromChoiceId",
  "toChoiceId",
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
  "interventionLevel",
  "skipped",
]);

/**
 * Primary success metrics — tutorial_completion intentionally absent.
 * Order: king KPI first, then the Measure list from LEARNING_TELEMETRY.md.
 */
export const FTUE_PRIMARY_METRICS = [
  "independent_transfer_rate",
  "time_to_first_decision",
  "time_to_first_complete_loop",
  "failure_recovery_rate",
  "hint_dependency",
  "strategy_diversity",
  "d1_retention",
  "d7_retention",
  "d30_retention",
] as const;

export type FtuePrimaryMetricId = (typeof FTUE_PRIMARY_METRICS)[number];

/** Supporting (still computed; not primary ship metrics). */
export const FTUE_SUPPORTING_METRICS = [
  "time_to_first_action",
  "time_to_first_consequence",
  "time_to_first_core_loop", // legacy name → complete_loop
  "guided_success_rate",
  "freeplay_conversion",
] as const;

export type FtueMetricsSnapshot = {
  /** Explicitly secondary — shell finish, not learning success. */
  tutorial_completion_rate: number | null;
  time_to_first_action_ms: number | null;
  time_to_first_decision_ms: number | null;
  time_to_first_consequence_ms: number | null;
  /** @deprecated Prefer time_to_first_complete_loop_ms */
  time_to_first_core_loop_ms: number | null;
  time_to_first_complete_loop_ms: number | null;
  guided_success_rate: number | null;
  independent_transfer_rate: number | null;
  hint_dependency: number | null;
  failure_recovery_rate: number | null;
  strategy_diversity: number | null;
  freeplay_conversion: number | null;
  d1_retention: number | null;
  d7_retention: number | null;
  d30_retention: number | null;
  sessions: number;
  ftue_starts: number;
};
