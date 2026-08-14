import { describe, expect, it } from "vitest";
import {
  ANALYTICS_BANNED_KEYS,
  assertNoBannedKeys,
  scrubAnalyticsPayload,
} from "./privacy";
import { featureFromHubModal } from "./schemas";
import { GAME_METRIC_INVESTIGATIONS, metricForEvent } from "./gameMetrics";

describe("analytics privacy scrub", () => {
  it("strips banned PII / free-text keys", () => {
    const scrubbed = scrubAnalyticsPayload({
      sessionId: "s1",
      elapsedMs: 1200,
      islandId: "coincraft_cove",
      name: "Sam",
      email: "sam@example.com",
      label: "Jar before treat",
      message: "Piggy says hello",
      choiceId: "save",
      nested: { playerName: "Alex", strategyId: "protect" },
    });
    expect(scrubbed.sessionId).toBe("s1");
    expect(scrubbed.islandId).toBe("coincraft_cove");
    expect(scrubbed.choiceId).toBe("save");
    expect(scrubbed.name).toBeUndefined();
    expect(scrubbed.email).toBeUndefined();
    expect(scrubbed.label).toBeUndefined();
    expect(scrubbed.message).toBeUndefined();
    expect((scrubbed.nested as Record<string, unknown>).strategyId).toBe("protect");
    expect((scrubbed.nested as Record<string, unknown>).playerName).toBeUndefined();
    expect(assertNoBannedKeys(scrubbed)).toEqual([]);
  });

  it("lists known banned keys for docs / audits", () => {
    expect(ANALYTICS_BANNED_KEYS).toContain("email");
    expect(ANALYTICS_BANNED_KEYS).toContain("label");
  });
});

describe("game metrics catalog", () => {
  it("covers every instrumented investigation area", () => {
    const ids = GAME_METRIC_INVESTIGATIONS.map((m) => m.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "session_length",
        "onboarding_completion",
        "core_loop_repetitions",
        "failure_locations",
        "success_locations",
        "resource_flows",
        "strategy_selection",
        "feature_usage",
        "abandonment_points",
        "progression_velocity",
        "decision_frequency",
        "retries",
        "system_interactions",
      ]),
    );
    for (const m of GAME_METRIC_INVESTIGATIONS) {
      expect(m.question.endsWith("?")).toBe(true);
      expect(m.investigateWhen.length).toBeGreaterThan(10);
      expect(m.events.length).toBeGreaterThan(0);
    }
  });

  it("maps new stable events to investigations", () => {
    expect(metricForEvent("core_loop_cycle").some((m) => m.id === "core_loop_repetitions")).toBe(
      true,
    );
    expect(metricForEvent("resource_delta").some((m) => m.id === "resource_flows")).toBe(true);
    expect(metricForEvent("abandon_point").some((m) => m.id === "abandonment_points")).toBe(true);
  });
});

describe("featureFromHubModal", () => {
  it("maps Harbor modals to stable feature ids", () => {
    expect(featureFromHubModal("memory")).toBe("memory_plinth");
    expect(featureFromHubModal("family")).toBe("family_room");
    expect(featureFromHubModal("capsule")).toBe("capsule_stall");
    expect(featureFromHubModal(null)).toBeNull();
  });
});
