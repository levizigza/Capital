# STOP gate

**Global recruiting status:** `A1_READY_TO_RECRUIT` (plan complete; **no contacts sent by agent**)

| Field | Value |
|-------|--------|
| Active cohort | A1 (S1 Families) — **not started** |
| Outreach sent by agent | **None** (forbidden) |
| Human may begin A1 outreach? | Yes, when ready — using `OUTREACH_DRAFTS.md` + `SCREENER.md` |
| Next cohort auto-start | **NO** |
| Gate after A1 completes | **LOCKED** until findings reviewed |

## After A1 completes

1. Write `COHORT_A1_FINDINGS.md`  
2. Set this file:

```
status: LOCKED
completed_cohort: A1
product_change_recommendation: pending
next_cohort_recommendation: pending
unlocked_by: null
unlocked_at: null
```

3. Human review sets `status: UNLOCKED` and names next cohort (`A2` or `B1` or `HALT`).  
4. Only then may recruiting copy be posted for that next cohort.

## Unlock log

| When | By | From | To | Notes |
|------|-----|------|----|-------|
| — | — | — | — | No cohorts completed yet |
