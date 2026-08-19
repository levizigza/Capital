/**
 * Live mode requires explicit founder approval.
 * Official keys: https://docs.stripe.com/keys
 */

export function assertSecretKeyAllowed(secretKey, env = process.env) {
  const mode = (env.STRIPE_MODE || "test").toLowerCase();
  const founderOk = env.FOUNDER_APPROVED_LIVE === "true";
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required on the billing server");
  }
  if (secretKey.startsWith("sk_live_")) {
    if (mode !== "live" || !founderOk) {
      throw new Error(
        "Live Stripe secret key blocked: set STRIPE_MODE=live and FOUNDER_APPROVED_LIVE=true after founder approval",
      );
    }
  }
  if (mode === "live" && !founderOk) {
    throw new Error("STRIPE_MODE=live requires FOUNDER_APPROVED_LIVE=true");
  }
  if (mode === "test" && secretKey.startsWith("sk_live_")) {
    throw new Error("Refusing sk_live_ while STRIPE_MODE=test");
  }
  return mode;
}

export function loadConfig(env = process.env) {
  const secretKey = env.STRIPE_SECRET_KEY || "";
  const mode = assertSecretKeyAllowed(secretKey, env);
  return {
    secretKey,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
    publicAppUrl: (env.PUBLIC_APP_URL || "http://localhost:5000").replace(/\/$/, ""),
    port: Number(env.BILLING_PORT || 4242),
    mode,
    dbPath: env.BILLING_DB_PATH || "./data/billing.json",
    prices: {
      founding_family: env.STRIPE_PRICE_FOUNDING_FAMILY || "",
      family_annual: env.STRIPE_PRICE_FAMILY_ANNUAL || "",
      family_monthly: env.STRIPE_PRICE_FAMILY_MONTHLY || "",
    },
  };
}
