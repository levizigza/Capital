---
id: docs/PRODUCT_CONTENT_ENGINE
title: Product-to-Content Engine
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Product-to-Content Engine

**Product reminder:** Harbor gameplay is `src/islands/`. This engine is **business/admin marketing ops** — it turns *real* product/customer learning into content candidates. It must not invent generic AI filler without an originating insight.

## Principle

**Insight → asset.** Every generated asset references ≥1 originating product/customer insight. Orphan / generic drafts are rejected.

## Inputs (insight kinds)

| Kind | Example |
|------|---------|
| `new_simulation` | New Harbor/finance sim surfaced in product |
| `financial_scenario` | Scenario players struggle with or love |
| `customer_question` | Repeated support / VoC question |
| `customer_pain_point` | Friction with evidence |
| `experiment` | Experiment finding (tested) |
| `product_discovery` | Unexpected product learning |
| `educational_module` | Teachable money concept from curriculum |
| `anonymized_behavior_pattern` | Aggregate pattern (no PII) |
| `founder_insight` | Founder note tied to evidence |

## Outputs (asset kinds)

`short_form_video` · `long_form_video` · `article` · `email_lesson` · `social_post` · `interactive_quiz` · `lead_magnet` · `shareable_financial_scenario`

## Funnel tracking

Per asset / acquisition source:

impressions → engagement → clicks → qualified_traffic → signup → activation → paid_conversion  

Also: **CAC**, **retention_by_acquisition_source**.

## Optimization

Score **customer quality**, not views alone:

`quality_score` weights activation, paid conversion, and retention far above impressions/engagement vanity.

## Code

`src/business/productContent/`
