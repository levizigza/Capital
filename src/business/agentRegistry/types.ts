/**
 * Capital Agent Registry — schema for potential agents.
 * Do NOT instantiate agents merely to fill capability roles.
 */

/** Catalog of possible capabilities — not a workforce roster. */
export const POSSIBLE_CAPABILITIES = [
  "customer_research",
  "market_research",
  "marketing",
  "sales",
  "support",
  "product_analysis",
  "finance_analysis",
  "qa",
  "competitive_intelligence",
] as const;

export type PossibleCapability = (typeof POSSIBLE_CAPABILITIES)[number];

export type AgentStatus = "draft" | "proposed" | "active" | "paused" | "retired";

export const AGENT_STATUSES: AgentStatus[] = [
  "draft",
  "proposed",
  "active",
  "paused",
  "retired",
];

export type AgentPermission =
  | "read_context"
  | "write_temp_memory"
  | "write_agent_run_history"
  | "propose_action"
  | "call_tools"
  | "request_approval"
  /** Never grant without HITL — listed for deny-by-default clarity */
  | "execute_protected_action";

export type AgentBudget = {
  /** Max USD (or unit) per run; null = UNKNOWN / unset */
  max_cost_per_run: number | null;
  /** Max USD per day */
  max_cost_per_day: number | null;
  max_tokens_per_run: number | null;
  max_runs_per_day: number | null;
};

export type AgentKpi = {
  id: string;
  description: string;
  /** How the KPI is measured */
  measurement: string;
  /** Target value narrative or number-as-string; UNKNOWN allowed */
  target: string;
};

export type EvalSuite = {
  id: string;
  description: string;
  /** Paths, case ids, or harness names */
  cases: string[];
  /** Minimum pass rate 0..1 to ship/keep active */
  min_pass_rate: number;
};

export type FailureThreshold = {
  /** Consecutive failures before pause/escalate */
  max_consecutive_failures: number;
  /** Pass rate below this → fail closed */
  min_rolling_pass_rate: number;
  /** Window size for rolling pass rate (runs) */
  rolling_window: number;
};

export type ApprovalRequirements = {
  /** Requires HITL before any side effect */
  require_hitl_before_side_effects: boolean;
  /** Minimum risk tier label if integrated with HITL (optional) */
  min_risk_tier?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  /** Human roles that may approve */
  approver_roles: string[];
  notes?: string;
};

export type BusinessValue = {
  narrative: string;
  /** Optional numeric estimate; null = UNKNOWN — do not invent */
  estimated_monthly_value: number | null;
  currency?: string;
};

/**
 * Required justification to instantiate (register toward active use).
 * Role-filling without a measurable workflow is rejected.
 */
export type InstantiationJustification = {
  workflow_id: string;
  /** Metric the workflow already measures or will measure */
  metric: string;
  baseline: string;
  target: string;
  why_independent_context: string;
  why_independent_tools: string;
  why_independent_reasoning: string;
  /** Evidence refs (tickets, dashboards, experiments) */
  evidence_refs: string[];
};

export type AgentRecord = {
  id: string;
  name: string;
  mission: string;
  business_problem: string;
  allowed_inputs: string[];
  expected_outputs: string[];
  tools: string[];
  model: string;
  context_sources: string[];
  permissions: AgentPermission[];
  budget: AgentBudget;
  KPIs: AgentKpi[];
  eval_suite: EvalSuite;
  failure_threshold: FailureThreshold;
  retry_limit: number;
  escalation_target: string;
  approval_requirements: ApprovalRequirements;
  status: AgentStatus;
  business_value: BusinessValue;
  last_reviewed: string;
  /** Optional capability tags from the catalog — not auto-roles */
  capabilities?: PossibleCapability[];
  /** Required for status active; strongly required on register */
  justification: InstantiationJustification;
  created_at: string;
  updated_at: string;
};

export type AgentRegistrySnapshot = {
  schema_version: "1";
  /** Policy note stored with snapshot */
  policy: "registry_before_workforce_no_role_fill";
  agents: AgentRecord[];
  updated_at: string;
};

export type ValidationIssue = {
  field: string;
  code: string;
  message: string;
};
