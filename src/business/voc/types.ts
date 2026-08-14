/**
 * Voice-of-Customer — types.
 * Law: do not invent sentiment or customer facts. Every extract links to evidence.
 */

export type VocSourceType =
  | "interview"
  | "support"
  | "review"
  | "survey"
  | "sales_objection"
  | "feature_request"
  | "cancellation"
  | "forum";

/** What an annotation is allowed to claim — never auto-sentiment. */
export type VocExtractKind =
  | "pain_point"
  | "desired_outcome"
  | "objection"
  | "alternative_used"
  | "switching_trigger"
  | "delight"
  | "retention_driver"
  | "churn_driver"
  | "customer_language"
  | "feature_request"
  | "pricing_signal"
  | "retention_signal";

/**
 * Original evidence record. Prefer evidence_uri pointing at the source of truth.
 * raw_text may be stored for quote verification; still must cite URI when available.
 */
export type VocEvidence = {
  id: string;
  source_type: VocSourceType;
  /** Link or path to original (URL, ticket id, file path, Notion URI, etc.) */
  evidence_uri: string;
  captured_at: string;
  /** Optional body for quote verification — not a substitute for evidence_uri */
  raw_text: string | null;
  customer_segment: string | null;
  /** Optional human notes — not treated as customer speech */
  ingest_notes: string | null;
};

/**
 * Human- or rule-verified extract. quote MUST appear in evidence.raw_text when raw_text present.
 * severity only if human-supplied (severity_source === "human").
 */
export type VocAnnotation = {
  id: string;
  evidence_id: string;
  kind: VocExtractKind;
  /** Normalized label for aggregation (human-chosen); not invented sentiment */
  label: string;
  /** Verbatim customer language */
  quote: string;
  severity: 1 | 2 | 3 | 4 | 5 | null;
  severity_source: "human" | null;
  created_at: string;
};

export type VocValidationIssue = {
  field: string;
  code: string;
  message: string;
};

export type VocStore = {
  schema_version: "1";
  evidence: VocEvidence[];
  annotations: VocAnnotation[];
};

export type VocThemeStat = {
  kind: VocExtractKind;
  label: string;
  frequency: number;
  /** Max human severity seen; null if none provided — never invented */
  max_severity: number | null;
  evidence_ids: string[];
  evidence_uris: string[];
  sample_quotes: string[];
};

export type VocConfidenceLevel = "none" | "low" | "medium" | "high";

export type CustomerTruthReport = {
  schema_version: "1";
  /** Canonical rank 6 — temporary observation / evidence rollup; not FACT */
  canonical_rank: 6;
  claim_status: "observation";
  auto_promoted_to_fact: false;
  week_id: string;
  generated_at: string;
  evidence_count: number;
  annotation_count: number;
  confidence: VocConfidenceLevel;
  most_common_pain: VocThemeStat | null;
  fastest_growing_pain: {
    label: string;
    prior_frequency: number;
    current_frequency: number;
    delta: number;
    evidence_uris: string[];
  } | null;
  new_objections: VocThemeStat[];
  strongest_customer_language: { quote: string; evidence_id: string; evidence_uri: string }[];
  contradictions: { summary: string; evidence_uris: string[] }[];
  product_opportunities: VocThemeStat[];
  pricing_evidence: VocThemeStat[];
  retention_evidence: VocThemeStat[];
  /** Explicit empty-state honesty */
  unknowns: string[];
};
