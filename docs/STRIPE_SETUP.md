# Stripe Setup (Capital)

Follow with **Test / sandbox mode** until founder approval for live.

Official refs: [Checkout quickstart](https://docs.stripe.com/checkout/quickstart) · [Webhooks](https://docs.stripe.com/webhooks) · [Portal](https://docs.stripe.com/customer-management/integrate-customer-portal) · [API keys](https://docs.stripe.com/keys)

---

## 0. Prerequisites

- Stripe account  
- Node 20+  
- Capital repo checkout  
- Public HTTPS URL for webhooks in deployed environments (or Stripe CLI for local)

---

## 1. Products & prices (Dashboard — Test mode)

1. Dashboard → **Test mode** ON.  
2. Product catalog → Add product, e.g. `Capital — Founding Family Access`.  
3. Add **one-time** price (e.g. $29 USD) → copy `price_…` id.  
4. (Later) Add annual/monthly prices as separate `price_…` ids — map in env, not code amounts.

Optional: create subscription prices when Phase 2 monetization unlocks.

---

## 2. Customer portal (Dashboard)

1. Settings → Billing → **Customer portal**.  
2. Enable: payment method update, invoice history, cancel subscription (as policy allows).  
3. Save **Test mode** configuration (live is separate).

---

## 3. Environment (server only)

Copy `server/billing/.env.example` → `server/billing/.env` (gitignored via root `.env` patterns — keep billing `.env` out of git).

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | `sk_test_…` only in sandbox |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from endpoint or `stripe listen` |
| `STRIPE_PRICE_FOUNDING_FAMILY` | `price_…` id |
| `STRIPE_PRICE_FAMILY_ANNUAL` | optional later |
| `PUBLIC_APP_URL` | SPA origin, e.g. `http://localhost:5000` or GH Pages URL |
| `BILLING_PORT` | default `4242` |
| `STRIPE_MODE` | `test` (default) |
| `FOUNDER_APPROVED_LIVE` | must be `true` to use `sk_live_…` |

**Never** put `STRIPE_SECRET_KEY` or webhook secrets in `VITE_*` or frontend bundles.

Frontend may use:

| Variable | Purpose |
|----------|---------|
| `VITE_BILLING_API_BASE` | e.g. `http://localhost:4242` |

---

## 4. Install & run billing server

```bash
cd server/billing
npm install
npm run dev
```

Health: `GET http://localhost:4242/health`

---

## 5. Webhooks (local)

Per [webhook quickstart](https://docs.stripe.com/webhooks/quickstart):

```bash
stripe listen --forward-to localhost:4242/api/webhooks/stripe
```

Paste printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

Dashboard endpoint (deployed): URL `https://<billing-host>/api/webhooks/stripe`, events listed in architecture doc.

---

## 6. SPA success / cancel URLs

Checkout sessions use:

- Success: `{PUBLIC_APP_URL}/#/billing/success?session_id={CHECKOUT_SESSION_ID}`  
- Cancel: `{PUBLIC_APP_URL}/#/billing/cancel`

These pages **must not** grant access by themselves.

---

## 7. First Test checkout

1. From SPA or `curl` create session (`POST /api/checkout/session` with `{ "offerKey": "founding_family", "customerEmail": "…" }`).  
2. Open returned `url`.  
3. Pay with test card `4242 4242 4242 4242`.  
4. Confirm webhook `checkout.session.completed` processed.  
5. `GET /api/access?email=…` → `entitlementActive: true`.

Declined: `4000 0000 0000 0002`. Auth-required: `4000 0025 0000 3155` (see [test cards](https://docs.stripe.com/testing#cards)).

---

## 8. Live mode (founder gate)

1. Recreate products/prices/portal/webhooks in **Live**.  
2. Set live env vars on the server host.  
3. Set `FOUNDER_APPROVED_LIVE=true` and `STRIPE_MODE=live` **only** after written founder approval.  
4. Server refuses `sk_live_` unless that gate is set.

**Live mode is never enabled automatically by this integration.**
