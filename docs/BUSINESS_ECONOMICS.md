---
id: docs/BUSINESS_ECONOMICS
title: Business Economics Engine
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
---

# Business Economics Engine

**Code:** `src/business/economics/`  
**Law:** Do **not** fabricate accounting data. Missing inputs → `null` derived fields + `nullReasons`.

## Tracked inputs

| Input | Field |
|-------|--------|
| Gross revenue | `grossRevenue` |
| Refunds | `refunds` |
| Payment fees | `paymentFees` |
| AI/API variable cost | `aiApiVariableCost` |
| Hosting variable cost | `hostingVariableCost` |
| Other delivery cost | `otherDeliveryCost` |
| Marketing spend (acquisition expense) | `marketingSpend` |
| Fixed operating expense | `fixedOperatingExpense` |
| Cash balance | `cashBalance` |
| Paying customers | `payingCustomers` |
| New customers | `newCustomers` |
| Funnel entries / conversions | `acquisitionFunnelEntries`, `conversions` |
| Retention / churn | `retentionRate`, `churnRate` |

## Equations

```
Net Revenue = Gross Revenue − Refunds

Variable Delivery Cost =
  Payment Fees + AI/API + Hosting + Other Delivery

Gross Profit = Net Revenue − Variable Delivery Cost

Contribution Profit = Gross Profit − Acquisition Expense (marketing)

Operating Profit = Contribution Profit − Fixed Operating Expense

ARPU = Net Revenue / Paying Customers
CAC = Marketing Spend / New Customers
Conversion = Conversions / Funnel Entries
Churn = explicit, or 1 − Retention
LTV = ARPU / Churn   (null if churn ≤ 0 — no invented infinity)
CAC payback periods = CAC / (Contribution Profit / Paying Customers)
```

## Multi-objective alerts

Thresholds alert on gross/contribution/operating margins, LTV:CAC, CAC payback, retention, churn, refund rate, cash floor, MoM contribution decline, and **revenue-up / contribution-down** (explicitly rejects revenue-only optimization).

Defaults live in `DEFAULT_ECONOMICS_THRESHOLDS` — policy knobs, not books.

## Historical trends

`EconomicsTrendStore` upserts snapshots by `periodId`, serializable JSON (`capital_business_economics_trends_v1` localStorage key optional). Empty store until humans (or imports) supply periods.

## Company OS

When `company-os/UNIT_ECONOMICS.md` is present, keep live numbers UNKNOWN until an experiment or ledger cites a snapshot — this engine computes; it does not invent.
