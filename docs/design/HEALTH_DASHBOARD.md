# Health dashboard — ENGAGEMENT · LEARNING · BUSINESS

**Date:** 2026-08-18  
**Code:** `src/islands/analytics/healthDashboard.ts` · Settings → Analytics  
**Law:** Never optimize one category while ignoring damage to another.

---

## Categories

### ENGAGEMENT

| Metric | Source |
|--------|--------|
| Session continuation | Share of sessions lasting past early-quit window / completing a loop beat |
| Return rate | `d1_retention` (D7/D30 shown as supporting) |
| Voluntary play | `freeplay_conversion` |
| Session duration | Mean session `durationMs` from local analytics |

### LEARNING

| Metric | Source |
|--------|--------|
| Concept mastery | `autonomy_unlocked` ÷ `concept_introduced` (not tutorial complete) |
| Independent transfer | **King** `independent_transfer_rate` |
| Decision improvement | `failure_recovery_rate` (learn-from-fail proxy) |
| Hint dependency | `hint_dependency` — **higher is worse** for autonomy |

Tutorial completion is **never** a Learning success metric.

### BUSINESS

| Metric | Source |
|--------|--------|
| Conversion | Sessions with `harbor_purchase` ÷ sessions (in-game shop until real checkout exists) |
| Paid retention | **UNKNOWN** until paid identity + return after purchase is instrumented |
| Revenue | Sum of in-game purchase `price` (pouch coins) — **not USD**; real revenue UNKNOWN |
| CAC | **UNKNOWN** where acquisition spend is unavailable |

Unavailable business metrics must render as **— / unavailable**, never as zero.

---

## Cross-category damage flags

| Flag | Trigger (when both sides measurable) |
|------|--------------------------------------|
| **HIGH FUN / LOW LEARNING** | High voluntary play + low independent transfer |
| **HIGH LEARNING / LOW FUN** | High independent transfer + low voluntary play or weak continuation |
| **HIGH REVENUE / LOW TRUST** | High conversion + low transfer **or** weak failure recovery |
| **HIGH RETENTION / HIGH HINT DEPENDENCY** | High return rate + high hint dependency |

Flags are warnings, not auto-ship blockers — human review required before celebrating any single category win.

---

## Ship question

Does this change improve its target category **without** raising a damage flag on another?

If it only lifts ENGAGEMENT or BUSINESS while Learning (especially ITR) falls — **do not ship as a win**.
