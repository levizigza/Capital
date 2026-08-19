---
id: company-os/UNIT_ECONOMICS
title: Unit Economics
doc_type: unit_economics
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Unit Economics

## Schema

```yaml
metric:
  id: string
  status: fact | hypothesis | unknown
  definition: string
  value: string | number | null
  evidence: [{ path: string }]
```

**Honesty rule:** Do not invent CAC, LTV, margins, or burn. Repo does not contain live finance sheets.

---

## FACT

```yaml
metric:
  id: hosting_model
  status: fact
  definition: "Primary distribution host"
  value: "GitHub Pages static hosting (public SPA)"
  evidence:
    - path: package.json
    - path: .github/workflows/deploy-pages.yml
```

```yaml
metric:
  id: client_compute_burden
  status: fact
  definition: "Where gameplay simulation runs"
  value: "Player device (browser); no Capital game server in-repo"
  evidence:
    - path: docs/security/data-and-database.md
```

---

## HYPOTHESIS (qualitative only)

```yaml
metric:
  id: monetization_shape
  status: hypothesis
  definition: "Intended capture mechanism"
  value: "Base license + optional expansion DLC; never pay-to-win"
  evidence:
    - path: docs/game-pillars.md
```

---

## UNKNOWN (required before claiming unit economics)

| id | definition | value |
|----|------------|-------|
| `price_base` | Base license price | UNKNOWN |
| `price_expansion` | Expansion pack price | UNKNOWN |
| `cac` | Customer acquisition cost | UNKNOWN |
| `ltv` | Lifetime value | UNKNOWN |
| `gross_margin` | Gross margin after store/tax | UNKNOWN |
| `refund_rate` | Refund % | UNKNOWN |
| `attach_rate_expansion` | Expansion attach after base | UNKNOWN / hypothesis target only |
| `monthly_burn` | Company cash burn | UNKNOWN |
| `runway_months` | Runway | UNKNOWN |

```yaml
metric:
  id: price_base
  status: unknown
  definition: "Base license price"
  value: null
  evidence: []
```
