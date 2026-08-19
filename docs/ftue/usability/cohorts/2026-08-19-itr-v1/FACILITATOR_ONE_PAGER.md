# ITR cohort — facilitator one-pager

**Goal:** Measure whether a player can use Cove’s save/spend lesson at Vendor Vee **without being told.**  
**Build:** Production site after this merge — https://levizigza.github.io/Capital/  
**Time:** 25–35 min · **n ≥ 5** · **Fresh profile** · Observer does **not** hint.

Full protocol: [INDEPENDENT_TRANSFER_PLAYTEST.md](../../INDEPENDENT_TRANSFER_PLAYTEST.md)  
Observer sheet: [COLD_SESSION_OBSERVER_SCRIPT.md](../../../playtest/COLD_SESSION_OBSERVER_SCRIPT.md)  
Session log: copy [TEMPLATE_SESSION_LOG.md](../../TEMPLATE_SESSION_LOG.md) → `P1_SESSION.md` here.

---

## You may say

- “You’re exploring a money island. I’ll watch — ask only if you’re really stuck.”
- After 3+ minutes stuck: “Look around for someone to talk to” (never the answer).

## You must not say

- jar / treat / Cove mapping  
- “pick the umbrella” / “this is like saving”  
- Credit unlocks, quest walkthroughs, or `__QA__` seeds

**Do not use** `__QA__.seedIndependentTransfer()` for this KPI. Seeds are for QA only.

---

## Path (one sitting)

1. New profile → Ashore if shown → Harbor → Piggy if prompted  
2. Money Carpet → **Coincraft Cove** → earn → **jar vs treat Take**  
3. Carpet home → Piggy / Plinth if they appear  
4. Map → **Paycheck Peninsula** → **stop talking**  
5. Vendor Vee — two prices  
6. After they commit (or quit), ask Pattern #94 six questions + anecdote prompt

---

## Score one binary per player

| Result | Counts as |
|--------|-----------|
| Commits Vee Take without asking what Cove “meant”, no tutorial replay | **Success** |
| Asks observer / maps only after being told / quits before Take | **Failure** |
| Settings → Tutorial replay, then succeeds | **Hinted** (not independent) |

**ITR** = successes ÷ (successes + failures + hinted)

---

## Anecdote prompt (end of session)

> “Tell me the most memorable thing that happened — in your own words.”

Write the quote on [COHORT_SUMMARY.md](./COHORT_SUMMARY.md). Do not score density here; just capture recall.

---

## After all five

1. Fill the table on `COHORT_SUMMARY.md`  
2. Update [INDEPENDENT_TRANSFER_PLAYTEST.md](../../INDEPENDENT_TRANSFER_PLAYTEST.md) `HUMAN_ITR`  
3. Update [VERTICAL_SLICE_GATE.md](../../../design/VERTICAL_SLICE_GATE.md) **only** with cited cohort id + build SHA  
4. Do **not** bump TRANSFER on QA scripts alone
