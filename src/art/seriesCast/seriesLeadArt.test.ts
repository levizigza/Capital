import { describe, expect, it } from "vitest";

import { SERIES_LEAD_MASCOT_IDS } from "../../islands/moneyCast";
import { hasSeriesCoinFace } from "./SeriesCoinFace";
import {
  SHEET_ART_IDS,
  SERIES_SHEET_SPECS,
  castSheetPngUrl,
  hasSheetArtId,
} from "./seriesLeadArt";

describe("seriesLeadArt", () => {
  it("covers every series lead plus the endgame villain", () => {
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      expect(hasSheetArtId(id)).toBe(true);
      expect(SERIES_SHEET_SPECS[id]).toBeTruthy();
      expect(SERIES_SHEET_SPECS[id]!.hook.length).toBeGreaterThan(10);
    }
    expect(hasSheetArtId("debt_collector")).toBe(true);
    expect(SHEET_ART_IDS).toContain("debt_collector");
  });

  it("builds a public cast PNG url for drop-in sheets", () => {
    expect(castSheetPngUrl("cashwell")).toMatch(/cast\/cashwell\.png$/);
  });

  it("has a distinct spinning coin face for every series lead", () => {
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      expect(hasSeriesCoinFace(id)).toBe(true);
    }
    expect(hasSeriesCoinFace("debt_collector")).toBe(true);
  });
});
