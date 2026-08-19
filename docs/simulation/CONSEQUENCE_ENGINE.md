# Consequence engine

**Status:** Isolated prototype — **not connected** to `IslandsApp`, save, or HUD  
**Schema:** [CONSEQUENCE_SCHEMA.md](./CONSEQUENCE_SCHEMA.md)  
**Code:** `src/simulation/consequence/`  
**Tests:** `src/simulation/consequence/consequenceEngine.test.ts`

---

## Purpose

Give Capital a **generic, auditable consequence layer** for meaningful decisions:

1. A player **commits** a decision (verb + choice + alternatives).  
2. The engine **schedules** consequences across horizons (immediate → long-term).  
3. A sim **clock** fires pending rows when their `trigger_time` arrives.  
4. Query functions answer the four literacy questions without inventing causality.

This sits **beside** existing systems (`voyagerLedger`, `worldMemory`, `decisionTimeline`). Integration is a later step and must not bypass Constitution Principle 14 (AI never owns simulation truth).

---

## Design laws

| Law | Meaning |
|-----|---------|
| **Decisions produce consequences** | No empty commits; at least one scheduled row |
| **Consequences persist** | Fired rows stay in the log; they are not rewritten |
| **Time is explicit** | Horizon + delay ticks; no “sometime later” magic |
| **Causality is a path** | Every row traces to `decision:{id}` |
| **Counterfactuals are authored** | Alternatives recorded at commit time — never hallucinated |
| **Honesty** | Conditional / uncertain types are labeled; prototype does not fake RNG unless a seed is passed |
| **Disconnected by default** | Importing this module must not be required to boot Islands |

---

## Clock

- `tick` is an integer sim step (`0, 1, 2, …`).  
- `engine.advance(n)` moves the clock and **fires** all `pending` consequences with `fireAtTick <= now`.  
- Conditional rows whose `conditionId` is false at fire time become `blocked` (not `fired`).  
- Cancelled rows stay `cancelled` (a later decision may cancel `likely` follow-ons).

Default delays (overridable per row):

| Horizon | Default `delayTicks` |
|---------|---------------------:|
| IMMEDIATE | 0 |
| SHORT_TERM | 1 |
| MEDIUM_TERM | 3 |
| LONG_TERM | 8 |

---

## Pipeline

```
commitDecision(spec)
  → validate alternatives
  → write Decision
  → schedule Consequence rows (status=pending, fireAtTick=now+delay)
  → if delay=0, fire immediately

advance(n)
  → now += n
  → for each pending where fireAtTick <= now:
        if conditional && !predicate → blocked
        else → fired, record firedAtTick
        optionally schedule follow-on rows already attached at commit
```

Follow-ons are **authored at commit**, not generated at fire time. That keeps causality inspectable.

---

## Public API (prototype)

```ts
const engine = createConsequenceEngine({ seed?: number });

engine.commitDecision(spec: DecisionCommitSpec): Decision;
engine.advance(ticks: number): Consequence[];   // newly fired
engine.cancel(consequenceId: string, reason: string): void;
engine.setCondition(conditionId: string, value: boolean): void;

engine.getDecision(id: string): Decision | undefined;
engine.getConsequence(id: string): Consequence | undefined;
engine.listFired(): Consequence[];
engine.listPending(): Consequence[];
```

### Four questions

```ts
whatHappened(engine, filter?: QueryFilter): Answer;
whyDidItHappen(engine, consequenceId: string): Answer;
whatPreviousDecisionContributed(engine, consequenceId: string): Answer;
whatCouldThePlayerHaveDoneDifferently(engine, decisionId: string): Answer;
```

`Answer` always includes:

- `question` — which of the four  
- `sentence` — player-facing line from `explanation_data` (plus causal joiners)  
- `evidenceIds` — decision / consequence ids used  
- `causal_path` — hops, if any  

---

## Query semantics

### What happened?

Union of **fired** consequences matching the filter (tick range, domain, decisionId).  
Sentence joins `explanation_data.whatHappened` in fire order.

### Why did it happen?

For one consequence: `whyItHappened` + last hop relation + source verb/choice.  
If the path has intermediate consequences, name the **nearest prior fired row**.

### What previous decision contributed?

Walk `causal_path` to the origin `decision:*`. If the path includes an earlier **decision** besides origin (chained commits), report the **most recent prior decision** as contributor; otherwise the origin is the contributor (honest: “this choice, not a previous one”).

### What could the player have done differently?

Read `source_action.alternatives` + `explanation_data.counterfactual`.  
Never invent an alternative that was not recorded at commit.

---

## Example (Cove-shaped, authored fixture)

Commit `take` / `save` vs `spend`:

| Horizon | Domain | Visibility | What the row means |
|---------|--------|------------|--------------------|
| IMMEDIATE | `business` | felt | Jar holding appears |
| IMMEDIATE | `liquidity` | felt | Monthly leftover shifts |
| SHORT_TERM | `story` | named | Harbor scar / Plinth |
| MEDIUM_TERM | `neighborhood` | felt | Weather / shop prices |
| LONG_TERM | `future_opportunities` | foreshadowed | Next painting / transfer surface |

Spend branch schedules **debt** + **risk** instead of jar **business**. Same horizons; different domains. Tests assert both branches remain queryable.

---

## Relationship to shipped Capital

| Shipped | Engine analogue | Connect later? |
|---------|-----------------|----------------|
| `setIrreversible` + `addScar` | IMMEDIATE `story` | Optional adapter |
| `spineTakeFootprints` | IMMEDIATE `business` / `debt` / `liquidity` | Optional adapter |
| `harborWeather` | MEDIUM_TERM `neighborhood` | Optional adapter |
| `decisionTimeline` | Session highlight UI | Keep separate; can *read* engine Answers |
| `chapterLoop` replay builders | Authored copy | Can be generated from `explanation_data` |

**Do not** double-write ledger from this engine until an adapter PR exists. Prototype state is in-memory only.

---

## Failure & cancellation

- **Informative failure** (Constitution 6) is a decision too: record miss → SHORT_TERM `risk` or `reputation` with `reversible` retry.  
- Cancelling a `likely` row must leave an audit note (`cancelReason`) so “why didn’t X happen?” is answerable.

---

## Anti-patterns

- Scheduling LONG_TERM without an IMMEDIATE felt row on spine Takes.  
- Using the engine as an XP log.  
- Generating counterfactuals with an LLM.  
- Firing hidden IMMEDIATE money changes on the signature loop.  
- Connecting to production save in the same PR as the first prototype.

---

## Test contract

The prototype is **done** when tests prove:

1. Schema validation rejects incomplete rows.  
2. Immediate consequences fire on commit.  
3. Delayed consequences fire only after `advance`.  
4. Conditional rows block when the predicate is false.  
5. All four questions return evidence-backed sentences.  
6. Spend vs save branches diverge in domain (not only copy).  
7. Counterfactuals never invent alternatives.

---

## Next (not this prototype)

1. Adapter: `commitDecision` from `applyDialogueEffects` Takes.  
2. Persistence blob on `IslandSaveV1` (versioned).  
3. Piggy / Plinth / “why it happened” UI reading `Answer.sentence`.  
4. Keep Islands playable if the engine module is deleted.
