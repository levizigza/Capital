import { describe, expect, it } from "vitest";
import {
  bumpWeeklyTalk,
  localDayKey,
  localWeekKey,
  markPaydayDone,
  prepareDay2EchoSave,
  syncHarborRitual,
  weeklyShareText,
} from "./harborRitual";
import type { IslandSaveV1 } from "./types";

function baseSave(): IslandSaveV1 {
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
  };
}

describe("harborRitual", () => {
  it("syncs a new day with streak and weekly", () => {
    const day = new Date(2026, 6, 28);
    const save = syncHarborRitual(baseSave(), day);
    expect(save.harborRitual?.lastDayKey).toBe(localDayKey(day));
    expect(save.harborRitual?.streak).toBe(1);
    expect(save.harborRitual?.weekly?.weekKey).toBe(localWeekKey(day));
    expect(save.harborRitual?.today.paydayDone).toBe(false);
  });

  it("bumps talk weekly progress", () => {
    let save = syncHarborRitual(baseSave(), new Date(2026, 6, 28));
    save = {
      ...save,
      harborRitual: {
        ...save.harborRitual!,
        weekly: {
          weekKey: localWeekKey(new Date(2026, 6, 28)),
          id: "talk_three",
          progress: 0,
          target: 3,
        },
      },
    };
    save = bumpWeeklyTalk(save);
    save = bumpWeeklyTalk(save);
    save = bumpWeeklyTalk(save);
    expect(save.harborRitual?.weekly?.done).toBe(true);
    expect(weeklyShareText(save.harborRitual!.weekly!, "Sam")).toMatch(/Sam/);
  });

  it("marks payday for weekly one_payday", () => {
    let save = syncHarborRitual(baseSave());
    save = {
      ...save,
      harborRitual: {
        ...save.harborRitual!,
        weekly: {
          weekKey: "2026-W31",
          id: "one_payday",
          progress: 0,
          target: 1,
        },
      },
    };
    save = markPaydayDone(save);
    expect(save.harborRitual?.today.paydayDone).toBe(true);
    expect(save.harborRitual?.weekly?.done).toBe(true);
  });

  it("prepareDay2EchoSave backdates scar and rolls scar_echo rumor", () => {
    const now = new Date(2026, 6, 28);
    let save = syncHarborRitual(baseSave(), now);
    save = {
      ...save,
      harborScars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          choiceId: "cove_saver_plaque",
          label: "Jar before treat",
          kind: "plaque",
          createdAt: "2026-07-28T15:00:00.000Z",
        },
      ],
      harborHomecoming: {
        pending: true,
        celebrated: false,
        piggyTalked: false,
        quietPending: true,
        chapterIslandId: "coincraft_cove",
        questId: "q_cc_save_or_spend",
        message: "Piggy Penny: The Coin holds",
      },
    };
    save = prepareDay2EchoSave(save, now);
    expect(save.harborScars?.[0]?.createdAt.slice(0, 10)).toBe("2026-07-27");
    expect(save.harborRitual?.today.rumorId).toBe("scar_echo_cove_saver_plaque");
    expect(save.harborRitual?.today.echoSurpriseSeen).toBe(false);
    expect(save.harborHomecoming?.piggyTalked).toBe(true);
    expect(save.harborHomecoming?.pending).toBe(false);
  });
});
