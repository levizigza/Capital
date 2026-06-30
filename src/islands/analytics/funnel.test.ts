import { describe, expect, it } from "vitest";

import type { AnalyticsEvent } from "../types";

import { analyzeFunnel, FUNNEL_STAGES } from "./funnel";

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

describe("analyzeFunnel", () => {
  it("computes stage reach and drop-off for a full onboarding session", () => {
    const events: AnalyticsEvent[] = [
      ev("session_started", 0),
      ev("screen_enter", 1000, "sess-1", { screen: "islands_hub" }),
      ev("screen_enter", 5000, "sess-1", { screen: "islands_travel" }),
      ev("island_entered", 8000, "sess-1", { islandId: "coincraft_cove" }),
      ev("dialogue_started", 12000, "sess-1", { npcId: "npc_captain_penny" }),
      ev("quest_started", 15000, "sess-1", { questId: "q_cc_first_coins" }),
      ev("minigame_started", 20000, "sess-1", { minigameId: "mg_coin_sort" }),
      ev("minigame_completed", 90000, "sess-1", { success: true }),
      ev("tutorial_completed", 95000, "sess-1", { questId: "q_cc_first_coins" }),
    ];

    const result = analyzeFunnel(events);
    expect(result.sessionsInWindow).toBe(1);
    expect(result.stages.find((s) => s.id === "tutorial")?.reached).toBe(1);
    expect(result.stages.find((s) => s.id === "hub")?.reached).toBe(1);
  });

  it("identifies drop-off screen within first 5 minutes", () => {
    const events: AnalyticsEvent[] = [
      ev("session_started", 0),
      ev("screen_enter", 500, "sess-2", { screen: "islands_hub" }),
      ev("screen_exit", 3000, "sess-2", { screen: "islands_hub", reason: "navigate" }),
      ev("screen_enter", 3100, "sess-2", { screen: "islands_travel" }),
      ev("screen_exit", 45000, "sess-2", { screen: "islands_travel", reason: "app_exit" }),
    ];

    const result = analyzeFunnel(events);
    expect(result.dropOffPoints.some((d) => d.screen === "islands_travel")).toBe(true);
    expect(result.sessions[0]?.quitWithin5Min).toBe(true);
    expect(result.sessions[0]?.lastScreen).toBe("islands_travel");
  });

  it("has one stage per funnel definition", () => {
    const result = analyzeFunnel([]);
    expect(result.stages).toHaveLength(FUNNEL_STAGES.length);
  });
});
