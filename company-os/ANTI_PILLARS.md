---
id: company-os/ANTI_PILLARS
title: Anti-Pillars
doc_type: anti_pillars
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Anti-Pillars

What Capital refuses. Violations require constitution amendment + decision log.

## Schema

```yaml
anti:
  id: string
  status: fact | hypothesis | unknown
  text: string
  evidence: [{ path: string }]
```

---

## Verified refusals (FACT)

```yaml
anti:
  id: no_map_width
  status: fact
  text: "Do not widen main quest beyond Harbor · Cove → Paycheck → Credit while freeze holds."
  evidence:
    - path: docs/iconic-later.md
    - path: .cursor/rules/iconic-freeze.mdc
```

```yaml
anti:
  id: no_fake_mmo
  status: fact
  text: "No fake multiplayer backend; Family Room stays local."
  evidence:
    - path: docs/iconic-later.md
```

```yaml
anti:
  id: no_foreign_merge
  status: fact
  text: "No Nathan Project / BMO / CBE merge into Capital."
  evidence:
    - path: docs/iconic-later.md
```

```yaml
anti:
  id: no_pay_to_win
  status: fact
  text: "No paid power, paid currency, or skip-learning monetization."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
anti:
  id: no_second_cosmos
  status: fact
  text: "Expansions must plug into Fortune Archipelago mythology — not invent a competing cosmos."
  evidence:
    - path: docs/story-bible.md
```

```yaml
anti:
  id: no_genre_cities_without_organs
  status: fact
  text: "Genre cities that are not money organs; HUD tips instead of Harbor memory; mesh polish before a fun verb."
  evidence:
    - path: docs/mural-thesis.md
```

```yaml
anti:
  id: no_shame_fails
  status: fact
  text: "Do not punish learners with shame; keep dignity on fail."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/player-fantasy-and-loop.md
```

```yaml
anti:
  id: cut_before_add_main_course
  status: fact
  text: "New main-course island < deeper Take / feel / Plinth proof."
  evidence:
    - path: docs/iconic-later.md
```

---

## HYPOTHESIS (stated in audits / design reviews, not all merged to main)

```yaml
anti:
  id: no_grind_longevity
  status: hypothesis
  text: "Do not fix longevity with XP sinks, vanity carpet grind, or login theater (see longevity / complexity reviews when present on a branch)."
  evidence:
    - path: docs/iconic-path.md
      note: "Depth-before-width implies this; dedicated longevity doc may live on feature branches"
```
