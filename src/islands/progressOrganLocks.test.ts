import { describe, expect, it } from "vitest";
import {
  islandLockHint,
  isIslandProgressLocked,
  PLAYTEST_UNLOCK_ALL_ISLANDS,
} from "./progressGates";
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

describe("progression lock organ language — production ship", () => {
  it("ships with PLAYTEST_UNLOCK_ALL_ISLANDS off", () => {
    expect(PLAYTEST_UNLOCK_ALL_ISLANDS).toBe(false);
  });

  it("locks Paycheck, Credit, and side shores with an empty save", () => {
    expect(isIslandProgressLocked(stub(COVE_ISLAND_ID), emptySave)).toBe(false);
    expect(isIslandProgressLocked(stub(PAYCHECK_PENINSULA_ID), emptySave)).toBe(true);
    expect(isIslandProgressLocked(stub("credit_kingdom"), emptySave)).toBe(true);
    expect(isIslandProgressLocked(stub("signal_city"), emptySave)).toBe(true);
    expect(islandLockHint(stub(PAYCHECK_PENINSULA_ID), emptySave)).toMatch(/Cove Change/i);
    expect(islandLockHint(stub("signal_city"), emptySave)).toMatch(/Paycheck Change/i);
    expect(islandLockHint(stub("credit_kingdom"), emptySave)).toMatch(/Freedom|Paycheck/i);
  });
});
