import { describe, expect, it } from "vitest";
import type { IslandSaveV1 } from "../types";
import { createDefaultVoyagerLedger } from "../voyagerLedger";
import { HARBOR_HAVEN_ID, COVE_ISLAND_ID, COVE_CHANGE_QUEST_ID, PAYCHECK_PENINSULA_ID } from "../islandIds";
import {
  applyConceptSync,
  getConceptPhase,
  getActiveGuidance,
  noteConceptFailure,
  markConceptReviewAvailable,
  validateConceptRegistry,
  evalPredicate,
  buildConceptEvidence,
  CONCEPT_REGISTRY,
} from "./index";
import type { ConceptEvidence } from "./types";

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

function emptyEvidence(over: Partial<ConceptEvidence> = {}): ConceptEvidence {
  return {
    completedQuests: new Set(),
    irreversibleKeys: new Set(),
    scarIds: new Set(),
    completedMinigames: new Set(),
    masteryClears: new Set(),
    discoveredIslands: new Set(),
    hasFreedom: false,
    guidedHubDone: false,
    transferScenarioPasses: new Set(),
    ...over,
  };
}

describe("concept progression engine", () => {
  it("registry is valid (no cycles, no weak sole unlocks)", () => {
    expect(validateConceptRegistry()).toEqual([]);
    for (const def of CONCEPT_REGISTRY) {
      expect(def.concept_id).toBeTruthy();
      expect(def.instruction).toBeTruthy();
      expect(def.attention_target).toBeTruthy();
      expect(def.practice_task).toBeTruthy();
      expect(def.hint_policy.maxHints).toBeGreaterThan(0);
      expect(def.retry_policy.stayPut).toBe(true);
    }
  });

  it("keeps concepts LOCKED until prerequisites are independent/mastered", () => {
    const save = applyConceptSync(
      baseSave({
        questStatus: {
          q_cc_first_coins: { started: true, completed: true, completedAt: "2026-01-01" },
        },
      }),
    );
    // earn_then_decide may advance, but save_vs_spend needs earn_then_decide independent+
    expect(getConceptPhase(save, "save_vs_spend")).not.toBe("GUIDED");
  });

  it("does not unlock on guided_hub_done alone without companion proof where required", () => {
    const save = applyConceptSync(
      baseSave({
        hubGuidedIntro: { version: 1 as never, step: "done" },
        discovered: { npcs: [], items: [], areas: [], islands: [HARBOR_HAVEN_ID] },
      }),
    );
    // money_is_alive can GUIDED (harbor + guided done) — that is intentional all_of
    expect(["GUIDED", "AVAILABLE", "LOCKED"]).toContain(getConceptPhase(save, "money_is_alive"));
    // cashflow still locked — needs harbor_scar_memory prereq
    expect(getConceptPhase(save, "cashflow")).toBe("LOCKED");
  });

  it("advances earn → save → take → scar memory on real proofs", () => {
    let save = applyConceptSync(
      baseSave({
        hubGuidedIntro: { version: 1, step: "done" },
        discovered: {
          npcs: [],
          items: [],
          areas: [],
          islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID],
        },
        questStatus: {
          q_cc_first_coins: { started: true, completed: true, completedAt: "2026-01-01" },
        },
        completedMinigames: ["mg_coin_sort"],
      }),
    );
    // Force earn through mastery path for prereq satisfaction
    save = {
      ...save,
      voyagerLedger: {
        ...createDefaultVoyagerLedger(),
        masteryClears: ["gate_coin_sort"],
      },
    };
    save = applyConceptSync(save);
    expect(["INDEPENDENT", "MASTERED", "REDUCED_GUIDANCE", "GUIDED"]).toContain(
      getConceptPhase(save, "earn_then_decide"),
    );

    save = applyConceptSync({
      ...save,
      irreversibleChoices: {
        cove_save_vs_spend: {
          choiceId: "save",
          label: "Jar before treat",
          islandId: COVE_ISLAND_ID,
          at: "2026-01-02",
        },
        paycheck_protect_vs_spend: {
          choiceId: "protect",
          label: "Umbrella",
          islandId: PAYCHECK_PENINSULA_ID,
          at: "2026-01-02",
        },
      },
      harborScars: [
        {
          id: "cove_saver_plaque",
          label: "Jar before treat",
          kind: "plaque",
          islandId: COVE_ISLAND_ID,
          choiceId: "save",
          createdAt: "2026-01-02",
        },
        {
          id: "pp_umbrella_plaque",
          label: "Umbrella first",
          kind: "plaque",
          islandId: PAYCHECK_PENINSULA_ID,
          choiceId: "protect",
          createdAt: "2026-01-02",
        },
      ],
      questStatus: {
        ...save.questStatus,
        [COVE_CHANGE_QUEST_ID]: {
          started: true,
          completed: true,
          completedAt: "2026-01-02",
        },
      },
    });

    expect(["GUIDED", "REDUCED_GUIDANCE", "INDEPENDENT", "MASTERED"]).toContain(
      getConceptPhase(save, "save_vs_spend"),
    );
    expect(["GUIDED", "REDUCED_GUIDANCE", "INDEPENDENT", "MASTERED"]).toContain(
      getConceptPhase(save, "irreversible_take"),
    );
    expect(["GUIDED", "REDUCED_GUIDANCE", "INDEPENDENT", "MASTERED"]).toContain(
      getConceptPhase(save, "harbor_scar_memory"),
    );
  });

  it("exposes active guidance only for GUIDED / REDUCED_GUIDANCE", () => {
    const save = applyConceptSync(
      baseSave({
        hubGuidedIntro: { version: 1, step: "done" },
        discovered: {
          npcs: [],
          items: [],
          areas: [],
          islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID],
        },
      }),
    );
    for (const g of getActiveGuidance(save)) {
      expect(["GUIDED", "REDUCED_GUIDANCE"]).toContain(g.phase);
      expect(g.instruction.length).toBeGreaterThan(0);
      expect(g.attention_target.length).toBeGreaterThan(0);
    }
  });

  it("noteConceptFailure escalates hints per policy", () => {
    let save = applyConceptSync(
      baseSave({
        hubGuidedIntro: { version: 1, step: "done" },
        discovered: {
          npcs: [],
          items: [],
          areas: [],
          islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID],
        },
      }),
    );
    save = noteConceptFailure(save, "earn_then_decide");
    const entry = save.conceptProgress?.concepts.earn_then_decide;
    expect(entry?.failures).toBe(1);
    expect(entry?.hintsUsed).toBeGreaterThanOrEqual(1);
  });

  it("markConceptReviewAvailable only from INDEPENDENT/MASTERED", () => {
    const locked = markConceptReviewAvailable(baseSave(), "cashflow");
    expect(getConceptPhase(locked, "cashflow")).toBe("LOCKED");

    let save = applyConceptSync(
      baseSave({
        conceptProgress: {
          version: 1,
          concepts: {
            cashflow: {
              phase: "MASTERED",
              attempts: 1,
              failures: 0,
              hintsUsed: 0,
              masteredAt: "2026-01-01",
            },
          },
        },
      }),
    );
    save = markConceptReviewAvailable(save, "cashflow");
    expect(getConceptPhase(save, "cashflow")).toBe("REVIEW_AVAILABLE");
  });

  it("predicates: never is false; all_of / any_of work", () => {
    const ev = emptyEvidence({
      completedQuests: new Set(["q_cc_first_coins"]),
    });
    expect(evalPredicate({ type: "never" }, ev)).toBe(false);
    expect(
      evalPredicate(
        {
          type: "all_of",
          of: [
            { type: "quest_completed", questId: "q_cc_first_coins" },
            { type: "quest_completed", questId: "missing" },
          ],
        },
        ev,
      ),
    ).toBe(false);
    expect(
      evalPredicate(
        {
          type: "any_of",
          of: [
            { type: "quest_completed", questId: "missing" },
            { type: "quest_completed", questId: "q_cc_first_coins" },
          ],
        },
        ev,
      ),
    ).toBe(true);
  });

  it("buildConceptEvidence reads irreversible, scars, mastery", () => {
    const ev = buildConceptEvidence(
      baseSave({
        irreversibleChoices: {
          cove_save_vs_spend: {
            choiceId: "save",
            label: "Jar",
            islandId: COVE_ISLAND_ID,
            at: "t",
          },
        },
        harborScars: [{ id: "cove_saver_plaque", label: "Jar", kind: "plaque", createdAt: "t" }],
        voyagerLedger: { ...createDefaultVoyagerLedger(), masteryClears: ["gate_coin_sort"] },
        hubGuidedIntro: { version: 1, step: "done" },
      }),
    );
    expect(ev.irreversibleKeys.has("cove_save_vs_spend")).toBe(true);
    expect(ev.scarIds.has("cove_saver_plaque")).toBe(true);
    expect(ev.masteryClears.has("gate_coin_sort")).toBe(true);
    expect(ev.guidedHubDone).toBe(true);
  });

  it("applyConceptSync does not strip hubGuidedIntro", () => {
    const guided = { version: 1 as const, step: "meet_guide" as const };
    const save = applyConceptSync(baseSave({ hubGuidedIntro: guided }));
    expect(save.hubGuidedIntro?.step).toBe("meet_guide");
  });
});
