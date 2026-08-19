/**
 * Eval gate — quality thresholds before model downgrade.
 */

import type { DowngradeDecision, EvalGate, ModelCatalogEntry, ModelTier } from "./types";

function tierRank(t: ModelTier): number {
  switch (t) {
    case "low_cost":
      return 0;
    case "mid_tier":
      return 1;
    case "high_capability":
      return 2;
  }
}

export function isDowngrade(
  fromModel: string,
  toModel: string,
  catalog: ModelCatalogEntry[],
): boolean {
  const a = catalog.find((m) => m.model_id === fromModel);
  const b = catalog.find((m) => m.model_id === toModel);
  if (!a || !b) return true; // treat unknown as requiring gate
  return tierRank(b.tier) < tierRank(a.tier);
}

/**
 * Quality thresholds must be established with evals before downgrading.
 */
export function evaluateDowngradeGate(
  workflowId: string,
  fromModel: string,
  toModel: string,
  catalog: ModelCatalogEntry[],
  gate: EvalGate | null,
): DowngradeDecision {
  const at = new Date().toISOString();

  if (!isDowngrade(fromModel, toModel, catalog)) {
    return {
      allowed: true,
      workflow_id: workflowId,
      from_model: fromModel,
      to_model: toModel,
      reason: "Not a capability downgrade (same or higher tier)",
      eval_gate: gate,
      at,
    };
  }

  if (!gate) {
    return {
      allowed: false,
      workflow_id: workflowId,
      from_model: fromModel,
      to_model: toModel,
      reason:
        "Blocked: quality thresholds must be established with evals before downgrading models",
      eval_gate: null,
      at,
    };
  }

  if (gate.candidate_model !== toModel || gate.model_under_test !== fromModel) {
    return {
      allowed: false,
      workflow_id: workflowId,
      from_model: fromModel,
      to_model: toModel,
      reason: "EvalGate models do not match proposed downgrade pair",
      eval_gate: gate,
      at,
    };
  }

  if (!gate.evidence_refs?.length) {
    return {
      allowed: false,
      workflow_id: workflowId,
      from_model: fromModel,
      to_model: toModel,
      reason: "EvalGate missing evidence_refs",
      eval_gate: gate,
      at,
    };
  }

  if (gate.sample_size < 20) {
    return {
      allowed: false,
      workflow_id: workflowId,
      from_model: fromModel,
      to_model: toModel,
      reason: `Eval sample_size ${gate.sample_size} < 20`,
      eval_gate: gate,
      at,
    };
  }

  if (gate.pass_rate < gate.min_pass_rate) {
    return {
      allowed: false,
      workflow_id: workflowId,
      from_model: fromModel,
      to_model: toModel,
      reason: `Eval pass_rate ${gate.pass_rate} < min_pass_rate ${gate.min_pass_rate}`,
      eval_gate: gate,
      at,
    };
  }

  return {
    allowed: true,
    workflow_id: workflowId,
    from_model: fromModel,
    to_model: toModel,
    reason: `Eval gate passed (${gate.eval_suite_id} pass_rate=${gate.pass_rate})`,
    eval_gate: gate,
    at,
  };
}
