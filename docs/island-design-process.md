# Island Design Process

**Product:** FinanceQuest Pro · Islands mode  
**Goal:** Every island ships with the same repeatable pipeline — players always know where to go, and learning lands on beat.  
**Related:** [game-pillars.md](./game-pillars.md) · [ip-safe-design.md](./ip-safe-design.md) · [art-direction-bible.md](./art-direction-bible.md) · [islands-ui-style-guide.md](./islands-ui-style-guide.md)

---

## Acceptance (every island)

Before an island merges to `main` or ships in a content pack:

| Deliverable | Path | Done when |
|-------------|------|-----------|
| **Layout map** | `docs/islands/<island-id>/layout-map.md` | Areas, gates, landmarks, wayfinding signposts, and topology signed off |
| **Quest pacing chart** | `docs/islands/<island-id>/quest-pacing-chart.md` | Teach beats, objectives, minigames, gates, and session timing signed off |
| **Content JSON** | `src/islands/content/<island-id>.islands.json` | Matches layout map IDs; `provenance` filled per IP-safe workflow |

Copy templates from [`docs/islands/_template/`](./islands/_template/).

**Reference implementation:** [Coincraft Cove](./islands/coincraft-cove/layout-map.md)

---

## Process overview

```
┌─────────────────┐   ┌─────────────┐   ┌──────────┐   ┌────────────┐   ┌─────────┐
│ Pre-production  │ → │   Layout    │ → │ Blockout │ → │ Scripting  │ → │ Polish  │
│ theme · goals   │   │ areas·gates │   │ nav·pace │   │ dlg·events │   │ juice   │
│ mechanics pick  │   │ landmarks   │   │ quests   │   │ rewards    │   │ audio   │
└─────────────────┘   └─────────────┘   └──────────┘   └────────────┘   └─────────┘
        │                     │                │               │              │
        └─────────────────────┴────────────────┴───────────────┴──────────────┘
                                    Layout map + quest pacing chart
                                    updated at each gate (see below)
```

| Phase | Primary output | Updates layout map? | Updates pacing chart? |
|-------|----------------|--------------------|-----------------------|
| 1 Pre-production | Island brief + provenance draft | — | Learning beat outline |
| 2 Layout | **Layout map v1** | **Create** | Gate + landmark columns |
| 3 Blockout | Playable greybox in JSON | Connections + gates | **Create pacing chart v1** |
| 4 Scripting | Dialogues, triggers, rewards | Signpost notes | Objective timing + hints |
| 5 Polish | FX, audio, juice | Landmark visibility | Stinger + reward beats |

---

## Wayfinding rules (baked in)

Design goal: **“I always know where to go next.”** Apply on every island; verify in playtest with the [wayfinding checklist](#wayfinding-playtest-checklist).

### Landmarks

| Rule | Requirement |
|------|-------------|
| **W1 — Rule of three** | Each island has ≥ 3 **named landmarks** visible in art or copy (e.g. lighthouse, harbor dock, market awning). Player can name them after one session. |
| **W2 — One hero per area** | Each area has exactly one **visual hero** (tallest silhouette, unique color, or animated prop) repeated in area scene + travel pin. |
| **W3 — Landmark ↔ learning** | At least one landmark **embodies the learning theme** (Savings Lighthouse = delayed gratification). |

### Signposting

| Rule | Requirement |
|------|-------------|
| **W4 — Before the gate** | Player learns about a **locked area before** hitting the lock. Use NPC line, quest hint, or travel map label — never a silent 🔒. |
| **W5 — Quest log names place** | Every active objective resolves to **area name + landmark** (“Talk to Captain Penny at **Coin Harbor** ⚓”). Engine: quest log `resolveLabel` + `hint` field. |
| **W6 — Next beat highlighted** | In-progress quests show **➡️ Next:** objective (already in `IslandPlayView` quest panel). Copy must include direction, not just task. |
| **W7 — Hub resume** | Continue / resume returns to **saved area** with HUD badge showing area icon + name. |

### Navigation

| Rule | Requirement |
|------|-------------|
| **W8 — No orphan areas** | Every area has ≥ 1 NPC, item, minigame, or gate payoff. No decorative-only zones in v1. |
| **W9 — Triangle or spine** | Prefer **3–5 areas** in a hub-and-spoke or linear spine with one optional branch. Avoid maze topology for family tier. |
| **W10 — Return path** | After minigame or dialogue, player lands in **same area** with clear next action (no modal dead ends). |

### Polish-time wayfinding

| Rule | Requirement |
|------|-------------|
| **W11 — Eye trail** | Lighting / FX / juice draws attention toward **next objective landmark** (subtle pulse, beam, footstep path). |
| **W12 — Audio ping** | Optional ambient cue or stinger when **quest advances** or **new area unlocks**. |

### Wayfinding playtest checklist

- [ ] Cold player reaches first quest objective in **< 3 min** without external help  
- [ ] When lost, player opens quest log and knows **which area to enter**  
- [ ] Locked gate: player knows **what item/quest step** unlocks it before trying  
- [ ] After 10-min session, player can **draw the island map** from memory (3 landmarks minimum)  
- [ ] Travel view + explore list use **same area icons and names**  

---

## Phase 1 — Pre-production

**Duration:** 2–4 days (new island) · 1 day (expansion pack)

### Inputs
- Audience tier (family / teen / adult) from [game-pillars.md](./game-pillars.md)  
- Standards alignment (Jump$tart / CEE skill)  
- [IP-safe design](./ip-safe-design.md) learning kernel  

### Activities

1. **Theme pitch** — One sentence + mood board variant (see [art-direction-bible.md](./art-direction-bible.md)).  
2. **Learning goals** — 3–5 `learning_objectives` (plain language → provenance field).  
3. **Mechanics modules** — Pick 2–4 from internal library; map to minigames:

   | Module id | Teaches |
   |-----------|---------|
   | `EarnSpend` | Income vs expenses |
   | `ChangeMaking` | Denominations, making change |
   | `EnvelopeBudget` | Category budgets |
   | `CalendarCycle` | Pay cycles, timing |
   | `CreditUtilization` | Credit limits, utilization |
   | `PassiveIncome` | Assets that earn over time |
   | `PortfolioDrift` | Allocation drift |
   | `EventDeck` | Scenario cards |

4. **Originality pass** — Two-layer remix + `forbidden_references[]`.  
5. **Session target** — Family 10–15 min / teen 20–30 min for full island badge.

### Exit criteria
- [ ] Island brief approved (theme, tier, 3 landmarks named)  
- [ ] Learning objectives + `mechanics_used[]` drafted  
- [ ] Pacing chart **outline**: quest count, minigame count, one gate  

---

## Phase 2 — Layout

**Duration:** 2–3 days

### Activities

1. **Area graph** — 3–5 areas; draw on layout map (Mermaid + ASCII).  
2. **Gates** — `requiredItems` or quest flags; document **signpost** for each (W4).  
3. **Landmarks** — Assign W1–W3 heroes per area.  
4. **NPC roster** — One quest-giver per beat minimum; flavor NPCs optional.  
5. **Item economy** — Key items (gate keys, badge, collectibles).  

### Layout map contents (required sections)
See [`_template/layout-map.md`](./islands/_template/layout-map.md):

- Topology diagram  
- Area table (id, name, icon, connections, gate)  
- Landmark register  
- Wayfinding signpost table  
- Spawn / entry point  

### Exit criteria
- [ ] **Layout map v1** committed under `docs/islands/<id>/`  
- [ ] Wayfinding rules W1–W4 addressed in doc  
- [ ] IDs stable (`snake_case` area/npc/item ids match future JSON)  

---

## Phase 3 — Blockout

**Duration:** 3–5 days

### Activities

1. **JSON skeleton** — `areas`, empty `npcs`, `quests` with ids from layout map.  
2. **Navigation** — Wire `connections`; verify travel + explore from every area.  
3. **Pacing** — Order quests; one **skill moment** per 3–5 min; minigame after teach, before gate.  
4. **Greybox art** — Placeholder scenes OK ([`AreaScene`](../../src/art/coincraft/environments/AreaScene.tsx) or pixel blockout).  
5. **Placeholder copy** — Hints must name places (W5).  

### Quest pacing chart contents (required)
See [`_template/quest-pacing-chart.md`](./islands/_template/quest-pacing-chart.md):

- Session timeline (min 0 → badge)  
- Quest / objective rows with teach, practice, gate columns  
- Hint escalation points  
- Reward beats  

### Exit criteria
- [ ] **Quest pacing chart v1** committed  
- [ ] Playable greybox: hub → island → all areas reachable (gates behave correctly)  
- [ ] `time to first quest` path ≤ 3 min on paper walkthrough  

---

## Phase 4 — Scripting

**Duration:** 5–7 days

### Activities

1. **Dialogue graphs** — `startQuest`, `giveItem`, `completeQuest` effects; branch without dead ends.  
2. **Triggers** — Quest start guards (e.g. Alma requires Coin Pouch in inventory).  
3. **Events** — Analytics: `area_entered`, `dialogue_choice`, `quest_*`.  
4. **Rewards** — Coins/XP/items aligned to pacing chart; badge on island complete.  
5. **Hints** — `hint` on quests; escalate after `quest_failed_attempt` (engine-supported).  
6. **Learning profile copy** — `ProfileText` variants where reading level differs.  

### JSON ↔ doc sync
- Any layout or pacing change **updates both docs** in the same PR.  
- Layout map **signpost table** must match final `hint` strings.  

### Exit criteria
- [ ] Both quest chains completable start → badge  
- [ ] All dialogue effects tested  
- [ ] Pacing chart marked **Final** with actual minute estimates from playtest  

---

## Phase 5 — Polish

**Duration:** 5–10 days (parallel tracks)

| Track | Tasks | Wayfinding tie-in |
|-------|-------|-------------------|
| **Art** | Area scenes, NPC portraits, UI skin | W2 hero silhouettes |
| **Lighting / FX** | Area tints, lighthouse beam, market flags | W11 eye trail |
| **Audio** | Ambient loop, UI SFX, quest stingers | W12 unlock ping |
| **Juice** | [juice checklist](./juice-system-checklist.md), rewards, collect pop | Reward beats on pacing chart |
| **A11y** | Text size, reduced motion, contrast | Quest log remains readable |

### Exit criteria
- [ ] Wayfinding playtest checklist passed (5/5)  
- [ ] Layout map + pacing chart version **1.0 Final**  
- [ ] IP red-flag checklist passed  
- [ ] E2E happy path green  

---

## ID naming conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| Island | `{theme}_{place}` | `coincraft_cove` |
| Area | `{prefix}_{name}` | `cc_harbor` |
| NPC | `npc_{name}` | `npc_captain_penny` |
| Quest | `q_{prefix}_{slug}` | `q_cc_first_coins` |
| Item | `{prefix}_{item}` | `cc_coin_pouch` |
| Dialogue | `dlg_{npc}` | `dlg_captain_penny` |
| Minigame | `mg_{slug}` | `mg_coin_sort` |

---

## PR checklist (author)

```markdown
- [ ] docs/islands/<id>/layout-map.md updated
- [ ] docs/islands/<id>/quest-pacing-chart.md updated
- [ ] src/islands/content/<id>.islands.json matches doc IDs
- [ ] provenance.learning_objectives + mechanics_used filled
- [ ] Wayfinding W4–W6 verified (hints name places)
- [ ] Playtest note: time to first quest ___ min
```

---

## Island registry

| Island | Tier | Layout map | Pacing chart | JSON | Status |
|--------|------|------------|--------------|------|--------|
| [Coincraft Cove](./islands/coincraft-cove/layout-map.md) | Family | ✅ | ✅ | `coincraft-cove.islands.json` | Vertical slice |

Add a row when starting a new island.

---

*Version 1.0 · Layout map + quest pacing chart required per island*
