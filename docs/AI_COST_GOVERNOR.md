---
id: docs/AI_COST_GOVERNOR
title: AI Cost Governor
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# AI Cost Governor

**Product reminder:** Harbor is gameplay (`src/islands/`). The Cost Governor caps **business/admin AI** spend and routes models by complexity — it does not change the game loop.

## Per-workflow / agent budget (configurable)

| Field | Purpose |
|-------|---------|
| `model` | Default / assigned model id |
| `maximum_tokens` | Soft/hard token cap per run |
| `maximum_steps` | Max orchestration steps |
| `maximum_tool_calls` | Max tool invocations |
| `maximum_retries` | Finite retries (no indefinite loops) |
| `maximum_runtime` | Wall-clock ms cap |
| `maximum_dollar_cost` | USD (or unit) cap per run |
| `fallback_behavior` | What to do when a limit trips |

## Model routing

| Complexity | Tier |
|------------|------|
| `low` | low-cost model |
| `moderate` | mid-tier model |
| `strategic` / `high` | high-capability model |

## Downgrade gate (hard)

**Quality thresholds must be established with evals before downgrading models.**  
`proposeDowngrade()` requires a passing `EvalGate` snapshot; otherwise blocked.

## Tracking

- cost / task  
- business value / task  
- failure-adjusted cost (`cost / max(success_rate, ε)`)  
- tokens / task  
- model comparison  

## Value guard

Flag any process whose **AI cost grows faster than its economic value** (rolling cost slope > value slope, or cost/value ratio rising past threshold).

## Code

`src/business/aiCostGovernor/`
