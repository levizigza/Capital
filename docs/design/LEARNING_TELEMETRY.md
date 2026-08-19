# Learning telemetry — Capital

**Date:** 2026-08-18  
**Code:** `src/islands/analytics/ftue/` · Settings → Analytics  
**North star:** `docs/ftue/NORTH_STAR.md`

## Hard law

**Never use tutorial completion as the primary measure of success.**

King KPI is **Independent Transfer Rate**. Tutorial / FTUE shell finish is diagnostic only — useful for QA, never a ship win by itself.

---

## Events (instrument)

| Event | Meaning | Emit when |
|-------|---------|-----------|
| `first_meaningful_decision` | First consequential money choice locked | Once per session on first irreversible Take commit |
| `first_complete_loop` | First full Earn→Decide→Take→felt consequence | Once per session on first signature consequence (hush / scar / Plinth) |
| `decision_time` | Dwell on a decision surface | Alongside select/commit; payload `dwellMs` from present→select |
| `decision_selected` | Player locks a choice | Irreversible choice / Take commit (`choiceId`, `kind`) |
| `decision_changed` | Player switches option before lock | New `choiceId` ≠ prior hover/select on same presented decision |
| `consequence_displayed` | World shows the outcome | Take hush, scar spectacle, Harbor felt beat |
| `failure` | Player failed a recoverable challenge | Minigame / quest fail (dignity path) |
| `recovery` | Player recovers after failure | Successful retry / continue after fail |
| `hint_requested` | Player asked for help | Returning refresher, explicit hint, assist request |
| `ai_intervention` | Adaptive coach / Bag nudge fires | Non-structural adaptive tip shown (`via` = nudge id) |
| `transfer_started` | Analogous transfer surface armed | Concept transfer attempts increment / land on transfer island |
| `transfer_success` | Independent transfer proof | Concept → INDEPENDENT (**not** tip dismiss) |
| `reflection_started` | Optional Whisper open | Reflection UI opens |
| `reflection_completed` | Whisper answered / closed with intent | Reflection finishes (skip ≠ success unless tagged) |
| `freeplay_started` | Autonomy / map / hub free play | Map open or hub guided done |
| `session_end` | Session closes | User exit / islands leave |
| `return_session` | Returning player session | Boot with prior progress / ≥ return threshold |

### Legacy aliases (still accepted in metrics)

Older emits remain readable so local history does not break:

| Canonical | Legacy |
|-----------|--------|
| `decision_selected` | `decision_committed` |
| `failure` | `failure_occurred` |
| `recovery` | `retry_successful` |
| `freeplay_started` | `freeplay_entered` |
| `session_end` | `session_ended` |
| `first_complete_loop` | first `consequence_displayed` (time proxy) |

---

## Metrics (measure)

| Metric | Definition | Role |
|--------|------------|------|
| **`independent_transfer_rate`** | `transfer_success` ÷ max(`transfer_started`, `transfer_success`) | **King KPI** |
| `time_to_first_decision` | Session elapsed ms → `first_meaningful_decision` or first `decision_selected` / presented | Speed to consequential choice |
| `time_to_first_complete_loop` | Session elapsed ms → `first_complete_loop` (else first consequence) | Speed to felt full loop |
| `failure_recovery_rate` | `recovery` ÷ `failure` | Resilience |
| `hint_dependency` | Sessions with hint_requested/used ÷ sessions with practice | Assist load |
| `strategy_diversity` | Unique `choiceId` ÷ decision_selected count | Avoid single-path grinding as “success” |
| **`D1` / `D7` / `D30`** | Calendar return on day n after first local day key | Retention (no account ids) |

### Explicitly secondary

| Metric | Role |
|--------|------|
| `tutorial_completion_rate` | Diagnostic QA only — **never** primary, never experiment primary |

If a change only raises tutorial completion, **do not ship it as a win**.

---

## Privacy

- Allowlisted payload keys only (`FTUE_PAYLOAD_ALLOWLIST`)
- No names, emails, dialogue bodies, freeform coach copy
- Taxonomy ids: `^[a-z0-9][a-z0-9_.:-]{0,63}$`
- Retention via local calendar day keys only

---

## Implementation order

1. Schema + metrics (this doc + `types.ts` / `metrics.ts`) — **done in code**
2. Emit canonical names from track helpers
3. Wire `ai_intervention`, `decision_changed`, reflection hooks
4. Export UI shows king KPI first; tutorial rate dashed/secondary
5. Human playtests still required — local ITR ≠ live product ITR until remote sink exists

---

## Related

- `docs/ftue/FTUE_TELEMETRY.md` — privacy + FTUE shell notes  
- `docs/research/LEARNING_TRANSFER_FRAMEWORK.md` — per-principle stages + IFTR definition  
- `docs/research/ANECDOTE_SYSTEM.md` — emergent story telemetry + recall validation  
- `docs/design/CONCEPT_MASTERY_PEDAGOGY.md` — transfer ≠ tip click  
- `docs/design/REFLECTION_SYSTEM.md` — Whisper A/B vs ITR  
- `docs/design/AI_GUIDE_MINIMUM_INTERVENTION.md` — intervention levels  
