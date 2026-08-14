---
id: docs/SALES_OS
title: Capital Sales Operating System
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Lightweight Sales OS

**Product reminder:** Harbor is gameplay (`src/islands/`). Sales OS is **business/admin CRM** — lightweight pipeline + AI assist with hard denies.

## Lead record fields

lead capture · lead source · ICP classification · qualification · pipeline stage · last contact · next action · objections · offer shown · conversion · lost reason · expected value

## Pipeline stages

`captured` → `qualified` → `meeting_demo` → `offer` → `paid` (or `lost`)

## AI may

- research leads  
- prepare context  
- draft outreach  
- identify objections  
- recommend follow-up  
- summarize conversations  
- update **structured CRM fields** (non-contractual)

## AI may NOT autonomously

- make contractual commitments  
- change official pricing  
- offer unapproved discounts  
- make financial guarantees  
- misrepresent product capabilities  

Attempts are logged and rejected (`AiDeniedError`).

## Measurement

| Metric | Definition |
|--------|------------|
| lead → qualified | conversion rate |
| qualified → meeting/demo | conversion rate |
| meeting → offer | conversion rate |
| offer → paid | conversion rate |
| CAC | spend / paid |
| sales cycle | captured_at → paid_at (days) |
| revenue / source | paid expected_value by lead_source |
| retention / source | retention_rate by lead_source |

## Code

`src/business/salesOs/`
