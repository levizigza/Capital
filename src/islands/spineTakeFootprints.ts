/**
 * Spine Take ledger footprints — Cove / Paycheck / Credit.
 *
 * Law: irreversible Takes must change what is possible later in the sim
 * (cashflow → weather → shops), not only plaque memory.
 * Same campaign unlock path is OK if the world diverges.
 */

import type { IslandSaveV1 } from "./types";
import { addHolding, ensureLedger } from "./voyagerLedger";
import {
  applyCoveTakeLedgerFootprint,
  coveTakeStanceFromChoiceId,
  COVE_TAKE_KEY,
  COVE_JAR_HOLD_ID,
  COVE_TREAT_TAB_ID,
  COVE_JAR_MONTHLY,
  COVE_TREAT_MONTHLY,
  takeFootprintFeedbackLine as coveFootprintLine,
} from "./firstFinancialScenario";

export {
  applyCoveTakeLedgerFootprint,
  coveTakeStanceFromChoiceId,
  COVE_TAKE_KEY,
  COVE_JAR_HOLD_ID,
  COVE_TREAT_TAB_ID,
};

export const PAYCHECK_TAKE_KEY = "paycheck_protect_vs_spend";
export const CREDIT_TAKE_KEY = "credit_borrow_vs_wait";

export const PAYCHECK_UMBRELLA_HOLD_ID = "paycheck_umbrella_hold";
export const PAYCHECK_GLITTER_TAB_ID = "paycheck_glitter_tab";
export const CREDIT_PATIENCE_HOLD_ID = "credit_patience_hold";
export const CREDIT_INTEREST_TAB_ID = "credit_interest_tab";

export const PAYCHECK_UMBRELLA_MONTHLY = 4;
export const PAYCHECK_GLITTER_MONTHLY = 4;
export const CREDIT_PATIENCE_MONTHLY = 6;
export const CREDIT_INTEREST_MONTHLY = 8;

export type PaycheckTakeStance = "protect" | "spend";
export type CreditTakeStance = "wait" | "borrow";

export function paycheckTakeStanceFromChoiceId(choiceId: string): PaycheckTakeStance | null {
  if (choiceId === "protect") return "protect";
  if (choiceId === "spend") return "spend";
  return null;
}

export function creditTakeStanceFromChoiceId(choiceId: string): CreditTakeStance | null {
  if (choiceId === "wait") return "wait";
  if (choiceId === "borrow") return "borrow";
  return null;
}

/** Preview row before commit — sync with apply*Footprint monthly amounts. */
export function paycheckTakeStanceFootprintPreview(stance: PaycheckTakeStance): string {
  if (stance === "protect") {
    return `Monthly keep +$${PAYCHECK_UMBRELLA_MONTHLY}/mo · Umbrella Buffer — Known`;
  }
  return `Monthly drain −$${PAYCHECK_GLITTER_MONTHLY}/mo · Glitter Tab — Known`;
}

export function creditTakeStanceFootprintPreview(stance: CreditTakeStance): string {
  if (stance === "wait") {
    return `Monthly keep +$${CREDIT_PATIENCE_MONTHLY}/mo · Patience Reserve — Known`;
  }
  return `Monthly drain −$${CREDIT_INTEREST_MONTHLY}/mo · Interest Spiral Tab — Known`;
}

/** Unified spine Take preview for Talk Battle (Cove · Paycheck · Credit). */
export function spineTakeChoiceFootprintPreview(
  effects: { type: string; key?: string; choiceId?: string }[] | undefined,
): string | null {
  const irr = effects?.find((e) => e.type === "setIrreversible");
  if (!irr?.key || !irr.choiceId) return null;
  if (irr.key === COVE_TAKE_KEY) {
    const stance = coveTakeStanceFromChoiceId(irr.choiceId);
    if (!stance) return null;
    const sign = stance === "save" ? "+" : "−";
    const verb = stance === "save" ? "keep" : "drain";
    const amount = stance === "save" ? COVE_JAR_MONTHLY : COVE_TREAT_MONTHLY;
    const name = stance === "save" ? "Cove Jar Hold" : "Cove Treat Tab";
    return `Monthly ${verb} ${sign}$${amount}/mo · ${name} — Known`;
  }
  if (irr.key === PAYCHECK_TAKE_KEY) {
    const stance = paycheckTakeStanceFromChoiceId(irr.choiceId);
    return stance ? paycheckTakeStanceFootprintPreview(stance) : null;
  }
  if (irr.key === CREDIT_TAKE_KEY) {
    const stance = creditTakeStanceFromChoiceId(irr.choiceId);
    return stance ? creditTakeStanceFootprintPreview(stance) : null;
  }
  return null;
}

/** Paycheck Take → buffer asset or glitter liability (CF diverges). */
export function applyPaycheckTakeLedgerFootprint(
  save: IslandSaveV1,
  stance: PaycheckTakeStance,
): IslandSaveV1 {
  const ledger = ensureLedger(save.voyagerLedger);
  if (stance === "protect") {
    if (ledger.holdings.some((h) => h.id === PAYCHECK_UMBRELLA_HOLD_ID)) return save;
    return {
      ...save,
      voyagerLedger: addHolding(ledger, {
        id: PAYCHECK_UMBRELLA_HOLD_ID,
        name: "Umbrella Buffer",
        kind: "asset",
        monthlyAmount: PAYCHECK_UMBRELLA_MONTHLY,
        icon: "☂️",
      }),
    };
  }
  if (ledger.holdings.some((h) => h.id === PAYCHECK_GLITTER_TAB_ID)) return save;
  return {
    ...save,
    voyagerLedger: addHolding(ledger, {
      id: PAYCHECK_GLITTER_TAB_ID,
      name: "Glitter Tab",
      kind: "liability",
      monthlyAmount: PAYCHECK_GLITTER_MONTHLY,
      icon: "✨",
    }),
  };
}

/**
 * Credit Take → patience buffer or interest liability.
 * Borrow also pairs with haste scar weather (existing scar id) for storm risk.
 */
export function applyCreditTakeLedgerFootprint(
  save: IslandSaveV1,
  stance: CreditTakeStance,
): IslandSaveV1 {
  const ledger = ensureLedger(save.voyagerLedger);
  if (stance === "wait") {
    if (ledger.holdings.some((h) => h.id === CREDIT_PATIENCE_HOLD_ID)) return save;
    return {
      ...save,
      voyagerLedger: addHolding(ledger, {
        id: CREDIT_PATIENCE_HOLD_ID,
        name: "Patience Reserve",
        kind: "asset",
        monthlyAmount: CREDIT_PATIENCE_MONTHLY,
        icon: "⏳",
      }),
    };
  }
  if (ledger.holdings.some((h) => h.id === CREDIT_INTEREST_TAB_ID)) return save;
  return {
    ...save,
    voyagerLedger: addHolding(ledger, {
      id: CREDIT_INTEREST_TAB_ID,
      name: "Interest Spiral Tab",
      kind: "liability",
      monthlyAmount: CREDIT_INTEREST_MONTHLY,
      icon: "🌀",
    }),
  };
}

/** Apply footprint for any spine irreversible Take key. */
export function applySpineTakeLedgerFootprint(
  save: IslandSaveV1,
  key: string,
  choiceId: string,
): IslandSaveV1 {
  if (key === COVE_TAKE_KEY) {
    const stance = coveTakeStanceFromChoiceId(choiceId);
    return stance ? applyCoveTakeLedgerFootprint(save, stance) : save;
  }
  if (key === PAYCHECK_TAKE_KEY) {
    const stance = paycheckTakeStanceFromChoiceId(choiceId);
    return stance ? applyPaycheckTakeLedgerFootprint(save, stance) : save;
  }
  if (key === CREDIT_TAKE_KEY) {
    const stance = creditTakeStanceFromChoiceId(choiceId);
    return stance ? applyCreditTakeLedgerFootprint(save, stance) : save;
  }
  return save;
}

/** Unified footprint strip — Cove, Paycheck, or Credit holdings. */
export function takeFootprintFeedbackLine(save: IslandSaveV1): string | null {
  const cove = coveFootprintLine(save);
  if (cove) return cove;
  const ledger = ensureLedger(save.voyagerLedger);
  const holdings = [
    PAYCHECK_UMBRELLA_HOLD_ID,
    PAYCHECK_GLITTER_TAB_ID,
    CREDIT_PATIENCE_HOLD_ID,
    CREDIT_INTEREST_TAB_ID,
  ];
  for (const id of holdings) {
    const h = ledger.holdings.find((x) => x.id === id);
    if (!h) continue;
    const sign = h.kind === "asset" ? "+" : "−";
    const verb = h.kind === "asset" ? "keep" : "drain";
    return `Monthly ${verb} ${sign}$${h.monthlyAmount}/mo · ${h.name}`;
  }
  return null;
}
