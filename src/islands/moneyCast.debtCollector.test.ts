import { describe, expect, it } from "vitest";
import {
  ENDGAME_VILLAIN_MASCOT_ID,
  HARBOR_LOCAL_CAST,
  SERIES_LEAD_MASCOT_IDS,
  getMascot,
  isEndgameVillainMascot,
  isSeriesLeadMascot,
  varyMascot,
} from "./moneyCast";
import { colorHex } from "./character";
import { loadIslandsContent } from "./content/loader";

describe("The Debt Collector — endgame Ordeal villain", () => {
  it("registers locked sheet look and is not a series lead", () => {
    expect(ENDGAME_VILLAIN_MASCOT_ID).toBe("debt_collector");
    expect(isEndgameVillainMascot("debt_collector")).toBe(true);
    expect(isSeriesLeadMascot("debt_collector")).toBe(false);
    expect(SERIES_LEAD_MASCOT_IDS).not.toContain("debt_collector");

    const villain = getMascot("debt_collector");
    expect(villain.name).toBe("The Debt Collector");
    expect(villain.form).toBe("vault");
    expect(villain.glyph).toBe("$");
    expect(villain.accessory).toBe("cape");
    expect(villain.role).toBe("credit");
    expect(colorHex(villain.color)).toBe("#3f3f46");
  });

  it("never takes a Harbor Memory Courtyard plaza slot", () => {
    expect(HARBOR_LOCAL_CAST.some((s) => s.mascotId === "debt_collector")).toBe(false);
  });

  it("does not randomize coat or gear", () => {
    const a = varyMascot("debt_collector", "credit_kingdom:npc_debt_collector");
    const sheet = getMascot("debt_collector");
    expect(a.color).toBe(sheet.color);
    expect(a.accessory).toBe(sheet.accessory);
    expect(a.name).toBe(sheet.name);
  });

  it("looms in Credit Kingdom Debt Canyon with locked mascot", () => {
    const content = loadIslandsContent();
    const credit = content.islands.find((i) => i.id === "credit_kingdom");
    expect(credit).toBeTruthy();
    const boss = credit!.npcs.find((n) => n.id === "npc_debt_collector");
    expect(boss?.name).toBe("The Debt Collector");
    expect(boss?.mascotId).toBe("debt_collector");
    expect(boss?.areaId).toBe("ck_debt_canyon");
    expect(credit!.dialogues.some((d) => d.id === "dlg_debt_collector")).toBe(true);
  });
});
