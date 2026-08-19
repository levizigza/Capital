# Privacy-conscious FTUE telemetry

Local-first instrumentation for Harbor / Ashore / Cove learning loops.  
**King KPI is Independent Transfer Rate** — see [NORTH_STAR.md](./NORTH_STAR.md).  
Tutorial shell completion is diagnostic only.

## Events (minimum set)

| Event | Meaning |
|-------|---------|
| `ftue_started` | First FTUE / Ashore / experienced boot |
| `first_control_received` | First walk/move proof |
| `first_meaningful_action` | Talk, map open, or dialogue choice |
| `decision_presented` | Irreversible Take choices shown |
| `decision_committed` | Take / irreversible locked |
| `consequence_displayed` | Take hush, scar, Harbor felt |
| `concept_introduced` | Concept → GUIDED |
| `concept_practiced` | Concept → REDUCED_GUIDANCE |
| `hint_offered` / `hint_requested` / `hint_used` | Assist density |
| `failure_occurred` / `retry_started` / `retry_successful` | Recovery loop |
| `transfer_started` / `transfer_success` / `transfer_failure` | Transfer tasks |
| `guidance_reduced` | Coach density drops |
| `autonomy_unlocked` | INDEPENDENT or MASTERED |
| `tutorial_skipped` | Experienced skip / Ashore skip |
| `tutorial_replayed` | Settings or returning refresher |
| `freeplay_entered` | Map open / hub guided done |
| `session_ended` | Exit |
| `return_session` | Returning player (≥72h) |

## Metrics

**King KPI — Independent Transfer Rate** (see [NORTH_STAR.md](./NORTH_STAR.md)):

| Metric | Role |
|--------|------|
| **`independent_transfer_rate`** | **King.** Successful transfer events ÷ transfer attempts. After Capital teaches a principle once, can the player reason with it in a different situation without being told? Formal per-principle definition: [LEARNING_TRANSFER_FRAMEWORK.md](../research/LEARNING_TRANSFER_FRAMEWORK.md) (**IFTR**). |
| `time_to_first_*` / `guided_success_rate` / `hint_dependency` / `failure_recovery_rate` / `freeplay_conversion` / `D1`–`D30` | Supporting autonomy metrics |
| `tutorial_completion_rate` | **Diagnostic only** — never the ship metric |

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
- Wired from `IslandsApp`, Ashore teach, BootCastSelect, Take hush, Scar spectacle
- Export UI: Settings → Analytics — **FTUE primary metrics** panel

## Experiment variant

See `docs/ftue/FTUE_EXPERIMENTATION.md`.

- Sticky assignment + `?ftueExp=experimentId:variant` / `?exp=variant`
- Winners never auto-ship; human review required
- `FTUE_VERSION` is the single exact version string on events

## Human testing

Pair telemetry with the repeatable protocol in `docs/ftue/FTUE_USABILITY_PROTOCOL.md` (small cohorts, no observer help, fix-before-expand). Templates live under `docs/ftue/usability/`.

Experimentation (versioned hypotheses, human review, no auto-ship): `docs/ftue/FTUE_EXPERIMENTATION.md`.
