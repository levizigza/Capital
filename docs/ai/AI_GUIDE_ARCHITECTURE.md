# Capital — AI Guide Architecture

**Status:** Design architecture for Coin Bag / adaptive coach / “Why?” / optional LLM renderer  
**Prime directive:** **Productive struggle** — the guide exists to help players **reason**, not to **decide for them**.  
**Default:** `SILENT`  
**Honesty:** Runtime today is **offline heuristics** (`adaptiveCoach.ts`). Generative models are an optional **phrasing layer** later and must obey the same laws.  
**Companions:** [AI_GUIDE_GUARDRAILS.md](./AI_GUIDE_GUARDRAILS.md) · [AI_GUIDE_MINIMUM_INTERVENTION.md](../design/AI_GUIDE_MINIMUM_INTERVENTION.md) · [CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md) · [CAPITAL_DESIGN_CONSTITUTION.md](../design/CAPITAL_DESIGN_CONSTITUTION.md) (Principle 14) · [FINANCIAL_DECISION_UI.md](../ui/FINANCIAL_DECISION_UI.md) · [docs/ftue/NORTH_STAR.md](../ftue/NORTH_STAR.md)

---

## 1. Purpose

Capital’s AI guide is **not** a tutor that plays the game for the player. It is a **policy-governed interpreter** that:

1. Protects **productive struggle** — confusion that leads to reasoning, not abandonment.
2. Escalates **only on repeated evidence** of misunderstanding or player request.
3. Speaks from **simulation truth** and **canonical content** — never from model invention.
4. Preserves **Independent Transfer Rate (ITR)** as the king KPI: guidance that names the answer voids transfer proof.

The guide may **illuminate** rules, state, and past consequences. It may **not** choose strategies, guarantee outcomes, or alter the sim.

---

## 2. Truth hierarchy

Three layers. Lower layers are authoritative; upper layers may only **read and explain**.

```
┌─────────────────────────────────────────────────────────┐
│  LLM OUTPUT — interpretation / explanation only       │
│  (Coin Bag phrasing, Why? prose, optional rewrites)   │
└──────────────────────────▲──────────────────────────────┘
                         │ reads, never writes
┌────────────────────────┴──────────────────────────────┐
│  CANONICAL CONTENT — authored truth                   │
│  (Talk graphs, curriculum, concept defs, PromptPacks) │
└──────────────────────────▲──────────────────────────────┘
                         │ triggers / displays
┌────────────────────────┴──────────────────────────────┐
│  SIMULATION STATE — live, tickable truth              │
│  (ledger, scars, quest status, holdings, weather, …)  │
└───────────────────────────────────────────────────────┘
```

| Layer | Source of truth | Guide may | Guide may not |
|-------|-----------------|-----------|---------------|
| **SIMULATION STATE** | `voyagerLedger`, save fields, blackboard, world director | Summarize current values; cite past writes; compare branches using preview rows | Invent balances, scars, unlocks, or “what would happen if” without preview/authored backing |
| **CANONICAL CONTENT** | Island JSON, `CONCEPT_CURRICULUM`, authored tips, causal packs | Explain rules; remind of taught principles; quote allowed facts | Add new rules, NPC debts, quests, or teaching beats not in content |
| **LLM OUTPUT** | Model text under guardrails | Rephrase, shorten, warm tone per learning profile | Present inference as fact; override lower layers |

**Constitution test (Principle 14):** Delete the guide (heuristic + LLM). Simulation outcomes and quest completion are **identical**.

Align with NPC speech firewall: [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) · [CHARACTER_MEMORY_ARCHITECTURE.md](../narrative/CHARACTER_MEMORY_ARCHITECTURE.md).

---

## 3. Productive struggle

**Productive struggle** = the player holds a real tension (trade-off, constraint, unfamiliar surface) long enough to **construct** understanding — without softlock, shame, or answer-spoil.

| Struggle type | Guide stance | Example |
|---------------|--------------|---------|
| **Productive** | Stay `SILENT` or `QUESTION` | Cove fork: player pauses, opens preview, chooses unaided |
| **Unproductive (stuck on controls)** | `NOTICE` only | Can’t find Talk; idle ≥45s near verb |
| **Unproductive (misread rule)** | Escalate toward `HINT` / `CAUSAL_EXPLANATION` after **repeat** evidence | Third Pay Day ignoring `/mo` drain |
| **Transfer window** | Clamp: controls `NOTICE` max; money content `HINT` max; **never** name option | Paycheck protect vs glitter — no “like the jar” |
| **Spectacle / cinema / share** | Force `SILENT` | Scar hush, Plinth glow — world speaks |

### Relationship to concept mastery

The six-step teach loop ([CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md)) requires **step 5 — remove guidance** before independent transfer. The guide architecture **implements** that step:

- During `REDUCED_GUIDANCE` → bias `SILENT`.
- During transfer window → enforce transfer lock (see §6).
- If guide names the answer → **void** `independent_transfer_success`.

### Success signal

Players describe the guide as *“quiet until I needed it”* — and ITR does not fall when the guide is enabled vs always-on tips.

---

## 4. Assistance ladder

Ordered least → most invasive. **One level per surface at a time.** Default **`SILENT`**.

| Level | Code | Player gets | Example (Cove fork) |
|-------|------|-------------|---------------------|
| **0** | `SILENT` | No Bag tip, no pulse, no question | Walks, opens Talk, chooses unaided |
| **1** | `NOTICE` | Spatial / attention cue only — **no strategy text** | Fountain ring; edge chevron; “E · Talk” |
| **2** | `QUESTION` | One Socratic question naming tension, not answer | “What still holds after Pay Day — jar or treat?” |
| **3** | `HINT` | Names **principle** without naming option | “Holds grow every month; owes drain every month.” |
| **4** | `CAUSAL_EXPLANATION` | Short rule + consequence; certainty labels OK | “Buying the booth spends coins now; keep rises +10/mo — Certain.” |
| **5** | `DETAILED_EXPLANATION` | Layer-3 only: preview rows, because chains, optional deepen | Full Decision Preview + Fortune Thread snippet |

**Player-facing:** do not show enum names. Bag speaks; Deepen is “Think longer” / Plinth.

### Mapping to prior MNI doc

| This architecture | [AI_GUIDE_MINIMUM_INTERVENTION.md](../design/AI_GUIDE_MINIMUM_INTERVENTION.md) |
|-------------------|--------------------------------------------------------------------------------|
| `NOTICE` | `ATTENTION_CUE` |
| `QUESTION` | `SOCRATIC_QUESTION` |
| `HINT` | `CONCEPTUAL_HINT` |
| `CAUSAL_EXPLANATION` | `EXPLANATION` |
| `DETAILED_EXPLANATION` | `DETAILED_ANALYSIS` |

Both documents describe the **same policy**; this file is the **system architecture** entry point under `docs/ai/`.

---

## 5. What the guide may do

| Capability | Typical level | Notes |
|------------|---------------|-------|
| Ask questions | `QUESTION` | Reframe trade-offs; no leading to one coded answer |
| Explain rules | `HINT` → `CAUSAL_EXPLANATION` | Pay Day pays keep; Takes are irreversible |
| Summarize state | `CAUSAL_EXPLANATION` | “You hold +10/mo from booth — Certain (ledger)” |
| Explain **past** consequences | `CAUSAL_EXPLANATION` | “Last Take added a treat tab — drains /mo” |
| Help compare information | `CAUSAL_EXPLANATION` → `DETAILED_EXPLANATION` | Side-by-side preview rows; not “pick A” |
| Remind of facts | `HINT` | Principle taught earlier; no “so pick umbrella” |

Full allow/deny matrix: [AI_GUIDE_GUARDRAILS.md](./AI_GUIDE_GUARDRAILS.md).

---

## 6. Policy engine (conceptual)

```
                    ┌──────────────┐
                    │ Policy input │
                    └──────┬───────┘
                           │
     save + ledger ────────┤
     concept phase ────────┤
     fail / idle signals ──┤
     transfer window? ─────┤
     cinema / spectacle? ──┤
     player Why? tap ──────┤
     learning profile ─────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Choose assistance      │
              │ level (default SILENT) │
              └────────────┬───────────┘
                           │
              ┌────────────▼───────────┐
              │ Build context pack     │
              │ (state + canon only)   │
              └────────────┬───────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌─────────────────┐               ┌─────────────────┐
│ Authored tip /  │               │ Optional LLM    │
│ template render │               │ phrasing layer  │
└────────┬────────┘               └────────┬────────┘
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
              ┌────────────────────────┐
              │ Guardrail filter       │
              │ (deny list, certainty) │
              └────────────┬───────────┘
                           ▼
              ┌────────────────────────┐
              │ Surface: Bag / Why? /  │
              │ Preview / coach HUD    │
              └────────────────────────┘
```

### Default

```
if progressing_successfully:
  level = SILENT
```

**Progressing successfully** (any of):

- Moving toward next verb without idle softlock  
- Completing decisions without repeated fail pattern  
- Inside active **transfer window** (money content ≤ `HINT`; controls ≤ `NOTICE`)  
- Cinema / spectacle / share (`SILENT`)  
- Quiet Piggy presence (relationship, not strategy)

### Escalation

Raise **one step at a time** when evidence **repeats** (suggest ≥2 within concept window):

| Evidence | May escalate toward |
|----------|---------------------|
| Idle softlock / can’t find verb | `NOTICE` |
| Wrong control misconception (Talk from afar) | `NOTICE` → `QUESTION` |
| Repeated minigame fail same pattern | `HINT` (rule), not “press this” |
| CF drain ignored across Pay Days | `HINT` → `CAUSAL_EXPLANATION` |
| Transfer fail then retry | `HINT` max during retry; never name option |
| Player taps **Why?** | Jump to `CAUSAL_EXPLANATION` or `DETAILED_EXPLANATION` **on demand** |

Learning profile may bias **speed of escalation** (Explorer faster cues; Strategist slower) — **never** bias toward revealing answers.

### Decay

After subsequent success, drop toward `SILENT` within 1–2 beats (`hint_dependency` falls).

### Transfer lock

During transfer window:

| Allowed max | Forbidden |
|-------------|-----------|
| `NOTICE` for controls (Talk, door, carpet) | Naming correct option |
| `HINT` for principle vocabulary | “Pick jar like Cove” |
| `CAUSAL_EXPLANATION` on **player-initiated Why?** for rules/past only | Mapping analog → answer |
| Decision Preview numbers (Layer 2) | Pulsing correct choice |

Recording: if Bag/coach pointed at the answer → do **not** count `independent_transfer_success`.

---

## 7. Surfaces and roles

| Surface | Role | Default level |
|---------|------|---------------|
| **Coin Bag** | Primary escalator; one sentence | `SILENT` |
| **Castle coach** | First-hour verb only; yields to Bag | `NOTICE` → `QUESTION` early FTUE |
| **Adaptive coach** (`adaptiveCoach.ts`) | Scores *whether* to speak; must emit **level**, not only string | Heuristic today |
| **Decision Preview** | Passive `CAUSAL_EXPLANATION` / `DETAILED_EXPLANATION` when player opens commit UI | Player-initiated |
| **Why?** | On-demand causal chain from state | `CAUSAL_EXPLANATION`; “More” → `DETAILED_EXPLANATION` |
| **Reflection Whisper** | After outcome — not push during decision | Post-commit |
| **Piggy** | Relationship / BECAUSE retell — not strategy optimizer | `SILENT` during forks |
| **LLM (if ever)** | Same level caps; cite state; refuse strategy picks | Optional renderer |

**Coach subordination:** Never stack Bag + castle card + tip NPC on the same beat. One voice.

---

## 8. “Why?” — player-initiated anytime

| Property | Spec |
|----------|------|
| Affordances | Coin Bag “Why?” · Esc-adjacent on Decision Preview · Plinth “Why this plaque?” · fail overlay “Why did that happen?” |
| Response level | Prefer `CAUSAL_EXPLANATION`; offer `DETAILED_EXPLANATION` as “More” |
| Content | Causal BECAUSE from game state (`CAUSAL_TIME_SYSTEM`) — personalized from **state pack** |
| Decision ownership | Why? never auto-commits Accept/Take |
| Transfer windows | May explain **rules** and **past**; must not map “so pick umbrella” |
| Tracking | `intervention_type`, `reason=player_asked_why` |

Why? is player-initiated → does not count as unwanted nudge; still increments `hint_dependency` if relied on every decision.

---

## 9. Context pack (for any renderer)

Every guide utterance is built from a **frozen context pack** — never from model memory of prior chats as truth.

```text
GuideContextPack {
  assistance_level: SILENT | NOTICE | …
  reason: progressing_ok | idle | fail_repeat | player_asked_why | …
  concept_id?: string
  concept_phase?: LOCKED | GUIDED | REDUCED | INDEPENDENT | …
  transfer_window_active: boolean
  simulation_snapshot: { ledger, cash, cf, holdings, scars, … }  // read-only
  certainty_rows?: PreviewRow[]   // KNOWN | ESTIMATED | PROBABILISTIC | UNKNOWN
  canonical_facts: string[]       // from PromptPack / curriculum
  forbidden_topics: string[]      // e.g. "name_correct_option", "guarantee_outcome"
  voice: coin_bag | piggy_retell | neutral_why
}
```

LLM receives **only** this pack + level-specific instruction template. See guardrails doc for PromptPack schema.

---

## 10. Telemetry

Store a ring of interventions (privacy: no freeform PII; ids only). Align with FTUE analytics.

```text
GuideIntervention {
  intervention_type: SILENT | NOTICE | QUESTION | HINT | CAUSAL_EXPLANATION | DETAILED_EXPLANATION
  reason: progressing_ok | idle | fail_repeat | cf_misread | transfer_fail | player_asked_why | …
  player_response: ignored | dismissed | opened_why | acted_after | asked_more | unknown
  subsequent_success: boolean | unknown
  cognitive_load_proxy: number    // heuristic 0–1 — not biometrics
  hint_dependency: number       // rolling reliance; high → escalate slower, strip sooner
  concept_id?: string
  at: ISO
}
```

| Metric | Use |
|--------|-----|
| `hint_dependency` | Decay policy; cohort health |
| `subsequent_success` | Validate escalation helped vs spoiled |
| `intervention_type` distribution | Detect chatty guide regressions |
| ITR correlation | Guide must not depress transfer success |

Export: `hint_offered`, `hint_used`, dependency — without dialogue bodies.

---

## 11. Relation to shipped code

| Component | Today | Evolve toward |
|-----------|-------|---------------|
| `adaptiveCoach.ts` | Scores nudges from fails/CF/profile | Emit `intervention_type` + `reason`; map tip kinds → ladder levels |
| `coinBagBuddy.ts` | Authored tips + transfer mute | Tag tips with level; `SILENT` in transfer/cinema |
| `worldDirector.ts` | Idle softlock | Input to `NOTICE` only |
| Concept progression | Phase + transfer stamps | Policy clamps from phase/window |
| LLM | Absent in product path | Optional phrasing behind kill switch + guardrails |

**Iconic freeze:** No LLM guide in chase order until ITR baseline established (`iconicProofLaw.ts`, master audit §15).

---

## 12. Phased delivery

| Phase | Work |
|-------|------|
| **A** | Architecture + guardrails docs; ban list in tip authoring |
| **B** | Tag Bag tips with ladder level; `SILENT` in transfer/cinema |
| **C** | Why? affordance → `CAUSAL_EXPLANATION` from causal state pack |
| **D** | Intervention ring metrics + `hint_dependency` decay |
| **E** | Optional LLM phrasing behind same policy (never required for play) |

---

## 13. Success criteria

1. Successful players report Bag as “quiet until I needed it.”  
2. Transfer ITR not lower when policy is on vs always-on tips.  
3. Logs show few `CAUSAL_EXPLANATION` without prior fail or Why?.  
4. Zero shipped tips of the form “choose X.”  
5. Why? works in Harbor, shore, preview, and fail overlay.  
6. **Delete guide test:** sim outcomes unchanged.

---

## 14. Document map

| Question | Read |
|----------|------|
| What may the guide say / not say? | [AI_GUIDE_GUARDRAILS.md](./AI_GUIDE_GUARDRAILS.md) |
| Escalation examples and anti-patterns | [AI_GUIDE_MINIMUM_INTERVENTION.md](../design/AI_GUIDE_MINIMUM_INTERVENTION.md) |
| When must guidance be removed? | [CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md) |
| Certainty labels on previews | [FINANCIAL_DECISION_UI.md](../ui/FINANCIAL_DECISION_UI.md) |
| King KPI | [docs/ftue/NORTH_STAR.md](../ftue/NORTH_STAR.md) |
