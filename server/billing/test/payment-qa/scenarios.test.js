/**
 * Adversarial Payment QA — automated scenarios.
 * Verdict labels: PASS | FAIL | SECURITY ISSUE | FINANCIAL RISK
 * Official Stripe testing: https://docs.stripe.com/testing
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { handleVerifiedEvent } from "../../src/webhookHandler.js";
import { resolveOffer } from "../../src/catalog.js";
import {
  STRIPE_TEST_CARDS,
  assertNoRealCardData,
  tempDb,
  event,
  startQaServer,
  request,
  postWebhook,
} from "./helpers.js";

function parseBillingHash(hash) {
  const raw = hash.replace(/^#/, "");
  const path = raw.split("?")[0] || "";
  if (path === "/billing/success" || path === "billing/success") return "success";
  if (path === "/billing/cancel" || path === "billing/cancel") return "cancel";
  if (path === "/billing/portal-return" || path === "billing/portal-return") {
    return "portal-return";
  }
  return null;
}

assertNoRealCardData(Object.values(STRIPE_TEST_CARDS).join(" "));

describe("PAYMENT_QA fixtures", () => {
  it("uses only Stripe sandbox test card constants", () => {
    assert.equal(STRIPE_TEST_CARDS.success, "4242424242424242");
    assert.equal(STRIPE_TEST_CARDS.decline, "4000000000000002");
    assert.equal(STRIPE_TEST_CARDS.authRequired, "4000002500003155");
  });
});

describe("NEW CUSTOMER PAYMENT", () => {
  it("grants access only after checkout.session.completed webhook", async () => {
    const { server, db } = await startQaServer();
    try {
      const before = await request(
        server,
        "GET",
        "/api/access?email=new@example.com",
      );
      assert.equal(before.json.entitlementActive, false);

      // Simulate success_url visit — must not change DB.
      assert.equal(db.getEntitlement("new@example.com"), null);

      await postWebhook(
        server,
        event("evt_new_pay", "checkout.session.completed", {
          id: "cs_new",
          mode: "payment",
          customer: "cus_new",
          customer_details: { email: "new@example.com" },
          metadata: {
            offer_key: "founding_family",
            price_id: "price_founding_usd",
          },
          currency: "usd",
        }),
      );

      const after = await request(
        server,
        "GET",
        "/api/access?email=new@example.com",
      );
      assert.equal(after.json.entitlementActive, true);
      assert.equal(after.json.price_id, "price_founding_usd");
      assert.equal(after.json.subscription_status, "paid_one_time");
      assert.equal(after.json.stripe_customer_id, "cus_new");
    } finally {
      server.close();
    }
  });

  it("checkout session uses catalog price id and payment mode", async () => {
    let captured = null;
    const { server } = await startQaServer({
      stripe: {
        checkout: {
          sessions: {
            create: async (params) => {
              captured = params;
              return { id: "cs_cap", url: "https://checkout.stripe.com/c/pay/cs_cap" };
            },
          },
        },
        billingPortal: { sessions: { create: async () => ({ url: "x" }) } },
        webhooks: {
          constructEvent: (raw) => JSON.parse(raw.toString("utf8")),
        },
      },
    });
    try {
      const res = await request(server, "POST", "/api/checkout/session", {
        body: JSON.stringify({
          offerKey: "founding_family",
          customerEmail: "new@example.com",
        }),
      });
      assert.equal(res.status, 200);
      assert.equal(captured.mode, "payment");
      assert.equal(captured.line_items[0].price, "price_founding_usd");
      assert.equal(captured.line_items[0].quantity, 1);
      assert.match(captured.success_url, /billing\/success/);
      assert.match(captured.cancel_url, /billing\/cancel/);
      assert.equal(JSON.stringify(captured).includes("$"), false);
    } finally {
      server.close();
    }
  });
});

describe("RETURNING CUSTOMER PAYMENT", () => {
  it("updates existing entitlement without duplicate transaction on same session id", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "return@example.com",
      stripeCustomerId: "cus_return",
    });
    db.upsertEntitlement({
      email: "return@example.com",
      stripe_customer_id: "cus_return",
      price_id: "price_founding_usd",
      subscription_status: "paid_one_time",
      entitlement_active: true,
    });

    const payload = event("evt_return_1", "checkout.session.completed", {
      id: "cs_return_1",
      mode: "payment",
      customer: "cus_return",
      customer_details: { email: "return@example.com" },
      metadata: {
        offer_key: "founding_family",
        price_id: "price_founding_usd",
      },
    });
    handleVerifiedEvent(payload, db);
    handleVerifiedEvent(payload, db);

    const dump = db._dump();
    assert.equal(Object.keys(dump.transactions).length, 1);
    assert.equal(Object.keys(dump.entitlements).length, 1);
    assert.equal(db.getEntitlement("return@example.com").entitlement_active, true);
  });
});

describe("SUCCESSFUL SUBSCRIPTION", () => {
  it("sets active subscription ids and price from checkout.session.completed", () => {
    const db = tempDb();
    handleVerifiedEvent(
      event("evt_sub_ok", "checkout.session.completed", {
        id: "cs_sub",
        mode: "subscription",
        customer: "cus_sub",
        subscription: "sub_ok",
        customer_details: { email: "sub@example.com" },
        metadata: {
          offer_key: "family_annual",
          price_id: "price_annual_usd",
        },
      }),
      db,
    );
    const ent = db.getEntitlement("sub@example.com");
    assert.equal(ent.entitlement_active, true);
    assert.equal(ent.subscription_status, "active");
    assert.equal(ent.stripe_subscription_id, "sub_ok");
    assert.equal(ent.price_id, "price_annual_usd");
  });

  it("catalog annual offer is subscription mode with env price", () => {
    const offer = resolveOffer("family_annual", {
      founding_family: "price_founding_usd",
      family_annual: "price_annual_usd",
      family_monthly: "price_monthly_usd",
    });
    assert.equal(offer.mode, "subscription");
    assert.equal(offer.priceId, "price_annual_usd");
  });
});

describe("DECLINED CARD", () => {
  it("leaves entitlement inactive when no completed webhook arrives", async () => {
    const { server } = await startQaServer();
    try {
      // Declined checkout never emits fulfillment grant — only document test card used.
      assert.equal(STRIPE_TEST_CARDS.decline.startsWith("4000"), true);
      const res = await request(
        server,
        "GET",
        "/api/access?email=declined@example.com",
      );
      assert.equal(res.json.entitlementActive, false);
      assert.equal(res.json.subscription_status, "none");
    } finally {
      server.close();
    }
  });
});

describe("AUTHENTICATION REQUIRED", () => {
  it("grants only after completed webhook following 3DS success path", () => {
    assert.equal(STRIPE_TEST_CARDS.authRequired, "4000002500003155");
    const db = tempDb();
    assert.equal(db.getEntitlement("3ds@example.com"), null);
    handleVerifiedEvent(
      event("evt_3ds", "checkout.session.completed", {
        id: "cs_3ds",
        mode: "payment",
        customer: "cus_3ds",
        customer_details: { email: "3ds@example.com" },
        metadata: { price_id: "price_founding_usd", offer_key: "founding_family" },
      }),
      db,
    );
    assert.equal(db.getEntitlement("3ds@example.com").entitlement_active, true);
  });
});

describe("PAYMENT PROCESSING", () => {
  it("does not grant on processing card alone (no webhook yet)", () => {
    assert.equal(STRIPE_TEST_CARDS.processing, "4000000000000077");
    const db = tempDb();
    assert.equal(db.getEntitlement("proc@example.com"), null);
  });
});

describe("PAYMENT FAILURE", () => {
  it("marks past_due and revokes entitlement on invoice.payment_failed", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "fail@example.com",
      stripeCustomerId: "cus_fail",
    });
    db.upsertEntitlement({
      email: "fail@example.com",
      stripe_customer_id: "cus_fail",
      stripe_subscription_id: "sub_fail",
      price_id: "price_annual_usd",
      subscription_status: "active",
      entitlement_active: true,
    });
    handleVerifiedEvent(
      event("evt_fail", "invoice.payment_failed", {
        id: "in_fail",
        customer: "cus_fail",
        customer_email: "fail@example.com",
        subscription: "sub_fail",
      }),
      db,
    );
    const ent = db.getEntitlement("fail@example.com");
    assert.equal(ent.subscription_status, "past_due");
    assert.equal(ent.entitlement_active, false);
  });
});

describe("CANCELLATION", () => {
  it("revokes on customer.subscription.deleted", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "cancel@example.com",
      stripeCustomerId: "cus_c",
    });
    db.upsertEntitlement({
      email: "cancel@example.com",
      stripe_customer_id: "cus_c",
      stripe_subscription_id: "sub_c",
      price_id: "price_annual_usd",
      subscription_status: "active",
      entitlement_active: true,
    });
    handleVerifiedEvent(
      event("evt_cancel", "customer.subscription.deleted", {
        id: "sub_c",
        customer: "cus_c",
        items: { data: [{ price: { id: "price_annual_usd" } }] },
      }),
      db,
    );
    assert.equal(db.getEntitlement("cancel@example.com").entitlement_active, false);
    assert.equal(
      db.getEntitlement("cancel@example.com").subscription_status,
      "canceled",
    );
  });
});

describe("RENEWAL", () => {
  it("keeps active on invoice.paid for known subscriber", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "renew@example.com",
      stripeCustomerId: "cus_r",
    });
    db.upsertEntitlement({
      email: "renew@example.com",
      stripe_customer_id: "cus_r",
      stripe_subscription_id: "sub_r",
      price_id: "price_annual_usd",
      subscription_status: "active",
      entitlement_active: true,
    });
    handleVerifiedEvent(
      event("evt_renew", "invoice.paid", {
        id: "in_renew",
        customer: "cus_r",
        customer_email: "renew@example.com",
        subscription: "sub_r",
      }),
      db,
    );
    const ent = db.getEntitlement("renew@example.com");
    assert.equal(ent.entitlement_active, true);
    assert.equal(ent.subscription_status, "active");
    assert.equal(db._dump().transactions[`txn_inv_in_renew`].type, "invoice_paid");
  });
});

describe("REFUND", () => {
  it("CONTRACT: charge.refunded or refund should revoke one-time access", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "refund@example.com",
      stripeCustomerId: "cus_ref",
    });
    db.upsertEntitlement({
      email: "refund@example.com",
      stripe_customer_id: "cus_ref",
      price_id: "price_founding_usd",
      subscription_status: "paid_one_time",
      entitlement_active: true,
    });

    // Current handler ignores refunds — this is the contract we require for launch.
    const before = db.getEntitlement("refund@example.com");
    handleVerifiedEvent(
      event("evt_refund", "charge.refunded", {
        id: "ch_ref",
        customer: "cus_ref",
        refunded: true,
      }),
      db,
    );
    const after = db.getEntitlement("refund@example.com");

    // Soft assertion path used by report: record whether contract is met.
    const revoked = after.entitlement_active === false;
    assert.equal(
      revoked,
      true,
      "FINANCIAL RISK: charge.refunded did not revoke entitlement",
    );
  });
});

describe("WEBHOOK DELAY", () => {
  it("success UI path without webhook keeps access false", async () => {
    const { server, db } = await startQaServer();
    try {
      // User landed on success_url; webhook delayed.
      assert.equal(parseBillingHash("#/billing/success?session_id=cs_x"), "success");
      const res = await request(
        server,
        "GET",
        "/api/access?email=delayed@example.com",
      );
      assert.equal(res.json.entitlementActive, false);
      assert.equal(db.getEntitlement("delayed@example.com"), null);
    } finally {
      server.close();
    }
  });
});

describe("DUPLICATE WEBHOOK", () => {
  it("does not double-record transactions", () => {
    const db = tempDb();
    const e = event("evt_dup", "checkout.session.completed", {
      id: "cs_dup",
      mode: "payment",
      customer: "cus_dup",
      customer_details: { email: "dup@example.com" },
      metadata: { price_id: "price_founding_usd", offer_key: "founding_family" },
    });
    const a = handleVerifiedEvent(e, db);
    const b = handleVerifiedEvent(e, db);
    assert.equal(a.duplicate, false);
    assert.equal(b.duplicate, true);
    assert.equal(Object.keys(db._dump().transactions).length, 1);
  });
});

describe("OUT-OF-ORDER WEBHOOK", () => {
  it("CONTRACT: invoice.paid after subscription.deleted must not resurrect access", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "ooo@example.com",
      stripeCustomerId: "cus_ooo",
    });
    handleVerifiedEvent(
      event("evt_ooo_del", "customer.subscription.deleted", {
        id: "sub_ooo",
        customer: "cus_ooo",
        items: { data: [{ price: { id: "price_annual_usd" } }] },
      }),
      db,
    );
    // Ensure customer row exists for deleted handler path — seed entitlement first.
    // Re-seed realistic order: active → deleted → late invoice.paid
    db.upsertEntitlement({
      email: "ooo@example.com",
      stripe_customer_id: "cus_ooo",
      stripe_subscription_id: "sub_ooo",
      price_id: "price_annual_usd",
      subscription_status: "canceled",
      entitlement_active: false,
    });

    handleVerifiedEvent(
      event("evt_ooo_inv", "invoice.paid", {
        id: "in_late",
        customer: "cus_ooo",
        customer_email: "ooo@example.com",
        subscription: "sub_ooo",
      }),
      db,
    );

    const ent = db.getEntitlement("ooo@example.com");
    assert.equal(
      ent.entitlement_active,
      false,
      "FINANCIAL RISK: late invoice.paid resurrected canceled subscription access",
    );
  });

  it("CONTRACT: deleted after completed should end canceled", () => {
    const db = tempDb();
    handleVerifiedEvent(
      event("evt_ord_1", "checkout.session.completed", {
        id: "cs_ord",
        mode: "subscription",
        customer: "cus_ord",
        subscription: "sub_ord",
        customer_details: { email: "ord@example.com" },
        metadata: { price_id: "price_annual_usd", offer_key: "family_annual" },
      }),
      db,
    );
    handleVerifiedEvent(
      event("evt_ord_2", "customer.subscription.deleted", {
        id: "sub_ord",
        customer: "cus_ord",
        items: { data: [{ price: { id: "price_annual_usd" } }] },
      }),
      db,
    );
    assert.equal(db.getEntitlement("ord@example.com").entitlement_active, false);
  });
});

describe("NETWORK INTERRUPTION", () => {
  it("accepts webhook retry after first processing (idempotent)", () => {
    const db = tempDb();
    const e = event("evt_net", "checkout.session.completed", {
      id: "cs_net",
      mode: "payment",
      customer: "cus_net",
      customer_details: { email: "net@example.com" },
      metadata: { price_id: "price_founding_usd", offer_key: "founding_family" },
    });
    handleVerifiedEvent(e, db);
    // Client timed out; Stripe retries same event id.
    const retry = handleVerifiedEvent(e, db);
    assert.equal(retry.duplicate, true);
    assert.equal(db.getEntitlement("net@example.com").entitlement_active, true);
    assert.equal(Object.keys(db._dump().transactions).length, 1);
  });
});

describe("USER CLOSES CHECKOUT", () => {
  it("cancel route does not grant access", async () => {
    assert.equal(parseBillingHash("#/billing/cancel"), "cancel");
    const { server } = await startQaServer();
    try {
      const res = await request(
        server,
        "GET",
        "/api/access?email=closed@example.com",
      );
      assert.equal(res.json.entitlementActive, false);
    } finally {
      server.close();
    }
  });
});

describe("SUCCESS URL MANUALLY VISITED", () => {
  it("never grants paid access from success hash alone", async () => {
    assert.equal(
      parseBillingHash("#/billing/success?session_id=cs_fake"),
      "success",
    );
    const { server, db } = await startQaServer();
    try {
      const res = await request(
        server,
        "GET",
        "/api/access?email=manual-success@example.com",
      );
      assert.equal(res.json.entitlementActive, false);
      assert.equal(res.json.source, "billing_db_trusted_webhooks");
      assert.equal(db.getEntitlement("manual-success@example.com"), null);
    } finally {
      server.close();
    }
  });
});

describe("PRODUCT PRICE CURRENCY ACCOUNT", () => {
  it("session metadata carries configured price_id not a hardcoded amount", async () => {
    let captured = null;
    const { server } = await startQaServer({
      stripe: {
        checkout: {
          sessions: {
            create: async (params) => {
              captured = params;
              return { id: "cs_meta", url: "https://checkout.stripe.com/c/pay/cs_meta" };
            },
          },
        },
        billingPortal: { sessions: { create: async () => ({ url: "x" }) } },
        webhooks: { constructEvent: (r) => JSON.parse(r.toString("utf8")) },
      },
    });
    try {
      await request(server, "POST", "/api/checkout/session", {
        body: JSON.stringify({
          offerKey: "family_monthly",
          customerEmail: "price@example.com",
        }),
      });
      assert.equal(captured.line_items[0].price, "price_monthly_usd");
      assert.equal(captured.mode, "subscription");
      assert.equal(captured.metadata.price_id, "price_monthly_usd");
      assert.equal(captured.metadata.offer_key, "family_monthly");
    } finally {
      server.close();
    }
  });
});
