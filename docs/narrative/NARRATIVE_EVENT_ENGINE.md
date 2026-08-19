# Narrative Event Engine

**Status:** Design law — **not wired** to `IslandsApp`  
**Companions:** [STORY_STATE_GRAPH.mmd](./STORY_STATE_GRAPH.mmd) · [NPC_ECONOMIC_MODEL.md](./NPC_ECONOMIC_MODEL.md) · [CHARACTER_MEMORY_ARCHITECTURE.md](./CHARACTER_MEMORY_ARCHITECTURE.md) · [CONSEQUENCE_ENGINE.md](../simulation/CONSEQUENCE_ENGINE.md)  
**Canon:** Story Bible (Harmon circle) · Constitution Principles 4–5, 8–10, 14–15 · iconic freeze

Capital stories are **authored dramatic situations** whose *availability, remaining approaches, and consequence magnitudes* are **modified by simulation state**. The engine does **not** mint quests, NPCs, or stakes at runtime.

This is **not** `src/content/events/engine.ts` (weighted scenario-deck draws for minigames). Deck draws stay toys. Spine drama stays **named situations with foldbacks**.

---

## Division of labor

| Author defines | Systems determine |
|----------------|-------------------|
| Characters (who can be present) | When the situation becomes **possible** |
| Theme + organ + suit verb | How live state **reshapes** stakes (not the question) |
| Dramatic question | Which **approaches remain legal** |
| Stakes (what can be lost/kept) | What consequences **modify** (ledger, scars, trust, follow-ups) |
| Possible approaches (finite set) | Timing (clock, location, memory flags) |
| Acceptable consequence **boundaries** | Instantiation of numbers inside those bounds |
| Foldback points (how plots rejoin) | Which foldback is taken |
| Follow-up event **ids** (graph edges) | Whether a follow-up’s prerequisites now pass |

**LLM:** may phrase Talk lines from a frozen PromptPack. **Must not** author a new situation, approach, or consequence type.

---

## What a Narrative Situation is

A situation is a **node** in a finite authored graph — closer to a playable scene than a loot table.

```ts
type NarrativeSituation = {
  id: string;                     // e.g. sit_cove_jar_or_treat
  track: "main" | "side" | "echo";
  organ: "memory" | "coin" | "clock" | "spiral";
  characters: string[];           // NPC ids who may appear
  theme: string;
  dramaticQuestion: string;       // one sentence the player can retell
  stakes: StakeSpec;
  approaches: Approach[];         // finite, named
  prerequisites: Predicate[];
  blocking: Predicate[];
  consequenceBounds: ConsequenceBounds;
  followUps: FollowUpEdge[];
  foldbacks: Foldback[];
  memoryFlags: { setOnEnter?: string[]; setOnResolve?: string[] };
};
```

**Hard cap:** no procedural generation of `id`, `approaches`, or `followUps`. Adding story means shipping a new authored node.

---

## Activation predicates (when it becomes possible)

A situation is `locked` → `available` → `active` → `resolved` (or `folded`).

Predicates may read:

| Channel | Examples (Capital) |
|---------|-------------------|
| **Player finances** | `netCashflow`, pouch, Freedom streak, holdings ids |
| **NPC finances** | Future NPC books (Kira jar health, Vee stall CF) — design now, schema later |
| **Relationships** | `player_relationship`, trust band, `piggyBondHomecomings` |
| **Location** | `currentIslandId`, area, structure interior, Harbor plaza |
| **Economic conditions** | Harbor weather mood, macro phase (if ever player-visible) |
| **Previous decisions** | `irreversibleChoices` keys, Change quests complete |
| **Business state** | Named holdings / shop rooms / carpet tier |
| **Employment** | Paycheck organ only (Pat/payroll) — Harbor is not a job sim |
| **Time** | Sim tick, Harbor hour, day-2 echo window |
| **Memory** | Actor `MemoryRecord` presence/absence (transfer firewalls) |
| **Reputation** | Plaque exists, plaza gossip heard, scar kind |

```ts
type Predicate =
  | { op: "and" | "or"; of: Predicate[] }
  | { op: "not"; of: Predicate }
  | { op: "player_cf"; cmp: ">=" | "<"; value: number }
  | { op: "has_irreversible"; key: string; choiceId?: string }
  | { op: "quest"; id: string; done: boolean }
  | { op: "place"; id: string }
  | { op: "npc_trust"; npcId: string; band: "low" | "ok" | "high" }
  | { op: "memory_has"; actorId: string; choiceKey: string }
  | { op: "memory_lacks"; actorId: string; choiceKey: string }  // transfer
  | { op: "flag"; id: string }
  | { op: "tick_gte"; value: number }
  | { op: "freedom"; escaped: boolean };
```

**Blocking conditions** are predicates that keep a situation from activating *even if* prerequisites pass (e.g. `chapterQuietPending`, cinema chain, “Vee must not have Cove choice in memory”).

---

## Approaches (finite, state-gated)

Authors list **all** ways the dramatic question can be faced. Systems **hide or disable** approaches; they do not invent new ones.

```ts
type Approach = {
  id: string;
  verb: string;                   // take | talk | buy | refuse | wait | borrow | …
  label: string;
  requires?: Predicate[];         // extra gates (enough liquidity, Rex graph node)
  blockedWhen?: Predicate[];
  /** If all approaches but foldback are blocked, force foldback */
};
```

**Multiple approaches** example (Cove): `hold_jar` · `buy_treat` · (optional later) `walk_away` only if authored — never a generated third fork.

Paycheck: `umbrella` · `glitter` — **no** approach labeled “like Cove.”

Credit: `wait` · `borrow` — only after Inbox + Scanner approaches resolve.

---

## Consequences (always bounded)

On resolve, the engine emits **consequence drafts** into the consequence prototype (or today’s direct writers: `setIrreversible`, `addScar`, `spineTakeFootprints`).

| Kind | Maps to |
|------|---------|
| Immediate | Horizon `IMMEDIATE` — felt same beat |
| Delayed | `SHORT_TERM` / `MEDIUM_TERM` / `LONG_TERM` |
| Relationship | NPC trust / relationship enum / gossip memory |
| Economic | money, liquidity, debt, risk, business holdings |
| Story | scars, flags, homecoming pending |
| Follow-up | queue another **authored** situation id when predicates pass |

```ts
type ConsequenceBounds = {
  domainsAllowed: ConsequenceDomain[];
  reversibilityMax: "irreversible" | "costly" | "reversible";
  magnitude: { min: number; max: number };  // per domain or global
  maySetFlags: string[];
  mayQueueFollowUps: string[];              // whitelist of situation ids
  forbid: string[];                         // e.g. "unlock_credit_without_paycheck"
};
```

Systems pick magnitudes **inside** bounds (e.g. jar +5 vs treat tab +5 already shipped). They cannot add `career` if the author forbade it, or queue `sit_infinite_job_hunt`.

---

## Follow-ups and foldbacks

**Follow-up:** directed edge to another authored situation (`after: "resolved:hold_jar"` → `sit_harbor_felt_jar`).

**Foldback:** story-circle join. Divergent approaches **must** land on a named foldback so side branches cannot orphan the spine.

| Foldback id | Meaning |
|-------------|---------|
| `fold_harbor_remembers` | Any Cove Take → hush → carpet home → spectacle |
| `fold_paycheck_change` | Either Vee price → Clock Change complete |
| `fold_credit_ordeal` | Wait or haste → scar + Credit quest complete |
| `fold_dignity_retry` | Minigame miss → same place, clearer verb (not a new quest) |

Foldbacks are **required** on `track: "main"`. Side digressions may fold into `fold_plaza_gossip` (heard myth) without stealing Plinth spectacle.

---

## Memory flags

Flags are **boolean sim facts**, not prose.

| Flag example | Set by | Read by |
|--------------|--------|---------|
| `flag_cove_change_done` | Situation resolve | Side shores, Vee availability |
| `flag_transfer_window` | Cove resolve | Paycheck situation `memory_lacks` Vee |
| `flag_quiet_pending` | Take | Blocks plaza magnets |
| `flag_piggy_homecoming_open` | Spectacle done | Piggy Talk approach |
| `flag_day2_armed` | Scar age | Day-2 echo situation |

Flags feed NPC observers (memory architecture) and blocking predicates. They are never generated from LLM chat.

---

## Situation lifecycle

```
locked  --(prereqs ∧ ¬blocking)--> available
available --(player enter / Talk / location)--> active
active --(approach commit)--> resolving
resolving --(consequences + flags)--> resolved
         \--(foldback id)--> available(next) or resolved
```

Only **one** `track: "main"` situation `active` at a time (protect signature loop). Side `echo` situations may be `available` concurrently (Soft Beat, rumor) but must yield to hush/spectacle.

---

## Spine graph (authored — already implied by live game)

These ids are **design names** for situations the content already plays. Wiring the engine later should wrap them, not duplicate them.

| Situation | Dramatic question | Approaches | Foldback |
|-----------|-------------------|------------|----------|
| `sit_harbor_ashore` | Will you Talk, then board? | talk_piggy, board_carpet | `fold_leave_ordinary` |
| `sit_cove_jar_or_treat` | Hold or spend — which will Harbor keep? | hold_jar, buy_treat | `fold_harbor_remembers` |
| `sit_harbor_felt` | Can you see that the world marked you? | watch, share, talk_piggy | `fold_homecoming` |
| `sit_paycheck_two_prices` | Shelter or sparkle — new stall, no mapping? | umbrella, glitter | `fold_paycheck_change` |
| `sit_credit_spiral` | Wait or haste under interest? | inbox, scan, wait, borrow | `fold_credit_ordeal` |

Side: `sit_shelly_shell`, `sit_priya_buckets` (blocked until Vee resolved + transfer window closed).

---

## Worked example: Paycheck stall

**Author:** Characters Vee (+ optional Pat later). Theme: Clock *shelters*. Question: rainy-day vs glitter. Stakes: leftover vs display. Approaches: two. Bounds: ±4 monthly holding, scar, no Credit unlock. Follow-up: `sit_harbor_felt_clock`. Foldback: `fold_paycheck_change`.

**Systems at runtime:**

- Prerequisites: Cove Change flag, place = Paycheck, Vee `memory_lacks` Cove choice  
- Blocking: `chapterQuietPending`, mastery quiz modal  
- If CF already high, **do not** add a third “you’re rich skip” approach — maybe *foreshadow* weather only  
- Resolve → consequence engine drafts + today’s `spineTakeFootprints`  
- Queue Harbor felt; never queue a generated “Vee needs a loan” quest

---

## Anti-patterns (rejected)

| Anti-pattern | Why |
|--------------|-----|
| Unlimited random quests | Anti-pillar; no dramatic question; no foldback |
| Weighted deck as spine | `events/engine.ts` is a minigame toy |
| LLM-authored situations | Invents state and spoils transfer |
| Approaches generated from “verbs the player has” | Checklist exploration |
| Unbounded magnitudes | Breaks Freedom / weather honesty |
| Parallel main situations | Two coaches / two Takes |
| Follow-ups not on whitelist | Procedural graph explosion |

---

## Relationship to shipped systems

| Shipped | Role vs this engine |
|---------|---------------------|
| Island JSON quests + Talk `DialogueEffect` | Today’s situation + approach + immediate effects |
| `mainCourse.ts` | Campaign foldbacks (five steps) |
| `creditEncounter.ts` | Multi-approach Credit situation |
| `signatureCinemaGate.ts` | Blocking + `sit_harbor_felt` timing |
| `decisionTimeline` | After-action “why” UI, not the graph |
| Scenario decks | Stay inside ModularMinigame |
| Consequence prototype | Delayed/economic/relationship rows |
| NPC + memory docs | Predicate channels not yet in save |

---

## Implementation order (later)

1. Catalog live spine as situation records (ids above) with predicates that **read** current save  
2. Attach consequence bounds to Takes (already numeric in footprints)  
3. Encode transfer firewalls as `memory_lacks`  
4. Do **not** replace JSON quests until foldbacks match iconic checklist  
5. Kill switch: if engine missing, authored graphs still play

---

## Test contract (when coded)

- Main track: at most one `active` situation  
- Vee situation unavailable until Cove flag; Vee pack never includes Cove `choiceId`  
- Every main resolve hits a foldback id  
- Consequence domains ⊆ `consequenceBounds.domainsAllowed`  
- Follow-up ids ⊆ whitelist  
- No API exists to `createSituation()` at runtime without a shipped record  
