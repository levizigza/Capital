# Payment QA Report (Capital)

**Role:** Payment QA Agent (adversarial)  
**Target:** Stripe Checkout + webhooks + entitlements (`server/billing`)  
**Mode:** Sandbox / automated fixtures + manual checklist  
**Stripe docs:** [Testing](https://docs.stripe.com/testing) · [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted)  
**Generated from:** `npm run payment-qa:report` in `server/billing`  
**Automated result:** **23 pass / 3 fail**

---

## Launch gate

| Gate | Status |
|------|--------|
| SECURITY ISSUE present? | **YES** |
| FINANCIAL RISK present? | **YES** |
| **Production / live payments** | **BLOCKED** |

Live mode must remain off (`FOUNDER_APPROVED_LIVE` unset/false) until all SECURITY ISSUE and FINANCIAL RISK rows are remediated and this report is re-run green.

---

## Verdict summary

| Scenario | Verdict | Notes |
|----------|---------|-------|
| NEW CUSTOMER PAYMENT | **PASS** | Grant only after `checkout.session.completed`; catalog `price_` used |
| RETURNING CUSTOMER PAYMENT | **PASS** | Duplicate same `event.id` does not double ledger; entitlement stable |
| SUCCESSFUL SUBSCRIPTION | **PASS** | `active` + `stripe_subscription_id` + env `price_id` |
| DECLINED CARD | **PASS** | No webhook → no access (sandbox card `4000…0002`) |
| AUTHENTICATION REQUIRED | **PASS** | Grant only post-completed webhook (sandbox `4000…3155`) |
| PAYMENT PROCESSING | **PASS** | No grant without webhook (sandbox `4000…0077`) |
| PAYMENT FAILURE | **PASS** | `invoice.payment_failed` → `past_due`, access false |
| CANCELLATION | **PASS** | `customer.subscription.deleted` revokes access |
| RENEWAL | **PASS** | `invoice.paid` keeps active + records txn once |
| REFUND | **FINANCIAL RISK** | `charge.refunded` ignored — access remains |
| WEBHOOK DELAY | **PASS** | Success URL / delay without webhook → access false |
| DUPLICATE WEBHOOK | **PASS** | Idempotent on `event.id` |
| OUT-OF-ORDER WEBHOOK | **FINANCIAL RISK** | Late `invoice.paid` after delete re-grants access |
| NETWORK INTERRUPTION | **PASS** | Retry treated as duplicate; single grant |
| USER CLOSES CHECKOUT | **PASS** | Cancel route / no webhook → no access |
| SUCCESS URL MANUALLY VISITED | **PASS** | `/#/billing/success` alone never entitles |
| Product / price / currency wiring | **PASS** | Session uses env price ids; no `$` amounts in create params |
| Webhook signature | **PASS** | Bad signature → 400 |
| Secret redaction / live gate | **PASS** | Logs redact; live key blocked without founder flag |
| Unauthenticated access oracle | **SECURITY ISSUE** | `GET /api/access?email=` leaks entitlement + Stripe ids |
| Unknown offer abuse | **PASS** | Unknown `offerKey` does not create a paid session |

---

## Blocking findings (detail)

### 1. FINANCIAL RISK — REFUND

**Evidence:** `test/payment-qa/scenarios.test.js` → `REFUND`  
After one-time entitlement is active, `charge.refunded` is acknowledged (event marked processed) but **`entitlement_active` stays `true`**.

**Impact:** Refunded customers retain paid access.

**Required fix (direction):** Handle `charge.refunded` / `refund.created` (and map customer → email); set `entitlement_active=false` (and status such as `refunded`) idempotently.

### 2. FINANCIAL RISK — OUT-OF-ORDER WEBHOOK

**Evidence:** `test/payment-qa/scenarios.test.js` → `OUT-OF-ORDER WEBHOOK`  
Sequence: subscription canceled in DB → late `invoice.paid` → handler **forces `entitlement_active: true`**.

**Impact:** Canceled subscribers can regain access from a delayed/retried invoice event.

**Required fix (direction):** `invoice.paid` must not resurrect when current subscription is `canceled`/`unpaid` deleted, or must reconcile against Stripe subscription status before granting.

### 3. SECURITY ISSUE — ACCESS ORACLE

**Evidence:** `test/payment-qa/security.test.js` → `SECURITY: access probe`  
Unauthenticated `GET /api/access?email=victim@…` returns `entitlementActive`, `stripe_customer_id`, `stripe_subscription_id`, `price_id`.

**Impact:** Account enumeration / billing PII / Stripe id disclosure.

**Required fix (direction):** Require session auth, signed token, or return only a boolean to the owning user; never expose Stripe ids publicly.

---

## Non-blocking observations

| Item | Severity | Note |
|------|----------|------|
| Returning Checkout may create a new Stripe Customer if server does not pass existing `customer` | FAIL (ops) | Prefer reuse `stripe_customer_id` from DB on session create |
| CORS `*` on billing API | FAIL (ops) | Tighten to app origin in production |
| Manual sandbox matrix | Pending human | Follow `docs/PAYMENT_QA_MANUAL.md` with Test mode Dashboard |

---

## How to re-run

```bash
cd server/billing
npm install
npm run test:payment-qa          # suite only
npm run payment-qa:report        # suite + launch gate (exit 2 if blocked)
```

Manual: `docs/PAYMENT_QA_MANUAL.md`

---

## Sign-off

| Role | Decision |
|------|----------|
| Payment QA | **BLOCK production launch** |
| Reason | 1 SECURITY ISSUE + 2 FINANCIAL RISK open |

No test in this suite used real card data — only [Stripe test card numbers](https://docs.stripe.com/testing#cards).
