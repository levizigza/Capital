import { describe, expect, it } from "vitest";
import { getIslandCulture, buildAmbientEcosystem, shoreAnchorsForCulture } from "./islandCulture";
import type { IslandDefinition } from "./types";

function fakeIsland(id: string, themeId?: string): IslandDefinition {
  return {
    id,
    name: id,
    description: "",
    icon: "🏝️",
    themeId,
    areas: [],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [],
  };
}

describe("islandCulture", () => {
  it("gives Signal City a biopunk gene-reef culture + radar layout", () => {
    const c = getIslandCulture(fakeIsland("signal_city"));
    expect(c.cultureName).toMatch(/Gene|Phosphor|Reef/i);
    expect(c.layout).toBe("radar");
    expect(c.fauna).toBe("gene_critters");
    expect(c.ecosystem.animals).toBeGreaterThan(0);
  });

  it("gives Coincraft a solarpunk canopy culture with families", () => {
    const c = getIslandCulture(fakeIsland("coincraft_cove"));
    expect(c.layout).toBe("crescent");
    expect(c.cultureName).toMatch(/Canopy|Craft/i);
    expect(c.ecosystem.families).toBeGreaterThan(0);
    expect(c.fauna).toBe("canopy_bots");
  });

  it("gives Gridlock cyberpunk androids", () => {
    const c = getIslandCulture(fakeIsland("venture_foundry"));
    expect(c.fauna).toBe("neon_androids");
    expect(c.layout).toBe("strip");
  });

  it("builds mixed ambient residents including animals, machines, and personas", () => {
    const amb = buildAmbientEcosystem(fakeIsland("signal_city"));
    expect(amb.some((a) => a.social === "animal")).toBe(true);
    expect(amb.some((a) => a.social === "machine")).toBe(true);
    expect(amb.some((a) => a.social === "loner" || a.social === "pair")).toBe(true);
    expect(amb.some((a) => a.persona)).toBe(true);
    const ids = new Set(amb.map((a) => a.mascotId));
    expect(ids.size).toBeGreaterThan(1);
  });

  it("tags ecosystem motion per world — static ruins, dynamic neon, mixed guilds", () => {
    expect(getIslandCulture(fakeIsland("credit_kingdom")).ecosystemMotion).toBe("static");
    expect(getIslandCulture(fakeIsland("intangibles")).ecosystemMotion).toBe("static");
    expect(getIslandCulture(fakeIsland("venture_foundry")).ecosystemMotion).toBe("dynamic");
    expect(getIslandCulture(fakeIsland("signal_city")).ecosystemMotion).toBe("dynamic");
    expect(getIslandCulture(fakeIsland("coincraft_cove")).ecosystemMotion).toBe("mixed");
    expect(getIslandCulture(fakeIsland("harbor_haven")).ecosystemMotion).toBe("mixed");
  });

  it("assigns static/dynamic resident motion from culture mode", () => {
    const ruins = buildAmbientEcosystem(fakeIsland("credit_kingdom"));
    expect(ruins.every((r) => r.motion === "static")).toBe(true);
    const neon = buildAmbientEcosystem(fakeIsland("venture_foundry"));
    expect(neon.every((r) => r.motion === "dynamic")).toBe(true);
    const mixed = buildAmbientEcosystem(fakeIsland("coincraft_cove"));
    expect(mixed.some((r) => r.motion === "static")).toBe(true);
    expect(mixed.some((r) => r.motion === "dynamic")).toBe(true);
  });

  it("uses different anchors per layout", () => {
    const radar = shoreAnchorsForCulture(getIslandCulture(fakeIsland("signal_city")));
    const crescent = shoreAnchorsForCulture(getIslandCulture(fakeIsland("coincraft_cove")));
    expect(radar.party[0]).not.toBe(crescent.party[0]);
  });
});
