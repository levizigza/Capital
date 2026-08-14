/**
 * Risk / reward relationships — exposure, forks, recovery.
 * Losses should open decisions; recovery preserves scars.
 * @see docs/GAME_DESIGN_RISK_REWARD.md
 */

import type { IslandSaveV1 } from "./types";
import {
  addHolding,
  applyBill,
  ensureLedger,
  type LedgerHolding,
  type VoyagerLedger,
} from "./voyagerLedger";

export type SoftBeatRecoveryKind = "lookout" | "umbrella" | "battlement" | "ledger";

/** Soft Beat organ → which Take liability it can pay down (scar stays). */
export const SOFT_BEAT_DISCHARGE: Partial<Record<SoftBeatRecoveryKind, string>> = {
  lookout: "liability_treat_habit",
  umbrella: "liability_glitter_drip",
  battlement: "liability_haste_interest",
};

/** Named Take residues — spender/haste paths accept monthly exposure. */
export const TAKE_LIABILITY_BY_SCAR: Record<string, LedgerHolding> = {
  cove_spender_plaque: {
    id: "liability_treat_habit",
    name: "Treat Habit",
    kind: "liability",
    monthlyAmount: 5,
    icon: "🍭",
  },
  pp_spender_plaque: {
    id: "liability_glitter_drip",
    name: "Glitter Drip",
    kind: "liability",
    monthlyAmount: 6,
    icon: "✨",
  },
  credit_haste_plaque: {
    id: "liability_haste_interest",
    name: "Haste Interest",
    kind: "liability",
    monthlyAmount: 10,
    icon: "🌀",
  },
};

export type LiabilityTrapOffer = LedgerHolding & {
  /** Coins gained if you borrow (accept the −$/mo). */
  borrowCoins: number;
  /** Lump sum to refuse the monthly trap. */
  buyoutCost: number;
  /** One-time bill if you walk without borrowing. */
  walkBill: number;
};

export type LiabilityTrapChoice = "borrow" | "buyout" | "walk";

export function liabilityBuyoutCost(holding: LedgerHolding): number {
  return Math.max(18, holding.monthlyAmount * 3);
}

export function liabilityBorrowCoins(holding: LedgerHolding): number {
  return holding.monthlyAmount * 2;
}

export function liabilityWalkBill(holding: LedgerHolding): number {
  return holding.monthlyAmount;
}

export function toLiabilityTrapOffer(holding: LedgerHolding): LiabilityTrapOffer {
  return {
    ...holding,
    borrowCoins: liabilityBorrowCoins(holding),
    buyoutCost: liabilityBuyoutCost(holding),
    walkBill: liabilityWalkBill(holding),
  };
}

export function removeHolding(ledger: VoyagerLedger, holdingId: string): VoyagerLedger {
  if (!ledger.holdings.some((h) => h.id === holdingId)) return ledger;
  const removed = ledger.holdings.find((h) => h.id === holdingId)!;
  const holdings = ledger.holdings.filter((h) => h.id !== holdingId);
  const sign = removed.kind === "asset" ? "−" : "+";
  const delta =
    removed.kind === "asset" ? -removed.monthlyAmount : removed.monthlyAmount;
  const next: VoyagerLedger = { ...ledger, holdings };
  return {
    ...next,
    recentEvents: [
      {
        id: `paydown_${holdingId}_${Date.now()}`,
        ts: new Date().toISOString(),
        text: `Paid down ${removed.name} (${sign}$${removed.monthlyAmount}/mo cashflow). Scar memory stays.`,
        cashflowDelta: delta,
      },
      ...next.recentEvents,
    ].slice(0, 40),
  };
}

/** Idempotent: spender/haste scars write ledger exposure once. */
export function applyScarLedgerResidue(
  ledgerIn: VoyagerLedger | null | undefined,
  scarId: string,
): VoyagerLedger {
  const ledger = ensureLedger(ledgerIn);
  const residue = TAKE_LIABILITY_BY_SCAR[scarId];
  if (!residue) return ledger;
  if (ledger.holdings.some((h) => h.id === residue.id)) return ledger;
  return addHolding(ledger, residue);
}

export function resolveLiabilityTrapChoice(
  ledgerIn: VoyagerLedger | null | undefined,
  offer: LiabilityTrapOffer,
  choice: LiabilityTrapChoice,
  playerCoins: number,
): { ledger: VoyagerLedger; coins: number; message: string; ok: boolean } {
  const ledger = ensureLedger(ledgerIn);

  if (choice === "borrow") {
    const next = addHolding(ledger, {
      id: offer.id,
      name: offer.name,
      kind: offer.kind,
      monthlyAmount: offer.monthlyAmount,
      icon: offer.icon,
    });
    return {
      ok: true,
      ledger: next,
      coins: offer.borrowCoins,
      message: `Borrowed ${offer.borrowCoins} coins — ${offer.icon} ${offer.name} (−$${offer.monthlyAmount}/mo). Higher cash now, lasting exposure.`,
    };
  }

  if (choice === "buyout") {
    if (playerCoins < offer.buyoutCost) {
      return {
        ok: false,
        ledger,
        coins: 0,
        message: `Need ${offer.buyoutCost} coins to buy out ${offer.name} — borrow or walk.`,
      };
    }
    return {
      ok: true,
      ledger,
      coins: -offer.buyoutCost,
      message: `Bought out ${offer.name} for ${offer.buyoutCost} coins — no monthly trap.`,
    };
  }

  // walk
  const bill = applyBill(ledger, offer.walkBill, `${offer.name} walk-away fee`);
  return {
    ok: true,
    ledger: bill.ledger,
    coins: bill.coins,
    message: `Walked from ${offer.name} — one-time −${offer.walkBill} coins, no monthly holding.`,
  };
}

export type SoftBeatRecoveryOffer = {
  holdingId: string;
  name: string;
  monthlyAmount: number;
  cost: number;
  blurb: string;
};

/** Paydown offer at matching Soft Beat — consequence (scar) stays. */
export function softBeatRecoveryOffer(
  save: IslandSaveV1,
  kind: SoftBeatRecoveryKind,
): SoftBeatRecoveryOffer | null {
  const holdingId = SOFT_BEAT_DISCHARGE[kind];
  if (!holdingId) return null;
  const ledger = ensureLedger(save.voyagerLedger);
  const holding = ledger.holdings.find((h) => h.id === holdingId);
  if (!holding) return null;
  const cost = liabilityBuyoutCost(holding);
  return {
    holdingId: holding.id,
    name: holding.name,
    monthlyAmount: holding.monthlyAmount,
    cost,
    blurb: `Pay ${cost} coins to clear −$${holding.monthlyAmount}/mo. Your plaque stays — Harbor still remembers.`,
  };
}

export function applySoftBeatPaydown(
  save: IslandSaveV1,
  holdingId: string,
  playerCoins: number,
): { save: IslandSaveV1; coins: number; message: string; ok: boolean } {
  const offerCost = (() => {
    const h = ensureLedger(save.voyagerLedger).holdings.find((x) => x.id === holdingId);
    return h ? liabilityBuyoutCost(h) : 0;
  })();
  if (offerCost <= 0) {
    return { save, coins: 0, message: "Nothing left to pay down.", ok: false };
  }
  if (playerCoins < offerCost) {
    return {
      save,
      coins: 0,
      message: `Need ${offerCost} coins to pay down — earn, then return to this lookout.`,
      ok: false,
    };
  }
  const ledger = removeHolding(ensureLedger(save.voyagerLedger), holdingId);
  return {
    ok: true,
    coins: -offerCost,
    save: { ...save, voyagerLedger: ledger },
    message: `Paid down the spiral weight (−${offerCost} coins). Scar stays on the Plinth.`,
  };
}

/** Island Bank interest — only if assets sit on the ledger (return needs exposure). */
export function bankInterestCoins(ledgerIn: VoyagerLedger | null | undefined): {
  coins: number;
  message: string;
} {
  const ledger = ensureLedger(ledgerIn);
  const assets = ledger.holdings.filter((h) => h.kind === "asset");
  if (assets.length === 0) {
    return {
      coins: 0,
      message:
        "Island Bank: no income assets on the ledger — interest needs something at work. Land a Deal first.",
    };
  }
  const coins = Math.min(
    24,
    4 + assets.reduce((sum, a) => sum + a.monthlyAmount, 0),
  );
  return {
    coins,
    message: `Island Bank interest: +${coins} coins from ${assets.length} asset${assets.length === 1 ? "" : "s"}.`,
  };
}
