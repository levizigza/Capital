---
id: company-os/CAPITAL_CONSTITUTION
title: Capital Constitution
doc_type: constitution
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
canonical_rank: 1
---

# Capital Constitution

Non-negotiable laws. Amendments require a `DECISION_LOG.md` entry and updated evidence.

## Schema

```yaml
law:
  id: string
  status: fact | hypothesis | unknown
  text: string
  evidence: [{ path: string, note?: string }]
```

---

## Laws

```yaml
law:
  id: money_is_alive
  status: fact
  text: "Player fantasy — You are a Voyager in a world where money is alive; curious explorer + careful chooser, not spreadsheet operator or combat god."
  evidence:
    - path: docs/player-fantasy-and-loop.md
    - path: docs/story-bible.md
```

```yaml
law:
  id: one_money_choice_unforgettable
  status: fact
  text: "Iconic phase north star — make one money choice feel unforgettable."
  evidence:
    - path: docs/iconic-path.md
```

```yaml
law:
  id: main_quest_triangle
  status: fact
  text: "Main quest strip stays Harbor · Cove → Paycheck → Credit. Do not widen with new main-course islands while freeze holds."
  evidence:
    - path: docs/iconic-path.md
    - path: docs/iconic-later.md
    - path: .cursor/rules/iconic-freeze.mdc
```

```yaml
law:
  id: family_room_local
  status: fact
  text: "Family Room stays local / device-share. No fake multiplayer backend."
  evidence:
    - path: docs/iconic-later.md
    - path: docs/iconic-path.md
    - path: src/islands/familyRoom.ts
```

```yaml
law:
  id: no_foreign_merge
  status: fact
  text: "Do not merge Nathan Project / BMO / CBE into Capital."
  evidence:
    - path: docs/iconic-later.md
    - path: .cursor/rules/iconic-freeze.mdc
```

```yaml
law:
  id: depth_before_width
  status: fact
  text: "Prefer deepening Cove hush → scar spectacle → Plinth → share → Piggy → day-2 → Money Structure interiors over map width."
  evidence:
    - path: docs/iconic-path.md
    - path: .cursor/rules/iconic-freeze.mdc
```

```yaml
law:
  id: mural_organ_verb
  status: fact
  text: "If a spine feature cannot name its money organ and suit verb, it does not ship on the iconic spine."
  evidence:
    - path: docs/mural-thesis.md
```

```yaml
law:
  id: no_pay_to_win
  status: fact
  text: "Never pay-to-win — no paid currency, stat boosts, or skipping learning outcomes."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/islands-ui-style-guide.md
```

```yaml
law:
  id: wrong_answers_keep_dignity
  status: fact
  text: "Wrong answers cost time or coins, not shame; retry with dignity."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/player-fantasy-and-loop.md
```

```yaml
law:
  id: adventure_first
  status: fact
  text: "Financial concepts are quests in a place, not worksheets with sprites."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
law:
  id: static_spa_local_first
  status: fact
  text: "Shipped Capital is a static SPA (GitHub Pages) with local-first persistence; no Capital multiplayer server in-repo."
  evidence:
    - path: package.json
      note: "homepage https://levizigza.github.io/Capital/"
    - path: docs/security/data-and-database.md
    - path: .github/workflows/deploy-pages.yml
```

```yaml
law:
  id: vendor_neutral_os
  status: fact
  text: "Company OS institutional memory must not depend on any specific AI model provider."
  evidence:
    - path: company-os/README.md
```

---

## Explicit non-laws (do not invent)

```yaml
claim:
  id: legal_entity_name
  status: unknown
  text: "Formal company legal name, incorporation jurisdiction, and officers."
  evidence: []
```

```yaml
claim:
  id: live_revenue
  status: unknown
  text: "Any live revenue, ARR, or paid customer count."
  evidence: []
```
