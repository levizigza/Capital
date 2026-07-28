import { describe, expect, it } from "vitest";
import { buildShoreHotspots } from "./islandShoreLayout";
import {
  COVE_COIN_JAR,
  HARBOR_LEDGER_BANK,
  moneyStructureForIsland,
} from "./moneyStructures";
import { COVE_ISLAND_ID, HARBOR_HAVEN_ID } from "./islandIds";
import type { IslandDefinition } from "./types";

function stubCove(): IslandDefinition {
  return {
    id: COVE_ISLAND_ID,
    name: "Coincraft Cove",
    description: "test",
    icon: "🏝️",
    areas: [{ id: "cc_harbor", name: "Harbor", description: "", icon: "⚓", connections: [] }],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [
      {
        id: "mg_coin_catcher",
        name: "Coin Catcher",
        description: "x",
        icon: "🕹️",
        componentId: "CoinCatcherMinigame",
      },
    ],
  };
}

describe("money structures", () => {
  it("registers the Cove Giant Coin Jar", () => {
    const s = moneyStructureForIsland(COVE_ISLAND_ID);
    expect(s?.id).toBe(COVE_COIN_JAR.id);
    expect(s?.theme).toBe("jar");
    expect(s?.parts.length).toBeGreaterThanOrEqual(3);
    expect(s?.parts.some((p) => p.minigameId === "mg_treasure_vault")).toBe(true);
    expect(s?.parts.some((p) => p.softBeat === "lookout")).toBe(true);
  });

  it("registers the Harbor Ledger Bank", () => {
    const s = moneyStructureForIsland(HARBOR_HAVEN_ID);
    expect(s?.id).toBe(HARBOR_LEDGER_BANK.id);
    expect(s?.theme).toBe("bank");
    expect(s?.entryVerb.toLowerCase()).toMatch(/vault/);
    expect(s?.parts.some((p) => p.minigameId === "mg_inbox_storm")).toBe(true);
    expect(s?.parts.some((p) => p.softBeat === "ledger")).toBe(true);
  });

  it("adds a money_structure shore hotspot on Cove", () => {
    const spots = buildShoreHotspots(stubCove());
    const jar = spots.find((h) => h.kind === "money_structure");
    expect(jar?.label).toMatch(/Coin Jar/i);
    expect(jar?.structureId).toBe("cove_coin_jar");
    expect(jar?.subtitle?.toLowerCase()).toMatch(/slot|squeeze/);
  });
});
