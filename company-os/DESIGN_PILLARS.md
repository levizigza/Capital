---
id: company-os/DESIGN_PILLARS
title: Design Pillars
doc_type: pillars
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Design Pillars

## Schema

```yaml
pillar:
  id: string
  status: fact | hypothesis | unknown
  text: string
  evidence: [{ path: string }]
```

---

## Product pillars (FACT)

```yaml
pillar:
  id: adventure_first_learning
  status: fact
  text: "Financial concepts are quests in a place, not worksheets with sprites. Jump$tart/CEE-aligned kernels; original theme/verb/structure."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/ip-safe-design.md
```

```yaml
pillar:
  id: decisions_have_consequences
  status: fact
  text: "Dialogue branches, fail/retry dignity, economy weather, decision replay. Wrong answers cost time/coins, not shame."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
pillar:
  id: delightful_juice
  status: fact
  text: "Motion, SFX, stingers, readable UI; accessibility is part of delight."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
pillar:
  id: depth_before_width
  status: fact
  text: "Deepen signature loop and Money Structures before new main-course islands."
  evidence:
    - path: docs/iconic-path.md
```

```yaml
pillar:
  id: mural_law
  status: fact
  text: "Spine features must name money organ + suit verb."
  evidence:
    - path: docs/mural-thesis.md
```

```yaml
pillar:
  id: explorers_first
  status: fact
  text: "Players feel like explorers first and students second."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
pillar:
  id: whole_journey_is_story
  status: fact
  text: "The entire player journey is the story (Harmon Story Circle + Hero’s Journey)."
  evidence:
    - path: docs/story-bible.md
```
