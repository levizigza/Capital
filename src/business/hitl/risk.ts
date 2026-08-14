/**
 * Risk scoring → tier + gate.
 */

import type {
  ApprovalGate,
  RiskDimension,
  RiskProfile,
  RiskScore,
  RiskTier,
  TierAssessment,
} from "./types";
import { RISK_DIMENSIONS } from "./types";

const WEIGHTS: Record<RiskDimension, number> = {
  financial_impact: 1.2,
  reversibility: 1.1,
  customer_impact: 1.2,
  legal_sensitivity: 1.4,
  security_sensitivity: 1.4,
  brand_impact: 1.0,
  data_sensitivity: 1.3,
  strategic_impact: 1.3,
};

export function isRiskScore(n: unknown): n is RiskScore {
  return n === 0 || n === 1 || n === 2 || n === 3 || n === 4;
}

export function assertRiskProfile(risk: RiskProfile): void {
  for (const d of RISK_DIMENSIONS) {
    if (!isRiskScore(risk[d])) {
      throw new Error(`Invalid risk score for ${d}: ${String(risk[d])}`);
    }
  }
}

export function weightedSum(risk: RiskProfile): number {
  let sum = 0;
  for (const d of RISK_DIMENSIONS) {
    sum += risk[d] * WEIGHTS[d];
  }
  return Math.round(sum * 100) / 100;
}

export function maxDimension(risk: RiskProfile): { dim: RiskDimension; score: RiskScore } {
  let dim: RiskDimension = "financial_impact";
  let score: RiskScore = 0;
  for (const d of RISK_DIMENSIONS) {
    if (risk[d] > score) {
      score = risk[d];
      dim = d;
    }
  }
  return { dim, score };
}

function gateForTier(tier: RiskTier): ApprovalGate {
  switch (tier) {
    case "LOW":
      return "auto_execute";
    case "MEDIUM":
      return "policy_threshold";
    case "HIGH":
      return "founder_approval";
    case "CRITICAL":
      return "founder_plus_second_confirmation";
  }
}

/**
 * Conservative tiering:
 * - CRITICAL: any of legal/security/data ≥4, or strategic≥4 with reversibility≥3, or sum≥22, or max≥4 with sum≥18
 * - HIGH: max≥3, or sum≥14, or any legal/security/data ≥3
 * - MEDIUM: max≥2 or sum≥8
 * - LOW: otherwise
 */
export function assessRisk(risk: RiskProfile): TierAssessment {
  assertRiskProfile(risk);
  const sum = weightedSum(risk);
  const { dim, score } = maxDimension(risk);

  let tier: RiskTier;

  const criticalAxis =
    risk.legal_sensitivity >= 4 ||
    risk.security_sensitivity >= 4 ||
    risk.data_sensitivity >= 4 ||
    (risk.strategic_impact >= 4 && risk.reversibility >= 3) ||
    sum >= 22 ||
    (score >= 4 && sum >= 18);

  const highAxis =
    score >= 3 ||
    sum >= 14 ||
    risk.legal_sensitivity >= 3 ||
    risk.security_sensitivity >= 3 ||
    risk.data_sensitivity >= 3 ||
    risk.financial_impact >= 3 ||
    risk.strategic_impact >= 3;

  const mediumAxis = score >= 2 || sum >= 8;

  if (criticalAxis) tier = "CRITICAL";
  else if (highAxis) tier = "HIGH";
  else if (mediumAxis) tier = "MEDIUM";
  else tier = "LOW";

  const gate = gateForTier(tier);
  const rationale =
    `${tier} via max ${dim}=${score}, weighted_sum=${sum}; gate=${gate}`;

  return {
    tier,
    gate,
    weighted_sum: sum,
    max_dimension: dim,
    max_score: score,
    rationale,
  };
}

export function emptyRiskProfile(): RiskProfile {
  return {
    financial_impact: 0,
    reversibility: 0,
    customer_impact: 0,
    legal_sensitivity: 0,
    security_sensitivity: 0,
    brand_impact: 0,
    data_sensitivity: 0,
    strategic_impact: 0,
  };
}
