# Autonomy Progression — Teaching Environment → Authentic Play

**Date:** 2026-08-17  
**Law:** Progression removes scaffolds only when **demonstrated player behavior** proves the underlying rule — never when a timer expires, a dialog is dismissed, or “Next” is clicked without action.  
**Financial integrity:** Tutorial surfaces use the **same production money rules** as Stage 6 unless a row in §Financial rule parity explicitly documents a temporary exception (none on the iconic spine today).  
**Companion docs:** `PROGRESSIVE_DISCLOSURE_DESIGN.md` · `TRANSFER_TASKS.md` · `FIRST_FINANCIAL_SCENARIO.md` · `FAILURE_RECOVERY.md` · `CONCEPT_CURRICULUM.md` · `iconic-path.md`

---

## Purpose

Capital must teach money concepts without training players to **memorize button sequences**. Autonomy progression is the spine-wide contract for how the game moves from **constrained discovery** (safe verbs, obvious affordances) to **normal simulation** (full Harbor · Cove → Paycheck → Credit loop with no training shell).

Two layers share the same six stages:

| Layer | What advances | Where stored |
|-------|---------------|--------------|
| **Global session arc** | Title → Ashore → Cove loop → Paycheck → Credit → free roam | `hubGuidedIntro`, quests, scars, `progressGates` |
| **Per-concept arc** | Each `concept_id` in curriculum | `conceptProgress.concepts[id].phase` |

Global stages gate *when* whole systems appear. Concept stages gate *when* coach chrome drops for each rule. Both require **proof predicates** — see §Transition proofs.

---

## Stage overview

```
STAGE 1  constrained discovery     Ashore chambers · Harbor meet · one verb at a time
    ↓ proof: plaza literacy + carpet boarded
STAGE 2  guided authentic scenario Cove First Coins · real EarnSpend · first Take
    ↓ proof: training success_condition (quest / irreversible / minigame)
STAGE 3  reduced-guidance variation Same rules · lighter coach · retry dignity
    ↓ proof: guided_success with self-correction or low hint load
STAGE 4  independent transfer      New surface · new numbers · no tutorial chrome
    ↓ proof: transfer_scenario_passed
STAGE 5  multiple valid goals      Mastery · digressions · stance diversity OK
    ↓ proof: mastery_condition or second-island irreversible with chosen strategy
STAGE 6  normal simulation         Full Capital — identical financial rules to endgame
```

Stage 6 is the **destination**, not a reward tier. Stages 1–5 exist only to earn the right to play Stage 6 without hand-holding.

---

## STAGE 1 — Constrained discovery

### What the player experiences

- **Ashore:** walk rings, Talk ring, organ poke gate, single painting on dock.  
- **Harbor meet:** Piggy front-and-center; one verb coached at a time (`hubGuidedIntro`: meet → walk → talk → dock → board).  
- **Spatial scaffolds:** pink nearTalk rings, muted CTAs until prior gate met, TouchWalkPad on coarse pointers.  
- **Money:** organ fantasy only — no wallet, no Take, no ledger yet.

### Active scaffolds

| Scaffold | Removed when |
|----------|--------------|
| Walk ring counter / emissive bob | All rings claimed **or** documented Esc skip |
| “Press E” vs “Walk to Piggy” split copy | Successful nearTalk to Piggy |
| Muted Continue / Launch until poke or board | Organ poke **or** Cove painting boarded |
| Single-verb coach overlay | `hubGuidedIntro.step === "done"` |

### Financial rules

**No financial simulation yet.** Verb literacy only. When money appears in Stage 2, it uses production modules — Stage 1 must not introduce a parallel “tutorial wallet.”

### Representative proofs (save evidence)

- `hubGuidedIntro.didDock === true`  
- `hubGuidedIntro.step === "done"` (or `guided_hub_done` in concept evidence)  
- `island_discovered` includes Cove (boarded, not merely Ashore painting seen)

---

## STAGE 2 — Guided authentic scenario

### What the player experiences

- **First real money loop:** `first_cove_footprint` — Cove EarnSpend, Coin Sort (`mg_coin_sort`), Keeper Kira Take.  
- **Production rules:** insufficient spend rejects with real “Not enough money!”; irreversible keys write to save; ledger holdings move cashflow.  
- **Full coach:** Coin Bag instruction, attention targets, quest chain (`q_cc_first_coins`, Cove Change), clear-at lines, footprint foreshadow on Take rows.  
- **Concept phase:** `GUIDED` for spine concepts (`earn_then_decide`, `save_vs_spend`, `money_is_alive`, …).

### Active scaffolds

| Scaffold | Purpose |
|----------|---------|
| Bag instruction + `attention_target` | Names the rule before the act |
| Quest waypoints / clear-at N+ | Makes the next verb obvious |
| Take footprint sublines | Perceptual literacy before commit |
| Escalating assist ladder (attempts 1–4) | Recovery without revealing optimal strategy |

### Financial rules

Identical to Stage 6 for every system touched:

- `EarnSpendModule.apply` — same wallet math  
- `ChangeMaking` / Coin Sort — same score / clear thresholds  
- `setIrreversible` + `harborScars` + `voyagerLedger.addHolding` — same footprint semantics  

**Forbidden:** tutorial-only discounts, fake irreversible flags, parallel tutorial ledger, waived insufficient-funds checks.

---

## STAGE 3 — Reduced-guidance variation

### What the player experiences

- **Same underlying rules** as Stage 2; **fewer** coach surfaces.  
- Bag tips appear on **fail-tier only** (attempt ≥ 2 per `FAILURE_RECOVERY.md`), not on every beat.  
- Valid **variations** within the training environment: Shelly digression, Soft Beat optional path, second earn job order, retry after Coin Sort fail — all using production math.  
- **Concept phase:** `REDUCED_GUIDANCE`; `guided_success` and `guided_attempts` stamped on entry.

### Active scaffolds

| Scaffold | Still present | Gone vs Stage 2 |
|----------|---------------|-------------------|
| Fail-tier Bag / amber strip | Yes | — |
| Proactive “do this next” on every screen | No | Removed |
| Attention pulse on idle | No | Removed |
| Retry stay-put + conceptual hints | Yes | Unchanged |

### Financial rules

**Unchanged from Stage 2.** Variation changes **context and numbers** (which job, which digression), not formulas.

---

## STAGE 4 — Independent transfer

### What the player experiences

- **New surface:** Paycheck vendor, Harbor deal, Credit wait/borrow — per `TRANSFER_TASKS.md` `ts_*` scenarios.  
- **New numbers:** different $ amounts, thresholds, obligations.  
- **No tutorial chrome:** no Cove module labels, no scripted quest arrow to the answer, no repeated button sequence from training.  
- **Multiple valid strategies** where documented (earn-first, skip spend, cheaper buy, wait vs borrow).  
- **Concept phase:** `INDEPENDENT`; transfer metrics recorded (`transfer_success`, `transfer_attempts`, `transfer_time`, `strategy_selected`).

### Active scaffolds

| Scaffold | Present? |
|----------|----------|
| Fail-tier hints only | Yes (attempt ≥ 2) |
| Training quest chain | No |
| Footprint preview on every choice | No (unless fail recovery) |
| Optimal-strategy reveal on attempt 1 | **Never** |

### Financial rules

**Unchanged.** Transfer scenarios are predicates over real save proofs — e.g. Paycheck irreversible keys, Credit borrow Take, mastery quiz grade — not a separate “transfer mode” economy.

---

## STAGE 5 — Multiple valid goals

### What the player experiences

- **No single golden path:** jar *or* treat, Shelly patience *or* impulse, protect *or* spend, wait *or* borrow — all count when they match documented valid paths.  
- **Mastery gates:** quizzes prove literacy without prescribing stance (`mastery_gate_cleared`).  
- **Digressions and side scars** do not block spine progress when main proof is met.  
- **Second-island Takes** (Paycheck Vee, Credit ordeal) with player-chosen strategy.  
- **Concept phase:** `MASTERED` when `mastery_condition` satisfied; `REVIEW_AVAILABLE` may re-open lighter coach without demoting mastery history.

### Active scaffolds

| Scaffold | Present? |
|----------|----------|
| Mastery quiz framing (“prove you read the board”) | Yes |
| Forced optimal stance | **No** |
| Coach re-entry on `REVIEW_AVAILABLE` | Yes — spaced remediation only |

### Financial rules

**Unchanged.** Mastery quizzes test reading production HUD / ledger / scenario boards — not alternate math.

---

## STAGE 6 — Normal simulation

### What the player experiences

**Indistinguishable from a veteran’s Capital session** for all financial systems:

- Harbor weather from cashflow · Freedom Seal chase · Paycheck inbox rhythm · Credit Spiral locks  
- Money Structure interiors · side shores (when unlocked) · Family Room local meta  
- Coin Bag: ambient quips + **failure recovery only** — not a step-by-step quest coach  
- No Ashore chamber replay · no forced ring UI · no training-only UI shells  

### Scaffolds

**None** except:

- Diegetic locks (`progressGates`, spiral lock copy) — these are **world rules**, not tutorials  
- `REVIEW_AVAILABLE` micro-coach when a late trigger fires (e.g. first APR inbox hours after `interest_compounds` became AVAILABLE)  
- Global accessibility affordances (TouchWalkPad, reduced motion) — not teaching shortcuts  

### Financial rules

This stage **is** the reference implementation. Stages 2–5 must not drift from:

| System | Source of truth |
|--------|-----------------|
| Earn / spend | `EarnSpendModule.ts` |
| Ledger / cashflow | `voyagerLedger` · HUD Income/Expenses |
| Harbor weather | `harborWeather` from net cashflow |
| Irreversible Takes | `irreversibleChoices` + scar + holding |
| Credit / interest | Credit island content + Soft Beat arms |
| Mastery | `masteryGate.ts` |

---

## Transition proofs (what justifies removing each scaffold)

**Global rule:** every transition requires at least one **action proof** from the table below. These proofs may be combined with `all_of` / `any_of` in the concept engine; they must never be replaced by elapsed time alone.

### 1 → 2 · Remove constrained discovery shell

| Demonstrated behavior | Proof signal | Forbidden sole trigger |
|----------------------|--------------|------------------------|
| Walked Ashore rings or accepted skip consequence | ring claims **or** Esc skip flag | Time in chamber |
| Talked to guide from near ring | `hubGuidedIntro` past `meet_guide` | Dialog Next without E |
| Boarded Cove painting | `carpetBoarded` / Cove discovered | Viewing painting only |
| Completed Harbor guided sequence | `guided_hub_done` | Map opened |

**Scaffold removed:** spatial rings as primary navigation coach; single-verb overlay; muted dock until board.

**Player shows:** can reach Cove under production carpet rules without arrow following.

---

### 2 → 3 · Remove proactive guided coach

| Demonstrated behavior | Proof signal | Forbidden sole trigger |
|----------------------|--------------|------------------------|
| Completed First Coins chain | `quest_completed: q_cc_first_coins` | Quest accepted only |
| Cleared Coin Sort with production threshold | `minigame_completed: mg_coin_sort` | Entering minigame |
| Committed first Cove Take (any valid stance) | `irreversible_set: cove_save_vs_spend` | Opening Kira dialog |
| Closed signature loop once | scar + chapter hush + Harbor return (implicit in scar/cove proofs) | Watching cutscene skip |

**Additional quality gate (per concept):**

- `guided_success === true` on transition to `REDUCED_GUIDANCE`  
- Final successful attempt did **not** rely solely on attempt-4 explicit button naming (`hints_used < maxHints` on success **or** success after self-initiated retry without new explicit tier)

**Scaffold removed:** always-on Bag instruction, attention_target pulse, proactive clear-at on success path.

**Player shows:** completes training scenario using the **rule** (earn → decide → Take sticks → Harbor remembers), not only the coached sequence.

---

### 3 → 4 · Remove training-environment variation shell

| Demonstrated behavior | Proof signal | Forbidden sole trigger |
|----------------------|--------------|------------------------|
| Succeeded in reduced-guidance window | concept `phase → REDUCED_GUIDANCE` with `guided_success` | Entering REDUCED phase |
| Self-corrected after fail | `quest_failed_attempt` then success without new explicit tier | Infinite retries with attempt-4 only |
| Optional: second variation in same rule family | digression scar **or** Soft Beat complete **or** second quest beat | — |

**Scaffold removed:** retry framing that names the training quest; variation stays on Cove/Harbor training set.

**Player shows:** applies the rule when the **next screen is not the same NPC chain** — ready for transfer surface.

---

### 4 → 5 · Remove transfer-task isolation

| Demonstrated behavior | Proof signal | Forbidden sole trigger |
|----------------------|--------------|------------------------|
| Passed primary transfer scenario | `transfer_scenario_passed: ts_*` / `conceptTransferPasses` | Visiting transfer island |
| Rule held in new context | transfer predicate (Paycheck irreversible, Credit borrow, mastery grade, etc.) | — |
| Strategy inferrable when multiple valid | `strategy_selected` populated when paths diverge | Random click through |

**Scaffold removed:** transfer scenario treated as isolated exam; coach assumes single path.

**Player shows:** succeeds on **alternate obligation / amount / UI** without training labels — see `TRANSFER_TASKS.md` principle table.

---

### 5 → 6 · Remove mastery / multi-goal framing shell

| Demonstrated behavior | Proof signal | Forbidden sole trigger |
|----------------------|--------------|------------------------|
| Spine concept mastery | `mastery_condition` for core ids **or** `phase === MASTERED` | Single quiz attempt |
| Second painting autonomy | Paycheck **or** Credit irreversible with chosen strategy | Island discovered only |
| Sustained play readiness | `freedom_seal` progress **or** Credit unlock gate cleared | Cash threshold alone |
| Global: iconic loop closed ≥ 2 times | Cove + Paycheck (or Credit) scars | One Take ever |

**Scaffold removed:** “training quest” framing; mastery quiz as gatekeeper UI; forced revisiting Cove coach.

**Player shows:** pursues **own goals** (seal, deal, borrow, digression) while financial systems respond with production consequences.

**Stage 6 entry is global:** when main-course progress (`mainCourse.ts`) treats the player as past FTUE — Harbor free roam, Bag non-coach mode, all spine islands reachable per `progressGates` — **without** changing any money formula.

---

## Forbidden transitions (hard no)

| Anti-pattern | Why |
|--------------|-----|
| Session age / `Date.now()` delta | Confuses presence with competence |
| Dialog dismiss / “Next” / “Got it” | Confuses reading with doing |
| Cutscene watched / skipped | Confuses spectacle with proof |
| Map opened / island seen | Confuses travel with mastery |
| Reduced tutorial difficulty (waive broke spend, fake ledger) | Teaches wrong rule; breaks Stage 6 parity |
| Forcing one “correct” stance to advance | Violates Stage 5 multi-goal contract |

Telemetry timestamps (`guidedEnteredAt`, `transferTimeMs`) are **measurement only** — never unlock predicates.

---

## Financial rule parity

| Stage | Rule set | Documented exception |
|-------|----------|----------------------|
| 1 | None (no wallet) | — |
| 2–6 | Production modules | **None on iconic spine** |
| Review / remediation | Production | Coach may reappear; math unchanged |

If a future beat requires a temporary simplification (e.g. era shore prototype), it must add a row here **before** shipping and must not gate Stage 6 entry.

---

## Mapping to concept phases

| Autonomy stage | Concept `phase` | Global spine anchor |
|----------------|-----------------|---------------------|
| 1 | (pre-concept / `LOCKED`) | Ashore + `hubGuidedIntro` |
| 2 | `GUIDED` | Cove First Coins + Take |
| 3 | `REDUCED_GUIDANCE` | Post-Take harbor loop, optional Soft Beat |
| 4 | `INDEPENDENT` | `transfer_scenario_passed` |
| 5 | `MASTERED` / `REVIEW_AVAILABLE` | Mastery gates, Paycheck/Credit Takes |
| 6 | Terminal — coach off | Freedom Seal · Credit · free roam |

`AVAILABLE` and `LOCKED` are **prerequisite gating**, not player-facing stages: a concept waits in `AVAILABLE` until its trigger fires, then enters Stage 2 for that concept id.

---

## Measurement (autonomy audit row)

Extend transfer metrics (`TRANSFER_TASKS.md`) with session-level fields when logging `concept_transfer` or a future `autonomy_stage` event:

| Field | Meaning |
|-------|---------|
| `autonomy_stage` | 1–6 global estimate |
| `concept_id` | Per-concept row when applicable |
| `proof_ids` | quest / scar / transfer scenario ids that fired |
| `hints_used` | Escalations consumed before transition |
| `strategy_selected` | When Stage 4–5 paths branch |

---

## Implementation hooks (existing)

| Stage transition | Code / save |
|------------------|-------------|
| 1 → 2 | `hubGuidedIntro` · `advanceHubGuided` · Cove `island_discovered` |
| 2 → 3 | `applyConceptSync` → `REDUCED_GUIDANCE` · `finalizeGuidedMetricsOnReduced` |
| 3 → 4 | `syncConceptTransferPasses` · `transfer_scenario_passed` predicate |
| 4 → 5 | `INDEPENDENT` → `MASTERED` via `mastery_condition` |
| 5 → 6 | `progressGates` · `hasHarborFreedom` · main-course chapter flags |

UI work deferred: attention chrome reads `getActiveGuidance()` — autonomy doc does not require new menus.

---

## Iconic freeze alignment

- Stages 1–6 deepen **Cove → Paycheck → Credit + Harbor** — no new outer islands for teaching.  
- Family Room stays local; no fake multiplayer coach.  
- Money Structure interiors are Stage 6 exploration depth, not Stage 1–2 gates.  
- Era-only concepts (`diversification`, `time_horizon`) enter at Stage 6 side shores — not a separate tutorial track.

---

## Success criterion

A cold player who reaches Stage 6 can:

1. Earn, spend, Take, and read Harbor consequences **without** being told which button to press next.  
2. Encounter a **new** Paycheck or Credit beat and apply a rule learned at Cove — not replay Cove’s button order.  
3. Trust that the wallet, ledger, and weather they see in minute ten use the **same math** as hour ten.

That is authentic Capital play. Stages 1–5 exist only to get there honestly.
