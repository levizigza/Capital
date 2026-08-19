# Capital — Causal Story Architecture

**Status:** Foundational design law — the compressed architecture for every next version decision  
**The breakthrough:** The **financial model does not interrupt the story**. It is the **machinery that creates the story**.  
**Law:** Simulate **causes**. Display **effects**. Never invert that order.  
**Companions:** [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) · [CAPITAL_DESIGN_BIBLE.md](../CAPITAL_DESIGN_BIBLE.md) · [VERTICAL_SLICE_GATE.md](./VERTICAL_SLICE_GATE.md) · [NORTH_STAR.md](../ftue/NORTH_STAR.md) · [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) · [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) · [ANECDOTE_SYSTEM.md](../research/ANECDOTE_SYSTEM.md)

---

## 1. The whole architecture (nine links)

Everything in Capital reduces to this chain:

```
Capital simulates CAUSES.
The world displays EFFECTS.
Characters give those effects MEANING.
The player makes DECISIONS.
Time reveals CONSEQUENCES.
Failure creates KNOWLEDGE.
Knowledge creates new POSSIBILITIES.
Those possibilities create different LIVES.
Those different lives create STORIES players tell one another.
```

Each link has **one job**. If a feature serves two links at once (e.g. a quiz that both “teaches” and “unlocks”), split it or cut it until the chain is honest.

| Link | Owner | Must not |
|------|-------|----------|
| **Causes** | Simulation (`voyagerLedger`, irreversibles, scars, quest predicates) | Be invented by dialogue, LLM, or UI copy |
| **Effects** | World presentation (weather, prices, Plinth, quiet plaza, Pay Day pouch) | Lie about causes or decorate without a channel |
| **Meaning** | Characters (Piggy, locals, organ lines — phrasing only) | Rename optimal strategy or guarantee outcomes |
| **Decisions** | Player (Take, deal, Wait, voyage) | Be chosen by coach, quiz, or auto-commit |
| **Consequences** | Time (Pay Day, day-2 echo, delayed CF, follow-up situations) | Arrive without a sim write or authored foldback |
| **Failure → knowledge** | Dignified fail + recovery ([FAILURE_RECOVERY.md](../ftue/FAILURE_RECOVERY.md)) | Shame, softlock, or fake success |
| **Knowledge → possibilities** | Transfer + reduced guidance ([CONCEPT_MASTERY_PEDAGOGY.md](./CONCEPT_MASTERY_PEDAGOGY.md)) | “Got it” buttons as mastery |
| **Possibilities → lives** | Branching residue (holdings, scars, stance, access — not class picks) | Hollow XP, badge, or personality menu |
| **Lives → stories** | Emergent retell + social share ([ANECDOTE_SYSTEM.md](../research/ANECDOTE_SYSTEM.md)) | Telemetry claiming “memorable” without player words |

---

## 2. The design breakthrough

Most financial games treat literacy as **content inserted between story beats** — a worksheet modal, a quiz gate, a tutor chat that pauses the fantasy.

Capital inverts the relationship:

> **The financial model is not a lesson that interrupts the adventure.  
> The financial model is the engine that generates the adventure.**

Cashflow is not a HUD apology. It is **pressure**.  
Pay Day is not a reward toast. It is **time passing judgment**.  
A Take is not a tutorial checkbox. It is **a cause** the world will still be answering tomorrow.

When this holds, players do not report *“I finished the money module.”* They report *“Harbor got stormy after I picked the treat tab — and Piggy remembered.”* That is the story financial literacy was supposed to produce all along.

---

## 3. Where the great games converge (and what Capital steals)

Apparently different games share the same spine. Capital’s job is not to copy their surfaces — it is to **honor the same causal contract** with money as the verb.

| Game tradition | What they celebrate | Capital equivalent |
|----------------|-------------------|------------------|
| **Zelda** | Different stories to tell — player-authored paths through one world | Irreversible Takes + scars + voluntary voyage order; [Family Room local myth](../iconic-path.md) |
| **Outer Wilds** | Curiosity as propulsion — knowledge *is* progress | Soft Beats, digression shelf (heard myths only), map unlock as curiosity not homework |
| **Elden Ring / FromSoftware** | Freedom to adapt — build your response to pressure | Multiple rational branches under different CF/weather ([DECISION_AUDIT.md](./DECISION_AUDIT.md)); dignity retry |
| **The Witcher / CDPR** | Dramatic decisions with lasting consequence | Spine Takes → ledger + scar + blocked paths |
| **The Last of Us / Naughty Dog** | Characters and pacing moment-to-moment | Piggy homecoming, quiet plaza, spectacle pacing — relationship **after** consequence |

**Convergence point:** Causes in systems. Effects in world. Meaning in character. **Stories in players.**

Capital’s differentiator: the **cause layer is a personal finance simulation** players can transfer to real life — not combat stats, not quest XP.

---

## 4. Layer map (Capital today)

Honest binding to shipped and specified systems — not wishful design.

```
┌─────────────────────────────────────────────────────────────┐
│  CAUSES (simulate)                                          │
│  voyagerLedger · irreversibleChoices · holdings · Pay Day   │
│  spineTakeFootprints · quest predicates · concept phases    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  EFFECTS (display)                                          │
│  harborWeather · shop multiplier · hush · Plinth glow        │
│  scar spectacle · Freedom chip · structure hush dim           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  MEANING (characters)                                       │
│  Piggy cold retell · Coin Bag (rules not picks) · locals     │
│  LLM = phrasing only ([AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md)) │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  DECISIONS (player)                                         │
│  Take · Talk commit · deal Accept/Wait · carpet voyage        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  TIME → CONSEQUENCES                                        │
│  Pay Day · day-2 echo · delayed CF · transfer surfaces      │
└───────────────────────────┬─────────────────────────────────┘
                            │
         failure ──► knowledge ──► possibilities ──► lives ──► stories
```

**Truth hierarchy** (unchanged): [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) · Principle 14 — simulation owns causes; characters never mint them.

---

## 5. What this architecture rejects

| Old shape | Why it breaks the chain |
|-----------|-------------------------|
| Quiz gates story progress | Knowledge without cause → fake possibilities |
| Spreadsheet hero UI | Effects without place → literacy interrupts fantasy |
| Coach picks the fork | Decision owned by guide → no life divergence |
| Decorative recession sky | Effect without cause → fake literacy |
| Tutorial completion as win | No transfer → no stories |
| XP / badge mastery | Possibilities without sim residue → hollow lives |
| LLM inventing NPC debt | Meaning without cause → contradictions |

These are **anti-pillars** already in [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md). This document states **why** in one causal story.

---

## 6. Feature test (one question)

For any proposal — mechanic, UI, content, AI line:

> **Which link in the chain does this strengthen — and does it smuggle an upstream job into a downstream layer?**

| Pass | Fail |
|------|------|
| Adds a **cause** (new holding type, bill, predicate) | Adds a **lecture** where a cause should exist |
| Makes an **effect** readable (sky, price, plaque) | Fakes an effect with art only |
| Lets a **character interpret** a true effect | Lets a character **decide** for the player |
| Opens a **possibility** after proof (transfer pass) | Opens map width before [VERTICAL_SLICE_GATE.md](./VERTICAL_SLICE_GATE.md) clears |
| Invites a **story** (share, Family myth, recall) | Claims memorability from telemetry alone |

**Final compression** (replaces scattered ship questions):

> *Does this help a player live a different financial life in the world — and retell it in one kid sentence?*

---

## 7. Signature loop as proof-of-architecture

The **Harbor Memory Loop** is the first vertical slice where all nine links must fire in one session ([VERTICAL_SLICE_GATE.md](./VERTICAL_SLICE_GATE.md)):

| Link | Cove → Harbor → Paycheck |
|------|--------------------------|
| Cause | Jar/treat Take writes holding + scar |
| Effect | Hush, weather band, Plinth lamp |
| Meaning | Piggy names plaque; organ kid sentence |
| Decision | Player commits Take unaided at transfer |
| Time | Pay Day / day-2 echo / delayed gossip |
| Failure → knowledge | Coin Sort retry; CF misread → Pay Day teaches |
| Knowledge → possibility | Paycheck unlock; side shores tease |
| Possibility → life | Stance residue, CF trajectory, Freedom chase |
| Life → story | Share PNG, Family myth, anecdote recall |

If any link is missing, **deepen that link** — do not add a district.

---

## 8. Measurement aligned to the chain

| Link | Metric (not substitute) |
|------|-------------------------|
| Decisions | `decision_committed`, irreversible keys |
| Consequences | `consequence_displayed`, Pay Day settlement |
| Failure → knowledge | `failure_recovery_rate` |
| Knowledge → possibility | **IFTR** ([LEARNING_TRANSFER_FRAMEWORK.md](../research/LEARNING_TRANSFER_FRAMEWORK.md)) |
| Lives → stories | Validated **ANECDOTE_DENSITY** + player quotes ([ANECDOTE_SYSTEM.md](../research/ANECDOTE_SYSTEM.md)) |

Tutorial completion measures **UI**, not **lives** or **stories**. Never ship it as the primary win.

---

## 9. Next version discipline

Building the next version means **tightening the chain**, not widening the map:

1. **More honest causes** — every spine Take bites ledger; no MEANINGLESS CF forks left un fixed.  
2. **More readable effects** — one weather truth on Harbor; consequences visible before dashboards.  
3. **Quieter guides** — meaning without strategy theft ([AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md)).  
4. **Prove transfer** — external ITR cohort; failure creates knowledge that **opens** Paycheck, not hints.  
5. **Validate stories** — playtest recall before claiming emergent excellence.

**Iconic freeze holds:** Cove → Paycheck → Credit depth; no new main-course islands until the slice gate clears.

---

## 10. One paragraph (shareable)

Capital simulates the **causes** of a personal financial life — cashflow, commitments, time, trade-offs. The **world** shows what those causes did to sky, prices, memory, and home. **Characters** translate effects into myth, not homework. The **player** decides; **time** answers; **failure** teaches; **transfer** opens new moves; **different residue** becomes a different life; and players **tell each other** what Harbor felt like. That is the same contract the best adventure games keep — except here, the machinery under the story is money itself. The literacy was never supposed to pause the game. **It was supposed to be the game.**

---

## 11. Document map

| Need | Read |
|------|------|
| Non-negotiable principles | [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) |
| Fantasy + loop detail | [CAPITAL_DESIGN_BIBLE.md](../CAPITAL_DESIGN_BIBLE.md) |
| Slice excellence gate | [VERTICAL_SLICE_GATE.md](./VERTICAL_SLICE_GATE.md) |
| King KPI | [NORTH_STAR.md](../ftue/NORTH_STAR.md) |
| Eco honesty | [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) |

**Amendment:** When this chain conflicts with a feature pitch, the pitch loses until the constitution is deliberately amended with evidence.
