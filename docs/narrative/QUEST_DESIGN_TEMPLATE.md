# Quest design template

**Use:** One sheet per `IslandQuest` (or Narrative Situation wrapping it).  
**Pass bar:** ≥3 of CHARACTER · STORY · FINANCIAL SYSTEM · EXPLORATION · PLAYER IDENTITY · WORLD DEVELOPMENT · TRANSFERABLE LEARNING.  
**Canon:** [QUEST_AUDIT.md](./QUEST_AUDIT.md) · [NARRATIVE_EVENT_ENGINE.md](./NARRATIVE_EVENT_ENGINE.md) · Constitution (trade-offs, persistent consequences, no quiz-app).

Copy the block below. Anything marked **must** is required for `track: "main"`. Side quests may leave delayed/world thinner but cannot be **only** fetch + XP.

---

## Identity

| Field | Value |
|-------|--------|
| `id` | `q_` stable — never rename after ship |
| `track` | `main` \| `side` |
| Island / organ | Harbor Memory · Cove Coin · Paycheck Clock · Credit Spiral · or era **lens** |
| Working title | Player-facing; not a textbook chapter name |

---

## Problems (must)

| Field | Prompt |
|-------|--------|
| **human_problem** | Who hurts or hopes if this goes wrong? One sentence. |
| **financial_problem** | What money constraint is live (not a definition to recite)? |
| **dramatic_question** | What will Harbor (or this place) remember? Player can retell in one kid sentence. |

If human_problem is “learn about X,” stop. Rewrite until a person or place is at risk.

---

## Tradeoff (must for main)

| Field | Prompt |
|-------|--------|
| **tradeoff** | Branch A gives up ___. Branch B gives up ___. Neither is free. |
| **available_approaches** | Finite verbs (talk Take, refuse, wait, buy…). Systems may **hide** approaches; authors do not generate extras at runtime. |
| Obvious “right” answer? | If yes, it is not a Capital quest. |

---

## Cast & place

| Field | Prompt |
|-------|--------|
| **characters** | Major NPCs from the economic model. Who interprets the outcome differently? |
| **locations** | Shore / structure / stall — walkable, not a menu tab |
| **systems_used** | Ledger, scar, weather, Talk effects, pads, gates — list real modules |

Minimum **one** system that is not “journal checkbox.”

---

## Consequences (must for main)

| Horizon | What changes |
|---------|----------------|
| **immediate_consequence** | Same beat: hush, holding, item, score |
| **delayed_consequence** | Harbor felt, weather, gossip, next painting |
| **relationship_change** | Trust / role / memory flag (no heart meter) |
| **world_change** | Plaque, plaza, lock/unlock, organ retell |

If all four are “coins and XP,” it is **NO_CONSEQUENCE**. Do not ship on `main`.

**Bounds:** domains allowed, magnitude min/max, follow-up ids whitelist (see Narrative Event Engine).

---

## Learning & story

| Field | Prompt |
|-------|--------|
| **learning_value** | Concept id (`save_vs_spend`, `cashflow`, …). Independent transfer: next situation **must not** name this answer. |
| **story_value** | Harmon beat this serves (Need / Search / Find / Take / Return / Change). |

---

## Pillar check (need ≥3 Y)

| Pillar | Y/N | Evidence (one line) |
|--------|-----|---------------------|
| CHARACTER | | |
| STORY | | |
| FINANCIAL SYSTEM | | |
| EXPLORATION | | |
| PLAYER IDENTITY | | |
| WORLD DEVELOPMENT | | |
| TRANSFERABLE LEARNING | | |
| **Count** | | |

---

## Flag self-test (any Y is a rewrite)

| Flag | Y/N | If Y, how you kill it |
|------|-----|------------------------|
| FETCH_QUEST | | Give the fetch a Take or cut the quest |
| FAKE_CHOICE | | Unequal ledger/scar outcomes |
| OBVIOUS_CORRECT_ANSWER | | Cost the “good” branch |
| EXPOSITION_DUMP | | Situation before vocabulary |
| NO_HUMAN_STAKES | | Name who pays |
| NO_SYSTEM_INTERACTION | | Write a holding or scar |
| NO_CONSEQUENCE | | Delayed Harbor beat |
| REPEATED_TEMPLATE | | Unique dramatic question |

---

## Foldback

| Field | Value |
|-------|--------|
| Resolves into situation / quest | |
| Foldback id | e.g. `fold_harbor_remembers` |
| Must not steal | Plinth spectacle / Credit Take / transfer surface |

---

## Content wiring (implementation checklist)

- [ ] JSON `objectives` only use shipped types (`talkToNpc`, `collectItem`, `completeMinigame`)  
- [ ] Forks live in dialogue `setIrreversible` / `addScar` with **two** real effects  
- [ ] No XP as the meaning of success (strip `rewards.xp` when editing)  
- [ ] Side shore: locked until Cove Change; no Credit lecture before Ordeal  
- [ ] Coin Bag / Piggy copy does not spoiler the next analog problem  
- [ ] Esc / Leave / retry dignity if a pad can fail  

---

## Gold references (copy structure, not plot)

- `q_cc_save_or_spend` — human + financial + world memory  
- `q_pp_rainy_day` — transfer (new stall, no mapping)  
- `q_ck_first_recovery` — multi-approach then Take  

Do **not** clone `q_*_arcade_lane` as a quest; if you need toys, catalog them as tomfoolery, not Story Circle beats.

---

## Blank copy-paste

```
id:
track:
island / organ:
title:

human_problem:
financial_problem:
dramatic_question:
tradeoff:
characters:
locations:
systems_used:
available_approaches:

immediate_consequence:
delayed_consequence:
relationship_change:
world_change:
learning_value:
story_value:

pillars (Y/N): C S F E I W T  count=
flags: (none | list)
foldback:
```
