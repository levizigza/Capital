# Experiment sequence (do not run all models at once)

## Active policy

| Phase | Offer id | Status | Why this first |
|-------|----------|--------|----------------|
| **0** | — | Instrumentation | Tracking sheet + rejection codes ready |
| **1** | `OFFER_FOUNDING_FAMILY` | **NEXT** | Lowest commitment narrative; learns WTP structure from S1 without subscription complexity |
| **2** | `OFFER_FAMILY_ANNUAL` *or* `OFFER_FAMILY_ONETIME` | Queued | Pick **one** based on Phase 1 payment-structure preference language |
| **3** | `OFFER_CU_PAID_PILOT` | Queued | Only after ≥1 institutional conversation classified PILOT/READY path |
| **4** | `OFFER_FAMILY_MONTHLY` | Parked | Higher ops + churn; run only if annual/one-time fail on cashflow objection with clear evidence |
| **5** | `OFFER_DLC_EXPANSION` | Parked | After base attach exists (pillars validation signal) |
| **—** | Classroom seat SaaS | **Not offered** | Product fit incomplete (no class codes) |

## Concurrent limit

- **Max 1 consumer offer** actively shown for payment at a time.  
- **Max 1 institutional pilot** offer in parallel (different buyer).  
- Founding + annual simultaneously = **forbidden** (confounds price learning).

## Stop / promote rules

| Signal | Action |
|--------|--------|
| Rejection codes dominated by `WRONG_CUSTOMER` / `NO_NEED` | Do not raise price; revisit ICP |
| `UNCLEAR_VALUE` / `LOW_TRUST` dominate | Fix promise, proof, TTV — not discount first |
| `NO_URGENCY` dominates | Change timing/trigger, not list price |
| `PRICE_TOO_HIGH` only after value clear + alternatives compared | Test adjacent price point on **same** offer |
| Paid + activate + retain | Promote offer to sales copilot `APPROVED_SKUS` candidate |
