# Capacity & DevOps architecture

## Present (day-one users)

- **Static SPA** on GitHub Pages — infinite horizontal scale for static assets; bottlenecks are client CPU/GPU and CDN cache correctness.
- **Client SRE**: golden-signal ring, Web Vitals, error budget → automatic soft graphics / killable surfaces.
- **Recovery**: ErrorBoundary + stale-chunk hard recover + SW update reload.
- **CI**: quality gates before Pages publish; Dependabot for npm + Actions.

## Future (growing userbase)

1. **Observability**: point `VITE_TELEMETRY_URL` at a batch ingest; keep event schema stable (`src/sre/types.ts`).
2. **Preview environments**: GitHub Actions deploy PR previews; same `health.json` contract.
3. **Feature flags remote**: fetch kill switches from config JSON (same ids) — no UX rewrite.
4. **When APIs arrive**: add `/healthz` + `/readyz`; map server golden signals beside client SLIs in one dashboard.
5. **Family Rooms / multiplayer**: only after auth + capacity plan; local invite codes stay local until then.

## DevOps principles baked in

- **Everything as code**: workflows, health stamp, kill switches, SLOs in repo.
- **Shift left**: lint/tests/content validation before users see a build.
- **Fast rollback**: Pages redeploy + kill switches without waiting on a full redesign.
- **No heroics**: degrade gracefully (safe mode Harbor) so experience stays continuous under saturation.
