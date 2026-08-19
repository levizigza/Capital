# Stripe Quick Revenue

**Mission:** Customer wants Capital → customer can pay Capital — with **minimum engineering**.  
**Decision:** For the current monetization experiment (`OFFER_FOUNDING_FAMILY`), **Stripe Payment Links are sufficient**. Do **not** build custom Checkout until a demonstrated product need appears.

| Rule | |
|------|--|
| No Stripe **secret** keys in git or frontend | Publishable keys only if ever needed later; Payment Links need none in app |
| No **live** charges while testing | Use Stripe **Test mode** until founder flips live |
| No custom Checkout / Elements / Billing portal code in this pass | Dashboard Payment Link only |
| Official price | Founder sets Test + Live amounts in Stripe; code stores **records**, not secrets |

---

## 1. Validated / active offer type

| Question | Answer |
|----------|--------|
| Current experiment (monetization Phase 1) | `OFFER_FOUNDING_FAMILY` |
| Offer type | **`ONE_TIME_PAYMENT`** |
| Payment Links sufficient? | **Yes** — one-time Payment Link covers founding access |
| Subscription needed now? | **No** (annual/monthly parked until Phase 2) |
| Pilot needed now? | **No** as default; if a CU is READY_TO_BUY for pilot, use a **separate** one-time Payment Link or Stripe Invoice — still no custom Checkout |

### Evaluation matrix

| Need | Payment Link OK? | Notes |
|------|------------------|-------|
| One-time founding / base license | Yes | Primary path |
| Annual / monthly subscription | Yes (recurring Payment Link) | Later phase only |
| Fixed-fee institutional pilot | Yes (one-time) or Invoice | Prefer Invoice if PO required |
| In-app entitlement automation | No (not required for first sale) | Grant access manually after payment email/webhook later |
| Multi-seat self-serve portal | No | Not current model |
| Tax / VAT automation | Partial | Enable Stripe Tax in Dashboard if needed — still Payment Link |

**Conclusion:** Payment Links satisfy the **current** business model. Custom Checkout = deferred.

---

## 2. Founder checklist (Test mode first)

### 2.1 Stripe product

1. Open [Stripe Dashboard](https://dashboard.stripe.com) → toggle **Test mode** ON.  
2. **Product catalog** → Add product.  
3. Suggested fields:

| Field | Suggested value |
|-------|-----------------|
| Name | `Capital — Founding Family Access` |
| Description | `Household founding license: Harbor + Coincraft Cove adventure path (money choices with consequences). Not a debit card. Not pay-to-win.` |
| Image | Optional Capital/Harbor still (optional) |

### 2.2 Stripe price

| Field | Suggested value |
|-------|-----------------|
| Pricing model | Standard pricing |
| Price | **`29.00`** (matches monetization hypothesis — founder may adjust in Dashboard only) |
| Currency | **`usd`** default; use **`cad`** if selling primarily to Canadian buyers (pick **one** primary currency per link) |
| Billing | **One time** |

Do not create recurring prices for this Phase 1 link.

### 2.3 Currency

- **Primary recommendation for first US-facing experiment:** `usd`.  
- **If founder/customers are Canada-first:** create the Test product price in `cad` instead (or a second price + second link later).  
- Do not mix currencies on one Payment Link.

### 2.4 One-time vs recurring

| Phase 1 founding | **One-time** |
| Phase 2 annual (later) | Recurring yearly Payment Link — **new** product/price/link |
| Phase 2 monthly (parked) | Recurring monthly — only if experiment sequence unlocks |

### 2.5 Payment Link configuration

Create **Payment link** from the one-time price:

| Setting | Recommendation |
|---------|----------------|
| Allow promotion codes | **Off** (until approved discounts exist) |
| Collect customer emails | **On** (required for receipt + access grant) |
| Collect phone | Off unless needed |
| Quantity | Allow adjustment: **Off** (1 household) or On with max 1 |
| After payment | **Hosted confirmation** + optional redirect (see success experience) |
| Tax | Optional Stripe Tax — founder decision |
| Shipping | **Off** (digital) |
| Call to action | Pay / Buy |
| Title on page | `Capital founding access` |

Copy the Payment Link URL into the **internal sale recording** sheet (never invent URLs in code).  
Mark the link as `test` until Live mode duplicate is created.

### 2.6 Success experience

Minimum (no engineering):

1. Stripe-hosted **“Payment successful”** page.  
2. Founder receives Stripe email / Dashboard notification.  
3. Founder manually emails buyer: play URL + what they bought + refund policy link.  

Optional later (still no Checkout app):

- Payment Link “After payment” → redirect to a static success page on GitHub Pages (e.g. `/thanks`) with play CTA.  
- Do **not** put secrets on that page.

### 2.7 Cancellation / refund policy link

Publish a short public page or doc section (suggested path: `docs/stripe-revenue/REFUND_POLICY.md` or site `/refund`) and paste its URL into:

- Stripe product description (short), and/or  
- Post-purchase email, and/or  
- Payment Link custom text / FAQ  

Phase 1 policy aligned with monetization offer: **14-day refund if Cove Take is not reachable**; no auto-renew (one-time).

### 2.8 Customer receipt

Stripe emails a **receipt** automatically when “Successful payments” emails are enabled (Settings → Customer emails).  
Confirm in Test mode with a test card (`4242…`) that receipt + Dashboard payment appear.

### 2.9 Internal sale recording

For every payment (test or live), log:

See `SALES_LEDGER.md` / `src/business/stripeRevenue` record shape:

- date · mode (test/live) · offer_id · amount · currency · stripe_payment_id · customer email · segment · access_granted_at · refund?

---

## 3. Going live (only when ready)

1. Repeat product/price/link creation in **Live mode** (or activate same catalog carefully).  
2. Replace Test Payment Link in outreach/sales with Live URL.  
3. Keep Test link for QA only.  
4. Complete CASL/consent review for commercial email if applicable.  
5. First live sale: record in ledger → grant access → watch activation.

---

## 4. Secrets & engineering boundary

| Allowed in repo | Forbidden in repo |
|-----------------|-------------------|
| This playbook | `sk_live_…` / `sk_test_…` |
| Sale ledger **without** secrets | `.env` with secrets committed |
| Offer ids / amounts as hypotheses | Frontend Stripe secret usage |
| Refund policy markdown | Hard-coded live Payment Link pretending to be universal |

No Stripe SDK is required for Phase 1 Payment Links.

---

## 5. When to build custom Checkout (not now)

Only if demonstrated need, e.g.:

- In-app entitlement must unlock automatically at scale  
- Complex multi-SKU cart inside Capital UI  
- Mandatory Customer Portal self-serve beyond Dashboard  

Until then: **Payment Link wins.**

---

## 6. Quick path summary

```
Founder Dashboard (Test)
  → Product: Capital Founding Family Access
  → Price: $29 USD one-time
  → Payment Link (email on, promos off, digital)
  → Test pay with 4242…
  → Record sale + email access
  → When ready: Live link → first real customer
```

**Objective met:** first real customer payment with minimum engineering complexity.
