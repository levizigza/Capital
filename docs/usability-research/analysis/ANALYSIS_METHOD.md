# Analysis method

## Three layers (never collapse)

| Layer | What it is | Allowed language |
|-------|------------|------------------|
| **OBSERVATION** | What was seen/heard during a task, tied to participant + time + evidence | “P-A1-02 paused 28s at plaza before any movement” |
| **INTERPRETATION** | Analyst’s inferred cause or mental model | “Likely looking for a HUD quest marker” |
| **RECOMMENDATION** | Proposed product change | “Increase Piggy silhouette contrast before first Talk” |

Rules:

1. Every issue record stores the three layers in **separate fields**.  
2. Recommendations without observations are **invalid**.  
3. Interpretations are hypotheses (`confidence` required).  
4. A single participant’s **stated preference** is never “users want X.” Quote it under observation; cluster only if behavior or requests repeat.

## Single-participant rule

| n affected (in cohort) | Allowed claim |
|------------------------|---------------|
| 1 | “One participant…” — max confidence **low** for generalization |
| 2 | “Recurring in this cohort…” — confidence up to **med** |
| ≥3 or ≥50% of completes | “Cohort pattern…” — confidence up to **high** for *this segment* |

Never write “everyone” / “users always” from one quote.

## Issue record (required fields)

For every issue:

| Field | Meaning |
|-------|---------|
| `participants_affected` | De-identified ids |
| `frequency` | count and % of cohort completes |
| `severity` | CRITICAL_BLOCKER → MINOR (same taxonomy as findings) |
| `task_affected` | UT-xx ids |
| `evidence` | E-xxx refs |
| `likely_cause` | Interpretation (separate) |
| `confidence` | low / med / high |
| `proposed_correction` | Recommendation (prefer friction removal) |

Plus explicit:

- `observation:`  
- `interpretation:`  
- `recommendation:`  

## Clustering

Cluster when ≥2 participants share the same **behavioral pattern** on the same task family (not merely the same adjective “confused”).

Cluster labels to fill in the report:

- repeated confusion  
- repeated friction  
- repeated delight  
- misunderstood mechanics  
- misunderstood terminology  
- onboarding failures  
- features users ignore  
- features users unexpectedly value  
- requests that appear repeatedly  
- requests that contradict observed behavior  

## Prioritization

See `PRIORITIZATION.md`: **priority_score = IMPACT × FREQUENCY × CORE_LOOP_IMPORTANCE**.

Prefer **removing friction from existing systems** over new features. Iconic freeze: no new outer islands.
