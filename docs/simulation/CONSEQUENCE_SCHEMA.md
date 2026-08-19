# Consequence schema

**Status:** Prototype (not wired to Islands product path)  
**Companion:** [CONSEQUENCE_ENGINE.md](./CONSEQUENCE_ENGINE.md)  
**Code:** `src/simulation/consequence/`

This schema describes a **generic consequence record** for meaningful decisions. It is designed so Capital (or any later sim) can answer:

- What happened?
- Why did it happen?
- What previous decision contributed?
- What could the player have done differently?

Existing Islands replay (`src/islands/decisionTimeline.ts`) stores *session highlights*. This schema stores **causal, time-horizon consequences** that can fire later. Do not merge the two until the prototype is proven.

---

## Horizons (`trigger_time.horizon`)

| Horizon | Meaning | Typical delay (sim ticks) |
|---------|---------|---------------------------|
| `IMMEDIATE` | Felt in the same beat as the decision | `0` |
| `SHORT_TERM` | Next session beat / next Pay Day / next Harbor return | `1` |
| `MEDIUM_TERM` | After several beats (Freedom streak, shop weather, gossip) | `3` |
| `LONG_TERM` | Identity / opportunity / world memory that outlives the chapter | `8+` |

Ticks are **abstract sim time**, not wall-clock. The engine does not own real dates.

---

## Domains (`domain`)

A consequence occupies **one primary domain**. Compound effects are **multiple consequence records** sharing `source_action.decisionId`, not one record with mixed domains.

| Domain | What it mutates conceptually |
|--------|------------------------------|
| `money` | Stock of coins / pouch / named cash |
| `liquidity` | Ability to pay *now* without new debt |
| `debt` | Obligations that drag future cashflow |
| `risk` | Volatility / exposure / haste pressure |
| `relationships` | NPC memory, bond, trust |
| `reputation` | Plaza gossip, organ retell, public plaque |
| `career` | Skills, work options (mostly unused in current Capital) |
| `business` | Holdings that produce or cost monthly |
| `neighborhood` | Place state (Harbor weather, pavilion, shore hush) |
| `story` | Scar, irreversible key, authored cinema |
| `future_opportunities` | Unlocks, blocked deals, map paintings, Credit door |

---

## Required fields (every consequence)

### `source_action`

The **decision that authored this consequence**. Immutable after commit.

```ts
type SourceAction = {
  decisionId: string;
  verb: string;              // canonical family: take | buy | borrow | refuse | …
  choiceId: string;
  chosenLabel: string;
  alternatives: { id: string; label: string }[];
  committedAtTick: number;
  context?: {
    placeId?: string;
    questId?: string;
    npcId?: string;
  };
};
```

### `causal_path`

Ordered hops from origin decision → this record. Later-horizon effects **must** include earlier hops (decision → immediate footprint → delayed weather).

```ts
type CausalRelation =
  | "produces"
  | "amplifies"
  | "unlocks"
  | "blocks"
  | "enables";

type CausalHop = {
  fromId: string;            // decision:* or consequence:*
  toId: string;
  relation: CausalRelation;
};
```

**Law:** The first hop’s `fromId` is always `decision:{decisionId}`.

### `trigger_time`

When the consequence becomes true in the sim.

```ts
type TriggerTime = {
  horizon: "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
  delayTicks: number;        // relative to source decision
  fireAtTick?: number;       // absolute; set when scheduled
};
```

### `visibility`

How the player can perceive it.

| Value | Player experience |
|-------|-------------------|
| `hidden` | Sim-true; no UI yet (legal for LONG_TERM seeds) |
| `foreshadowed` | Soft cue without naming the cause |
| `felt` | World change without lecture (weather, hush, CF chip) |
| `named` | Explicit retell (Piggy, Plinth, “why it happened”) |

Constitution alignment: prefer `felt` then `named`. Never `named` a transfer answer on the next analogous problem.

### `certainty_type`

| Value | Meaning |
|-------|---------|
| `certain` | Always fires if the decision stands |
| `likely` | Fires unless cancelled by a later decision |
| `uncertain` | Stochastic / phase-dependent (prototype: stored, not rolled) |
| `conditional` | Requires a later predicate (`conditionId`) to be true at fire time |

### `affected_entities`

Who or what changed.

```ts
type EntityKind =
  | "player"
  | "npc"
  | "place"
  | "holding"
  | "opportunity"
  | "system";

type AffectedEntity = {
  kind: EntityKind;
  id: string;
  label: string;
};
```

### `reversibility`

| Value | Meaning |
|-------|---------|
| `irreversible` | Cannot un-choose (Capital Takes) |
| `costly` | Can unwind only by paying time, CF, or a new decision |
| `reversible` | Can be undone at little/no extra cost |

### `explanation_data`

Structured copy for the four questions. **No gameplay numbers required in kid sentences.**

```ts
type ExplanationData = {
  whatHappened: string;
  whyItHappened: string;
  priorDecisionHint: string | null;
  counterfactual: string;
  /** Optional organ + suit verb for spine content */
  organHint?: string;
};
```

---

## Full consequence record

```ts
type ConsequenceStatus = "pending" | "fired" | "cancelled" | "blocked";

type Consequence = {
  id: string;
  domain: Domain;
  magnitude: number;         // signed; 0 = qualitative only
  source_action: SourceAction;
  causal_path: CausalHop[];
  trigger_time: TriggerTime;
  visibility: Visibility;
  certainty_type: CertaintyType;
  conditionId?: string;      // required when certainty_type === "conditional"
  affected_entities: AffectedEntity[];
  reversibility: Reversibility;
  explanation_data: ExplanationData;
  status: ConsequenceStatus;
  firedAtTick?: number;
};
```

### Decision record (companion, not a consequence)

```ts
type Decision = {
  id: string;
  source_action: SourceAction;
  /** Templates / drafts that become Consequence rows */
  scheduledIds: string[];
};
```

---

## Validation rules

1. `delayTicks === 0` ⇔ `horizon === "IMMEDIATE"` (prototype enforces this pairing).  
2. `certainty_type === "conditional"` requires `conditionId`.  
3. `causal_path.length >= 1`.  
4. `alternatives` must include at least one option whose `id !== choiceId`.  
5. `explanation_data.counterfactual` must mention a real alternative label or id.  
6. Magnitude `0` is allowed for `story` / `reputation` qualitative marks.  
7. `hidden` + `IMMEDIATE` is invalid on spine Takes (player must feel or name the first beat). Prototype warns via `assertSpineVisibility` helper — not a hard schema fail for generic use.

---

## Identifier conventions

| Kind | Pattern |
|------|---------|
| Decision | `decision:{slug}` |
| Consequence | `consequence:{decisionSlug}:{domain}:{horizon}` |
| Entity player | `player:self` |
| Entity NPC | `npc:{npcId}` |
| Holding | `holding:{holdingId}` |
| Place | `place:{islandId}` |

---

## Mapping to current Capital (reference only)

Not a wiring spec. Illustrates that the schema can describe shipped truth.

| Shipped event | Domain | Horizon | Reversibility |
|---------------|--------|---------|---------------|
| Cove jar holding | `business` + `liquidity` (two records) | IMMEDIATE | irreversible |
| Harbor scar / Plinth | `story` + `reputation` | SHORT_TERM | irreversible |
| Weather / shop prices | `neighborhood` | MEDIUM_TERM | costly |
| Credit door after Freedom + Paycheck | `future_opportunities` | LONG_TERM | irreversible |
| Board pass on deal | `future_opportunities` | IMMEDIATE | reversible (deal may regenerate) |

---

## Non-goals of the schema

- Not a UI component.  
- Not a replacement for `IslandSaveV1`.  
- Not a random event deck.  
- Does not authorize LLM-authored money outcomes (Constitution Principle 14).
