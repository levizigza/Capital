# FTUE experimentation framework

Versioned A/B (and holdout) framework for Capital onboarding.  
**Winners are never auto-shipped.** Tutorial completion is diagnostic only.

**Code:** `src/islands/ftueExperiments/`  
**Telemetry:** `docs/ftue/FTUE_TELEMETRY.md`  
**Usability:** `docs/ftue/FTUE_USABILITY_PROTOCOL.md`

---

## Required experiment fields

Every FTUE experiment **must** contain:

| Field | Meaning |
|-------|---------|
| `hypothesis` | Falsifiable claim |
| `learning_problem` | What teaching failure we are addressing |
| `target_behavior` | Observable player behavior we want |
| `control` | Current production arm |
| `variant` | Proposed arm |
| `primary_metric` | One of the prioritized metrics below |
| `guardrail_metrics` | Must not regress beyond stop rules |
| `minimum_observation_policy` | Floor sessions / cohort / calendar cap |
| `stop_condition` | Always `auto_ship: false` + pause for review |
| `interpretation_rules` | Human review required; tutorial completion secondary |

Incomplete defs fail `validateFtueExperiment()` and cannot be `running`.

---

## Prioritized primary metrics

Use **one** of:

1. `independent_transfer_rate`
2. `time_to_first_core_loop` _(lower is better → `primary_direction: "decrease"`)_
3. `freeplay_conversion`
4. `failure_recovery_rate`
5. `d1_retention`

**Not allowed as primary:** `tutorial_completion_rate` (diagnostic secondary / guardrail only).

---

## FTUE version on analytics

`FTUE_VERSION` (currently `ashore_v1`) is the single source of truth in `ftueExperiments/types.ts`.

Every **relevant** analytics event is stamped with:

- `ftue_version` — exact version string  
- `experiment_id` — registry id  
- `experiment_variant` — assigned arm  

Stamped automatically in `analytics.track` for FTUE + onboarding-adjacent events (sessions, tutorial, concepts, quests, minigames, dialogue, core-loop beats, etc.).

Bump `FTUE_VERSION` only with a deliberate changelog note; sticky assignments re-resolve when the version changes.

---

## Assignment

- Sticky device assignment: `localStorage.capital_ftue_assignment_v1`
- Query override: `?ftueExp=experimentId:variant` or `?exp=variant`
- Only `status: "running"` experiments enter random assignment
- Default: `ftue_baseline_control` / `control`

---

## Stop & interpret

1. Hit `minimum_observation_policy` → **pause for review** (`awaiting_review`)  
2. Guardrail relative drop or usability Blocker → **stop and fix**  
3. **Never** flip traffic automatically when primary wins  

---

## Human review (required to ship)

Review gates (all must Pass):

- comprehension  
- retention  
- player autonomy  
- accessibility  
- unintended behavior  
- technical regressions  

Packet: `FtueExperimentHumanReview` + template  
`evaluateShipReadiness()` / `assertHumanReviewAllowsShip()` — there is **no** `shipExperiment()` that changes live traffic. Shipping is a **human PR** that updates registry status to `shipped` after review.

Templates:

- [experiments/TEMPLATE_EXPERIMENT.md](./experiments/TEMPLATE_EXPERIMENT.md)  
- [experiments/TEMPLATE_HUMAN_REVIEW.md](./experiments/TEMPLATE_HUMAN_REVIEW.md)

---

## Registry

| Id | Status | Notes |
|----|--------|-------|
| `ftue_baseline_control` | shipped | Named control / version stamp |
| `ashore_coach_density_v1` | draft | Example — reduce coach after Ashore |

Add new experiments as `draft` → validate → `running` via PR. Promote to `shipped` only after human review.
