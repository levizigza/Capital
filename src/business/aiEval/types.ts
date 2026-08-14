/**
 * AI worker evaluation framework — types.
 */

export const EVAL_METRICS = [
  "task_completion_rate",
  "accuracy",
  "human_correction_rate",
  "hallucination_rate",
  "tool_failure_rate",
  "retry_rate",
  "average_latency",
  "tokens_per_task",
  "cost_per_task",
  "escalation_rate",
  "business_value_created",
] as const;

export type EvalMetricName = (typeof EVAL_METRICS)[number];

export type TaskResultStatus =
  | "success"
  | "partial"
  | "failed"
  | "stopped"
  | "escalated";

export type ToolCallRecord = {
  tool: string;
  ok: boolean;
  at: string;
  detail?: string;
  latency_ms?: number;
};

export type ActionRecord = {
  kind: string;
  at: string;
  detail: string;
};

export type ApprovalRecord = {
  id: string;
  approver: string;
  at: string;
  note: string;
};

export type CostRecord = {
  tokens_in: number;
  tokens_out: number;
  /** USD or accounting unit */
  cost: number;
  currency: string;
};

/**
 * Full audit trail for one task attempt (including retries as child attempts).
 */
export type TaskAuditTrail = {
  schema_version: "1";
  run_id: string;
  worker_id: string;
  task_id: string;
  attempt: number;
  started_at: string;
  finished_at: string | null;
  input: unknown;
  context_references: string[];
  tools_used: ToolCallRecord[];
  actions_taken: ActionRecord[];
  outputs: unknown;
  approvals: ApprovalRecord[];
  cost: CostRecord;
  result: TaskResultStatus;
  /** Human correction applied after the fact */
  human_corrected?: boolean;
  /** Flagged hallucination */
  hallucination_flagged?: boolean;
  /** Accuracy label 0..1 when known */
  accuracy?: number | null;
  /** Attributed business value for this task; null = UNKNOWN */
  business_value?: number | null;
  error_message?: string | null;
  latency_ms?: number | null;
};

export type FailureThresholds = {
  /** Hard cap — never indefinite loops */
  max_retries: number;
  max_consecutive_errors: number;
  max_hallucination_rate: number;
  max_tool_failure_rate: number;
  max_cost_per_task: number;
  max_latency_ms: number;
  max_escalation_rate?: number;
  /** Rolling window size for rate metrics */
  rolling_window: number;
};

export const DEFAULT_FAILURE_THRESHOLDS: FailureThresholds = {
  max_retries: 2,
  max_consecutive_errors: 3,
  max_hallucination_rate: 0.15,
  max_tool_failure_rate: 0.25,
  max_cost_per_task: 2,
  max_latency_ms: 120_000,
  max_escalation_rate: 0.4,
  rolling_window: 50,
};

export type WorkerEvalConfig = {
  worker_id: string;
  escalation_target: string;
  thresholds: FailureThresholds;
};

export type WorkerMetricSnapshot = {
  worker_id: string;
  window_size: number;
  task_completion_rate: number;
  accuracy: number | null;
  human_correction_rate: number;
  hallucination_rate: number;
  tool_failure_rate: number;
  retry_rate: number;
  average_latency: number | null;
  tokens_per_task: number | null;
  cost_per_task: number | null;
  escalation_rate: number;
  business_value_created: number;
  computed_at: string;
};

export type EscalationRecord = {
  id: string;
  worker_id: string;
  task_id: string;
  run_id: string;
  reason: string;
  escalation_target: string;
  preserved_state_ref: string;
  failure_doc_id: string;
  at: string;
};

export type FailureDocument = {
  id: string;
  worker_id: string;
  task_id: string;
  run_id: string;
  reason: string;
  attempts: number;
  consecutive_errors: number;
  thresholds: FailureThresholds;
  audit_run_ids: string[];
  created_at: string;
};

/** Frozen state when STOP fires */
export type PreservedWorkerState = {
  id: string;
  worker_id: string;
  task_id: string;
  frozen_at: string;
  last_audit: TaskAuditTrail;
  working_memory: Record<string, unknown>;
};

export type EvalFrameworkSnapshot = {
  schema_version: "1";
  policy: "no_indefinite_retry_stop_preserve_escalate";
  configs: WorkerEvalConfig[];
  audits: TaskAuditTrail[];
  escalations: EscalationRecord[];
  failures: FailureDocument[];
  preserved: PreservedWorkerState[];
  updated_at: string;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
