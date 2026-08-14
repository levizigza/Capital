import { describe, expect, it } from "vitest";
import {
  AiCostGovernor,
  CostGovernorError,
  DEFAULT_ROUTE_TABLE,
  checkLimits,
  evaluateDowngradeGate,
  failureAdjustedCost,
  routeTier,
  validateBudget,
} from "./index";
import type { EvalGate, WorkflowBudget } from "./types";

function budget(over: Partial<WorkflowBudget> = {}): WorkflowBudget {
  return {
    workflow_id: over.workflow_id ?? "wf_content_draft",
    model: over.model ?? "model-mid",
    maximum_tokens: over.maximum_tokens ?? 8_000,
    maximum_steps: over.maximum_steps ?? 12,
    maximum_tool_calls: over.maximum_tool_calls ?? 8,
    maximum_retries: over.maximum_retries ?? 2,
    maximum_runtime: over.maximum_runtime ?? 60_000,
    maximum_dollar_cost: over.maximum_dollar_cost ?? 1.5,
    fallback_behavior: over.fallback_behavior ?? "escalate_human",
    fallback_model: over.fallback_model,
  };
}

describe("budgets & limits", () => {
  it("requires all configurable budget fields", () => {
    const ok = validateBudget(budget());
    expect(ok.ok).toBe(true);
    expect(
      validateBudget(
        budget({ maximum_retries: 99, fallback_behavior: "switch_to_fallback_model" }),
      ).ok,
    ).toBe(false);
  });

  it("detects limit breaches", () => {
    const b = budget({ maximum_tokens: 100, maximum_dollar_cost: 0.5 });
    const breaches = checkLimits(b, {
      tokens: 200,
      steps: 1,
      tool_calls: 0,
      retries: 0,
      runtime_ms: 10,
      dollar_cost: 0.9,
    });
    expect(breaches.map((x) => x.limit)).toEqual(
      expect.arrayContaining(["maximum_tokens", "maximum_dollar_cost"]),
    );
  });
});

describe("model routing", () => {
  it("routes low/moderate/strategic-high to cost tiers", () => {
    expect(routeTier("low")).toBe("low_cost");
    expect(routeTier("moderate")).toBe("mid_tier");
    expect(routeTier("strategic")).toBe("high_capability");
    expect(routeTier("high")).toBe("high_capability");
    expect(DEFAULT_ROUTE_TABLE.moderate).toBe("mid_tier");
  });

  it("governor routes complexity to catalog models", () => {
    const gov = new AiCostGovernor();
    gov.registerBudget(budget({ model: "model-mid" }));
    expect(gov.route("wf_content_draft", "low").tier).toBe("low_cost");
    expect(gov.route("wf_content_draft", "low").model_id).toBe("model-low");
    expect(gov.route("wf_content_draft", "moderate").model_id).toBe("model-mid");
    expect(gov.route("wf_content_draft", "strategic").model_id).toBe("model-high");
  });
});

describe("eval-gated downgrade", () => {
  it("blocks downgrade without eval gate", () => {
    const decision = evaluateDowngradeGate(
      "wf_x",
      "model-high",
      "model-low",
      [
        { model_id: "model-low", tier: "low_cost", usd_per_1k_tokens: 0.05 },
        { model_id: "model-high", tier: "high_capability", usd_per_1k_tokens: 5 },
      ],
      null,
    );
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/evals/i);
  });

  it("allows downgrade only when eval thresholds pass", () => {
    const gov = new AiCostGovernor();
    gov.registerBudget(budget({ model: "model-high", workflow_id: "wf_down" }));
    const blocked = gov.proposeDowngrade("wf_down", "model-mid", null);
    expect(blocked.allowed).toBe(false);

    const gate: EvalGate = {
      eval_suite_id: "suite_draft_quality",
      model_under_test: "model-high",
      candidate_model: "model-mid",
      pass_rate: 0.92,
      min_pass_rate: 0.85,
      sample_size: 40,
      measured_at: "2026-08-14T00:00:00.000Z",
      evidence_refs: ["uri://evals/suite_draft_quality"],
    };
    const allowed = gov.proposeDowngrade("wf_down", "model-mid", gate);
    expect(allowed.allowed).toBe(true);
    expect(gov.getBudget("wf_down")?.model).toBe("model-mid");
  });

  it("rejects failing eval pass_rate", () => {
    const gov = new AiCostGovernor();
    gov.registerBudget(budget({ model: "model-high", workflow_id: "wf_fail_gate" }));
    const gate: EvalGate = {
      eval_suite_id: "suite_x",
      model_under_test: "model-high",
      candidate_model: "model-low",
      pass_rate: 0.5,
      min_pass_rate: 0.85,
      sample_size: 30,
      measured_at: "2026-08-14T00:00:00.000Z",
      evidence_refs: ["uri://evals/x"],
    };
    expect(gov.proposeDowngrade("wf_fail_gate", "model-low", gate).allowed).toBe(false);
  });
});

describe("tracking & value flags", () => {
  it("tracks cost/task, value/task, failure-adjusted cost, tokens, model comparison", () => {
    const gov = new AiCostGovernor();
    gov.registerBudget(budget({ workflow_id: "wf_track" }));
    gov.recordRun({
      workflow_id: "wf_track",
      task_id: "t1",
      complexity: "moderate",
      usage: {
        tokens: 1000,
        steps: 3,
        tool_calls: 1,
        retries: 0,
        runtime_ms: 1000,
        dollar_cost: 0.2,
      },
      success: true,
      business_value: 2,
    });
    gov.recordRun({
      workflow_id: "wf_track",
      task_id: "t2",
      complexity: "low",
      usage: {
        tokens: 500,
        steps: 2,
        tool_calls: 0,
        retries: 1,
        runtime_ms: 800,
        dollar_cost: 0.1,
      },
      success: false,
      business_value: 0,
      model_override: "model-low",
    });

    const stats = gov.statsFor("wf_track")!;
    expect(stats.cost_per_task).toBeCloseTo(0.15, 5);
    expect(stats.tokens_per_task).toBe(750);
    expect(stats.business_value_per_task).toBe(1);
    expect(stats.failure_adjusted_cost).toBe(
      failureAdjustedCost(0.15, stats.success_rate),
    );
    expect(stats.by_model.length).toBeGreaterThanOrEqual(1);
  });

  it("flags when AI cost grows faster than economic value", () => {
    const gov = new AiCostGovernor();
    gov.registerBudget(budget({ workflow_id: "wf_blowup" }));
    // first half: cheap + valuable
    for (let i = 0; i < 4; i++) {
      gov.recordRun({
        workflow_id: "wf_blowup",
        task_id: `a${i}`,
        complexity: "low",
        usage: {
          tokens: 100,
          steps: 1,
          tool_calls: 0,
          retries: 0,
          runtime_ms: 100,
          dollar_cost: 0.05,
        },
        success: true,
        business_value: 2,
      });
    }
    // second half: expensive + less value
    for (let i = 0; i < 4; i++) {
      gov.recordRun({
        workflow_id: "wf_blowup",
        task_id: `b${i}`,
        complexity: "strategic",
        usage: {
          tokens: 5000,
          steps: 5,
          tool_calls: 2,
          retries: 0,
          runtime_ms: 5000,
          dollar_cost: 2.5,
        },
        success: true,
        business_value: 0.5,
      });
    }
    const flags = gov.refreshFlags();
    expect(flags.some((f) => f.kind === "cost_grows_faster_than_value")).toBe(true);
    expect(flags[0]?.evidence.length).toBeGreaterThan(0);
  });

  it("applies fallback metadata on breach", () => {
    const gov = new AiCostGovernor();
    gov.registerBudget(
      budget({
        workflow_id: "wf_abort",
        maximum_dollar_cost: 0.1,
        fallback_behavior: "abort",
      }),
    );
    const run = gov.recordRun({
      workflow_id: "wf_abort",
      task_id: "t_cost",
      complexity: "moderate",
      usage: {
        tokens: 10,
        steps: 1,
        tool_calls: 0,
        retries: 0,
        runtime_ms: 10,
        dollar_cost: 1,
      },
      success: true,
      business_value: 1,
    });
    expect(run.breaches[0]?.limit).toBe("maximum_dollar_cost");
    expect(run.fallback_applied).toBe("abort");
    expect(run.success).toBe(false);
  });

  it("rejects unknown workflow", () => {
    const gov = new AiCostGovernor();
    expect(() =>
      gov.recordRun({
        workflow_id: "missing",
        task_id: "t",
        complexity: "low",
        usage: {
          tokens: 1,
          steps: 1,
          tool_calls: 0,
          retries: 0,
          runtime_ms: 1,
          dollar_cost: 0,
        },
        success: true,
      }),
    ).toThrow(CostGovernorError);
  });
});
