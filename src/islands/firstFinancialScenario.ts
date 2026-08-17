/**
 * First playable financial scenario — Cove earn → Take → real ledger footprint.
 * Design: docs/ftue/FIRST_FINANCIAL_SCENARIO.md
 *
 * Uses production EarnSpend + irreversible Take + voyagerLedger.addHolding.
 * No tutorial-only money rules.
 */

import type { IslandSaveV1 } from "./types";
import { addHolding, ensureLedger, netCashflow } from "./voyagerLedger";
import { harborWeatherMood } from "./harborWeather";
import { COVE_CHANGE_QUEST_ID, COVE_ISLAND_ID } from "./islandIds";

export const FIRST_SCENARIO_ID = "first_cove_footprint" as const;

/** Ledger holdings born from the first irreversible Take (real cashflow). */
export const COVE_JAR_HOLD_ID = "cove_take_jar_hold";
export const COVE_TREAT_TAB_ID = "cove_take_treat_tab";

export const COVE_TAKE_KEY = "cove_save_vs_spend";

/** Monthly amounts written by the first Take — keep preview + apply in sync. */
export const COVE_JAR_MONTHLY = 5;
export const COVE_TREAT_MONTHLY = 5;

export type CoveTakeStance = "save" | "spend";

export type FirstScenarioBeat =
  | "notice"
  | "decide"
  | "act"
  | "see_change"
  | "consequence"
  | "understand"
  | "try_again";

/**
 * Apply real ledger footprint after Cove Take.
 * Scar/irreversible remain authoritative for memory; holdings move cashflow.
 * Idempotent per holding id — safe if called twice.
 */
export function applyCoveTakeLedgerFootprint(
  save: IslandSaveV1,
  stance: CoveTakeStance,
): IslandSaveV1 {
  const ledger = ensureLedger(save.voyagerLedger);
  if (stance === "save") {
    if (ledger.holdings.some((h) => h.id === COVE_JAR_HOLD_ID)) return save;
    return {
      ...save,
      voyagerLedger: addHolding(ledger, {
        id: COVE_JAR_HOLD_ID,
        name: "Cove Jar Hold",
        kind: "asset",
        monthlyAmount: COVE_JAR_MONTHLY,
        icon: "🫙",
      }),
    };
  }
  if (ledger.holdings.some((h) => h.id === COVE_TREAT_TAB_ID)) return save;
  return {
    ...save,
    voyagerLedger: addHolding(ledger, {
      id: COVE_TREAT_TAB_ID,
      name: "Cove Treat Tab",
      kind: "liability",
      monthlyAmount: COVE_TREAT_MONTHLY,
      icon: "🍬",
    }),
  };
}

/** Map dialogue choiceId → stance. Unknown → null (no ledger write). */
export function coveTakeStanceFromChoiceId(choiceId: string): CoveTakeStance | null {
  if (choiceId === "save") return "save";
  if (choiceId === "spend") return "spend";
  return null;
}

/**
 * After irreversible + optional footprint: cashflow delta the player can feel.
 * Positive when jar-hold asset; negative when treat-tab liability (vs baseline).
 */
export function firstScenarioCashflowDelta(save: IslandSaveV1): number {
  const ledger = ensureLedger(save.voyagerLedger);
  const base = createBaselineCashflow();
  return netCashflow(ledger) - base;
}

/**
 * Preview before the Take writes — trains WHAT TO WATCH at the decision.
 * Same wording as post-apply feedback lines.
 */
export function coveTakeStanceFootprintPreview(stance: CoveTakeStance): string {
  if (stance === "save") {
    return `Monthly keep +$${COVE_JAR_MONTHLY}/mo · Cove Jar Hold`;
  }
  return `Monthly drain −$${COVE_TREAT_MONTHLY}/mo · Cove Treat Tab`;
}

/** When a Talk choice is the Cove irreversible Take, return its footprint preview. */
export function coveTakeChoiceFootprintPreview(
  effects: { type: string; key?: string; choiceId?: string }[] | undefined,
): string | null {
  const irr = effects?.find(
    (e) => e.type === "setIrreversible" && e.key === COVE_TAKE_KEY,
  );
  if (!irr?.choiceId) return null;
  const stance = coveTakeStanceFromChoiceId(irr.choiceId);
  if (!stance) return null;
  return coveTakeStanceFootprintPreview(stance);
}

/**
 * Player-facing Take footprint strip — words + numbers, not color alone.
 * e.g. "Monthly keep +$5/mo · Cove Jar Hold"
 */
export function takeFootprintFeedbackLine(save: IslandSaveV1): string | null {
  const ledger = ensureLedger(save.voyagerLedger);
  const jar = ledger.holdings.find((h) => h.id === COVE_JAR_HOLD_ID);
  if (jar) {
    return `Monthly keep +$${jar.monthlyAmount}/mo · ${jar.name}`;
  }
  const tab = ledger.holdings.find((h) => h.id === COVE_TREAT_TAB_ID);
  if (tab) {
    return `Monthly drain −$${tab.monthlyAmount}/mo · ${tab.name}`;
  }
  return null;
}

function createBaselineCashflow(): number {
  // Matches createDefaultVoyagerLedger: 40 − 25
  return 15;
}

export function firstScenarioWeatherAfterTake(save: IslandSaveV1) {
  return harborWeatherMood(save);
}

/** Has the player completed the irreversible first footprint (either stance)? */
export function hasCompletedFirstFinancialTake(save: IslandSaveV1): boolean {
  return Boolean(save.irreversibleChoices?.[COVE_TAKE_KEY]);
}

/** Cove Change quest done — signature loop closed. */
export function hasClosedFirstFinancialLoop(save: IslandSaveV1): boolean {
  return Boolean(save.questStatus?.[COVE_CHANGE_QUEST_ID]?.completed);
}

export type FirstScenarioSnapshot = {
  scenarioId: typeof FIRST_SCENARIO_ID;
  islandId: typeof COVE_ISLAND_ID;
  takeKey: typeof COVE_TAKE_KEY;
  takeDone: boolean;
  stance: CoveTakeStance | null;
  hasJarHold: boolean;
  hasTreatTab: boolean;
  cashflowDelta: number;
  loopClosed: boolean;
  /** Beats already evidenced by save (not a forced checklist). */
  evidencedBeats: FirstScenarioBeat[];
};

export function snapshotFirstFinancialScenario(save: IslandSaveV1): FirstScenarioSnapshot {
  const rec = save.irreversibleChoices?.[COVE_TAKE_KEY];
  const stance = rec ? coveTakeStanceFromChoiceId(rec.choiceId) : null;
  const ledger = ensureLedger(save.voyagerLedger);
  const hasJarHold = ledger.holdings.some((h) => h.id === COVE_JAR_HOLD_ID);
  const hasTreatTab = ledger.holdings.some((h) => h.id === COVE_TREAT_TAB_ID);
  const takeDone = hasCompletedFirstFinancialTake(save);
  const loopClosed = hasClosedFirstFinancialLoop(save);
  const evidencedBeats: FirstScenarioBeat[] = ["notice", "decide", "act"];
  if (save.completedMinigames?.includes("mg_coin_sort")) {
    evidencedBeats.push("see_change");
  }
  if (takeDone) {
    evidencedBeats.push("consequence");
    if (hasJarHold || hasTreatTab) evidencedBeats.push("understand");
  }
  if (loopClosed || save.completedMinigames?.includes("mg_coin_sort")) {
    evidencedBeats.push("try_again");
  }
  return {
    scenarioId: FIRST_SCENARIO_ID,
    islandId: COVE_ISLAND_ID,
    takeKey: COVE_TAKE_KEY,
    takeDone,
    stance,
    hasJarHold,
    hasTreatTab,
    cashflowDelta: firstScenarioCashflowDelta(save),
    loopClosed,
    evidencedBeats: [...new Set(evidencedBeats)],
  };
}
