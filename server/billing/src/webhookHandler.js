import { entitlementActiveFromStatus } from "./db.js";

/**
 * Trusted fulfillment from verified Stripe events.
 * https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted
 * https://docs.stripe.com/customer-management/integrate-customer-portal#webhooks
 */

function emailFromSession(session) {
  return (
    session.customer_details?.email ||
    session.customer_email ||
    null
  );
}

export function handleVerifiedEvent(event, db) {
  if (db.hasProcessedEvent(event.id)) {
    return { duplicate: true, ok: true };
  }

  const type = event.type;
  const obj = event.data?.object || {};

  if (type === "checkout.session.completed") {
    const email = emailFromSession(obj);
    if (!email) {
      // Still mark processed to avoid infinite retries on unusable payload shape in tests;
      // production should alert.
      db.markProcessedEvent(event.id, type);
      return { ok: true, warning: "missing_email" };
    }
    const customerId = typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
    if (customerId) {
      db.upsertCustomer({ email, stripeCustomerId: customerId });
    }
    const mode = obj.mode;
    const priceId =
      obj.metadata?.price_id ||
      obj.line_items?.data?.[0]?.price?.id ||
      null;
    if (mode === "payment") {
      db.upsertEntitlement({
        email,
        stripe_customer_id: customerId || null,
        stripe_subscription_id: null,
        price_id: priceId || obj.metadata?.price_id || null,
        subscription_status: "paid_one_time",
        entitlement_active: true,
        offer_key: obj.metadata?.offer_key || null,
      });
      db.recordTransaction({
        id: `txn_${obj.id}`,
        email,
        type: "checkout_one_time",
      });
    } else if (mode === "subscription") {
      const subId =
        typeof obj.subscription === "string"
          ? obj.subscription
          : obj.subscription?.id;
      db.upsertEntitlement({
        email,
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subId || null,
        price_id: priceId,
        subscription_status: "active",
        entitlement_active: true,
        offer_key: obj.metadata?.offer_key || null,
      });
      db.recordTransaction({
        id: `txn_${obj.id}`,
        email,
        type: "checkout_subscription",
      });
    }
  }

  if (type === "invoice.paid") {
    const customerId = typeof obj.customer === "string" ? obj.customer : null;
    const email =
      obj.customer_email ||
      db.getCustomerByStripeId(customerId)?.email ||
      null;
    if (email) {
      const subId =
        typeof obj.subscription === "string" ? obj.subscription : null;
      const existing = db.getEntitlement(email) || {};
      db.upsertEntitlement({
        ...existing,
        email,
        stripe_customer_id: customerId || existing.stripe_customer_id,
        stripe_subscription_id: subId || existing.stripe_subscription_id,
        price_id: existing.price_id,
        subscription_status: "active",
        entitlement_active: true,
        offer_key: existing.offer_key,
      });
      db.recordTransaction({
        id: `txn_inv_${obj.id}`,
        email,
        type: "invoice_paid",
      });
    }
  }

  if (type === "invoice.payment_failed") {
    const customerId = typeof obj.customer === "string" ? obj.customer : null;
    const email =
      obj.customer_email ||
      db.getCustomerByStripeId(customerId)?.email ||
      null;
    if (email) {
      const existing = db.getEntitlement(email) || { email };
      const status = "past_due";
      db.upsertEntitlement({
        ...existing,
        email,
        subscription_status: status,
        entitlement_active: entitlementActiveFromStatus(status),
      });
    }
  }

  if (type === "customer.subscription.updated") {
    const customerId = typeof obj.customer === "string" ? obj.customer : null;
    const email = db.getCustomerByStripeId(customerId)?.email;
    if (email) {
      const priceId = obj.items?.data?.[0]?.price?.id || null;
      const status = obj.status || "none";
      db.upsertEntitlement({
        email,
        stripe_customer_id: customerId,
        stripe_subscription_id: obj.id,
        price_id: priceId,
        subscription_status: status,
        entitlement_active: entitlementActiveFromStatus(status),
      });
    }
  }

  if (type === "customer.subscription.deleted") {
    const customerId = typeof obj.customer === "string" ? obj.customer : null;
    const email = db.getCustomerByStripeId(customerId)?.email;
    if (email) {
      db.upsertEntitlement({
        email,
        stripe_customer_id: customerId,
        stripe_subscription_id: obj.id,
        price_id: obj.items?.data?.[0]?.price?.id || null,
        subscription_status: "canceled",
        entitlement_active: false,
      });
    }
  }

  db.markProcessedEvent(event.id, type);
  return { ok: true, duplicate: false };
}
