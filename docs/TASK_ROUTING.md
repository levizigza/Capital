---
id: docs/TASK_ROUTING
title: Task Routing Engine
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Task Routing Engine

**Product reminder:** Harbor gameplay is `src/islands/`. This engine is **business/admin** task classification for Capital’s Operator and workflows.

## Route classes

| Class | When |
|-------|------|
| `DETERMINISTIC_WORKFLOW` | Known procedure, repeatable calculation, programmatic validation, little judgment |
| `AI_ASSISTED_WORKFLOW` | Interpretation helps; output still reviewable/validatable |
| `AI_AGENT` | Ambiguous + multi-step planning needed + tool choice depends on evolving context |
| `HUMAN_DECISION` | Strategic, irreversible, legally sensitive, financially material, or ethically significant |

## Conflict priority

1. **HUMAN_DECISION** always wins when consequence signals fire (even if a formula exists).
2. Else **DETERMINISTIC_WORKFLOW** when procedure/calc/validation criteria hold and judgment demand is low.
3. Else **AI_AGENT** only when ambiguity, multi-step planning, *and* evolving tool choice all apply.
4. Else **AI_ASSISTED_WORKFLOW** (default for interpretive / residual tasks).

Every decision includes `reason_for_routing` (human-readable) plus structured `signals` for audit.

## Code

`src/business/taskRouting/`
