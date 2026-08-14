---
id: docs/AI_EVAL_FRAMEWORK
title: AI Worker Evaluation Framework
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# AI Worker Evaluation Framework

**Product reminder:** Harbor is gameplay (`src/islands/`). This framework evaluates **business/admin AI workers** — not player-facing agents in the game loop.

## Metrics (every worker)

| Metric | Meaning |
|--------|---------|
| `task_completion_rate` | Tasks finished successfully / attempted |
| `accuracy` | Human-judged or gold-set correctness |
| `human_correction_rate` | Tasks needing human edit |
| `hallucination_rate` | Unsupported claims / outputs |
| `tool_failure_rate` | Tool calls that failed |
| `retry_rate` | Retries / attempts |
| `average_latency` | Mean task latency (ms) |
| `tokens_per_task` | Mean tokens |
| `cost_per_task` | Mean USD (or unit) cost |
| `escalation_rate` | Escalations / attempts |
| `business_value_created` | Attributed value units (explicit; no invention) |

## Audit trail (every run)

Stores: input · context references · tools used · actions taken · outputs · approvals · cost · result

Append-only; preserved on failure.

## Failure thresholds (configurable per worker)

Defaults include `max_retries`, `max_consecutive_errors`, max rates for hallucination/tool failure, max cost/latency.

## Stop policy (hard)

When a worker exceeds retry or error limit:

1. **STOP** — no further autonomous retries  
2. **Preserve state** — freeze audit + working snapshot  
3. **Document failure** — structured failure record  
4. **Escalate** — to configured `escalation_target`  

**Never** allow indefinite autonomous retry loops (`max_retries` is finite and enforced).

## Code

`src/business/aiEval/`
