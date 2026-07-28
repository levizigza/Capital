import { describe, expect, it } from "vitest";
import {
  bumpWeeklyTalk,
  localDayKey,
  localWeekKey,
  markPaydayDone,
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
});
