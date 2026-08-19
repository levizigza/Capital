/**
 * Living Cashflow Commit — contextual Harbor deal selection.
 * Design: docs/design/STRONGEST_RECURRING_LOOP.md · docs/design/CAUSAL_STORY_ARCHITECTURE.md
 *
 * Law: Wait (Pass) must sometimes be rational — not Accept ≫ Pass every lap.
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
 * Pick an asset deal where the rational choice shifts with liquidity + weather.
 * Deterministic — same ledger + pouch → same offer (replay-safe for QA).
 */
export function pickContextualAssetDeal(ctx: HarborOpportunityContext): DealOffer | null {
  const owned = ctx.ledger.holdings.map((h) => h.id);
  const pool = HARBOR_DEALS.filter((d) => d.kind === "asset" && !owned.includes(d.id));
  if (pool.length === 0) return null;

  const ranked = [...pool].sort(
    (a, b) => dealPurchaseCost(a) - dealPurchaseCost(b) || a.monthlyAmount - b.monthlyAmount,
  );
  const smallest = ranked[0]!;
  const largest = ranked[ranked.length - 1]!;
  const cf = netCashflow(ctx.ledger);

  let pick = smallest;
  const largestCost = dealPurchaseCost(largest);

  if (
    (ctx.mood === "boom" || ctx.mood === "fair") &&
    ctx.pouchCoins >= largestCost &&
    cf >= 18 &&
    ctx.ledger.positivePaydayStreak >= 1
  ) {
    pick = largest;
  } else if (ctx.mood === "storm" || ctx.pouchCoins < dealPurchaseCost(smallest) + 8) {
    pick = smallest;
  } else if (ranked.length >= 2) {
    pick = ranked[1] ?? smallest;
  }

  return {
    ...pick,
    purchaseCost: dealPurchaseCost(pick),
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
    return "Pass keeps your buffer — earn first.";
  }
  if (ctx.mood === "storm" || ctx.mood === "tight") {
    return "Pass is often smart in tight weather.";
  }
  if (offer.purchaseCost >= 40 && ctx.pouchCoins < offer.purchaseCost + 15) {
    return "Wait keeps coins for the next bill.";
  }
  return null;
}
