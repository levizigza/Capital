---
id: company-os/BRAND_POSITIONING
title: Brand Positioning
doc_type: brand
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Brand Positioning

## Schema

```yaml
position:
  id: string
  status: fact | hypothesis | unknown
  text: string
  evidence: [{ path: string }]
```

---

## FACT

```yaml
position:
  id: category
  status: fact
  text: "Adventure-first financial literacy game (Islands), not a worksheet app with sprites."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
position:
  id: fantasy
  status: fact
  text: "Voyager among Money Mascots in a world where money is alive (Fortune Archipelago)."
  evidence:
    - path: docs/player-fantasy-and-loop.md
    - path: docs/story-bible.md
```

```yaml
position:
  id: feel_test
  status: fact
  text: "Every UI/mechanic asks: Does this make me feel like a Voyager among Money Mascots?"
  evidence:
    - path: docs/player-fantasy-and-loop.md
```

```yaml
position:
  id: design_aspiration_note
  status: fact
  text: "PRD historically compared tone to 'Duolingo meets educational gaming' — treat as legacy design direction text, not a trademark claim."
  evidence:
    - path: PRD.md
```

```yaml
position:
  id: ip_safe
  status: fact
  text: "Original themes/verbs/structures; IP-safe design process documented."
  evidence:
    - path: docs/ip-safe-design.md
```

```yaml
position:
  id: series_cast
  status: fact
  text: "Illustrated series leads documented (Cashwell Capital cast) — do not replace Piggy/Coin Bag on signature loop."
  evidence:
    - path: docs/series-cast.md
    - path: docs/iconic-path.md
```

---

## UNKNOWN

```yaml
position:
  id: external_tagline
  status: unknown
  text: "Approved public marketing tagline / store listing copy."
```

```yaml
position:
  id: trademark_status
  status: unknown
  text: "Trademark registration status for Capital / FinanceQuest names."
```
