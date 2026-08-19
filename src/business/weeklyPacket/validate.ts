/**
 * Validate founder decisions & packet inputs.
 */

import type {
  FounderDecisionRequest,
  ValidationIssue,
  WeeklyPacketInputs,
} from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

function nonEmpty(s: unknown, min = 1): boolean {
  return typeof s === "string" && s.trim().length >= min;
}

export function validateFounderDecision(
  d: FounderDecisionRequest,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!nonEmpty(d.id, 3)) issues.push(issue("id", "required", "id required"));
  if (!nonEmpty(d.title, 4)) issues.push(issue("title", "required", "title required"));
  if (!nonEmpty(d.recommendation, 8)) {
    issues.push(issue("recommendation", "required", "recommendation required"));
  }
  if (!Array.isArray(d.evidence) || d.evidence.length < 1) {
    issues.push(issue("evidence", "required", "evidence ≥1 required"));
  }
  if (!nonEmpty(d.expected_upside, 4)) {
    issues.push(issue("expected_upside", "required", "expected_upside required"));
  }
  if (d.cost != null && (typeof d.cost !== "number" || d.cost < 0 || Number.isNaN(d.cost))) {
    issues.push(issue("cost", "invalid", "cost must be ≥0 or null"));
  }
  if (!nonEmpty(d.cost_note, 2)) {
    issues.push(issue("cost_note", "required", "cost_note required (use UNKNOWN if needed)"));
  }
  if (typeof d.confidence !== "number" || d.confidence < 0 || d.confidence > 1) {
    issues.push(issue("confidence", "range", "confidence must be 0..1"));
  }
  if (!nonEmpty(d.reversibility, 4)) {
    issues.push(issue("reversibility", "required", "reversibility required"));
  }
  if (!nonEmpty(d.worst_case, 4)) {
    issues.push(issue("worst_case", "required", "worst_case required"));
  }
  if (!nonEmpty(d.alternative, 4)) {
    issues.push(issue("alternative", "required", "alternative required"));
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export function validatePacketInputs(
  inputs: WeeklyPacketInputs,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!nonEmpty(inputs.week_id, 3)) {
    issues.push(issue("week_id", "required", "week_id required"));
  }
  if (!nonEmpty(inputs.week_start, 8)) {
    issues.push(issue("week_start", "required", "week_start required"));
  }
  if (!nonEmpty(inputs.week_end, 8)) {
    issues.push(issue("week_end", "required", "week_end required"));
  }
  if (!nonEmpty(inputs.generated_for, 2)) {
    issues.push(issue("generated_for", "required", "generated_for required"));
  }
  for (const [i, d] of (inputs.founder_decisions ?? []).entries()) {
    const r = validateFounderDecision(d);
    if (!r.ok) {
      for (const iss of r.issues) {
        issues.push(issue(`founder_decisions[${i}].${iss.field}`, iss.code, iss.message));
      }
    }
  }
  for (const [i, a] of (inputs.automatic_actions ?? []).entries()) {
    if (a.requires_founder !== false) {
      issues.push(
        issue(
          `automatic_actions[${i}].requires_founder`,
          "invalid",
          "automatic actions must have requires_founder=false",
        ),
      );
    }
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class WeeklyPacketError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "WeeklyPacketError";
    this.issues = issues;
  }
}
