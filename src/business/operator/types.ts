/**
 * Capital Operator — typed contracts.
 * Executive coordination only; not an autonomous CEO.
 */

/** Domains the Operator must never alter without an ApprovalEvent. */
export type ProtectedDomain =
  | "company_mission"
  | "pricing_strategy"
  | "production_financial_transactions"
  | "legal_commitments"
  | "customer_privacy_policy"
  | "production_deployments"
  | "high_impact_public_communications"
  | "irreversible_strategic_decisions";

export const PROTECTED_DOMAINS: ProtectedDomain[] = [
  "company_mission",
  "pricing_strategy",
  "production_financial_transactions",
  "legal_commitments",
  "customer_privacy_policy",
  "production_deployments",
  "high_impact_public_communications",
  "irreversible_strategic_decisions",
];

export type TaskClass =
  | "observe_only"
  | "retrieve_and_summarize"
  | "run_deterministic_workflow"
  | "request_ai_reasoning"
  | "propose_protected_change"
  | "operational_metrics"
  | "unknown";

export type ExecutionMode = "deterministic" | "ai_reasoning" | "none";

export type OperatorPhase =
  | "observe"
  | "retrieve_context"
  | "classify"
  | "determine_mode"
  | "delegate"
  | "collect"
  | "evaluate_confidence"
  | "determine_approval"
  | "execute"
  | "record_outcome"
  | "update_metrics"
  | "preserve_memory"
  | "complete";

export type PhaseStatus = "started" | "ok" | "skipped" | "blocked" | "error";

export type OperatorStatus =
  | "completed"
  | "completed_with_proposals"
  | "blocked_pending_approval"
  | "failed"
  | "rejected";

/** Human (or designated) approval for a protected action. */
export type ApprovalEvent = {
  id: string;
  /** Must match a ProtectedDomain or action id */
  domain: ProtectedDomain;
  action_id: string;
  approver: string;
  approved_at: string;
  note: string;
};

export type ProposedAction = {
  id: string;
  kind: string;
  summary: string;
  /** If set, execution requires matching ApprovalEvent */
  protected_domain: ProtectedDomain | null;
  payload: Record<string, unknown>;
};

export type ExecutedAction = {
  action_id: string;
  kind: string;
  at: string;
  result_summary: string;
};

export type BlockedAction = {
  action_id: string;
  kind: string;
  /** Set when blocked for a protected-domain approval gap; null for confidence/other gates */
  protected_domain: ProtectedDomain | null;
  reason: string;
};

export type ContextSnippet = {
  ref: string;
  title: string;
  body: string;
  storage_hint?: string;
};

export type OperatorObservation = {
  /** Free-text or structured signal the Operator is reacting to */
  signal: string;
  /** Optional structured tags from upstream systems */
  tags?: string[];
  /** Explicit domains the request touches (helps classification) */
  touches?: ProtectedDomain[];
  /** Caller-supplied context refs */
  context_refs?: string[];
};

export type OperatorRequest = {
  id: string;
  observed_at: string;
  actor: string;
  observation: OperatorObservation;
  /** Pre-attached approvals for this run */
  approvals?: ApprovalEvent[];
  /** Force mode (tests / admin override); normally inferred */
  force_mode?: ExecutionMode | null;
};

export type PhaseLog = {
  phase: OperatorPhase;
  status: PhaseStatus;
  at: string;
  detail?: string;
  data?: Record<string, unknown>;
};

export type ConfidenceReport = {
  score: number; // 0..1
  rationale: string;
  /** Below this threshold → do not auto-execute even non-protected actions */
  auto_execute_floor: number;
};

export type Classification = {
  task_class: TaskClass;
  mode: ExecutionMode;
  rationale: string;
  touched_domains: ProtectedDomain[];
};

export type DelegateResult = {
  handler: string;
  summary: string;
  proposed_actions: ProposedAction[];
  artifacts?: Record<string, unknown>;
};

export type OperatorResult = {
  request_id: string;
  status: OperatorStatus;
  classification: Classification;
  confidence: ConfidenceReport;
  context_used: ContextSnippet[];
  proposed_actions: ProposedAction[];
  executed_actions: ExecutedAction[];
  blocked_actions: BlockedAction[];
  metrics_recorded: string[];
  memory_refs: string[];
  audit_id: string;
  summary: string;
};

/** Append-only auditable execution state for one Operator run. */
export type ExecutionRecord = {
  schema_version: "1";
  audit_id: string;
  request: OperatorRequest;
  phases: PhaseLog[];
  result: OperatorResult | null;
  created_at: string;
  updated_at: string;
};

export type TaskHandlerInput = {
  request: OperatorRequest;
  classification: Classification;
  context: ContextSnippet[];
};

export type TaskHandler = {
  name: string;
  supports: (classification: Classification) => boolean;
  run: (input: TaskHandlerInput) => Promise<DelegateResult> | DelegateResult;
};

export type ContextPort = {
  retrieve: (observation: OperatorObservation) => Promise<ContextSnippet[]> | ContextSnippet[];
};

export type MemoryPort = {
  /**
   * Preserve Operator outcome. Implementations must NOT write canonical truth.
   * Prefer agent_run_history / temporary_working_context.
   */
  preserve: (input: {
    run_id: string;
    title: string;
    body: string;
    from_agent: boolean;
  }) => Promise<string> | string; // returns memory ref id
};

export type MetricsPort = {
  record: (input: {
    name: string;
    value: number;
    tags?: Record<string, string>;
  }) => Promise<void> | void;
};
