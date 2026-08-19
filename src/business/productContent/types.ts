/**
 * Product-to-Content Engine — types.
 * Assets must originate from product/customer insights (no generic filler).
 */

export const INSIGHT_KINDS = [
  "new_simulation",
  "financial_scenario",
  "customer_question",
  "customer_pain_point",
  "experiment",
  "product_discovery",
  "educational_module",
  "anonymized_behavior_pattern",
  "founder_insight",
] as const;

export type InsightKind = (typeof INSIGHT_KINDS)[number];

export const ASSET_KINDS = [
  "short_form_video",
  "long_form_video",
  "article",
  "email_lesson",
  "social_post",
  "interactive_quiz",
  "lead_magnet",
  "shareable_financial_scenario",
] as const;

export type AssetKind = (typeof ASSET_KINDS)[number];

export type InsightStatus = "captured" | "approved_for_content" | "retired";

export type ProductInsight = {
  id: string;
  kind: InsightKind;
  title: string;
  /** What we learned — must be concrete */
  summary: string;
  /** Evidence / URI / ticket / experiment id — required */
  evidence_refs: string[];
  /** Optional anonymized notes (no PII) */
  anonymized_detail?: string;
  /** Tags for routing into asset templates */
  themes: string[];
  status: InsightStatus;
  captured_at: string;
  source_system?: string;
};

export type ContentAssetStatus =
  | "candidate"
  | "drafted"
  | "published"
  | "paused"
  | "retired";

/**
 * Marketing asset candidate. Must reference originating insight(s).
 */
export type ContentAsset = {
  id: string;
  kind: AssetKind;
  title: string;
  /** Concept / outline — not final published copy unless drafted */
  concept: string;
  /** Hook derived from the insight */
  hook: string;
  /** Required: originating product/customer insight ids */
  originating_insight_ids: string[];
  /** Human-readable lineage blurb */
  insight_lineage: string;
  status: ContentAssetStatus;
  acquisition_source: string;
  created_at: string;
  updated_at: string;
  /** Generator id (workflow/agent) — output stays non-canonical */
  generated_by: string;
};

/** Cumulative funnel counters for an asset or acquisition source. */
export type FunnelMetrics = {
  impressions: number;
  engagement: number;
  clicks: number;
  qualified_traffic: number;
  signup: number;
  activation: number;
  paid_conversion: number;
};

export type AcquisitionSourceMetrics = FunnelMetrics & {
  acquisition_source: string;
  /** Total acquisition spend attributed to this source */
  spend: number;
  /** CAC = spend / paid_conversion when paid_conversion > 0; else null */
  cac: number | null;
  /** Retention rate 0..1 for customers from this source; null if unknown */
  retention_rate: number | null;
  /** Quality score — favors downstream quality over views */
  quality_score: number;
};

export type AssetPerformance = FunnelMetrics & {
  asset_id: string;
  acquisition_source: string;
  spend: number;
  cac: number | null;
  retention_rate: number | null;
  quality_score: number;
  updated_at: string;
};

export type ProductContentSnapshot = {
  schema_version: "1";
  policy: "insight_backed_content_only";
  insights: ProductInsight[];
  assets: ContentAsset[];
  performance: AssetPerformance[];
  updated_at: string;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};

/** Weights for quality_score (sum need not be 1 — normalized in scorer). */
export const QUALITY_WEIGHTS = {
  impressions: 0.02,
  engagement: 0.05,
  clicks: 0.08,
  qualified_traffic: 0.12,
  signup: 0.15,
  activation: 0.22,
  paid_conversion: 0.2,
  retention: 0.16,
} as const;
