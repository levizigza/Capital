import { describe, expect, it } from "vitest";
import { loadIslandsContent } from "./content/loader";
import { buildGameCatalog } from "./platform/gameCatalog";
import {
  ARCHIPELAGO_MAP_TRAVEL_IDS,
  SIDE_SHORE_TRAVEL_IDS,
  SPINE_TRAVEL_IDS,
} from "./spineArchipelago";
import {
  assertRegistryMuralLaw,
  isParkedIslandId,
  isParkedMinigameId,
  isSideShoreContentIslandId,
  isSpineContentIslandId,
  PARKED_ISLAND_IDS,
  PARKED_MINIGAME_IDS,
  spineRegistryPieces,
  SPINE_CONTENT_REGISTRY,
  sideShoreHudLine,
} from "./spineContentRegistry";
import { genreHudLine, genreShoreBlurb } from "./genreWorlds";
import { cueForIsland } from "./audio/soundtrackCatalog";

describe("Pillar 7 — spine content registry", () => {
  it("tags every spine + side piece with organ · verb · cold-retell", () => {
    expect(assertRegistryMuralLaw()).toEqual([]);
    for (const piece of spineRegistryPieces("spine")) {
      expect(piece.organ).toBeTruthy();
      expect(piece.verb).not.toBe("—");
      expect(piece.coldRetell).toMatch(/^(Memory|Coin|Clock|Spiral)$/);
    }
    for (const piece of spineRegistryPieces("side")) {
      expect(piece.organ).toBeTruthy();
      expect(piece.verb).not.toBe("—");
      expect(piece.coldRetell).toMatch(/^(Memory|Coin|Clock|Spiral)$/);
    }
  });

  it("parks only demo Key Cove; era shores are side lane", () => {
    expect([...PARKED_ISLAND_IDS]).toEqual(["starter_key_cove"]);
    for (const id of PARKED_ISLAND_IDS) {
      expect(isParkedIslandId(id)).toBe(true);
      expect(isSpineContentIslandId(id)).toBe(false);
    }
    for (const id of SIDE_SHORE_TRAVEL_IDS) {
      expect(isParkedIslandId(id)).toBe(false);
      expect(isSideShoreContentIslandId(id)).toBe(true);
    }
    const parked = spineRegistryPieces("parked");
    expect(parked.length).toBe(PARKED_ISLAND_IDS.length + PARKED_MINIGAME_IDS.length);
    expect(parked.every((p) => p.organ == null)).toBe(true);
    expect(spineRegistryPieces("side")).toHaveLength(SIDE_SHORE_TRAVEL_IDS.length);
  });

  it("loads spine + era side shores live (demo stays out)", () => {
    const live = loadIslandsContent().islands.map((i) => i.id).sort();
    expect(live).toEqual([...ARCHIPELAGO_MAP_TRAVEL_IDS].sort());
    for (const id of PARKED_ISLAND_IDS) {
      expect(live).not.toContain(id);
    }
    for (const id of SIDE_SHORE_TRAVEL_IDS) {
      expect(live).toContain(id);
    }
  });

  it("keeps Harbor Arcade catalog on spine minigames only", () => {
    const catalog = buildGameCatalog(loadIslandsContent());
    expect(catalog.length).toBeGreaterThan(0);
    for (const game of catalog) {
      expect(isSpineContentIslandId(game.islandId)).toBe(true);
      expect(isParkedIslandId(game.islandId)).toBe(false);
      expect(isParkedMinigameId(game.minigameId)).toBe(false);
    }
    expect(catalog.some((g) => g.minigameId === "mg_coin_sort")).toBe(true);
    expect(catalog.some((g) => g.minigameId === "mg_compound_snowball")).toBe(false);
    expect(catalog.some((g) => g.minigameId === "mg_ck_budget_balancer")).toBe(false);
    expect(catalog.some((g) => g.islandId === "venture_foundry")).toBe(false);
  });

  it("wires iconic per-shore music cues for restored era islands", () => {
    expect(cueForIsland("venture_foundry")).toBe("neon_sprawl");
    expect(cueForIsland("signal_city")).toBe("solarpunk_cove");
    expect(cueForIsland("financial_assets")).toBe("scrap_coast");
    expect(cueForIsland("digital_assets")).toBe("ai_undercity");
    expect(cueForIsland("business_assets")).toBe("orbital_keep");
    expect(cueForIsland("real_estate")).toBe("orbital_keep");
    expect(cueForIsland("intangibles")).toBe("nocturne_void");
    expect(cueForIsland("future_shores")).toBe("solarpunk_cove");
  });

  it("sideShoreHudLine uses organ verb, not genre city copy", () => {
    expect(sideShoreHudLine("signal_city")).toMatch(/Listen on this shore/i);
    expect(sideShoreHudLine("venture_foundry")).toMatch(/Build on this shore/i);
    expect(sideShoreHudLine("harbor_haven")).toBeNull();
  });

  it("does not let genre cities lead spine HUD copy", () => {
    for (const id of SPINE_TRAVEL_IDS) {
      if (id === "harbor_haven") continue;
      expect(genreHudLine(id)).toBeNull();
      expect(genreShoreBlurb(id)).toBeNull();
    }
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
