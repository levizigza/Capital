---
id: company-os/IDEAL_CUSTOMER
title: Ideal Customer
doc_type: icp
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Ideal Customer

## Schema

```yaml
segment:
  id: string
  status: fact | hypothesis | unknown
  who: string
  job_to_be_done: string
  primary_tier: string
  evidence: [{ path: string }]
```

**Note:** Segments below are **documented product targets** in `docs/game-pillars.md`. Ranking which is “primary ICP” for go-to-market is **UNKNOWN** unless evidenced.

---

## Documented segments (FACT = present in canon)

```yaml
segment:
  id: families
  status: fact
  who: "Parents + kids 6–11"
  job_to_be_done: "Safe, co-play money habits at home; progress parents can see"
  primary_tier: "Elementary (e.g. Coincraft Cove)"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
segment:
  id: teens
  status: fact
  who: "12–17, self-directed"
  job_to_be_done: "Relevant scenarios (jobs, cards, goals) without lecture tone"
  primary_tier: "Middle / high school"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
segment:
  id: classroom_teachers
  status: fact
  who: "Grades 3–12 educators"
  job_to_be_done: "Standards-aligned quests, session length control, no ads/data surprises"
  primary_tier: "All tiers + class codes (later)"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
segment:
  id: solo_adults
  status: fact
  who: "18+ casual learners"
  job_to_be_done: "Practical decisions (budget, investing basics) in short sessions"
  primary_tier: "Adult / startup themes"
  evidence:
    - path: docs/game-pillars.md
```

```yaml
claim:
  id: positioning_one_base_game
  status: fact
  text: "One base game, age-appropriate tone via learning profiles and content packs — not four separate apps."
  evidence:
    - path: docs/game-pillars.md
```

---

## UNKNOWN (do not invent)

```yaml
claim:
  id: primary_icp_rank
  status: unknown
  text: "Which segment is the single primary beachhead for acquisition spend."
```

```yaml
claim:
  id: paying_customer_count
  status: unknown
  text: "Count of paying households, teachers, or seats."
```

```yaml
claim:
  id: geographic_focus
  status: unknown
  text: "Primary country/region for launch (repo does not lock a market)."
```
