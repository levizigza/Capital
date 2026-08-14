import { describe, expect, it } from "vitest";
import {
  AiEvalError,
  AiEvalFramework,
  DEFAULT_FAILURE_THRESHOLDS,
  EVAL_METRICS,
  computeWorkerMetrics,
  validateThresholds,
} from "./index";
import type { WorkerAttemptOutcome } from "./framework";

function okOutcome(over: Partial<WorkerAttemptOutcome> = {}): WorkerAttemptOutcome {
  return {
    outputs: { text: "ok" },
    tools_used: over.tools_used ?? [
      { tool: "search", ok: true, at: "2026-08-14T00:00:00.000Z" },
    ],
    actions_taken: over.actions_taken ?? [
      { kind: "draft", at: "2026-08-14T00:00:00.000Z", detail: "drafted" },
    ],
    approvals: over.approvals ?? [],
    cost: over.cost ?? { tokens_in: 100, tokens_out: 50, cost: 0.01, currency: "USD" },
    result: over.result ?? "success",
    error_message: over.error_message,
    latency_ms: over.latency_ms ?? 200,
    human_corrected: over.human_corrected,
    hallucination_flagged: over.hallucination_flagged,
    accuracy: over.accuracy ?? 1,
    business_value: over.business_value ?? 10,
  };
}

describe("catalog & thresholds", () => {
  it("lists all required eval metrics", () => {
    expect(EVAL_METRICS).toEqual([
      "task_completion_rate",
      "accuracy",
      "human_correction_rate",
      "hallucination_rate",
      "tool_failure_rate",
      "retry_rate",
      "average_latency",
      "tokens_per_task",
      "cost_per_task",
      "escalation_rate",
      "business_value_created",
    ]);
  });

  it("rejects indefinite / unbounded max_retries", () => {
    expect(
      validateThresholds({
        ...DEFAULT_FAILURE_THRESHOLDS,
        max_retries: Number.POSITIVE_INFINITY,
      }).ok,
    ).toBe(false);
    expect(
      validateThresholds({
        ...DEFAULT_FAILURE_THRESHOLDS,
        max_retries: 99,
      }).ok,
    ).toBe(false);
    expect(validateThresholds(DEFAULT_FAILURE_THRESHOLDS).ok).toBe(true);
  });
});

describe("AiEvalFramework", () => {
  it("stores full audit trails on success", async () => {
    const fw = new AiEvalFramework();
    fw.registerWorker({
      worker_id: "worker_voc",
      escalation_target: "human:founder",
      thresholds: { ...DEFAULT_FAILURE_THRESHOLDS, max_retries: 1 },
    });

    const result = await fw.runTask(
      "worker_voc",
      {
        task_id: "task_1",
        input: { q: "summarize" },
        context_references: ["mem:voc_1", "doc:playbook"],
      },
      async () =>
        okOutcome({
          approvals: [
            {
              id: "ap1",
              approver: "founder",
              at: "2026-08-14T00:00:01.000Z",
              note: "ok to draft",
            },
          ],
        }),
    );

    expect(result.status).toBe("success");
    expect(result.audits).toHaveLength(1);
    const a = result.audits[0]!;
    expect(a.input).toEqual({ q: "summarize" });
    expect(a.context_references).toEqual(["mem:voc_1", "doc:playbook"]);
    expect(a.tools_used.length).toBe(1);
    expect(a.actions_taken.length).toBe(1);
    expect(a.outputs).toEqual({ text: "ok" });
    expect(a.approvals).toHaveLength(1);
    expect(a.cost.cost).toBe(0.01);
    expect(a.result).toBe("success");
  });

  it("STOP → preserve → document → escalate when max_retries exceeded", async () => {
    const fw = new AiEvalFramework();
    fw.registerWorker({
      worker_id: "worker_retry",
      escalation_target: "human:ops",
      thresholds: {
        ...DEFAULT_FAILURE_THRESHOLDS,
        max_retries: 1,
        max_consecutive_errors: 10,
      },
    });

    let calls = 0;
    const result = await fw.runTask(
      "worker_retry",
      {
        task_id: "task_fail",
        input: { x: 1 },
        context_references: ["ctx:a"],
        working_memory: { step: 2 },
      },
      async () => {
        calls++;
        return okOutcome({
          result: "failed",
          error_message: "boom",
          business_value: 0,
          accuracy: 0,
        });
      },
    );

    expect(calls).toBe(2); // initial + 1 retry — not indefinite
    expect(result.status).toBe("escalated");
    expect(result.failure).not.toBeNull();
    expect(result.failure?.reason).toMatch(/max_retries/);
    expect(result.preserved?.working_memory).toEqual({ step: 2 });
    expect(result.escalation?.escalation_target).toBe("human:ops");
    expect(result.escalation?.preserved_state_ref).toBe(result.preserved!.id);
    expect(result.escalation?.failure_doc_id).toBe(result.failure!.id);
    expect(fw.isStopped("worker_retry")).toBe(true);

    await expect(
      fw.runTask(
        "worker_retry",
        { task_id: "task_2", input: {}, context_references: [] },
        async () => okOutcome(),
      ),
    ).rejects.toThrow(/STOPPED/i);

    fw.clearStop("worker_retry", "founder");
    expect(fw.isStopped("worker_retry")).toBe(false);
  });

  it("stops on max_consecutive_errors within a task retry loop", async () => {
    const fw = new AiEvalFramework();
    fw.registerWorker({
      worker_id: "worker_streak",
      escalation_target: "human:ops",
      thresholds: {
        ...DEFAULT_FAILURE_THRESHOLDS,
        max_retries: 5, // enough room that consecutive_errors trips first
        max_consecutive_errors: 2,
      },
    });

    let calls = 0;
    const result = await fw.runTask(
      "worker_streak",
      { task_id: "t_streak", input: {}, context_references: [] },
      async () => {
        calls++;
        return okOutcome({
          result: "failed",
          error_message: "nope",
          business_value: null,
        });
      },
    );

    expect(calls).toBe(2);
    expect(result.status).toBe("escalated");
    expect(result.failure?.reason).toMatch(/max_consecutive_errors/);
    expect(fw.isStopped("worker_streak")).toBe(true);
  });

  it("refuses Infinite max_retries at registration", () => {
    const fw = new AiEvalFramework();
    expect(() =>
      fw.registerWorker({
        worker_id: "bad",
        escalation_target: "human:ops",
        thresholds: {
          ...DEFAULT_FAILURE_THRESHOLDS,
          max_retries: Number.POSITIVE_INFINITY as unknown as number,
        },
      }),
    ).toThrow(AiEvalError);
  });

  it("computes all worker metrics from audits", async () => {
    const fw = new AiEvalFramework();
    fw.registerWorker({
      worker_id: "worker_metrics",
      escalation_target: "human:ops",
      thresholds: { ...DEFAULT_FAILURE_THRESHOLDS, max_retries: 0 },
    });

    await fw.runTask(
      "worker_metrics",
      { task_id: "m1", input: {}, context_references: ["c1"] },
      async () =>
        okOutcome({
          human_corrected: true,
          hallucination_flagged: false,
          accuracy: 0.9,
          business_value: 5,
          tools_used: [
            { tool: "a", ok: true, at: "2026-08-14T00:00:00.000Z" },
            { tool: "b", ok: false, at: "2026-08-14T00:00:00.000Z" },
          ],
        }),
    );

    // clear stop if any from tool rates — tool failure 50% may breach default 0.25
    // Use higher threshold for this test worker
    fw.clearStop("worker_metrics", "founder");
    // Actually first success might have triggered metric breach stop. Re-register.
    const fw2 = new AiEvalFramework();
    fw2.registerWorker({
      worker_id: "worker_metrics2",
      escalation_target: "human:ops",
      thresholds: {
        ...DEFAULT_FAILURE_THRESHOLDS,
        max_retries: 0,
        max_tool_failure_rate: 1,
        max_hallucination_rate: 1,
      },
    });
    await fw2.runTask(
      "worker_metrics2",
      { task_id: "m1", input: {}, context_references: ["c1"] },
      async () =>
        okOutcome({
          human_corrected: true,
          accuracy: 0.9,
          business_value: 5,
          tools_used: [
            { tool: "a", ok: true, at: "2026-08-14T00:00:00.000Z" },
            { tool: "b", ok: false, at: "2026-08-14T00:00:00.000Z" },
          ],
        }),
    );
    await fw2.runTask(
      "worker_metrics2",
      { task_id: "m2", input: {}, context_references: [] },
      async () =>
        okOutcome({
          hallucination_flagged: true,
          accuracy: 0.5,
          business_value: 2,
          latency_ms: 400,
        }),
    );

    const m = fw2.metricsFor("worker_metrics2");
    expect(m.task_completion_rate).toBe(1);
    expect(m.accuracy).toBe(0.7);
    expect(m.human_correction_rate).toBe(0.5);
    expect(m.hallucination_rate).toBe(0.5);
    expect(m.tool_failure_rate).toBeGreaterThan(0);
    expect(m.average_latency).toBeGreaterThan(0);
    expect(m.tokens_per_task).toBeGreaterThan(0);
    expect(m.cost_per_task).toBeGreaterThan(0);
    expect(m.business_value_created).toBe(7);
    expect(m.escalation_rate).toBe(0);

    // Direct compute covers retry_rate path
    const audits = fw2.listAudits();
    const snap = computeWorkerMetrics("worker_metrics2", audits);
    expect(snap.retry_rate).toBe(0);
  });

  it("serialize preserves policy and audits", async () => {
    const fw = new AiEvalFramework();
    fw.registerWorker({
      worker_id: "worker_ser",
      escalation_target: "human:ops",
      thresholds: { ...DEFAULT_FAILURE_THRESHOLDS, max_tool_failure_rate: 1 },
    });
    await fw.runTask(
      "worker_ser",
      { task_id: "s1", input: { a: 1 }, context_references: ["r"] },
      async () => okOutcome(),
    );
    const snap = fw.serialize();
    expect(snap.policy).toBe("no_indefinite_retry_stop_preserve_escalate");
    expect(snap.audits[0]?.context_references).toEqual(["r"]);
  });
});
