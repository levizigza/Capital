/**
 * Retention & CS monitoring — types.
 */

export const COHORT_METRICS = [
  "activation",
  "day_1",
  "day_7",
  "day_30",
  "month_2_plus",
  "paid_retention",
  "feature_adoption",
  "session_frequency",
  "learning_progression",
  "cancellations",
  "re_activation",
] as const;

export type CohortMetric = (typeof COHORT_METRICS)[number];

/** Metrics where higher is better (cancellations inverted). */
export const HIGHER_IS_BETTER: Record<CohortMetric, boolean> = {
  activation: true,
  day_1: true,
  day_7: true,
  day_30: true,
  month_2_plus: true,
  paid_retention: true,
  feature_adoption: true,
  session_frequency: true,
  learning_progression: true,
  cancellations: false,
  re_activation: true,
};

export type CustomerType = "parent" | "educator" | "family" | "unknown";

export type CohortDimensions = {
  cohort_id: string;
  acquisition_source: string;
  product_version: string;
  customer_type: CustomerType;
  onboarding_path: string;
};

export type UsageBehaviorSummary = {
  median_sessions_7d: number;
  feature_flags_used: string[];
  last_island?: string;
  stalled_at_step?: string | null;
};

export type SupportHistorySummary = {
  tickets_30d: number;
  top_themes: string[];
  csat?: number | null;
};

/**
 * One cohort slice observation for a metric.
 * Rates are 0..1 except session_frequency (absolute avg sessions).
 */
export type CohortObservation = {
  id: string;
  metric: CohortMetric;
  dimensions: CohortDimensions;
  /** Primary value — rate 0..1 or frequency count */
  value: number;
  sample_size: number;
  observed_at: string;
  usage?: UsageBehaviorSummary;
  support?: SupportHistorySummary;
};

export type AnomalyKind = "drop" | "spike" | "stagnation";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export type RetentionAnomaly = {
  id: string;
  metric: CohortMetric;
  kind: AnomalyKind;
  severity: AnomalySeverity;
  dimensions: CohortDimensions;
  current_value: number;
  baseline_value: number;
  delta: number;
  sample_size: number;
  detected_at: string;
  evidence: string[];
};

export type HypothesisDimension =
  | "cohort"
  | "acquisition_source"
  | "product_version"
  | "customer_type"
  | "onboarding_path"
  | "usage_behavior"
  | "support_history";

export type RootCauseHypothesis = {
  id: string;
  anomaly_id: string;
  dimension: HypothesisDimension;
  statement: string;
  evidence: string[];
  confidence: number; // 0..1
};

export type RecommendationKind =
  | "diagnose"
  | "investigate"
  | "product_fix"
  | "onboarding_fix"
  | "support_intervention"
  | "reactivation_campaign"
  | "acquisition";

export type RetentionRecommendation = {
  id: string;
  kind: RecommendationKind;
  title: string;
  rationale: string;
  evidence: string[];
  confidence: number;
  /** Related anomaly ids */
  anomaly_ids: string[];
  /** Related hypothesis ids */
  hypothesis_ids: string[];
  /** True if blocked by diagnosis-first policy */
  blocked: boolean;
  block_reason?: string;
};

export type DiagnosisReport = {
  id: string;
  created_at: string;
  anomalies: RetentionAnomaly[];
  hypotheses: RootCauseHypothesis[];
  recommendations: RetentionRecommendation[];
  /** Hard policy flag */
  paid_acquisition_deferred: boolean;
};

export type RetentionCsSnapshot = {
  schema_version: "1";
  policy: "diagnose_before_paid_acquisition";
  observations: CohortObservation[];
  anomalies: RetentionAnomaly[];
  reports: DiagnosisReport[];
  updated_at: string;
};

export type AnomalyThresholds = {
  /** Relative drop vs baseline that triggers (e.g. 0.15 = 15%) */
  drop_relative: number;
  /** Absolute drop in rate points */
  drop_absolute: number;
  /** For cancellations — relative spike */
  spike_relative: number;
  /** Min sample size to flag */
  min_sample: number;
};

export const DEFAULT_THRESHOLDS: AnomalyThresholds = {
  drop_relative: 0.12,
  drop_absolute: 0.05,
  spike_relative: 0.2,
  min_sample: 20,
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
