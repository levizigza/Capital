# Capital — Concept Mastery Pedagogy

**Status:** Design law for foundational financial concepts  
**King KPI:** Independent Transfer (`docs/ftue/NORTH_STAR.md`)  
**Runtime:** `src/islands/conceptProgression/*` · transfer stamps · `docs/ftue/PROGRESSIVE_DISCLOSURE_DESIGN.md` · `CONCEPT_CURRICULUM.md` · `TRANSFER_TASKS.md`  
**Companions:** `DECISION_PREVIEW_ARCHITECTURE.md` · `CAUSAL_TIME_SYSTEM.md` · `MECHANICS_NARRATIVE_MATRIX.md` · `CAPITAL_DESIGN_CONSTITUTION.md`

**Hard law:** Do **not** classify a concept as **MASTERED** because the player clicked through an explanation, dismissed a tip, watched a cutscene, or finished a tutorial checklist. Mastery requires **independent transfer proof**.

---

## 1. Six-step teach loop (required)

For every foundational financial concept:

| Step | Name | Player experience | Proof (not chrome) |
|------|------|-------------------|--------------------|
| **1** | Teach through a **decision** | Faced with a consequential fork (Take, deal, Wait) — not a paragraph | Decision committed → save writes (irreversible, scar, holding, …) |
| **2** | Allow **consequence** | World spends options (CF, scar, weather, obligation) | Causal NOW/SOON effects fire |
| **3** | Concise **causal feedback** | Piggy / Plinth / Pay Day / preview because-line | One kid sentence; BECAUSE edge |
| **4** | **Another situation** | Same principle, **changed surface** (new island, NPC, numbers, organ sister) | Transfer scenario id; no “this is the Take” labeling |
| **5** | **Remove guidance** | Coin Bag / coach silent on the answer; no attention pulse on correct option | Phase → REDUCED then transfer window without instruction |
| **6** | Test **independent transfer** | Player decides correctly (or validly) without being told | `transfer_task` / scenario pass → INDEPENDENT; mastery_condition → MASTERED |

```
DECISION → CONSEQUENCE → CAUSAL FEEDBACK
        → ANALOGOUS SITUATION (new surface)
        → NO GUIDE
        → INDEPENDENT TRANSFER PROOF
        → (only then) MASTERED
```

Clicking Next / “Got it” / Esc on a tip may advance **UI**, never **MASTERED**.

---

## 2. Stored metrics (per `concept_id`)

Persist on the save (concept progression runtime). **Canonical store names** and export aliases:

| Required field (brief) | Store / export | Meaning |
|------------------------|----------------|---------|
| `concept_id` | `concept_id` | Stable id from curriculum/registry |
| `guided_success` | `guidedSuccess` → export `guided_success` | Guided practice decision+consequence succeeded (→ REDUCED_GUIDANCE) |
| `attempt_count` | `guidedAttempts` / `attempts` → export `guided_attempts` | How many times guided practice was attempted |
| `hint_count` | `hintsUsed` → export `hints_used` | Hints consumed under hint_policy |
| `independent_transfer_success` | `transferSuccess` → export `transfer_success` | Transfer scenario passed **without** answer-coaching |
| `transfer_attempts` | `transferAttempts` → export `transfer_attempts` | Tries inside transfer window |
| `transfer_time` | `transferTimeMs` → export `transfer_time` | Duration of transfer window (ms) until success or abandon |

Optional but useful (already in runtime): `strategy_selected`, `transferScenarioId`, `masteredAt`, phase.

**Analytics / Settings export** must emit the brief’s field names (`ConceptTransferMetrics` in `transferMetrics.ts`).

### What must never set `independent_transfer_success` or MASTERED

- Tip dismiss / “Continue” / Ashore beat tick alone  
- Watching spectacle or trailer  
- Mastery **quiz** click-through without the concept’s transfer predicate (quizzes may feed *other* evidence, never sole MASTERED for judgment concepts)  
- Timer elapsed  
- Coach instruction shown  

---

## 3. Phase machine (aligned)

```
LOCKED → AVAILABLE → GUIDED → REDUCED_GUIDANCE → INDEPENDENT → MASTERED
                         ↘ failures / hints ↗        ↘ REVIEW_AVAILABLE
```

| Phase | Allowed after | Forbidden shortcut |
|-------|---------------|--------------------|
| GUIDED | Trigger proof (real play) | Opening a lore modal |
| REDUCED_GUIDANCE | `guided_success` from **decision proof** | Reading instruction twice |
| INDEPENDENT | Transfer scenario pass (`independent_transfer_success`) | Same surface as guided with Bag pointing at answer |
| MASTERED | `mastery_condition` over **transfer + lasting evidence** | Explanation complete |

`REVIEW_AVAILABLE` may re-enter GUIDED/REDUCED without erasing prior transfer history.

---

## 4. Foundational concepts — loop recipes

Only spine-aligned foundations (iconic freeze). Each row is the **minimum** six-step binding. Full catalog: `CONCEPT_CURRICULUM.md` · registry `conceptProgression/registry.ts`.

### 4.1 Core judgment

| concept_id | 1 Decision | 2 Consequence | 3 Feedback | 4 New surface | 5–6 Transfer |
|------------|------------|---------------|------------|---------------|--------------|
| `save_vs_spend` | Cove jar vs treat | CF ±5/mo + scar | Hush · Plinth · Piggy | Paycheck protect vs glitter (no Cove labels) | No Bag answer → Vee commit |
| `irreversible_take` | Any spine Take | Irreversible key | “Can’t undo” cinema | Later organ Take | Prove commit without coach |
| `harbor_scar_memory` | Take → home | Spectacle · Plinth | “Harbor felt that” | Day-2 echo / local names plaque | Visit/recognize without tip |
| `earn_then_decide` | Cove earn then Take | Coins then fork | Bag/Piggy order | Later shore earn→fork | No “earn first” toast |
| `cashflow` | Deal Accept / Wait | Holding + Pay Day | Ledger keep/drain · Pay Day cite | New deal shape / weather band | Choose under scarcity unaided |
| `opportunity_cost` | Take or Wait | Fork blocks other plaque/offer | “Instead of…” preview | Deal Wait vs Accept | Wait when rational without tip |
| `needs_vs_wants` | Shell Want digression | Scar patience/impulse | Short Piggy/local | Later digression | Unaided |
| `wait_vs_borrow` / `patience_vs_haste` | Credit fork | Scar ± weather | Spiral feedback line | Analogous pressure without “this is Credit Take” | Unaided |
| `debt` / `liabilities` | Liability / treat tab | Owes drain | Obligation vocabulary | Debt Trap or Credit pressure | Identify Owes without coach |
| `assets` / `investment` | Jar/booth Accept | +N/mo Holds | Deal preview CERTAIN | Another asset offer | Unaided Accept/Wait |
| `income` / `expenses` | Pay Day after holdings | Pouch settlement | keeps vs drains breakdown | Later Pay Day composition | Read HUD unaided |
| `liquidity` | Spend vs buffer | Cash after | On-hand band | Opportunity under storm | Preserve buffer without tip |
| `risk` | Credit haste or storm | Risk chip · sky | ESTIMATED preview | New pressure surface | Choose wait/haste unaided |
| `interest_compounds` | Soft Beat / Keep content | Authored lasting effect | Organ spiral line | Later spiral situation | Transfer scenario |
| `money_is_alive` | Organ poke + first Take footprint | World marks choice | Kid organ sentence | Any later Take→Harbor | Plaque without fantasy lecture |

### 4.2 Verb literacy (supporting)

| concept_id | Decision-shaped proof |
|------------|----------------------|
| `walk_talk` | Near+E Talk (not explanation) |
| `carpet_voyage` | Board Carpet to real island |

These still use attempt/hint/transfer fields; mastery ≠ “saw the hint.”

---

## 5. Guidance removal rules (step 5)

During transfer window:

| Allowed | Forbidden |
|---------|-----------|
| Place UI (Cash, CF if unlocked) | Coin Bag naming the correct option |
| Decision Preview numbers (CERTAIN/ESTIMATED) | “Pick jar like last time” |
| Soft presence Piggy wave | Castle coach on the transfer NPC |
| Esc / Leave | Pulsing highlight on the right choice |

Recording: if Bag/coach pointed at the answer, **do not** count `independent_transfer_success` (treat as guided attempt or void).

---

## 6. Independent transfer test design

| Property | Requirement |
|----------|-------------|
| Surface change | Different island and/or NPC and/or numbers and/or organ sister |
| Same principle | Curriculum `transfer` intent |
| No mapping copy | No “this is your Cove choice again” |
| Valid strategies | May allow >1 rational option; score principle, not one pixel |
| Timing | `transfer_time` from window open to proof |
| Failures | Increment `transfer_attempts`; dignity Retry; stay put |

King KPI: rate of `independent_transfer_success` over players who achieved `guided_success` — **not** FTUE completion rate.

---

## 7. Mastery condition pattern

```text
MASTERED only if:
  independent_transfer_success == true
  AND mastery_condition(evidence)   // lasting scar/CF/quest/transfer pass
  AND NOT solely (tip_dismissed | cinematic_done | quiz_clicked)
```

Example `save_vs_spend`: transfer pass on Paycheck fork **and** Cove irreversible present (guided proof existed). Quiz clear alone ≠ MASTERED.

---

## 8. Authoring checklist (per concept)

- [ ] Step 1 is a real decision with save write  
- [ ] Step 2 has mechanical consequence  
- [ ] Step 3 has ≤1 causal sentence  
- [ ] Step 4 names a different surface (scenario id)  
- [ ] Step 5 defines what guidance is stripped  
- [ ] Step 6 predicate cannot pass on explanation click  
- [ ] Metrics fields wired on transitions  
- [ ] Export uses brief field names  

---

## 9. Relation to existing code

| Doc requirement | Code touchpoint |
|-----------------|-----------------|
| Six-step loop | Registry defs + transfer scenarios + cinema/Piggy |
| Stored fields | `ConceptRuntimeEntry` + `ConceptTransferMetrics` |
| No click-mastery | `evalPredicate` / evidence builders — never `tip_seen` |
| Transfer window | `noteTransferAttempt` · `stampIndependentTransferWindows` |

Gaps vs ideal pedagogy (track in DESIGN_DEBT): some concepts still lean on quiz evidence; Paycheck CF MEANINGLESS weakens `save_vs_spend` transfer purity — fix sim/stakes, don’t fake MASTERED.

---

## 10. Success criteria

1. Designers cannot mark MASTERED in content by adding a “Next” button.  
2. Telemetry can compute ITR from stored fields alone.  
3. Playtesters who only skip tips do not show `independent_transfer_success`.  
4. Players who jar at Cove and correctly decide under new Paycheck/Credit surfaces without coaching do.

---

## 11. Non-goals

- Replacing Piggy presence with a concept textbook  
- Showing phase names (`GUIDED`, `MASTERED`) to players  
- Widening map to create transfer surfaces  
- Generative “explanation” as proof
