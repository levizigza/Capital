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

describe("series leads — Cashwell + Cashmere", () => {
  it("registers both leads with locked sheet looks", () => {
    expect(SERIES_LEAD_MASCOT_ID).toBe("cashwell");
    expect(SERIES_LEAD_MASCOT_IDS).toEqual(["cashwell", "cashmere"]);
    expect(isSeriesLeadMascot("cashwell")).toBe(true);
    expect(isSeriesLeadMascot("cashmere")).toBe(true);
    expect(isSeriesLeadMascot("piggy_penny")).toBe(false);

    const cashwell = getMascot("cashwell");
    expect(cashwell.name).toBe("Cashwell");
    expect(cashwell.form).toBe("coin");
    expect(cashwell.accessory).toBe("cap");
    expect(colorHex(cashwell.color)).toBe("#14532d");

    const cashmere = getMascot("cashmere");
    expect(cashmere.name).toBe("Cashmere Couture");
    expect(cashmere.form).toBe("coin");
    expect(cashmere.accessory).toBe("cape");
    expect(colorHex(cashmere.color)).toBe("#0a0a0a");
    expect(MONEY_CAST.filter((c) => isSeriesLeadMascot(c.id))).toHaveLength(2);
  });

  it("flanks Memory Courtyard — never Piggy’s fountain slot", () => {
    const piggy = HARBOR_LOCAL_CAST.find((s) => s.mascotId === "piggy_penny")!;
    const cashwell = HARBOR_LOCAL_CAST.find((s) => s.mascotId === "cashwell")!;
    const cashmere = HARBOR_LOCAL_CAST.find((s) => s.mascotId === "cashmere")!;
    expect(cashwell.pos[0]).toBeGreaterThan(4);
    expect(cashmere.pos[0]).toBeGreaterThan(4);
    expect(cashwell.pos[0]).not.toBe(piggy.pos[0]);
    expect(cashmere.pos[0]).not.toBe(piggy.pos[0]);
    expect(HARBOR_NPCS.some((n) => n.id === "cashwell")).toBe(true);
    expect(HARBOR_NPCS.some((n) => n.id === "cashmere")).toBe(true);
  });

  it("does not randomize series-lead coats or gear", () => {
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      const a = varyMascot(id, `harbor:${id}:morning`);
      const b = varyMascot(id, `harbor:${id}:evening`);
      const sheet = getMascot(id);
      expect(a.color).toBe(sheet.color);
      expect(b.color).toBe(sheet.color);
      expect(a.accessory).toBe(sheet.accessory);
      expect(b.accessory).toBe(sheet.accessory);
      expect(a.name).toBe(sheet.name);
    }
  });
});
