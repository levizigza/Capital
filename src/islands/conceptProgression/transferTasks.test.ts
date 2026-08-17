import { describe, expect, it } from "vitest";
import {
  TRANSFER_SCENARIOS,
  getPrimaryTransferScenario,
  listTransferConceptIds,
  primaryTransferPredicate,
} from "./transferTasks";
import { validateConceptRegistry } from "./registry";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyConceptSync, getConceptPhase, getConceptTransferMetrics } from "./engine";
import type { IslandSaveV1 } from "../types";
import { createDefaultVoyagerLedger } from "../voyagerLedger";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";

function baseSave(over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    voyagerLedger: createDefaultVoyagerLedger(),
    ...over,
  };
}

describe("transfer tasks catalog", () => {
  it("covers every foundational concept at least once", () => {
    const ids = listTransferConceptIds();
    expect(ids.length).toBeGreaterThanOrEqual(30);
    expect(ids).toContain("save_vs_spend");
    expect(ids).toContain("session_liquidity");
    expect(ids).toContain("cashflow");
    for (const s of TRANSFER_SCENARIOS) {
      expect(s.rule.length).toBeGreaterThan(10);
      expect(s.training.context).toBeTruthy();
      expect(s.transfer.context).toBeTruthy();
      expect(s.transfer.guidance_removed).toBeTruthy();
      expect(s.scenarioId.startsWith("ts_")).toBe(true);
    }
  });

  it("transfer predicates differ from repeating Cove-only training proofs", () => {
    const saveSpend = getPrimaryTransferScenario("save_vs_spend")!;
    expect(saveSpend.scenarioId).toBe("ts_save_spend_pp_umbrella");
    expect(JSON.stringify(saveSpend.success_predicate)).toMatch(/paycheck_protect_vs_spend/);
    expect(JSON.stringify(saveSpend.success_predicate)).not.toMatch(/cove_saver_plaque/);
  });

  it("registry transfer_task uses transfer_scenario_passed", () => {
    expect(validateConceptRegistry()).toEqual([]);
    const pred = primaryTransferPredicate("earn_then_decide");
    expect(pred).toEqual({
      type: "transfer_scenario_passed",
      scenarioId: "ts_earn_decide_pp_budget",
    });
  });

  it("docs catalog exists", () => {
    const doc = readFileSync(join(__dirname, "../../../docs/ftue/TRANSFER_TASKS.md"), "utf8");
    expect(doc).toMatch(/guided_success/);
    expect(doc).toMatch(/session_liquidity/);
    expect(doc).toMatch(/ts_liquidity_pp_vendor/);
  });
});

describe("transfer metrics on save", () => {
  it("marks save_vs_spend INDEPENDENT only after Paycheck transfer pass", () => {
    let save = applyConceptSync(
      baseSave({
        hubGuidedIntro: { version: 1, step: "done" },
        discovered: {
          npcs: [],
          items: [],
          areas: [],
          islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID, PAYCHECK_PENINSULA_ID],
        },
        questStatus: {
          q_cc_first_coins: { started: true, completed: true, completedAt: "t" },
          q_pp_budget_basics: { started: true, completed: true, completedAt: "t" },
          [COVE_CHANGE_QUEST_ID]: { started: true, completed: true, completedAt: "t" },
        },
        completedMinigames: ["mg_coin_sort"],
        voyagerLedger: {
          ...createDefaultVoyagerLedger(),
          masteryClears: ["gate_coin_sort"],
        },
        irreversibleChoices: {
          cove_save_vs_spend: {
            choiceId: "save",
            label: "Jar",
            islandId: COVE_ISLAND_ID,
            at: "t",
          },
        },
        harborScars: [
          {
            id: "cove_saver_plaque",
            label: "Jar",
            kind: "plaque",
            islandId: COVE_ISLAND_ID,
            choiceId: "save",
            createdAt: "t",
          },
        ],
      }),
    );

    // Cove training done — may be REDUCED_GUIDANCE but not INDEPENDENT until Paycheck Take
    const phaseBefore = getConceptPhase(save, "save_vs_spend");
    expect(["REDUCED_GUIDANCE", "GUIDED", "MASTERED"]).toContain(phaseBefore);
    expect(getConceptPhase(save, "save_vs_spend")).not.toBe("INDEPENDENT");

    save = applyConceptSync({
      ...save,
      irreversibleChoices: {
        ...save.irreversibleChoices,
        paycheck_protect_vs_spend: {
          choiceId: "protect",
          label: "Umbrella",
          islandId: PAYCHECK_PENINSULA_ID,
          at: "t2",
        },
      },
    });

    expect(["INDEPENDENT", "MASTERED"]).toContain(getConceptPhase(save, "save_vs_spend"));
    expect(save.conceptTransferPasses?.ts_save_spend_pp_umbrella).toBeTruthy();

    const metrics = getConceptTransferMetrics(save, "save_vs_spend");
    expect(metrics?.transfer_success).toBe(true);
    expect(metrics?.guided_success).toBe(true);
    expect(metrics?.strategy_selected).toBe("protect");
  });
});
