---
id: company-os/BUSINESS_MODEL
title: Business Model
doc_type: business_model
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Business Model

## Schema

```yaml
model:
  id: string
  status: fact | hypothesis | unknown
  text: string
  evidence: [{ path: string }]
```

---

## FACT — what exists today

```yaml
model:
  id: distribution
  status: fact
  text: "Product is distributed as a static web app on GitHub Pages."
  evidence:
    - path: package.json
      note: "homepage https://levizigza.github.io/Capital/"
    - path: .github/workflows/deploy-pages.yml
```

```yaml
model:
  id: no_live_payments_in_repo
  status: fact
  text: "No live Stripe/PayPal/IAP payment integration found in the product codebase; Plaid is stubbed; banking is simulator-oriented."
  evidence:
    - path: src/lib/plaid-provider.ts
    - path: docs/security/threat-model.md
```

```yaml
model:
  id: local_first_no_mmo_saas
  status: fact
  text: "Core play is local-first; Family Room is not a hosted multiplayer SaaS."
  evidence:
    - path: docs/iconic-later.md
    - path: src/islands/familyRoom.ts
```

---

## HYPOTHESIS — documented paid model (unvalidated)

From `docs/game-pillars.md` — **hypothesis**, not live commerce:

```yaml
model:
  id: base_premium
  status: hypothesis
  text: "Base (premium): Hub + first island + core loop, save, accessibility, parental view — one-time or annual license; full tutorial path included."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
model:
  id: expansion_dlc
  status: hypothesis
  text: "Expansion islands as optional DLC (quests/minigames/NPCs only)."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
model:
  id: validation_signals
  status: hypothesis
  text: "Validation signals: expansion attach rate after base completion; refund rate; teacher quote on no monetized pressure on kids."
  evidence:
    - path: docs/game-pillars.md
```

---

## UNKNOWN

```yaml
model:
  id: live_price_points
  status: unknown
  text: "Actual USD/EUR prices, SKUs, tax, refund policy."
```

```yaml
model:
  id: b2b_classroom_pricing
  status: unknown
  text: "Seat/license pricing for schools — mentioned as later class codes, not priced."
```

```yaml
model:
  id: company_entity_billing
  status: unknown
  text: "Which legal entity would sell Capital."
```
