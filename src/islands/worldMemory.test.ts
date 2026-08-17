import { describe, expect, it } from "vitest";
import {
  addHarborScar,
  applyStanceDelta,
  coldOrganKidSentence,
  coldRetellLine,
  coldSpectacleHeadline,
  day2EchoBody,
  dominantStance,
  groupScarsByChapter,
  harborScarPlaques,
  harborTalkScars,
  hasIrreversible,
  isDigressionScar,
  nextPaintingAfterScar,
  organQuietBadge,
  organSuitVerb,
  organTakeHushLine,
  organVerbChip,
  piggyScarWeightLine,
  plaqueShelfLine,
  plazaScarGossipLine,
  aliveStreetLinePool,
  pickRotatingAliveStreetLine,
  pickRotatingAmbientEchoScar,
  recordIrreversible,
  recordNpcTalk,
  scarChapterTitle,
  scarOrganId,
  scarRumorLine,
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
    expect(scarTriggersChapterQuiet("pp_tip_plan")).toBe(false);
    expect(scarTriggersChapterQuiet("pp_tip_rush")).toBe(false);
    expect(scarTriggersChapterQuiet("pp_inbox_storm")).toBe(false);
    expect(scarTriggersChapterQuiet("cc_shell_patience")).toBe(false);
    expect(scarTriggersChapterQuiet("ck_collector_lean")).toBe(false);
  });

  it("Wave 7 — cold retell names organ + plaque for each spine scar", () => {
    const cove = {
      id: "cove_saver_plaque",
      islandId: "coincraft_cove",
      choiceId: "save",
      label: "Jar before treat",
      kind: "plaque" as const,
      createdAt: "1",
    };
    const pay = {
      id: "pp_protector_plaque",
      islandId: "paycheck_peninsula",
      choiceId: "protect",
      label: "Umbrella before glitter",
      kind: "plaque" as const,
      createdAt: "2",
    };
    const credit = {
      id: "credit_patience_plaque",
      islandId: "credit_kingdom",
      choiceId: "wait",
      label: "Waited the spiral",
      kind: "plaque" as const,
      createdAt: "3",
    };
    expect(scarOrganId(cove)).toBe("coin");
    expect(scarOrganId(pay)).toBe("clock");
    expect(scarOrganId(credit)).toBe("spiral");
    expect(organSuitVerb("coin")).toBe("holds");
    expect(organVerbChip("coin")).toBe("Coin holds");
    expect(coldRetellLine(cove)).toMatch(/You chose with the Coin/);
    expect(coldRetellLine(cove)).toMatch(/Jar before treat/);
    expect(coldRetellLine(pay)).toMatch(/You chose under the Clock/);
    expect(coldRetellLine(credit)).toMatch(/You faced the Spiral/);
    expect(plaqueShelfLine(cove)).toBe("Coin holds · Jar before treat");
    expect(nextPaintingAfterScar(cove)).toBe("Paycheck Peninsula");
    expect(nextPaintingAfterScar(pay)).toBe("Credit Kingdom");
    expect(nextPaintingAfterScar(credit)).toBeNull();
    expect(coldSpectacleHeadline(cove)).toBe("Harbor felt that — jar or treat · Coin holds");
    expect(coldSpectacleHeadline(pay)).toBe("Harbor felt that — rain or shelter · Clock shelters");
    expect(coldSpectacleHeadline(credit)).toBe("Harbor felt that — wait or haste · Spiral withstands");
    // One mythology — never Harmon jargon as organ names
    expect(coldSpectacleHeadline(cove)).not.toMatch(/Change|Take$/);
    expect(organTakeHushLine("coin")).toMatch(/holds/);
    expect(organTakeHushLine("clock")).toMatch(/shelters/);
    expect(organTakeHushLine("spiral")).toMatch(/withstands/);
    expect(organQuietBadge("clock")).toBe("Quiet — Clock shelters");
    expect(organQuietBadge("coin")).toBe("Quiet — Coin holds");
    expect(organQuietBadge("coin")).not.toMatch(/Coin Take/);
    expect(day2EchoBody("Umbrella before glitter", "clock")).toMatch(/Clock shelters/);
    expect(day2EchoBody("Umbrella before glitter", "clock")).toMatch(/You wake/);
    expect(day2EchoBody("Umbrella before glitter", "clock")).not.toMatch(/jars/);
    expect(scarRumorLine(cove, "later")).toMatch(/Coin/);
    expect(scarRumorLine(pay, "same")).toMatch(/Clock/);
  });

  it("Pillar 12 — cold player can recite one sentence per organ", () => {
    expect(coldOrganKidSentence("coin")).toMatch(/^The Coin holds/);
    expect(coldOrganKidSentence("clock")).toMatch(/^The Clock shelters/);
    expect(coldOrganKidSentence("spiral")).toMatch(/^The Spiral withstands/);
    expect(coldOrganKidSentence("memory")).toMatch(/^Memory keeps/);
    // Story Bible frame — living money, not a second cosmos
    for (const organ of ["coin", "clock", "spiral", "memory"] as const) {
      const line = coldOrganKidSentence(organ);
      expect(line).not.toMatch(/Dotgraph|Ledgerlight|Mindwage|Harmon/i);
      expect(line).not.toMatch(/Coin Change|Clock Take/);
    }
  });

  it("digression scars feed talk graphs, not Plinth plaques", () => {
    let save = baseSave();
    save = addHarborScar(save, {
      id: "cc_shell_patience",
      islandId: "coincraft_cove",
      choiceId: "sh_need",
      label: "Left Shelly’s shell on the stall",
      kind: "npc_tone",
      createdAt: "2026-01-01",
    });
    save = addHarborScar(save, {
      id: "ck_collector_rumor",
      islandId: "credit_kingdom",
      choiceId: "dc1_rumor",
      label: "Heard the Bank of Obligation pitch",
      kind: "npc_tone",
      createdAt: "2026-01-02",
    });
    expect(harborScarPlaques(save)).toHaveLength(0);
    expect(harborTalkScars(save)).toHaveLength(2);
    expect(isDigressionScar(save.harborScars![0]!)).toBe(true);
    expect(scarChapterTitle(save.harborScars![0]!)).toBe("Coincraft Cove");
    expect(scarChapterTitle(save.harborScars![1]!)).toBe("Credit Kingdom");
    expect(scarOrganId(save.harborScars![0]!)).toBe("coin");
    expect(scarOrganId(save.harborScars![1]!)).toBe("spiral");
    expect(plazaScarGossipLine(save.harborScars![0]!)).toMatch(/Shelly/);
    expect(plazaScarGossipLine(save.harborScars![1]!)).toMatch(/Collector|canyon/i);
    expect(piggyScarWeightLine(save.harborScars![0]!)).toMatch(/Shelly/);
    expect(piggyScarWeightLine(save.harborScars![0]!)).not.toMatch(/Pay yourself first/i);
  });

  it("alive-street helpers rotate living lines across digression + plaque scars", () => {
    const pool = aliveStreetLinePool("Coiny", {
      label: "Jar before treat",
      dayOffset: "same",
      organ: "coin",
    });
    expect(pool.length).toBeGreaterThanOrEqual(3);
    expect(pool.every((l) => /Jar before treat/.test(l))).toBe(true);
    expect(pool.some((l) => /Coin|Plinth|Alive streets|tip-hat/i.test(l))).toBe(true);

    const a = pickRotatingAliveStreetLine("coiny", "Coiny", "morning", {
      label: "Jar before treat",
      dayOffset: "same",
      organ: "coin",
    });
    const b = pickRotatingAliveStreetLine("coiny", "Coiny", "evening", {
      label: "Jar before treat",
      dayOffset: "same",
      organ: "coin",
    });
    expect(a).toMatch(/Jar before treat/);
    expect(b).toMatch(/Jar before treat/);
    // Hour key shifts the pool index so streets don't stuck-loop one line
    expect(a === b).toBe(false);

    const dig = {
      id: "cc_shell_patience",
      islandId: "coincraft_cove",
      choiceId: "sh_need",
      label: "Left Shelly’s shell on the stall",
      kind: "npc_tone" as const,
      createdAt: "2026-01-01",
    };
    const plaque = {
      id: "cove_saver_plaque",
      islandId: "coincraft_cove",
      choiceId: "save",
      label: "Jar before treat",
      kind: "plaque" as const,
      createdAt: "2026-01-02",
    };
    const first = pickRotatingAmbientEchoScar([dig, plaque], 0);
    const later = pickRotatingAmbientEchoScar([dig, plaque], 90_000);
    expect(first?.label).toBeTruthy();
    expect(later?.label).toBeTruthy();
    expect(first!.label).not.toEqual(later!.label);
  });
});
