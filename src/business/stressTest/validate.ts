/**
 * Validate baseline inputs — allow nulls (UNKNOWN) but reject nonsense.
 */

import type { StressBaselineInputs, ValidationIssue } from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

function badNum(v: number | null | undefined): boolean {
  return typeof v === "number" && (Number.isNaN(v) || v < 0);
}

export function validateBaseline(
  b: StressBaselineInputs,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const fields: (keyof StressBaselineInputs)[] = [
    "gross_revenue",
    "refunds",
    "other_variable_delivery",
    "payment_fees",
    "ai_api_expense",
    "hosting_expense",
    "marketing_spend",
    "fixed_costs",
    "cash",
    "customers",
    "new_customers",
    "cac",
    "ltv",
  ];
  for (const f of fields) {
    if (badNum(b[f] as number | null)) {
      issues.push(issue(f, "invalid", `${f} must be ≥0 or null`));
    }
  }
  if (b.retention_rate != null && (b.retention_rate < 0 || b.retention_rate > 1)) {
    issues.push(issue("retention_rate", "range", "retention_rate must be 0..1 or null"));
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class StressTestError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "StressTestError";
    this.issues = issues;
  }
}
