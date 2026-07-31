import { describe, expect, it } from "vitest";
import {
  addHarborScar,
  applyStanceDelta,
  dominantStance,
  groupScarsByChapter,
  hasIrreversible,
  recordIrreversible,
  recordNpcTalk,
  scarChapterTitle,
  scarTriggersChapterQuiet,
  stanceGreetingHint,
} from "./worldMemory";
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

describe("worldMemory", () => {
  it("locks irreversible choices forever", () => {
    let save = baseSave();
    save = recordIrreversible(save, "cove_save_vs_spend", {
      choiceId: "save",
      label: "Jar first",
      islandId: "coincraft_cove",
      at: "2026-01-01",
    });
    expect(hasIrreversible(save, "cove_save_vs_spend")).toBe(true);
    const again = recordIrreversible(save, "cove_save_vs_spend", {
      choiceId: "spend",
      label: "Should not overwrite",
      islandId: "coincraft_cove",
      at: "2026-01-02",
    });
    expect(again.irreversibleChoices?.cove_save_vs_spend?.choiceId).toBe("save");
  });

  it("tracks scars and stance", () => {
    let save = baseSave();
    save = addHarborScar(save, {
      id: "cove_saver_plaque",
      islandId: "coincraft_cove",
      choiceId: "save",
      label: "Jar before treat",
      kind: "plaque",
      createdAt: "2026-01-01",
    });
    save = { ...save, stance: applyStanceDelta(save.stance, "saver", 2) };
    expect(save.harborScars).toHaveLength(1);
    expect(dominantStance(save.stance)).toBe("saver");
    expect(stanceGreetingHint(save.stance)).toMatch(/jar|pouch/i);
  });

  it("remembers NPC talks", () => {
    let save = baseSave();
    save = recordNpcTalk(save, "coiny", "yes");
    save = recordNpcTalk(save, "coiny", "later");
    expect(save.npcMemory?.coiny?.talks).toBe(2);
    expect(save.npcMemory?.coiny?.lastChoiceIds).toEqual(["yes", "later"]);
  });

  it("groups plaques by chapter shelf", () => {
    const scars = [
      {
        id: "cove_saver_plaque",
        islandId: "coincraft_cove",
        choiceId: "a",
        label: "Cove jar",
        kind: "plaque" as const,
        createdAt: "1",
      },
      {
        id: "pp_protector_plaque",
        islandId: "paycheck_peninsula",
        choiceId: "b",
        label: "Umbrella",
        kind: "plaque" as const,
        createdAt: "2",
      },
      {
        id: "credit_patience_plaque",
        islandId: "credit_kingdom",
        choiceId: "c",
        label: "Waited",
        kind: "plaque" as const,
        createdAt: "3",
      },
    ];
    expect(scarChapterTitle(scars[0]!)).toBe("Coincraft Cove");
    expect(scarChapterTitle(scars[1]!)).toBe("Paycheck Peninsula");
    expect(scarChapterTitle(scars[2]!)).toBe("Credit Kingdom");
    const groups = groupScarsByChapter(scars);
    expect(groups.map((g) => g.chapter)).toEqual([
      "Coincraft Cove",
      "Paycheck Peninsula",
      "Credit Kingdom",
    ]);
    expect(scarTriggersChapterQuiet("pp_protector_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("cove_saver_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("credit_haste_plaque")).toBe(true);
  });
});
