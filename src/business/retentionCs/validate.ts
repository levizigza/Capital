/**
 * Validate cohort observations.
 */

import type { CohortObservation, ValidationIssue } from "./types";
import { COHORT_METRICS } from "./types";

function issue(field: string, code: string, message: string): ValidationIssue {
  return { field, code, message };
}

export function validateObservation(
  obs: CohortObservation,
): { ok: true } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!obs.id?.trim() || obs.id.length < 3) {
    issues.push(issue("id", "required", "id required"));
  }
  if (!(COHORT_METRICS as readonly string[]).includes(obs.metric)) {
    issues.push(issue("metric", "enum", "invalid metric"));
  }
  if (!obs.dimensions?.cohort_id?.trim()) {
    issues.push(issue("dimensions.cohort_id", "required", "cohort_id required"));
  }
  if (!obs.dimensions?.acquisition_source?.trim()) {
    issues.push(issue("dimensions.acquisition_source", "required", "acquisition_source required"));
  }
  if (!obs.dimensions?.product_version?.trim()) {
    issues.push(issue("dimensions.product_version", "required", "product_version required"));
  }
  if (!obs.dimensions?.onboarding_path?.trim()) {
    issues.push(issue("dimensions.onboarding_path", "required", "onboarding_path required"));
  }
  if (typeof obs.value !== "number" || Number.isNaN(obs.value)) {
    issues.push(issue("value", "invalid", "value must be a number"));
  }
  if (obs.metric !== "session_frequency" && (obs.value < 0 || obs.value > 1.5)) {
    // allow slight >1 for measurement noise but flag absurd
    if (obs.value < 0 || obs.value > 2) {
      issues.push(issue("value", "range", "rate-like metrics should be ~0..1"));
    }
  }
  if (typeof obs.sample_size !== "number" || obs.sample_size < 0) {
    issues.push(issue("sample_size", "invalid", "sample_size must be ≥0"));
  }
  if (!obs.observed_at?.trim()) {
    issues.push(issue("observed_at", "required", "observed_at required"));
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true };
}

export class RetentionCsError extends Error {
  readonly issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "RetentionCsError";
    this.issues = issues;
  }
}
