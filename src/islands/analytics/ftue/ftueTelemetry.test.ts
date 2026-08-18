/**
 * Privacy-conscious FTUE telemetry — event names, segments, and payload contracts.
 * Tests for docs/design/LEARNING_TELEMETRY.md · docs/ftue/FTUE_TELEMETRY.md
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { AnalyticsEvent } from "../../types";
import {
  assertNoPiiInPayload,
  sanitizeFtuePayload,
  analyzeFtueMetrics,
  computeRetentionRates,
  FTUE_PRIMARY_METRICS,
  FTUE_PAYLOAD_ALLOWLIST,
  resetFtueOnceGuards,
  resetFtueSessionStats,
  clearRetentionDaysForTests,
  recordRetentionDay,
  localDayKey,
  trackConceptLifecycleFtue,
  primaryMetricValues,
} from "./index";
import { createDefaultIslandSave } from "../../save";
import { applyConceptSync } from "../../conceptProgression";
import { HARBOR_HAVEN_ID } from "../../islandIds";

function ev(
  name: AnalyticsEvent["name"],
  elapsedMs: number,
  sessionId = "sess-1",
  extra: Record<string, unknown> = {},
): AnalyticsEvent {
  return {
    id: `e-${name}-${elapsedMs}`,
    ts: new Date(Date.now() + elapsedMs).toISOString(),
    name,
    payload: { sessionId, elapsedMs, ...extra },
  };
}

describe("FTUE telemetry privacy", () => {
  it("strips blocked PII and freeform keys", () => {
    const safe = sanitizeFtuePayload({
      concept_id: "earn_then_decide",
      name: "Secret Player",
      email: "x@y.com",
      text: "long dialogue body",
      choiceId: "cove_save",
      instruction: "should drop",
      evil_custom: "drop me",
      dwellMs: 1200,
    });
    expect(safe.concept_id).toBe("earn_then_decide");
    expect(safe.choiceId).toBe("cove_save");
    expect(safe.dwellMs).toBe(1200);
    expect(safe.name).toBeUndefined();
    expect(safe.email).toBeUndefined();
    expect(safe.text).toBeUndefined();
    expect(safe.instruction).toBeUndefined();
    expect(safe.evil_custom).toBeUndefined();
    expect(assertNoPiiInPayload(safe)).toBe(true);
  });

  it("rejects non-taxonomy ids", () => {
    const safe = sanitizeFtuePayload({
      concept_id: "Earn Then Decide!!!",
      questId: "q_cc_first_coins",
    });
    expect(safe.concept_id).toBeUndefined();
    expect(safe.questId).toBe("q_cc_first_coins");
  });

  it("allowlist covers segment keys", () => {
    for (const key of [
      "ftue_version",
      "experiment_id",
      "experiment_variant",
      "platform",
      "experience_mode",
      "skip_status",
      "hint_usage",
      "failure_pattern",
      "concept_id",
    ]) {
      expect(FTUE_PAYLOAD_ALLOWLIST.has(key)).toBe(true);
    }
  });
});

describe("Learning metrics", () => {
  beforeEach(() => {
    resetFtueOnceGuards();
    resetFtueSessionStats();
    clearRetentionDaysForTests();
  });

  afterEach(() => {
    clearRetentionDaysForTests();
  });

  it("computes Measure set without treating tutorial as primary", () => {
    const events: AnalyticsEvent[] = [
      ev("ftue_started", 0),
      ev("first_control_received", 2_000),
      ev("first_meaningful_decision", 10_000, "sess-1", { choiceId: "cove_save" }),
      ev("decision_selected", 10_000, "sess-1", { choiceId: "cove_save" }),
      ev("decision_selected", 55_000, "sess-1", { choiceId: "cove_spend" }),
      ev("first_complete_loop", 25_000),
      ev("consequence_displayed", 25_000, "sess-1", { via: "first_consequence_marker" }),
      ev("concept_introduced", 12_000, "sess-1", { concept_id: "earn_then_decide" }),
      ev("concept_practiced", 20_000, "sess-1", { concept_id: "earn_then_decide" }),
      ev("transfer_started", 20_500, "sess-1", { concept_id: "earn_then_decide" }),
      ev("transfer_success", 40_000, "sess-1", { concept_id: "earn_then_decide" }),
      ev("failure", 15_000),
      ev("recovery", 18_000),
      ev("freeplay_started", 30_000),
      ev("ai_intervention", 16_000, "sess-1", { via: "stuck" }),
      ev("tutorial_completed", 50_000),
    ];

    const snap = analyzeFtueMetrics(events);
    expect(snap.time_to_first_action_ms).toBe(2_000);
    expect(snap.time_to_first_decision_ms).toBe(10_000);
    expect(snap.time_to_first_complete_loop_ms).toBe(25_000);
    expect(snap.time_to_first_core_loop_ms).toBe(25_000);
    expect(snap.guided_success_rate).toBe(1);
    expect(snap.independent_transfer_rate).toBe(1);
    expect(snap.failure_recovery_rate).toBe(1);
    expect(snap.freeplay_conversion).toBe(1);
    expect(snap.strategy_diversity).toBe(1); // 2 unique / 2 decisions
    expect(snap.tutorial_completion_rate).toBe(1);

    const primary = FTUE_PRIMARY_METRICS;
    expect(primary[0]).toBe("independent_transfer_rate");
    expect(primary).toContain("time_to_first_complete_loop");
    expect(primary).toContain("strategy_diversity");
    expect(primary).toContain("d1_retention");
    expect(primary).toContain("d7_retention");
    expect(primary).toContain("d30_retention");
    expect(primary).not.toContain("tutorial_completion_rate" as never);

    const values = primaryMetricValues(snap);
    expect(values.independent_transfer_rate).toBe(1);
    expect(values.strategy_diversity).toBe(1);
  });

  it("accepts legacy event aliases in metrics", () => {
    const events: AnalyticsEvent[] = [
      ev("ftue_started", 0),
      ev("decision_committed", 8_000, "sess-1", { choiceId: "a" }),
      ev("consequence_displayed", 20_000),
      ev("failure_occurred", 12_000),
      ev("retry_successful", 14_000),
      ev("freeplay_entered", 22_000),
      ev("transfer_started", 15_000),
      ev("transfer_success", 18_000),
    ];
    const snap = analyzeFtueMetrics(events);
    expect(snap.time_to_first_decision_ms).toBe(8_000);
    expect(snap.time_to_first_complete_loop_ms).toBe(20_000);
    expect(snap.failure_recovery_rate).toBe(1);
    expect(snap.freeplay_conversion).toBe(1);
    expect(snap.independent_transfer_rate).toBe(1);
  });

  it("computes D1 retention from local day keys", () => {
    const first = "2026-01-01";
    const d1 = "2026-01-02";
    const rates = computeRetentionRates([first, d1], [1, 7, 30], "2026-01-10");
    expect(rates.d1_retention).toBe(1);
    expect(rates.d7_retention).toBe(0);
    expect(rates.d30_retention).toBeNull();
  });

  it("records retention day without user ids", () => {
    const days = recordRetentionDay(Date.parse("2026-08-18T12:00:00Z"));
    expect(days.some((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true);
    expect(localDayKey(Date.parse("2026-08-18T12:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("concept lifecycle FTUE", () => {
  it("runs phase-diff tracking without requiring tutorial shell complete", () => {
    let before = createDefaultIslandSave();
    before = {
      ...before,
      onboardingComplete: false,
      hubGuidedIntro: { version: 1, step: "done", didMeetGuide: true, didDock: true },
      discovered: {
        npcs: [],
        items: [],
        areas: [],
        islands: [HARBOR_HAVEN_ID, "coincraft_cove"],
      },
      questStatus: {},
    };
    const after = applyConceptSync({
      ...before,
      questStatus: {
        q_cc_first_coins: { started: true, completed: false, completedObjectives: [] },
      },
    });
    expect(() => trackConceptLifecycleFtue(before, after)).not.toThrow();
  });
});
