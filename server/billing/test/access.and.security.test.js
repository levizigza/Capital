import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { openDb } from "../src/db.js";
import { assertSecretKeyAllowed } from "../src/config.js";
import {
  createBillingServer,
  neverLogSecrets,
} from "../src/index.js";

function tempDbPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "capital-billing-"));
  return path.join(dir, "billing.json");
}

function request(server, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request(
      {
        host: "127.0.0.1",
        port: addr.port,
        path: urlPath,
        method,
        headers: body
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(body),
            }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode,
            json: text ? JSON.parse(text) : null,
          });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

describe("access control", () => {
  it("does not grant access from success_url alone (empty DB)", async () => {
    const dbPath = tempDbPath();
    const { server } = createBillingServer({
      env: {
        STRIPE_SECRET_KEY: "sk_test_placeholder_for_unit_tests",
        STRIPE_MODE: "test",
        FOUNDER_APPROVED_LIVE: "false",
        BILLING_DB_PATH: dbPath,
        STRIPE_PRICE_FOUNDING_FAMILY: "price_test",
        PUBLIC_APP_URL: "http://localhost:5000",
      },
      stripe: {
        checkout: { sessions: { create: async () => ({}) } },
        billingPortal: { sessions: { create: async () => ({}) } },
        webhooks: { constructEvent: () => ({}) },
      },
      db: openDb(dbPath),
    });

    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    try {
      const res = await request(
        server,
        "GET",
        "/api/access?email=visitor@example.com",
      );
      assert.equal(res.status, 200);
      assert.equal(res.json.entitlementActive, false);
      assert.equal(res.json.source, "billing_db_trusted_webhooks");
      assert.equal(res.json.subscription_status, "none");
    } finally {
      server.close();
    }
  });
});

describe("live mode founder gate", () => {
  it("blocks sk_live_ without FOUNDER_APPROVED_LIVE", () => {
    assert.throws(
      () =>
        assertSecretKeyAllowed("sk_live_abc", {
          STRIPE_MODE: "live",
          FOUNDER_APPROVED_LIVE: "false",
        }),
      /founder/i,
    );
  });

  it("blocks live mode flag without approval", () => {
    assert.throws(
      () =>
        assertSecretKeyAllowed("sk_test_abc", {
          STRIPE_MODE: "live",
          FOUNDER_APPROVED_LIVE: "false",
        }),
      /FOUNDER_APPROVED_LIVE/,
    );
  });

  it("allows sk_test_ in test mode", () => {
    const mode = assertSecretKeyAllowed("sk_test_abc", {
      STRIPE_MODE: "test",
      FOUNDER_APPROVED_LIVE: "false",
    });
    assert.equal(mode, "test");
  });
});

describe("secret redaction", () => {
  it("never leaves secret keys or whsec in log text", () => {
    const raw =
      "fail sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz whsec_abc123XYZ and 4242424242424242";
    const cleaned = neverLogSecrets(raw);
    assert.equal(cleaned.includes("sk_test_"), false);
    assert.equal(cleaned.includes("whsec_"), false);
    assert.equal(cleaned.includes("4242424242424242"), false);
    assert.match(cleaned, /\[redacted\]/);
  });
});
