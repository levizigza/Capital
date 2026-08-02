import { describe, expect, it } from "vitest";
import {
  ENDGAME_VILLAIN_MASCOT_ID,
  SERIES_LEAD_MASCOT_IDS,
  isEndgameVillainMascot,
} from "./moneyCast";
import {
  GEAR_ACCESSORY_IDS,
  LOOK_PRESETS_BY_BASE,
  PLAYABLE_SELECT_CAST,
  TECH_ACCESSORY_IDS,
  applyLookPreset,
  isPlayableSelectCast,
  lookPresetsForBase,
  sheetLookForBase,
} from "./castLooks";
import { OUTFIT_CATEGORIES } from "./character";

describe("castLooks — Street Fighter select + Outfitter layers", () => {
  it("playable roster includes twelve series leads and excludes the Debt Collector", () => {
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      expect(PLAYABLE_SELECT_CAST).toContain(id);
      expect(isPlayableSelectCast(id)).toBe(true);
    }
    expect(PLAYABLE_SELECT_CAST).not.toContain(ENDGAME_VILLAIN_MASCOT_ID);
    expect(isPlayableSelectCast(ENDGAME_VILLAIN_MASCOT_ID)).toBe(false);
    expect(isEndgameVillainMascot(ENDGAME_VILLAIN_MASCOT_ID)).toBe(true);
    expect(lookPresetsForBase(ENDGAME_VILLAIN_MASCOT_ID)).toEqual([]);
  });

  it("every playable body has at least one look preset and a sheet look", () => {
    for (const id of PLAYABLE_SELECT_CAST) {
      const presets = lookPresetsForBase(id);
      expect(presets.length).toBeGreaterThanOrEqual(1);
      expect(LOOK_PRESETS_BY_BASE[id]?.[0]?.id ?? presets[0]!.id).toBeTruthy();
      const sheet = sheetLookForBase(id, "Tester");
      expect(sheet.base).toBe(id);
      expect(sheet.name).toBe("Tester");
      expect(sheet.lookId).toBe(presets[0]!.id);
      expect(sheet.pants).toBe(presets[0]!.pants);
    }
  });

  it("applyLookPreset updates coat, accessory, pants, and lookId", () => {
    const draft = sheetLookForBase("cashwell", "Cash");
    const nextPreset = lookPresetsForBase("cashwell")[1]!;
    const next = applyLookPreset(draft, nextPreset);
    expect(next.color).toBe(nextPreset.color);
    expect(next.accessory).toBe(nextPreset.accessory);
    expect(next.pants).toBe(nextPreset.pants);
    expect(next.lookId).toBe(nextPreset.id);
    expect(next.base).toBe("cashwell");
  });

  it("Outfitter categories are Looks · Shirt · Pants · Accessories · Electronics", () => {
    expect(OUTFIT_CATEGORIES.map((c) => c.id)).toEqual([
      "looks",
      "coat",
      "pants",
      "gear",
      "tech",
    ]);
    expect(GEAR_ACCESSORY_IDS).toContain("cap");
    expect(TECH_ACCESSORY_IDS).toContain("headset");
    expect(GEAR_ACCESSORY_IDS).not.toContain("headset");
  });
});
