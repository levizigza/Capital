import { describe, expect, it } from "vitest";
import { islandLockHint, isIslandProgressLocked, PLAYTEST_UNLOCK_ALL_ISLANDS } from "./progressGates";
import type { IslandDefinition, IslandSaveV1 } from "./types";
import { COVE_ISLAND_ID, PAYCHECK_PENINSULA_ID } from "./islandIds";

const stub = (id: string): IslandDefinition =>
  ({
    id,
    name: id,
    themeId: "harbor_haven",
    npcs: [],
    quests: [],
    items: [],
    areas: [],
  }) as IslandDefinition;

const emptySave = {
  inventory: [],
  irreversibleChoices: {},
  questStatus: {},
  voyagerLedger: {
    salaryIncome: 0,
    passiveIncome: [],
    holdings: [],
    events: [],
    masteryClears: [],
    harborEscaped: false,
    escapeStreak: 0,
  },
} as unknown as IslandSaveV1;

describe("progression lock organ language", () => {
  it("playtest unlock opens Credit and side shores with an empty save", () => {
    expect(PLAYTEST_UNLOCK_ALL_ISLANDS).toBe(true);
    expect(isIslandProgressLocked(stub(COVE_ISLAND_ID), emptySave)).toBe(false);
    expect(isIslandProgressLocked(stub(PAYCHECK_PENINSULA_ID), emptySave)).toBe(false);
    expect(isIslandProgressLocked(stub("credit_kingdom"), emptySave)).toBe(false);
    expect(isIslandProgressLocked(stub("signal_city"), emptySave)).toBe(false);
    expect(islandLockHint(stub("credit_kingdom"), emptySave)).toBeNull();
  });
});
