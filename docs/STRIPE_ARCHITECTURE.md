# Stripe Architecture (Capital)

**Primary sources (official):**  
[Checkout quickstart](https://docs.stripe.com/checkout/quickstart) · [Checkout fulfillment / webhooks](https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted) · [Webhook signatures](https://docs.stripe.com/webhooks/signatures) · [Customer portal](https://docs.stripe.com/customer-management/integrate-customer-portal) · [Products & prices](https://docs.stripe.com/products-prices/manage-prices) · [API versioning](https://docs.stripe.com/api/versioning)

**API version:** billing server pins `stripe-node`’s shipped `Stripe.API_VERSION` (aligned with docs for that SDK release). Bump the `stripe` package intentionally when upgrading.

**Stack fact:** Capital’s game is a **Vite + React** SPA deployed to **GitHub Pages**. Pages cannot hold Stripe secrets or verify webhooks. Billing therefore runs as a **small Node server** (`server/billing`) beside the SPA.

---

## Decision: Stripe Checkout (hosted)

| Option | Verdict |
|--------|---------|
| Payment Links only | Fine for first manual sale; **insufficient** once we need server entitlements + portal + webhook truth |
| **Stripe Checkout (hosted)** | **Chosen** — matches official quickstart; no custom card UI |
| Payment Element / custom UI | **Not** — no documented product need |

---

## Components

```
[SPA GitHub Pages]                    [server/billing Node]
  Buy → POST /api/checkout/session  →  stripe.checkout.sessions.create
       ← { url }                       (secret key server-only)
  redirect → Stripe Checkout
  success_url / cancel_url → SPA routes
                                      POST /api/webhooks/stripe
                                        constructEvent(rawBody, sig, whsec)
                                        idempotent event id store
                                        upsert customer / subscription / entitlement
  Manage billing → POST /api/portal/session
                 → billingPortal.sessions.create → redirect
  Access? → GET /api/access?email=…   (entitlement from DB, not success_url)
```

### Products & prices

- Created in **Stripe Dashboard (Test mode first)**.  
- App references **`price_…` IDs via env** (`STRIPE_PRICE_FOUNDING_FAMILY`, etc.).  
- **Never** hardcode dollar amounts in application code.

### Checkout session (server)

Per [Checkout quickstart](https://docs.stripe.com/checkout/quickstart):

- `mode`: `payment` (founding one-time) or `subscription` (later annual/monthly)  
- `line_items[{ price, quantity }]` from catalog env  
- `success_url` / `cancel_url` absolute SPA URLs  
- `customer_email` optional; Stripe creates/links Customer  

### Success & cancel

- SPA routes: `/#/billing/success` and `/#/billing/cancel` (hash-friendly for GH Pages).  
- Success page: “Thanks — unlocking when payment confirms” — **does not** set paid entitlement.  
- Entitlement only after verified webhook (or Dashboard-confirmed recovery process).

### Webhooks

Verify with official library (`stripe.webhooks.constructEvent`) using **raw body** + `Stripe-Signature` + `STRIPE_WEBHOOK_SECRET` ([docs](https://docs.stripe.com/webhooks/signatures)).

Handle at minimum:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Upsert customer; grant entitlement for one-time or mark subscription pending/active |
| `invoice.paid` | Confirm subscription period / grant or extend access |
| `invoice.payment_failed` | Flag past_due; do not expand access |
| `customer.subscription.updated` | Sync `subscription_status`, `price_id` |
| `customer.subscription.deleted` | Revoke or schedule end of access |

**Idempotency:** store processed `event.id`; duplicate delivery → 200 OK, no double grant.

### Database (minimal)

Store only Stripe ids + status needed for access:

- `stripe_customer_id`  
- `stripe_subscription_id` (nullable for one-time)  
- `price_id`  
- `subscription_status` (`active` \| `trialing` \| `past_due` \| `canceled` \| `none` + one-time `paid_one_time`)  
- `entitlement_active` boolean derived from trusted state  
- `processed_event_ids` for idempotency  

Implementation: JSON file store under `server/billing/data/` (gitignored) for smallest ops; swap to SQLite/Postgres later without changing the field contract.

### Customer portal

Per [portal integrate docs](https://docs.stripe.com/customer-management/integrate-customer-portal): Dashboard-configure portal → server creates `billingPortal.sessions` with `customer` + `return_url`.

### Live mode

`STRIPE_MODE=test` by default. Live requires **`FOUNDER_APPROVED_LIVE=true`** and live keys — never auto-enable.

### Security

- Secrets only in server env (never `VITE_*`).  
- Never log secret keys, full PAN, or CVC.  
- Webhook signature failure → **400**.  

---

## Why not only success_url fulfillment

Official Checkout fulfillment guidance: webhooks are required so fulfillment happens for every payment; redirects alone are not trustworthy ([fulfillment](https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted)). Capital follows that: **paid access = webhook-trusted state**.
