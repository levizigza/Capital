/**
 * Tests for ENGAGEMENT · LEARNING · BUSINESS health dashboard + damage flags.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { AnalyticsEvent } from "../types";
import {
  analyzeHealthDashboard,
  evaluateHealthDamageFlags,
} from "./healthDashboard";
import {
  clearRetentionDaysForTests,
  resetFtueOnceGuards,
  resetFtueSessionStats,
} from "./ftue";

function ev(
  name: AnalyticsEvent["name"],
  elapsedMs: number,
  sessionId = "sess-1",
  extra: Record<string, unknown> = {},
): AnalyticsEvent {
  return {
    id: `e-${name}-${elapsedMs}-${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date(Date.now() + elapsedMs).toISOString(),
    name,
    payload: { sessionId, elapsedMs, ...extra },
  };
}

describe("health damage flags", () => {
  it("flags HIGH FUN / LOW LEARNING", () => {
    const flags = evaluateHealthDamageFlags({
      voluntaryPlay: 0.8,
      continuation: 0.7,
      independentTransfer: 0.2,
      returnRate: 0.5,
      hintDependency: 0.2,
      conversion: 0.1,
      failureRecovery: 0.8,
    });
    expect(flags.map((f) => f.id)).toContain("high_fun_low_learning");
  });

  it("flags HIGH LEARNING / LOW FUN", () => {
    const flags = evaluateHealthDamageFlags({
      voluntaryPlay: 0.2,
      continuation: 0.2,
      independentTransfer: 0.9,
      returnRate: 0.4,
      hintDependency: 0.1,
      conversion: 0.1,
      failureRecovery: 0.8,
    });
    expect(flags.map((f) => f.id)).toContain("high_learning_low_fun");
  });

  it("flags HIGH REVENUE / LOW TRUST", () => {
    const flags = evaluateHealthDamageFlags({
      voluntaryPlay: 0.5,
      continuation: 0.5,
      independentTransfer: 0.2,
      returnRate: 0.4,
      hintDependency: 0.2,
      conversion: 0.7,
      failureRecovery: 0.2,
    });
    expect(flags.map((f) => f.id)).toContain("high_revenue_low_trust");
  });

  it("flags HIGH RETENTION / HIGH HINT DEPENDENCY", () => {
    const flags = evaluateHealthDamageFlags({
      voluntaryPlay: 0.5,
      continuation: 0.5,
      independentTransfer: 0.5,
      returnRate: 0.8,
      hintDependency: 0.7,
      conversion: 0.2,
      failureRecovery: 0.6,
    });
    expect(flags.map((f) => f.id)).toContain("high_retention_high_hint_dependency");
  });

  it("stays quiet when categories are balanced", () => {
    const flags = evaluateHealthDamageFlags({
      voluntaryPlay: 0.5,
      continuation: 0.55,
      independentTransfer: 0.55,
      returnRate: 0.5,
      hintDependency: 0.2,
      conversion: 0.3,
      failureRecovery: 0.6,
    });
    expect(flags).toHaveLength(0);
  });
});

describe("analyzeHealthDashboard", () => {
  beforeEach(() => {
    resetFtueOnceGuards();
    resetFtueSessionStats();
    clearRetentionDaysForTests();
  });

  afterEach(() => {
    clearRetentionDaysForTests();
  });

  it("separates ENGAGEMENT LEARNING BUSINESS and never treats tutorial as learning success", () => {
    const events: AnalyticsEvent[] = [
      ev("ftue_started", 0),
      ev("session_started", 0),
      ev("first_complete_loop", 20_000),
      ev("freeplay_started", 30_000),
      ev("concept_introduced", 12_000, "sess-1", { concept_id: "earn_then_decide" }),
      ev("autonomy_unlocked", 40_000, "sess-1", { concept_id: "earn_then_decide", via: "independent" }),
      ev("transfer_started", 20_500),
      ev("transfer_success", 40_000),
      ev("failure", 15_000),
      ev("recovery", 18_000),
      ev("hint_requested", 16_000),
      ev("harbor_purchase", 35_000, "sess-1", { kind: "boat", price: 50 }),
      ev("tutorial_completed", 50_000),
    ];

    const dash = analyzeHealthDashboard(events);
    expect(dash.engagement.title).toBe("ENGAGEMENT");
    expect(dash.learning.title).toBe("LEARNING");
    expect(dash.business.title).toBe("BUSINESS");
    expect(dash.law).toMatch(/Never optimize one category/i);

    const engIds = dash.engagement.metrics.map((m) => m.id);
    expect(engIds).toEqual([
      "session_continuation",
      "return_rate",
      "voluntary_play",
      "session_duration",
    ]);

    const learnIds = dash.learning.metrics.map((m) => m.id);
    expect(learnIds).toEqual([
      "concept_mastery",
      "independent_transfer",
      "decision_improvement",
      "hint_dependency",
    ]);
    expect(learnIds).not.toContain("tutorial_completion");

    const biz = dash.business.metrics;
    expect(biz.find((m) => m.id === "conversion")?.value).toBe(1);
    expect(biz.find((m) => m.id === "revenue")?.value).toBe(50);
    expect(biz.find((m) => m.id === "paid_retention")?.value).toBeNull();
    expect(biz.find((m) => m.id === "cac")?.value).toBeNull();

    expect(dash.learning.metrics.find((m) => m.id === "independent_transfer")?.value).toBe(1);
    expect(dash.learning.metrics.find((m) => m.id === "concept_mastery")?.value).toBe(1);
  });
});
