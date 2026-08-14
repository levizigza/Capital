# Usability report

**Agent:** User Research Analysis  
**Report id:** UR-ANALYSIS-2026-08-14  
**Cohorts in scope:** A1 (planned)  
**Sessions completed (in-repo evidence):** **0**  
**Participants (completes):** **0**

---

## Status

No observational session logs, evidence files (`E-*.md`), or classified findings with participants exist under `docs/usability-research/` beyond templates.

Therefore this report **cannot** assert recurring confusion, friction, delight, or prioritized product fixes from usability sessions.

| Claim type | Status |
|------------|--------|
| Observation-backed issues | **None** |
| Clusters | **Empty** (structure reserved below) |
| Prioritized fix list | **Empty** — inventing fixes would violate evidence rules |
| Single-opinion generalizations | **None issued** |

Designer cold-playtest checklists (`docs/iconic-path.md`, craft plans) are **not** usability sessions. They are excluded from OBSERVATION here.

---

## Method used (when data arrives)

Layers kept separate: **OBSERVATION → INTERPRETATION → RECOMMENDATION** (`analysis/ANALYSIS_METHOD.md`).  
Priority: **IMPACT × FREQUENCY × CORE_LOOP_IMPORTANCE** (`analysis/PRIORITIZATION.md`).  
Prefer friction removal on existing Harbor→Cove→Plinth systems; do not auto-build requested features.

Ingest path: drop de-identified logs in `sessions/`, evidence in `evidence/`, then re-run analysis (`src/business/usabilityAnalysis`).

---

## Separation reminder

| Layer | This report |
|-------|-------------|
| OBSERVATION | No session behaviors recorded |
| INTERPRETATION | No causes inferred from sessions |
| RECOMMENDATION | **No product changes recommended from usability analysis** until n≥1 evidenced issues; recruitment STOP still governs next cohort |

---

## Issue register

| id | participants | freq | severity | tasks | evidence | likely_cause (interp.) | confidence | proposed_correction | priority |
|----|--------------|------|----------|-------|----------|-------------------------|------------|---------------------|----------|
| — | — | — | — | — | — | — | — | — | — |

*No rows until sessions land.*

---

## Clusters (reserved)

### Repeated confusion
*None — need ≥2 participants with same behavioral pattern.*

### Repeated friction
*None.*

### Repeated delight
*None.*

### Misunderstood mechanics
*None.*

### Misunderstood terminology
*None.*

### Onboarding failures
*None.* (Would map primarily to UT-01, Ashore→Harbor)

### Features users ignore
*None.* (Candidate watch list when data exists: Outfitter/Capsule during `meet_guide`, utility stalls, Family Room)

### Features users unexpectedly value
*None.* (Candidate watch list: Plinth spectacle, share card, structure toys — hypothesis only)

### Requests that appear repeatedly
*None.*

### Requests that contradict observed behavior
*None.*

---

## Prioritized fixes

**Empty.** Building a fix list without observations would be interpretation theater.

When A1 completes (target 4), re-generate this section sorted by priority score descending; suppress n=1 preference requests from the build list unless CRITICAL_BLOCKER behavior is observed.

---

## Next actions (process, not product)

1. Run cohort **A1** per `SESSION_RUNBOOK.md` + recruitment STOP gate.  
2. File logs in `sessions/P-A1-xx.md` and `evidence/E-xxx.md`.  
3. Classify findings with evidence (`FINDINGS_TAXONOMY.md`).  
4. Re-run this analysis agent to fill issue register + clusters + priority table.  
5. Only then recommend corrections — prefer removing friction on existing signature loop.

---

## Appendix — readiness checklist

- [x] Test battery defined  
- [x] Observation / interpretation / recommendation separation documented  
- [x] Prioritization formula documented  
- [ ] ≥1 completed session log  
- [ ] ≥2 participants for any “recurring” claim  
- [ ] Evidence-linked CRITICAL/MAJOR issues (if any)  
- [ ] Priority scores computed by tooling  

**Bottom line:** Analysis framework is ready; **usability truth from sessions is not available yet.**
