# Independent Transfer — human playtest

**King KPI:** After Capital teaches a principle **once**, can the player reason with it in a **new situation without being told what to do?**

This file is how you get a real number. It is **empty of scores on purpose** until a non-designer plays.

Automation / QA seeds prove the stall is reachable. They do **not** count as Independent Transfer Rate.

## Cold protocol (n = 5 minimum)

1. Fresh profile. Observer **does not hint**.
2. Player plays Ashore → Harbor Piggy → Cove Take → carpet home → Piggy names the plaque.
3. Player boards Paycheck (map unlock is curiosity — do not say “apply the jar”).
4. Stop talking. Watch Vee’s stall.
5. Score **one binary per player:**

| Result | Counts as |
|--------|-----------|
| Commits Vee’s two-price Take (either price) **without** asking what the “right” Cove answer was, and without opening tutorial replay | **Independent transfer success** |
| Asks the observer what to do / maps it only after being told / quits before a Take | **Failure** (still a datapoint) |
| Opens Settings → Tutorial replay, then succeeds | **Hinted** — not independent |

**Independent Transfer Rate** = successes ÷ (successes + failures + hinted).

Do not ship a tutorial-completion bump as a win against this number.

## Seed for facilitators (not for the KPI)

Dev/QA: `__QA__.seedIndependentTransfer()` parks after Cove on Paycheck with the stall open. Use it to verify the surface. **Do not mix seed runs into the human ITR denominator.**

## Cohort log

Copy `docs/ftue/usability/TEMPLATE_SESSION_LOG.md` into `docs/ftue/usability/cohorts/YYYY-MM-DD-itr-v1/`.

| Id | Transfer success? | Hinted? | Notes |
|----|-------------------|--------|-------|
| P1 | | | |
| P2 | | | |
| P3 | | | |
| P4 | | | |
| P5 | | | |

**ITR this cohort:** _unmeasured_

When a human fills this, update [pattern-human-playtest.md](../pattern-human-playtest.md) and this line:

`HUMAN_ITR: PENDING`
