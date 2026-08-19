# Capital — Causal Time System

**Status:** Design specification — **do not expose graph machinery to players**  
**Companions:** `STRONGEST_RECURRING_LOOP.md` · `SYSTEM_INTERACTION_MATRIX.md` · `DECISION_AUDIT.md` · `CAPITAL_DESIGN_CONSTITUTION.md`  
**Existing substrate (do not duplicate blindly):** `irreversibleChoices` · `harborScars` · `voyagerLedger` holdings/events · `decisionTimeline.ts` (minigame replay) · Harbor weather from CF  

**Player promise:** Later, they can feel and retell — *“This happened because of decision X”* — via Piggy, Plinth, weather, and Pay Day proof. Never via a debug node graph.

---

## 1. Problem

Financial judgment is mostly about **delayed effects**. Capital already has pieces (Take → scar later; holding → every Pay Day; haste scar → weather), but they are **not one causal vocabulary**. Without a shared model:

- Clock/Spiral Takes can feel MEANINGLESS for CF while Cove feels real  
- Deals pay every Pay Day without a named “because”  
- Players cannot reliably trace sky/prices/Freedom back to a choice  

This system is the **authoring + runtime contract** for delayed money causality. Implementation may fold into ledger + scars; the **graph is internal**.

---

## 2. Time horizons

Every scheduled or lasting effect is tagged with one horizon. Horizons are **felt cadence**, not calendar UI.

| Horizon | Felt when | Capital binding (examples) | Player-facing name (myth) |
|---------|-----------|----------------------------|---------------------------|
| **NOW** | Same beat as the decision | Pouch spend, scar write, hush start, deal purchase debit | “Right away” |
| **SOON** | Next Harbor beat / next Pay Day / next map open | First Pay Day after deal; weather recalc; Piggy homecoming line; Soft Beat arm expiry | “Next Pay Day” / “when you come home” |
| **LATER** | Within the chapter or Freedom chase | Streak 2–3 Pay Days; Soft Beat trail; day-2 echo; shop price band while CF holds | “After a few Pay Days” |
| **LONG-TERM** | Across chapters / identity | Irreversible Take key forever; Freedom Seal; Credit readiness; plaque on Plinth; carpet Freedom floor | “Harbor still keeps it” |

**Rules**

1. A single decision may emit effects on **multiple** horizons (Cove: NOW scar + NOW holding; SOON spectacle; LATER Freedom math; LONG-TERM plaque).  
2. Horizons never appear as a four-tab spreadsheet. They appear as **when Harbor answers**.  
3. If an effect has no horizon, it is incomplete — do not ship.

---

## 3. Decision effect schema

Every **financial decision** (Take, Opportunity Commit/Wait, accepting a liability fork, etc.) authors a `CausalDecision` with zero or more effect rows.

```text
CausalDecision {
  decision_id          // stable id, e.g. cove_save_vs_spend:save
  label_kid            // plaque / Piggy short name
  decided_at           // ISO or Pay Day index
  organ?               // coin | clock | spiral | memory
  options_considered   // labels only (for retell)
  effects[]            // see below
}
```

### Effect row fields (required support)

| Field | Type | Meaning |
|-------|------|---------|
| `immediate_state_change` | state patch | What flips **NOW** (pouch Δ, holding add, scar id, irreversible key, quest flag) |
| `scheduled_effect` | `{ horizon, trigger, payload }` | What fires **SOON/LATER/LONG-TERM** when `trigger` occurs |
| `probability` | 0–1 or `certain` | Chance the scheduled effect applies when triggered (default `certain`) |
| `future_obligation` | obligation \| null | Cost the player still owes (liability CF, streak risk, Soft Beat arm window) |
| `opportunity_created` | opp ref \| null | New option unlocked or improved (painting open, deal tier, Wait becomes smart) |
| `opportunity_lost` | opp ref \| null | Option forever or temporarily closed (other Take fork; spent pouch buffer) |

### `scheduled_effect.trigger` vocabulary (internal)

| Trigger | Fires on |
|---------|----------|
| `on_next_payday` | Ritual/board Pay Day claim |
| `on_harbor_return` | Carpet home after island |
| `on_weather_recalc` | After CF change |
| `on_streak_tick` | Freedom streak ++ or reset |
| `on_day2` | Day-2 echo window |
| `on_plinth_view` | Player opens Memory Plinth |
| `on_talk_piggy` | Homecoming / presence Talk |
| `on_soft_beat_expire` | Arm timeout |
| `persistent` | Always true while condition holds (holding CF each Pay Day) |

### Minimal effect examples (spec, not live code)

**Cove jar (`save`)**

| Field | Value |
|-------|--------|
| immediate_state_change | +holding +$5/mo; scar `cove_saver_plaque`; irreversible `save`; pouch unchanged |
| scheduled_effect | SOON `on_harbor_return` → spectacle/Plinth glow; LATER `persistent` → each Pay Day pays higher CF |
| probability | certain |
| future_obligation | null |
| opportunity_created | Freedom path easier (CF toward $30) |
| opportunity_lost | Spend plaque identity |

**Cove treat (`spend`)**

| Field | Value |
|-------|--------|
| immediate_state_change | +liability −$5/mo; spender scar |
| scheduled_effect | SOON homecoming; LATER each Pay Day thinner; maybe tighter weather |
| future_obligation | Treat tab until removed (today: persistent liability) |
| opportunity_created | Story identity “treat first” |
| opportunity_lost | +$5/mo jar path; harder Freedom |

**Opportunity Wait**

| Field | Value |
|-------|--------|
| immediate_state_change | none |
| scheduled_effect | SOON none; LATER `on_next_payday` may improve liquidity for booth |
| future_obligation | null |
| opportunity_created | Option value (still can buy later) |
| opportunity_lost | This offer may reshuffle (deck) |

**Credit haste (borrow)**

| Field | Value |
|-------|--------|
| immediate_state_change | haste scar; irreversible |
| scheduled_effect | SOON weather feedback if CF low; LONG-TERM plaque |
| probability | weather line may be conditional on CF band (not RNG theater) |
| future_obligation | Living with storm band while CF weak |
| opportunity_created | Risk identity |
| opportunity_lost | Patience plaque |

Prefer **conditional certain** effects over slot-machine `probability` unless the fantasy is true uncertainty (insurance-like). Casino anti-pillar: do not use probability to juice engagement.

---

## 4. Causal event graph (internal)

See also: `CAUSAL_EVENT_GRAPH.mmd`.

### Node types

| Node | Role |
|------|------|
| `Decision` | Player commit (`CausalDecision`) |
| `State` | Snapshot facet (pouch, CF, streak, weather, scar set) |
| `Event` | Fired trigger instance (Pay Day #4, Harbor return, Plinth view) |
| `Outcome` | Player-salient result (Freedom earned, storm sky, Piggy line id) |
| `Retell` | Kid sentence bound for B/Piggy/Plinth (“because of X”) |

### Edge types

| Edge | Meaning |
|------|---------|
| `DECIDES` | Player → Decision |
| `WRITES` | Decision → immediate State |
| `SCHEDULES` | Decision → future Event (horizon + trigger) |
| `FIRES` | Event → Outcome / State patch |
| `BECAUSE` | Outcome → Decision (trace edge — **required for retell**) |
| `BLOCKS` / `ENABLES` | opportunity_lost / opportunity_created |
| `OBLIGES` | Decision → future_obligation still active |

### Invariant

Every `Outcome` the player can notice (weather shift, Pay Day amount change, Freedom seal, Piggy naming a plaque) **must** have at least one `BECAUSE` path to a `Decision` (or to a forced hazard explicitly labeled as not a choice — Debt Trap).

```
Decision ──WRITES──► State(now)
    │
    ├──SCHEDULES──► Event(soon/later) ──FIRES──► Outcome
    │                                              │
    │                                              └──BECAUSE──► Decision
    ├──OBLIGES──► Obligation (visible as CF drain / streak risk)
    ├──ENABLES──► Opportunity'
    └──BLOCKS──► Opportunity''
```

### Graph lifecycle

1. **Author time:** content/deal/Take declares effect rows.  
2. **Decide time:** write Decision node + NOW writes; enqueue scheduled edges.  
3. **Trigger time:** Pay Day / return / etc. resolves scheduled effects; append Outcome; ensure `BECAUSE`.  
4. **Retell time:** query `BECAUSE` + `label_kid` → Piggy/Plinth/Bag copy.  
5. **Cap:** keep a ring of recent Decisions/Outcomes (like analytics ring) so saves stay small.

---

## 5. Player-facing trace (hide complexity)

### What players never see

- Node ids, edge tables, horizon enums, probability floats, JSON graphs  
- “Scheduled effect queue” chrome  
- Debug “causal inspector” in production  

### What players do see (myth surfaces)

| Surface | Trace form |
|---------|------------|
| **Memory Plinth** | Plaque label = decision kid name; organ suit verb |
| **Piggy Talk** | One because-sentence: “Harbor’s grey because the treat tab still drains each month.” |
| **Coin Bag** | Optional short because when CF or weather just changed |
| **Pay Day feedback** | “+$20 this month · jar from Cove still holding” (cite decision label, not system id) |
| **Weather coach** | Existing `feedbackLoopLine` pattern generalized |
| **Day-2 echo** | Locals name plaque — living BECAUSE |
| **Why-it-happened** (existing `decisionTimeline`) | Keep for minigame sessions; spine money uses Plinth/Piggy first |

### Retell template (internal → copy)

```text
because_line(outcome, decision) =
  "{outcome_kid} because you chose “{decision.label_kid}.”"
```

Examples:

- “Sky tightened because you chose “Treat before jar.””  
- “Pay Day grew because you chose “Shell Craft Booth.””  
- “Freedom softened closer because you waited, then took the jar.”  

One sentence. No graphs. No “effect_id=…”.

### Trace UX law

If the player cannot get a because-line from Plinth or Piggy within one Harbor visit after an Outcome, the `BECAUSE` edge is missing — **bug**, not a docs gap.

---

## 6. Mapping to Living Cashflow Commit

| Loop link | Causal time role |
|-----------|------------------|
| FINANCIAL SITUATION | State node facets |
| INFORMATION | Show NOW costs + SOON Pay Day preview (CF Δ) — not the graph |
| PLAYER DECISION | Decision node |
| SYSTEM RESPONSE | WRITES + SCHEDULES |
| IMMEDIATE EFFECT | NOW |
| DELAYED CONSEQUENCE | SOON/LATER Event → Outcome |
| PLAYER INTERPRETATION | Retell via BECAUSE |
| REVISED STRATEGY | Player-internal; Opportunities ENABLES/BLOCKS next |
| NEW SITUATION | State after Outcomes |

---

## 7. Authoring checklist (spine + Opportunities)

For each new financial fork:

- [ ] `label_kid` set (Plinth-safe)  
- [ ] At least one `immediate_state_change` **or** honest Wait (none)  
- [ ] Every delayed money truth has `scheduled_effect` + horizon  
- [ ] `opportunity_created` / `opportunity_lost` filled when forks exclude each other  
- [ ] `future_obligation` set for liabilities / streak risks  
- [ ] `probability` is `certain` unless fantasy needs true uncertainty  
- [ ] A Retell sentence exists for each major Outcome  
- [ ] No new currency invented to “explain” the delay  

---

## 8. Phased adoption (no big-bang)

| Phase | Scope | Player change |
|-------|-------|---------------|
| **A — Spec bind** | Document Cove Take + one deal + Pay Day on this schema | None (docs) |
| **B — Retell only** | Generate Piggy/Bag because-lines from existing scars + holdings | Better trace, same sim |
| **C — Schedule unify** | Deal CF as `persistent` scheduled_effect; weather as conditional SOON | Clearer Pay Day cite |
| **D — Opportunity Wait** | Wait writes opportunity_created option value | Living Cashflow Commit |

Prototype order remains: **strongest chain first** (Opportunity → CF → Pay Day → weather → retell). Do not build a player-facing graph viewer in any phase.

---

## 9. Anti-patterns

| Anti-pattern | Why |
|--------------|-----|
| Visible timeline Gantt of horizons | Spreadsheet simulator |
| Random probability on every Pay Day | Casino |
| Because-lines that cite XP/quiz | Wrong causality |
| Outcomes with no BECAUSE | Broken trust |
| Parallel boom/recession fiction unexplained by Decision | Split money truth |
| Exposing `decision_id` in UI | Implementation leak |

---

## 10. Success criteria

1. After Cove treat, a cold player can say weather or thin Pay Day is **because of the treat** without a tutorial dump.  
2. After a deal, Pay Day names the holding’s kid label.  
3. Wait can be retold as “I kept powder dry for the booth.”  
4. No production screen shows the causal graph.  
5. Clock/Spiral forks that claim money meaning must emit L/W/F effects or lose “financial decision” status (see Decision Audit).

---

## 11. Open questions (UNKNOWN until prototype)

- Whether `decisionTimeline.ts` merges into this graph or stays minigame-scoped  
- Max ring size for Outcomes on low-end devices  
- Whether liability removal ever clears LONG-TERM obligations  
- Exact copy deck for because-lines per organ  

---

## Related files

- Graph diagram: `docs/design/CAUSAL_EVENT_GRAPH.mmd`  
- Loop: `docs/design/STRONGEST_RECURRING_LOOP.md`  
- Interactions: `docs/design/SYSTEM_INTERACTION_MATRIX.md`
