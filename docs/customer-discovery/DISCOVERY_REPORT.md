# Customer discovery report (v0)

**Mission:** Who has the strongest real-world need for Capital, and why?  
**Constraint:** Existing ICP in `game-pillars.md` is a **hypothesis**, not a finding.  
**Product:** Unchanged this pass.

---

## 1. Top candidate segments (provisional)

### Raw composite (formula only)

1. **S2 — Homeschool parents** — 74 (confidence: Low)  
2. **S1 — Parents + kids 6–11** — 73 (Low–Med)  
3. **S3 — Youth orgs / CU education** — 63  
4. **S7 — Solo adults** — 60 *(high pain cost, **fit 2** — not a ship-now bet)*  
5. **S6 — Grandparents** — 58  

### Fit-gated near-term pool (`product_fit ≥ 3`)

1. **S2 Homeschool** — 74  
2. **S1 Families** — 73 *(best shipped fit = 4)*  
3. **S6 Grandparents** — 58  
4. **S5 Teens** — 55  

**How to read this:** Scoring refused to rubber-stamp design ICP. Homeschool edges families on urgency/reachability scores that are **themselves hypotheses**. Families remain co-lead because product fit to Cove→Paycheck→Credit is strongest and production already aims there. **Neither is validated.**

---

## 2. Evidence supporting each

### S1 Families
- **Fact:** Adventure game; family-tier Cove; signature irreversible-choice loop.
- **Fact:** Design + production prioritize families / Cove; beta exit framed as n≥30 families.
- **Fact:** Parent data access gated — careful with kids’ data; parent “see progress” JTBD incomplete.
- **Not fact:** Parents want/pay; beta findings.

### S2 Homeschool
- **Fact:** None segment-specific in repo.
- **Hypothesis:** Curriculum spend + weekly cadence + concentrated channels.
- **Fit:** Same family content; needs unit wrapping.

### S3 Youth / CU
- **Fact:** None segment-specific.
- **Hypothesis:** Institutional budget + mission fit; facilitator tooling missing.

### S4 Teachers
- **Fact:** Named in pillars; plan mentions teacher playtest + standards one-pager.
- **Gap:** Ability to pay + classroom ops drag score; fails fit gate.

### S5 Teens
- **Fact:** Paycheck/Credit topics exist.
- **Gap:** Buyer often parent; reach hard; tone risk.

### S7 Solo adults (contrast)
- **Fact:** Named in pillars as segment D.
- **Why listed:** Cost-of-problem pulls composite up while product_fit stays 2 — classic false-positive segment if you ignore fit.

---

## 3. Weaknesses of each

| Segment | Main weakness |
|---------|----------------|
| S2 | Optimistic scores; invisible in canon docs; may dissolve in interviews |
| S1 | Unvalidated; may need bank rails; parent progress incomplete |
| S3 | B2B motion; no roster/facilitator mode |
| S4 | Free substitutes; procurement; missing LMS-ish features |
| S5 | Not the payer; attention market |
| S6 | Low frequency; depends on S1 share |
| S7 | Wrong substitutes; fantasy mismatch with iconic path |
| S8 | No assign workflow |

---

## 4. Questions we need answered

Critical few (full list in `INTERVIEW_PLAN.md`):

1. Practice/fiction vs **real money rails**?  
2. Who pays, and what did they already abandon?  
3. Does Plinth/share create adult-to-adult recommendation?  
4. Is homeschool WTP/urgency actually higher than general families?  
5. Teachers/orgs: payer in <90 days without classroom ops?  
6. Solo/teen: fatal tone reject?

---

## 5. Recommended interview candidates

| Priority | Who | n |
|----------|-----|--:|
| P0 | Parents, child 7–10 | 8–10 |
| P0 | Homeschool parents (life-skills unit last year) | 5 |
| P1 | Elementary teachers (money/math unit) | 5 |
| P1 | After-school / CU youth-ed coordinators | 3 |
| P2 | Teens 14–16; solo adults; grandparents | 5+5+3 |
| P3 | Financial coaches | 3 |

---

## 6. Specific falsification criteria

| Claim | Kill if | Support if |
|-------|---------|------------|
| S1 viable | <30% name a Capital-ownable problem **or** >50% require rails | ≥60% non-rail gap + ≥40% WTP>$0 after demo |
| S2 outranks S1 | Homeschool urgency/WTP not higher than S1 in side-by-side | Clear higher WTP + term-buy urgency |
| Share loop | <20% would show share object | ≥50% would share |
| Teachers near-term $ | No payer in 90 days / refuse trial sans LMS | Named budget + trial path |
| Solo adults | ≥60% tone-reject in 5 min | Request adult path / finish for self |
| Premium base | Modal WTP below cost-to-serve / free-only | Clustered WTP supports premium |

Promote `HYPOTHESES.md` → fact only via `docs/customer-discovery/evidence/` notes.

---

## Positioning & pricing (current state)

| Topic | Verified | Hypothesis only |
|-------|----------|-----------------|
| Positioning | Adventure-first; explorer > student | Four ages via one base commercially works |
| Pricing | Doc labels premium+DLC as hypothesis | Buyers accept it; DLC attach after Cove |
| Competitors | **No in-repo teardown** | Allowance apps, free curricula, YouTube are substitutes |

---

## Storage

| Kind | Where |
|------|--------|
| Facts | `VERIFIED_FACTS.md` + `EvidenceKind: "fact"` |
| Hypotheses | `HYPOTHESES.md` + `EvidenceKind: "hypothesis"` |
| Code mirror | `src/business/customerDiscovery/` |
| Future interviews | `docs/customer-discovery/evidence/` |

---

## Deliberately not done

- No Harbor/gameplay changes.  
- No crowned final ICP.  
- No invented quotes or competitor win rates.
