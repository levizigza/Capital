---
id: company-os/EXPERIMENT_LEDGER
title: Experiment Ledger
doc_type: experiment_ledger
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Experiment Ledger

## Schema

```yaml
experiment:
  id: string
  status: planned | running | completed | abandoned | unknown
  hypothesis_ref: string
  claim_status: hypothesis
  method: string
  result: string | null
  measured_at: string | null
  evidence: [{ path: string, note?: string }]
```

---

## Entries

Repo documents **intent** to playtest and measure; few completed experiments with numeric results are checked into company-os. Do not invent outcomes.

```yaml
experiment:
  id: coincraft_vertical_slice_beta
  status: planned
  hypothesis_ref: "docs/game-pillars.md vertical slice + metrics table"
  claim_status: hypothesis
  method: "Ship Coincraft Cove vertical slice; instrument funnel; compare to targets in METRICS.md"
  result: null
  measured_at: null
  evidence:
    - path: docs/game-pillars.md
    - path: docs/production-plan-10-weeks.md
```

```yaml
experiment:
  id: paper_walkthrough_families_teacher
  status: unknown
  hypothesis_ref: "Week 1 playtest paper walkthrough with 2 families + 1 teacher"
  claim_status: hypothesis
  method: "Paper walkthrough (production plan)"
  result: null
  measured_at: null
  evidence:
    - path: docs/production-plan-10-weeks.md
      note: "Planned deliverable; completion/results not evidenced in this OS snapshot"
```

```yaml
experiment:
  id: paid_expansion_attach
  status: planned
  hypothesis_ref: "company-os/BUSINESS_MODEL.md#expansion_dlc"
  claim_status: hypothesis
  method: "After base completion, offer expansion; measure attach + refund + teacher qualitative 'no monetized pressure'"
  result: null
  measured_at: null
  evidence:
    - path: docs/game-pillars.md
```

```yaml
experiment:
  id: iconic_cold_playtest
  status: unknown
  hypothesis_ref: "Signature loop cold-retellable (Coin · Clock · Spiral · Memory)"
  claim_status: hypothesis
  method: "Cold playtest checklist in iconic-path; scripts under scripts/cold-*.mjs"
  result: null
  measured_at: null
  evidence:
    - path: docs/iconic-path.md
    - path: scripts/cold-spine-retell.mjs
```

---

## How to add a result

1. Keep `claim_status: hypothesis` until measured.  
2. Fill `result` + `measured_at` + evidence paths (PR, spreadsheet export, analytics dump).  
3. If promoting a business FACT, add `DECISION_LOG.md` entry citing this experiment id.
