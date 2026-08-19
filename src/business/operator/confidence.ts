/**
 * Confidence evaluation for Operator results.
 */

import type { ConfidenceReport, DelegateResult, Classification } from "./types";

const AUTO_EXECUTE_FLOOR = 0.55;

export function evaluateConfidence(input: {
  classification: Classification;
  delegate: DelegateResult | null;
  contextCount: number;
}): ConfidenceReport {
  let score = 0.4;
  const bits: string[] = [];

  if (input.contextCount > 0) {
    score += Math.min(0.25, input.contextCount * 0.08);
    bits.push(`context×${input.contextCount}`);
  } else {
    bits.push("no context");
  }

  if (input.classification.task_class === "observe_only") {
    score += 0.3;
    bits.push("observe-only");
  }

  if (input.classification.task_class === "propose_protected_change") {
    // High process confidence that we must NOT auto-execute
    score = Math.max(score, 0.7);
    bits.push("protected propose");
  }

  if (input.classification.mode === "deterministic") {
    score += 0.1;
    bits.push("deterministic");
  }

  if (input.delegate) {
    if (input.delegate.proposed_actions.every((a) => a.protected_domain)) {
      bits.push("all actions protected");
    }
    if (input.delegate.summary.trim().length > 20) {
      score += 0.05;
    }
  }

  score = Math.max(0, Math.min(1, score));

  return {
    score: Math.round(score * 100) / 100,
    rationale: bits.join("; ") || "baseline",
    auto_execute_floor: AUTO_EXECUTE_FLOOR,
  };
}

export function mayAutoExecute(
  confidence: ConfidenceReport,
  hasProtectedActions: boolean,
): boolean {
  if (hasProtectedActions) return false;
  return confidence.score >= confidence.auto_execute_floor;
}
