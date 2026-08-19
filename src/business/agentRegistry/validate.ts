/**
 * Validation for agent registry records and instantiation gate.
 */

import type {
  AgentRecord,
  InstantiationJustification,
  ValidationIssue,
} from "./types";
import { AGENT_STATUSES, POSSIBLE_CAPABILITIES } from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

function nonEmpty(s: unknown, min = 1): boolean {
  return typeof s === "string" && s.trim().length >= min;
}

/**
 * Instantiation requires a measurable workflow need for independent
 * context and/or tools and/or reasoning — not role decoration.
 */
export function validateJustification(
  j: InstantiationJustification | undefined | null,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!j) {
    issues.push(
      issue(
        "justification",
        "required",
        "InstantiationJustification required — do not create agents to fill roles",
      ),
    );
    return issues;
  }
  if (!nonEmpty(j.workflow_id, 3)) {
    issues.push(issue("justification.workflow_id", "required", "workflow_id required"));
  }
  if (!nonEmpty(j.metric, 3)) {
    issues.push(issue("justification.metric", "required", "metric required"));
  }
  if (!nonEmpty(j.baseline, 1)) {
    issues.push(issue("justification.baseline", "required", "baseline required"));
  }
  if (!nonEmpty(j.target, 1)) {
    issues.push(issue("justification.target", "required", "target required"));
  }
  if (!Array.isArray(j.evidence_refs) || j.evidence_refs.length < 1) {
    issues.push(
      issue(
        "justification.evidence_refs",
        "required",
        "≥1 evidence_refs required (workflow proof)",
      ),
    );
  }

  const ctx = nonEmpty(j.why_independent_context, 12);
  const tools = nonEmpty(j.why_independent_tools, 12);
  const reason = nonEmpty(j.why_independent_reasoning, 12);
  if (!ctx && !tools && !reason) {
    issues.push(
      issue(
        "justification",
        "no_independence_need",
        "At least one of why_independent_context / tools / reasoning must be substantive (≥12 chars)",
      ),
    );
  }

  // Reject obvious role-fill fluff
  const blob = `${j.why_independent_context} ${j.why_independent_tools} ${j.why_independent_reasoning}`.toLowerCase();
  if (
    /\b(fill(ing)? (the )?role|we (should|need) a .+ agent|every team needs)\b/.test(blob) &&
    !ctx &&
    !tools
  ) {
    issues.push(
      issue(
        "justification",
        "role_fill_forbidden",
        "Role-filling language without independent context/tools need is forbidden",
      ),
    );
  }

  return issues;
}

export function validateAgentRecord(
  agent: AgentRecord,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!nonEmpty(agent.id, 3)) issues.push(issue("id", "required", "id required (≥3)"));
  if (!nonEmpty(agent.name, 2)) issues.push(issue("name", "required", "name required"));
  if (!nonEmpty(agent.mission, 8)) issues.push(issue("mission", "required", "mission required"));
  if (!nonEmpty(agent.business_problem, 8)) {
    issues.push(issue("business_problem", "required", "business_problem required"));
  }
  if (!Array.isArray(agent.allowed_inputs) || agent.allowed_inputs.length < 1) {
    issues.push(issue("allowed_inputs", "required", "allowed_inputs ≥1"));
  }
  if (!Array.isArray(agent.expected_outputs) || agent.expected_outputs.length < 1) {
    issues.push(issue("expected_outputs", "required", "expected_outputs ≥1"));
  }
  if (!Array.isArray(agent.tools)) {
    issues.push(issue("tools", "required", "tools array required (may be empty only for draft)"));
  }
  if (!nonEmpty(agent.model, 1)) issues.push(issue("model", "required", "model required"));
  if (!Array.isArray(agent.context_sources) || agent.context_sources.length < 1) {
    issues.push(issue("context_sources", "required", "context_sources ≥1"));
  }
  if (!Array.isArray(agent.permissions) || agent.permissions.length < 1) {
    issues.push(issue("permissions", "required", "permissions ≥1"));
  }
  if (agent.permissions?.includes("execute_protected_action")) {
    if (!agent.approval_requirements?.require_hitl_before_side_effects) {
      issues.push(
        issue(
          "permissions",
          "hitl_required",
          "execute_protected_action requires require_hitl_before_side_effects",
        ),
      );
    }
  }
  if (!agent.budget) issues.push(issue("budget", "required", "budget required"));
  if (!Array.isArray(agent.KPIs) || agent.KPIs.length < 1) {
    issues.push(issue("KPIs", "required", "KPIs ≥1"));
  }
  if (!agent.eval_suite?.id || !Array.isArray(agent.eval_suite.cases) || agent.eval_suite.cases.length < 1) {
    issues.push(issue("eval_suite", "required", "eval_suite with ≥1 case required"));
  }
  if (
    !agent.failure_threshold ||
    agent.failure_threshold.max_consecutive_failures < 1 ||
    agent.failure_threshold.rolling_window < 1
  ) {
    issues.push(issue("failure_threshold", "invalid", "failure_threshold invalid"));
  }
  if (typeof agent.retry_limit !== "number" || agent.retry_limit < 0 || agent.retry_limit > 10) {
    issues.push(issue("retry_limit", "invalid", "retry_limit must be 0..10"));
  }
  if (!nonEmpty(agent.escalation_target, 2)) {
    issues.push(issue("escalation_target", "required", "escalation_target required"));
  }
  if (!agent.approval_requirements?.approver_roles?.length) {
    issues.push(
      issue("approval_requirements", "required", "approval_requirements.approver_roles ≥1"),
    );
  }
  if (!AGENT_STATUSES.includes(agent.status)) {
    issues.push(issue("status", "enum", `status must be one of ${AGENT_STATUSES.join(", ")}`));
  }
  if (!nonEmpty(agent.business_value?.narrative, 8)) {
    issues.push(issue("business_value", "required", "business_value.narrative required"));
  }
  if (!nonEmpty(agent.last_reviewed, 8)) {
    issues.push(issue("last_reviewed", "required", "last_reviewed ISO date required"));
  }

  if (agent.capabilities) {
    for (const [i, c] of agent.capabilities.entries()) {
      if (!(POSSIBLE_CAPABILITIES as readonly string[]).includes(c)) {
        issues.push(issue(`capabilities[${i}]`, "enum", `Unknown capability ${c}`));
      }
    }
  }

  issues.push(...validateJustification(agent.justification));

  if (agent.status === "active") {
    const jIssues = validateJustification(agent.justification);
    if (jIssues.length) {
      issues.push(
        issue("status", "active_requires_justification", "active agents must pass instantiation gate"),
      );
    }
    if (!agent.tools?.length) {
      issues.push(issue("tools", "required", "active agents need ≥1 tool or explicit none:none"));
    }
  }

  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class AgentRegistryError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "AgentRegistryError";
    this.issues = issues;
  }
}
