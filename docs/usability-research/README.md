# Usability Research (observational)

**Goal:** Observe what users **can and cannot successfully accomplish** in Capital.  
**Not the goal:** Ask whether they “like” it.

| Rule | Detail |
|------|--------|
| Tasks are goals | Never prescribe clicks (“open X, then Y”) |
| Think aloud | Ask them to say what they are thinking / looking for |
| Never defend | Do not explain or justify the interface mid-session |
| Never teach | Do not reveal intended design; only clarify the *task goal* if misunderstood |
| Evidence | Every finding needs timestamped observation notes (and clip if recorded) |

| Artifact | Purpose |
|----------|---------|
| [FACILITATOR_PROTOCOL.md](./FACILITATOR_PROTOCOL.md) | Conduct rules, prompts, anti-patterns |
| [TEST_BATTERY.md](./TEST_BATTERY.md) | All observational tests (RQ → signals) |
| [SESSION_RUNBOOK.md](./SESSION_RUNBOOK.md) | How to run a cohort session (ties to recruitment A1+) |
| [OBSERVATION_LOG_TEMPLATE.md](./OBSERVATION_LOG_TEMPLATE.md) | Per-task capture sheet |
| [FINDINGS_TAXONOMY.md](./FINDINGS_TAXONOMY.md) | CRITICAL → UNEXPECTED + evidence rules |
| [analysis/ANALYSIS_METHOD.md](./analysis/ANALYSIS_METHOD.md) | OBSERVATION vs INTERPRETATION vs RECOMMENDATION |
| [analysis/PRIORITIZATION.md](./analysis/PRIORITIZATION.md) | IMPACT × FREQUENCY × CORE_LOOP_IMPORTANCE |
| [USABILITY_REPORT.md](./USABILITY_REPORT.md) | Cohort analysis report (empty until sessions exist) |
| [sessions/](./sessions/) | Completed observation logs |
| [evidence/](./evidence/) | De-identified evidence stubs (no PII dumps) |
| [findings/](./findings/) | Classified findings after sessions |

Code mirrors: `src/business/usabilityResearch/` · `src/business/usabilityAnalysis/`.

**Product unchanged** by this agent. Tests assume live Harbor cold path (Title → Cast → Ashore → Harbor → Cove → Plinth/share).

**Analysis rule:** Never treat one participant’s opinion as universal truth. No session corpus ⇒ no product-change recommendations from usability analysis.
