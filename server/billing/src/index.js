import http from "node:http";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { resolveOffer } from "./catalog.js";
import { openDb } from "./db.js";
import { handleVerifiedEvent } from "./webhookHandler.js";

/**
 * Minimal billing HTTP server.
 * Checkout: https://docs.stripe.com/checkout/quickstart
 * Webhooks: https://docs.stripe.com/webhooks/signatures
 * Portal: https://docs.stripe.com/customer-management/integrate-customer-portal
 * API versioning: https://docs.stripe.com/api/versioning
 */

async function getStripe(secretKey) {
  const { default: Stripe } = await import("stripe");
  // Pin to the API version shipped with this stripe-node release
  // (matches docs.stripe.com/api/versioning current major for the SDK).
  return new Stripe(secretKey, {
    apiVersion: Stripe.API_VERSION,
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  const data = status === 204 ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(data);
}

export function neverLogSecrets(text) {
  return String(text || "")
    .replace(/sk_(live|test)_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/whsec_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/\b\d{13,19}\b/g, "[redacted-pan]");
}

export function createBillingServer(options = {}) {
  const env = options.env || process.env;
  const config = loadConfig(env);
  const db = options.db || openDb(config.dbPath);
  const stripePromise = options.stripe
    ? Promise.resolve(options.stripe)
    : getStripe(config.secretKey);

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") {
        sendJson(res, 204, {});
        return;
      }

      const url = new URL(req.url || "/", `http://${req.headers.host}`);

      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, { ok: true, mode: config.mode });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/access") {
        const email = url.searchParams.get("email") || "";
        const ent = db.getEntitlement(email);
        sendJson(res, 200, {
          email: email.toLowerCase(),
          entitlementActive: Boolean(ent?.entitlement_active),
          subscription_status: ent?.subscription_status || "none",
          price_id: ent?.price_id || null,
          stripe_customer_id: ent?.stripe_customer_id || null,
          stripe_subscription_id: ent?.stripe_subscription_id || null,
          // Explicit: success_url alone never sets these
          source: "billing_db_trusted_webhooks",
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/checkout/session") {
        const raw = await readRawBody(req);
        const body = raw.length ? JSON.parse(raw.toString("utf8")) : {};
        const offer = resolveOffer(
          body.offerKey || "founding_family",
          config.prices,
        );
        const stripe = await stripePromise;
        const successUrl = `${config.publicAppUrl}/#/billing/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${config.publicAppUrl}/#/billing/cancel`;
        const session = await stripe.checkout.sessions.create({
          mode: offer.mode,
          line_items: [{ price: offer.priceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: body.customerEmail || undefined,
          metadata: {
            offer_key: offer.offerKey,
            price_id: offer.priceId,
          },
        });
        sendJson(res, 200, { id: session.id, url: session.url });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/portal/session") {
        const raw = await readRawBody(req);
        const body = raw.length ? JSON.parse(raw.toString("utf8")) : {};
        const email = String(body.customerEmail || "").toLowerCase();
        const customer = db.getCustomerByEmail(email);
        if (!customer?.stripe_customer_id) {
          sendJson(res, 404, { error: "unknown_customer" });
          return;
        }
        const stripe = await stripePromise;
        const portal = await stripe.billingPortal.sessions.create({
          customer: customer.stripe_customer_id,
          return_url: `${config.publicAppUrl}/#/billing/portal-return`,
        });
        sendJson(res, 200, { url: portal.url });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/webhooks/stripe") {
        const raw = await readRawBody(req);
        const sig = req.headers["stripe-signature"];
        const stripe = await stripePromise;
        if (!config.webhookSecret) {
          sendJson(res, 500, { error: "webhook_secret_missing" });
          return;
        }
        let event;
        try {
          event = stripe.webhooks.constructEvent(
            raw,
            sig,
            config.webhookSecret,
          );
        } catch (err) {
          console.error(
            "Webhook signature verification failed:",
            neverLogSecrets(err?.message || err),
          );
          sendJson(res, 400, { error: "invalid_signature" });
          return;
        }
        const result = handleVerifiedEvent(event, db);
        sendJson(res, 200, { received: true, ...result });
        return;
      }

      sendJson(res, 404, { error: "not_found" });
    } catch (err) {
      console.error("Billing error:", neverLogSecrets(err?.message || err));
      sendJson(res, 500, { error: "server_error" });
    }
  });

  return { server, config, db };
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const { server, config } = createBillingServer();
  server.listen(config.port, () => {
    console.log(
      `Capital billing server on :${config.port} mode=${config.mode}`,
    );
  });
}
