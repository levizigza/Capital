# Findings taxonomy

Classify **after** observational scoring. One finding = one issue or delight theme, not a whole session.

## Classes

| Class | Meaning | Typical action |
|-------|---------|----------------|
| **CRITICAL BLOCKER** | Cannot complete a core goal (signature path) even with motivation; data loss; soft-lock; safety | Fix before next recruit cohort if iconic path |
| **MAJOR FRICTION** | Completes only with long struggle, wrong mental model, or high mis-tap rate on primary path | Prioritize in craft backlog |
| **MINOR FRICTION** | Annoyance / delay on secondary path; recovered quickly | Polish queue |
| **DELIGHT** | Uninstructed joy, lean-in, memorable cause-effect | Protect; do not “optimize away” |
| **OPPORTUNITY** | User wants a job Capital almost supports | Backlog hypothesis — not automatic scope |
| **UNEXPECTED BEHAVIOR** | Valid novel strategy or interpretation | Study; may be feature or confusion |

## Evidence rules (mandatory)

A finding is **invalid for product decisions** without evidence:

1. `finding_id`  
2. `class`  
3. `test_ids` involved  
4. `participant_ids` (de-identified) count ≥1  
5. `evidence_refs` → files under `evidence/` with: timestamp or clip id, observation quote/behavior, task outcome  
6. `confidence`: low / med / high (raise only with ≥2 participants **or** 1 + clear recording)

**Do not** store raw videos in git. Store pointers: `recording_id`, `t_start`, `t_end`, private drive location outside repo if needed.

## Finding file template

See `findings/_TEMPLATE.md`. After a cohort, write `findings/COHORT_A1_FINDINGS.md` index + individual `F-###.md` as needed.

## Mapping to product change

| Class | May recommend iconic-path change? |
|-------|-----------------------------------|
| CRITICAL BLOCKER | Yes — targeted fix |
| MAJOR FRICTION | Yes — if on Cove→Plinth→share |
| MINOR / OPPORTUNITY | Prefer deepen interiors; no map widen (iconic freeze) |
| DELIGHT | Preserve |
| UNEXPECTED | Investigate before changing |

Recruitment STOP gate still applies: analyze cohort → then decide changes → then unlock next cohort.
