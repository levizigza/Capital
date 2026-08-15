# Stripe Test Plan (Capital)

Sandbox / Test mode only unless founder has approved live.

Official card reference: [Stripe testing](https://docs.stripe.com/testing)

---

## Environment

- [ ] `STRIPE_MODE=test`  
- [ ] `sk_test_` secret on server only  
- [ ] `stripe listen` or Test webhook endpoint configured  
- [ ] Price id env set for `founding_family`  
- [ ] SPA `VITE_BILLING_API_BASE` points at billing server  

---

## Cases

### 1. Successful one-time payment

1. Create Checkout session for `founding_family`.  
2. Pay `4242 4242 4242 4242`.  
3. Land on success route — UI does **not** alone unlock.  
4. Webhook `checkout.session.completed` arrives; event id stored.  
5. Access API shows entitlement active.  
6. Stripe receipt email received (if enabled).

**Pass:** entitlement true only after webhook.

### 2. Declined payment

1. Card `4000 0000 0000 0002`.  
2. Checkout shows decline.  
3. No entitlement; no `checkout.session.completed` fulfillment grant.

### 3. Authentication-required payment

1. Card `4000 0025 0000 3155` (3DS).  
2. Complete authentication.  
3. On success, webhook grants access as in case 1.

### 4. Subscription renewal (when annual price configured)

1. Create session `mode=subscription` with annual price.  
2. Pay test card.  
3. `customer.subscription.updated` / `invoice.paid` keep status `active`.  
4. Use Stripe test clock or Dashboard to advance billing if needed.

### 5. Payment failure (subscription)

1. Active test subscription.  
2. Attach failing card / trigger `invoice.payment_failed`.  
3. Status becomes `past_due` (or equivalent); entitlement policy: **no expansion**; optionally soft-grace — document actual server behavior (Capital default: `entitlementActive` false when status not `active`/`trialing`/`paid_one_time`).

### 6. Cancellation

1. Open Customer Portal session.  
2. Cancel subscription.  
3. `customer.subscription.deleted` or update with cancel-at-period-end.  
4. Access revoked per policy when status is `canceled` (immediate) or at period end if configured.

### 7. Webhook retry

1. Temporarily return 500 from handler (test hook) or kill server mid-delivery.  
2. Stripe retries.  
3. After recovery, entitlement correct once.

### 8. Duplicate webhook delivery

1. Replay same `event.id` (Stripe CLI resend or store replay).  
2. Handler returns 200.  
3. **No** duplicate entitlement rows / double “transactions” in ledger.  
4. `processed_events` contains id once.

---

## Security checks

- [ ] No `sk_` in browser network tab or built JS  
- [ ] Logs contain no secret keys or full card numbers  
- [ ] Invalid webhook signature → 400  

---

## Live switch (blocked by default)

- [ ] Founder written approval recorded  
- [ ] `FOUNDER_APPROVED_LIVE=true`  
- [ ] Live webhook endpoint + live price ids  
- [ ] Re-run subset of tests in live with real small amount only if founder directs  
