import { describe, expect, it } from "vitest";
import {
  ASHORE_VOYAGE_STEP,
  ashorePresenceLine,
  normalizeHubGuidedIntro,
  resolveAshoreCarpetBoot,
  shouldAutoOpenDailyRitual,
  shouldShowCastleCoach,
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

  it("hides Castle coach during Piggy presence (one surface)", () => {
    expect(
      shouldShowCastleCoach({ guidedStepId: "meet_guide", piggyPresence: true }),
    ).toBe(false);
    expect(
      shouldShowCastleCoach({ guidedStepId: "to_dock", piggyPresence: false }),
    ).toBe(true);
  });

  it("keeps presence copy short", () => {
    expect(ashorePresenceLine({ firstMeet: true })).toMatch(/^Talk to Piggy/);
    expect(ashorePresenceLine({ firstMeet: true }).length).toBeLessThan(64);
  });

  it("Daily Ritual waits until Cove Change (Memory organ)", () => {
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
    ).toBe(true);

    expect(
      shouldAutoOpenDailyRitual({
        save: afterCove,
        guidedActive: true,
        anyBlockingOverlay: false,
      }),
    ).toBe(false);

    const day2Echo = bareSave({
      hubGuidedIntro: { version: 1, step: "done", didDock: true },
      harborRitual: {
        ...ritualToday,
        today: {
          ...ritualToday.today,
          rumorId: "scar_echo_cove_saver_plaque",
          echoSurpriseSeen: false,
        },
      },
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
        save: day2Echo,
        guidedActive: false,
        anyBlockingOverlay: false,
      }),
    ).toBe(false);

    const spectaclePending = bareSave({
      hubGuidedIntro: { version: 1, step: "done", didDock: true },
      harborRitual: ritualToday,
      harborScars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          choiceId: "save",
          label: "Jar before treat",
          kind: "plaque",
          createdAt: "2026-08-03T12:00:00.000Z",
        },
      ],
      scarSpectacle: { shownForCount: 0 },
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
        save: spectaclePending,
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
