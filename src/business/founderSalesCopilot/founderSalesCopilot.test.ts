import { describe, expect, it } from "vitest";
import {
  APPROVED_SKUS,
  DELIVERABLE_TRUTHS,
  assertDiscountAuthorized,
  assertNoForbiddenPromises,
  assertSkuApproved,
  classifyAllowsClose,
  createStripePaymentLinkRequest,
  isEarlyDiscoveryOnly,
  recommendPaymentMechanism,
  type ApprovedSku,
} from "./store";

const sampleSku: ApprovedSku = {
  skuId: "base_family_annual",
  name: "Family base annual (example)",
  amountCents: 4900,
  currency: "usd",
  includes: "Harbor + Cove core loop license for one household",
  active: true,
};

describe("founderSalesCopilot", () => {
  it("documents deliverable truths and blocks undeliverable promises", () => {
    expect(DELIVERABLE_TRUTHS.length).toBeGreaterThan(3);
    expect(() =>
      assertNoForbiddenPromises("We will add multiplayer next month"),
    ).toThrow();
    expect(() =>
      assertNoForbiddenPromises("Capital practices irreversible money choices"),
    ).not.toThrow();
  });

  it("refuses invented SKUs and unauthorized discounts", () => {
    expect(APPROVED_SKUS).toHaveLength(0);
    expect(() => assertSkuApproved("fake_sku")).toThrow(/not on the founder-approved/);
    expect(() => assertDiscountAuthorized("RANDOM50")).toThrow(/Unauthorized/);
    expect(() => assertDiscountAuthorized(null)).not.toThrow();
  });

  it("recommends Payment Link when READY_TO_BUY with approved SKU — not blocked by in-app billing", () => {
    expect(
      recommendPaymentMechanism({
        classification: "READY_TO_BUY",
        hasApprovedSku: true,
        inAppBillingReady: false,
        buyerRequiresInvoice: false,
      }),
    ).toBe("stripe_payment_link");
    expect(
      recommendPaymentMechanism({
        classification: "QUALIFIED",
        hasApprovedSku: true,
        inAppBillingReady: true,
        buyerRequiresInvoice: false,
      }),
    ).toBeNull();
  });

  it("generates Stripe Payment Link requests without fabricating URLs", () => {
    const req = createStripePaymentLinkRequest({
      customerNameOrOrg: "Example Family",
      customerEmail: "buyer@example.com",
      skuId: "base_family_annual",
      skus: [sampleSku],
    });
    expect(req.status).toBe("REQUESTED");
    expect(req.stripePaymentLinkUrl).toBeNull();
    expect(req.allowPromotionCodes).toBe(false);
    expect(req.amountCents).toBe(4900);
  });

  it("keeps early discovery distinct from close", () => {
    expect(isEarlyDiscoveryOnly("RESEARCH_USER")).toBe(true);
    expect(classifyAllowsClose("READY_TO_BUY")).toBe(true);
    expect(classifyAllowsClose("PILOT_CANDIDATE")).toBe(false);
  });
});
