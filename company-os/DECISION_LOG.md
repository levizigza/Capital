---
id: company-os/DECISION_LOG
title: Decision Log
doc_type: decision_log
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Decision Log

## Schema

```yaml
decision:
  id: string
  date: "YYYY-MM-DD"
  status: active | superseded | unknown
  summary: string
  rationale: string
  evidence: [{ path: string }]
  supersedes: string | null
```

Only record decisions evidenced in the repository. Do not invent board minutes.

---

## Active decisions (FACT = evidenced in repo)

```yaml
decision:
  id: d_iconic_freeze_triangle
  date: "UNKNOWN"
  status: active
  summary: "Main quest remains Harbor · Cove → Paycheck → Credit; deepen signature loop before width."
  rationale: "Iconic craft / cold-retell priority."
  evidence:
    - path: docs/iconic-path.md
    - path: docs/iconic-later.md
    - path: .cursor/rules/iconic-freeze.mdc
  supersedes: null
```

```yaml
decision:
  id: d_family_room_local
  date: "UNKNOWN"
  status: active
  summary: "Family Room is local/device-share only; no fake MMO backend."
  rationale: "Freeze + threat model honesty."
  evidence:
    - path: docs/iconic-later.md
    - path: src/islands/familyRoom.ts
  supersedes: null
```

```yaml
decision:
  id: d_no_foreign_merge
  date: "UNKNOWN"
  status: active
  summary: "Do not merge Nathan Project / BMO / CBE into Capital."
  rationale: "Freeze law."
  evidence:
    - path: docs/iconic-later.md
  supersedes: null
```

```yaml
decision:
  id: d_islands_is_product
  date: "UNKNOWN"
  status: active
  summary: "Islands mode is the product default; legacy creative/structured modes only via explicit legacy query."
  rationale: "App.tsx islands-first product framing."
  evidence:
    - path: src/App.tsx
  supersedes: null
```

```yaml
decision:
  id: d_no_pay_to_win
  date: "UNKNOWN"
  status: active
  summary: "Never pay-to-win."
  rationale: "Game pillars paid model rules."
  evidence:
    - path: docs/game-pillars.md
  supersedes: null
```

```yaml
decision:
  id: d_pages_distribution
  date: "UNKNOWN"
  status: active
  summary: "Ship static build to GitHub Pages."
  rationale: "Existing deploy workflow + package homepage."
  evidence:
    - path: .github/workflows/deploy-pages.yml
    - path: package.json
  supersedes: null
```

```yaml
decision:
  id: d_company_os_vendor_neutral
  date: "2026-08-14"
  status: active
  summary: "Create vendor-neutral company-os/ as institutional memory; facts outrank hypotheses and agent output."
  rationale: "Operating system request; avoid provider lock-in."
  evidence:
    - path: company-os/README.md
  supersedes: null
```

---

## UNKNOWN

Exact calendar dates for freeze adoption and product-default Islands switch are **UNKNOWN** (git history can refine later; not asserted here without citation).
