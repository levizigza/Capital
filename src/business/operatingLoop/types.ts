/**
 * Universal operating loop — types & events.
 * Objective: profitable customer value / $ / time / founder attention.
 */

export const LOOP_STAGES = [
  "OBSERVE",
  "LEARN",
  "DECIDE",
  "ACT",
  "MEASURE",
  "REMEMBER",
] as const;

export type LoopStage = (typeof LOOP_STAGES)[number];

/** Business lanes — participants in the loop, not silos. */
export const BUSINESS_LANES = [
  "product",
  "marketing",
  "sales",
  "customer_success",
  "finance",
  "research",
  "operations",
  "ai_workers",
] as const;

export type BusinessLane = (typeof BUSINESS_LANES)[number];

/** Critical path event kinds for the VoC → … → marketing insight chain. */
export const HANDOFF_KINDS = [
  "customer_feedback",
  "voc_evidence",
  "hypothesis",
  "experiment",
  "product_change",
  "cohort_measurement",
  "decision",
  "company_memory",
  "marketing_insight",
] as const;

export type HandoffKind = (typeof HANDOFF_KINDS)[number];

export const HANDOFF_STAGE: Record<HandoffKind, LoopStage> = {
  customer_feedback: "OBSERVE",
  voc_evidence: "LEARN",
  hypothesis: "LEARN",
  experiment: "ACT",
  product_change: "ACT",
  cohort_measurement: "MEASURE",
  decision: "DECIDE",
  company_memory: "REMEMBER",
  marketing_insight: "LEARN",
};

/** Expected next handoff in the critical chain (null = terminal). */
export const CRITICAL_CHAIN: HandoffKind[] = [
  "customer_feedback",
  "voc_evidence",
  "hypothesis",
  "experiment",
  "product_change",
  "cohort_measurement",
  "decision",
  "company_memory",
  "marketing_insight",
];

export type LoopEvent = {
  id: string;
  kind: HandoffKind;
  stage: LoopStage;
  lane: BusinessLane;
  at: string;
  /** Correlation id for one loop pass */
  trace_id: string;
  /** Prior event id in the chain */
  parent_event_id: string | null;
  evidence_refs: string[];
  summary: string;
  payload: Record<string, unknown>;
  /**
   * Estimated profitable customer value contribution of this step (units).
   * null = UNKNOWN — do not invent.
   */
  value_estimate: number | null;
  /** Dollar cost attributed to this step; null = UNKNOWN */
  cost_estimate: number | null;
  /** Founder attention minutes consumed; null = UNKNOWN */
  founder_minutes: number | null;
};

export type HandoffResult = {
  accepted: boolean;
  event: LoopEvent | null;
  reason: string;
};

/**
 * Value objective: value / max(cost,ε) / max(time_hours,ε) / max(founder_hours,ε)
 * Returns null if value unknown.
 */
export type ValueEfficiency = {
  value: number;
  cost: number;
  time_hours: number;
  founder_hours: number;
  /** Higher is better */
  score: number;
  note: string;
};

export type LoopTrace = {
  trace_id: string;
  events: LoopEvent[];
  completed_chain: boolean;
  efficiency: ValueEfficiency | null;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
