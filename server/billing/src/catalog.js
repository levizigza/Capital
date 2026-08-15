/**
 * Offer catalog → Stripe Price IDs from env (never hardcoded dollar amounts).
 * https://docs.stripe.com/products-prices/manage-prices
 */

export function resolveOffer(offerKey, prices) {
  const key = String(offerKey || "").trim();
  if (key === "founding_family") {
    if (!prices.founding_family) {
      throw new Error("STRIPE_PRICE_FOUNDING_FAMILY is not configured");
    }
    return {
      offerKey: key,
      priceId: prices.founding_family,
      mode: "payment",
    };
  }
  if (key === "family_annual") {
    if (!prices.family_annual) {
      throw new Error("STRIPE_PRICE_FAMILY_ANNUAL is not configured");
    }
    return {
      offerKey: key,
      priceId: prices.family_annual,
      mode: "subscription",
    };
  }
  if (key === "family_monthly") {
    if (!prices.family_monthly) {
      throw new Error("STRIPE_PRICE_FAMILY_MONTHLY is not configured");
    }
    return {
      offerKey: key,
      priceId: prices.family_monthly,
      mode: "subscription",
    };
  }
  throw new Error(`Unknown offerKey: ${key}`);
}
