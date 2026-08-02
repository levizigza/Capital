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

describe("series leads — Cashwell through Sultan Stacks", () => {
  it("registers seven leads with locked sheet looks", () => {
    expect(SERIES_LEAD_MASCOT_ID).toBe("cashwell");
    expect(SERIES_LEAD_MASCOT_IDS).toEqual([
      "cashwell",
      "cashmere",
      "peso_pedro",
      "fortuna_fernanda",
      "billionaire_bao",
      "jade_fortune",
      "sultan_stacks",
    ]);
    expect(isSeriesLeadMascot("sultan_stacks")).toBe(true);
    expect(isSeriesLeadMascot("piggy_penny")).toBe(false);

    const sultan = getMascot("sultan_stacks");
    expect(sultan.name).toBe("Sultan Stacks");
    expect(sultan.form).toBe("coin");
    expect(sultan.glyph).toBe("$");
    expect(sultan.accessory).toBe("cap");
    expect(colorHex(sultan.color)).toBe("#064e3b");
    expect(MONEY_CAST.filter((c) => isSeriesLeadMascot(c.id))).toHaveLength(7);
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
