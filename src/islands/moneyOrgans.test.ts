import { describe, expect, it } from "vitest";
import {
  MONEY_ORGANS,
  MURAL_THESIS,
  isMoneyOrganIsland,
  moneyOrganForIsland,
  moneyOrganForSoftBeat,
  moneyOrganForStructureTheme,
  organMaterialTint,
} from "./moneyOrgans";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";

describe("money organs mural thesis", () => {
  it("binds the four spine organs", () => {
    expect(Object.keys(MONEY_ORGANS)).toEqual(["memory", "coin", "clock", "spiral"]);
    expect(moneyOrganForIsland(HARBOR_HAVEN_ID)?.id).toBe("memory");
    expect(moneyOrganForIsland(COVE_ISLAND_ID)?.id).toBe("coin");
    expect(moneyOrganForIsland(PAYCHECK_PENINSULA_ID)?.id).toBe("clock");
    expect(moneyOrganForIsland(CREDIT_KINGDOM_ID)?.id).toBe("spiral");
  });

  it("uses distinct path motifs per organ", () => {
    const motifs = Object.values(MONEY_ORGANS).map((o) => o.pathMotif);
    expect(new Set(motifs).size).toBe(4);
  });

  it("rejects non-spine islands as organs", () => {
    expect(isMoneyOrganIsland("genre_city_fake")).toBe(false);
    expect(moneyOrganForIsland(null)).toBeNull();
  });

  it("names the mural in one line", () => {
    expect(MURAL_THESIS).toMatch(/living money/i);
    expect(MURAL_THESIS).toMatch(/Harbor remembers/i);
  });

  it("binds Structure themes and Soft Beats to organs", () => {
    expect(moneyOrganForStructureTheme("jar").id).toBe("coin");
    expect(moneyOrganForStructureTheme("bank").id).toBe("memory");
    expect(moneyOrganForStructureTheme("tower").id).toBe("clock");
    expect(moneyOrganForStructureTheme("keep").id).toBe("spiral");
    expect(moneyOrganForSoftBeat("lookout").id).toBe("coin");
    expect(moneyOrganForSoftBeat("ledger").id).toBe("memory");
    expect(moneyOrganForSoftBeat("umbrella").id).toBe("clock");
    expect(moneyOrganForSoftBeat("battlement").id).toBe("spiral");
  });

  it("keeps organ material tints distinct (no shared cyan kit)", () => {
    const coin = organMaterialTint("coin");
    const clock = organMaterialTint("clock");
    const spiral = organMaterialTint("spiral");
    const memory = organMaterialTint("memory");
    const accents = [coin.accent, clock.accent, spiral.accent, memory.accent];
    expect(new Set(accents).size).toBe(4);
    expect(clock.accent).not.toBe(coin.accent);
    expect(spiral.lamp).not.toBe(coin.lamp);
    expect(organMaterialTint(null).accent).toBe(memory.accent);
  });
});
