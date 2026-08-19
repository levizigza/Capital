# Capital — Anecdote System

**Status:** Research architecture for **emergent player stories** — telemetry candidates + human recall validation  
**Core metric:** **ANECDOTE_DENSITY** = meaningful emergent-story events ÷ player-hours  
**Law:** **Telemetry alone does not prove memorability.** Every density claim requires playtest recall comparison.  
**Companions:** [LEARNING_TRANSFER_FRAMEWORK.md](./LEARNING_TRANSFER_FRAMEWORK.md) · [NARRATIVE_EVENT_ENGINE.md](../narrative/NARRATIVE_EVENT_ENGINE.md) · [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) · [FTUE_USABILITY_PROTOCOL.md](../ftue/FTUE_USABILITY_PROTOCOL.md) · [LEARNING_TELEMETRY.md](../design/LEARNING_TELEMETRY.md) · [HEALTH_DASHBOARD.md](../design/HEALTH_DASHBOARD.md) · [docs/ftue/NORTH_STAR.md](../ftue/NORTH_STAR.md)

---

## 1. Purpose

Capital’s best outcomes are **kid-retellable stories** — not checklist completions:

> “I saved for the umbrella, Harbor got stormy, Pay Day barely saved me, and Piggy remembered the plaque.”

This document defines:

1. Which **simulation moments** are *candidates* for “you won’t believe what happened” anecdotes  
2. How to instrument them **without inventing state**  
3. **ANECDOTE_DENSITY** as a cohort metric  
4. A **playtest recall protocol** that compares what players *remember* vs what telemetry *logged*

**Not a goal:** Maximize raw event counts. A session full of spectacle with nothing remembered is **noise**, not success.

**Ship question:** Does this change raise **validated** anecdote recall (and ANECDOTE_DENSITY when calibrated) without harming IFTR, failure recovery, or trust?

---

## 2. What counts as a meaningful emergent-story event

An event is a **meaningful emergent-story candidate** when **all** of the following hold:

| Criterion | Meaning |
|-----------|---------|
| **Player agency** | Outcome depended on a **committed choice** or player-initiated path — not cutscene-only |
| **Simulation truth** | At least two **named channels** interacted (ledger, weather, scar, quest, NPC memory, deal, …) |
| **Surprise relative to prior state** | Predicate detects a **flip**, **extreme**, or **unlikely combo** (see §4) — not the Nth routine Take |
| **Retell potential** | Observer could prompt: *“What happened?”* and expect a **situation sentence**, not a button name |

### Explicit non-candidates (still log elsewhere)

| Signal | Why not anecdote |
|--------|------------------|
| First Cove Take (guided) | Authored spine — memorable by design, not emergent |
| Tutorial step tick | UI progress |
| Quiz correct | Worksheet — track under learning, not story |
| Generic `island_entered` | Navigation |
| Spectacle with no prior tension | Cinema without stakes |

Routine spine beats (`take_mark`, first scar spectacle) become candidates only when **context tags** show compounding (e.g. storm + broke + transfer window).

---

## 3. ANECDOTE_DENSITY

### Definition

```text
ANECDOTE_DENSITY =
  count(meaningful_emergent_story_events)
  ───────────────────────────────────────
  player_hours
```

Where:

- **meaningful_emergent_story_events** — events passing §2 and tagged with an `anecdote_class` (§5) after predicate evaluation  
- **player_hours** — sum of session durations from `session_started` → `session_ended` (or heartbeat), per cohort

Report as **events per hour** (e.g. `0.8/h`) and as **median events per session** for small cohorts.

### Validated density (research-grade)

Telemetry density is **hypothesis** until recall-validated:

```text
VALIDATED_ANECDOTE_DENSITY =
  count(recalled_events matched to telemetry within window)
  ─────────────────────────────────────────────────────────
  player_hours
```

Use **validated** density for ship decisions; raw density for **debugging** and **predicate tuning**.

### Targets (hypotheses — not ship gates until human n ≥ 5)

| Cohort | Raw density hint | Validated recall rate hint |
|--------|------------------|----------------------------|
| First hour (FTUE) | 0.3–0.8 / hr | ≥ 50% of candidates recalled or paraphrased |
| Post-Freedom freeplay | 0.5–1.2 / hr | ≥ 40% (more noise) |

Low density + high IFTR may be **fine** (quiet mastery). High density + low recall = **spectacle spam**.

---

## 4. Anecdote classes (“you won’t believe what happened”)

Each class maps to **predicate templates** over simulation channels. Instrument as `anecdote_emerged` with `anecdote_class` + read-only snapshot.

### 4.1 Unexpected economic recovery

**Story shape:** Player was squeezed; world looked tight; then ledger or Pay Day **flipped** survivability.

| Trigger (examples) | Channels | Capital surfaces |
|--------------------|----------|------------------|
| CF band crosses from `storm`/`tight` → `fair`/`boom` within session | `player.net_cf`, `weather.mood` | Sky brightens; shop multiplier shifts |
| Pay Day settlement prevents insolvency (cash after ≥ 0 when pre-settlement &lt; 0) | ledger, Pay Day tick | Pouch bounce; Piggy relief line |
| Liability paid off / holding sold recovers buffer | holdings, pouch | Deal board; Freedom chip |

**Predicate sketch:** `prior_mood in (tight, storm) AND delta_cf >= threshold AND player_committed_decision_since_mood`

---

### 4.2 Unusual business strategy

**Story shape:** Player took a **valid but uncommon** financial path — not the authored “hero” branch.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Wait on deal while broke | deal choice, pouch, CF | Board deal card; preview Wait |
| Accept liability then Buyout vs Walk | irreversible keys, ledger | Harbor deals |
| Regenerated asset deal at generation ≥ N with Accept | `regenerateAssetDealOffer` | Grind deal loop |
| Skip spend, earn-first loop completes quest objective | quest path, minigame | Side shore / vendor |

**Predicate sketch:** `strategy_selected NOT IN modal_strategies_for_context AND success_predicate met`

Record `strategy_selected`, `choiceId`, `concept_id` if mappable.

---

### 4.3 NPC relationship reversal

**Story shape:** An NPC **felt different** because simulation-backed memory changed — not random dialog.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Piggy homecoming tone shifts after haste vs wait scar | scars, organ, homecoming count | Piggy lines |
| Plaza gossip references new scar (`scarRumorLine`) | `harborScars`, ritual | Harbor ambient |
| Digression NPC tone scar after patience vs impulse | digression shelf, scar kind | Side NPC |
| Day-2 scar echo when player forgot plaque | ritual day-key, scar backdate | Soft Beat cinema |

**Predicate sketch:** `npc_id + tone_band changed AND scar_or_memory_flag wrote since last_talk`

**Firewall:** No LLM-invented relationship shifts ([NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md)).

---

### 4.4 High-risk decision succeeding

**Story shape:** Player chose pressure/haste/spend under **ESTIMATED** or storm conditions — and **survived or gained** per sim.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Credit haste with storm mood; no spiral lock | irreversible, weather | Credit Take; sky |
| Accept deal draining buffer but CF still ≥ 0 after N Pay Days | holdings, CF trajectory | Ledger |
| Treat/spend branch then recovery via earn loop | scar + CF + quest | Cove/Paycheck residue |

**Predicate sketch:** `risk_band >= high AND outcome_band >= neutral AND committed_take`

Label certainty on any player-facing copy: **Estimated**, not guaranteed success.

---

### 4.5 High-risk decision collapsing

**Story shape:** The world **honestly punished** a risky fork — player can retell the collapse.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Haste + low CF → storm lock | CF, scars, weather | Fog; spiral organ line |
| Treat tab + failed Pay Day buffer | liabilities, Pay Day | Owes drain cite |
| Deal Accept → cannot afford next authored beat | pouch, shop multiplier | Soft lock (dignity path) |

**Predicate sketch:** `risk_band >= high AND outcome_band <= hurt AND consequence_displayed`

Pair with `failure_recovery` — collapse + recovery can be **one** anecdote if retold as arc.

---

### 4.6 Recession at a terrible moment

**Story shape:** Economic tightening **intersected** with an active player goal.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Weather → `storm` during transfer window | weather, concept phase | Paycheck/Credit transfer |
| Pay Day with negative net CF while quest requires spend | CF, quest gate | Fountain vendor |
| Shop markup crosses threshold mid-deal pursuit | `harborPriceMultiplier`, deal id | Harbor shop |

**Predicate sketch:** `weather_mood worsened AND active_quest_or_transfer AND time_delta < window`

**Honesty:** Harbor recession visuals bind to **CF weather**, not decorative macro ([ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md)).

---

### 4.7 Unexpected systemic interaction

**Story shape:** Two systems the player did not treat as linked **collided** — teachable world literacy.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Take → scar → weather → shop price blocks purchase | footprint, scar, weather, shop | Plaza loop |
| Irreversible Take → quiet plaza → Piggy homecoming delayed | quiet flag, homecoming | Harbor pacing |
| Board deal + carpet voyage + Pay Day same session | board, voyage, ledger | Session arc |
| Soft Beat arms from scar echo + organ sister | soft beat, scar, organ | Overlay + Plinth |

**Predicate sketch:** `distinct_subsystems >= 2 AND causal_edge documented in payload`

Emit `interaction_ids: string[]` from a fixed catalog — no freeform invention.

---

### 4.8 Clever alternative quest solution

**Story shape:** Player finished a beat via a **legal but unscripted** path order.

| Trigger | Channels | Capital surfaces |
|---------|----------|------------------|
| Quest complete without canonical NPC order | quest objectives graph | Side/main quest |
| Earn-first completes spend-gated objective | minigame + quest | Cove/Paycheck |
| Skip dialog branch still satisfies predicate | quest status, items | Island JSON |

**Predicate sketch:** `quest_completed AND path_signature NOT IN authored_modal_paths`

Requires authored **`path_signature`** on quest completion telemetry.

---

## 5. Telemetry contract

### Primary event

```text
anecdote_emerged {
  anecdote_class: unexpected_recovery | unusual_strategy | npc_reversal |
                  risk_success | risk_collapse | recession_timing |
                  systemic_interaction | alt_quest_path
  anecdote_id: string              // stable hash of class + channels + beat ids
  session_id: string
  elapsed_ms: number
  surprise_score: number           // 0–1 heuristic — NOT memorability proof
  channels: string[]             // e.g. weather.mood, player.net_cf, scar.id
  interaction_ids?: string[]
  choice_id?: string
  quest_id?: string
  concept_id?: string
  scar_id?: string
  deal_id?: string
  npc_id?: string
  prior_snapshot: { ... }         // read-only sim slice BEFORE
  post_snapshot: { ... }          // read-only sim slice AFTER
  routine_spine: boolean           // true if spine beat; candidate only if compounding tags
}
```

### Supporting events (existing — tag or enrich)

| Existing event | Anecdote role |
|----------------|---------------|
| `core_loop_beat` | `take_mark`, `soft_beat`, scar spectacle — attach compounding tags |
| `consequence_displayed` | Collapse / recovery punctuation |
| `dialogue_choice` + irreversible | Strategy + risk |
| `harbor_purchase` | Deal / shop interaction |
| `transfer_success` / `transfer_failure` | Recession-at-goal overlay |
| `quest_completed` | Alt path signature |
| `concept_transfer` | Unusual strategy under transfer |

### Privacy

Same allowlist as [FTUE_TELEMETRY.md](../ftue/FTUE_TELEMETRY.md): **no dialogue bodies**, no PII, taxonomy ids only.

### Implementation phases

| Phase | Work |
|-------|------|
| **A** | Spec + predicate catalog (this doc) |
| **B** | `anecdote_emerged` emitter + channel snapshots on spine beats |
| **C** | Export panel: raw ANECDOTE_DENSITY + class histogram |
| **D** | Playtest recall form + matcher (§7) |
| **E** | Calibrate `surprise_score` weights from validated cohorts |

---

## 6. Surprise score (heuristic only)

` surprise_score` ranks candidates for **analyst review** — not for player-facing UI or automatic “memorable” flags.

Example weighted signals:

| Signal | Weight hint |
|--------|-------------|
| Mood / CF band flip | +0.3 |
| First-time combo of class + quest id | +0.2 |
| Transfer window active | +0.15 |
| Recovery after collapse &lt; 10 min | +0.15 |
| Routine spine only | −0.4 |

**Hard rule:** Never ship copy saying “memorable moment detected.” Humans validate through §7.

---

## 7. Playtest recall protocol

### Core question (verbatim)

Ask **after** the session, before design debrief:

> **“Tell me about the most memorable thing that happened during your session.”**

Optional probes (only if they stall — do not lead):

- “What was Harbor like after that?”  
- “Did anything surprise you about money?”  
- “What would you tell a friend?”

### Session fit

| Protocol | When |
|----------|------|
| [FTUE_USABILITY_PROTOCOL.md](../ftue/FTUE_USABILITY_PROTOCOL.md) | Add as interview Q7 |
| Post-Freedom playtests | Standalone 20–30 min freeplay + recall |
| Returning players | Same question; note day-2 echo recall |

Observer law unchanged: **no help during play** unless INTERVENTION codes apply.

### Recording

Capture **participant quote** (short paraphrase OK), **timestamp estimate**, and whether they needed a probe.

```text
RecallRecord {
  session_id
  participant_id          // opaque cohort id
  quote: string           // their words — store in secure playtest log, NOT analytics KV
  probe_used: boolean
  interviewer_notes
  recalled_classes?: string[]   // coder-assigned after match
  matched_anecdote_ids?: string[]
  unmatched_recall: boolean     // they remembered something telemetry missed
  false_positive_telemetry: string[]  // high surprise_score but not recalled
}
```

Quotes stay **out of** local analytics export (privacy). Match in offline playtest spreadsheets.

---

## 8. Recall ↔ telemetry comparison

### Matching rules

For each `RecallRecord`, attempt to match **≥1** `anecdote_emerged` within:

| Match tier | Window | Criteria |
|------------|--------|----------|
| **Strong** | ±120 s of recalled beat OR same `scar_id`/`quest_id`/`choice_id` | Class aligns with quote coding |
| **Weak** | Same session | Same `anecdote_class` family |
| **Miss** | — | Recalled but no candidate — **gold** for design |
| **False positive** | — | Candidate `surprise_score ≥ 0.6` never recalled across cohort |

### Coder rubric (map quote → class)

| Quote theme | Likely class |
|-------------|--------------|
| “I was broke then Pay Day saved me” | `unexpected_recovery` |
| “I waited instead of buying…” | `unusual_strategy` |
| “Piggy / Harbor acted different” | `npc_reversal` |
| “I gambled and it worked” | `risk_success` |
| “Everything got stormy / I spiraled” | `risk_collapse` / `recession_timing` |
| “The shop and the sky…” | `systemic_interaction` |
| “I did it backwards but it worked” | `alt_quest_path` |

Two coders; disagreements → third review.

### Report template (per cohort)

| Row | Value |
|-----|-------|
| Sessions | n |
| Player-hours | Σ duration |
| Raw ANECDOTE_DENSITY | §3 |
| Candidates per class | histogram |
| **Recall match rate** | strong matches ÷ participants |
| **Validated ANECDOTE_DENSITY** | §3 |
| Top unmatched recalls | design backlog |
| Top false positives | predicate trim list |
| IFTR (same sessions) | guardrail — story must not break transfer |

### What telemetry cannot prove

| Claim | Requires |
|-------|----------|
| “Players love this beat” | Recall + optional fun probe (#94) |
| “Emergent stories are frequent” | Validated density, not raw |
| “NPC felt alive” | Recall mentions + sim-backed reversal |
| “System is fair” | Failure recovery + recall tone |

---

## 9. Relation to other metrics

| Metric | Relationship |
|--------|--------------|
| **IFTR** | Orthogonal king metric — learning transfer ≠ story memory; both should be reported |
| **failure_recovery_rate** | Collapse anecdotes often pair with recovery |
| **hint_dependency** | High hints may reduce emergent *feeling* — segment density |
| **freeplay_conversion** | Continuation after a recalled anecdote = strong engagement signal |
| **tutorial_completion_rate** | Irrelevant as anecdote success |

[HEALTH_DASHBOARD.md](../design/HEALTH_DASHBOARD.md) cross-category flag extension (future):

| Flag | Trigger |
|------|---------|
| **HIGH ANECDOTE / LOW RECALL** | Raw density high, match rate low — spectacle noise |
| **HIGH RECALL / LOW IFTR** | Fun stories that don’t teach — investigate |
| **HIGH IFTR / LOW ANECDOTE** | Quiet competence — may be OK |

---

## 10. Capital spine — expected anecdote hotspots

Honest map of where emergent candidates **should** cluster if systems interact (iconic freeze):

| Beat | Classes |
|------|---------|
| Cove Take → Harbor spectacle | `systemic_interaction`, `npc_reversal` |
| Paycheck transfer under rain | `recession_timing`, `unusual_strategy` |
| Credit wait/haste | `risk_success`, `risk_collapse` |
| Harbor deals + weather shop | `systemic_interaction`, `unexpected_recovery` |
| Day-2 scar echo | `npc_reversal`, `systemic_interaction` |
| Board deal grind | `unusual_strategy`, `unexpected_recovery` |
| Side quest digressions | `alt_quest_path` |

Gaps ([CAPITAL_MASTER_AUDIT.md](../design/CAPITAL_MASTER_AUDIT.md)): macro `economy.ts` phase must **not** fake Harbor recession anecdotes; NPC books not live — **`npc_reversal`** predicates stay scar/gossip/trust-proxy only.

---

## 11. Anti-patterns

| Anti-pattern | Why harmful |
|--------------|-------------|
| Optimize raw event count | Spam spectacle; recall drops |
| LLM “memorable moment” narrator | Violates sim truth |
| Count every Take as anecdote | Dilutes density |
| Skip recall studies | False confidence |
| Decorative recession props | Fake literacy |
| Force quirky random events | Not emergent — authored noise |

---

## 12. Success criteria

1. Every `anecdote_class` has a **sim-backed predicate** — no invented state.  
2. Export reports **raw** and **validated** density separately.  
3. Playtest template includes the **verbatim recall question**.  
4. Cohort reports list **top unmatched recalls** — treated as design gifts.  
5. Ship decisions cite **recall match rate**, not `surprise_score` alone.  
6. Zero marketing claims that telemetry “proves” memorability.

---

## 13. Document map

| Question | Read |
|----------|------|
| Learning transfer KPI | [LEARNING_TRANSFER_FRAMEWORK.md](./LEARNING_TRANSFER_FRAMEWORK.md) |
| Situation authoring | [NARRATIVE_EVENT_ENGINE.md](../narrative/NARRATIVE_EVENT_ENGINE.md) |
| Weather / recession honesty | [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) |
| Playtest observer law | [FTUE_USABILITY_PROTOCOL.md](../ftue/FTUE_USABILITY_PROTOCOL.md) |
| Event privacy | [FTUE_TELEMETRY.md](../ftue/FTUE_TELEMETRY.md) |
| Session log template | [TEMPLATE_SESSION_LOG.md](../ftue/usability/TEMPLATE_SESSION_LOG.md) |
