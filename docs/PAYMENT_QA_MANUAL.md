# Payment QA — Manual Sandbox Checklist (Capital)

**Mode:** Stripe Test / sandbox only.  
**Cards:** Official [Stripe test cards](https://docs.stripe.com/testing#cards) only — **no real card data**.  
**Launch rule:** Any **SECURITY ISSUE** or **FINANCIAL RISK** → **block production**.

Automated companion: `npm run test:payment-qa` / `npm run payment-qa:report` in `server/billing`.

---

## Prep

| Step | Done |
|------|------|
| `STRIPE_MODE=test`, `sk_test_` on server only | ☐ |
| `STRIPE_PRICE_*` env set to Test mode price ids | ☐ |
| `stripe listen --forward-to localhost:4242/api/webhooks/stripe` | ☐ |
| SPA `VITE_BILLING_API_BASE` → billing server | ☐ |
| Dashboard Test mode ON | ☐ |

---

## Stripe test cards (documentation constants)

| Scenario | Number | Notes |
|----------|--------|-------|
| Success | `4242 4242 4242 4242` | Any future expiry, any CVC |
| Decline | `4000 0000 0000 0002` | Generic decline |
| Auth required (3DS) | `4000 0025 0000 3155` | Complete authentication |
| Processing | `4000 0000 0000 0077` | Stays processing |
| Insufficient funds | `4000 0000 0000 9995` | Decline |

Never enter a card from a real wallet.

---

## Cases

For each case record: **product**, **price id**, **currency**, **access**, **subscription_status**, **DB**, **UI**, verdict.

### NEW CUSTOMER PAYMENT

1. New email → Checkout `founding_family`.  
2. Pay success test card.  
3. Land `/#/billing/success` — UI must **not** unlock alone.  
4. Wait for `checkout.session.completed`.  
5. `GET /api/access?email=` → `entitlementActive: true`, correct `price_id`.  

**Expect:** PASS if webhook-gated. FAIL if success URL alone unlocks.

### RETURNING CUSTOMER PAYMENT

1. Same email, second Checkout (or portal + new purchase).  
2. Confirm one customer mapping (or document duplicate `cus_` if created).  
3. Entitlement remains correct; no duplicate ledger rows for same `event.id`.

### SUCCESSFUL SUBSCRIPTION

1. Session `family_annual` / `family_monthly`.  
2. Pay success card.  
3. DB: `stripe_subscription_id`, `subscription_status=active`, `price_id` matches env.  
4. Currency matches Stripe Price (usually `usd`).

### DECLINED CARD

1. Decline test card.  
2. No entitlement; no grant transaction.

### AUTHENTICATION REQUIRED

1. 3DS test card → complete auth.  
2. Grant only after completed webhook.

### PAYMENT PROCESSING

1. Processing test card.  
2. No grant until async success webhook (if enabled).

### PAYMENT FAILURE

1. Active sub → trigger `invoice.payment_failed` (failing card / Dashboard).  
2. `past_due`, `entitlementActive` false per policy.

### CANCELLATION

1. Customer Portal → cancel.  
2. `customer.subscription.deleted` or cancel-at-period-end update.  
3. Access revoked when status is `canceled` (or at period end if configured — document).

### RENEWAL

1. Test clock or advance invoice.  
2. `invoice.paid` keeps `active`.

### REFUND

1. Refund one-time charge in Dashboard.  
2. **Expect:** entitlement revoked after refund webhook.  
3. If still active → **FINANCIAL RISK**.

### WEBHOOK DELAY

1. Stop billing server, complete Checkout, open success URL.  
2. Access still false.  
3. Start server; Stripe retries; then access true once.

### DUPLICATE WEBHOOK

1. `stripe events resend <evt_…>` twice.  
2. One transaction; still one entitlement.

### OUT-OF-ORDER WEBHOOK

1. Deliver `customer.subscription.deleted` then late `invoice.paid` (CLI/fixtures).  
2. **Expect:** access stays revoked.  
3. If resurrected → **FINANCIAL RISK**.

### NETWORK INTERRUPTION

1. Kill server mid-webhook; restore; Stripe retry.  
2. Final DB consistent; no double grant.

### USER CLOSES CHECKOUT

1. Close Checkout / cancel URL.  
2. No entitlement.

### SUCCESS URL MANUALLY VISITED

1. Open `/#/billing/success?session_id=cs_fake` with no payment.  
2. Access false; UI does not claim unlocked.

---

## Verification matrix

| Check | How |
|-------|-----|
| Correct product | Dashboard session line item / metadata `offer_key` |
| Correct price | `price_id` == env Price id |
| Correct currency | Stripe Price currency |
| Correct account access | `entitlementActive` only from trusted DB |
| Correct subscription state | `subscription_status` + `stripe_subscription_id` |
| Correct database state | `server/billing/data/billing.json` (test) |
| Correct UI state | Success waits / Cancel no unlock |

---

## Verdict labels

| Label | Meaning |
|-------|---------|
| **PASS** | Behavior matches contract |
| **FAIL** | Broken but not clearly money/security critical |
| **SECURITY ISSUE** | Authz/authn, secret exposure, signature bypass → **block live** |
| **FINANCIAL RISK** | Paid access without payment, keep access after refund/cancel, double charge ledger → **block live** |
