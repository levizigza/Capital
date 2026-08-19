# FTUE usability-testing protocol

**Purpose:** Repeatable, small-cohort human testing of Capital’s first-session teaching loop.  
**Scope:** Title → Cast → Ashore Teach → Carpet → Harbor → Cove First Coins + Take → consequence → freeplay / transfer.  
**Related:** `FTUE_TELEMETRY.md` · `FAILURE_RECOVERY.md` · `TRANSFER_TASKS.md` · `PLAYER_ONBOARDING.md` · `ashore-tutorial-research.md` · `pattern-human-playtest.md`

---

## Non-negotiable observer law

**Observers must not help participants unless this protocol explicitly requires intervention.**

| Allowed | Forbidden |
|---------|-----------|
| Scripted briefing + consent | “Press E” / pointing at the UI |
| Technical rescue (crash, blank screen, audio stuck) | Explaining money concepts mid-session |
| Scripted post-task interview questions | Hinting the “correct” Take |
| Stopping the session for safety / distress | Coaching toward transfer success |

If the participant asks for help: **record the ask**, then say only the scripted line in [TEMPLATE_OBSERVER_SCRIPT.md](./usability/TEMPLATE_OBSERVER_SCRIPT.md) (“Keep going with what you’d try in a real game”). Do **not** answer the content question during the task.

**Intervention exceptions (must log as INTERVENTION):**

1. **Hard softlock** — >90s with no progress and no recoverable action (stuck modal, dead input).
2. **Build break** — crash, infinite load, corrupted save.
3. **Accessibility emergency** — participant cannot perceive required signal even after their own settings attempt; offer Settings only, not the solution.
4. **Distress** — stop the session; do not continue testing.

After any intervention: mark the task **contaminated** for transfer/success scoring. Still keep observations.

---

## Cohort size & stop rule

| Rule | Value |
|------|--------|
| Cohort size | **3–5** participants (prefer 4) |
| Max cohorts on same build | **2** before a fix lands |
| Stop early | Same **Major** or **Blocker** finding in **≥2** of first 3 sessions → **fix before more testing** |
| Do not | Run large samples against an obviously broken design |

**Law:** Prefer fix → retest over n→∞ on a known broken path.

---

## Participant profiles (recruit mix)

Aim for variety across cohorts, not perfection in one:

- **New** — no Capital save; little/no money-game experience  
- **Experienced** — played similar games; may use cast “experienced” skip  
- **Returning** — prior Capital save with ≥72h absence (or simulated `lastActiveAt`)

Exclude: designers of the current FTUE, people who already know the intended Take outcome for this build.

---

## Session structure (45–60 min)

1. **Brief + consent** (5 min) — [TEMPLATE_PARTICIPANT_BRIEF.md](./usability/TEMPLATE_PARTICIPANT_BRIEF.md)  
2. **Cold play task** (25–35 min) — think-aloud encouraged; observer silent except scripted prompts  
3. **Guided interview** (10–15 min) — [TEMPLATE_SESSION_LOG.md](./usability/TEMPLATE_SESSION_LOG.md) § Interview (includes anecdote recall question — [ANECDOTE_SYSTEM.md](../research/ANECDOTE_SYSTEM.md))  
4. **Debrief** (optional 5 min) — may then explain design (not scored)

### Primary task script (new player)

> Start a fresh game. Learn how Capital works until you’ve made a money choice that Harbor remembers, then keep playing as you would at home.

**Success for the protocol is not “finished the tutorial.”** Prefer:

- Player can state in kid words what they did and what Harbor kept  
- Player recovers from at least one stumble without observer help  
- When guidance thins, player still has a next verb  
- On transfer prompt (Paycheck / second context), player applies the earlier rule — or clearly fails in a diagnosable way  

Align with telemetry primary KPIs (`FTUE_TELEMETRY.md`): freeplay, transfer, recovery — **not** tutorial completion alone.

---

## What observers must record

Live notes (timestamp + beat). Capture **all** of:

| Lens | Prompt |
|------|--------|
| **Attempts** | What the player tries (verbs, places, wrong-but-sensible actions) |
| **Hesitation** | Where they pause, re-read, circle, or freeze (>3s with intent unclear) |
| **Expects** | What they say or imply should happen next |
| **Notices** | Signals they react to (coach, Piggy, Bag, scar, hush, ledger) |
| **Ignores** | Signals present but unused |
| **Believes changed** | What they think the Take / quest / Harbor did |
| **Actually changed** | What the save/world did (scar, irreversible, ledger, quest) — observer verifies after or via QA |
| **Asks for help** | Exact ask + time; observer response (scripted refusal / intervention) |
| **Fails** | Where they fail a gate, minigame, or comprehension |
| **Understands why** | Yes / partial / no — with quote |
| **Recovers** | Whether they self-recover; attempt count |
| **Transfer** | Success / fail / not reached — which scenario |
| **After guidance disappears** | Behavior when coach/hints drop (freeplay, flail, reopen Settings, quit) |

Use [TEMPLATE_SESSION_LOG.md](./usability/TEMPLATE_SESSION_LOG.md) during the session. Promote sticky issues to finding cards.

---

## Finding format (mandatory)

Every finding **must** use five fields — no blended “insight” paragraphs:

```text
OBSERVATION:     What happened (behavior / quote / time). No why.
INTERPRETATION:  Your hypothesis about cause / mental model.
EVIDENCE:        Timestamps, quotes, save/telemetry, repeat across participants.
SEVERITY:        Blocker | Major | Minor | Nit | Positive
RECOMMENDATION:  Smallest change to test next cohort (or “monitor”).
```

Copy from [TEMPLATE_FINDING.md](./usability/TEMPLATE_FINDING.md).

### Severity rubric

| Level | Meaning | Action |
|-------|---------|--------|
| **Blocker** | Cannot complete core loop / softlock / false teaching | Fix before next cohort |
| **Major** | Repeated hesitation or wrong model that breaks transfer/recovery | Fix before expanding sample |
| **Minor** | Friction with workaround; rare | Backlog; retest after majors |
| **Nit** | Polish | Optional |
| **Positive** | Working teaching beat — protect in future changes | Keep |

---

## After each cohort

Use [TEMPLATE_COHORT_SUMMARY.md](./usability/TEMPLATE_COHORT_SUMMARY.md):

1. **Cluster** findings by beat (Ashore / Harbor / Cove / Transfer / Freeplay).  
2. **Identify repeated blockers** (≥2 participants or 1 Blocker).  
3. **Fix major blockers** (smallest shippable change).  
4. **Retest** with [TEMPLATE_RETEST.md](./usability/TEMPLATE_RETEST.md) — new participants preferred; same broken path only to verify the fix.  
5. Archive cohort folder under `docs/ftue/usability/cohorts/` (optional; do not commit PII).

**Do not** schedule “just three more people” when the same Major already fired twice.

---

## Privacy

- No real names in committed docs — use `P1`, `P2`, …  
- No emails, photos of faces, or raw screen recordings in the repo  
- Quotes OK if anonymized  
- Telemetry: local export only; see `FTUE_TELEMETRY.md`

---

## Reusable templates

| Template | Use |
|----------|-----|
| [TEMPLATE_PARTICIPANT_BRIEF.md](./usability/TEMPLATE_PARTICIPANT_BRIEF.md) | Consent + task framing |
| [TEMPLATE_OBSERVER_SCRIPT.md](./usability/TEMPLATE_OBSERVER_SCRIPT.md) | Silent observer lines + interventions |
| [TEMPLATE_SESSION_LOG.md](./usability/TEMPLATE_SESSION_LOG.md) | Live session notes |
| [TEMPLATE_FINDING.md](./usability/TEMPLATE_FINDING.md) | One finding card |
| [TEMPLATE_COHORT_SUMMARY.md](./usability/TEMPLATE_COHORT_SUMMARY.md) | End-of-cohort synthesis |
| [TEMPLATE_RETEST.md](./usability/TEMPLATE_RETEST.md) | Fix verification |

Index: [usability/README.md](./usability/README.md)

---

## Link to automation

Cold QA / signature loops prove systems. This protocol proves **human comprehension**. Pattern library #94 (`pattern-human-playtest.md`) can be filled from a cohort session that clears the pass bar — automation alone still does not Pass #94.
