/**
 * Budget validation & limit checks.
 */

import type {
  LimitBreach,
  RunUsage,
  ValidationIssue,
  WorkflowBudget,
} from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

export function validateBudget(
  b: WorkflowBudget,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!b.workflow_id?.trim() || b.workflow_id.length < 3) {
    issues.push(issue("workflow_id", "required", "workflow_id required"));
  }
  if (!b.model?.trim()) issues.push(issue("model", "required", "model required"));
  if (!Number.isFinite(b.maximum_tokens) || b.maximum_tokens < 1) {
    issues.push(issue("maximum_tokens", "invalid", "maximum_tokens must be ≥1"));
  }
  if (!Number.isFinite(b.maximum_steps) || b.maximum_steps < 1) {
    issues.push(issue("maximum_steps", "invalid", "maximum_steps must be ≥1"));
  }
  if (!Number.isFinite(b.maximum_tool_calls) || b.maximum_tool_calls < 0) {
    issues.push(issue("maximum_tool_calls", "invalid", "maximum_tool_calls must be ≥0"));
  }
  if (!Number.isFinite(b.maximum_retries) || b.maximum_retries < 0 || b.maximum_retries > 10) {
    issues.push(
      issue("maximum_retries", "bounded", "maximum_retries must be finite 0..10"),
    );
  }
  if (!Number.isFinite(b.maximum_runtime) || b.maximum_runtime < 1) {
    issues.push(issue("maximum_runtime", "invalid", "maximum_runtime (ms) must be ≥1"));
  }
  if (!Number.isFinite(b.maximum_dollar_cost) || b.maximum_dollar_cost < 0) {
    issues.push(issue("maximum_dollar_cost", "invalid", "maximum_dollar_cost must be ≥0"));
  }
  if (
    b.fallback_behavior === "switch_to_fallback_model" &&
    !b.fallback_model?.trim()
  ) {
    issues.push(
      issue("fallback_model", "required", "fallback_model required for switch_to_fallback_model"),
    );
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export function checkLimits(budget: WorkflowBudget, usage: RunUsage): LimitBreach[] {
  const breaches: LimitBreach[] = [];
  const pairs: [LimitBreach["limit"], number, number][] = [
    ["maximum_tokens", usage.tokens, budget.maximum_tokens],
    ["maximum_steps", usage.steps, budget.maximum_steps],
    ["maximum_tool_calls", usage.tool_calls, budget.maximum_tool_calls],
    ["maximum_retries", usage.retries, budget.maximum_retries],
    ["maximum_runtime", usage.runtime_ms, budget.maximum_runtime],
    ["maximum_dollar_cost", usage.dollar_cost, budget.maximum_dollar_cost],
  ];
  for (const [limit, used, maximum] of pairs) {
    if (used > maximum) breaches.push({ limit, used, maximum });
  }
  return breaches;
}

export class CostGovernorError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "CostGovernorError";
    this.issues = issues;
  }
}
