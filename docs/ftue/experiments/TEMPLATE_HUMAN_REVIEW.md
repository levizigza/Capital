# FTUE experiment human review

**experiment_id:** _______________  
**ftue_version:** _______________  
**reviewer:** _______________  
**reviewed_at:** _______________  

> **Law:** Metrics alone never ship a winner. This packet is required.  
> **acknowledge_no_auto_ship:** ✅ true

---

## Metric summary (control vs variant)

Primary metric: _______________  
Result (qualitative + numbers):  

>

Guardrails:  

>

Tutorial completion (diagnostic only — not decisive):  

>

---

## Gates (all must Pass)

### comprehension
- status: pass / fail / needs_followup / not_reviewed  
- notes:  
- evidence (quotes / usability findings):  

### retention
- status:  
- notes:  
- evidence (D1 / return_session / qualitative):  

### player_autonomy
- status:  
- notes:  
- evidence (freeplay, guidance_reduced behavior, transfer):  

### accessibility
- status:  
- notes:  
- evidence (a11y FTUE audit / settings / input hints):  

### unintended_behavior
- status:  
- notes:  
- evidence:  

### technical_regressions
- status:  
- notes:  
- evidence (tests, QA cold path, softlocks):  

---

## Decision

- [ ] **ship_candidate** — open human PR to mark `shipped` / adopt variant as control  
- [ ] **iterate** — change variant; new experiment id or same id bumped  
- [ ] **reject** — keep control  
- [ ] **inconclusive** — need more observation (only if stop rules not already violated)

`evaluateShipReadiness()` must return `allowed: true` before merge.

---

## Sign-off

Reviewer: _______________  
Second reader (optional): _______________  
PR link (after review): _______________
