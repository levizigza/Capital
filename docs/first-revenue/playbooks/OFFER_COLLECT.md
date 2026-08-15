# Offer + Collect (gated)

## Gates

1. Founder sets `approvedOfferId` in orchestrator state **and** `approvedForSale: true` on the offer in the ledger.  
2. Payment path is test/sandbox until `ESC_LIVE_PAYMENTS` is closed.  
3. Prospect is `QUALIFIED` (or founder explicitly allows exception).

## Collect path (simplest approved)

Prefer **Stripe Checkout (test)** or **Payment Link (test)** — whichever the founder marks in `paymentPath.preferred`.

Do not:

- Invent discounts  
- Take card data into Capital UI  
- Flip live mode without `FOUNDER_APPROVED_LIVE`

## After pay

1. Ledger `PAID` + `revenueUsd` only when payment is trusted.  
2. Immediately run **ACTIVATE** checklist (Harbor→Cove).  
3. Schedule **RETAIN** check (D7).
