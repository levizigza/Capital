---
id: company-os/README
title: Capital Company Operating System
doc_type: index
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
vendor_neutral: true
providers_forbidden:
  - OpenAI
  - Anthropic
  - Kortix
  - Cursor
  - any_specific_model_provider
---

# Capital Company OS

**What this is:** Canonical institutional memory for the Capital product/company.  
**What this is not:** A model-provider playbook, agent scratchpad, or generated strategy deck.

This directory is **vendor-neutral**. It must remain valid if every AI vendor disappeared tomorrow. Humans and any tooling may read it; nothing here may require a specific model API.

## Hierarchy of truth (highest → lowest)

| Rank | Layer | Examples | Rule |
|-----:|-------|----------|------|
| **1** | **Canonical facts** | `CAPITAL_CONSTITUTION.md` FACT blocks; freeze laws in repo docs/code; shipped product behavior with cited paths | Outranks everything. Change only via deliberate amendment + evidence. |
| **2** | **Product canon (repo)** | `docs/iconic-path.md`, `docs/story-bible.md`, `docs/game-pillars.md`, `.cursor/rules/iconic-freeze.mdc` | Cited as **evidence**. If OS and canon conflict, fix OS or amend canon in a PR — do not silently invent. |
| **3** | **Hypotheses** | Paid model, unit economics, ICP ranking | Labeled `status: hypothesis`. May guide experiments; never treated as facts. |
| **4** | **Experiment results** | `EXPERIMENT_LEDGER.md` rows with measured outcomes | Evidence for promoting/demoting hypotheses. |
| **5** | **Decisions** | `DECISION_LOG.md` | Binding until superseded; record evidence used. |
| **6** | **Temporary observations** | Playtest notes, agent session summaries, dashboards screenshots | Expire; must not rewrite Rank 1–2 without a decision. |
| **7** | **Generated recommendations** | Any LLM/agent proposal, external consultant memo | Advisory only. Require human approval per `APPROVAL_MATRIX.md` before becoming Rank 3+. |

**Invariant:** Canonical facts outrank hypotheses, agent memories, temporary observations, and generated recommendations.

## Document map

| File | Purpose |
|------|---------|
| [CAPITAL_CONSTITUTION.md](./CAPITAL_CONSTITUTION.md) | Non-negotiable laws |
| [PRODUCT_STORY.md](./PRODUCT_STORY.md) | Myth + product one-liner |
| [IDEAL_CUSTOMER.md](./IDEAL_CUSTOMER.md) | Segments from canon |
| [CUSTOMER_JOURNEY.md](./CUSTOMER_JOURNEY.md) | Session / lifecycle journey |
| [DESIGN_PILLARS.md](./DESIGN_PILLARS.md) | What we optimize for |
| [ANTI_PILLARS.md](./ANTI_PILLARS.md) | What we refuse |
| [BUSINESS_MODEL.md](./BUSINESS_MODEL.md) | How value might be captured |
| [UNIT_ECONOMICS.md](./UNIT_ECONOMICS.md) | Economic model (mostly UNKNOWN) |
| [BRAND_POSITIONING.md](./BRAND_POSITIONING.md) | Category + promise |
| [METRICS.md](./METRICS.md) | What we measure |
| [EXPERIMENT_LEDGER.md](./EXPERIMENT_LEDGER.md) | Tests of hypotheses |
| [DECISION_LOG.md](./DECISION_LOG.md) | Binding choices |
| [APPROVAL_MATRIX.md](./APPROVAL_MATRIX.md) | Who may change what |
| [AGENT_REGISTRY.md](./AGENT_REGISTRY.md) | Tooling roles (vendor-neutral) |
| [OPERATING_CADENCE.md](./OPERATING_CADENCE.md) | Rhythm of work |
| [RECESSION_PLAYBOOK.md](./RECESSION_PLAYBOOK.md) | Cut / keep under stress |

## Shared document schema

Every doc uses YAML front matter:

```yaml
---
id: company-os/<SLUG>
title: <string>
doc_type: <enum>
status: living | draft | deprecated
last_updated: "YYYY-MM-DD"
owner: <string or UNKNOWN>
schema_version: "1"
---
```

Body claims use explicit tags:

- **`FACT`** — verified in repository evidence (cite `evidence` / `source`)
- **`HYPOTHESIS`** — believed but unproven
- **`UNKNOWN` / `TODO`** — missing evidence; do not invent

Machine-parseable claim blocks (optional, preferred):

```yaml
claim:
  id: unique_slug
  status: fact | hypothesis | unknown
  text: "..."
  evidence:
    - path: docs/foo.md
      note: "..."
```

## Rules for edits

1. Do **not** invent Capital business facts absent from the repository.  
2. Prefer citing `docs/` and `src/` over memory.  
3. Promoting a hypothesis → fact requires evidence in `EXPERIMENT_LEDGER.md` or a `DECISION_LOG.md` entry.  
4. Agents may propose diffs; they may not silently elevate Rank 6–7 content.  
5. Keep this OS free of vendor lock-in (no required OpenAI/Anthropic/Kortix/Cursor/model APIs).

## Related product canon (outside this folder)

- `docs/iconic-path.md` — signature loop + freeze  
- `docs/iconic-later.md` — parked creep  
- `docs/story-bible.md` — mythology  
- `docs/player-fantasy-and-loop.md` — fantasy + navigability  
- `docs/game-pillars.md` — customers, paid hypothesis, metrics targets  
- `docs/mural-thesis.md` — organ + suit verb law  
- `.cursor/rules/iconic-freeze.mdc` — always-on freeze (editor tooling; laws are product facts regardless of editor)
