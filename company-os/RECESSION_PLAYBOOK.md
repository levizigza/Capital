---
id: company-os/RECESSION_PLAYBOOK
title: Recession Playbook
doc_type: recession_playbook
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Recession Playbook

What to **keep**, **cut**, and **pause** if resources tighten.  
Derived from existing freeze / pillars — not from invented finance data.

## Schema

```yaml
move:
  id: string
  status: fact | hypothesis | unknown
  action: keep | cut | pause | unknown
  text: string
  evidence: [{ path: string }]
```

---

## KEEP (FACT — core product bet)

```yaml
move:
  id: keep_signature_loop
  status: fact
  action: keep
  text: "Cove Take → hush → spectacle → Plinth share → Piggy → day-2; Money Structure Soft Beats."
  evidence:
    - path: docs/iconic-path.md
```

```yaml
move:
  id: keep_triangle
  status: fact
  action: keep
  text: "Harbor · Cove → Paycheck → Credit spine."
  evidence:
    - path: docs/iconic-later.md
```

```yaml
move:
  id: keep_no_pay_to_win
  status: fact
  action: keep
  text: "Do not monetize via pay-to-win under stress."
  evidence:
    - path: docs/game-pillars.md
```

```yaml
move:
  id: keep_local_family
  status: fact
  action: keep
  text: "Family Room local — do not spend runway on fake MMO."
  evidence:
    - path: docs/iconic-later.md
```

```yaml
move:
  id: keep_a11y
  status: fact
  action: keep
  text: "Accessibility (text size, reduced motion, profiles) remains part of delight."
  evidence:
    - path: docs/game-pillars.md
    - path: docs/player-fantasy-and-loop.md
```

---

## CUT / PAUSE (FACT or HYPOTHESIS aligned to freeze)

```yaml
move:
  id: cut_map_width
  status: fact
  action: cut
  text: "Do not fund new main-course islands while freeze holds."
  evidence:
    - path: docs/iconic-later.md
```

```yaml
move:
  id: pause_parked_digressions
  status: fact
  action: pause
  text: "Keep parked digression minigames / demo island off live spine."
  evidence:
    - path: docs/iconic-later.md
    - path: src/islands/spineContentRegistry.ts
```

```yaml
move:
  id: cut_foreign_merges
  status: fact
  action: cut
  text: "No Nathan/BMO/CBE integration work."
  evidence:
    - path: docs/iconic-later.md
```

```yaml
move:
  id: pause_real_banking
  status: hypothesis
  action: pause
  text: "Do not prioritize live Plaid/bank linking under recession — stub/simulator only today."
  evidence:
    - path: src/lib/plaid-provider.ts
    - path: docs/security/threat-model.md
```

```yaml
move:
  id: pause_legacy_modes_investment
  status: hypothesis
  action: pause
  text: "Avoid new investment in legacy creative/structured hubs; Islands is product."
  evidence:
    - path: src/App.tsx
```

---

## UNKNOWN (finance stress triggers)

```yaml
move:
  id: cash_runway_trigger
  status: unknown
  action: unknown
  text: "Months of runway or burn threshold that activates this playbook — not in repo."
  evidence: []
```

```yaml
move:
  id: headcount_plan
  status: unknown
  action: unknown
  text: "Hiring freeze / contractor cuts — UNKNOWN."
  evidence: []
```

---

## Default recession sentence

**Ship fewer systems; keep the living-money conversation.** Depth on Plinth truth beats width, multiplayer theater, and banking integrations.
