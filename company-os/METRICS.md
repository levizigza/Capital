---
id: company-os/METRICS
title: Metrics
doc_type: metrics
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Metrics

## Schema

```yaml
metric:
  id: string
  status: fact | hypothesis | unknown
  definition: string
  target: string | null
  instrumentation: string | null
  evidence: [{ path: string }]
```

**Law:** Metrics **investigate**; they do not prove love or enjoyment by themselves (product craft docs). Targets below are **documented goals**, not verified live production outcomes unless evidenced.

---

## Documented product targets (FACT that targets exist in canon)

```yaml
metric:
  id: d1_retention
  status: fact
  definition: "% returning within 24h of first island enter"
  target: "≥ 35% (families), ≥ 25% (solo) — vertical slice / beta target"
  instrumentation: "Islands analytics events (island_entered, etc.)"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: d7_retention
  status: fact
  definition: "% active 7 days after first session"
  target: "≥ 20%"
  instrumentation: "Islands analytics"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: quest_completion
  status: fact
  definition: "% started quests that reach quest_completed"
  target: "≥ 70% per island quest chain"
  instrumentation: "quest_* events"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: tutorial_completion
  status: fact
  definition: "% completing hub onboarding + first quest objective"
  target: "≥ 80%"
  instrumentation: "tutorial / onboarding events"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: minigame_completion
  status: fact
  definition: "minigame_completed / minigame_started"
  target: "≥ 75%"
  instrumentation: "minigame_* events"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: time_to_first_quest
  status: fact
  definition: "Hub enter → quest_started"
  target: "< 3 min median"
  instrumentation: "funnel timestamps"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: replay_engagement
  status: fact
  definition: "% sessions opening decision replay after quest"
  target: "≥ 30% (stretch)"
  instrumentation: "decision replay events"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
metric:
  id: session_length_targets
  status: fact
  definition: "Intended session duration"
  target: "10–15 min families; 20–30 min teens/adults"
  instrumentation: null
  evidence:
    - path: docs/game-pillars.md
```

---

## Instrumentation reality (FACT)

```yaml
metric:
  id: analytics_local_first
  status: fact
  definition: "Where events live by default"
  target: null
  instrumentation: "Client-side Islands analytics + local rings; optional VITE_TELEMETRY_URL for SRE"
  evidence:
    - path: src/islands/analytics.ts
    - path: src/sre/telemetry.ts
    - path: docs/game-pillars.md
```

---

## UNKNOWN — live measured values

```yaml
metric:
  id: live_d1_actual
  status: unknown
  definition: "Actual D1 retention in production"
  target: null
  instrumentation: null
  evidence: []
```

All **actual** production rates (D1/D7/quest %, revenue metrics) are **UNKNOWN** until an experiment or export cites numbers in `EXPERIMENT_LEDGER.md`.
