import { describe, expect, it } from "vitest";
import {
  boundedIndexFromKey,
  bumpWeeklyTalk,
  localDayKey,
  localWeekKey,
  markPaydayDone,
  pickDailyRumor,
  prepareDay2EchoSave,
  syncHarborRitual,
  weeklyShareText,
} from "./harborRitual";
import { addHarborScar } from "./worldMemory";
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
  it("bounds ritual picks from day/week keys (#70) — deterministic, no Math.random", () => {
    expect(boundedIndexFromKey("2026-08-17", 5)).toBe(boundedIndexFromKey("2026-08-17", 5));
    expect(boundedIndexFromKey("2026-08-17", 5)).not.toBe(boundedIndexFromKey("2026-08-18", 5));
    const a = pickDailyRumor(baseSave(), "2026-08-17");
    const b = pickDailyRumor(baseSave(), "2026-08-17");
    expect(a.id).toBe(b.id);
    expect(a.text).toBe(b.text);
  });

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

  it("day-2 Soft Beat can echo digression gossip when no overnight plaque", () => {
    const dayKey = "2026-07-29";
    const save = {
      ...baseSave(),
      harborScars: [
        {
          id: "pp_tip_plan",
          islandId: "paycheck_peninsula",
          choiceId: "pri_plan",
          label: "Planned buckets before tipping",
          kind: "npc_tone" as const,
          createdAt: "2026-07-28T12:00:00.000Z",
        },
      ],
    };
    const rumor = pickDailyRumor(save, dayKey);
    expect(rumor.id).toBe("scar_echo_pp_tip_plan");
    expect(rumor.text).toMatch(/whispers|echo/i);
  });

  it("fires scar_echo on same calendar day when pendingScarSessionEcho is set", () => {
    const dayKey = "2026-08-19";
    let save = baseSave();
    save = addHarborScar(save, {
      id: "cove_jar",
      islandId: "coincraft_cove",
      choiceId: "save",
      label: "Jar before treat",
      kind: "plaque",
      createdAt: `${dayKey}T14:00:00.000Z`,
    });
    save = { ...save, pendingScarSessionEcho: true };
    const rumor = pickDailyRumor(save, dayKey);
    expect(rumor.id).toMatch(/^scar_echo_/);
    expect(rumor.text).toMatch(/Coin|jar|treat/i);
  });
});
