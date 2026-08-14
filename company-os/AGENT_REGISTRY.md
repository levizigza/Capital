---
id: company-os/AGENT_REGISTRY
title: Agent Registry
doc_type: agent_registry
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Agent Registry

Vendor-neutral registry of **roles** that may help operate Capital.  
**Not** a list of model vendors. Do not add OpenAI/Anthropic/Kortix/Cursor (or any provider) as required runtime.

## Schema

```yaml
agent_role:
  id: string
  status: fact | hypothesis | unknown
  purpose: string
  may_write_rank: string
  must_not: string
  deterministic_alternative: string
```

---

## Roles

```yaml
agent_role:
  id: human_product_lead
  status: hypothesis
  purpose: "Owns Rank 1–5 truth; approves constitution and freeze exceptions."
  may_write_rank: "1–5"
  must_not: "Leave FACT unmarked without evidence"
  deterministic_alternative: "N/A — human accountability"
```

```yaml
agent_role:
  id: craft_implementer
  status: fact
  purpose: "Implements Islands product per iconic-path and pillars (human or assisted)."
  may_write_rank: "Code + draft OS diffs"
  must_not: "Invent business FACTS; break freeze without decision"
  deterministic_alternative: "Normal software engineering against docs/"
```

```yaml
agent_role:
  id: qa_cold_playtester
  status: fact
  purpose: "Run cold playtest checklist / iconic scripts / e2e."
  may_write_rank: "6 (observations) → ledger via human"
  must_not: "Treat pass/fail as business revenue fact"
  deterministic_alternative: "scripts/cold-*.mjs, playwright e2e, vitest"
```

```yaml
agent_role:
  id: security_reviewer
  status: fact
  purpose: "Threat model + security-check hygiene."
  may_write_rank: "Draft security notes"
  must_not: "Claim multi-user secrecy on client-only crypto"
  deterministic_alternative: "docs/security/*, scripts/security-check.mjs"
```

```yaml
agent_role:
  id: content_author
  status: fact
  purpose: "Write island quests/Takes within mythology + Zod content."
  may_write_rank: "Content packs"
  must_not: "Second cosmos; pay-to-win"
  deterministic_alternative: "docs/island-design-process.md + content schemas"
```

```yaml
agent_role:
  id: advisory_reasoning_assistant
  status: hypothesis
  purpose: "Optional drafting aid for docs/PRs when humans ask."
  may_write_rank: "7 proposals only"
  must_not: "Become source of truth; require a specific model vendor; auto-merge"
  deterministic_alternative: "Checklists, feature-gate scoring, templates"
```

---

## Explicit non-entries

```yaml
claim:
  id: no_vendor_lock
  status: fact
  text: "No agent_role may list a required model provider API as a dependency of Company OS."
  evidence:
    - path: company-os/README.md
```

```yaml
claim:
  id: department_agents_not_default
  status: hypothesis
  text: "Do not spawn an agent per corporate department by default; prefer deterministic software and human owners (architecture audit principle)."
  evidence: []
```
