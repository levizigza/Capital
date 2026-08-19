# Cohort protocol (iterative + STOP)

## Principles

1. Recruit **one small cohort at a time**.  
2. Prefer **4** (families) or **3** (other segments) completes per cohort.  
3. After the last session of a cohort is analyzed → **STOP**.  
4. Do **not** open recruiting for the next cohort until `STOP_GATE` is marked **UNLOCKED** by a human reviewer.  
5. Product change recommendations are **proposals** — iconic freeze still applies until a separate product decision.

```
Recruit cohort N (screen → schedule → session)
        ↓
STOP — no new outreach
        ↓
Analyze findings (link to discovery falsifiers)
        ↓
Decide: product change? (yes/no/what) — human
        ↓
Recommend next cohort (or halt / pivot segment)
        ↓
UNLOCK gate → only then recruit N+1
```

---

## Planned cohort sequence

| Cohort | Round | n target | Unlocks after |
|--------|-------|---------:|---------------|
| **A1** | S1 Families | 4 | — (first) |
| **A2** | S1 Families | +4 | A1 STOP review |
| **B1** | S2 Homeschool | 3 | A1 review *or* parallel only if staffing allows **and** A1 not starved |
| **B2** | S2 Homeschool | +2 | B1 STOP |
| **C1** | S4 Teachers | 3 | Explicit unlock after A/B learning |
| **D1** | S3 Youth/CU | 3 | Explicit unlock |
| **E1** | S5 Teens | 3 pairs | Unlock + ethics check |
| **F1** | S7 Adults | 3 | Unlock (falsifier) |
| **G1** | S6 Grandparents | 3 | Unlock |

Default: **serialize A1 → STOP → decide → A2 or B1**, not all at once.

---

## After each cohort — required analysis checklist

File: `cohorts/COHORT_xx_FINDINGS.md` (create when real data exists)

- [ ] Segment fit rate (screened → qualified → completed)  
- [ ] Channel mix + observed bias  
- [ ] IH-* outcomes (support / falsify / inconclusive) from `docs/customer-discovery/INTERVIEW_PLAN.md`  
- [ ] Quotes (de-identified)  
- [ ] WTP notes (no anchoring confession)  
- [ ] **Product should change?** options: `no` / `copy only` / `UX` / `scope conflict with iconic freeze`  
- [ ] **Next cohort recommendation** + why  
- [ ] STOP gate decision: `LOCKED` until human sets `UNLOCKED` in `STOP_GATE.md`

---

## Halt conditions (skip ahead / stop research line)

- ≥50% of A1 require debit rails as must-have → prioritize rails competitor study; pause adventure GTM claims  
- Screener pass rate &lt;15% on primary channels → revise screen or channel before A2  
- Safety / ethics incident → halt all recruiting  

---

## Current state

See [`cohorts/STOP_GATE.md`](./cohorts/STOP_GATE.md) and [`cohorts/COHORT_A1_STATUS.md`](./cohorts/COHORT_A1_STATUS.md).
