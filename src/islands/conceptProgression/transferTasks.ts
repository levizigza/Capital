/**
 * Transfer tasks — test the same RULE in a new surface, new numbers, no tutorial chrome.
 * Design: docs/ftue/TRANSFER_TASKS.md
 *
 * TRAINING = guided success_condition on the spine.
 * TRANSFER = success_predicate here (different context; no repeated button sequence).
 */

import type { ConceptPredicate } from "./types";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";

export type TransferScenarioDef = {
  scenarioId: string;
  concept_id: string;
  /** Underlying rule — what we measure, not UI sequence */
  rule: string;
  training: {
    context: string;
    guidance: string;
    numbers?: string;
  };
  transfer: {
    context: string;
    surface_change: string;
    numbers_change: string;
    guidance_removed: string;
    /** Multiple valid paths when appropriate */
    valid_strategies?: string[];
  };
  success_predicate: ConceptPredicate;
};

/** All foundational concepts — at least one transfer each. */
export const TRANSFER_SCENARIOS: TransferScenarioDef[] = [
  // —— Foundation ——
  {
    scenarioId: "ts_money_alive_pp_take",
    concept_id: "money_is_alive",
    rule: "Irreversible money choice becomes Harbor memory (not a resettable minigame).",
    training: { context: "Cove Kira Take + hush", guidance: "Alma foreshadow + footprint subline", numbers: "±$5/mo footprint" },
    transfer: {
      context: "Paycheck Vendor Vee rainy-day Take",
      surface_change: "Clock organ · umbrella vs glitter · Carlos not Alma",
      numbers_change: "Different NPCs · Paycheck stamp amounts",
      guidance_removed: "No Cove hush cinema replay · Bag does not re-teach organ toys",
      valid_strategies: ["protect", "spend"],
    },
    success_predicate: { type: "irreversible_set", key: "paycheck_protect_vs_spend" },
  },
  {
    scenarioId: "ts_walk_talk_cove_npc",
    concept_id: "walk_talk",
    rule: "Walk near · Talk when ready (E) — not global talk key.",
    training: { context: "Ashore pink ring + near gate", guidance: "Chamber copy · ring pulse" },
    transfer: {
      context: "Cove shore — Alma/Kira without Ashore ring UI",
      surface_change: "Different NPC positions · pier layout",
      numbers_change: "N/A",
      guidance_removed: "No n/3 rings · no chamber headline",
    },
    success_predicate: {
      type: "all_of",
      of: [
        { type: "island_discovered", islandId: COVE_ISLAND_ID },
        { type: "irreversible_set", key: "cove_save_vs_spend" },
      ],
    },
  },
  {
    scenarioId: "ts_carpet_paycheck",
    concept_id: "carpet_voyage",
    rule: "Money Carpet moves between Harbor and a painting.",
    training: { context: "Ashore dock board · first Cove voyage", guidance: "Board Cove painting gate" },
    transfer: {
      context: "Paycheck Peninsula after Cove Change",
      surface_change: "Clock painting · Payroll Tower",
      numbers_change: "Different island id",
      guidance_removed: "No Ashore dock nudge · map already opened once",
    },
    success_predicate: { type: "island_discovered", islandId: PAYCHECK_PENINSULA_ID },
  },
  // —— Coin organ ——
  {
    scenarioId: "ts_denoms_harbor_market",
    concept_id: "coin_denominations",
    rule: "Penny/nickel/dime/quarter values map to amounts.",
    training: { context: "Cove Coin Sort", guidance: "Clear-at threshold · organ tip on fail", numbers: "Explorer 20 / apprentice 35 pts" },
    transfer: {
      context: "Harbor market / Pasaran-style change (post-Cove)",
      surface_change: "Different buyer requests · market chrome",
      numbers_change: "Different target amounts",
      guidance_removed: "No Clear-at strip · no Penny quest chain",
    },
    success_predicate: { type: "mastery_gate_cleared", gateId: "gate_coin_sort" },
  },
  {
    scenarioId: "ts_exact_change_mastery",
    concept_id: "exact_change",
    rule: "Pay exact change — overpay costs points or wallet.",
    training: { context: "Coin Sort change-making rounds", guidance: "Score vs threshold" },
    transfer: {
      context: "Coin Sort mastery quiz",
      surface_change: "Literacy prompts not kinesthetic piles",
      numbers_change: "Quiz amounts differ from last sort run",
      guidance_removed: "No pile labels · no retry coach until fail tier 2+",
    },
    success_predicate: { type: "mastery_gate_cleared", gateId: "gate_coin_sort" },
  },
  {
    scenarioId: "ts_earn_decide_pp_budget",
    concept_id: "earn_then_decide",
    rule: "Earn/observe resources before an irreversible money decision.",
    training: { context: "Cove pouch + Coin Sort + Kira", guidance: "Penny quest · Bag horizons", numbers: "EarnSpend wallet + sort threshold" },
    transfer: {
      context: "Paycheck Pat stamp → Priya buckets → Vee Take",
      surface_change: "Paycheck income · budget bureau · rainy park",
      numbers_change: "Paycheck dollars · bucket splits · not Cove pouch",
      guidance_removed: "No First Coins quest title · no Cove clear-at",
      valid_strategies: ["budget_first", "rainy_quest_order"],
    },
    success_predicate: { type: "quest_completed", questId: "q_pp_budget_basics" },
  },
  {
    scenarioId: "ts_liquidity_pp_vendor",
    concept_id: "session_liquidity",
    rule: "Cannot meet an obligation without enough liquid wallet first.",
    training: { context: "Cove EarnSpend", guidance: "Not enough toast · disabled spend", numbers: "Cove job +$10–20 · buys $15–30" },
    transfer: {
      context: "Paycheck rainy-day spend choices (session wallet)",
      surface_change: "Vendor Vee · rainy fund item · different SKUs",
      numbers_change: "Different earn/spend table",
      guidance_removed: "No Cove EarnSpend module labels repeated",
      valid_strategies: ["earn_first", "skip_spend", "cheaper_buy"],
    },
    success_predicate: {
      type: "all_of",
      of: [
        { type: "quest_completed", questId: "q_pp_rainy_day" },
        { type: "island_discovered", islandId: PAYCHECK_PENINSULA_ID },
      ],
    },
  },
  {
    scenarioId: "ts_needs_wants_pp_buckets",
    concept_id: "needs_vs_wants",
    rule: "Sort spending into needs vs wants before optional treats.",
    training: { context: "Cove Shelly digression (optional)", guidance: "Side quest copy" },
    transfer: {
      context: "Paycheck Budget Split / Bureau",
      surface_change: "Three buckets · Priya whiteboard",
      numbers_change: "Paycheck expense cards",
      guidance_removed: "No Shelly fork labels on first screen",
    },
    success_predicate: { type: "quest_completed", questId: "q_pp_budget_basics" },
  },
  {
    scenarioId: "ts_save_spend_pp_umbrella",
    concept_id: "save_vs_spend",
    rule: "Protect future cashflow vs spend now — stance sticks in Harbor.",
    training: { context: "Cove jar vs treat", guidance: "Footprint subline · Kira rows", numbers: "±$5/mo jar hold vs treat tab" },
    transfer: {
      context: "Paycheck umbrella vs glitter",
      surface_change: "Clock organ · Vendor Vee · rainy fund",
      numbers_change: "Different holding ids · Paycheck ledger rows",
      guidance_removed: "No Alma/Kira copy · no Cove jar item parallel",
      valid_strategies: ["protect", "spend"],
    },
    success_predicate: { type: "irreversible_set", key: "paycheck_protect_vs_spend" },
  },
  {
    scenarioId: "ts_irreversible_credit",
    concept_id: "irreversible_take",
    rule: "Take commits permanently; carpet home after quiet.",
    training: { context: "Cove hush → carpet", guidance: "Chapter quiet · pier CTA" },
    transfer: {
      context: "Credit Kingdom wait vs borrow",
      surface_change: "Spiral organ · Interest Keep",
      numbers_change: "Different irreversible key",
      guidance_removed: "No Cove coin jar mark flash",
      valid_strategies: ["wait", "borrow"],
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_coin_hold_soft_beat",
    concept_id: "coin_hold",
    rule: "Hold savings quietly — jar still waits after spend temptation.",
    training: { context: "Cove saver Take + Soft Beat (optional)", guidance: "Kid sentence · Coin organ" },
    transfer: {
      context: "Paycheck umbrella loft Soft Beat",
      surface_change: "Clock shelter copy",
      numbers_change: "Rainy-day fund amount",
      guidance_removed: "No Cove organ hush replay",
    },
    success_predicate: { type: "scar_present", scarIdPrefix: "pp_" },
  },
  {
    scenarioId: "ts_scar_memory_day2",
    concept_id: "harbor_scar_memory",
    rule: "Harbor remembers plaque — locals/Piggy name it later.",
    training: { context: "First spectacle + homecoming", guidance: "Plinth glow · forced Piggy Talk" },
    transfer: {
      context: "Day-2 scar echo rumor",
      surface_change: "Ritual rumor · plaza gossip",
      numbers_change: "Different scar label possible (Paycheck)",
      guidance_removed: "No spectacle camera lock",
    },
    success_predicate: {
      type: "all_of",
      of: [
        { type: "quest_completed", questId: COVE_CHANGE_QUEST_ID },
        { type: "scar_present", scarIdPrefix: "pp_" },
      ],
    },
  },
  // —— Harbor ledger ——
  {
    scenarioId: "ts_income_harbor_deal",
    concept_id: "income",
    rule: "Income line rises when +$/mo assets added.",
    training: { context: "First ledger HUD after Cove Change", guidance: "keep + wording" },
    transfer: {
      context: "Harbor deal purchase (Shell Booth / jar)",
      surface_change: "Deal toast · different asset name",
      numbers_change: "Different +$/mo amount",
      guidance_removed: "No first-meet quiet strip explanation",
    },
    success_predicate: { type: "has_freedom" },
  },
  {
    scenarioId: "ts_expenses_liability_deal",
    concept_id: "expenses",
    rule: "Expenses rise with −$/mo obligations.",
    training: { context: "Cove treat tab footprint", guidance: "drain − on hush" },
    transfer: {
      context: "Harbor liability deal or spender Take",
      surface_change: "Different liability label",
      numbers_change: "Different monthly drain",
      guidance_removed: "No Kira treat row",
    },
    success_predicate: {
      type: "any_of",
      of: [
        { type: "scar_present", scarId: "cove_spender_plaque" },
        { type: "irreversible_set", key: "paycheck_protect_vs_spend" },
      ],
    },
  },
  {
    scenarioId: "ts_cashflow_weather",
    concept_id: "cashflow",
    rule: "Net cashflow drives Harbor weather / freedom chase.",
    training: { context: "Cove Take → fair vs tight sky", guidance: "Footprint strip" },
    transfer: {
      context: "Post-deal plaza · Freedom chase",
      surface_change: "Seal streak · shop soft prices",
      numbers_change: "Target $30+/mo · 3 Pay Days",
      guidance_removed: "No Cove hush numbers",
    },
    success_predicate: { type: "has_freedom" },
  },
  {
    scenarioId: "ts_asset_second_deal",
    concept_id: "asset",
    rule: "Asset = recurring keep +$/mo, not one-time pouch coins.",
    training: { context: "Cove jar hold asset", guidance: "Monthly keep line" },
    transfer: {
      context: "Harbor second income asset",
      surface_change: "Different deal card",
      numbers_change: "Different monthly + amount",
      guidance_removed: "No jar/treat choice UI",
    },
    success_predicate: { type: "has_freedom" },
  },
  {
    scenarioId: "ts_liability_stack",
    concept_id: "liability",
    rule: "Liability = recurring drain −$/mo.",
    training: { context: "Cove treat tab", guidance: "Monthly drain line" },
    transfer: {
      context: "Credit debt loadout / Harbor liability deal",
      surface_change: "Debt canyon · different icon",
      numbers_change: "Higher monthly drain",
      guidance_removed: "No treat-before-jar narrative",
    },
    success_predicate: {
      type: "any_of",
      of: [
        { type: "scar_present", scarIdPrefix: "credit_" },
        { type: "island_discovered", islandId: CREDIT_KINGDOM_ID },
      ],
    },
  },
  {
    scenarioId: "ts_payday_ritual",
    concept_id: "pay_day",
    rule: "Monthly cashflow credited on Pay Day rhythm.",
    training: { context: "First ritual after Cove Change", guidance: "Ritual modal intro" },
    transfer: {
      context: "Second+ Pay Day toward Freedom streak",
      surface_change: "Streak counter · no first-time modal",
      numbers_change: "Streak 2/3+",
      guidance_removed: "No auto-open ritual coach",
    },
    success_predicate: { type: "has_freedom" },
  },
  {
    scenarioId: "ts_weather_storm_loop",
    concept_id: "harbor_weather",
    rule: "Low cashflow / haste → tight or storm sky (feedback loop).",
    training: { context: "Spender Cove Take fog", guidance: "Optional Bag weather tip" },
    transfer: {
      context: "Credit haste scar + Harbor return",
      surface_change: "Spiral fog · feedbackLoopLine",
      numbers_change: "Different scar source",
      guidance_removed: "No emerald/rose-only polarity",
    },
    success_predicate: { type: "scar_present", scarIdPrefix: "credit_" },
  },
  // —— Clock organ ——
  {
    scenarioId: "ts_paycheck_income_inbox",
    concept_id: "paycheck_income",
    rule: "Timed paycheck arrives and must be allocated.",
    training: { context: "Pat first paycheck dialogue", guidance: "Main street quest" },
    transfer: {
      context: "Inbox Storm minigame",
      surface_change: "Arcade time pressure · inbox piles",
      numbers_change: "Storm score threshold",
      guidance_removed: "No Pat intro chain",
    },
    success_predicate: { type: "minigame_completed", minigameId: "mg_inbox_storm" },
  },
  {
    scenarioId: "ts_buckets_envelope",
    concept_id: "budget_buckets",
    rule: "Split income across needs/wants/savings buckets.",
    training: { context: "Budget Bureau drag", guidance: "Priya whiteboard" },
    transfer: {
      context: "Envelope budget module (different UI)",
      surface_change: "Envelope drag not bucket cards",
      numbers_change: "Different split targets",
      guidance_removed: "No Priya talk gate",
    },
    success_predicate: { type: "quest_completed", questId: "q_pp_budget_basics" },
  },
  {
    scenarioId: "ts_emergency_credit_shock",
    concept_id: "emergency_fund",
    rule: "Reserved fund absorbs shock instead of impulse spend.",
    training: { context: "Carlos rainy-day quest", guidance: "Umbrella loft beat" },
    transfer: {
      context: "Credit emergency ledger event (post-unlock)",
      surface_change: "Spiral shock card",
      numbers_change: "Different shock amount",
      guidance_removed: "No Carlos coach line",
    },
    success_predicate: { type: "island_discovered", islandId: CREDIT_KINGDOM_ID },
  },
  {
    scenarioId: "ts_protect_spend_pp",
    concept_id: "protect_vs_spend",
    rule: "Shelter before glitter — Clock stance on rainy-day Take.",
    training: { context: "Paycheck Vee Take (guided)", guidance: "Foreshadow rows" },
    transfer: {
      context: "Credit wait vs borrow (Clock sister organ)",
      surface_change: "Spiral ordeal · no umbrella metaphor",
      numbers_change: "Borrow APR vs wait delay",
      guidance_removed: "No Vee dialogue replay",
      valid_strategies: ["wait", "borrow"],
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_plan_impulse_tip",
    concept_id: "plan_vs_impulse",
    rule: "Plan buckets before tip vs tip-first haste.",
    training: { context: "Paycheck tip digression", guidance: "Side quest Bag" },
    transfer: {
      context: "Spiral patience vs haste scar",
      surface_change: "Credit Take · fog loop",
      numbers_change: "Different stance delta",
      guidance_removed: "No tip NPC intro",
      valid_strategies: ["wait", "borrow", "haste_path"],
    },
    success_predicate: { type: "scar_present", scarIdPrefix: "credit_" },
  },
  // —— Gate ——
  {
    scenarioId: "ts_freedom_seal_chase",
    concept_id: "freedom_seal",
    rule: "Sustain target cashflow for N Pay Days — not one lucky month.",
    training: { context: "First seal streak UI", guidance: "Bag Freedom horizon" },
    transfer: {
      context: "Credit unlock gate (needs Freedom + mastery)",
      surface_change: "Spiral lock copy · mastery counter",
      numbers_change: "Mastery 3/3 + escaped",
      guidance_removed: "No first streak celebration replay",
    },
    success_predicate: {
      type: "all_of",
      of: [
        { type: "has_freedom" },
        { type: "island_discovered", islandId: CREDIT_KINGDOM_ID },
      ],
    },
  },
  {
    scenarioId: "ts_mastery_spiral_gate",
    concept_id: "mastery_clear",
    rule: "Mastery quiz proves literacy after kinesthetic clear.",
    training: { context: "Cove Coin Sort mastery", guidance: "Quiz-only retry on fail" },
    transfer: {
      context: "Paycheck / Credit mastery gates",
      surface_change: "Different organ quiz items",
      numbers_change: "Different gate id",
      guidance_removed: "No Coin Sort pad replay required after quiz pass",
    },
    success_predicate: { type: "mastery_gate_cleared", gateId: "gate_coin_sort" },
  },
  // —— Spiral organ ——
  {
    scenarioId: "ts_debt_canyon",
    concept_id: "debt",
    rule: "Borrowed money creates ongoing weight — not free pouch coins.",
    training: { context: "Credit entry framing", guidance: "Debt loadout intro" },
    transfer: {
      context: "Borrow Take + ledger liability",
      surface_change: "Debt Collector digression",
      numbers_change: "Different principal",
      guidance_removed: "No Cove pouch metaphor",
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_interest_apr_wall",
    concept_id: "interest_compounds",
    rule: "Interest grows over time — haste feeds compounding.",
    training: { context: "Interest Keep Soft Beat", guidance: "Kid sentence on wall" },
    transfer: {
      context: "APR as true price on borrow path",
      surface_change: "Battlement score · Rex dialogue",
      numbers_change: "Different APR display",
      guidance_removed: "No battlement arm whisper until armed",
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_patience_haste_take",
    concept_id: "patience_vs_haste",
    rule: "Wait defers cost; haste pays now and later.",
    training: { context: "Credit Soft Beat arm", guidance: "Lookout whisper" },
    transfer: {
      context: "Borrow Take without Soft Beat priming",
      surface_change: "Ordeal dialogue only",
      numbers_change: "Different borrow limit",
      guidance_removed: "No arm overlay",
      valid_strategies: ["wait", "borrow"],
    },
    success_predicate: {
      type: "any_of",
      of: [
        { type: "irreversible_set", key: "credit_borrow_vs_wait" },
        { type: "scar_present", scarIdPrefix: "credit_" },
      ],
    },
  },
  {
    scenarioId: "ts_on_time_streak",
    concept_id: "on_time_history",
    rule: "Payment history streak unlocks better terms.",
    training: { context: "Credit inbox / dispatch minigames", guidance: "On-time copy" },
    transfer: {
      context: "Different payment window event",
      surface_change: "New NPC tone scar",
      numbers_change: "Different streak length",
      guidance_removed: "No first on-time tutorial toast",
    },
    success_predicate: { type: "scar_present", scarIdPrefix: "credit_" },
  },
  {
    scenarioId: "ts_apr_true_price",
    concept_id: "apr",
    rule: "APR is the true price of borrow — compare to wait.",
    training: { context: "Credit literacy dialogue", guidance: "Rex/Cleo lines" },
    transfer: {
      context: "Mastery quiz APR item",
      surface_change: "Quiz not dialogue",
      numbers_change: "Different loan amount in prompt",
      guidance_removed: "No NPC hint until fail tier 3+",
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_utilization_borrow_path",
    concept_id: "credit_utilization",
    rule: "Using most of a limit hurts score / options.",
    training: { context: "Credit utilization minigame", guidance: "Meter chrome" },
    transfer: {
      context: "Borrow Take with high utilization subtext",
      surface_change: "Ordeal dialogue · debt loadout",
      numbers_change: "Different borrow ceiling",
      guidance_removed: "No meter tutorial overlay",
      valid_strategies: ["wait", "borrow"],
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_wait_borrow_ordeal",
    concept_id: "wait_vs_borrow",
    rule: "Wait saves interest; borrow gets cash now with future drain.",
    training: { context: "Credit Ordeal Talk", guidance: "Foreshadow rows" },
    transfer: {
      context: "Second credit choice / digression",
      surface_change: "Different NPC · side chamber",
      numbers_change: "Different borrow amount",
      guidance_removed: "No Cove-style hush",
      valid_strategies: ["wait", "borrow"],
    },
    success_predicate: { type: "irreversible_set", key: "credit_borrow_vs_wait" },
  },
  {
    scenarioId: "ts_obligation_digression",
    concept_id: "bank_of_obligation",
    rule: "Obligations persist as characters/places — not one-line debits.",
    training: { context: "Credit digression Bank metaphor", guidance: "Collector listen beat" },
    transfer: {
      context: "Harbor gossip names obligation without signpost",
      surface_change: "Plaza rumor · myth shelf",
      numbers_change: "Different obligation label",
      guidance_removed: "No Bank of Obligation title card",
    },
    success_predicate: { type: "scar_present", scarIdPrefix: "credit_" },
  },
];

const byConcept = new Map<string, TransferScenarioDef[]>();
const byScenario = new Map<string, TransferScenarioDef>();

for (const s of TRANSFER_SCENARIOS) {
  byScenario.set(s.scenarioId, s);
  const list = byConcept.get(s.concept_id) ?? [];
  list.push(s);
  byConcept.set(s.concept_id, list);
}

export function getTransferScenario(scenarioId: string): TransferScenarioDef | undefined {
  return byScenario.get(scenarioId);
}

export function getPrimaryTransferScenario(conceptId: string): TransferScenarioDef | undefined {
  return byConcept.get(conceptId)?.[0];
}

export function listTransferConceptIds(): string[] {
  return [...byConcept.keys()];
}

/** Predicate for concept registry transfer_task slot */
export function primaryTransferPredicate(conceptId: string): ConceptPredicate {
  const s = getPrimaryTransferScenario(conceptId);
  if (!s) return { type: "never" };
  return { type: "transfer_scenario_passed", scenarioId: s.scenarioId };
}
