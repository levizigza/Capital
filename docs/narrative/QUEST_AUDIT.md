# Capital quest audit

**Date:** 2026-08-19  
**Scope:** Every `IslandQuest` in live `*.islands.json` plus parked demo. Harbor Haven JSON has **0** quests (runtime plaza / Talk / cinema).  
**Not included:** Minigame-internal scenario decks (`src/content/events/`), Family Room challenges, studio levels.

**Companions:** [QUEST_DESIGN_TEMPLATE.md](./QUEST_DESIGN_TEMPLATE.md) · [NARRATIVE_EVENT_ENGINE.md](./NARRATIVE_EVENT_ENGINE.md) · [PLAYER_VERB_MATRIX.md](../design/PLAYER_VERB_MATRIX.md)

**Law:** A strong quest should hit **≥3** of: CHARACTER · STORY · FINANCIAL SYSTEM · EXPLORATION · PLAYER IDENTITY · WORLD DEVELOPMENT · TRANSFERABLE LEARNING.

---

## Inventory

| Bucket | Count | Notes |
|--------|------:|-------|
| Live spine (Cove / Paycheck / Credit) | 9 | 3 main Change + 6 support/side |
| Live era side shores | 25 | Depth bar: ≥3 quests/island; many arcade-lane clones |
| Harbor Haven | 0 | Hub is not JSON-quest driven |
| Parked `demo.islands.json` | 2 | `starter_key_cove` — not in live loader |
| **Live total** | **34** | |

Objective verbs in data: `talkToNpc` · `collectItem` · `completeMinigame` only. Takes live in **dialogue effects**, not objective types.

---

## Flag legend

| Flag | Meaning |
|------|---------|
| **FETCH_QUEST** | Talk/collect chain whose only job is to unlock the next pad |
| **FAKE_CHOICE** | Dialogue exists but both branches equal, or no `setIrreversible` |
| **OBVIOUS_CORRECT_ANSWER** | One branch is pedagogically “right” with no cost |
| **EXPOSITION_DUMP** | Learn-by-NPC-lecture; world does not enact the concept |
| **NO_HUMAN_STAKES** | No character bears the cost of the choice |
| **NO_SYSTEM_INTERACTION** | Completing it does not change ledger, scar, weather, or unlocks |
| **NO_CONSEQUENCE** | Rewards are pouch/XP/badge only |
| **REPEATED_TEMPLATE** | Same “two talks + minigame + medallion” or “arcade lane: two toys” pattern |

XP in JSON rewards is **chrome** (`cutIslandsXpAwards` on product path) — treat XP as **not** a real consequence.

---

## Scorecard — live quests

Pillars: C character · S story · F financial system · E exploration · I identity · W world · T transfer. **n** = count of Y.

### Spine — Coincraft Cove

#### `q_cc_first_coins` · main · First Coins

| Field | Record |
|-------|--------|
| human_problem | Washed ashore; need a first earn before a real choice |
| financial_problem | Recognize denominations; pouch exists |
| dramatic_question | Can you earn fairly enough to *then* choose? |
| tradeoff | Weak — sorting is skill, not fork |
| characters | Captain Penny |
| systems_used | Talk, collect pouch, `mg_coin_sort` |
| locations | Coin Harbor |
| available_approaches | Talk, collect, play pad |
| immediate_consequence | Pouch + coins; quest progress |
| delayed_consequence | Enables Change quest |
| relationship_change | Talk memory with Penny |
| world_change | None beyond discovery |
| learning_value | Earn-then-decide setup |
| story_value | Story Circle “Need/Go” |

**Pillars:** C Y · S P · F P · E Y · I N · W N · T P → **n≈3** (CHARACTER, EXPLORATION, FINANCIAL setup)  
**Flags:** FETCH_QUEST (mild — necessary onramp). Not a fake Take.

---

#### `q_cc_save_or_spend` · main · Save or Spend?  ★ spine gold

| Field | Record |
|-------|--------|
| human_problem | Alma’s bench vs glitter; then Kira’s jar vs treat |
| financial_problem | Hold vs spend; leftover vs tab |
| dramatic_question | Which will Harbor keep? |
| tradeoff | Jar holding vs treat liability (real CF) |
| characters | Alma, Kira |
| systems_used | Talk, collect jar, `setIrreversible`, `addScar`, `spineTakeFootprints`, homecoming |
| locations | Craft Market, Savings Lighthouse, then Harbor |
| available_approaches | Hold jar · buy treat (dialogue) |
| immediate_consequence | Ledger footprint, hush |
| delayed_consequence | Spectacle, Plinth, Piggy, weather, side shores unlock |
| relationship_change | Kira/Alma stakes; Piggy names plaque |
| world_change | Harbor remembers; painting to Paycheck |
| learning_value | Irreversible Take; Coin organ |
| story_value | Island Change + campaign foldback |

**Pillars:** C S F E I W T — **n=7**  
**Flags:** none of the failure flags. **KEEP.**

---

#### `q_cc_shell_want` · side · Shell Want

| Field | Record |
|-------|--------|
| human_problem | Pretty shell vs need |
| financial_problem | Impulse vs need-first |
| dramatic_question | Will gossip follow the want? |
| tradeoff | Digression scar pair (authored) |
| characters | Shelly |
| systems_used | Talk, `addScar` (digression), shelf |
| locations | Craft Market |
| available_approaches | Need-first vs impulse (dialogue) |
| immediate_consequence | Side scar / gossip |
| delayed_consequence | Plaza rumor; must **not** steal Plinth |
| relationship_change | Shelly tone |
| world_change | Digression myth heard |
| learning_value | Want vs need (light) |
| story_value | Side circle, not Change |

**Pillars:** C S W — **n=3**  
**Flags:** none severe. **KEEP** as echo.

---

### Spine — Paycheck Peninsula

#### `q_pp_rainy_day` · main · Expect the Unexpected  ★ transfer gold

| Field | Record |
|-------|--------|
| human_problem | Two prices at Vee’s stall; rain vs sparkle |
| financial_problem | Buffer vs discretionary |
| dramatic_question | Shelter or glitter — and will Harbor notice? |
| tradeoff | Umbrella holding vs glitter tab |
| characters | Vendor Vee |
| systems_used | Talk Take, footprints, scar, homecoming |
| locations | Main Street stall |
| available_approaches | Protect · spend |
| immediate_consequence | Ledger + hush |
| delayed_consequence | Harbor felt (Clock); Credit still gated |
| relationship_change | Vee; Piggy (no Cove mapping) |
| world_change | Clock plaque |
| learning_value | **Independent transfer** surface |
| story_value | Second Change |

**Pillars:** C S F I W T — **n=6** (exploration light)  
**Flags:** none. **KEEP.** Must not gain EXPOSITION_DUMP tips that name Cove.

---

#### `q_pp_budget_basics` · side · Budget Basics

| Field | Record |
|-------|--------|
| human_problem | After stall, Clock buckets |
| financial_problem | Allocate a paycheck |
| dramatic_question | Weak — “stamp the buckets” |
| tradeoff | Budget split skill, not irreversible |
| characters | Pat, Priya |
| systems_used | Talk, collect paycheck, `mg_budget_split` |
| locations | Bureau / park |
| available_approaches | Play pad |
| immediate_consequence | Coins / planner item |
| delayed_consequence | Optional Clock literacy |
| relationship_change | Talk counts |
| world_change | None required |
| learning_value | Cashflow envelopes — **must stay post-Vee** |
| story_value | Support, not Change |

**Pillars:** C F T — **n=3** if ordered after Take; else spoils  
**Flags:** FETCH_QUEST (structure). Risk **OBVIOUS_CORRECT_ANSWER** on the splitter if one allocation is always scored best.

---

#### `q_pp_inbox_storm` · side · Inbox Storm

| Field | Record |
|-------|--------|
| human_problem | Overflowing money messages |
| financial_problem | Triage under time |
| dramatic_question | What do you open first? |
| tradeoff | Session scoring; optional scar path in some wiring |
| characters | Implied inbox senders (thin) |
| systems_used | `mg_inbox_storm` |
| locations | Peninsula (pad) |
| available_approaches | Minigame choices |
| immediate_consequence | Score, coins |
| delayed_consequence | Possible side scar |
| relationship_change | Weak |
| world_change | Weak |
| learning_value | Opportunity cost / attention |
| story_value | Toy |

**Pillars:** F E — **n=2**  
**Flags:** NO_HUMAN_STAKES (mild), NO_SYSTEM_INTERACTION if scar not wired.

---

### Spine — Credit Kingdom

#### `q_ck_first_recovery` · main · First Recovery  ★ ordeal

| Field | Record |
|-------|--------|
| human_problem | Canyon pressure; history vs haste |
| financial_problem | Interest, wait vs borrow |
| dramatic_question | Can you withstand the spiral without rushing? |
| tradeoff | Patience holding vs interest tab |
| characters | Archivist Cleo, Collector Rex |
| systems_used | Inbox pad, signal pad, Rex Talk Take, footprints, homecoming |
| locations | Gate, canyon, Keep |
| available_approaches | Practice then wait \| borrow |
| immediate_consequence | Take + ledger |
| delayed_consequence | Harbor spiral plaque |
| relationship_change | Rex as collector, not friend |
| world_change | Ordeal complete |
| learning_value | Interest compounds; new organ |
| story_value | Campaign boss beat |

**Pillars:** C S F E I W T — **n=7**  
**Flags:** none if quizzes stay ungated. **KEEP.**

---

#### `q_ck_collector_rumor` · side · Collector Rumor

| Field | Record |
|-------|--------|
| human_problem | Hear the pitch without feeding the Ordeal |
| financial_problem | Fear vs information |
| dramatic_question | Listen or lean? |
| tradeoff | Digression scar pair |
| characters | Debt Collector (side NPC) |
| systems_used | Talk, side scar |
| locations | Ruins |
| available_approaches | Dialogue fork |
| immediate_consequence | Gossip |
| delayed_consequence | Shelf myth |
| relationship_change | Tone |
| world_change | Digression only |
| learning_value | Light |
| story_value | Echo |

**Pillars:** C S W — **n=3**  
**Flags:** none severe.

---

#### `q_ck_score_practice` · side · Score Practice

| Field | Record |
|-------|--------|
| human_problem | Practice scanner without the Take |
| financial_problem | Score signals |
| dramatic_question | None |
| tradeoff | None |
| characters | None required |
| systems_used | `mg_ck_signal`, `mg_ck_compound` |
| locations | Ruins pads |
| available_approaches | Play toys |
| immediate_consequence | Coins |
| delayed_consequence | None |
| relationship_change | None |
| world_change | None |
| learning_value | Drill |
| story_value | Arcade |

**Pillars:** F E — **n=2**  
**Flags:** FETCH_QUEST, NO_HUMAN_STAKES, NO_CONSEQUENCE, **REPEATED_TEMPLATE** (arcade lane).

---

## Era side shores (pattern + exceptions)

Almost every outer island ships **two “curriculum” quests** (talk ×2 + minigame or collect) and **one `*_arcade_lane`** (two minigames, coins/XP). That is a **REPEATED_TEMPLATE**. Depth-bar tests require counts, not dramatic quality.

Shared flags for arcade lanes (`q_*_arcade_lane`, `q_sc_reef_arcade`, `q_fs_arcade_lane`, …):  
**FETCH_QUEST** · **NO_HUMAN_STAKES** · **NO_SYSTEM_INTERACTION** · **NO_CONSEQUENCE** · **REPEATED_TEMPLATE**. Pillars: E + sometimes F → **n≤2**. Fail strong-quest bar.

Curriculum quests below: all **side**, unlock after Cove Change.

### Phosphor Reef (`signal_city`)

| Id | human / financial | dramatic_question | tradeoff | characters | flags | n |
|----|-------------------|-------------------|----------|------------|-------|---|
| `q_sc_credit_101` | What is credit / scores | Will you earn a Market Pass? | Weak | Max, Cleo | EXPOSITION_DUMP, FETCH | 2 |
| `q_sc_first_portfolio` | Practice portfolio | Get into the tower | Weak | Ari, Blake | FETCH, FAKE_CHOICE | 2 |
| `q_sc_reef_arcade` | Toys | — | — | — | arcade template | 1 |

**Risk:** Credit 101 **before** Credit Kingdom spoils spiral (knowledge vs transfer). Gate or rewrite as rumor, not score lecture.

### Gridlock Galleria (`venture_foundry`)

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_vf_idea_to_plan` | Fern + Malik; plan item; startup budget pad | FETCH, EXPOSITION | 2 |
| `q_vf_pitch_and_grow` | Ike funds you — **OBVIOUS** if pitch always succeeds | FAKE_CHOICE risk | 2–3 if pitch can fail with dignity |
| `q_vf_arcade_lane` | arcade template | template | 1 |

### Budget Kart Coast (`financial_assets`)

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_portfolio_starter` | Paper trading | EXPOSITION, FETCH | 2 |
| `q_bonds_vs_stocks` | Nina + pad | EXPOSITION | 2 |
| `q_etf_detective` | Matching quiz-shaped | **OBVIOUS_CORRECT_ANSWER** | 2 |
| `q_fa_arcade_lane` | template | template | 1 |

### Digital Asset Atoll

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_wallet_setup` | Satoshi, Emma, mock exchange | FETCH, EXPOSITION | 2 |
| `q_volatility_lesson` | FOMO Fred vs Hodl Hannah — **could** be a real fork | FAKE_CHOICE if no scar/ledger | 2–3 |
| `q_da_arcade_lane` | includes Life Fork quiz | template + quiz | 1 |

### Diversify Keep (`business_assets`)

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_inventory_hustle` | Sam, Steve, cashflow sim | FETCH | 2 |
| `q_depreciation_101` | Amy, Tina, collect report | EXPOSITION_DUMP | 2 |
| `q_ba_arcade_lane` | template | template | 1 |

### Intangible Isle

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_ip_creator` | Iris, Leon, IP scenario | EXPOSITION | 2 |
| `q_brand_and_goodwill` | Ben, Maya, collect reports | EXPOSITION, FETCH | 2 |
| `q_in_arcade_lane` | template | template | 1 |

### Portfolio Skies (`future_shores`)

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_fs_claim_plot` | Talk + collect chalk | **FETCH_QUEST** poster child | 1 |
| `q_fs_weather_walk` | Weather Weaver, Dock Steward, diversify pad | CHARACTER light | 2 |
| `q_fs_arcade_lane` | template | template | 1 |

### Real Estate Row

| Id | Notes | flags | n |
|----|-------|-------|---|
| `q_auction_flip` | Auctioneer, flipper, auction pad | Could be F+E | 2 |
| `q_passive_income` | Landlord, REIT advisor, collect share | EXPOSITION | 2 |
| `q_re_arcade_lane` | template | template | 1 |

---

## Parked (not live)

| Id | Island | Flags |
|----|--------|-------|
| `q_start_here` | Key Cove demo | FETCH |
| `q_vault_visit` | Key Cove demo | FETCH |

Do not revive as main-course chips (iconic freeze).

---

## Harbor

No JSON quests. Runtime “quests” are hub guided steps (`meet_guide` → `to_dock`) — **not** `IslandQuest`. Do not double-count.

---

## Rollup

| Class | Live # | Typical n | Verdict |
|-------|-------:|----------:|---------|
| Spine Change (Cove / Paycheck / Credit) | 3 | 6–7 | **KEEP** — gold standard |
| Spine onramps / echos (first coins, shell, rumor, inbox, Pat buckets) | 6 | 2–3 | **IMPROVE** order & stakes |
| Era curriculum (talk-talk-pad) | 16 | 2 | **REBUILD** toward situations |
| Arcade lanes | 8 | 1 | **SIMPLIFY** — toys, not quests |
| Harbor JSON | 0 | — | **KEEP** hub as verbs |

**Strong-quest bar (≥3 pillars):** ~**8–10** live quests pass cleanly (3 Changes + shell + rumor + maybe volatility/weather/auction if given forks). **~24** fail the bar.

---

## Systemic issues (all era packs)

1. **REPEATED_TEMPLATE** — arcade lane + medallion curriculum. Depth tests measure count, not drama.  
2. **EXPOSITION_DUMP** — titles like “Depreciation & Write-offs,” “Credit 101.”  
3. **NO_CONSEQUENCE** — pouch/XP/badge; no scar, CF, or Harbor memory.  
4. **Transfer risk** — Signal City Credit 101 vs Credit Ordeal.  
5. **XP in rewards JSON** — fake language even if awards cut at runtime.

---

## Recommendations (design, not this PR)

- Treat arcade lanes as **SIDE_TOMFOOLERY** catalog entries, not quests.  
- Rebuild one era shore as a **Narrative Situation** (finite approaches + foldback + bounds).  
- Keep Pat/Priya **after** Vee.  
- Strip XP from quest JSON when touching packs.  
- Do not add more `q_*_arcade_lane` clones to hit depth bars — deepen the Change pattern instead.
