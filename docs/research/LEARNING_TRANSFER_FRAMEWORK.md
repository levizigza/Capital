# Capital — Learning Transfer Framework

**Status:** Research architecture for measuring **financial reasoning transfer** — not worksheet completion  
**King metric:** **INDEPENDENT_FINANCIAL_TRANSFER_RATE (IFTR)**  
**Law:** Quizzes, tip dismissals, and tutorial shell completion are **diagnostic at best** — never primary success signals for judgment concepts.  
**Companions:** [NORTH_STAR.md](../ftue/NORTH_STAR.md) · [CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md) · [TRANSFER_TASKS.md](../ftue/TRANSFER_TASKS.md) · [LEARNING_TELEMETRY.md](../design/LEARNING_TELEMETRY.md) · [FTUE_TELEMETRY.md](../ftue/FTUE_TELEMETRY.md) · [REFLECTION_SYSTEM.md](../design/REFLECTION_SYSTEM.md) · [AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md) · [ANECDOTE_SYSTEM.md](./ANECDOTE_SYSTEM.md)

---

## 1. Purpose

Capital teaches money through **decisions under constraints**. Learning measurement must answer:

> After the world taught a principle once, can the player **reason with it again** — in a new place, with new numbers, without being told what to do?

This framework defines **what to track per financial principle**, how to compute **IFTR**, and which **secondary metrics** guard against false wins (quiz grinding, hint addiction, button memory).

**Ship question:** Does this change raise IFTR (or protect it) without harming failure recovery, accessibility, or voluntary continuation?

If it only raises tutorial completion or quiz clears — **do not ship as a win**.

---

## 2. Design stance: not quiz-optimized

| Optimizes for (yes) | Does not optimize for (no) |
|---------------------|----------------------------|
| Independent application on **materially different** surfaces | Mastery quiz click-through |
| Causal understanding tied to **simulation state** | “Got it” / Next button memory |
| Strategy that **adapts** when context changes | Single-path choice grinding |
| Recovery after **dignified failure** | Zero-fail tutorial theater |
| Player **chooses** to continue after transfer proof | Forced checklist completion |

### Quiz role (explicitly bounded)

Mastery quizzes and digression worksheets may supply **secondary evidence** (e.g. `coin_denominations`, perceptual drills). They **must not**:

- Solely set `MASTERED` for **judgment** concepts (`save_vs_spend`, `wait_vs_borrow`, `opportunity_cost`, …)
- Substitute for a transfer scenario pass
- Inflate IFTR denominators without a real **initial encounter** decision

See [CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md) §2 — forbidden shortcuts.

---

## 3. Per-principle learning stages

Every foundational `concept_id` in [CONCEPT_CURRICULUM.md](../ftue/CONCEPT_CURRICULUM.md) is tracked through **five stages**. Stages are **ordered evidence**, not UI labels shown to players.

```
INITIAL ENCOUNTER → GUIDED USE → INDEPENDENT USE
        → DIFFERENT-CONTEXT USE → DELAYED REUSE
```

| Stage | Code | Definition | Proof (simulation-backed) | Typical Capital beat |
|-------|------|------------|---------------------------|----------------------|
| **1. Initial encounter** | `ENCOUNTER` | Player faces the principle in a **consequential decision** for the first time | `decision_committed` + save write (irreversible, holding, scar) | Cove jar vs treat |
| **2. Guided use** | `GUIDED` | Player applies the principle **with scaffolding** (coach, footprint, chamber, preview coaching) | `guided_success` · `concept_practiced` · phase → REDUCED_GUIDANCE | Cove quest with Bag verb hints |
| **3. Independent use** | `INDEPENDENT_SAME_FAMILY` | Player applies correctly **without explicit assistance** on a **training-family** surface (guidance stripped, same island arc or reduced coach) | Decision pass with `transfer_spoiled=false` and no answer-coaching; may precede full transfer | Cove replay / reduced Bag; pre-transfer beat with pulses off |
| **4. Different-context use** | `TRANSFER` | Player correctly applies principle on a **materially different** problem — new island/NPC/numbers/organ — **no explicit assistance** | `transfer_success` · `independent_transfer_success` · scenario pass in `conceptTransferPasses` | Paycheck umbrella vs glitter |
| **5. Delayed reuse** | `DELAYED_REUSE` | Player applies principle **later** (new session, day-key gap, or downstream system) without re-teach | Predicate on delayed scenario id + no re-intro coach; e.g. day-2 scar echo, later Pay Day, Credit analog | Day-2 Plinth · second Pay Day · Credit wait/haste |

### Stage dependency (measurement logic)

```text
ENCOUNTER is required before any later stage counts.
GUIDED requires ENCOUNTER.
INDEPENDENT_SAME_FAMILY requires GUIDED (or authored equivalent decision proof).
TRANSFER requires GUIDED and is the IFTR numerator event.
DELAYED_REUSE requires TRANSFER (or strong transfer proxy) for longitudinal KPIs.
```

**Important:** Stage 3 and Stage 4 both mean “without explicit assistance.” Stage 4 adds the **material surface change** required for IFTR. Stage 3 is an **on-ramp signal** (scaffolding actually came off) — not a substitute for transfer.

### Mapping to concept phase machine

| Phase (`conceptProgression`) | Framework stages active |
|------------------------------|-------------------------|
| `AVAILABLE` → `GUIDED` | ENCOUNTER → GUIDED |
| `REDUCED_GUIDANCE` | INDEPENDENT_SAME_FAMILY window opens |
| `INDEPENDENT` | TRANSFER achieved |
| `MASTERED` | TRANSFER + `mastery_condition` + optional DELAYED_REUSE |
| `REVIEW_AVAILABLE` | May re-enter GUIDED without erasing TRANSFER history |

---

## 4. King metric: INDEPENDENT_FINANCIAL_TRANSFER_RATE (IFTR)

### Definition

> **INDEPENDENT_FINANCIAL_TRANSFER_RATE (IFTR)** — for a given financial principle (`concept_id`), the **percentage of players** who **correctly apply** that principle to a **materially different problem** **without explicit assistance**, among players who previously **encountered** the principle in training.

Formally:

```text
IFTR(concept_id) =
  |{ players p :
      p has transfer_success(concept_id) == true
      AND p.transfer_spoiled(concept_id) == false
      AND p.guided_success(concept_id) == true
    }|
  ─────────────────────────────────────────────────────────
  |{ players p :
      p has guided_success(concept_id) == true
      OR p has encounter_proof(concept_id) == true
    }|
```

**Session-level aggregate (existing code):** `independent_transfer_rate` in `src/islands/analytics/ftue/metrics.ts` computes `transfer_success` events ÷ max(`transfer_started`, `transfer_success`) across sessions. Treat that as a **fast local proxy** for cohort dashboards. **IFTR(concept_id)** is the **principle-level cohort metric** this document canonizes.

### Numerator requirements (all must hold)

| Requirement | Meaning |
|-------------|---------|
| **Previously encountered** | `guided_success` or valid `encounter_proof` on training surface |
| **Materially different problem** | Transfer scenario id with different island and/or NPC and/or numbers and/or organ sister ([TRANSFER_TASKS.md](../ftue/TRANSFER_TASKS.md)) |
| **Correct application** | `success_predicate` passes on save evidence — principle satisfied, not one pixel only |
| **Without explicit assistance** | No answer-coaching during transfer window: no Bag/coach naming option, no transfer spoiler, no pulse on correct branch ([AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md)) |

### Denominator

Players who reached **guided training proof** (`guided_success`) for that `concept_id`. Optionally report a secondary rate using **encounter-only** denominator for early cohort diagnostics — label it **`IFTR_encounter_denom`**, never replace primary IFTR.

### Valid strategies

IFTR counts **principle satisfaction**, not a single branch id when multiple rational options exist (e.g. Wait vs Accept under opportunity cost). Record `strategy_selected` for adaptation analysis.

### What IFTR excludes

| Signal | Why excluded |
|--------|--------------|
| Quiz clear alone | Worksheet memory |
| Tip dismiss / “Continue” | UI advance |
| Spectacle / cutscene watch | No decision proof |
| Coach named answer | `transfer_spoiled` |
| Same surface + same NPC + same numbers | Button memory, not transfer |

### Example — `save_vs_spend`

| | Training | Transfer (IFTR event) |
|--|----------|------------------------|
| Surface | Cove Kira Take | Paycheck Vee stall |
| Numbers | Jar/treat CF deltas | Umbrella/glitter prices |
| Mapping copy | None | **None** (“remember Cove” forbidden) |
| Pass | `guided_success` after Cove commit | `transfer_success` on `ts_save_spend_pp_umbrella` without spoiler |

---

## 5. Secondary metrics (guardrails)

These metrics **do not replace IFTR**. They explain **how** players learn and whether scaffolding is healthy.

### 5.1 `causal_explanation_accuracy`

**Question:** When the player explains *why* something happened, do they match **simulation truth**?

| Source | Measurement |
|--------|-------------|
| Reflection Whisper P2 chips ([REFLECTION_SYSTEM.md](../design/REFLECTION_SYSTEM.md)) | Share of selected chips consistent with causal graph / ledger |
| Why? / Bag `CAUSAL_EXPLANATION` follow-ups | Optional post-hoc rubric on offered because-lines vs state pack |
| Fail overlay “Why did that happen?” | Correct rule identification after failure |

```text
causal_explanation_accuracy(concept_id) =
  correct_causal_selections / causal_prompts_answered
```

**Correct** = selected explanation cites the same **mechanism** as authored causal edge (keep/drain, irreversible, wait/shelter, …) with correct certainty (KNOWN/ESTIMATED). **Unknown** chip is valid when preview tag is UNKNOWN.

**Not mastery:** High accuracy alone does **not** set MASTERED — transfer still required.

---

### 5.2 `hint_dependency`

**Question:** Is the player relying on the guide to decide?

```text
hint_dependency(concept_id) =
  decisions_with_hint_or_why_before_commit / decisions_in_concept_window
```

| Inputs | Events / fields |
|--------|-----------------|
| Hints | `hint_offered`, `hint_used`, `hint_requested`, `ai_intervention` |
| Windows | From `concept_introduced` through transfer attempt |
| Rolling score | Guide policy `hint_dependency` ([AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md)) |

**Healthy band (hypothesis):** Pre-transfer hint use in **< 40%** of first-hour sessions ([CAPITAL_FIRST_HOUR.md](../ftue/CAPITAL_FIRST_HOUR.md)); post-transfer **decay** toward baseline.

**Red flag:** Rising hint_dependency **with flat IFTR** → scaffolding not fading.

---

### 5.3 `failure_recovery`

**Question:** After a dignified fail, does the player recover and continue reasoning?

```text
failure_recovery(concept_id) =
  recoveries_after_concept_fail / concept_failures
```

| Inputs | Events |
|--------|--------|
| Fail | `failure_occurred` / `failure` with `concept_id` or quest tie |
| Recovery | `retry_successful` / `recovery` within same session or before next decision |

**Global proxy (shipped):** `failure_recovery_rate` in `metrics.ts` = all recoveries ÷ all failures.

**Principle-level:** Filter by `concept_id` segment on FTUE events.

**Guardrail:** FTUE changes must not **lower** failure recovery while chasing IFTR (teaching through shame or hard softlock).

---

### 5.4 `strategy_adaptation`

**Question:** When context changes, does the player **adjust** strategy — not repeat one button?

```text
strategy_adaptation(concept_id) =
  share of players with ≥2 distinct strategy_selected values
  across GUIDED + TRANSFER + DELAYED_REUSE surfaces
  where both choices were principle-valid OR second followed context-appropriate shift
```

| Inputs | Fields / events |
|--------|-----------------|
| Strategy ids | `strategy_selected`, irreversible `choiceId`, export from `transferMetrics.ts` |
| Changes | `decision_changed` before commit |
| Context shift | Different scenario id or weather/CF band |

**Interpretation:**

- **High adaptation + high IFTR** → flexible reasoning (desired for opportunity cost, liquidity).
- **Zero adaptation + high IFTR** → may be one-strategy grind — inspect scenario validity.
- **Adaptation after fail** → recovery learning signal (pair with `failure_recovery`).

Related: `strategy_diversity` in [LEARNING_TELEMETRY.md](../design/LEARNING_TELEMETRY.md) (unique `choiceId` ÷ decisions) — session-level cousin.

---

### 5.5 `voluntary_continuation_after_transfer`

**Question:** After proving transfer, does the player **choose** to keep playing — not exit because homework ended?

```text
voluntary_continuation_after_transfer(concept_id) =
  |{ sessions s :
      s has transfer_success(concept_id)
      AND s has player_initiated_voyage_or_decision within T ms
      without quest_waypoint_click
    }|
  ─────────────────────────────────────────
  |{ sessions s : s has transfer_success(concept_id) }|
```

| Proof signal | Event / save |
|--------------|------------|
| Freeplay | `freeplay_entered` / `freeplay_started` |
| Voluntary voyage | `decision_committed` on non-training island id |
| Discovery | `discovered.islands` adds id beyond training shore |
| Anti-proof | Forced quest arrow click only → does **not** count |

**First-hour target (hypothesis):** ≥ **70%** of transfer-success sessions ([CAPITAL_FIRST_HOUR.md](../ftue/CAPITAL_FIRST_HOUR.md)).

**Why it matters:** IFTR without continuation suggests **worksheet completion feel** — player leaves after “lesson done.”

---

## 6. Per-principle record schema

Persist on save (extends `ConceptRuntimeEntry` + export). Principle-level IFTR cohorts aggregate these fields.

```text
ConceptLearningRecord {
  concept_id: string

  // Stage timestamps (ISO)
  encountered_at?: string
  guided_success_at?: string
  independent_same_family_at?: string
  transfer_success_at?: string
  delayed_reuse_at?: string

  // Stage booleans
  encounter_proof: boolean      // decision write on training surface
  guided_success: boolean
  independent_same_family: boolean
  transfer_success: boolean     // IFTR numerator
  delayed_reuse: boolean
  transfer_spoiled: boolean     // voids IFTR numerator

  // Counts
  guided_attempts: number
  transfer_attempts: number
  hints_used: number
  failures: number
  recoveries: number
  causal_prompts_answered: number
  causal_selections_correct: number

  // Strategy
  strategy_selected?: string
  strategy_history: string[]    // distinct ids in order

  // Timing
  transfer_time_ms?: number
  time_encounter_to_transfer_ms?: number
  time_transfer_to_delayed_reuse_ms?: number

  // Continuation
  voluntary_continuation_after_transfer?: boolean
}
```

**Export alias:** Maps to existing `ConceptTransferMetrics` in `transferMetrics.ts` plus extensions marked optional until wired.

---

## 7. Event → stage mapping

Minimum telemetry spine ([FTUE_TELEMETRY.md](../ftue/FTUE_TELEMETRY.md), [LEARNING_TELEMETRY.md](../design/LEARNING_TELEMETRY.md)):

| Event | Stage / metric |
|-------|----------------|
| `concept_introduced` | ENCOUNTER window opens |
| `decision_presented` / `decision_committed` | ENCOUNTER proof |
| `consequence_displayed` | ENCOUNTER consequence |
| `concept_practiced` | GUIDED → REDUCED |
| `guided_success` (implicit via phase) | GUIDED complete |
| `guidance_reduced` | INDEPENDENT_SAME_FAMILY window |
| `transfer_started` | TRANSFER attempt |
| `transfer_success` | TRANSFER pass → **IFTR numerator** |
| `transfer_failure` | TRANSFER attempt fail |
| `hint_*` / `ai_intervention` | hint_dependency |
| `failure` / `recovery` | failure_recovery |
| `decision_changed` | strategy_adaptation |
| `reflection_*` + chip ids | causal_explanation_accuracy |
| `freeplay_entered` + later commit | voluntary_continuation_after_transfer |
| Delayed scenario pass | DELAYED_REUSE |

**Segment every event:** `concept_id`, `scenario_id`, `transfer_spoiled`, `ftue_version`, `experiment_variant`.

---

## 8. Cohort reporting template

For each spine principle in a playtest cohort (`n ≥ 5` human for ship decisions — [INDEPENDENT_TRANSFER_PLAYTEST.md](../ftue/INDEPENDENT_TRANSFER_PLAYTEST.md)):

| Report row | Formula |
|------------|---------|
| **IFTR** | §4 |
| Median `time_encounter_to_transfer_ms` | Efficiency |
| `hint_dependency` median | Scaffold load |
| `failure_recovery` | Resilience |
| `causal_explanation_accuracy` | Understanding (secondary) |
| `strategy_adaptation` rate | Flexibility |
| `voluntary_continuation_after_transfer` | Motivation |
| `tutorial_completion_rate` | **Diagnostic only — footnote** |
| Quiz pass rate | **Diagnostic only — footnote** |

### Experiment guardrails ([FTUE_EXPERIMENTATION.md](../ftue/FTUE_EXPERIMENTATION.md))

Primary: **`independent_transfer_rate` / IFTR**  
Guardrails: `failure_recovery_rate`, `hint_dependency`, `freeplay_conversion`, `voluntary_continuation_after_transfer`

Never auto-ship a variant that raises quiz completion but **flat or falling IFTR**.

---

## 9. Principle catalog (measurement binding)

Each row must name **all five stages** in content. Full scenario ids: [TRANSFER_TASKS.md](../ftue/TRANSFER_TASKS.md).

| concept_id | ENCOUNTER | GUIDED | INDEPENDENT (same family) | TRANSFER (IFTR) | DELAYED REUSE |
|------------|-----------|--------|---------------------------|-----------------|---------------|
| `save_vs_spend` | Cove Take | Cove quest + Bag | Reduced Bag Cove | `ts_save_spend_pp_umbrella` | Later Pay Day under scarcity |
| `wait_vs_borrow` | Credit Take | Credit graph + scanner | Reduced coach Credit | Analog pressure scenario | Storm + second Credit beat |
| `cashflow` | Harbor deal Accept | Deal preview guided | Second deal reduced | New deal shape / weather | Pay Day composition shift |
| `opportunity_cost` | Wait vs Accept | Deal fork teach | Reduced preview | Different asset offer | Board deal renewal |
| `harbor_scar_memory` | Take → home | Spectacle | Plinth visit unaided | `ts_scar_memory_day2` | Local names / gossip |
| `irreversible_take` | First spine Take | Hush cinema | Second Take no “can’t undo” toast | `ts_irreversible_credit` | Later organ Take |

Verb literacy concepts (`walk_talk`, `carpet_voyage`) use the same schema but IFTR is **supporting**, not king KPI for financial judgment.

---

## 10. Anti-patterns (measurement failure modes)

| Failure mode | Symptom | Fix |
|--------------|---------|-----|
| **Quiz optimization** | High quiz pass, low IFTR | Remove quiz from MASTERED predicate |
| **Transfer theater** | Same UI, new copy | Author new scenario id + surface |
| **Hint laundering** | Why? every decision → “independent” | hint_dependency + spoil audit |
| **Denominator inflation** | Count encounters without decision proof | Require `encounter_proof` |
| **Completion cosplay** | Tutorial done, no transfer | Demote tutorial_completion in dashboards |
| **Single-path IFTR** | 100% IFTR, zero strategy_adaptation | Add valid alternate strategies |
| **Immediate quit win** | IFTR pass then exit | Track voluntary_continuation_after_transfer |

---

## 11. Code alignment & gaps

| Need | Shipped | Gap |
|------|---------|-----|
| Per-concept transfer fields | `ConceptRuntimeEntry`, `transferMetrics.ts` | Extend with delayed reuse + causal accuracy |
| Session IFTR proxy | `analyzeFtueMetrics` → `independent_transfer_rate` | Per-concept cohort rollup in export |
| Transfer scenarios | `transferTasks.ts` | Delayed reuse predicates for all spine concepts |
| Reflection chips | Spec in REFLECTION_SYSTEM | Wire `causal_selections_correct` |
| Spoil void | AI guide guardrails | `transfer_spoiled` flag on save |
| Quiz isolation | `masteryGate.ts` digression | Audit: no judgment MASTERED from quiz alone |

---

## 12. Success criteria

1. Dashboards show **IFTR(concept_id)** before tutorial completion.  
2. No judgment concept reaches MASTERED without **TRANSFER** stage proof.  
3. Playtest reports include all **five secondary metrics** per principle.  
4. Quizzes appear only in **diagnostic** footnotes.  
5. Human cohort can answer: *“Did players remember how the world works?”* — not *“Did they finish the module?”*

---

## 13. Document map

| Question | Read |
|----------|------|
| Six-step teach loop | [CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md) |
| Transfer scenario catalog | [TRANSFER_TASKS.md](../ftue/TRANSFER_TASKS.md) |
| Events & privacy | [FTUE_TELEMETRY.md](../ftue/FTUE_TELEMETRY.md) |
| King KPI narrative | [NORTH_STAR.md](../ftue/NORTH_STAR.md) |
| First-hour metrics | [CAPITAL_FIRST_HOUR.md](../ftue/CAPITAL_FIRST_HOUR.md) |
| Guide / spoil void | [AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md) |
