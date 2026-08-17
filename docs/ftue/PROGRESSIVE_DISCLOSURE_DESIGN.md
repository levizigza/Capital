# Progressive Disclosure — Technical Design

**Date:** 2026-08-17  
**Status:** Design validated against `IslandSaveV1` / `hubGuidedIntro` / mastery gates.  
**Implementation:** `src/islands/conceptProgression/*` + thin `applyConceptSync` in `IslandsApp` update/replace save paths. UI attention chrome deferred.  
**Canon:** `CONCEPT_CURRICULUM.md` · `CORE_LOOP.md` · iconic freeze (Harbor · Cove → Paycheck → Credit)

---

## 1. Problem

Capital teaches money concepts across hours (FTUE + Soft Beat + Credit). Today teaching is **implicit** (quests, scars, Coin Bag tips, mastery quizzes) with no shared state machine. That causes:

- Premature vocabulary (Ashore names Spiral before Coin Hold)
- No way to re-open a contextual micro-tutorial days later
- No proof-gated progression (dismiss / Next / timers can fake “done”)

## 2. Goals

1. Data-driven **concept phases** for every teachable `concept_id`.  
2. Transitions only on **proof predicates** over real save evidence — never solely on elapsed time, dialog dismiss, or “Next”.  
3. Additive on `IslandSaveV1` (same pattern as `hubGuidedIntro`, `harborScars`).  
4. Callable **hours after FTUE** when a late trigger fires (e.g. first APR inbox after `interest_compounds` is AVAILABLE).  
5. Recoverable from corrupt / partial saves.

## 3. Non-goals (v1)

- Replacing `hubGuidedIntro` Ashore/Harbor verb coach (orthogonal: plaza verbs vs money concepts).  
- Replacing `masteryGate` quizzes (mastery quizzes **feed** `mastery_condition`).  
- New player-facing tutorial UI chrome / menus.  
- Unlocking map islands (still `progressGates.ts`).

## 4. Compatibility with existing architecture

| Existing | Relationship |
|----------|----------------|
| `IslandSaveV1` | Add optional `conceptProgress?: ConceptProgressState` |
| `hubGuidedIntro` | Unchanged; plaza one-verb coach. Concept engine may *read* `step === "done"` as evidence, never write hub guided |
| `voyagerLedger.masteryClears` | Evidence for `mastery_gate_cleared` predicates |
| `irreversibleChoices` / `harborScars` | Primary proof for Take / footprint concepts |
| `questStatus` | Proof for earn/budget quests |
| `learningProfile` | Hint frequency can scale `hint_policy` later; v1 stores attempts only |
| `analytics` | Optional `core_loop_beat`-style payload via existing union extension `concept_phase` (v1 tests don’t require wiring) |
| Storage wipe | Lives inside `island_save_v1` → erased with save; no new localStorage key |

**Freeze:** Registry only seeds spine-aligned concepts from curriculum Phase 0–5. No Nathan/BMO/CBE. No fake multiplayer.

## 5. Phase model

```
LOCKED → AVAILABLE → GUIDED → REDUCED_GUIDANCE → INDEPENDENT → MASTERED
                                              ↘ REVIEW_AVAILABLE ↔ (GUIDED | REDUCED_GUIDANCE)
```

| Phase | Meaning |
|-------|---------|
| `LOCKED` | Prerequisites not met |
| `AVAILABLE` | Prereqs satisfied; waiting for **trigger proof** (not shown as forced tutorial yet) |
| `GUIDED` | Trigger fired; full instruction + attention_target active |
| `REDUCED_GUIDANCE` | Practice succeeded once; lighter hints |
| `INDEPENDENT` | Transfer task succeeded; no coach |
| `MASTERED` | Mastery condition proved |
| `REVIEW_AVAILABLE` | Spaced / remediation: may re-enter GUIDED/REDUCED without losing mastery history |

## 6. Concept definition schema

```ts
concept_id: string
prerequisites: concept_id[]
trigger_condition: Predicate   // proof to enter GUIDED from AVAILABLE
instruction: string            // player-facing coach line
attention_target: string       // e.g. "npc:keeper_kira" | "hud:cashflow" | "plinth"
practice_task: string          // what to do while GUIDED
success_condition: Predicate   // GUIDED → REDUCED_GUIDANCE
failure_condition: Predicate   // increment fail; apply hint/retry policy
hint_policy: { maxHints: number; escalateAfterFailures: number }
retry_policy: { maxAttempts: number; stayPut: boolean }
transfer_task: Predicate       // REDUCED → INDEPENDENT
mastery_condition: Predicate   // INDEPENDENT → MASTERED (or GUIDED skip if already strong)
```

### Predicate vocabulary (v1)

Predicates are **declarative** over a snapshot `ConceptEvidence` derived from `IslandSaveV1`:

| Kind | Meaning | Allowed as sole unlock? |
|------|---------|-------------------------|
| `quest_completed` | `questStatus[id].completed` | Yes |
| `irreversible_set` | key present in `irreversibleChoices` | Yes |
| `scar_present` | scar id (or prefix) in `harborScars` | Yes |
| `minigame_completed` | id in `completedMinigames` | Yes |
| `mastery_gate_cleared` | id in ledger.masteryClears | Yes |
| `has_freedom` | harbor escaped / freedom item | Yes |
| `island_discovered` | island in discovered.islands | **Only with** another proof in `all_of` |
| `guided_hub_done` | hub guided step done | Soft evidence only inside `all_of` |
| `all_of` / `any_of` | combinators | — |
| `never` | always false | — |

**Forbidden sole unlocks:** wall-clock time, `dialog_dismissed`, `ui_next_clicked`, session age.

## 7. Runtime API

```ts
buildConceptEvidence(save: IslandSaveV1): ConceptEvidence
getConceptPhase(save, conceptId): ConceptPhase
getActiveGuidance(save): { concept_id, instruction, attention_target, phase }[]
applyConceptSync(save): IslandSaveV1
  // recompute LOCKED↔AVAILABLE from prereqs;
  // AVAILABLE→GUIDED when trigger true;
  // advance success/transfer/mastery;
  // apply failure counters
noteConceptFailure(save, conceptId): IslandSaveV1  // explicit fail signal from UI/minigame
normalizeConceptProgress(raw): ConceptProgressState  // recovery
```

Call sites (v1 integration points — thin):

- After quest complete / irreversible / scar add / mastery clear → `applyConceptSync`
- UI may read `getActiveGuidance` for Coin Bag / pulse (future)

## 8. Persistence shape

```ts
conceptProgress?: {
  version: 1;
  concepts: Record<concept_id, {
    phase: ConceptPhase;
    attempts: number;
    failures: number;
    hintsUsed: number;
    guidedEnteredAt?: string;
    masteredAt?: string;
    lastTransitionAt?: string;
  }>;
}
```

Missing `conceptProgress` on old saves → treat as `{}`; sync derives AVAILABLE for zero-prereq concepts when evidence allows.

## 9. State recovery

| Corruption | Recovery |
|------------|----------|
| Unknown phase string | → `LOCKED` then sync |
| Unknown concept_id in map | Drop on normalize |
| Phase MASTERED but prereq lost | Keep MASTERED (don’t punish); do not re-LOCK |
| Phase GUIDED but trigger false | Stay GUIDED until success/fail policy (don’t auto-dismiss) |
| Cycles in prerequisites | Registry validate at test time; refuse load of bad def |

## 10. Contextual micro-tutorials after FTUE

Example: `apr` stays `LOCKED` until `interest_compounds` is `INDEPENDENT`+. When Credit Inbox fires `apr` trigger while `AVAILABLE`, phase → `GUIDED` with instruction — **hours later**, no FTUE rewrite.

## 11. Testing plan

- Unit: phase transitions, forbidden unlocks, prereq gating, combinators  
- Recovery: corrupt JSON, missing field, unknown ids, MASTERED sticky  
- Registry: every def has required fields; prereqs exist; no cycles  
- Compatibility: `applyConceptSync` is pure; does not mutate hubGuidedIntro

## 12. Implementation plan (this PR)

1. This design doc  
2. `src/islands/conceptProgression/*` engine + seed registry (spine concepts)  
3. Optional field on `IslandSaveV1`  
4. Thin `applyConceptSync` hook from `IslandsApp` after save-mutating proof events (scar / irreversible / quest)  
5. Vitest coverage  

UI attention highlighting deferred.
