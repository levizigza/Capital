---
id: docs/INSTITUTIONAL_MEMORY
title: Institutional Memory Architecture
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Institutional Memory — Architecture

**Product reminder:** Player-facing Capital is `src/islands/` (signature loop). This system is **business/admin side memory** so the company can learn without corrupting canon.

## Storage classes

| Class | Purpose | Auto AI write? |
|-------|---------|----------------|
| `canonical` | Approved company truth / policy | **Never** |
| `customer_evidence` | Customer evidence with URIs | No |
| `experiments` | Experiment records | No |
| `decisions` | Decision log entries | No |
| `operational_state` | Ops state / runbook facts | No |
| `metrics` | Metric snapshots | No |
| `agent_run_history` | Agent/AI run outputs | **Yes (only here + temp)** |
| `temporary_working_context` | Scratch context (TTL) | Yes |

## Promotion workflow

```
observation
  → evidence          (requires evidence_refs)
  → hypothesis        (requires source_refs)
  → tested_finding    (requires evidence_refs to experiment/result)
  → approved_decision (requires approver human id)
  → canonical_policy  (writes StorageClass.canonical + version)
```

- Stages cannot be skipped.
- AI output cannot enter the ladder except as `observation` sourced from `agent_run_history` with explicit human promotion.
- `canonical_policy` never runs without `approver` and evidence/source refs.

## Version history & rollback

Canonical (and decision) records keep `versions[]`.  
`rollback(recordId, toVersion)` creates a new version whose body equals the target historical body (append-only audit).

## Code

`src/business/institutionalMemory/`

## Relation to gameplay

Does **not** change Harbor/Cove/Soft Beat. Optional later wiring to `company-os/` markdown is export-only.
