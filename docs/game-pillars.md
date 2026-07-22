# FinanceQuest Islands — Game Pillars (1-page)

**Product:** Adventure-first financial literacy game (Islands mode) inside FinanceQuest Pro.  
**North star:** Players feel like explorers first and students second — money skills stick because choices matter in a world they care about.

**Mythology:** The whole journey *is* the story — see [story-bible.md](./story-bible.md) (Harmon Story Circle + Hero’s Journey). Harbor Haven = Castle Grounds; every island is a full circle chapter. Expand inside that cosmos; do not invent a second one.

---

## Target customers

| Segment | Who | Job to be done | Primary island tier |
|--------|-----|----------------|---------------------|
| **(A) Families** | Parents + kids 6–11 | Safe, co-play money habits at home; progress parents can see | Elementary (e.g. Coincraft Cove) |
| **(B) Teens** | 12–17, self-directed | Relevant scenarios (jobs, cards, goals) without lecture tone | Middle / high school |
| **(C) Classroom / teachers** | Grades 3–12 educators | Standards-aligned quests, session length control, no ads/data surprises | All tiers + class codes (later) |
| **(D) Solo adults** | 18+ casual learners | Practical decisions (budget, investing basics) in short sessions | Adult / startup themes |

**Positioning:** One base game, age-appropriate tone via learning profiles and content packs — not four separate apps.

---

## Paid model hypothesis

| Layer | What | Rules |
|-------|------|--------|
| **Base (premium)** | Hub + first island + core loop, save, accessibility, parental view | One-time or annual license; full tutorial path included |
| **Expansion islands** | Themed packs (e.g. Paycheck Peninsula, Signal City) | Optional DLC; new quests/minigames/NPCs only |
| **Never** | Pay-to-win | No paid currency, stat boosts, or skipping learning outcomes |

**Validation signals:** Expansion attach rate after base completion; refund rate; teacher quote on “no monetized pressure on kids.”

---

## Core loop

```
Hub (pick island / profile)
  → Travel (map + unlock gates)
    → Explore (areas, items, economy weather)
      → NPC quests (dialogue choices → consequences)
        → Minigames (skill check + fail/retry)
          → Rewards (coins, XP, items, badge)
            → Unlock (next area, island, or expansion)
```

**Session target:** 10–15 min (families), 20–30 min (teens/adults). Return hook: unfinished quest + “what if” replay.

---

## Three pillars

### 1. Adventure-first learning
Financial concepts are **quests in a place**, not worksheets with sprites. Every island has a learning kernel (Jump$tart / CEE aligned), original theme/verb/structure per [ip-safe-design.md](./ip-safe-design.md), and NPCs who react to player choices.

### 2. Decisions have consequences
Dialogue branches, quest failure/retry, economy weather, and **decision replay** (“why it happened”) make tradeoffs visible. Wrong answers cost time or coins, not shame — hints escalate, difficulty adapts.

### 3. Delightful juice
Motion, SFX, music stingers, collect feedback, and readable UI at every tier. Professional hub chrome; playful island tone. Accessibility (text size, reduced motion, difficulty) is part of delight, not an afterthought.

---

## Success metrics

| Metric | Definition | Target (vertical slice / beta) |
|--------|------------|--------------------------------|
| **D1 retention** | % returning within 24h of first island enter | ≥ 35% (families), ≥ 25% (solo) |
| **D7 retention** | % active 7 days after first session | ≥ 20% |
| **Quest completion** | % started quests that reach `quest_completed` | ≥ 70% per island quest chain |
| **Tutorial completion** | % completing hub onboarding + first quest objective | ≥ 80% |
| **Minigame completion** | `minigame_completed` / `minigame_started` | ≥ 75% |
| **Time to first quest** | Hub enter → `quest_started` | < 3 min median |
| **Replay engagement** | % sessions opening decision replay after quest | ≥ 30% (stretch) |

Instrument via existing Islands analytics (`island_entered`, `quest_*`, `minigame_*`, `dialogue_*`, `settings_changed`).

---

## Vertical slice definition

**One island polished to shipping quality:** **Coincraft Cove** (elementary / family tier).

**Shipping bar:**

| System | Done when |
|--------|-----------|
| **Content** | 3 areas, 4 NPCs, 2 quest chains, 1 minigame — playtested start-to-badge |
| **Audio** | Island ambient loop + UI/quest/minigame SFX; mute respects settings |
| **UI** | Hub → travel → island map → dialogue → minigame → reward flows without dead ends |
| **Save** | `IslandSaveV1` persists quests, items, coins, XP; survives refresh |
| **Replay** | Decision timeline + ReplayModal after quest/minigame with export |
| **Accessibility** | Text size, reduced motion, difficulty ramp; WCAG AA on primary flows |
| **Analytics** | Full funnel events + session id; teacher/parent can see completion % |
| **Quality** | E2E happy path green; content passes IP red-flag checklist |

**Out of slice:** Additional islands, multiplayer, class roster, store checkout.

**Island design:** New islands follow [island-design-process.md](./island-design-process.md) — each requires a [layout map](./islands/coincraft-cove/layout-map.md) and [quest pacing chart](./islands/coincraft-cove/quest-pacing-chart.md).

---

*Owner: Product / Design · Review: each milestone · Next doc: [production-plan-10-weeks.md](./production-plan-10-weeks.md)*
