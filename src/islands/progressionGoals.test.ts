import { describe, expect, it } from "vitest";
import { createDefaultIslandSave } from "./save";
import {
  CARPET_PROGRESSION_CAP_ID,
  DEMOTED_NUMBER_PROGRESSION,
  nestedProgressionGoals,
  primaryProgressionTip,
  PROGRESSION_GOALS,
  creditUnlockDetail,
} from "./progressionGoals";
import { HARBOR_FREEDOM_ITEM } from "./progressGates";
import { ensureLedger } from "./voyagerLedger";
import {
  COVE_CHANGE_QUEST_ID,
  PAYCHECK_CHANGE_QUEST_ID,
  CREDIT_ORDEAL_QUEST_ID,
} from "./islandIds";

function withQuestDone(save: ReturnType<typeof createDefaultIslandSave>, questId: string) {
  return {
    ...save,
    questStatus: {
      ...save.questStatus,
      [questId]: { started: true, completed: true, completedObjectives: [] },
    },
  };
}

describe("progressionGoals", () => {
  it("requires a newDecision on every keep goal", () => {
    for (const g of PROGRESSION_GOALS) {
      expect(g.newDecision.trim().length).toBeGreaterThan(10);
      expect(g.overlaps.length).toBeGreaterThan(0);
    }
  });

  it("nests short Cove Take before medium Freedom", () => {
    const save = createDefaultIslandSave();
    const nest = nestedProgressionGoals(save);
    expect(nest.short?.id).toBe("short_cove_take");
    expect(nest.medium).toBeNull();
    expect(nest.long).toBeNull();
    expect(primaryProgressionTip(save)).toMatch(/Cove|Take/i);
  });

  it("after Cove Change, short Paycheck overlaps medium Freedom", () => {
    const save = withQuestDone(createDefaultIslandSave(), COVE_CHANGE_QUEST_ID);
    const nest = nestedProgressionGoals(save);
    expect(nest.short?.id).toBe("short_paycheck_take");
    expect(nest.medium?.id).toBe("medium_freedom");
    expect(nest.short?.overlaps).toContain("medium_freedom");
    expect(nest.medium?.overlaps).toContain("short_paycheck_take");
    expect(primaryProgressionTip(save)).toMatch(/Paycheck/i);
  });

  it("after Paycheck Take, medium Freedom owns the whisper", () => {
    let save = withQuestDone(createDefaultIslandSave(), COVE_CHANGE_QUEST_ID);
    save = withQuestDone(save, PAYCHECK_CHANGE_QUEST_ID);
    const nest = nestedProgressionGoals(save);
    expect(nest.short).toBeNull();
    expect(nest.medium?.id).toBe("medium_freedom");
    expect(primaryProgressionTip(save)).toMatch(/Freedom|cashflow/i);
  });

  it("lists demoted number-only chrome and carpet cap", () => {
    expect(DEMOTED_NUMBER_PROGRESSION).toContain("xp_level");
    expect(DEMOTED_NUMBER_PROGRESSION).toContain("wealth_rank_ladder");
    expect(DEMOTED_NUMBER_PROGRESSION).toContain("carpet_past_fortune_flyer");
    expect(CARPET_PROGRESSION_CAP_ID).toBe("fortune_flyer");
  });

  it("Freedom + mastery detail for long goal", () => {
    const save = createDefaultIslandSave();
    expect(creditUnlockDetail(save)).toMatch(/Freedom|mastery/i);

    const freed = {
      ...save,
      inventory: [...save.inventory, HARBOR_FREEDOM_ITEM],
      voyagerLedger: { ...ensureLedger(save.voyagerLedger), harborEscaped: true },
    };
    expect(creditUnlockDetail(freed)).toMatch(/mastery/i);

    const done = withQuestDone(freed, CREDIT_ORDEAL_QUEST_ID);
    expect(creditUnlockDetail(done)).toBeNull();
  });
});
