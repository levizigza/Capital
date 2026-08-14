import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BOAT_TIERS, getBoatTier } from "./boats";
import { getWealthRank, WEALTH_RANKS } from "./wealth";
import { economyPhaseFromHarborMood, syncEconomyToHarborMood, createDefaultEconomyState } from "./economy";
import { moodFromCashflow, paydayIncomeMultiplier } from "./harborWeather";

describe("Complexity vs depth merges", () => {
  const doc = readFileSync(join(__dirname, "../../GAME_DESIGN_COMPLEXITY.md"), "utf8");
  const wealthHud = readFileSync(join(__dirname, "views/WealthHud.tsx"), "utf8");
  const play = readFileSync(join(__dirname, "views/IslandPlayView.tsx"), "utf8");
  const reward = readFileSync(join(__dirname, "views/PartyRewardOverlay.tsx"), "utf8");
  const islands = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");

  it("documents design-value formula and poor-ratio cuts", () => {
    expect(doc).toMatch(/DESIGN VALUE/);
    expect(doc).toMatch(/Poor/);
    expect(doc).toMatch(/MERGE → carpet/);
    expect(doc).toMatch(/UNIFY → cashflow/);
    expect(doc).toMatch(/CUT UI/);
    expect(doc).toMatch(/Signature Take/);
  });

  it("merges wealth ranks into carpet/boat tiers (one progress metaphor)", () => {
    expect(WEALTH_RANKS.length).toBe(BOAT_TIERS.length);
    for (const t of BOAT_TIERS) {
      expect(getWealthRank(t.minCoins).id).toBe(t.id);
      expect(getWealthRank(t.minCoins).label).toBe(getBoatTier(t.minCoins).label);
    }
    expect(wealthHud).toMatch(/getBoatTier|carpet/);
    expect(wealthHud).not.toMatch(/Flat broke|Tycoon/);
  });

  it("demotes XP chrome and skillStats panel from play HUD", () => {
    expect(reward).not.toMatch(/\+\{reward\.xp\} XP|✨ \+.*XP/);
    expect(play).not.toMatch(/SkillStatsPanel|LazySkillStatsPanel/);
  });

  it("unifies macro economy phase to Harbor cashflow weather", () => {
    expect(economyPhaseFromHarborMood("boom")).toBe("boom");
    expect(economyPhaseFromHarborMood("storm")).toBe("recession");
    expect(economyPhaseFromHarborMood("fair")).toBe("normal");
    const synced = syncEconomyToHarborMood(createDefaultEconomyState(), "boom");
    expect(synced.phase).toBe("boom");
    expect(paydayIncomeMultiplier(moodFromCashflow(50))).toBe(1.1);
    expect(paydayIncomeMultiplier(moodFromCashflow(-5))).toBe(0.9);
    expect(islands).toMatch(/syncEconomyToHarborMood/);
    expect(islands).toMatch(/paydayIncomeMultiplier/);
  });
});
