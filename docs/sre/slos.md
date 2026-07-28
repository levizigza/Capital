# Capital SRE — Service Level Objectives

Capital is a client-rendered SPA on GitHub Pages today. Reliability is still a product feature: if Harbor fails to load, the player cannot play.

## Golden signals (frontend)

| Signal | SLI | How we measure |
|--------|-----|----------------|
| **Latency** | Harbor interactive ≤ 4s (p95 target) | `journey.harbor_ready` + Core Web Vitals LCP/INP |
| **Traffic** | Session starts / journey completions | `session.start`, `journey.*` (sampled) |
| **Errors** | Error-free sessions ≥ **99%** | `window.error`, `unhandledrejection`, React boundaries |
| **Saturation** | Soft-mode / kill-switch engagement | deviceMemory, CLS, offline, kill switches |

## SLOs (session window → remote later)

1. **Availability (client):** 99% of sessions complete boot without an uncaught error.
2. **Harbor readiness:** 95% of Harbor mounts report `harbor_ready` under 4000 ms.
3. **Deploy health:** `public/health.json` returns `status: ok` after every Pages deploy.

## Error budget

- **1%** session failure allowance (aligned with 99% error-free SLO).
- Client policy (`computeErrorBudget`):
  - `ship_freely` — no session errors
  - `caution` — ≥1 error → prefer soft graphics
  - `freeze_risky` / `incident` — degrade 3D / skip optional features
- **Release policy (human):** if last 7 days burn > 50% of budget (once remote telemetry exists), freeze risky Harbor/3D changes; ship only reliability fixes.

## Capacity growth path

| Stage | Users | Telemetry | Deploy |
|-------|-------|-----------|--------|
| **Now** | Tens–hundreds | Local ring + optional `VITE_TELEMETRY_URL` | Pages + QA gate |
| **Next** | Thousands | Sampled beacon → OTel/collector | Same + RUM dashboards |
| **Later** | API / auth / rooms | Server SLIs + client SLIs | Multi-env (preview/staging/prod) |

Do not invent fake backends; keep contracts (`health.json`, event schema, kill switches) stable so capacity can land without rewriting UX.
