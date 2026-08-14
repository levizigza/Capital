---
id: docs/RETENTION_CS
title: Retention & Customer-Success Monitoring
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Retention & Customer-Success Monitoring

**Product reminder:** Harbor is gameplay (`src/islands/`). This system is **business/admin** retention ops — measure cohorts, detect anomalies, **diagnose before buying more traffic**.

## Cohorts tracked

| Metric | Meaning |
|--------|---------|
| `activation` | Completed activation event in window |
| `day_1` | Returned / retained on Day 1 |
| `day_7` | Day 7 retention |
| `day_30` | Day 30 retention |
| `month_2_plus` | Still active in Month 2+ |
| `paid_retention` | Paid customers still paying / active |
| `feature_adoption` | Adoption rate of key features |
| `session_frequency` | Sessions per user in window |
| `learning_progression` | Curriculum / island progression rate |
| `cancellations` | Cancel rate (higher = worse) |
| `re_activation` | Previously churned users returning |

## Anomaly detection

Compares latest cohort snapshot to baseline (prior periods / expected).  
Flags `drop`, `spike` (for cancellations), and `stagnation` with severity.

## Diagnosis-first policy (hard)

When retention falls, the system **must prioritize diagnosis** before recommending additional **paid acquisition**.

Order of recommendation kinds:

1. `diagnose` / `investigate`  
2. `product_fix` / `onboarding_fix` / `support_intervention`  
3. Only then `acquisition` — and **blocked** while open retention anomalies exist unless explicitly overridden by a human

## Root-cause hypotheses use

cohort · acquisition source · product version · customer type · onboarding path · usage behavior · support history

Every recommendation includes **evidence** and **confidence** (0..1).

## Code

`src/business/retentionCs/`
