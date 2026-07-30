import { describe, expect, it } from "vitest";
import {
  MONEY_ORGANS,
  MURAL_THESIS,
  isMoneyOrganIsland,
  moneyOrganForIsland,
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
});
