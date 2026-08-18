# Privacy-conscious FTUE telemetry

Local-first instrumentation for Harbor / Ashore / Cove learning loops.  
**King KPI is Independent Transfer Rate** — see [NORTH_STAR.md](./NORTH_STAR.md).  
**Canonical event + Measure list:** [docs/design/LEARNING_TELEMETRY.md](../design/LEARNING_TELEMETRY.md).

**Hard law:** Never use tutorial completion as the primary measure of success.

## Events (instrument)

| Event | Meaning |
|-------|---------|
| `first_meaningful_decision` | First consequential Take / irreversible locked |
| `first_complete_loop` | First felt Earn→Decide→Take→consequence |
| `decision_time` | Dwell ms on decision surface (`dwellMs`) |
| `decision_selected` / `decision_changed` | Lock / change before lock |
| `consequence_displayed` | Hush, scar, Harbor felt |
| `failure` / `recovery` | Fail + successful retry |
| `hint_requested` / `hint_offered` / `hint_used` | Assist density |
| `ai_intervention` | Adaptive coach nudge shown |
| `transfer_started` / `transfer_success` / `transfer_failure` | Transfer tasks |
| `reflection_started` / `reflection_completed` | Optional Whisper |
| `freeplay_started` | Map / hub autonomy |
| `session_end` / `return_session` | Session lifecycle |

Legacy aliases (`decision_committed`, `failure_occurred`, `retry_successful`, `freeplay_entered`, `session_ended`) are still **accepted in metrics**.

## Metrics (measure)

| Metric | Role |
|--------|------|
| **`independent_transfer_rate`** | **King.** Successful transfers ÷ transfer attempts |
| `time_to_first_decision` | Elapsed → first meaningful decision |
| `time_to_first_complete_loop` | Elapsed → first complete felt loop |
| `failure_recovery_rate` | recovery ÷ failure |
| `hint_dependency` | Hint sessions ÷ practice sessions |
| `strategy_diversity` | Unique `choiceId` ÷ decision locks |
| `D1` / `D7` / `D30` | Local calendar return (`d1_retention` …) |
| `tutorial_completion_rate` | **Diagnostic only — never the ship metric** |

If a change only raises tutorial completion, do **not** ship it as a win.

## Segments (on every FTUE event)

`ftue_version` · `experiment_id` · `experiment_variant` · `platform` · `experience_mode` · `skip_status` · `hint_usage` · `failure_pattern` · `concept_id`

Exact `ftue_version` is also stamped on all onboarding-relevant `analytics.track` events (see `FTUE_EXPERIMENTATION.md`).

## Privacy rules

- Allowlisted payload keys only (`FTUE_PAYLOAD_ALLOWLIST`)
- Block names, emails, dialogue text, freeform coach copy
- Taxonomy ids must match `^[a-z0-9][a-z0-9_.:-]{0,63}$`
- Session ids are opaque UUIDs; retention uses calendar day keys, not accounts
- Storage remains local KV / export — no remote sink in this module

## Code

- `src/islands/analytics/ftue/` — types, privacy, context, track, lifecycle, metrics
- Wired from `IslandsApp`, Ashore teach, BootCastSelect, Take hush, Scar spectacle, adaptive coach
- Export UI: Settings → Analytics — **FTUE primary metrics** panel (king KPI first)

## Experiment variant

See `docs/ftue/FTUE_EXPERIMENTATION.md`.

- Sticky assignment + `?ftueExp=experimentId:variant` / `?exp=variant`
- Winners never auto-ship; human review required
- `FTUE_VERSION` is the single exact version string on events

## Human testing

Pair telemetry with the repeatable protocol in `docs/ftue/FTUE_USABILITY_PROTOCOL.md` (small cohorts, no observer help, fix-before-expand). Templates live under `docs/ftue/usability/`.

Experimentation (versioned hypotheses, human review, no auto-ship): `docs/ftue/FTUE_EXPERIMENTATION.md`.
