/**
 * AI Cost Governor — budgets, routing, eval-gated downgrade, cost/value flags.
 */

import { evaluateDowngradeGate } from "./downgrade";
import { resolveModel } from "./routing";
import { computeWorkflowStats, detectCostValueFlags } from "./stats";
import { CostGovernorError, checkLimits, validateBudget } from "./validate";
import type {
  CostGovernorSnapshot,
  CostValueFlag,
  DowngradeDecision,
  EvalGate,
  GovernedRunRecord,
  ModelCatalogEntry,
  ModelRouteTable,
  RunUsage,
  TaskComplexity,
  WorkflowBudget,
  WorkflowCostStats,
} from "./types";
import { DEFAULT_ROUTE_TABLE } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_CATALOG: ModelCatalogEntry[] = [
  { model_id: "model-low", tier: "low_cost", usd_per_1k_tokens: 0.05 },
  { model_id: "model-mid", tier: "mid_tier", usd_per_1k_tokens: 0.5 },
  { model_id: "model-high", tier: "high_capability", usd_per_1k_tokens: 5 },
];

export class AiCostGovernor {
  private budgets = new Map<string, WorkflowBudget>();
  private catalog: ModelCatalogEntry[];
  private routeTable: ModelRouteTable;
  private runs: GovernedRunRecord[] = [];
  private downgrades: DowngradeDecision[] = [];
  private flags: CostValueFlag[] = [];

  constructor(opts?: {
    catalog?: ModelCatalogEntry[];
    route_table?: ModelRouteTable;
  }) {
    this.catalog = opts?.catalog ? [...opts.catalog] : [...DEFAULT_CATALOG];
    this.routeTable = opts?.route_table ?? { ...DEFAULT_ROUTE_TABLE };
  }

  setCatalog(catalog: ModelCatalogEntry[]): void {
    this.catalog = [...catalog];
  }

  registerBudget(budget: WorkflowBudget): WorkflowBudget {
    const v = validateBudget(budget);
    if (!v.ok) {
      throw new CostGovernorError(v.issues.map((i) => i.message).join("; "), v.issues);
    }
    this.budgets.set(budget.workflow_id, structuredClone(budget));
    return structuredClone(budget);
  }

  getBudget(workflowId: string): WorkflowBudget | null {
    const b = this.budgets.get(workflowId);
    return b ? structuredClone(b) : null;
  }

  /** Route a task by complexity to the appropriate model tier/model. */
  route(workflowId: string, complexity: TaskComplexity): {
    tier: ReturnType<typeof resolveModel>["tier"];
    model_id: string;
  } {
    const budget = this.budgets.get(workflowId);
    return resolveModel({
      complexity,
      catalog: this.catalog,
      route_table: this.routeTable,
      budget_default_model: budget?.model,
    });
  }

  /**
   * Record a run; enforce limits; apply fallback metadata when breached.
   */
  recordRun(input: {
    workflow_id: string;
    task_id: string;
    complexity: TaskComplexity;
    usage: RunUsage;
    success: boolean;
    business_value?: number | null;
    model_override?: string;
  }): GovernedRunRecord {
    const budget = this.budgets.get(input.workflow_id);
    if (!budget) throw new CostGovernorError(`Unknown workflow budget ${input.workflow_id}`);

    const routed = this.route(input.workflow_id, input.complexity);
    const model_used = input.model_override ?? routed.model_id;
    const breaches = checkLimits(budget, input.usage);
    const fallback_applied = breaches.length ? budget.fallback_behavior : null;

    const record: GovernedRunRecord = {
      id: newId("run"),
      workflow_id: input.workflow_id,
      task_id: input.task_id,
      complexity: input.complexity,
      routed_tier: routed.tier,
      model_used,
      usage: { ...input.usage },
      success: input.success && breaches.length === 0 ? input.success : input.success,
      business_value:
        input.business_value === undefined ? null : input.business_value,
      breaches,
      fallback_applied,
      at: nowIso(),
    };
    // If hard limits breached and fallback is abort, mark unsuccessful
    if (breaches.length && budget.fallback_behavior === "abort") {
      record.success = false;
    }
    this.runs.push(record);
    return structuredClone(record);
  }

  /**
   * Propose downgrading a workflow's model — blocked without passing eval gate.
   */
  proposeDowngrade(
    workflowId: string,
    toModel: string,
    gate: EvalGate | null,
  ): DowngradeDecision {
    const budget = this.budgets.get(workflowId);
    if (!budget) throw new CostGovernorError(`Unknown workflow ${workflowId}`);
    const decision = evaluateDowngradeGate(
      workflowId,
      budget.model,
      toModel,
      this.catalog,
      gate,
    );
    this.downgrades.push(decision);
    if (decision.allowed) {
      budget.model = toModel;
      this.budgets.set(workflowId, budget);
    }
    return structuredClone(decision);
  }

  statsFor(workflowId: string): WorkflowCostStats | null {
    const runs = this.runs.filter((r) => r.workflow_id === workflowId);
    return computeWorkflowStats(runs);
  }

  /** Recompute and store cost-vs-value flags. */
  refreshFlags(): CostValueFlag[] {
    this.flags = detectCostValueFlags(this.runs);
    return this.listFlags();
  }

  listFlags(): CostValueFlag[] {
    return this.flags.map((f) => structuredClone(f));
  }

  listRuns(workflowId?: string): GovernedRunRecord[] {
    return this.runs
      .filter((r) => !workflowId || r.workflow_id === workflowId)
      .map((r) => structuredClone(r));
  }

  listDowngrades(): DowngradeDecision[] {
    return this.downgrades.map((d) => structuredClone(d));
  }

  serialize(): CostGovernorSnapshot {
    return {
      schema_version: "1",
      policy: "eval_gate_before_model_downgrade",
      budgets: [...this.budgets.values()].map((b) => structuredClone(b)),
      catalog: this.catalog.map((c) => structuredClone(c)),
      route_table: { ...this.routeTable },
      runs: this.listRuns(),
      downgrades: this.listDowngrades(),
      flags: this.listFlags(),
      updated_at: nowIso(),
    };
  }

  hydrate(snap: CostGovernorSnapshot): void {
    this.budgets.clear();
    for (const b of snap.budgets) this.budgets.set(b.workflow_id, structuredClone(b));
    this.catalog = snap.catalog.map((c) => structuredClone(c));
    this.routeTable = { ...snap.route_table };
    this.runs = snap.runs.map((r) => structuredClone(r));
    this.downgrades = snap.downgrades.map((d) => structuredClone(d));
    this.flags = snap.flags.map((f) => structuredClone(f));
  }
}
