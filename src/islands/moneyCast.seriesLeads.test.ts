import { describe, expect, it } from "vitest";
import {
  HARBOR_LOCAL_CAST,
  MONEY_CAST,
  SERIES_LEAD_MASCOT_ID,
  SERIES_LEAD_MASCOT_IDS,
  getMascot,
  isSeriesLeadMascot,
  varyMascot,
} from "./moneyCast";
import { colorHex } from "./character";
import { HARBOR_NPCS } from "./story/harborTalks";

describe("series leads — Cashwell · Cashmere · Pedro · Fernanda", () => {
  it("registers four leads with locked sheet looks", () => {
    expect(SERIES_LEAD_MASCOT_ID).toBe("cashwell");
    expect(SERIES_LEAD_MASCOT_IDS).toEqual([
      "cashwell",
      "cashmere",
      "peso_pedro",
      "fortuna_fernanda",
    ]);
    expect(isSeriesLeadMascot("fortuna_fernanda")).toBe(true);
    expect(isSeriesLeadMascot("piggy_penny")).toBe(false);

    expect(getMascot("cashwell").accessory).toBe("cap");
    expect(colorHex(getMascot("cashwell").color)).toBe("#14532d");
    expect(getMascot("cashmere").accessory).toBe("cape");
    expect(colorHex(getMascot("cashmere").color)).toBe("#0a0a0a");

    const pedro = getMascot("peso_pedro");
    expect(pedro.name).toBe("Peso Pedro");
    expect(pedro.glyph).toBe("P");
    expect(colorHex(pedro.color)).toBe("#166534");

    const fernanda = getMascot("fortuna_fernanda");
    expect(fernanda.name).toBe("Fortuna Fernanda");
    expect(fernanda.form).toBe("coin");
    expect(fernanda.glyph).toBe("P");
    expect(fernanda.accessory).toBe("cape");
    expect(colorHex(fernanda.color)).toBe("#047857");
    expect(MONEY_CAST.filter((c) => isSeriesLeadMascot(c.id))).toHaveLength(4);
  });

  it("flanks Memory Courtyard — never Piggy’s fountain slot", () => {
    const piggy = HARBOR_LOCAL_CAST.find((s) => s.mascotId === "piggy_penny")!;
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      const slot = HARBOR_LOCAL_CAST.find((s) => s.mascotId === id)!;
      expect(slot.pos[0]).toBeGreaterThan(4);
      expect(slot.pos[0]).not.toBe(piggy.pos[0]);
      expect(HARBOR_NPCS.some((n) => n.id === id)).toBe(true);
    }
  });

  it("does not randomize series-lead coats or gear", () => {
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      const a = varyMascot(id, `harbor:${id}:morning`);
      const sheet = getMascot(id);
      expect(a.color).toBe(sheet.color);
      expect(a.accessory).toBe(sheet.accessory);
      expect(a.name).toBe(sheet.name);
    }
  });
});
