# FTUE experiment brief

**experiment_id:** `_______________`  
**ftue_version:** `ashore_v1` (must match code `FTUE_VERSION`)  
**status:** draft / running / paused / awaiting_review / shipped / rejected  
**owner:** _______________  
**created:** _______________

---

## hypothesis

>

## learning_problem

>

## target_behavior

>

## control

- **id:** `control`
- **description:**

>

## variant

- **id:** `_______________`
- **description:**

>

## primary_metric

Pick **one** (tutorial completion forbidden):

- [ ] `independent_transfer_rate`
- [ ] `time_to_first_core_loop` (direction: decrease)
- [ ] `freeplay_conversion`
- [ ] `failure_recovery_rate`
- [ ] `d1_retention`

**primary_direction:** increase / decrease

## guardrail_metrics

- [ ] `failure_recovery_rate`
- [ ] `d1_retention`
- [ ] `d7_retention`
- [ ] `independent_transfer_rate`
- [ ] `freeplay_conversion`
- [ ] `time_to_first_core_loop`
- [ ] `tutorial_completion_rate` _(diagnostic secondary only)_
- Other:

## minimum_observation_policy

- min_sessions_per_arm: ___ (≥3; prefer ≥5)
- require_usability_cohort: yes / no
- max_calendar_days: ___

## stop_condition

- on_observation_met: **pause_for_review**
- guardrail_max_relative_drop: ___ (e.g. 0.15)
- on_usability_blocker: **stop_and_fix**
- auto_ship: **false** _(required)_

## interpretation_rules

- tutorial_completion: **diagnostic_secondary_only**
- require_human_review: **true**
- notes:

>

---

## Implementation checklist

- [ ] Added to `FTUE_EXPERIMENT_REGISTRY` as `draft`
- [ ] `validateFtueExperiment()` clean
- [ ] Variant behavior behind assignment check (no silent global change)
- [ ] Telemetry already stamps `ftue_version` / `experiment_id` / `experiment_variant`
- [ ] Usability protocol planned if comprehension risk
- [ ] Status → `running` only via reviewed PR
