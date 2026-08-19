/**
 * Living Cashflow Commit — contextual Harbor deal selection.
 * Design: docs/design/STRONGEST_RECURRING_LOOP.md · docs/design/CAUSAL_STORY_ARCHITECTURE.md
 *
 * Law: Wait must sometimes be rational — two commits + wait, not Accept ≫ Pass.
 */

import type { HarborWeatherMood } from "./harborWeather";
import {
  HARBOR_DEALS,
  dealPurchaseCost,
  netCashflow,
  regenerateAssetDealOffer,
  type DealOffer,
  type VoyagerLedger,
} from "./voyagerLedger";

export type HarborOpportunityContext = {
  ledger: VoyagerLedger;
  mood: HarborWeatherMood;
  pouchCoins: number;
};

export type BoardDealChoices = {
  commitA: DealOffer;
  commitB: DealOffer;
  waitHint: string | null;
};

/** @deprecated Prefer harborWeatherMood(save) — CF bands only, ignores haste scars. */
export function moodFromCashflow(cf: number): HarborWeatherMood {
  if (cf >= 40) return "boom";
  if (cf >= 15) return "fair";
  if (cf >= 0) return "tight";
  return "storm";
}

export function buildHarborOpportunityContext(
  ledger: VoyagerLedger,
  pouchCoins: number,
  mood?: HarborWeatherMood,
): HarborOpportunityContext {
  const cf = netCashflow(ledger);
  return {
    ledger,
    mood: mood ?? moodFromCashflow(cf),
    pouchCoins,
  };
}

/**
 * Pick smallest vs largest (or mid) asset deals — deterministic for QA.
 */
export function pickDealPair(ctx: HarborOpportunityContext): BoardDealChoices | null {
  const owned = ctx.ledger.holdings.map((h) => h.id);
  const pool = HARBOR_DEALS.filter((d) => d.kind === "asset" && !owned.includes(d.id));
  if (pool.length === 0) return null;

  const ranked = [...pool].sort(
    (a, b) => dealPurchaseCost(a) - dealPurchaseCost(b) || a.monthlyAmount - b.monthlyAmount,
  );
  const small = ranked[0]!;
  let large = ranked[ranked.length - 1]!;
  const cf = netCashflow(ctx.ledger);

  if (
    (ctx.mood === "boom" || ctx.mood === "fair") &&
    ctx.pouchCoins >= dealPurchaseCost(large) &&
    cf >= 18 &&
    ctx.ledger.positivePaydayStreak >= 1
  ) {
    // boom path keeps largest as commit B
  } else if (ranked.length >= 2 && ctx.mood !== "storm") {
    large = ranked[1] ?? large;
  } else {
    large = small;
  }

  const commitA: DealOffer = { ...small, purchaseCost: dealPurchaseCost(small) };
  const commitB: DealOffer = { ...large, purchaseCost: dealPurchaseCost(large) };

  const waitHint =
    dealPassHint(ctx, commitB) ??
    dealPassHint(ctx, commitA) ??
    (ctx.mood === "storm" ? "Wait keeps your buffer in the storm." : null);

  return { commitA, commitB, waitHint };
}

export function pickContextualAssetDeal(ctx: HarborOpportunityContext): DealOffer | null {
  return pickDealPair(ctx)?.commitA ?? null;
}

export function resolveBoardDealChoices(ctx: HarborOpportunityContext): {
  choices: BoardDealChoices | null;
  message: string;
} {
  const pair = pickDealPair(ctx);
  if (pair) {
    const same = pair.commitA.id === pair.commitB.id;
    const waitLine = pair.waitHint ? ` ${pair.waitHint}` : "";
    if (same) {
      const o = pair.commitA;
      return {
        choices: pair,
        message: `Living Cashflow Commit: ${o.icon} ${o.name} — ${o.purchaseCost} coins for +$${o.monthlyAmount}/mo. Or wait.${waitLine}`,
      };
    }
    return {
      choices: pair,
      message:
        `Living Cashflow Commit: ${pair.commitA.icon} ${pair.commitA.name} (+$${pair.commitA.monthlyAmount}/mo, ${pair.commitA.purchaseCost} coins) ` +
        `vs ${pair.commitB.icon} ${pair.commitB.name} (+$${pair.commitB.monthlyAmount}/mo, ${pair.commitB.purchaseCost} coins). Or wait.${waitLine}`,
    };
  }
  const fallback = resolveBoardAssetDeal(ctx);
  return {
    choices: fallback.offer
      ? { commitA: fallback.offer, commitB: fallback.offer, waitHint: dealPassHint(ctx, fallback.offer) }
      : null,
    message: fallback.message,
  };
}

export function resolveBoardAssetDeal(
  ctx: HarborOpportunityContext,
): { offer: DealOffer; message: string } {
  const owned = ctx.ledger.holdings.map((h) => h.id);
  const contextual = pickContextualAssetDeal(ctx);
  if (contextual) {
    const waitHint = dealPassHint(ctx, contextual);
    return {
      offer: contextual,
      message: `Deal on the table: ${contextual.icon} ${contextual.name} — ${contextual.purchaseCost} coins for +$${contextual.monthlyAmount}/mo.${waitHint ? ` ${waitHint}` : ""}`,
    };
  }
  const gen = 1 + ctx.ledger.holdings.filter((h) => h.kind === "asset" && h.id.includes("_gen")).length;
  const offer = regenerateAssetDealOffer(owned, gen);
  return {
    offer,
    message: `Renewed deal: ${offer.icon} ${offer.name} — ${offer.purchaseCost} coins for +$${offer.monthlyAmount}/mo (catalog clear — new tradeoff).`,
  };
}

/** One-line literacy for Pass / Wait on the deal panel. */
export function dealPassHint(ctx: HarborOpportunityContext, offer: DealOffer): string | null {
  if (ctx.pouchCoins < offer.purchaseCost) {
    return "Wait keeps your buffer — earn first.";
  }
  if (ctx.mood === "storm" || ctx.mood === "tight") {
    return "Wait is often smart in tight weather.";
  }
  if (offer.purchaseCost >= 40 && ctx.pouchCoins < offer.purchaseCost + 15) {
    return "Wait keeps coins for the next bill.";
  }
  return null;
}

/** QA / dominance probe — Wait must be rational under storm + low pouch. */
export function isPassRationalForDeal(
  ctx: HarborOpportunityContext,
  offer: DealOffer,
): boolean {
  return dealPassHint(ctx, offer) !== null;
}

/** Wait is rational when either commit strains the pouch or weather is tight. */
export function isWaitRationalForDealPair(ctx: HarborOpportunityContext, pair: BoardDealChoices): boolean {
  if (pair.waitHint) return true;
  return (
    isPassRationalForDeal(ctx, pair.commitA) || isPassRationalForDeal(ctx, pair.commitB)
  );
}
