---
id: docs/HITL_APPROVAL
title: Human-in-the-Loop Approval System
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Human-in-the-Loop Approval

**Product reminder:** Harbor is gameplay (`src/islands/`). HITL is **business/admin** execution control — not an autonomous CEO.

## Risk dimensions

Each scored `0` (none) … `4` (severe):

| Dimension | Meaning |
|-----------|---------|
| `financial_impact` | Money at risk / material spend |
| `reversibility` | Hard to undo (high score = hard to reverse) |
| `customer_impact` | Breadth/severity of customer harm |
| `legal_sensitivity` | Contracts, regulation, liability |
| `security_sensitivity` | Auth, secrets, breach surface |
| `brand_impact` | Public reputation / trust |
| `data_sensitivity` | PII, kids’ data, retention |
| `strategic_impact` | Mission, pricing strategy, irreversible bets |

## Risk tiers

| Tier | Gate |
|------|------|
| `LOW` | May execute automatically |
| `MEDIUM` | May execute within **explicit policy thresholds** |
| `HIGH` | Requires **founder approval** |
| `CRITICAL` | Founder approval **+ second confirmation** |

Tier is derived from max dimension score and weighted sum (conservative: any dimension ≥4 → at least HIGH; ≥4 on legal/security/data or sum spike → CRITICAL).

## Approval request (required fields)

Every request must include:

- `recommended_action`
- `reason`
- `evidence`
- `expected_upside`
- `expected_cost`
- `confidence` (0..1)
- `reversibility` (narrative; dimension score also stored)
- `worst_case`
- `alternative_action`
- `responsible` (agent/workflow id)

## Decision log

Append-only `ApprovalDecisionLog` — request, tier, gate outcome, approvers, timestamps. No silent deletes.

## Code

`src/business/hitl/`
