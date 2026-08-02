import { describe, expect, it } from "vitest";
import { loadIslandsContent } from "./content/loader";
import { buildGameCatalog } from "./platform/gameCatalog";
import { SPINE_TRAVEL_IDS } from "./spineArchipelago";
import {
  assertRegistryMuralLaw,
  isParkedIslandId,
  isSpineContentIslandId,
  PARKED_ISLAND_IDS,
  spineRegistryPieces,
  SPINE_CONTENT_REGISTRY,
} from "./spineContentRegistry";
import { genreHudLine, genreShoreBlurb } from "./genreWorlds";

describe("Pillar 7 — spine content registry", () => {
  it("tags every spine piece with organ · verb · cold-retell", () => {
    expect(assertRegistryMuralLaw()).toEqual([]);
    for (const piece of spineRegistryPieces("spine")) {
      expect(piece.organ).toBeTruthy();
      expect(piece.verb).not.toBe("—");
      expect(piece.coldRetell).toMatch(/^(Memory|Coin|Clock|Spiral)$/);
    }
  });

  it("parks genre / asset / demo orphans without organ claims", () => {
    for (const id of PARKED_ISLAND_IDS) {
      expect(isParkedIslandId(id)).toBe(true);
      expect(isSpineContentIslandId(id)).toBe(false);
    }
    const parked = spineRegistryPieces("parked");
    expect(parked.length).toBe(PARKED_ISLAND_IDS.length);
    expect(parked.every((p) => p.organ == null)).toBe(true);
  });

  it("keeps live loader to Fortune spine islands only", () => {
    const live = loadIslandsContent().islands.map((i) => i.id).sort();
    expect(live).toEqual([...SPINE_TRAVEL_IDS].sort());
    for (const id of PARKED_ISLAND_IDS) {
      expect(live).not.toContain(id);
    }
  });

  it("keeps Harbor Arcade catalog on spine minigames only", () => {
    const catalog = buildGameCatalog(loadIslandsContent());
    expect(catalog.length).toBeGreaterThan(0);
    for (const game of catalog) {
      expect(isSpineContentIslandId(game.islandId)).toBe(true);
      expect(isParkedIslandId(game.islandId)).toBe(false);
    }
  });

  it("does not let genre cities lead spine HUD copy", () => {
    for (const id of SPINE_TRAVEL_IDS) {
      if (id === "harbor_haven") continue;
      expect(genreHudLine(id)).toBeNull();
      expect(genreShoreBlurb(id)).toBeNull();
    }
    // Parked packs may still describe genre cities for later width
    expect(genreHudLine("venture_foundry")).toMatch(/Ledgerlight/);
  });

  it("names Paycheck by organ, not Dotgraph leftover", () => {
    const pay = loadIslandsContent().islands.find((i) => i.id === "paycheck_peninsula");
    expect(pay?.name).toBe("Paycheck Peninsula");
    expect(pay?.name).not.toMatch(/Dotgraph/i);
    const row = SPINE_CONTENT_REGISTRY.find((p) => p.id === "paycheck_peninsula");
    expect(row).toMatchObject({ organ: "clock", verb: "Earn", coldRetell: "Clock" });
  });
});
