/**
 * MEDIUM-tier policy threshold checks.
 */

import type { ApprovalRequest, PolicyThresholds, TierAssessment } from "./types";
import { DEFAULT_POLICY_THRESHOLDS } from "./types";

export type PolicyCheckResult =
  | { ok: true; thresholds: PolicyThresholds }
  | { ok: false; thresholds: PolicyThresholds; violations: string[] };

/**
 * MEDIUM may execute only when within explicit thresholds.
 */
export function checkMediumPolicy(
  request: ApprovalRequest,
  assessment: TierAssessment,
  thresholds: PolicyThresholds = request.policy_thresholds ?? DEFAULT_POLICY_THRESHOLDS,
): PolicyCheckResult {
  if (assessment.tier !== "MEDIUM") {
    return { ok: false, thresholds, violations: [`Not MEDIUM (tier=${assessment.tier})`] };
  }

  const violations: string[] = [];
  if (request.risk.financial_impact > thresholds.max_financial_impact) {
    violations.push(
      `financial_impact ${request.risk.financial_impact} > max ${thresholds.max_financial_impact}`,
    );
  }
  if (request.risk.customer_impact > thresholds.max_customer_impact) {
    violations.push(
      `customer_impact ${request.risk.customer_impact} > max ${thresholds.max_customer_impact}`,
    );
  }
  if (request.risk.brand_impact > thresholds.max_brand_impact) {
    violations.push(
      `brand_impact ${request.risk.brand_impact} > max ${thresholds.max_brand_impact}`,
    );
  }
  if (assessment.weighted_sum > thresholds.max_weighted_sum) {
    violations.push(
      `weighted_sum ${assessment.weighted_sum} > max ${thresholds.max_weighted_sum}`,
    );
  }
  if (request.expected_cost > thresholds.max_expected_cost) {
    violations.push(
      `expected_cost ${request.expected_cost} > max ${thresholds.max_expected_cost}`,
    );
  }

  if (violations.length) return { ok: false, thresholds, violations };
  return { ok: true, thresholds };
}

const FOUNDER_SLUG = /^(agent|ai|bot|llm|gpt|claude)/i;

export function isFounderActor(actor: string): boolean {
  const a = actor.trim();
  if (!a) return false;
  if (FOUNDER_SLUG.test(a)) return false;
  // Accept explicit founder / owner roles or named humans
  return /founder|owner|ceo|human:/i.test(a) || (!a.includes("agent") && a.length >= 2);
}

export function isSecondConfirmer(actor: string, founder: string): boolean {
  const a = actor.trim();
  if (!isFounderActor(a)) return false;
  // Second confirmation must be a different identity
  return a.toLowerCase() !== founder.trim().toLowerCase();
}
