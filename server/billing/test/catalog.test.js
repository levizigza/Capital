import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveOffer } from "../src/catalog.js";

describe("catalog price ids", () => {
  it("resolves founding_family as payment mode without dollar amounts", () => {
    const offer = resolveOffer("founding_family", {
      founding_family: "price_abc",
      family_annual: "",
      family_monthly: "",
    });
    assert.equal(offer.mode, "payment");
    assert.equal(offer.priceId, "price_abc");
    assert.equal(JSON.stringify(offer).includes("$"), false);
  });

  it("resolves family_annual as subscription", () => {
    const offer = resolveOffer("family_annual", {
      founding_family: "",
      family_annual: "price_annual",
      family_monthly: "",
    });
    assert.equal(offer.mode, "subscription");
    assert.equal(offer.priceId, "price_annual");
  });
});
