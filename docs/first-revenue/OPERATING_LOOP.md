# First Revenue Operating Loop

**Objective:** Help Capital reach **repeatable real customer payments** from people who get enough value to **remain** customers.

**Success metric:** paying customers who remain customers.  
**Not success:** leads, traffic, followers, free accounts.

Agents and humans follow this sequence. Do **not** skip ahead to acquisition scale.

| # | Step | Allowed actions | Forbidden | Exit criteria |
|---|------|-----------------|-----------|---------------|
| 1 | **IDENTIFY** | Pick strongest customer hypothesis | Pursuing all segments at once | One active hypothesis in orchestrator state |
| 2 | **FIND** | Warm intros / opt-in lists founder-approved | Cold spam, scraped DMs, bought lists without approval | ≥5 named prospects in queue (or founder Escalation) |
| 3 | **TALK** | Problem discovery interviews | Pitching Capital as the answer first | Interview notes + ledger `INTERVIEWED` |
| 4 | **TEST** | Observe Harbor→Cove (or agreed path) | Guiding past every friction | User-test notes + ledger `USER_TEST` |
| 5 | **LEARN** | Cluster pain, objection, friction | Inventing quotes | `topPain` / `topObjection` / `topProductFriction` filled from evidence |
| 6 | **FIX** | Recommend **smallest** product correction | Large roadmap rewrites as first move | One fix in `productFixQueue` with acceptance check |
| 7 | **OFFER** | Present **approved** paid offer only | Unapproved prices/promises | Ledger `OFFERED` + founder-approved offer id |
| 8 | **COLLECT** | Simplest approved Stripe path (test first) | Live charges without approval; custom card UI unless required | Ledger `PAID` via trusted payment state |
| 9 | **ACTIVATE** | Ensure promised value in first session | “Thanks for paying” email as activation | Ledger `ACTIVATED` per definition |
| 10 | **RETAIN** | Check return per definition | Declaring win on payment day | Ledger `RETAINED` or explicit churn note |
| 11 | **MEASURE** | Update ledger + dashboard | Vanity dashboards | Stages recorded; weekly revenue report regenerable |
| 12 | **REPEAT** | Next single experiment | Scaling on signups alone | New `nextExperiment` only after measure |

## Coordination

| System | Role |
|--------|------|
| `docs/revenue-intelligence/` | Lifecycle counts, source economics, weekly one-experiment |
| `docs/first-revenue/` | Orchestrator state, dashboard, escalations, playbooks |
| Stripe billing (when present) | Collect path; sandbox until founder live approval |
| Product / Harbor loop | Activation + retention evidence |

## Founder escalation

Escalate (do not guess) when:

- Contacting people not on an approved list  
- Approving/changing price or offer copy  
- Enabling live payments or spending money  
- Promising features, school deals, or timelines  
- Choosing between segments after conflicting evidence  

Log items in `data/orchestrator-state.json` → `founderEscalations` and surface them on `FIRST_REVENUE_DASHBOARD.md`.
