# Character memory architecture

**Status:** Design for persistent NPC/player-facing memory — **not wired to save**  
**Companion:** [NPC_ECONOMIC_MODEL.md](./NPC_ECONOMIC_MODEL.md)  
**Related:** [CONSEQUENCE_ENGINE.md](../simulation/CONSEQUENCE_ENGINE.md) · `src/islands/worldMemory.ts`  
**Law:** LLMs generate **language from state**. LLMs **must not invent state**.

This document specifies how Capital stores what characters **know**, how that differs from what they **believe**, and how speech is produced without creating a second sim.

---

## Why this exists

Shipped `NpcMemoryEntry` is:

```ts
{ talks: number; lastChoiceIds: string[]; lastTalkAt?: string; affinity?: number /* legacy, not written */ }
```

That is enough for greetings. It is **not** enough for:

- “Harbor remembered your jar”
- “Vee must not hear Cove’s answer”
- “Rex only knows Credit graph progress”
- Two NPCs interpreting the same Pay Day differently

Memory architecture splits **facts observed** from **interpretation** so a language model cannot accidentally mint a scar.

---

## Four stores (same layers as the NPC model)

```
CANONICAL FACTS          authored character bible (immutable in play)
        ↓ seeds
SIMULATION STATE         clocks, ledgers, scars, quests, consequence log
        ↓ observers
CHARACTER MEMORY         per-actor event log (what they were allowed to see)
        ↓ lenses
CHARACTER INTERPRETATION authored read of those events (attitude, next line intent)
        ↓ renderer
SPEECH                   Talk Battle graph  OR  LLM phrasing of a frozen pack
```

Nothing flows **up** from speech into simulation.

---

## 1. Canonical facts

**Write:** humans in docs / `moneyCast` / island JSON / NPC economic cards.  
**Read:** everyone.  
**LLM:** may quote names, occupations, values. May not add relatives, jobs, or secret debts.

Canonical facts are **not** memories. “Kira keeps the lighthouse” is true even if the Voyager never talked to her.

---

## 2. Simulation state (world truth)

**Write:** game systems only (`applyDialogueEffects`, `voyagerLedger`, `addHarborScar`, consequence engine, `creditEncounter`).  
**Read:** memory observers (filtered).  
**LLM:** may not write.

World truth includes events the NPC **did not witness**. Memory observers decide who learns what.

Example: Cove Take is world-true immediately. Piggy learns it on **homecoming** (authored). Vee **never** gets the jar/treat choice ids (transfer law).

---

## 3. Character memory (observations)

Each major NPC (and the Voyager, optionally) has a **capped log** of `MemoryRecord`s.

```ts
type MemoryRecord = {
  id: string;
  actorId: string;                 // who remembers
  observedAtTick: number;
  source: {
    kind: "talk" | "witness" | "rumor" | "ceremony" | "work";
    consequenceId?: string;        // if born from consequence engine
    scarId?: string;
    questId?: string;
    choiceId?: string;
  };
  /** Only fields copied from sim — no adjectives */
  facts: {
    domain?: string;               // consequence domain if any
    verb?: string;
    choiceId?: string;
    holdingId?: string;
    placeId?: string;
    counterpartId?: string;        // other actor
  };
  visibility: "hidden" | "foreshadowed" | "felt" | "named";
};
```

**Rules:**

| Rule | Meaning |
|------|---------|
| **Need-to-know** | An NPC only receives a record if an authored *observer rule* fires |
| **No adjectives** | Memory stores `choiceId: "spend"`, not “you were reckless” |
| **Cap** | Last N (e.g. 24, same order as Harbor scar cap) per actor |
| **No affinity** | Do not revive `affinity` as a write path |
| **Transfer firewall** | Observer rules for Vee/Pat **exclude** Cove `choiceId`s |
| **Rex firewall** | Rex memories only from Credit graph + player Credit Take |

### Observer rules (authored)

| Actor | May observe |
|-------|-------------|
| Piggy | Harbor ceremonies, plaques, homecoming, plaza rumors **without** Paycheck/Credit answers |
| Kira / Alma | Cove quest + Cove Take + village-facing aftermath |
| Vee | Paycheck stall fork only; **strip** `cove_save_vs_spend` |
| Pat / Priya | Clock side quest after Vee Take; no Cove mapping |
| Rex | `creditEncounter` nodes + `credit_borrow_vs_wait` |
| Plaza locals | Digression `npc_tone` scars as gossip (`plazaScarGossipLine`) — labels, not ledgers |
| Series leads | Witness lines only; empty personal log |

### What shipped code already does

| Mechanism | Memory analogue |
|-----------|-----------------|
| `recordNpcTalk` | Increment talks + last 8 `choiceId`s |
| `harborScars` | World plaques (shared Harbor memory, not per-NPC) |
| `piggyScarWeightLine` | Piggy interpretation of **world** scars |
| `localNamesScarEcho` | Ambient rumor |
| `digressionShelf` | Player-facing heard myths |
| Homecoming graphs | Ceremony that *should* copy Take → Piggy memory |

**Gap:** there is no per-NPC `MemoryRecord[]` on `IslandSaveV1`.

---

## 4. Character interpretation (lens)

Interpretation is a **pure function** of (canonical values, simulation pressures, memory log).

```ts
type Interpretation = {
  actorId: string;
  lensId: string;                  // e.g. keeper_of_jars
  stanceTowardPlayer: "warm" | "matter_of_fact" | "pressuring" | "quiet";
  topicIntent: string;             // “name the plaque” | “offer umbrella vs glitter”
  forbiddenTopics: string[];       // transfer answers, quiz keys
  salience: MemoryRecord["id"][];  // which memories may be mentioned
};
```

Authors ship `lensId` behavior tables. Example:

| lensId | If memory has treat tab | If memory has jar hold |
|--------|-------------------------|------------------------|
| `keeper_of_jars` | Named loss of village hold | Named Coin Hold |
| `fountain_vendor` | (should not have this memory) | (should not) |
| `harbor_keeper` | Plaque exists; next verb carpet; no Clock lecture | Same structure, different plaque words |
| `obligation_collector` | Ignore unless Credit graph | Ignore |

**LLM may:** turn `Interpretation` + allowed `MemoryRecord.facts` into sentences.  
**LLM may not:** add salience, clear forbidden topics, or change `stanceTowardPlayer` except via sim (e.g. homecoming count).

---

## Speech pipeline

```
1. Player presses Talk (E)
2. Resolve graph id (authored)
3. Build PromptPack:
     canonical card (subset)
     interpretation (computed)
     salience memories (facts only)
     UI constraints (learning profile, reduced motion — no extra lore)
4. Line source:
     a. Authored node text (default, always works)
     b. Optional LLM rewrite of that node with PromptPack
5. On choice commit:
     DialogueEffect → SIMULATION only
     Then observers append MemoryRecords
```

**Default remains authored graphs.** LLM is an optional renderer behind a kill switch (same family as `capital_kill_telemetry`).

### PromptPack (frozen at request time)

```ts
type PromptPack = {
  actorId: string;
  canonical: { name: string; occupation: string; values: string[] };
  interpretation: Interpretation;
  memories: Array<{ facts: MemoryRecord["facts"]; visibility: MemoryRecord["visibility"] }>;
  playerVisible: { organHint?: string; nextVerb?: string };
  bans: string[];                  // e.g. "do not mention jar or glitter"
};
```

Log PromptPacks in QA, not production analytics (PII/kid safety).

---

## Voyager memory vs NPC memory

| | Voyager | NPC |
|--|---------|-----|
| World scars | Yes (`harborScars`) | Filtered observers |
| Decision timeline | Session replay UI | No |
| Concept progress | Yes | NPC `knowledge` is canonical curriculum, not ITR |
| Family Room | Local humans | NPCs never join Family Room |

The player’s “memory” for cold retell is **Harbor** (Memory organ), not a chat history.

---

## Same event, four layers (worked example)

**Player:** Cove Take `save`.

| Layer | Content |
|-------|---------|
| Canonical | Kira values Hold; Piggy values Memory; Vee must not be taught this fork |
| Simulation | `irreversibleChoices.cove_save_vs_spend = save`; jar holding; scar scheduled |
| Memory (Kira) | `{ verb: "take", choiceId: "save", placeId: "coincraft_cove" }` |
| Memory (Piggy) | empty until homecoming ceremony copies scar label **without** requiring the word “jar” in Paycheck later |
| Memory (Vee) | **no record** |
| Interpretation (Kira) | `keeper_of_jars` / warm / topic: Hold happened |
| Interpretation (Piggy) | `harbor_keeper` / quiet until Talk / topic: plaque + carpet |
| Interpretation (Vee) | unchanged; still `fountain_vendor` with empty Cove facts |
| Speech | LLM may say Kira’s warmth; may not tell Vee “you already learned this at the jar” |

---

## Trust and relationship (not memory)

Trust and `player_relationship` live in **simulation state** (NPC economic model). Memory **feeds** the trust function; it is not a substitute.

Do not store “Piggy likes you 80” as a memory fact.

---

## Failure, rumors, lies

| Kind | Allowed? |
|------|----------|
| NPC **wrong interpretation** of a true memory | Yes (that is the point) |
| NPC **false memory** of an event that did not fire | No |
| Rumor (`source.kind: "rumor"`) | Yes if authored observer copies a **public** scar label, never a hidden ledger field |
| Player lie in Talk | Only if a `DialogueEffect` writes sim; then memories record the **effect**, not the chatter |

---

## Persistence (future)

Suggested additive blob (do not migrate until adapter PR):

```ts
npcEconomic?: Record<NpcId, {
  books: VoyagerLedger-like;
  trust: number;                 // internal, no HUD
  relationship: PlayerRel;
  currentObjectiveId: string;
  longTermObjectiveId: string;
  memories: MemoryRecord[];      // capped
}>;
```

Keep `IslandSaveV1` version `"1"` if additive. Sanitize like scars (corrupt → empty memories, still playable).

Consequence engine ids should be referenced, not duplicated, when that prototype is connected.

---

## QA / tests (when implemented)

1. Vee PromptPack never contains `cove_save_vs_spend` choice ids.  
2. Rex PromptPack empty before Credit unlock.  
3. Piggy homecoming pack contains plaque organ + next painting, not Paycheck prices.  
4. LLM disabled → identical quest completion and ledger.  
5. Memory cap does not drop the latest Change scar for Piggy.  
6. Schema rejects memory `facts` that include prose.

---

## Anti-patterns

- ChatGPT-in-the-plaza with world-write tools  
- Vector DB of “everything the player typed” as canon  
- Using interpretation text as the next session’s memory facts  
- Filling memory from analytics events (PII, noisy)  
- Series-lead diaries  
- Infinite procedural gossip that invents businesses

---

## Current → target

| Now | Target |
|-----|--------|
| Talk counts + last choices | Observation log + firewalls |
| Shared Harbor scars | Shared world + per-NPC observers |
| Authored Talk Battle | Authored default + optional LLM renderer |
| Coach heuristics | Still not NPC books |
| Consequence prototype | Optional `consequenceId` on memories |
