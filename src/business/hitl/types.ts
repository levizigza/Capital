/**
 * Human-in-the-Loop approval — typed contracts.
 */

export const RISK_DIMENSIONS = [
  "financial_impact",
  "reversibility",
  "customer_impact",
  "legal_sensitivity",
  "security_sensitivity",
  "brand_impact",
  "data_sensitivity",
  "strategic_impact",
] as const;

export type RiskDimension = (typeof RISK_DIMENSIONS)[number];

/** 0 = none … 4 = severe */
export type RiskScore = 0 | 1 | 2 | 3 | 4;

export type RiskProfile = Record<RiskDimension, RiskScore>;

export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const RISK_TIERS: RiskTier[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export type PolicyThresholds = {
  /** Max financial_impact score allowed for MEDIUM auto-path */
  max_financial_impact: RiskScore;
  /** Max customer_impact score allowed for MEDIUM auto-path */
  max_customer_impact: RiskScore;
  /** Max brand_impact score allowed for MEDIUM auto-path */
  max_brand_impact: RiskScore;
  /** Max weighted sum allowed for MEDIUM auto-path */
  max_weighted_sum: number;
  /** Max expected_cost (numeric, same units as request) for MEDIUM auto-path */
  max_expected_cost: number;
};

export const DEFAULT_POLICY_THRESHOLDS: PolicyThresholds = {
  max_financial_impact: 2,
  max_customer_impact: 2,
  max_brand_impact: 2,
  max_weighted_sum: 12,
  max_expected_cost: 500,
};

/** Evidence refs — at least one required on requests. */
export type EvidenceItem = {
  ref: string;
  note?: string;
};

/**
 * Every approval request must include these fields.
 */
export type ApprovalRequest = {
  id: string;
  created_at: string;
  /** recommended_action */
  recommended_action: string;
  reason: string;
  evidence: EvidenceItem[];
  expected_upside: string;
  /** Numeric cost estimate used for MEDIUM policy checks */
  expected_cost: number;
  /** Narrative cost (optional detail) */
  expected_cost_note?: string;
  /** 0..1 */
  confidence: number;
  /** Narrative reversibility (required); profile.reversibility is the score */
  reversibility: string;
  worst_case: string;
  alternative_action: string;
  /** agent/workflow responsible */
  responsible: string;
  risk: RiskProfile;
  /** Optional policy override snapshot for this request */
  policy_thresholds?: PolicyThresholds;
};

export type ApprovalGate =
  | "auto_execute"
  | "policy_threshold"
  | "founder_approval"
  | "founder_plus_second_confirmation";

export type TierAssessment = {
  tier: RiskTier;
  gate: ApprovalGate;
  weighted_sum: number;
  max_dimension: RiskDimension;
  max_score: RiskScore;
  rationale: string;
};

export type ApprovalStatus =
  | "pending"
  | "auto_approved"
  | "policy_approved"
  | "approved"
  | "rejected"
  | "executed"
  | "blocked";

export type ConfirmationStep = {
  confirmer: string;
  confirmed_at: string;
  note: string;
};

export type ApprovalDecision = {
  id: string;
  request_id: string;
  at: string;
  actor: string;
  /** approve | reject | auto | policy | second_confirm | execute */
  kind:
    | "auto_approve"
    | "policy_approve"
    | "founder_approve"
    | "second_confirm"
    | "reject"
    | "execute"
    | "block";
  note: string;
  tier: RiskTier;
  gate: ApprovalGate;
};

export type ApprovalCase = {
  request: ApprovalRequest;
  assessment: TierAssessment;
  status: ApprovalStatus;
  founder_approval: ConfirmationStep | null;
  second_confirmation: ConfirmationStep | null;
  decisions: ApprovalDecision[];
  updated_at: string;
};

export type ApprovalDecisionLog = {
  schema_version: "1";
  cases: ApprovalCase[];
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
