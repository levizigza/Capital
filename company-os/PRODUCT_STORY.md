---
id: company-os/PRODUCT_STORY
title: Product Story
doc_type: product_story
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Product Story

## Schema

```yaml
story:
  field: product_name | world_name | one_sentence | signature_loop | vertical_slice
  status: fact | hypothesis | unknown
  text: string
  evidence: [{ path: string }]
```

---

## Verified story

```yaml
story:
  field: product_name
  status: fact
  text: "Capital (repo/package name capital; live Pages at levizigza.github.io/Capital)."
  evidence:
    - path: package.json
    - path: docs/story-bible.md
```

```yaml
story:
  field: world_name
  status: fact
  text: "Fortune Archipelago; home Harbor Haven; player is the Voyager."
  evidence:
    - path: docs/story-bible.md
```

```yaml
story:
  field: one_sentence
  status: fact
  text: "In a world where money is alive, a washed-ashore Voyager learns that fortune is a journey of choices — guided by Money Mascots across the Fortune Archipelago — until they escape paycheck-to-paycheck and return home transformed."
  evidence:
    - path: docs/story-bible.md
```

```yaml
story:
  field: mural_sentence
  status: fact
  text: "You are inside living money. Harbor remembers. Cove holds. Paycheck clocks. Credit spirals."
  evidence:
    - path: docs/mural-thesis.md
```

```yaml
story:
  field: signature_loop
  status: fact
  text: "Cove irreversible Take → soft hush → Harbor scar spectacle + Plinth glow → Share PNG → quiet plaza → Piggy homecoming → Day-2 rumor/locals naming the plaque."
  evidence:
    - path: docs/iconic-path.md
```

```yaml
story:
  field: organs
  status: fact
  text: "Memory (Harbor) · Coin (Cove) · Clock (Paycheck) · Spiral (Credit)."
  evidence:
    - path: docs/mural-thesis.md
    - path: src/islands/moneyOrgans.ts
```

```yaml
story:
  field: vertical_slice
  status: fact
  text: "Vertical slice defined as Coincraft Cove polished to shipping quality (elementary / family tier)."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
story:
  field: alternate_product_label
  status: fact
  text: "Some canon docs also label the product 'FinanceQuest Islands' / 'FinanceQuest Pro' as the containing framing."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/production-plan-10-weeks.md
```

---

## Hypotheses / gaps

```yaml
story:
  field: public_marketing_name
  status: unknown
  text: "Whether external marketing uses Capital, FinanceQuest, or another brand exclusively."
  evidence: []
```
