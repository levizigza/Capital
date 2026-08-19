import { describe, expect, it } from "vitest";
import {
  CURRENT_REVENUE_EVALUATION,
  FOUNDING_PRICE_SPEC,
  SALE_LEDGER,
  assertNoSecretKeyMaterial,
  assertTestBeforeLive,
  recommendPath,
  recordSale,
} from "./store";

describe("stripeRevenue", () => {
  it("classifies current offer as ONE_TIME_PAYMENT with Payment Links sufficient", () => {
    expect(CURRENT_REVENUE_EVALUATION.billingType).toBe("ONE_TIME_PAYMENT");
    expect(CURRENT_REVENUE_EVALUATION.paymentLinksSufficient).toBe(true);
    expect(CURRENT_REVENUE_EVALUATION.customCheckoutRequired).toBe(false);
    expect(recommendPath()).toEqual({
      usePaymentLinks: true,
      buildCustomCheckout: false,
    });
  });

  it("specs founding price as one-time $29 USD hypothesis", () => {
    expect(FOUNDING_PRICE_SPEC.billing).toBe("one_time");
    expect(FOUNDING_PRICE_SPEC.unitAmountCents).toBe(2900);
    expect(FOUNDING_PRICE_SPEC.currency).toBe("usd");
  });

  it("rejects secret keys and blocks live until founder enables", () => {
    expect(() => assertNoSecretKeyMaterial("sk_test_ABC123xyz")).toThrow(/secret/);
    expect(() => assertTestBeforeLive("live", false)).toThrow(/Live mode/);
    expect(() => assertTestBeforeLive("test", false)).not.toThrow();
  });

  it("records sales without inventing empty payment ids", () => {
    expect(SALE_LEDGER).toHaveLength(0);
    expect(() =>
      recordSale({
        id: "S1",
        mode: "test",
        offerId: "OFFER_FOUNDING_FAMILY",
        amountCents: 2900,
        currency: "usd",
        stripePaymentId: "",
        customerEmail: "a@b.com",
        segment: "S1",
        accessGrantedAt: null,
        refund: false,
        notes: "",
      }),
    ).toThrow(/stripePaymentId/);
    const log = recordSale({
      id: "S1",
      mode: "test",
      offerId: "OFFER_FOUNDING_FAMILY",
      amountCents: 2900,
      currency: "usd",
      stripePaymentId: "pi_test_from_dashboard",
      customerEmail: "buyer@example.com",
      segment: "S1",
      accessGrantedAt: "2026-08-15T00:00:00Z",
      refund: false,
      notes: "Test mode 4242",
    });
    expect(log).toHaveLength(1);
  });
});
