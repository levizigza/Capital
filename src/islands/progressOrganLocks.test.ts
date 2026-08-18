import { describe, expect, it } from "vitest";
import { islandLockHint, isIslandProgressLocked } from "./progressGates";
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
  it("keeps Cove and Paycheck open from Harbor; Credit waits on Paycheck Change", () => {
    expect(isIslandProgressLocked(stub(COVE_ISLAND_ID), emptySave)).toBe(false);
    expect(isIslandProgressLocked(stub(PAYCHECK_PENINSULA_ID), emptySave)).toBe(false);
    expect(isIslandProgressLocked(stub("credit_kingdom"), emptySave)).toBe(true);
    expect(islandLockHint(stub("credit_kingdom"), emptySave)).toMatch(/Paycheck Change/);

    const afterPay = {
      ...emptySave,
      questStatus: {
        q_pp_rainy_day: { started: true, completed: true, completedObjectives: [] },
      },
    } as unknown as IslandSaveV1;
    expect(isIslandProgressLocked(stub("credit_kingdom"), afterPay)).toBe(false);
    expect(islandLockHint(stub("credit_kingdom"), afterPay)).toBeNull();
  });
});
