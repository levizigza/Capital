---
id: company-os/CUSTOMER_JOURNEY
title: Customer Journey
doc_type: journey
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Customer Journey

## Schema

```yaml
stage:
  id: string
  status: fact | hypothesis | unknown
  player_facing: string
  session_target?: string
  evidence: [{ path: string }]
```

---

## In-product journey (FACT)

```yaml
stage:
  id: boot
  status: fact
  player_facing: "Title / opening → cast select → Ashore teach → Money Carpet → Harbor plaza"
  evidence:
    - path: docs/harbor-ashore.md
    - path: docs/iconic-path.md
```

```yaml
stage:
  id: first_change
  status: fact
  player_facing: "Board Cove → irreversible Take → hush → carpet home → Harbor scar spectacle → Plinth share → Piggy → day-2 echo"
  evidence:
    - path: docs/iconic-path.md
```

```yaml
stage:
  id: triangle
  status: fact
  player_facing: "Continue main strip Cove → Paycheck → Credit (Freedom Seal + mastery gates apply per product code/docs)"
  evidence:
    - path: docs/iconic-path.md
    - path: docs/player-fantasy-and-loop.md
```

```yaml
stage:
  id: session_length
  status: fact
  player_facing: "Documented session targets"
  session_target: "10–15 min (families), 20–30 min (teens/adults)"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
stage:
  id: core_loop_generic
  status: fact
  player_facing: "Hub → Travel → Explore → NPC quests → Minigames → Rewards → Unlock"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
stage:
  id: social_local
  status: fact
  player_facing: "Family Room local myth / device-share; Harbor Felt share PNG as outbound social object"
  evidence:
    - path: docs/iconic-path.md
```

---

## Lifecycle beyond the client (mostly UNKNOWN)

```yaml
stage:
  id: acquisition
  status: unknown
  player_facing: "How a new household discovers Capital (ads, school, organic)."
```

```yaml
stage:
  id: purchase
  status: hypothesis
  player_facing: "Paid base license and/or expansion islands (see BUSINESS_MODEL) — not implemented as live commerce in-repo."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
stage:
  id: classroom_admin
  status: hypothesis
  player_facing: "Teacher class codes / dashboard — documented as later / production plan, not verified shipped product."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/production-plan-10-weeks.md
```
