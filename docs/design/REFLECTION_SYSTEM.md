# Capital — Post-Scenario Reflection System

**Status:** Design specification  
**Purpose:** Optional, myth-voiced moments that help players name what just happened — so later **independent transfer** is stronger — without becoming a classroom worksheet.  
**King test:** Does offering reflection raise `independent_transfer_success` / ITR vs skip? If not, demote or cut.  
**Companions:** `CONCEPT_MASTERY_PEDAGOGY.md` · `CAUSAL_TIME_SYSTEM.md` · `PLAYER_HISTORY_SYSTEM.md` · `UI_LAYER_AUDIT.md` · `MECHANICS_NARRATIVE_MATRIX.md` · `NORTH_STAR.md`

**Prototype policy:** Spec first; prefer Piggy / Plinth / share lower-third over new quiz UI.

---

## 1. Design laws

1. **Not a worksheet** — no numbered homework, no forced essay, no grade, no “submit to teacher” chrome in the default path.  
2. **Optional** — Esc / “Keep walking” / “Talk later” always works; reflection never soft-locks the signature loop.  
3. **Extremely short by default** — one personalized beat (≤2 short lines + 0–1 tap).  
4. **Deeper on demand** — Layer 3 only (`UI_LAYER_AUDIT.md`).  
5. **Personalized from game state** — fill templates from scars, CF, weather, deal names; never generic “What is opportunity cost?”  
6. **Does not grant MASTERED** — reflection is not proof; transfer still is (`CONCEPT_MASTERY_PEDAGOGY.md`).  
7. **No generative essay** — templates + player taps; no LLM autobiography.

---

## 2. When reflection may appear

| Trigger | Default mode | Notes |
|---------|--------------|-------|
| After scar spectacle → before or after share | **Whisper** (short) | Highest signal; don’t block Piggy |
| After Piggy homecoming Talk completes | **Whisper** or skip if spectacle already reflected | Relationship beat |
| After consequential Opportunity Accept/Wait (Living Cashflow) | **Whisper** rare (throttle) | Only if first of kind or streak-edge |
| After debt crisis / storm band cross | **Whisper** | Obligation literacy |
| After Freedom Seal | **Whisper** milestone | Celebration ≠ worksheet |
| Soft Beat dismiss | **Never** | Peek only |
| Quiz clear / tip dismiss | **Never** | School STOP |
| Every Pay Day | **Never** | Noise |

**Throttle:** ≤1 short reflection per Harbor return; ≤1 deep open per day-key unless player opts in from Plinth.

---

## 3. Prompt set (internal curriculum)

Use these intents — **player-facing copy is myth-short**, not the academic headers.

| Intent | Academic label (designers only) | Default player shape | Deep-on-demand shape |
|--------|----------------------------------|----------------------|----------------------|
| P1 | WHAT HAPPENED? | Auto-filled statement (not a blank) | Confirm / tweak chip |
| P2 | WHY DID IT HAPPEN? | One because-line from state | Pick among 2–3 causal chips |
| P3 | WHAT TRADE-OFF DID YOU MAKE? | “Instead of…” from opp cost | Pick forgone option label |
| P4 | WHAT WOULD YOU CHANGE? | Skip in whisper; deep only | One alternate chip or “keep it” |
| P5 | WHERE ELSE COULD THIS PRINCIPLE MATTER? | Skip in whisper; deep only | Point at next painting / deal class — **no answer spoiler** |

**Whisper default = P1 auto + optional P2 tap.**  
P3–P5 live in **Deepen** only.

---

## 4. Personalization from game state

Fill templates from save — examples:

| State | Whisper example |
|-------|-----------------|
| Cove jar Take | “You chose **Jar before treat.** Harbor kept it.” |
| Cove treat | “You chose **Treat before jar.** The tab still owes.” |
| Deal booth | “You bought **Shell Craft Booth** — it holds +10/mo.” |
| Wait on deal | “You waited. Your coins stayed on hand.” |
| Credit haste + storm | “Haste fed the spiral — the sky tightened.” |
| Freedom Seal | “You escaped the grind. Harbor knows.” |

P2 chips (deep): e.g. “Because keep rose” / “Because the tab drains” / “Because I waited” — only chips consistent with CERTAIN/ESTIMATED causal graph; include honest **Unknown** only if needed.

Never ask free-text “explain opportunity cost.”

---

## 5. UI modes

### 5.1 Whisper (normal — extremely short)

```
┌──────────────────────────────────────┐
│  Harbor kept “Jar before treat.”      │
│  [ Why? ]     [ Keep walking ]        │
└──────────────────────────────────────┘
```

- Auto **WHAT HAPPENED** (P1).  
- **Why?** expands one because-line (P2) inline, still one tap.  
- **Keep walking** / Esc dismisses — counts as `reflection_skipped`.  
- No P3–P5. No scrolling form.  
- May sit on share lower-third or post-Piggy card; cinema captions stay primary during spectacle.

### 5.2 Deepen (on demand — Layer 3)

Entry points: Plinth “Reflect on this plaque” · Whisper “Think longer” · Chronicle event · Settings off by default for kids.

```
Fortune Thread · this footprint
  Happened: …
  Why: [chip] [chip] [chip]
  Instead of: …
  Next time I’d: [keep] [other fork label]
  This might matter when: [Paycheck stall] [a deal under storm] …
  [ Done ]
```

- Still chips, not paragraphs.  
- Max ~5 interactions.  
- Saves `reflection_deep_completed` for experiment — **not** mastery.

### 5.3 What we refuse

| Refuse | Why |
|--------|-----|
| Multi-paragraph journal | Worksheet |
| Forced answer before Piggy | Breaks relationship loop |
| Rubric scores / stars for reflection | Classroom grade |
| Bag lecture restating the tip | Fake comprehension |
| Spoiling transfer answer in P5 | Kills ITR test |

---

## 6. Placement in the signature loop

```
Take → hush → carpet → spectacle → [optional Whisper]
     → share → Piggy → [optional Whisper if not yet]
     → free play → transfer situation (no guidance)
```

Reflection is **after consequence + world response**, before or beside the next decision — never instead of the decision.

Aligns with: DECISION → CONSEQUENCE → CHARACTER/WORLD → (optional name it) → NEW DECISION.

---

## 7. Stored fields (lightweight)

Per reflection instance (ring buffer, cap ~20):

```text
ReflectionRecord {
  id
  at
  concept_id?              // if mappable
  trigger: spectacle|piggy|deal|seal|crisis
  mode: whisper|deep
  outcome: skipped|p1_seen|p2_seen|deep_done
  decision_id / scar_id / deal_id
  chips_selected?: string[]
  duration_ms?
}
```

Aggregate for experiments:

| Metric | Use |
|--------|-----|
| `reflection_offered` | Denominator |
| `reflection_whisper_engaged` | P1/P2 |
| `reflection_deep_engaged` | Deepen |
| `reflection_skipped` | Opt-out |
| Later `independent_transfer_success` on linked `concept_id` | **Dependent variable** |

Do not store essays.

---

## 8. Experiment: does reflection improve transfer?

### Hypothesis

Players who engage Whisper (P1+P2) after guided Cove Take show higher `independent_transfer_success` on `save_vs_spend` / Paycheck transfer than players who skip — holding FTUE length roughly equal.

### Design (A/B or phased)

| Arm | Behavior |
|-----|----------|
| **A — Control** | No Whisper; spectacle + Piggy only (today) |
| **B — Whisper** | Optional P1+P2 after spectacle |
| **C — Deep prompt** | Whisper + one-tap invite to Deepen (still skippable) |

### Primary outcome

`independent_transfer_success` for the linked concept within the transfer window (`transfer_attempts`, `transfer_time` secondary).

### Guardrails

- No arm may block Carpet/Piggy.  
- Experienced skip / reduced-motion: prefer shorter Whisper or control.  
- If B/C hurt freeplay conversion or raise quit at spectacle → ship Control.  
- Reflection engagement ≠ transfer success (don’t circularly define mastery).

### Sample playtest script

1. Fresh save → Cove Take → home cinema.  
2. Arm B: note skip vs Why tap.  
3. Later Paycheck transfer with guidance removed.  
4. Compare transfer pass rates; cold retell quality as qualitative backup.

---

## 9. Voice & a11y

- Kid sentences; organ verbs when relevant.  
- Certainty language only if showing Why chips (`Certain` / `Estimated`) — literacy, not exam.  
- Mute: text sufficient.  
- Reduced motion: no extra flash; static card.  
- High contrast: share lower-third rules apply.

---

## 10. Phased delivery

| Phase | Ship |
|-------|------|
| **0** | Spec + analytics hooks design |
| **1** | Whisper after spectacle (P1 auto + Why) for spine Takes only |
| **2** | Plinth Deepen for latest plaque |
| **3** | Deal/crisis whispers (throttled) |
| **4** | A/B vs ITR; keep or cut |

---

## 11. Success criteria

1. Median Whisper time &lt; 8 seconds when engaged.  
2. Skip always one tap / Esc.  
3. Playtesters do not call it “homework.”  
4. Experiment reports ITR delta; ship only if neutral-to-positive on transfer **and** quit.  
5. Zero MASTERED flags set by reflection alone.

---

## 12. Anti-patterns (STOP)

GAMEPLAY → long reflection worksheet → GAMEPLAY  

Prefer: DECISION → CONSEQUENCE → WORLD → **optional name** → NEW DECISION.
