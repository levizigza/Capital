/**
 * Payment QA — security & financial attack surface.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { neverLogSecrets } from "../../src/index.js";
import { assertSecretKeyAllowed } from "../../src/config.js";
import { startQaServer, request, postWebhook, event } from "./helpers.js";

describe("SECURITY: webhook signature", () => {
  it("rejects invalid Stripe-Signature with 400", async () => {
    const { server } = await startQaServer();
    try {
      const res = await postWebhook(
        server,
        event("evt_bad", "checkout.session.completed", {
          id: "cs_bad",
          mode: "payment",
          customer_details: { email: "x@example.com" },
        }),
        { sig: "bad" },
      );
      assert.equal(res.status, 400);
      assert.equal(res.json.error, "invalid_signature");
    } finally {
      server.close();
    }
  });
});

describe("SECURITY: secrets", () => {
  it("redacts sk_ and whsec_ and long digit runs from logs", () => {
    const cleaned = neverLogSecrets(
      "err sk_test_51ABCDEFGHIJKLMN whsec_supersecret 4242424242424242",
    );
    assert.equal(cleaned.includes("sk_test_"), false);
    assert.equal(cleaned.includes("whsec_"), false);
    assert.equal(cleaned.includes("4242424242424242"), false);
  });

  it("blocks live secret without founder approval", () => {
    assert.throws(() =>
      assertSecretKeyAllowed("sk_live_abc", {
        STRIPE_MODE: "live",
        FOUNDER_APPROVED_LIVE: "false",
      }),
    );
  });
});

describe("SECURITY: access probe", () => {
  it("CONTRACT: access endpoint must not be unauthenticated oracle for arbitrary emails", async () => {
    const { server, db } = await startQaServer();
    try {
      db.upsertCustomer({
        email: "victim@example.com",
        stripeCustomerId: "cus_victim_secret",
      });
      db.upsertEntitlement({
        email: "victim@example.com",
        stripe_customer_id: "cus_victim_secret",
        stripe_subscription_id: "sub_victim",
        price_id: "price_founding_usd",
        subscription_status: "paid_one_time",
        entitlement_active: true,
      });

      const res = await request(
        server,
        "GET",
        "/api/access?email=victim@example.com",
      );

      // Desired: require auth / signed token. Current: open read.
      const leaksStripeIds =
        res.status === 200 &&
        res.json.stripe_customer_id === "cus_victim_secret" &&
        res.json.entitlementActive === true;

      assert.equal(
        leaksStripeIds,
        false,
        "SECURITY ISSUE: unauthenticated /api/access discloses entitlement + Stripe ids",
      );
    } finally {
      server.close();
    }
  });
});

describe("SECURITY: checkout abuse", () => {
  it("unknown offerKey does not create session", async () => {
    const { server } = await startQaServer();
    try {
      const res = await request(server, "POST", "/api/checkout/session", {
        body: JSON.stringify({
          offerKey: "free_admin_pass",
          customerEmail: "attacker@example.com",
        }),
      });
      assert.equal(res.status, 500);
    } finally {
      server.close();
    }
  });
});
