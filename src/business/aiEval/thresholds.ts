/**
 * Threshold validation — max_retries must be finite and bounded.
 */

import type { FailureThresholds, ValidationIssue, WorkerEvalConfig } from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

export function validateThresholds(
  t: FailureThresholds,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(t.max_retries) || t.max_retries < 0 || t.max_retries > 10) {
    issues.push(
      issue(
        "max_retries",
        "bounded",
        "max_retries must be finite 0..10 — no indefinite autonomous retry loops",
      ),
    );
  }
  if (!Number.isFinite(t.max_consecutive_errors) || t.max_consecutive_errors < 1) {
    issues.push(
      issue("max_consecutive_errors", "invalid", "max_consecutive_errors must be ≥1"),
    );
  }
  if (t.max_hallucination_rate < 0 || t.max_hallucination_rate > 1) {
    issues.push(issue("max_hallucination_rate", "range", "must be 0..1"));
  }
  if (t.max_tool_failure_rate < 0 || t.max_tool_failure_rate > 1) {
    issues.push(issue("max_tool_failure_rate", "range", "must be 0..1"));
  }
  if (t.max_cost_per_task < 0) {
    issues.push(issue("max_cost_per_task", "invalid", "must be ≥0"));
  }
  if (t.max_latency_ms < 1) {
    issues.push(issue("max_latency_ms", "invalid", "must be ≥1"));
  }
  if (!Number.isFinite(t.rolling_window) || t.rolling_window < 5) {
    issues.push(issue("rolling_window", "invalid", "rolling_window must be ≥5"));
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export function validateWorkerConfig(
  cfg: WorkerEvalConfig,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!cfg.worker_id?.trim() || cfg.worker_id.length < 3) {
    issues.push(issue("worker_id", "required", "worker_id required"));
  }
  if (!cfg.escalation_target?.trim()) {
    issues.push(issue("escalation_target", "required", "escalation_target required"));
  }
  const th = validateThresholds(cfg.thresholds);
  if (!th.ok) issues.push(...th.issues);
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class AiEvalError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "AiEvalError";
    this.issues = issues;
  }
}
