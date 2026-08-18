import { describe, expect, it } from "vitest";
import {
  ASHORE_VOYAGE_STEP,
  ashorePresenceLine,
  normalizeHubGuidedIntro,
  resolveAshoreCarpetBoot,
  shouldAutoOpenDailyRitual,
  shouldForceTalkCta,
  shouldShowCastleCoach,
  shouldStripPlazaForPresence,
} from "./harborAshore";
import { advanceHubGuided, createDefaultHubGuidedIntro } from "./story/storyBible";
import type { IslandSaveV1 } from "./types";

function bareSave(over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    ...over,
  };
}

const ritualToday = {
  streak: 1,
  streakDays: 1,
  lastDayKey: "2026-08-02",
  today: {
    dayKey: "2026-08-02",
    greeted: false,
    rumorId: "r1",
    rumorSeen: false,
    paydayDone: false,
    rewardClaimed: false,
  },
};

describe("Harbor Ashore redesign", () => {
  it("critical path: Talk → voyage (to_dock), not Outfitter gate", () => {
    let g = createDefaultHubGuidedIntro();
    g = advanceHubGuided(g, "talked_guide");
    expect(g.step).toBe(ASHORE_VOYAGE_STEP);
    g = advanceHubGuided(g, "opened_map");
    expect(g.step).toBe("done");
    expect(g.didDock).toBe(true);
  });

  it("normalizes legacy Outfitter/Capsule gates onto voyage", () => {
    expect(normalizeHubGuidedIntro({ version: 1, step: "walk_outfitter" }).step).toBe(
      "to_dock",
    );
    expect(normalizeHubGuidedIntro({ version: 1, step: "tiny_spend" }).step).toBe("to_dock");
    expect(normalizeHubGuidedIntro({ version: 1, step: "meet_guide" }).step).toBe(
      "meet_guide",
    );
  });

  it("shows Castle coach during first meet and voyage, not after done or hush", () => {
    expect(
      shouldShowCastleCoach({ guidedStepId: "meet_guide", quietHomecoming: false }),
    ).toBe(true);
    expect(
      shouldShowCastleCoach({ guidedStepId: "to_dock", quietHomecoming: false }),
    ).toBe(true);
    expect(
      shouldShowCastleCoach({ guidedStepId: "meet_guide", quietHomecoming: true }),
    ).toBe(false);
    expect(
      shouldShowCastleCoach({ guidedStepId: "done", quietHomecoming: false }),
    ).toBe(false);
  });

  it("keeps first-meet plaza walkable; Talk CTA only when near Piggy", () => {
    expect(
      shouldStripPlazaForPresence({ firstMeet: true, quietHomecoming: false }),
    ).toBe(false);
    expect(
      shouldStripPlazaForPresence({ firstMeet: false, quietHomecoming: true }),
    ).toBe(true);
    expect(
      shouldForceTalkCta({ firstMeet: true, nearPiggy: false }),
    ).toBe(false);
    expect(
      shouldForceTalkCta({ firstMeet: true, nearPiggy: true }),
    ).toBe(true);
  });

  it("keeps presence copy short and walk-first", () => {
    expect(ashorePresenceLine({ firstMeet: true })).toMatch(/fountain/i);
    expect(ashorePresenceLine({ firstMeet: true })).not.toMatch(/^Talk to Piggy/);
    expect(ashorePresenceLine({ firstMeet: true }).length).toBeLessThan(80);
  });

  it("Daily Ritual never auto-opens as FTUE chrome", () => {
    const beforeCove = bareSave({
      hubGuidedIntro: { version: 1, step: "done", didDock: true },
      harborRitual: ritualToday,
    });
    expect(
      shouldAutoOpenDailyRitual({
        save: beforeCove,
        guidedActive: false,
        anyBlockingOverlay: false,
      }),
    ).toBe(false);

    const afterCove = bareSave({
      hubGuidedIntro: { version: 1, step: "done", didDock: true },
      harborRitual: ritualToday,
      questStatus: {
        q_cc_save_or_spend: {
          started: true,
          completed: true,
          completedObjectives: [],
        },
      },
    });
    expect(
      shouldAutoOpenDailyRitual({
        save: afterCove,
        guidedActive: false,
        anyBlockingOverlay: false,
      }),
    ).toBe(false);
  });

  it("carpet boot: ceremony starts meet_guide; mid-lap normalizes to voyage", () => {
    const done = resolveAshoreCarpetBoot({
      hubGuidedIntro: { version: 1, step: "done", didDock: true },
      harborHomecoming: { quietPending: true },
    });
    expect(done.hubGuidedIntro.step).toBe("meet_guide");
    expect(done.clearQuietPending).toBe(true);

    const fresh = resolveAshoreCarpetBoot({});
    expect(fresh.hubGuidedIntro.step).toBe("meet_guide");

    const mid = resolveAshoreCarpetBoot({
      hubGuidedIntro: { version: 1, step: "walk_outfitter" },
    });
    expect(mid.hubGuidedIntro.step).toBe("to_dock");
  });
});
