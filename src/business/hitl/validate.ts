/**
 * Validate approval requests — all required fields must be present.
 */

import { isRiskScore } from "./risk";
import type { ApprovalRequest, ValidationIssue } from "./types";
import { RISK_DIMENSIONS } from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

export function validateApprovalRequest(
  req: ApprovalRequest,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!req.id?.trim() || req.id.trim().length < 3) {
    issues.push(issue("id", "required", "id required (≥3 chars)"));
  }
  if (!req.created_at?.trim()) {
    issues.push(issue("created_at", "required", "created_at required (ISO)"));
  }
  if (!req.recommended_action?.trim() || req.recommended_action.trim().length < 8) {
    issues.push(
      issue("recommended_action", "required", "recommended_action required (≥8 chars)"),
    );
  }
  if (!req.reason?.trim() || req.reason.trim().length < 8) {
    issues.push(issue("reason", "required", "reason required (≥8 chars)"));
  }
  if (!Array.isArray(req.evidence) || req.evidence.length < 1) {
    issues.push(issue("evidence", "required", "evidence requires ≥1 item"));
  } else {
    for (const [i, e] of req.evidence.entries()) {
      if (!e?.ref?.trim() || e.ref.trim().length < 2) {
        issues.push(issue(`evidence[${i}].ref`, "invalid", "evidence.ref required"));
      }
    }
  }
  if (!req.expected_upside?.trim() || req.expected_upside.trim().length < 4) {
    issues.push(issue("expected_upside", "required", "expected_upside required"));
  }
  if (typeof req.expected_cost !== "number" || Number.isNaN(req.expected_cost) || req.expected_cost < 0) {
    issues.push(issue("expected_cost", "invalid", "expected_cost must be a non-negative number"));
  }
  if (typeof req.confidence !== "number" || req.confidence < 0 || req.confidence > 1) {
    issues.push(issue("confidence", "invalid", "confidence must be 0..1"));
  }
  if (!req.reversibility?.trim() || req.reversibility.trim().length < 4) {
    issues.push(issue("reversibility", "required", "reversibility narrative required"));
  }
  if (!req.worst_case?.trim() || req.worst_case.trim().length < 4) {
    issues.push(issue("worst_case", "required", "worst_case required"));
  }
  if (!req.alternative_action?.trim() || req.alternative_action.trim().length < 4) {
    issues.push(issue("alternative_action", "required", "alternative_action required"));
  }
  if (!req.responsible?.trim() || req.responsible.trim().length < 2) {
    issues.push(
      issue("responsible", "required", "agent/workflow responsible required"),
    );
  }

  if (!req.risk) {
    issues.push(issue("risk", "required", "risk profile required"));
  } else {
    for (const d of RISK_DIMENSIONS) {
      if (!isRiskScore(req.risk[d])) {
        issues.push(issue(`risk.${d}`, "invalid", `risk.${d} must be 0..4`));
      }
    }
  }

  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class HitlValidationError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "HitlValidationError";
    this.issues = issues;
  }
}
