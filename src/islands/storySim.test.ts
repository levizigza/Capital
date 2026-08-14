import { describe, expect, it } from "vitest";
import {
  appendStoryEvent,
  buildStoryTimeline,
  detectStoryChains,
  storyBeats,
  STORY_LOG_CAP,
} from "./storySim";
import { createDefaultIslandSave } from "./save";

describe("storySim — emergent chains", () => {
  it("appends events newest-first and caps the log", () => {
    let save = createDefaultIslandSave();
    for (let i = 0; i < STORY_LOG_CAP + 5; i++) {
      save = appendStoryEvent(save, storyBeats.passedDeal(`Deal ${i}`));
    }
    expect(save.storyLog?.length).toBe(STORY_LOG_CAP);
  });

  it("detects Debt Trap → Collector → Bailout chain", () => {
    const base = Date.now();
    const events = [
      {
        ...storyBeats.collectorBlocked("harbor_haven"),
        id: "e3",
        ts: new Date(base + 3000).toISOString(),
      },
      {
        ...storyBeats.collectorHit(-12, "harbor_haven"),
        id: "e2",
        ts: new Date(base + 2000).toISOString(),
      },
      {
        ...storyBeats.debtTrap("Snack Tab", 8, "liability_snack_tab", "harbor_haven"),
        id: "e1",
        ts: new Date(base + 1000).toISOString(),
      },
    ];
    // log is newest-first
    const chains = detectStoryChains(events);
    expect(chains.length).toBeGreaterThan(0);
    const best = chains[0]!;
    expect(best.stages.ACTION).toBe("e1");
    expect(best.headline.toLowerCase()).toMatch(/debt|collector|save/);
    expect(best.retell).toMatch(/Debt Trap/);
  });

  it("detects deal → shortfall → streak break (Freedom chase drama)", () => {
    const base = Date.now();
    const events = [
      {
        ...storyBeats.streakBroke("harbor_haven"),
        id: "e3",
        ts: new Date(base + 3000).toISOString(),
      },
      {
        ...storyBeats.payday(-5, 0, false, "harbor_haven"),
        id: "e2",
        ts: new Date(base + 2000).toISOString(),
      },
      {
        ...storyBeats.acceptedDeal("Lemonade Stand", 48, 12, "asset_lemonade_stand", "harbor_haven"),
        id: "e1",
        ts: new Date(base + 1000).toISOString(),
      },
    ];
    const chains = detectStoryChains(events);
    expect(chains.some((c) => c.headline.toLowerCase().includes("deal") || c.retell.includes("Lemonade"))).toBe(
      true,
    );
  });

  it("buildStoryTimeline surfaces a retell players can quote", () => {
    let save = createDefaultIslandSave();
    const base = Date.now();
    save = appendStoryEvent(save, {
      ...storyBeats.acceptedDeal("Shell Booth", 40, 10, "asset_shell_booth"),
      ts: new Date(base).toISOString(),
    });
    save = appendStoryEvent(save, {
      ...storyBeats.payday(30, 3, true),
      ts: new Date(base + 5000).toISOString(),
    });
    const timeline = buildStoryTimeline(save);
    expect(timeline.entries.length).toBeGreaterThanOrEqual(2);
    expect(timeline.bestRetell).toBeTruthy();
    expect(timeline.bestRetell!).toMatch(/Freedom|Shell|Pay Day/i);
  });

  it("does not invent chains from a single lonely beat", () => {
    const events = [
      {
        ...storyBeats.passedDeal("Interest Jar"),
        id: "lonely",
        ts: new Date().toISOString(),
      },
    ];
    expect(detectStoryChains(events)).toHaveLength(0);
  });
});
