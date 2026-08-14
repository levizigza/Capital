/**
 * Replayability — possibility from the same mechanics, not new authored quests.
 * Randomness should open decisions; session seeds rotate boards / rivals.
 * @see docs/GAME_DESIGN_REPLAYABILITY.md
 */

import { mulberry32 } from "@/lib/seededRng";
import type { BoardPatternKind } from "./boardEconomy";
import type { EconomyPhase } from "./economy";
import type { PartyItemId } from "./partyItems";
import { PARTY_ITEM_POOL } from "./partyItems";
import type { RivalId } from "./partyRivals";
import { RIVAL_CAPTAINS } from "./partyRivals";
import {
  addHolding,
  applyBill,
  ensureLedger,
  type LedgerHolding,
  type VoyagerLedger,
} from "./voyagerLedger";

/** Hash island + seed into a 32-bit session seed. */
export function boardSessionSeed(islandId: string, rawSeed: number): number {
  let h = rawSeed >>> 0;
  for (let i = 0; i < islandId.length; i++) {
    h = Math.imul(h ^ islandId.charCodeAt(i), 0x9e3779b1) >>> 0;
  }
  return h || 1;
}

/** Rotate a fixed pattern so each session sees a different loop — no new content. */
export function rotateBoardPattern(
  pattern: readonly BoardPatternKind[],
  seed: number,
): BoardPatternKind[] {
  const offset = seed % Math.max(1, pattern.length);
  return [...pattern.slice(offset), ...pattern.slice(0, offset)];
}

/**
 * Bias pattern by macro economy — swap some slots toward bills or deals.
 * Same space vocabulary; different density per phase.
 */
export function biasPatternForEconomy(
  pattern: readonly BoardPatternKind[],
  phase: EconomyPhase | null | undefined,
  seed: number,
): BoardPatternKind[] {
  if (!phase || phase === "normal") return [...pattern];
  const rng = mulberry32(seed ^ 0xec011e);
  const next = [...pattern];
  for (let i = 0; i < next.length; i++) {
    if (rng() > 0.35) continue;
    const kind = next[i]!;
    if (phase === "recession" && (kind === "deal" || kind === "lucky" || kind === "bank")) {
      next[i] = "bill";
    } else if (phase === "boom" && (kind === "bill" || kind === "liability" || kind === "collector")) {
      next[i] = "deal";
    }
  }
  return next;
}

export function patternForBoardSession(
  base: readonly BoardPatternKind[],
  opts: { seed: number; phase?: EconomyPhase | null },
): BoardPatternKind[] {
  const rotated = rotateBoardPattern(base, opts.seed);
  return biasPatternForEconomy(rotated, opts.phase, opts.seed);
}

/** Pick `count` rival ids from the full captain pool (not always the first two). */
export function pickRivalIds(count: number, seed: number): RivalId[] {
  const rng = mulberry32(seed ^ 0x71fa17);
  const pool = [...RIVAL_CAPTAINS.map((c) => c.id)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = a;
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/** Two distinct capsule options — player chooses; RNG only nominates. */
export function pickCapsuleChoices(
  exclude: PartyItemId[] = [],
  seed = Math.floor(Math.random() * 1e9),
): [PartyItemId, PartyItemId] {
  const rng = mulberry32(seed >>> 0 || 1);
  const pool = PARTY_ITEM_POOL.filter((id) => !exclude.includes(id));
  const use = pool.length >= 2 ? pool : [...PARTY_ITEM_POOL];
  const shuffle = [...use];
  for (let i = shuffle.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = shuffle[i]!;
    shuffle[i] = shuffle[j]!;
    shuffle[j] = a;
  }
  return [shuffle[0]!, shuffle[1] ?? shuffle[0]!];
}

export type LuckyWindfallOffer = {
  amount: number;
  /** Coins if spend all now */
  spendAll: number;
  /** Coins now if bank half */
  bankNow: number;
  /** Coins deferred to next Pay Day if bank half */
  bankLater: number;
};

export function toLuckyWindfallOffer(amount: number): LuckyWindfallOffer {
  const spendAll = amount;
  const bankNow = Math.floor(amount / 2);
  const bankLater = amount - bankNow;
  return { amount, spendAll, bankNow, bankLater };
}

export type LiabilityTrapOffer = LedgerHolding & {
  borrowCoins: number;
  buyoutCost: number;
  walkBill: number;
};

export type LiabilityTrapChoice = "borrow" | "buyout" | "walk";

export function toLiabilityTrapOffer(holding: LedgerHolding): LiabilityTrapOffer {
  return {
    ...holding,
    borrowCoins: holding.monthlyAmount * 2,
    buyoutCost: Math.max(18, holding.monthlyAmount * 3),
    walkBill: holding.monthlyAmount,
  };
}

export function resolveLiabilityTrapChoice(
  ledgerIn: VoyagerLedger | null | undefined,
  offer: LiabilityTrapOffer,
  choice: LiabilityTrapChoice,
  playerCoins: number,
): { ledger: VoyagerLedger; coins: number; message: string; ok: boolean } {
  const ledger = ensureLedger(ledgerIn);
  if (choice === "borrow") {
    return {
      ok: true,
      coins: offer.borrowCoins,
      ledger: addHolding(ledger, {
        id: offer.id,
        name: offer.name,
        kind: offer.kind,
        monthlyAmount: offer.monthlyAmount,
        icon: offer.icon,
      }),
      message: `Borrowed ${offer.borrowCoins} — ${offer.name} (−$${offer.monthlyAmount}/mo). Cash now, lasting exposure.`,
    };
  }
  if (choice === "buyout") {
    if (playerCoins < offer.buyoutCost) {
      return {
        ok: false,
        ledger,
        coins: 0,
        message: `Need ${offer.buyoutCost} coins to buy out — borrow or walk.`,
      };
    }
    return {
      ok: true,
      ledger,
      coins: -offer.buyoutCost,
      message: `Bought out ${offer.name} for ${offer.buyoutCost} — no monthly trap.`,
    };
  }
  const bill = applyBill(ledger, offer.walkBill, `${offer.name} walk-away`);
  return {
    ok: true,
    ledger: bill.ledger,
    coins: bill.coins,
    message: `Walked from ${offer.name} — one-time −${offer.walkBill}, no holding.`,
  };
}

/** Spender/haste Takes leave ledger residue so runs diverge after the same graphs. */
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
