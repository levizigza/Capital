---
id: docs/BUSINESS_STRESS_TEST
title: Business Stress-Test Engine
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Business Stress-Test Engine

**Product reminder:** Harbor is the product (`src/islands/`). This engine stress-tests **Capital’s business economics** under demand shocks — not gameplay.

## Scenarios

| Id | Demand multiplier |
|----|-------------------|
| `BASELINE` | 1.0 |
| `DEMAND_DOWN_20` | 0.80 |
| `DEMAND_DOWN_40` | 0.60 |
| `DEMAND_DOWN_60` | 0.40 |

## Impacts calculated

revenue · gross profit · contribution profit · cash · runway · AI/API expense · marketing · fixed costs · customer retention · CAC · payback

Missing inputs stay `null` / `UNKNOWN` — never invent revenue, CAC, or LTV.

## Response priority (fixed order)

1. protect customer value  
2. protect retention  
3. cut non-essential variable waste  
4. cut weak acquisition  
5. remove non-core tools/features  
6. renegotiate fixed expenses  
7. narrow focus to highest-contribution customer/product  
8. preserve cash  
9. identify strategically attractive opportunities  

## Hard guardrail

**Never** recommend indiscriminate cuts that damage the **core product** (Harbor signature loop / Cove→Paycheck→Credit experience) without an explicit **long-term consequences** explanation. Such proposals are `blocked` or marked `requires_consequence_disclosure`.

## Code

`src/business/stressTest/`
