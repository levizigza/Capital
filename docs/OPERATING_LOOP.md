---
id: docs/OPERATING_LOOP
title: Capital Universal Operating Loop
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Capital Universal Operating Loop

**Product reminder:** Harbor (`src/islands/`) is the product. This loop integrates **business/admin** systems so they create **profitable customer value** — not agent count, automation count, model usage, or architectural theater.

## The loop (universal)

```
OBSERVE → LEARN → DECIDE → ACT → MEASURE → REMEMBER
         ↑__________________________________________|
```

Every function (Product, Marketing, Sales, Customer Success, Finance, Research, Operations, AI workers) participates in stages of **this** loop. They are not independent silos with private truths.

### Optimization objective (hard)

Maximize:

**profitable customer value created ÷ dollar ÷ unit time ÷ hour of founder attention**

Do **not** optimize for: number of agents, number of automations, tokens/model usage, or impressiveness.

---

## Stage definitions

| Stage | Meaning | Typical outputs |
|-------|---------|-----------------|
| **OBSERVE** | Intake raw signals with evidence | feedback, metrics snapshots, pipeline events, failures |
| **LEARN** | Turn signals into structured understanding | VoC themes, hypotheses, routed task class, insights |
| **DECIDE** | Choose action under Capital rules | HITL approval, founder decision, stress response priority |
| **ACT** | Execute permitted work | product change, experiment, outreach draft, content candidate |
| **MEASURE** | Score outcomes vs customer value | retention cohorts, contribution, CAC, eval metrics, quality_score |
| **REMEMBER** | Persist without corrupting canon | memory classes, decision log, weekly packet, agent run history |

---

## Map of business systems → loop stages

Systems below include modules designed across Capital admin PRs (may land via separate merges). The loop is the integration spine; systems plug in as **ports**, not silos.

| System | Primary stage(s) | Notes |
|--------|------------------|-------|
| **Voice of Customer** | OBSERVE → LEARN | Evidence-linked feedback; never invented sentiment |
| **Product-to-Content** | LEARN → ACT → MEASURE | Assets must cite originating insight; quality > views |
| **Experiment / product discovery** | LEARN → DECIDE → ACT → MEASURE | Hypothesis → tested finding |
| **Task routing** | LEARN | DETERMINISTIC / AI_ASSISTED / AI_AGENT / HUMAN_DECISION |
| **Operator** | OBSERVE→…→REMEMBER coordinator | Not autonomous CEO; protected domains |
| **HITL approvals** | DECIDE | Risk tiers; founder + second for CRITICAL |
| **Sales OS** | OBSERVE → ACT → MEASURE | AI assist only; no autonomous pricing/contracts |
| **Retention / CS** | MEASURE → LEARN → DECIDE | Diagnose before paid acquisition |
| **Economics + Stress test** | MEASURE → DECIDE | Contribution, cash, runway; priority responses |
| **AI Eval + Cost Governor** | MEASURE → DECIDE | Stop/escalate; cost vs value; eval before downgrade |
| **Agent Registry** | DECIDE (instantiation) | Empty by default; no role-fill |
| **Institutional memory** | REMEMBER | Promotion ladder; AI never auto-canonical |
| **Weekly Executive Packet** | REMEMBER → DECIDE | Founder attention compression |
| **Kortix (optional)** | ACT runtime only | Behind ports; never owns Company OS |

### Functional lanes (not silos)

| Lane | How it joins the loop |
|------|------------------------|
| **Product** | Observes playtest/friction → learns → decides (HITL) → acts (ship) → measures retention/progression → remembers |
| **Marketing** | Consumes LEARN insights (not generic AI) → acts (content) → measures quality funnel → remembers |
| **Sales** | Observes leads → learns ICP → decides (human for protected) → acts (outreach) → measures pipeline → remembers |
| **Customer Success** | Observes tickets/usage → learns → decides retention fixes before acquisition → acts → measures cohorts → remembers |
| **Finance** | Observes spend/revenue → measures contribution/cash → decides stress responses → remembers |
| **Research** | Observes market/VoC → learns hypotheses → experiments → measures → remembers |
| **Operations** | Observes failures/triggers → routes → executes with budgets/evals → remembers |
| **AI workers** | Only where registry + routing justify; always measured; never own canon |

---

## Critical handoff chain (event-driven)

Example (implemented as typed events in `src/business/operatingLoop/`):

```
customer_feedback
  → voc_evidence          (OBSERVE/LEARN)
  → hypothesis            (LEARN)
  → experiment            (DECIDE/ACT)
  → product_change        (ACT)
  → cohort_measurement    (MEASURE)
  → decision              (DECIDE)
  → company_memory        (REMEMBER)
  → marketing_insight     (LEARN→ACT feed)
```

Handoffs are **events** with `from_stage`, `to_stage`, `payload`, `evidence_refs`, and `value_score` hints. Downstream handlers refuse events lacking evidence.

---

## Anti-patterns

- Marketing inventing campaigns without product/customer insight events  
- Sales AI changing price or contracts  
- Retention drop → immediately buy more ads (must diagnose first)  
- Spawning agents to “complete the org chart”  
- Optimizing for automation count or model spend without contribution lift  

---

## Code

`src/business/operatingLoop/` — event bus, handoff pipeline, value objective helpers, tests.

Gameplay remains untouched.
