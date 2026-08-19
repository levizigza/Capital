/**
 * Stripe revenue activation — Payment Links first.
 * Never stores secret keys. Never creates live charges from code.
 */

export type OfferBillingType =
  | "ONE_TIME_PAYMENT"
  | "SUBSCRIPTION"
  | "PILOT"
  | "OTHER";

export type StripeMode = "test" | "live";

export interface PaymentLinksEvaluation {
  currentOfferId: string;
  billingType: OfferBillingType;
  paymentLinksSufficient: boolean;
  customCheckoutRequired: boolean;
  rationale: string;
}

export interface StripeProductSpec {
  name: string;
  description: string;
}

export interface StripePriceSpec {
  unitAmountCents: number;
  currency: "usd" | "cad";
  billing: "one_time" | "recurring_monthly" | "recurring_yearly";
}

export interface PaymentLinkConfigSpec {
  collectEmail: true;
  allowPromotionCodes: false;
  shipping: false;
  quantityAdjustable: false;
  taxOptional: true;
}

export interface SaleRecord {
  id: string;
  mode: StripeMode;
  offerId: string;
  amountCents: number;
  currency: string;
  stripePaymentId: string;
  customerEmail: string;
  segment: string;
  accessGrantedAt: string | null;
  refund: boolean;
  notes: string;
}

/** Phase 1 evaluation — founding family one-time. */
export const CURRENT_REVENUE_EVALUATION: PaymentLinksEvaluation = {
  currentOfferId: "OFFER_FOUNDING_FAMILY",
  billingType: "ONE_TIME_PAYMENT",
  paymentLinksSufficient: true,
  customCheckoutRequired: false,
  rationale:
    "Founding family offer is a single one-time digital purchase; Stripe Payment Links cover product, price, checkout, receipt, and hosted success without app secrets or custom Checkout.",
};

export const FOUNDING_PRODUCT_SPEC: StripeProductSpec = {
  name: "Capital — Founding Family Access",
  description:
    "Household founding license: Harbor + Coincraft Cove adventure path (money choices with consequences). Not a debit card. Not pay-to-win.",
};

export const FOUNDING_PRICE_SPEC: StripePriceSpec = {
  unitAmountCents: 2900,
  currency: "usd",
  billing: "one_time",
};

export const FOUNDING_PAYMENT_LINK_CONFIG: PaymentLinkConfigSpec = {
  collectEmail: true,
  allowPromotionCodes: false,
  shipping: false,
  quantityAdjustable: false,
  taxOptional: true,
};

/** In-repo ledger starts empty — append after Dashboard-confirmed payment. */
export const SALE_LEDGER: SaleRecord[] = [];

const SECRET_KEY_PATTERN = /\bsk_(live|test)_[A-Za-z0-9]+/;

export function assertNoSecretKeyMaterial(text: string): void {
  if (SECRET_KEY_PATTERN.test(text)) {
    throw new Error("Stripe secret key material must never appear in source or logs");
  }
}

export function assertTestBeforeLive(mode: StripeMode, liveEnabledByFounder: boolean): void {
  if (mode === "live" && !liveEnabledByFounder) {
    throw new Error("Live mode payments blocked until founder enables live after Test verification");
  }
}

export function recommendPath(evaluation = CURRENT_REVENUE_EVALUATION): {
  usePaymentLinks: boolean;
  buildCustomCheckout: boolean;
} {
  return {
    usePaymentLinks: evaluation.paymentLinksSufficient,
    buildCustomCheckout: evaluation.customCheckoutRequired,
  };
}

export function recordSale(
  sale: SaleRecord,
  ledger: SaleRecord[] = SALE_LEDGER,
): SaleRecord[] {
  assertNoSecretKeyMaterial(JSON.stringify(sale));
  if (!sale.stripePaymentId.trim()) {
    throw new Error("stripePaymentId required from Dashboard — do not invent");
  }
  if (!sale.customerEmail.includes("@")) {
    throw new Error("customerEmail required");
  }
  ledger.push(sale);
  return ledger;
}
