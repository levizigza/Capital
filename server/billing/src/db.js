import fs from "node:fs";
import path from "node:path";

/**
 * Minimal JSON persistence for Stripe identifiers + entitlements.
 * Fields kept lean per architecture: customer, subscription, price, status.
 */

function emptyDb() {
  return {
    customers: {},
    entitlements: {},
    processedEvents: {},
    transactions: {},
  };
}

export function openDb(dbPath) {
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(emptyDb(), null, 2));
  }
  let data = emptyDb();
  try {
    data = { ...emptyDb(), ...JSON.parse(fs.readFileSync(dbPath, "utf8")) };
  } catch {
    data = emptyDb();
  }

  const save = () => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  };

  return {
    path: dbPath,
    hasProcessedEvent(eventId) {
      return Boolean(data.processedEvents[eventId]);
    },
    markProcessedEvent(eventId, type) {
      if (data.processedEvents[eventId]) return false;
      data.processedEvents[eventId] = { type, at: new Date().toISOString() };
      save();
      return true;
    },
    upsertCustomer({ email, stripeCustomerId }) {
      const key = email.toLowerCase();
      data.customers[key] = {
        email: key,
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString(),
      };
      save();
      return data.customers[key];
    },
    getCustomerByEmail(email) {
      return data.customers[String(email || "").toLowerCase()] || null;
    },
    getCustomerByStripeId(stripeCustomerId) {
      return (
        Object.values(data.customers).find(
          (c) => c.stripe_customer_id === stripeCustomerId,
        ) || null
      );
    },
    upsertEntitlement(row) {
      const key = row.email.toLowerCase();
      data.entitlements[key] = {
        email: key,
        stripe_customer_id: row.stripe_customer_id || null,
        stripe_subscription_id: row.stripe_subscription_id || null,
        price_id: row.price_id || null,
        subscription_status: row.subscription_status || "none",
        entitlement_active: Boolean(row.entitlement_active),
        offer_key: row.offer_key || null,
        updated_at: new Date().toISOString(),
      };
      save();
      return data.entitlements[key];
    },
    getEntitlement(email) {
      return data.entitlements[String(email || "").toLowerCase()] || null;
    },
    recordTransaction({ id, email, type, amountNote }) {
      if (data.transactions[id]) return false;
      data.transactions[id] = {
        id,
        email,
        type,
        amountNote: amountNote || null,
        at: new Date().toISOString(),
      };
      save();
      return true;
    },
    /** test helper */
    _dump() {
      return data;
    },
  };
}

export function entitlementActiveFromStatus(status) {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "paid_one_time"
  );
}
