import { describe, expect, it } from "vitest";
import {
  EXPOSURE_LOG,
  OFFER_HYPOTHESES,
  assertSingleConsumerPriceTest,
  assignRejectionReason,
  canCodePriceTooHigh,
  logExposure,
  nextOfferToRun,
} from "./store";

describe("monetizationExperiments", () => {
  it("defines full offer fields and starts with founding family as next", () => {
    expect(OFFER_HYPOTHESES.length).toBeGreaterThanOrEqual(5);
    for (const o of OFFER_HYPOTHESES) {
      expect(o.customer.length).toBeGreaterThan(5);
      expect(o.problem.length).toBeGreaterThan(5);
      expect(o.promisedOutcome.length).toBeGreaterThan(5);
      expect(o.whatTheyReceive.length).toBeGreaterThan(5);
      expect(o.timeToValue.length).toBeGreaterThan(2);
      expect(o.priceHypothesis.length).toBeGreaterThan(2);
      expect(o.riskReduction.length).toBeGreaterThan(5);
      expect(o.whyDifferent.length).toBeGreaterThan(5);
    }
    expect(nextOfferToRun().id).toBe("OFFER_FOUNDING_FAMILY");
  });

  it("forbids running multiple consumer price tests at once", () => {
    expect(() =>
      assertSingleConsumerPriceTest([
        "OFFER_FOUNDING_FAMILY",
        "OFFER_FAMILY_ANNUAL",
      ]),
    ).toThrow(/Multiple consumer offers/);
    expect(() => assertSingleConsumerPriceTest(["OFFER_FOUNDING_FAMILY"])).not.toThrow();
  });

  it("never codes PRICE_TOO_HIGH from a bare no", () => {
    expect(
      canCodePriceTooHigh({
        outcomeUnderstood: false,
        comparedAlternatives: false,
        affirmedNeedButAskedLower: false,
      }),
    ).toBe(false);
    expect(() =>
      assignRejectionReason("declined", "PRICE_TOO_HIGH", {
        outcomeUnderstood: false,
        comparedAlternatives: false,
        affirmedNeedButAskedLower: false,
      }),
    ).toThrow(/bare no/);
    expect(
      assignRejectionReason("declined", "PRICE_TOO_HIGH", {
        outcomeUnderstood: true,
        comparedAlternatives: true,
        affirmedNeedButAskedLower: false,
      }),
    ).toBe("PRICE_TOO_HIGH");
  });

  it("requires rejection reason on decline and keeps exposure log empty by default", () => {
    expect(EXPOSURE_LOG).toHaveLength(0);
    expect(() =>
      assignRejectionReason("declined", null),
    ).toThrow(/rejection_reason/);
    const log = logExposure({
      id: "E1",
      offerId: "OFFER_FOUNDING_FAMILY",
      offerShown: true,
      segment: "S1",
      price: "$29",
      paymentStructure: "founding_user",
      conversion: "declined",
      rejectionReason: "UNCLEAR_VALUE",
      retention: null,
      refund: false,
      usageActivated: false,
      grossMarginEst: null,
      notes: "Did not understand share card",
    });
    expect(log).toHaveLength(1);
  });
});
