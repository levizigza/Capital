/**
 * Spine-aligned concept definitions (curriculum Phases 0–5 seed).
 * Every unlock/advance uses proof predicates — never time or Next alone.
 * Design: docs/ftue/PROGRESSIVE_DISCLOSURE_DESIGN.md
 */

import type { ConceptDef } from "./types";
import { isWeakSolePredicate } from "./predicates";
import { primaryTransferPredicate } from "./transferTasks";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";

const hint = { maxHints: 3, escalateAfterFailures: 1 };
const retry = { maxAttempts: 5, stayPut: true };

/**
 * Seed registry — proves architecture on the iconic spine.
 * More curriculum ids can append without engine changes.
 */
export const CONCEPT_REGISTRY: ConceptDef[] = [
  {
    concept_id: "money_is_alive",
    prerequisites: [],
    trigger_condition: {
      type: "all_of",
      of: [
        { type: "island_discovered", islandId: HARBOR_HAVEN_ID },
        { type: "guided_hub_done" },
      ],
    },
    instruction: "Money is alive here — Harbor can remember what you choose.",
    attention_target: "npc:piggy_penny",
    practice_task: "Meet Piggy, voyage to Cove, and complete a Take Harbor will name.",
    success_condition: {
      type: "any_of",
      of: [
        { type: "irreversible_set", key: "cove_save_vs_spend" },
        { type: "scar_present", scarIdPrefix: "cove_" },
      ],
    },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("money_is_alive"),
    mastery_condition: {
      type: "all_of",
      of: [
        { type: "scar_present", scarIdPrefix: "cove_" },
        {
          type: "any_of",
          of: [
            { type: "scar_present", scarIdPrefix: "pp_" },
            { type: "scar_present", scarIdPrefix: "credit_" },
          ],
        },
      ],
    },
  },
  {
    concept_id: "earn_then_decide",
    prerequisites: [],
    trigger_condition: {
      type: "all_of",
      of: [
        { type: "island_discovered", islandId: COVE_ISLAND_ID },
        { type: "guided_hub_done" },
      ],
    },
    instruction: "Earn fair coins first — then a Take can stick.",
    attention_target: "npc:captain_penny",
    practice_task: "Finish First Coins (pouch + Coin Sort) before Kira’s lighthouse.",
    success_condition: { type: "quest_completed", questId: "q_cc_first_coins" },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("earn_then_decide"),
    mastery_condition: {
      type: "mastery_gate_cleared",
      gateId: "gate_coin_sort",
    },
  },
  {
    concept_id: "save_vs_spend",
    prerequisites: ["earn_then_decide"],
    trigger_condition: { type: "quest_completed", questId: "q_cc_first_coins" },
    instruction: "Jar before treat, or treat before jar — Harbor hears either.",
    attention_target: "npc:keeper_kira",
    practice_task: "Talk to Keeper Kira and commit a Take (not Maybe later).",
    success_condition: { type: "irreversible_set", key: "cove_save_vs_spend" },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("save_vs_spend"),
    mastery_condition: {
      type: "all_of",
      of: [
        { type: "irreversible_set", key: "cove_save_vs_spend" },
        { type: "quest_completed", questId: COVE_CHANGE_QUEST_ID },
      ],
    },
  },
  {
    concept_id: "irreversible_take",
    prerequisites: ["save_vs_spend"],
    trigger_condition: { type: "irreversible_set", key: "cove_save_vs_spend" },
    instruction: "A Take sticks forever — board the carpet when the hush settles.",
    attention_target: "cta:carpet_home",
    practice_task: "Leave the shore hush and return to Harbor on the Money Carpet.",
    success_condition: {
      type: "any_of",
      of: [
        { type: "scar_present", scarId: "cove_saver_plaque" },
        { type: "scar_present", scarId: "cove_spender_plaque" },
      ],
    },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("irreversible_take"),
    mastery_condition: {
      type: "all_of",
      of: [
        { type: "quest_completed", questId: COVE_CHANGE_QUEST_ID },
        {
          type: "any_of",
          of: [
            { type: "scar_present", scarIdPrefix: "pp_" },
            { type: "scar_present", scarIdPrefix: "credit_" },
          ],
        },
      ],
    },
  },
  {
    concept_id: "harbor_scar_memory",
    prerequisites: ["irreversible_take"],
    trigger_condition: {
      type: "any_of",
      of: [
        { type: "scar_present", scarId: "cove_saver_plaque" },
        { type: "scar_present", scarId: "cove_spender_plaque" },
      ],
    },
    instruction: "Harbor felt that — your plaque lives on the Plinth.",
    attention_target: "plinth",
    practice_task: "Witness the scar spectacle and talk to Piggy on quiet homecoming.",
    success_condition: { type: "quest_completed", questId: COVE_CHANGE_QUEST_ID },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("harbor_scar_memory"),
    mastery_condition: {
      type: "all_of",
      of: [
        { type: "scar_present", scarIdPrefix: "cove_" },
        { type: "scar_present", scarIdPrefix: "pp_" },
        { type: "scar_present", scarIdPrefix: "credit_" },
      ],
    },
  },
  {
    concept_id: "cashflow",
    prerequisites: ["harbor_scar_memory"],
    trigger_condition: {
      type: "all_of",
      of: [
        { type: "quest_completed", questId: COVE_CHANGE_QUEST_ID },
        { type: "guided_hub_done" },
      ],
    },
    instruction: "Income minus expenses is cashflow — it paints Harbor’s sky.",
    attention_target: "hud:cashflow",
    practice_task: "Check Cashflow on the plaza after Cove Change; watch weather shift.",
    success_condition: {
      type: "all_of",
      of: [
        { type: "quest_completed", questId: COVE_CHANGE_QUEST_ID },
        {
          type: "any_of",
          of: [
            { type: "island_discovered", islandId: PAYCHECK_PENINSULA_ID },
            { type: "has_freedom" },
          ],
        },
      ],
    },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("cashflow"),
    mastery_condition: { type: "has_freedom" },
  },
  {
    concept_id: "interest_compounds",
    prerequisites: ["harbor_scar_memory"],
    trigger_condition: {
      type: "all_of",
      of: [
        { type: "has_freedom" },
        { type: "island_discovered", islandId: CREDIT_KINGDOM_ID },
      ],
    },
    instruction: "Interest doesn’t yell — it compounds. Wait beats haste on the wall.",
    attention_target: "structure:interest_keep",
    practice_task: "Enter Credit Kingdom and face interest before the Ordeal Take.",
    success_condition: {
      type: "any_of",
      of: [
        { type: "scar_present", scarIdPrefix: "credit_" },
        { type: "irreversible_set", key: "credit_borrow_vs_wait" },
      ],
    },
    failure_condition: { type: "never" },
    hint_policy: hint,
    retry_policy: retry,
    transfer_task: primaryTransferPredicate("interest_compounds"),
    mastery_condition: {
      type: "irreversible_set",
      key: "credit_borrow_vs_wait",
    },
  },
];

export function getConceptDef(conceptId: string): ConceptDef | undefined {
  return CONCEPT_REGISTRY.find((c) => c.concept_id === conceptId);
}

export function listConceptIds(): string[] {
  return CONCEPT_REGISTRY.map((c) => c.concept_id);
}

/** Registry integrity — used by tests. */
export function validateConceptRegistry(defs: ConceptDef[] = CONCEPT_REGISTRY): string[] {
  const errors: string[] = [];
  const ids = new Set(defs.map((d) => d.concept_id));
  for (const def of defs) {
    for (const p of def.prerequisites) {
      if (!ids.has(p)) errors.push(`${def.concept_id}: missing prereq ${p}`);
    }
    if (isWeakSolePredicate(def.trigger_condition)) {
      errors.push(`${def.concept_id}: weak sole trigger ${def.trigger_condition.type}`);
    }
    if (isWeakSolePredicate(def.success_condition)) {
      errors.push(`${def.concept_id}: weak sole success ${def.success_condition.type}`);
    }
    if (isWeakSolePredicate(def.transfer_task)) {
      errors.push(`${def.concept_id}: weak sole transfer ${def.transfer_task.type}`);
    }
    if (isWeakSolePredicate(def.mastery_condition)) {
      errors.push(`${def.concept_id}: weak sole mastery ${def.mastery_condition.type}`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const byId = new Map(defs.map((d) => [d.concept_id, d]));
  function dfs(id: string): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      errors.push(`cycle at ${id}`);
      return;
    }
    visiting.add(id);
    for (const p of byId.get(id)?.prerequisites ?? []) dfs(p);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) dfs(id);
  return errors;
}
