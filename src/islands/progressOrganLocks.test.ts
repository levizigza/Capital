import { describe, expect, it } from "vitest";
import { islandLockHint } from "./progressGates";
import type { IslandDefinition, IslandSaveV1 } from "./types";

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
  it("names Coin on Paycheck gate and Spiral on Credit gate", () => {
    expect(islandLockHint(stub("paycheck_peninsula"), emptySave)).toMatch(/Coin holds/);
    expect(islandLockHint(stub("credit_kingdom"), emptySave)).toMatch(/Freedom Seal|Spiral/);
  });
});
