# Capital SRE / DevOps runbook

## Health probes

| Probe | URL / command | Expect |
|-------|---------------|--------|
| Static health | `https://levizigza.github.io/Capital/health.json` | `"status":"ok"`, fresh `buildId` |
| Client health | Browser console: `__CAPITAL_HEALTH__()` | `status` ok/degraded; kill switches |
| SRE ring | Import `getSreEvents()` in debug builds | Recent golden-signal events |

## Kill switches (incident levers)

Set at **build time** (`VITE_KILL_*`) or **runtime** (`localStorage capital_kill_<id>=1` / `setKillSwitch`):

| Id | Env | Effect |
|----|-----|--------|
| `harbor3d` | `VITE_KILL_HARBOR_3D=1` | 2D Harbor safe mode (hotspot buttons) |
| `serviceWorker` | `VITE_KILL_SW=1` | Skip SW registration (cache poison) |
| `telemetry` | `VITE_KILL_TELEMETRY=1` | Stop non-error beacons |
| `familyRooms` | `VITE_KILL_FAMILY=1` | Hide Family Room hotspot |
| `studioGallery` | `VITE_KILL_GALLERY=1` | Hide Studio Gallery |
| `partyBoard` | `VITE_KILL_PARTY=1` | Hide Practice Board |

## Common incidents

### Stale chunk / blank after deploy
1. Confirm new `health.json` `buildId` is live.
2. Hard recover path already exists (`hardRecoverFromStaleBuild`).
3. If SW loops: set `VITE_KILL_SW=1` rebuild, or instruct users once: DevTools → unregister SW → hard reload.

### Harbor WebGL crash loop
1. `setKillSwitch('harbor3d', true)` or rebuild with `VITE_KILL_HARBOR_3D=1`.
2. Check `journey.harbor_ready` / React boundary events in ring.
3. Ship soft-mode / GPU fix; clear kill when budget recovers.

### Telemetry / privacy
- Default: local-only ring buffer.
- Remote: set `VITE_TELEMETRY_URL` to a collector that accepts `{ service, env, events[] }`.
- Kill with `VITE_KILL_TELEMETRY=1`.

## Deploy checklist (DevOps)

1. QA workflow green: unit, content, e2e-smoke, lint (and typecheck when clean).
2. Pages deploy job builds with `GITHUB_PAGES=true` + stamped `VITE_BUILD_ID`.
3. Post-deploy: fetch `health.json`; spot-check Harbor boot once.
4. If error budget policy is `freeze_risky`, do not ship gameplay-only Harbor changes.

## Escalation

- Product owners: freeze feature flags via kill switches first (minutes).
- Then: revert last Pages deploy / push fix to `main`.
- Document timeline in PR: symptoms → signal → switch → fix.
