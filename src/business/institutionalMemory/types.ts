/**
 * Institutional memory — types & storage classes.
 * AI output never auto-becomes canonical truth.
 */

/** Distinct storage classes — do not mix freely. */
export type StorageClass =
  | "canonical"
  | "customer_evidence"
  | "experiments"
  | "decisions"
  | "operational_state"
  | "metrics"
  | "agent_run_history"
  | "temporary_working_context";

export const STORAGE_CLASSES: StorageClass[] = [
  "canonical",
  "customer_evidence",
  "experiments",
  "decisions",
  "operational_state",
  "metrics",
  "agent_run_history",
  "temporary_working_context",
];

/** Classes agents may write without promotion. */
export const AGENT_WRITABLE_CLASSES: StorageClass[] = [
  "agent_run_history",
  "temporary_working_context",
];

export type PromotionStage =
  | "observation"
  | "evidence"
  | "hypothesis"
  | "tested_finding"
  | "approved_decision"
  | "canonical_policy";

export const PROMOTION_LADDER: PromotionStage[] = [
  "observation",
  "evidence",
  "hypothesis",
  "tested_finding",
  "approved_decision",
  "canonical_policy",
];

export type MemoryRef = {
  /** URI, path, ticket id, or memory record id */
  ref: string;
  note?: string;
};

export type MemoryVersion = {
  version: number;
  body: string;
  stage: PromotionStage | null;
  written_at: string;
  writer: string;
  /** Why this version exists */
  change_note: string;
  evidence_refs: MemoryRef[];
  source_refs: MemoryRef[];
};

export type MemoryRecord = {
  id: string;
  storage_class: StorageClass;
  title: string;
  body: string;
  /** Current promotion stage (null for pure ops/metrics blobs) */
  stage: PromotionStage | null;
  /** True only if body originated from an agent/AI run */
  from_agent: boolean;
  evidence_refs: MemoryRef[];
  source_refs: MemoryRef[];
  created_at: string;
  updated_at: string;
  /** TTL for temporary_working_context (ISO); null = no expiry */
  expires_at: string | null;
  versions: MemoryVersion[];
  /** Soft-deleted / superseded */
  active: boolean;
};

export type MemoryWriteRequest = {
  id: string;
  storage_class: StorageClass;
  title: string;
  body: string;
  writer: string;
  /** Must be true when writer is an agent/AI */
  from_agent: boolean;
  evidence_refs?: MemoryRef[];
  source_refs?: MemoryRef[];
  expires_at?: string | null;
  change_note?: string;
  stage?: PromotionStage | null;
};

export type PromotionRequest = {
  record_id: string;
  /** Next stage — must be exactly ladder+1 */
  to_stage: PromotionStage;
  writer: string;
  /** Required for approved_decision and canonical_policy */
  approver?: string | null;
  evidence_refs: MemoryRef[];
  source_refs: MemoryRef[];
  change_note: string;
  /** Optional body edit at promotion time */
  body?: string;
  title?: string;
};

export type MemoryValidationIssue = {
  field: string;
  code: string;
  message: string;
};

export type InstitutionalMemoryStore = {
  schema_version: "1";
  records: MemoryRecord[];
};
