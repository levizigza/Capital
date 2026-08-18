import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  analyzeFtueFunnel,
  FTUE_STEP_COUNT,
  FTUE_STEPS,
  FTUE_STORAGE_COMPLETE,
  FTUE_STORAGE_DISMISSED,
} from "./ftueTelemetry";
import type { AnalyticsEvent } from "./types";

describe("ftueTelemetry", () => {
  const src = readFileSync(join(__dirname, "ftueTelemetry.ts"), "utf8");

  it("exposes seven instrumented beats", () => {
    expect(FTUE_STEP_COUNT).toBe(7);
    expect(FTUE_STEPS.map((s) => s.id)).toEqual([
      "goal",
      "walk",
      "economy",
      "decision",
      "consequence",
      "reward",
      "deeper",
    ]);
  });

  it("gates veteran skip on complete/dismiss flags and skipTeach query", () => {
    expect(src).toMatch(/skipTeach/);
    expect(src).toMatch(FTUE_STORAGE_COMPLETE);
    expect(src).toMatch(FTUE_STORAGE_DISMISSED);
    expect(src).toMatch(/export function shouldSkipAshoreTeach/);
    expect(src).toMatch(/ftue_step_started/);
    expect(src).toMatch(/ftue_step_completed/);
    expect(src).toMatch(/ftue_step_retry/);
    expect(src).toMatch(/ftue_abandoned/);
    expect(src).toMatch(/core_loop_first_success/);
  });

  it("analyzes start/complete/time/retries/abandon/core-loop", () => {
    const events: AnalyticsEvent[] = [
      { id: "a", ts: "t0", name: "ftue_started", payload: {} },
      { id: "b", ts: "t1", name: "ftue_step_started", payload: { stepId: "walk" } },
      { id: "c", ts: "t2", name: "ftue_step_retry", payload: { stepId: "walk" } },
      {
        id: "d",
        ts: "t3",
        name: "ftue_step_completed",
        payload: { stepId: "walk", durationMs: 12000, retries: 1 },
      },
      {
        id: "e",
        ts: "t4",
        name: "ftue_abandoned",
        payload: { stepId: "economy" },
      },
      { id: "f", ts: "t5", name: "core_loop_first_success", payload: {} },
    ];
    const a = analyzeFtueFunnel(events);
    expect(a.started).toBe(1);
    expect(a.completed).toBe(0);
    expect(a.abandoned).toBe(1);
    expect(a.coreLoopFirstSuccess).toBe(1);
    expect(a.steps.find((s) => s.stepId === "walk")?.retries).toBe(1);
    expect(a.steps.find((s) => s.stepId === "walk")?.avgDurationMs).toBe(12000);
    expect(a.abandonmentPoints[0]?.stepId).toBe("economy");
  });
});
