---
id: company-os/OPERATING_CADENCE
title: Operating Cadence
doc_type: cadence
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Operating Cadence

## Schema

```yaml
cadence:
  id: string
  status: fact | hypothesis | unknown
  rhythm: string
  activity: string
  evidence: [{ path: string }]
```

---

## FACT — documented craft rhythms

```yaml
cadence:
  id: iconic_pillar_cadence
  status: fact
  rhythm: "After each pillar/craft fix"
  activity: "npm run test:iconic → (Harbor/Cove/carpet touch) npm run test:iconic:e2e → one cold run → update iconic-craft-plan status board"
  evidence:
    - path: docs/iconic-path.md
```

```yaml
cadence:
  id: session_targets
  status: fact
  rhythm: "Per play session design"
  activity: "Design for 10–15 min (families) or 20–30 min (teens/adults)"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
cadence:
  id: ci_on_push
  status: fact
  rhythm: "On CI"
  activity: "qa.yml / deploy-pages / asset-registry as configured in .github/workflows"
  evidence:
    - path: .github/workflows/qa.yml
    - path: .github/workflows/deploy-pages.yml
```

```yaml
cadence:
  id: production_plan_10w
  status: fact
  rhythm: "Documented 10-week vertical-slice plan (historical planning artifact)"
  activity: "Week themes from scope → beta ship for Coincraft Cove"
  evidence:
    - path: docs/production-plan-10-weeks.md
```

---

## HYPOTHESIS — company operating meetings

```yaml
cadence:
  id: weekly_metrics_review
  status: hypothesis
  rhythm: "Weekly"
  activity: "Review METRICS.md targets vs exports; log experiments"
  evidence:
    - path: docs/production-plan-10-weeks.md
      note: "Mentions weekly metrics script as planned work item"
```

```yaml
cadence:
  id: decision_log_hygiene
  status: hypothesis
  rhythm: "Per material decision"
  activity: "Append DECISION_LOG; amend constitution if needed"
  evidence:
    - path: company-os/DECISION_LOG.md
```

---

## UNKNOWN

```yaml
cadence:
  id: standup_schedule
  status: unknown
  rhythm: "UNKNOWN"
  activity: "Team standup / sprint length not specified as FACT in repo"
  evidence: []
```
