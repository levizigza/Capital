# Sales ledger (internal)

Log every Stripe payment. **No secret keys.** Store Payment Link URL only in private founder notes if needed; here prefer payment intent / charge id from Dashboard.

| date | mode | offer_id | amount | currency | stripe_payment_id | customer_email | segment | access_granted_at | refund | notes |
|------|------|----------|--------|----------|-------------------|----------------|---------|-------------------|--------|-------|
| — | test/live | — | — | — | — | — | — | — | — | No sales yet |

## Access grant checklist

After PAID:

1. [ ] Confirm amount/offer match  
2. [ ] Email play URL + refund policy link  
3. [ ] Log `access_granted_at`  
4. [ ] Add monetization exposure row (conversion=paid)  
