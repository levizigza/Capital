import { describe, expect, it } from "vitest";
import { createDefaultIslandSave } from "./save";
import { ensureLedger, netCashflow } from "./voyagerLedger";
import {
  applySpineTakeLedgerFootprint,
  COVE_TAKE_KEY,
  PAYCHECK_TAKE_KEY,
  CREDIT_TAKE_KEY,
  takeFootprintFeedbackLine,
} from "./spineTakeFootprints";
import { bossUnlockProgress, isIslandProgressLocked, islandLockHint } from "./progressGates";
import type { IslandDefinition, IslandSaveV1 } from "./types";
import { PAYCHECK_CHANGE_QUEST_ID } from "./islandIds";
import { harborWeatherMood, feedbackLoopLine } from "./harborWeather";

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

describe("spine Take footprints — world diverges", () => {
  it("Paycheck protect vs spend change cashflow opposite ways", () => {
    const base = createDefaultIslandSave();
    const protect = applySpineTakeLedgerFootprint(base, PAYCHECK_TAKE_KEY, "protect");
    const spend = applySpineTakeLedgerFootprint(base, PAYCHECK_TAKE_KEY, "spend");
    expect(netCashflow(ensureLedger(protect.voyagerLedger))).toBeGreaterThan(
      netCashflow(ensureLedger(spend.voyagerLedger)),
    );
    expect(takeFootprintFeedbackLine(protect)).toMatch(/Umbrella|keep/i);
    expect(takeFootprintFeedbackLine(spend)).toMatch(/Glitter|drain/i);
  });

  it("Credit wait vs borrow diverge CF and can tint weather", () => {
    const base = createDefaultIslandSave();
    const wait = applySpineTakeLedgerFootprint(base, CREDIT_TAKE_KEY, "wait");
    const borrow = applySpineTakeLedgerFootprint(base, CREDIT_TAKE_KEY, "borrow");
    expect(netCashflow(ensureLedger(wait.voyagerLedger))).toBeGreaterThan(
      netCashflow(ensureLedger(borrow.voyagerLedger)),
    );
    const stormish = {
      ...borrow,
      harborScars: [
        {
          id: "credit_haste_plaque",
          islandId: "credit_kingdom",
          choiceId: "borrow",
          label: "Haste",
          kind: "plaque" as const,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    expect(["storm", "tight", "fair", "boom"]).toContain(harborWeatherMood(stormish));
    expect(feedbackLoopLine(stormish) || feedbackLoopLine(borrow)).toBeTruthy();
  });

  it("Cove footprint still applies via spine helper", () => {
    const save = applySpineTakeLedgerFootprint(createDefaultIslandSave(), COVE_TAKE_KEY, "save");
    expect(takeFootprintFeedbackLine(save)).toMatch(/Jar|keep/i);
  });
});

describe("Credit unlock — Freedom + Paycheck transfer, not quiz", () => {
  it("stays locked with Freedom alone", () => {
    const save = {
      ...createDefaultIslandSave(),
      voyagerLedger: {
        ...ensureLedger(undefined),
        harborEscaped: true,
        masteryClears: ["gate_a", "gate_b", "gate_c"],
      },
      questStatus: {},
    } as IslandSaveV1;
    expect(bossUnlockProgress(save).unlocked).toBe(false);
    expect(isIslandProgressLocked(stub("credit_kingdom"), save)).toBe(true);
    expect(islandLockHint(stub("credit_kingdom"), save)).toMatch(/Paycheck Change/i);
  });

  it("opens with Freedom + Paycheck Change even with zero mastery clears", () => {
    const save = {
      ...createDefaultIslandSave(),
      voyagerLedger: {
        ...ensureLedger(undefined),
        harborEscaped: true,
        masteryClears: [],
      },
      questStatus: {
        [PAYCHECK_CHANGE_QUEST_ID]: {
          started: true,
          completed: true,
          completedObjectives: [],
          completedAt: new Date().toISOString(),
        },
      },
    } as IslandSaveV1;
    expect(bossUnlockProgress(save).unlocked).toBe(true);
    expect(isIslandProgressLocked(stub("credit_kingdom"), save)).toBe(false);
  });
});
