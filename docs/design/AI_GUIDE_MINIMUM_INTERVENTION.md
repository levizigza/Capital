# Capital — AI Guide: Minimum Necessary Intervention

**Status:** Design law for Coin Bag / adaptive coach / “Why?”  
**Voice:** Coin Bag (path buddy) + optional Piggy presence — **not** a spreadsheet tutor, not an LLM that plays the game for you.  
**Honesty:** Runtime today is **offline heuristics** (`adaptiveCoach.ts`). Generative models are optional later and must obey the same laws.  
**Companions:** `CONCEPT_MASTERY_PEDAGOGY.md` · `REFLECTION_SYSTEM.md` · `DECISION_PREVIEW_ARCHITECTURE.md` · `UI_LAYER_AUDIT.md` · `CAPITAL_DESIGN_CONSTITUTION.md` (§ coach subordination, AI for AI’s sake) · `docs/ftue/NORTH_STAR.md`

**Prime directive:** **Minimum necessary intervention.** Default **SILENT** when the player is progressing successfully. Escalate only on **repeated evidence of misunderstanding**. Never auto-reveal the optimal strategy. Explain **rules and consequences**; never make the financial decision for the player.

---

## 1. Assistance levels

Ordered from least to most invasive. The guide may occupy **only one** level at a time on a surface.

| Level | Code | What the player gets | Example (Cove fork) |
|-------|------|----------------------|---------------------|
| **0** | `SILENT` | No Bag tip / no pulse / no question | Player walks, opens Talk, chooses unaided |
| **1** | `ATTENTION_CUE` | Soft spatial cue only (glow, edge chevron, near-prompt) — **no strategy text** | Fountain ring; “E · Talk” |
| **2** | `SOCRATIC_QUESTION` | One question that names a tension, not an answer | “What still holds after Pay Day — jar or treat?” |
| **3** | `CONCEPTUAL_HINT` | Names the **principle** without naming the option | “Holds grow every month; owes drain every month.” |
| **4** | `EXPLANATION` | Short rule + consequence (CERTAIN/ESTIMATED literacy OK) | “Buying the booth spends coins now; keep rises +10/mo — Certain.” |
| **5** | `DETAILED_ANALYSIS` | Layer-3 only: preview rows, because chains, optional deepen reflection | Full Decision Preview + Fortune Thread snippet |

**Player-facing names:** don’t show `SOCRATIC_QUESTION`. Bag just speaks; Deepen is “Think longer” / Plinth.

### Hard bans at every level

| Ban | Why |
|-----|-----|
| “Pick jar” / “Accept the booth” / pulse on the correct choice | Optimal strategy reveal |
| “I would wait if I were you” | Guide decides |
| Transfer-window Bag naming the answer | Voids ITR (`CONCEPT_MASTERY_PEDAGOGY`) |
| Stacking coach + castle card + tip NPC | Coach subordination breach |
| Auto-jump to DETAILED_ANALYSIS | Not minimum necessary |

---

## 2. Default and escalation

### Default

```
if progressing_successfully:
  level = SILENT
```

**Progressing successfully** (any of):

- Moving toward next verb without idle softlock  
- Completing decisions without repeated fail pattern  
- Inside an active **transfer window** (force ≤ ATTENTION_CUE for controls only; money content SILENT)  
- Cinema / spectacle / share (SILENT — world speaks)  
- Quiet Piggy presence (Bag silent; Piggy owns relationship)

### Escalation — repeated misunderstanding only

Raise **one step at a time** when evidence repeats (suggest ≥2 within concept window):

| Evidence | May escalate toward |
|----------|---------------------|
| Idle softlock / can’t find verb | ATTENTION_CUE |
| Wrong control misconception (Talk from afar) | ATTENTION_CUE → SOCRATIC |
| Repeated minigame fail same pattern | CONCEPTUAL_HINT (rule), not “press this” |
| CF drain ignored across Pay Days | CONCEPTUAL_HINT → EXPLANATION of Owes |
| Transfer fail then retry | CONCEPTUAL_HINT max during retry; never name option |
| Player taps **Why?** | Jump to EXPLANATION or DETAILED_ANALYSIS **on demand** (not auto) |

**Decay:** After a subsequent success, drop toward SILENT within 1–2 beats (hint_dependency falls).

Learning profile may bias speed of escalation (Explorer faster cues; Strategist slower) — never bias toward revealing answers.

---

## 3. What the guide may say

| May | May not |
|-----|---------|
| Rules (“Pay Day pays your keep”) | “You should buy this” |
| Consequences (“Tab drains /mo — Certain”) | Fake certainty on UNKNOWN |
| Questions that reframe tradeoffs | Leading questions with one coded answer |
| Where to look (fountain, Plinth, carpet) | Which fork is optimal |
| How to open Why / Preview | Completing the choice for them |
| Celebrate recovery without ranking | Shame (“bad with money”) |

Align vocabulary with `FINANCIAL_FEEDBACK_VOCABULARY.md` and certainty labels with `DECISION_PREVIEW_ARCHITECTURE.md`.

---

## 4. “Why?” — available anytime

| Property | Spec |
|----------|------|
| Affordances | Coin Bag “Why?” · Esc-adjacent on Decision Preview · Plinth “Why this plaque?” · fail overlay “Why did that happen?” |
| Response level | Prefer EXPLANATION; offer DETAILED_ANALYSIS as “More” |
| Content | Causal BECAUSE from game state (`CAUSAL_TIME_SYSTEM`) — personalized |
| Decision ownership | Why? never auto-commits Accept/Take |
| Transfer windows | Why? may explain **rules** and **past** Cove plaque; must not map “so pick umbrella” |
| Tracking | `intervention_type=EXPLANATION\|DETAILED_ANALYSIS`, `reason=player_asked_why` |

Why? is **player-initiated** → does not count as unwanted nudge; still increments hint_dependency if they rely on it every decision.

---

## 5. Tracking (per intervention)

Store a ring of interventions (privacy: no freeform PII; ids only).

```text
GuideIntervention {
  intervention_type: SILENT|ATTENTION_CUE|SOCRATIC_QUESTION|CONCEPTUAL_HINT|EXPLANATION|DETAILED_ANALYSIS
  reason: progressing_ok|idle|fail_repeat|cf_misread|transfer_fail|player_asked_why|softlock|cinema_mute|…
  player_response: ignored|dismissed|opened_why|acted_after|asked_more|unknown
  subsequent_success: boolean | unknown   // next relevant decision/transfer outcome
  cognitive_load_proxy: number            // see below
  hint_dependency: number                 // rolling reliance score
  concept_id?: string
  at: ISO
}
```

### Field notes

| Field | Definition |
|-------|------------|
| `intervention_type` | Level actually shown (SILENT may be logged sparsely for baselines) |
| `reason` | Why the policy chose that level |
| `player_response` | What they did within ~T seconds / next action |
| `subsequent_success` | Did the linked decision/transfer succeed after? |
| `cognitive_load_proxy` | Heuristic 0–1 from: simultaneous chrome count, text length, cinema+tip overlap, fail streak, reduced-motion off+flash — **not** biometrics |
| `hint_dependency` | e.g. hints_used / decisions in window; high = escalate slower next time & strip sooner after success |

Export to FTUE analytics (`hint_offered` / `hint_used` / dependency) without dialogue bodies.

---

## 6. Policy state machine (sketch)

```
SILENT
  │ evidence×N or Why?
  ▼
ATTENTION_CUE ──► (found verb) ──► SILENT
  │ still stuck
  ▼
SOCRATIC_QUESTION ──► (acted) ──► SILENT / ATTENTION
  │ still wrong pattern
  ▼
CONCEPTUAL_HINT ──► success ──► SILENT
  │ Why? or severe repeat
  ▼
EXPLANATION ──► More? ──► DETAILED_ANALYSIS (Layer 3)
```

Transfer lock: clamp max level to CONCEPTUAL_HINT for **principle** text; ATTENTION_CUE for controls; **never** option-naming.

---

## 7. Surfaces & roles

| Surface | Role under MNI |
|---------|----------------|
| Coin Bag | Primary escalator; one sentence |
| Castle coach | First-hour verb only; silent when Bag escalate conflicts |
| Adaptive coach heuristics | Scores *whether* to speak; must output a **level**, not only a tip string |
| Decision Preview | Passive EXPLANATION/DETAIL when player opens commit UI |
| Reflection Whisper | Optional after outcome — not a guide push during decision |
| Piggy | Relationship / BECAUSE retell — not strategy optimizer |
| LLM (if ever) | Same level caps; cite state; refuse “what should I buy?” |

---

## 8. Relation to existing adaptive coach

Today `adaptiveCoach.ts` scores nudges from fails/CF/profile. **Evolve toward:**

1. Emit `intervention_type` + `reason` with every tip.  
2. Map tip kinds → levels (structural near-store = ATTENTION/EXPLANATION of door; money fork = SOCRATIC/CONCEPTUAL only).  
3. Force SILENT on transfer windows and cinema.  
4. Prefer SILENT when `subsequent_success` streak is healthy.  
5. skillStats panel stays hidden; don’t escalate from hollow RPG meters alone.

---

## 9. Success criteria

1. Successful players report Bag as “quiet until I needed it.”  
2. Transfer ITR not lower when MNI is on vs always-on tips.  
3. Logs show few EXPLANATION without prior fail or Why?.  
4. Zero shipped tips of the form “choose X.”  
5. Why? works in Harbor, shore, preview, and fail overlay.

---

## 10. Anti-patterns

| Anti-pattern | Fix |
|--------------|-----|
| Chatty Bag every beat | Default SILENT |
| “AI companion” personality that picks deals | Ban |
| Detailed analysis as plaza HUD | Layer 3 only |
| Escalation from single miss | Require repeat evidence |
| Hint dependency climbing forever | Decay on success; offer SILENT pride |

---

## 11. Phased delivery

| Phase | Work |
|-------|------|
| **A** | Spec + ban list in tip authoring |
| **B** | Tag Bag tips with level; SILENT in transfer/cinema |
| **C** | Why? affordance → EXPLANATION from causal state |
| **D** | Intervention ring metrics + hint_dependency decay |
| **E** | Optional LLM behind same policy (never required) |
