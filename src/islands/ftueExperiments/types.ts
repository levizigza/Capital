/**
 * Versioned FTUE experimentation contracts.
 * Design: docs/ftue/FTUE_EXPERIMENTATION.md
 *
 * Never auto-ship winners. Tutorial completion is diagnostic only.
 */

/** Exact FTUE shell version stamped on analytics — bump deliberately with a changelog note. */
export const FTUE_VERSION = "ashore_v1" as const;
export type FtueVersionId = typeof FTUE_VERSION | string;

/** Metrics allowed as experiment primary — tutorial completion excluded. */
export const EXPERIMENT_PRIMARY_METRICS = [
  "independent_transfer_rate",
  "time_to_first_complete_loop",
  "time_to_first_core_loop", // legacy alias
  "time_to_first_decision",
  "failure_recovery_rate",
  "hint_dependency",
  "strategy_diversity",
  "d1_retention",
  "d7_retention",
  "d30_retention",
  "freeplay_conversion",
] as const;

export type ExperimentPrimaryMetricId = (typeof EXPERIMENT_PRIMARY_METRICS)[number];

/** Common guardrails — may also include other FTUE primary metrics. */
export const EXPERIMENT_GUARDRAIL_METRICS = [
  "failure_recovery_rate",
  "d1_retention",
  "d7_retention",
  "hint_dependency",
  "time_to_first_action",
  "guided_success_rate",
  /** Diagnostic only — never primary. */
  "tutorial_completion_rate",
] as const;

export type ExperimentGuardrailMetricId = (typeof EXPERIMENT_GUARDRAIL_METRICS)[number] | string;

export type ExperimentStatus =
  | "draft"
  | "running"
  | "paused"
  | "awaiting_review"
  | "shipped"
  | "rejected"
  | "archived";

export type ObservationPolicy = {
  /** Minimum sessions per arm before interpretation. */
  min_sessions_per_arm: number;
  /** Prefer usability cohorts when learning_problem is comprehension. */
  require_usability_cohort?: boolean;
  /** Max calendar days to run before forced stop/review. */
  max_calendar_days?: number;
};

export type StopCondition = {
  /** Hit observation minimums then pause for review. */
  on_observation_met: "pause_for_review";
  /** Guardrail regression threshold (relative drop, 0–1). */
  guardrail_max_relative_drop?: number;
  /** Same Major/Blocker in usability → stop (see FTUE_USABILITY_PROTOCOL). */
  on_usability_blocker?: "stop_and_fix";
  /** Never auto-ship even if primary wins. */
  auto_ship: false;
};

export type InterpretationRules = {
  /** Primary must improve without violating guardrails. */
  primary_direction: "increase" | "decrease";
  /** Tutorial completion may be inspected but cannot alone justify ship. */
  tutorial_completion: "diagnostic_secondary_only";
  /** Require human review packet before any ship PR. */
  require_human_review: true;
  notes?: string;
};

/**
 * Every FTUE experiment must contain these fields.
 * Incomplete defs fail validateFtueExperiment().
 */
export type FtueExperimentDef = {
  experiment_id: string;
  /** Exact FTUE version this experiment targets. */
  ftue_version: FtueVersionId;
  status: ExperimentStatus;
  hypothesis: string;
  learning_problem: string;
  target_behavior: string;
  control: {
    id: string;
    description: string;
  };
  variant: {
    id: string;
    description: string;
  };
  /** Optional additional arms beyond control/variant. */
  extra_variants?: Array<{ id: string; description: string }>;
  primary_metric: ExperimentPrimaryMetricId;
  guardrail_metrics: ExperimentGuardrailMetricId[];
  minimum_observation_policy: ObservationPolicy;
  stop_condition: StopCondition;
  interpretation_rules: InterpretationRules;
  /** Sticky assignment weight for variant vs control (0–1 = P(variant)). */
  variant_weight?: number;
  owner?: string;
  created_at?: string;
  updated_at?: string;
};

export type HumanReviewGateId =
  | "comprehension"
  | "retention"
  | "player_autonomy"
  | "accessibility"
  | "unintended_behavior"
  | "technical_regressions";

export const HUMAN_REVIEW_GATES: HumanReviewGateId[] = [
  "comprehension",
  "retention",
  "player_autonomy",
  "accessibility",
  "unintended_behavior",
  "technical_regressions",
];

export type HumanReviewGateResult = {
  gate: HumanReviewGateId;
  status: "pass" | "fail" | "needs_followup" | "not_reviewed";
  notes?: string;
  reviewer?: string;
  reviewed_at?: string;
};

export type HumanReviewDecision =
  | "ship_candidate"
  | "iterate"
  | "reject"
  | "inconclusive";

/**
 * Human review packet — required before any ship PR.
 * Passing metrics alone is never enough.
 */
export type FtueExperimentHumanReview = {
  experiment_id: string;
  ftue_version: FtueVersionId;
  /** Control vs variant summary — qualitative + metric snapshots. */
  metric_summary?: string;
  gates: HumanReviewGateResult[];
  decision: HumanReviewDecision;
  /** Explicit acknowledgement that winners are not auto-shipped. */
  acknowledge_no_auto_ship: true;
  reviewer: string;
  reviewed_at: string;
};

export type FtueExperimentAssignment = {
  experiment_id: string;
  variant: string;
  ftue_version: FtueVersionId;
  assigned_at: string;
  source: "sticky" | "query" | "default_control" | "forced";
};
