/**
 * AI Cost Governor — types.
 */

export type ModelTier = "low_cost" | "mid_tier" | "high_capability";

export type TaskComplexity = "low" | "moderate" | "strategic" | "high";

export type FallbackBehavior =
  | "abort"
  | "escalate_human"
  | "switch_to_fallback_model"
  | "return_partial";

export type ModelRouteTable = Record<TaskComplexity, ModelTier>;

export const DEFAULT_ROUTE_TABLE: ModelRouteTable = {
  low: "low_cost",
  moderate: "mid_tier",
  strategic: "high_capability",
  high: "high_capability",
};

export type ModelCatalogEntry = {
  model_id: string;
  tier: ModelTier;
  /** USD per 1K tokens (blended) — UNKNOWN allowed as null */
  usd_per_1k_tokens: number | null;
};

export type WorkflowBudget = {
  workflow_id: string;
  /** Default assigned model */
  model: string;
  maximum_tokens: number;
  maximum_steps: number;
  maximum_tool_calls: number;
  maximum_retries: number;
  /** Wall clock ms */
  maximum_runtime: number;
  maximum_dollar_cost: number;
  fallback_behavior: FallbackBehavior;
  /** Optional explicit fallback model when switch_to_fallback_model */
  fallback_model?: string | null;
};

export type RunUsage = {
  tokens: number;
  steps: number;
  tool_calls: number;
  retries: number;
  runtime_ms: number;
  dollar_cost: number;
};

export type LimitBreach = {
  limit:
    | "maximum_tokens"
    | "maximum_steps"
    | "maximum_tool_calls"
    | "maximum_retries"
    | "maximum_runtime"
    | "maximum_dollar_cost";
  used: number;
  maximum: number;
};

export type GovernedRunRecord = {
  id: string;
  workflow_id: string;
  task_id: string;
  complexity: TaskComplexity;
  routed_tier: ModelTier;
  model_used: string;
  usage: RunUsage;
  success: boolean;
  /** Attributed economic value; null = UNKNOWN */
  business_value: number | null;
  breaches: LimitBreach[];
  fallback_applied: FallbackBehavior | null;
  at: string;
};

/** Eval evidence required before allowing a model downgrade. */
export type EvalGate = {
  eval_suite_id: string;
  model_under_test: string;
  /** Proposed cheaper model */
  candidate_model: string;
  pass_rate: number;
  /** Minimum pass rate required to approve downgrade */
  min_pass_rate: number;
  sample_size: number;
  measured_at: string;
  evidence_refs: string[];
};

export type DowngradeDecision = {
  allowed: boolean;
  workflow_id: string;
  from_model: string;
  to_model: string;
  reason: string;
  eval_gate: EvalGate | null;
  at: string;
};

export type WorkflowCostStats = {
  workflow_id: string;
  tasks: number;
  cost_per_task: number;
  business_value_per_task: number | null;
  /** cost / max(success_rate, eps) */
  failure_adjusted_cost: number;
  tokens_per_task: number;
  success_rate: number;
  by_model: ModelComparisonRow[];
};

export type ModelComparisonRow = {
  model: string;
  tasks: number;
  cost_per_task: number;
  tokens_per_task: number;
  success_rate: number;
  business_value_per_task: number | null;
};

export type CostValueFlag = {
  id: string;
  workflow_id: string;
  kind: "cost_grows_faster_than_value";
  evidence: string[];
  cost_slope: number;
  value_slope: number;
  cost_value_ratio: number | null;
  at: string;
};

export type CostGovernorSnapshot = {
  schema_version: "1";
  policy: "eval_gate_before_model_downgrade";
  budgets: WorkflowBudget[];
  catalog: ModelCatalogEntry[];
  route_table: ModelRouteTable;
  runs: GovernedRunRecord[];
  downgrades: DowngradeDecision[];
  flags: CostValueFlag[];
  updated_at: string;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
