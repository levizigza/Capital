# Offer + Collect (Payment Link first)

## Gates

1. Founder sets `approvedOfferId` **and** ledger offer `approvedForSale: true`.  
2. Prefer **Stripe Payment Link** for first revenue (quick path). Checkout is optional later.  
3. Test/sandbox until `ESC_LIVE_PAYMENTS` is closed.  
4. Prospect is `QUALIFIED` (or founder allows an exception after a strong test).

## Collect path

1. Create Product/Price in Stripe Dashboard (Test, then Live when approved).  
2. Create **Payment Link** for that price.  
3. Sales Copilot / human sends the link after the offer conversation — no card data in Capital.  
4. Record ledger `OFFERED` → `CHECKOUT_STARTED` (link opened if known) → `PAID` only when payment is real.

Do not:

- Invent discounts  
- Build custom card UI for first dollar  
- Enable live mode without founder approval  
- Treat Dashboard “succeeded” as bank cash (see [CASH_STRIPE_CA.md](../CASH_STRIPE_CA.md))

## After pay

1. Ledger `PAID` + `revenueUsd`.  
2. **ACTIVATE** immediately (Harbor→Cove).  
3. **RETAIN** check by D7 — this closes the one-stranger milestone only if they return.
