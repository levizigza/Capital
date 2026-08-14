---
id: company-os/VOICE_OF_CUSTOMER
title: Voice of Customer System
doc_type: voc_guide
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
canonical_rank: 6
claim_status: observation
auto_promoted_to_fact: false
---

# Voice of Customer (VoC)

**Code:** `src/business/voc/`  
**Law:** Do **not** invent sentiment or customer facts. Preserve `evidence_uri` on every extract.

## Ingest sources

`interview` · `support` · `review` · `survey` · `sales_objection` · `feature_request` · `cancellation` · `forum`

## Extract kinds (annotation tags)

pain_point · desired_outcome · objection · alternative_used · switching_trigger · delight · retention_driver · churn_driver · customer_language · feature_request · pricing_signal · retention_signal

Severity is **human-only**. Quotes must appear in `raw_text` when text is stored.

## Weekly report

`generateCustomerTruthReport(store, weekId)` → `CUSTOMER_TRUTH_REPORT` with:

- most common pain  
- fastest-growing pain  
- new objections  
- strongest customer language (verbatim)  
- contradictions (same label tagged positive + negative)  
- product opportunities  
- pricing evidence  
- retention evidence  
- confidence level (`none` | `low` | `medium` | `high`)

Reports are **canonical_rank 6 observations** — never auto-promoted to FACT.

## Empty honesty

With no ingested Capital customer evidence, every report section is **UNKNOWN**. Seed only real transcripts/tickets/reviews.

## Output path (company memory)

Write markdown via `formatCustomerTruthReportMarkdown` to e.g.  
`company-os/reports/CUSTOMER_TRUTH_REPORT_<weekId>.md` when you run a weekly pass.
