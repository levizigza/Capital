---
id: docs/AGENT_REGISTRY
title: Capital Agent Registry
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Capital Agent Registry

**Product reminder:** Harbor gameplay is `src/islands/`. The Agent Registry is **business/admin** — schema and governance for *potential* agents. It is not a workforce and not gameplay.

## Policy (hard)

1. **Registry before workforce.** Do not implement a multi-agent workforce until this registry exists and a slot is justified.
2. **Do not create agents simply to fill roles.** Customer research, marketing, sales, support, etc. are *possible capabilities*, not a mandate to spawn one agent per label.
3. **Instantiate only when** a measurable workflow demonstrates need for **independent** context, tools, and/or reasoning (see `InstantiationJustification`).
4. Default registry is **empty** (`agents: []`). Status `proposed` / `draft` entries still require justification fields before activation.

## Schema fields (every agent record)

| Field | Purpose |
|-------|---------|
| `id` | Stable slug |
| `name` | Display name |
| `mission` | Why this agent exists |
| `business_problem` | Concrete problem statement |
| `allowed_inputs` | Typed/input allowlist |
| `expected_outputs` | Output contracts |
| `tools` | Tool allowlist |
| `model` | Model id or `unassigned` |
| `context_sources` | Memory/docs/APIs in scope |
| `permissions` | Capability permissions (never silent escalate) |
| `budget` | Token/cost/run limits |
| `KPIs` | Measurable success metrics |
| `eval_suite` | How quality is tested |
| `failure_threshold` | When to stop / fail closed |
| `retry_limit` | Max retries |
| `escalation_target` | Human or system id |
| `approval_requirements` | HITL / tier needs |
| `status` | `draft` \| `proposed` \| `active` \| `paused` \| `retired` |
| `business_value` | Expected value narrative + optional estimate |
| `last_reviewed` | ISO date of last human review |

## Possible capabilities (catalog only — not agents)

`customer_research` · `market_research` · `marketing` · `sales` · `support` · `product_analysis` · `finance_analysis` · `qa` · `competitive_intelligence`

These labels may appear on a record’s `capabilities` tags **after** instantiation is justified. They do **not** auto-create agents.

## Instantiation gate

`register()` / `activate()` require `InstantiationJustification`:

- `workflow_id` — measurable workflow that needs help  
- `metric` + `baseline` + `target` — what improves  
- `why_independent_context`  
- `why_independent_tools`  
- `why_independent_reasoning`  
- At least one of the three “why_independent_*” must be substantive  

Filling a role name alone is rejected.

## Code

`src/business/agentRegistry/`
