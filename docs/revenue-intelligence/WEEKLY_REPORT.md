# Capital Revenue Intelligence — Weekly Report

**Week of:** 2026-08-11
**Generated:** 2026-08-15
**Currency:** USD

## North star

Optimize for **retained paying customers**, not isolated upstream volume.
Check: 100 visitors → 10 retained payers scores above 10,000 visitors → 0 retained. **PASS**

## Data honesty

- Honesty rule: only observed counts are non-zero. Hypotheses live in docs, not inflated metrics.
- As of this seed, Capital has no verified paid+retained customers in-repo.
- Upstream vanity (visitors) must not outrank retained paying customers.

## Lifecycle funnel

| Stage | Count | → next | Conversion |
|-------|------:|--------|------------|
| Discovered (`DISCOVERED`) | 0 | 0 | n/a |
| Contacted (`CONTACTED`) | 0 | 0 | n/a |
| Replied (`REPLIED`) | 0 | 0 | n/a |
| Interviewed (`INTERVIEWED`) | 0 | 0 | n/a |
| User test (`USER_TEST`) | 0 | 0 | n/a |
| Qualified (`QUALIFIED`) | 0 | 0 | n/a |
| Offered (`OFFERED`) | 0 | 0 | n/a |
| Checkout started (`CHECKOUT_STARTED`) | 0 | 0 | n/a |
| Paid (`PAID`) | 0 | 0 | n/a |
| Activated (`ACTIVATED`) | 0 | 0 | n/a |
| Retained (`RETAINED`) | 0 | 0 | n/a |
| Referred (`REFERRED`) | 0 | — | — |

## Acquisition sources

| Source | Prospects | Responses | Interviews | User tests | Qualified | Offers | Payments | Activation | Retention | Revenue | CPL | CAC | Rev/cust | Gross profit | Contrib. profit | CAC payback |
|--------|----------:|----------:|-----------:|-----------:|----------:|-------:|---------:|-----------:|----------:|--------:|----:|----:|---------:|-------------:|----------------:|------------:|
| Organic / direct (GH Pages, word of mouth) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | $0.00 | $0.00 | n/a | n/a | n/a | n/a | n/a |
| Reddit parenting / learning threads (manual) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | $0.00 | $0.00 | n/a | n/a | n/a | n/a | n/a |
| Homeschool Facebook groups (manual, policy-safe) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | $0.00 | $0.00 | n/a | n/a | n/a | n/a | n/a |
| Library / credit-union family programs | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | $0.00 | $0.00 | n/a | n/a | n/a | n/a | n/a |
| Founder network warm intros | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | $0.00 | $0.00 | n/a | n/a | n/a | n/a | n/a |

_n/a means insufficient data (e.g. CAC with zero payments and zero spend). Do not invent values._

## Weekly callouts

| Callout | Result |
|---------|--------|
| **Biggest funnel constraint** | `DISCOVERED` — No discovered prospects recorded — cannot create retained revenue without a real pipeline. |
| **Weakest stage** | n/a (no conversion volume yet) |
| **Strongest segment** | n/a — no segment has interviews/payments yet |
| **Strongest acquisition source** | n/a — ranked empty; do not pick a winner on zero outcomes |
| **Strongest offer** | n/a — no paid offer performance yet (`OFFER_FOUNDING_FAMILY` not approved/sold) |

## ONE highest-priority revenue experiment

**ID:** `EXP_INTERVIEW_5_S1`

**Experiment:** Complete 5 problem interviews with S1 family caregivers (kids ~6–11) before any paid acquisition scale

**Why (constraint-linked):** Constraint is DISCOVERED: No discovered prospects recorded — cannot create retained revenue without a real pipeline. Zero interviewed→paid evidence means traffic experiments would optimize an upstream vanity number.

**Success metric:** 5 interviewed; ≥3 qualified; documented WTP signal; 0 requirement to increase visitors

**Anti-metric (do not optimize):** Do not celebrate impressions, clicks, or GH Pages traffic alone

> Run only this experiment until the weekly report replaces it.

## How to update

1. Edit `docs/revenue-intelligence/data/ledger.json` (people stages, costs, offers).
2. Run `npm run revenue:report`.
3. Commit the regenerated `WEEKLY_REPORT.md`.
