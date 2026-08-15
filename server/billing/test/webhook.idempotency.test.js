import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDb } from "../src/db.js";
import { handleVerifiedEvent } from "../src/webhookHandler.js";

function tempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capital-billing-"));
  return openDb(path.join(dir, "billing.json"));
}

const completedSession = {
  id: "evt_test_completed_1",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_1",
      mode: "payment",
      customer: "cus_test_1",
      customer_details: { email: "founder@example.com" },
      metadata: {
        offer_key: "founding_family",
        price_id: "price_test_founding",
      },
    },
  },
};

describe("webhook idempotency", () => {
  it("grants entitlement once for duplicate checkout.session.completed", () => {
    const db = tempDb();
    const first = handleVerifiedEvent(completedSession, db);
    const second = handleVerifiedEvent(completedSession, db);

    assert.equal(first.ok, true);
    assert.equal(first.duplicate, false);
    assert.equal(second.duplicate, true);

    const ent = db.getEntitlement("founder@example.com");
    assert.equal(ent.entitlement_active, true);
    assert.equal(ent.stripe_customer_id, "cus_test_1");
    assert.equal(ent.price_id, "price_test_founding");
    assert.equal(ent.subscription_status, "paid_one_time");

    const dump = db._dump();
    assert.equal(Object.keys(dump.transactions).length, 1);
    assert.equal(Object.keys(dump.processedEvents).length, 1);
  });

  it("revokes on customer.subscription.deleted", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "sub@example.com",
      stripeCustomerId: "cus_sub",
    });
    db.upsertEntitlement({
      email: "sub@example.com",
      stripe_customer_id: "cus_sub",
      stripe_subscription_id: "sub_1",
      price_id: "price_annual",
      subscription_status: "active",
      entitlement_active: true,
    });

    handleVerifiedEvent(
      {
        id: "evt_sub_deleted",
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_1",
            customer: "cus_sub",
            status: "canceled",
            items: { data: [{ price: { id: "price_annual" } }] },
          },
        },
      },
      db,
    );

    const ent = db.getEntitlement("sub@example.com");
    assert.equal(ent.entitlement_active, false);
    assert.equal(ent.subscription_status, "canceled");
  });

  it("marks past_due on invoice.payment_failed without expanding access", () => {
    const db = tempDb();
    db.upsertCustomer({
      email: "fail@example.com",
      stripeCustomerId: "cus_fail",
    });
    db.upsertEntitlement({
      email: "fail@example.com",
      stripe_customer_id: "cus_fail",
      stripe_subscription_id: "sub_fail",
      price_id: "price_m",
      subscription_status: "active",
      entitlement_active: true,
    });

    handleVerifiedEvent(
      {
        id: "evt_inv_fail",
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "in_fail",
            customer: "cus_fail",
            customer_email: "fail@example.com",
            subscription: "sub_fail",
          },
        },
      },
      db,
    );

    const ent = db.getEntitlement("fail@example.com");
    assert.equal(ent.subscription_status, "past_due");
    assert.equal(ent.entitlement_active, false);
  });
});
