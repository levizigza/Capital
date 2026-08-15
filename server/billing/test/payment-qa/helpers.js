/**
 * Payment QA helpers — Stripe sandbox semantics via fixtures only.
 * Never use real PANs; Stripe test card numbers are documentation constants only.
 * Official cards: https://docs.stripe.com/testing#cards
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { openDb } from "../../src/db.js";
import { createBillingServer } from "../../src/index.js";

/** Stripe documented test PANs — not real cards. */
export const STRIPE_TEST_CARDS = {
  success: "4242424242424242",
  decline: "4000000000000002",
  authRequired: "4000002500003155",
  processing: "4000000000000077",
  insufficientFunds: "4000000000009995",
};

export function assertNoRealCardData(text) {
  // Block accidental Luhn-looking sequences that aren't known Stripe test cards.
  const digits = String(text).replace(/\s+/g, "");
  const pans = digits.match(/\b\d{13,19}\b/g) || [];
  for (const pan of pans) {
    if (!Object.values(STRIPE_TEST_CARDS).includes(pan)) {
      throw new Error(`Non-sandbox card data detected in fixture: ${pan.slice(0, 4)}…`);
    }
  }
}

export function tempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capital-payment-qa-"));
  return openDb(path.join(dir, "billing.json"));
}

export function event(id, type, object) {
  return { id, type, data: { object } };
}

export async function startQaServer(overrides = {}) {
  const dbPath =
    overrides.dbPath ||
    path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "capital-payment-qa-")),
      "billing.json",
    );
  const db = overrides.db || openDb(dbPath);
  const webhookSecret = overrides.webhookSecret || "whsec_test_payment_qa";
  const stripe =
    overrides.stripe ||
    {
      checkout: {
        sessions: {
          create: async (params) => ({
            id: "cs_test_qa",
            url: "https://checkout.stripe.com/c/pay/cs_test_qa",
            mode: params.mode,
            currency: "usd",
            line_items: params.line_items,
            metadata: params.metadata,
          }),
        },
      },
      billingPortal: {
        sessions: {
          create: async ({ customer }) => ({
            url: `https://billing.stripe.com/p/session/test_${customer}`,
          }),
        },
      },
      webhooks: {
        constructEvent(raw, sig, secret) {
          if (secret !== webhookSecret) throw new Error("bad secret");
          if (!sig || sig === "bad") throw new Error("bad sig");
          return JSON.parse(raw.toString("utf8"));
        },
      },
    };

  const { server, config } = createBillingServer({
    env: {
      STRIPE_SECRET_KEY: "sk_test_payment_qa_placeholder",
      STRIPE_MODE: "test",
      FOUNDER_APPROVED_LIVE: "false",
      STRIPE_WEBHOOK_SECRET: webhookSecret,
      STRIPE_PRICE_FOUNDING_FAMILY: "price_founding_usd",
      STRIPE_PRICE_FAMILY_ANNUAL: "price_annual_usd",
      STRIPE_PRICE_FAMILY_MONTHLY: "price_monthly_usd",
      PUBLIC_APP_URL: "http://localhost:5000",
      BILLING_DB_PATH: dbPath,
      ...(overrides.env || {}),
    },
    stripe,
    db,
  });

  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, db, config, webhookSecret, port: server.address().port };
}

export function request(server, method, urlPath, { body, headers } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.from(body);
    const req = http.request(
      {
        host: "127.0.0.1",
        port: server.address().port,
        path: urlPath,
        method,
        headers: {
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": payload.length,
              }
            : {}),
          ...(headers || {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch {
            json = { raw: text };
          }
          resolve({ status: res.statusCode, json, text });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

export async function postWebhook(server, eventObj, { sig = "t=1,v1=test" } = {}) {
  return request(server, "POST", "/api/webhooks/stripe", {
    body: JSON.stringify(eventObj),
    headers: { "Stripe-Signature": sig },
  });
}
