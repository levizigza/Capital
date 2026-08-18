# Observational playtest process — Capital

**Purpose:** Structured human observation of play — what people notice, try, believe, and transfer — without coaching them to the intended answer.  
**Loop:** Small cohort → record → separate layers → fix repeated majors/blockers → retest.  
**Related:** `docs/ftue/FTUE_USABILITY_PROTOCOL.md` · templates in `docs/ftue/usability/` · `docs/design/LEARNING_TELEMETRY.md` · `docs/design/HEALTH_DASHBOARD.md`

---

## Hard laws

1. **Observers do not help** unless the FTUE protocol intervention exceptions fire (softlock, crash, a11y emergency, distress).  
2. **Separate layers** — never blend what you saw with what you think it means.  
3. **Small cohorts** (3–5). Prefer **fix → retest** over large samples on a known broken path.  
4. **Tutorial completion is not success.** Prefer recovery, freeplay next-verb, and independent transfer.  
5. **Never optimize one health category while ignoring damage to another** (engagement / learning / business).

---

## Cycle

```text
Recruit small cohort (3–5)
        ↓
Cold observational sessions (silence rules)
        ↓
Session logs → Finding cards (four layers)
        ↓
Cohort summary — cluster repeats
        ↓
Same Blocker/Major in ≥2 of first 3? ──yes──→ Fix before more testing
        ↓ no
Optional second cohort on same build (max 2)
        ↓
Ship smallest fix for repeated majors/blockers
        ↓
Retest (new participants preferred)
        ↓
Pass → resume cadence · Fail → redesign
```

| Rule | Value |
|------|--------|
| Cohort size | **3–5** (prefer 4) |
| Max cohorts on same build | **2** before a fix |
| Stop early | Same **Major** or **Blocker** in **≥2** of first 3 → **fix first** |
| Retest n | Often **2–3** cold players enough to verify a fix |

---

## What to record (every session)

Use [TEMPLATE_SESSION_LOG.md](../ftue/usability/TEMPLATE_SESSION_LOG.md). Capture **all** of:

| Record | Prompt |
|--------|--------|
| **What player notices** | Signals they react to (coach, Piggy, Bag, scar, hush, Plinth, ledger, map) |
| **What player ignores** | Signals present but unused |
| **What they expect** | What they say or imply should happen next |
| **What they attempt** | Verbs, places, wrong-but-sensible actions |
| **Why they think an outcome occurred** | Their causal story (quote) — not yours |
| **Where they hesitate** | Pause, re-read, circle, freeze (>3s intent unclear) |
| **Where they fail** | Gate, minigame, Take, path, comprehension |
| **Whether they recover** | Self-recover / intervention / did not — attempt count |
| **What strategy they form** | Recurring plan or rule they state or enact |
| **Whether they transfer learning** | New context without being told — success / fail / not reached |
| **What they choose during free play** | After guidance thins: map, digression, shop, quit, flail, etc. |

Also log: help asks, observer interventions, world truth vs believed change (verify after).

---

## Four layers (mandatory on every finding)

Do **not** write blended “insight” paragraphs. Use [TEMPLATE_FINDING.md](../ftue/usability/TEMPLATE_FINDING.md):

```text
OBSERVATION:      What happened (behavior / quote / time). No why.
INTERPRETATION:   What this might mean for the player’s model or the UI.
HYPOTHESIS:       Testable cause → effect claim for the next fix.
RECOMMENDATION:   Smallest change to try before the next cohort (or “monitor”).
```

Supporting fields (keep on the card):

- **EVIDENCE** — timestamps, quotes, repeat count, save/telemetry ids  
- **SEVERITY** — Blocker | Major | Minor | Nit | Positive  

### Severity → action

| Level | Meaning | Action |
|-------|---------|--------|
| **Blocker** | Softlock / cannot complete core loop / false teaching | Fix before next cohort |
| **Major** | Repeated hesitation or wrong model that breaks transfer/recovery | Fix before expanding sample |
| **Minor** | Friction with workaround | Backlog; retest after majors |
| **Nit** | Polish | Optional |
| **Positive** | Working teaching beat | Protect |

### Layer hygiene

| Bad | Good |
|-----|------|
| “Player was confused by the carpet because the CTA is weak” | **O:** Paused 12s at plaza, said “is this the exit?” · **I:** Carpet not read as travel · **H:** Stronger board affordance raises board rate without hurting ITR · **R:** Glow + binding-aware “Board” once |
| Mixing three participants into one causal story | One observation per card; note repeat count in Evidence |

---

## Session flow (45–60 min)

1. **Brief + consent** — [TEMPLATE_PARTICIPANT_BRIEF.md](../ftue/usability/TEMPLATE_PARTICIPANT_BRIEF.md)  
2. **Cold play** (25–35 min) — think-aloud OK; observer silent except [TEMPLATE_OBSERVER_SCRIPT.md](../ftue/usability/TEMPLATE_OBSERVER_SCRIPT.md)  
3. **Interview** — session log § Interview (clarify; still quote)  
4. **Promote findings** — one card per sticky issue  
5. Optional debrief (unscored)

**Primary task (new player):**

> Start a fresh game. Learn how Capital works until you’ve made a money choice that Harbor remembers, then keep playing as you would at home.

---

## After each cohort

1. Fill [TEMPLATE_COHORT_SUMMARY.md](../ftue/usability/TEMPLATE_COHORT_SUMMARY.md)  
2. Cluster by beat (Ashore / Harbor / Cove / Transfer / Freeplay)  
3. List repeated blockers/majors  
4. **Fix** those first (smallest shippable change)  
5. **Retest** with [TEMPLATE_RETEST.md](../ftue/usability/TEMPLATE_RETEST.md)  
6. Archive anonymized notes under `docs/ftue/usability/cohorts/` (no PII)

**Do not** recruit “just three more” when the same Major already fired twice.

---

## Pair with telemetry (optional)

Local export only — Settings → Analytics / health dashboard. Useful companions:

- `time_to_first_decision` / `time_to_first_complete_loop`  
- `independent_transfer_rate` (qualitative transfer still required)  
- `failure_recovery_rate` · `hint_dependency` · freeplay / continuation  

Never let a green tutorial-completion number override a Blocker finding.

---

## Quick observer checklist

Copy [TEMPLATE_OBSERVATION_CHECKLIST.md](../ftue/usability/TEMPLATE_OBSERVATION_CHECKLIST.md) beside the session log.

---

## Templates index

| Artifact | Role |
|----------|------|
| This doc | Process law + cycle |
| `FTUE_USABILITY_PROTOCOL.md` | FTUE-scoped detail + intervention codes |
| `TEMPLATE_SESSION_LOG.md` | Live record lenses |
| `TEMPLATE_FINDING.md` | O / I / H / R card |
| `TEMPLATE_COHORT_SUMMARY.md` | Cohort synthesis |
| `TEMPLATE_RETEST.md` | Fix verification |
| `TEMPLATE_OBSERVATION_CHECKLIST.md` | Pocket record list |
