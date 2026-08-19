---
id: docs/OPERATOR
title: Capital Operator Orchestration
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Capital Operator — Architecture

**Product reminder:** Player-facing Capital is `src/islands/`. The Operator is **business/admin executive coordination** — not gameplay, and not an autonomous CEO.

## Role

The Operator coordinates work. It does **not** own strategy, money movement, or irreversible commitments. Every high-impact change requires an **approval event** before execution.

## Pipeline (single coordinator)

```
observe
  → retrieve relevant company context
  → classify task
  → determine mode: deterministic workflow | AI reasoning
  → delegate when necessary (one handler — not a multi-agent swarm)
  → collect results
  → evaluate confidence
  → determine approval requirements
  → execute permitted actions only
  → record outcome (audit)
  → update metrics
  → preserve memory (agent_run_history / temp — never auto-canonical)
```

One orchestration path. Delegation is a typed `TaskHandler`, not a fleet of agents. Prefer deterministic workflows when the task class has a known playbook.

## Protected domains (never alter without approval)

| Domain | Examples |
|--------|----------|
| `company_mission` | Mission, constitution, north-star copy |
| `pricing_strategy` | Prices, plans, discount policy |
| `production_financial_transactions` | Charges, payouts, refunds in prod |
| `legal_commitments` | Contracts, ToS acceptance binding the company |
| `customer_privacy_policy` | Privacy policy, data retention rules |
| `production_deployments` | Ship to production / Pages / stores |
| `high_impact_public_communications` | Press, public launch posts, brand statements |
| `irreversible_strategic_decisions` | Pivot, kill product, legal entity changes |

Attempting execution against these without a matching `ApprovalEvent` → `blocked_pending_approval`.

## Typed I/O & audit

- **Input:** `OperatorRequest` (observation, optional context hints, actor)
- **Output:** `OperatorResult` (status, classification, confidence, actions taken/blocked, audit id)
- **State:** `ExecutionRecord` — append-only phases with timestamps; serializable for review

## Ports (avoid hard coupling)

- `ContextPort` — retrieve company context snippets
- `MemoryPort` — write run history / temp context (compatible with institutional memory)
- `MetricsPort` — record operator outcome metrics
- `TaskHandler` — optional external delegate for AI or specialty workflows

Defaults are in-process stubs so tests and local admin use need no backend.

## Relation to institutional memory

When `src/business/institutionalMemory` is available, Operator outcomes land in `agent_run_history` (or temp). Promotion to canonical remains a human ladder — the Operator never writes `canonical` directly.
