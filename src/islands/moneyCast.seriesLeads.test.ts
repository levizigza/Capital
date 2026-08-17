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

describe("series leads — Cashwell through Mula Mami", () => {
  it("registers twelve leads with locked sheet looks", () => {
    expect(SERIES_LEAD_MASCOT_ID).toBe("cashwell");
    expect(SERIES_LEAD_MASCOT_IDS).toEqual([
      "cashwell",
      "cashmere",
      "peso_pedro",
      "fortuna_fernanda",
      "billionaire_bao",
      "jade_fortune",
      "sultan_stacks",
      "dinar_dahlia",
      "mansa_moneybaggs",
      "kandake_kash",
      "moneybagg_bro",
      "mula_mami",
    ]);
    expect(isSeriesLeadMascot("mula_mami")).toBe(true);
    expect(isSeriesLeadMascot("piggy_penny")).toBe(false);

    const mula = getMascot("mula_mami");
    expect(mula.name).toBe("Mula Mami");
    expect(mula.form).toBe("coin");
    expect(mula.glyph).toBe("MM");
    expect(mula.accessory).toBe("vest");
    expect(colorHex(mula.color)).toBe("#1c1917");
    expect(MONEY_CAST.filter((c) => isSeriesLeadMascot(c.id))).toHaveLength(12);
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

  it("gives each tip-hat series lead one short ambientNear line", () => {
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      const slot = HARBOR_LOCAL_CAST.find((s) => s.mascotId === id)!;
      expect(slot.ambientNear).toBeTruthy();
      expect(slot.ambientNear!.length).toBeGreaterThan(12);
      expect(slot.ambientNear!.length).toBeLessThan(90);
      expect(slot.ambientNear).not.toMatch(/Pay yourself first|Automate a savings/i);
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
