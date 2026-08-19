/**
 * Cost / value stats, model comparison, growth flags.
 */

import type {
  CostValueFlag,
  GovernedRunRecord,
  ModelComparisonRow,
  WorkflowCostStats,
} from "./types";

function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round(n: number, d = 4): number {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export function failureAdjustedCost(totalCost: number, successRate: number): number {
  const eps = 0.05;
  return round(totalCost / Math.max(successRate, eps), 4);
}

export function computeWorkflowStats(runs: GovernedRunRecord[]): WorkflowCostStats | null {
  if (!runs.length) return null;
  const workflow_id = runs[0]!.workflow_id;
  const costs = runs.map((r) => r.usage.dollar_cost);
  const tokens = runs.map((r) => r.usage.tokens);
  const successes = runs.filter((r) => r.success).length;
  const success_rate = successes / runs.length;
  const values = runs
    .map((r) => r.business_value)
    .filter((v): v is number => typeof v === "number");
  const totalCost = costs.reduce((a, b) => a + b, 0);

  const byModel = new Map<string, GovernedRunRecord[]>();
  for (const r of runs) {
    const list = byModel.get(r.model_used) ?? [];
    list.push(r);
    byModel.set(r.model_used, list);
  }
  const by_model: ModelComparisonRow[] = [...byModel.entries()].map(([model, list]) => {
    const vals = list
      .map((r) => r.business_value)
      .filter((v): v is number => typeof v === "number");
    return {
      model,
      tasks: list.length,
      cost_per_task: round(mean(list.map((r) => r.usage.dollar_cost))),
      tokens_per_task: round(mean(list.map((r) => r.usage.tokens)), 2),
      success_rate: round(list.filter((r) => r.success).length / list.length, 3),
      business_value_per_task: vals.length ? round(mean(vals)) : null,
    };
  });

  return {
    workflow_id,
    tasks: runs.length,
    cost_per_task: round(mean(costs)),
    business_value_per_task: values.length ? round(mean(values)) : null,
    failure_adjusted_cost: failureAdjustedCost(totalCost / runs.length, success_rate),
    tokens_per_task: round(mean(tokens), 2),
    success_rate: round(success_rate, 3),
    by_model,
  };
}

/**
 * Simple slope via first-half vs second-half means (needs ≥4 points).
 */
function halfSlope(values: number[]): number | null {
  if (values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const first = mean(values.slice(0, mid));
  const second = mean(values.slice(mid));
  return second - first;
}

/**
 * Flag processes whose AI cost grows faster than economic value.
 */
export function detectCostValueFlags(
  runs: GovernedRunRecord[],
  opts: { min_tasks?: number; ratio_alert?: number } = {},
): CostValueFlag[] {
  const minTasks = opts.min_tasks ?? 4;
  const ratioAlert = opts.ratio_alert ?? 1.25;
  const byWf = new Map<string, GovernedRunRecord[]>();
  for (const r of runs) {
    const list = byWf.get(r.workflow_id) ?? [];
    list.push(r);
    byWf.set(r.workflow_id, list);
  }

  const flags: CostValueFlag[] = [];
  for (const [workflow_id, list] of byWf) {
    const sorted = [...list].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    if (sorted.length < minTasks) continue;

    const costs = sorted.map((r) => r.usage.dollar_cost);
    const values = sorted.map((r) =>
      typeof r.business_value === "number" ? r.business_value : 0,
    );
    const cost_slope = halfSlope(costs);
    const value_slope = halfSlope(values);
    if (cost_slope == null || value_slope == null) continue;

    const recent = sorted.slice(-Math.max(2, Math.floor(sorted.length / 2)));
    const recentCost = mean(recent.map((r) => r.usage.dollar_cost));
    const recentVal = mean(
      recent.map((r) => (typeof r.business_value === "number" ? r.business_value : 0)),
    );
    const cost_value_ratio =
      recentVal > 0 ? round(recentCost / recentVal, 4) : recentCost > 0 ? null : 0;

    const growsFaster =
      cost_slope > value_slope + 1e-9 &&
      (value_slope <= 0 || cost_slope / Math.max(value_slope, 1e-9) >= ratioAlert);

    const ratioRising =
      cost_value_ratio != null &&
      cost_value_ratio > ratioAlert &&
      cost_slope > 0;

    if (growsFaster || ratioRising) {
      flags.push({
        id: `flag_${workflow_id}_${Date.now().toString(36)}`,
        workflow_id,
        kind: "cost_grows_faster_than_value",
        evidence: [
          `cost_slope=${round(cost_slope, 6)} value_slope=${round(value_slope, 6)}`,
          `cost_value_ratio=${cost_value_ratio ?? "n/a"}`,
          `tasks=${sorted.length} recent_cost/task=${round(recentCost)} recent_value/task=${round(recentVal)}`,
        ],
        cost_slope: round(cost_slope, 6),
        value_slope: round(value_slope, 6),
        cost_value_ratio,
        at: new Date().toISOString(),
      });
    }
  }
  return flags;
}
