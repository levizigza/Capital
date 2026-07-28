# Site Reliability & DevOps (Capital)

Capital treats reliability as part of the game loop: Harbor must boot, journeys must complete, and operators need levers before player count grows.

| Doc | Purpose |
|-----|---------|
| [slos.md](./slos.md) | SLIs/SLOs, error budget, golden signals |
| [runbook.md](./runbook.md) | Incidents, kill switches, deploy checks |
| [capacity.md](./capacity.md) | Present vs future scale path |

## Code map

- `src/sre/` — telemetry, vitals, error budget, health, bootstrap
- `public/health.json` — static readiness (rewritten at build)
- `.github/workflows/qa.yml` — quality
- `.github/workflows/deploy-pages.yml` — gated deploy
