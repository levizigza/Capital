import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyConceptSync, getConceptPhase } from "../conceptProgression/engine";
import { noteTransferAttempt } from "../conceptProgression/transferMetrics";
import { createDefaultVoyagerLedger } from "../voyagerLedger";
import type { IslandSaveV1 } from "../types";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";
import { coinBagIslandTip } from "../story/coinBagBuddy";
import {
  isUnguidedTransferOpen,
  shouldMutePrincipleReteach,
  stampIndependentTransferWindows,
} from "./index";

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

function trainedCoveSave(over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  return applyConceptSync(
    baseSave({
      hubGuidedIntro: { version: 1, step: "done" },
      discovered: {
        npcs: [],
        items: [],
        areas: [],
        islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID],
      },
      questStatus: {
        q_cc_first_coins: { started: true, completed: true, completedAt: "t" },
        [COVE_CHANGE_QUEST_ID]: { started: true, completed: true, completedAt: "t" },
      },
      completedMinigames: ["mg_coin_sort"],
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
          label: "Jar before treat",
          kind: "plaque",
          islandId: COVE_ISLAND_ID,
          choiceId: "save",
          createdAt: "t",
        },
      ],
      ...over,
    }),
  );
}

describe("independent transfer teaching", () => {
  it("opens an unguided window when the Voyager lands on Paycheck after Cove Take", () => {
    const trained = trainedCoveSave();
    expect(isUnguidedTransferOpen(trained, PAYCHECK_PENINSULA_ID)).toBe(true);
    expect(shouldMutePrincipleReteach(trained, PAYCHECK_PENINSULA_ID)).toBe(true);
    expect(shouldMutePrincipleReteach(trained, COVE_ISLAND_ID)).toBe(false);

    const landed = stampIndependentTransferWindows({
      ...trained,
      currentIslandId: PAYCHECK_PENINSULA_ID,
      discovered: {
        ...trained.discovered,
        islands: [...trained.discovered.islands, PAYCHECK_PENINSULA_ID],
      },
    });
    expect(landed.conceptProgress?.concepts.save_vs_spend?.transferAttempts).toBeGreaterThanOrEqual(
      1,
    );
    expect(getConceptPhase(landed, "save_vs_spend")).not.toBe("INDEPENDENT");
  });

  it("does not stamp after the analogous Take is already committed", () => {
    const done = trainedCoveSave({
      currentIslandId: PAYCHECK_PENINSULA_ID,
      irreversibleChoices: {
        cove_save_vs_spend: {
          choiceId: "save",
          label: "Jar",
          islandId: COVE_ISLAND_ID,
          at: "t",
        },
        paycheck_protect_vs_spend: {
          choiceId: "protect",
          label: "Umbrella",
          islandId: PAYCHECK_PENINSULA_ID,
          at: "t2",
        },
      },
    });
    expect(isUnguidedTransferOpen(done, PAYCHECK_PENINSULA_ID)).toBe(false);
    const stamped = stampIndependentTransferWindows(done);
    expect(stamped.conceptProgress?.concepts.save_vs_spend?.transferAttempts ?? 0).toBe(
      done.conceptProgress?.concepts.save_vs_spend?.transferAttempts ?? 0,
    );
  });

  it("Coin Bag points at Vee without naming the Cove mapping", () => {
    const save = trainedCoveSave({
      currentIslandId: PAYCHECK_PENINSULA_ID,
      questStatus: {
        q_cc_first_coins: { started: true, completed: true, completedAt: "t" },
        [COVE_CHANGE_QUEST_ID]: { started: true, completed: true, completedAt: "t" },
        q_pp_rainy_day: {
          started: true,
          completed: false,
          completedObjectives: ["talk:npc_coach_carlos"],
        },
      },
    });
    const tip = coinBagIslandTip(save, {
      id: PAYCHECK_PENINSULA_ID,
      name: "Paycheck Peninsula",
    } as never);
    expect(tip.coach ?? "").not.toMatch(/This is the Take/i);
    expect(tip.coach ?? "").not.toMatch(/Umbrella before glitter, or glitter ate/);
    expect(`${tip.tip} ${tip.coach}`).not.toMatch(/Cove/);
    expect(`${tip.tip} ${tip.coach}`).toMatch(/Vee|fountain/i);
  });

  it("Paycheck dialogue never maps Cove jar onto the transfer Take", () => {
    const json = readFileSync(
      join(__dirname, "../content/paycheck-peninsula.islands.json"),
      "utf8",
    );
    expect(json).not.toMatch(/Cove's jar Take/);
    expect(json).not.toMatch(/Cove taught Coin Hold/);
    expect(json).not.toMatch(/This is the Take:/);
    expect(json).toMatch(/fountain broke/);
  });

  it("noteTransferAttempt is the stamp primitive", () => {
    const save = trainedCoveSave({ currentIslandId: PAYCHECK_PENINSULA_ID });
    const next = noteTransferAttempt(save, "save_vs_spend");
    expect(next.conceptProgress?.concepts.save_vs_spend?.transferAttempts).toBeGreaterThanOrEqual(1);
  });
});
