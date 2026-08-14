# Customer segment scorecards

## Method (not intuition theater)

Each dimension scored **1–5** (5 = strongest opportunity for Capital *as it exists today*).

| Dimension | 5 means |
|-----------|---------|
| **PAIN** | Acute, emotionally or financially loaded problem |
| **FREQUENCY** | Problem shows up weekly+ in their life |
| **CURRENT_SOLUTION_GAP** | Today’s tools leave a large unmet gap (higher = worse substitutes) |
| **COST_OF_PROBLEM** | High money/time/stress/opportunity/mistake cost |
| **URGENCY** | Clear reason to act in next 90 days |
| **ABILITY_TO_PAY** | Buyer has budget + authority |
| **REACHABILITY** | We can find them with realistic founder channels |
| **PRODUCT_FIT** | Current Capital experience addresses the job **now** (not roadmap) |

**Composite** = weighted sum (max 100):

| Weight | Dimension |
|-------:|-----------|
| 15 | PAIN |
| 10 | FREQUENCY |
| 10 | CURRENT_SOLUTION_GAP |
| 15 | COST_OF_PROBLEM |
| 10 | URGENCY |
| 15 | ABILITY_TO_PAY |
| 10 | REACHABILITY |
| 15 | PRODUCT_FIT |

`score = round(Σ (weight_i × dim_i / 5))` — enforced in `src/business/customerDiscovery/store.ts`.

**Product-fit gate (near-term GTM):** only segments with `product_fit ≥ 3` are eligible as “ship-now” candidates. Lower-fit segments may still have real pain (e.g. solo adults) but need a different product than iconic Capital.

**Confidence** = Low / Med / High from evidence quality. All start **Low–Med** (primary interviews = 0).

**Rule:** Composite rank ≠ validated ICP until falsification gates in `INTERVIEW_PLAN.md` pass.

---

## Segment index

### Raw composite rank

| Rank | ID | Segment | Composite | Confidence | product_fit |
|-----:|----|---------|----------:|------------|------------:|
| 1 | S2 | Homeschool parents | 74 | Low | 3 |
| 2 | S1 | Parents + kids 6–11 (co-play) | 73 | Low–Med | 4 |
| 3 | S3 | Youth orgs / after-school / CU education | 63 | Low | 2 |
| 4 | S7 | Solo adults 18–35 “catch up” | 60 | Low | 2 |
| 5 | S6 | Grandparents (gift buyers) | 58 | Low | 3 |
| 6 | S4 | Teachers grades 3–8 | 57 | Low | 2 |
| 7 | S5 | Teens 12–17 self-directed | 55 | Low | 3 |
| 8 | S8 | Financial coaches (B2B recommend) | 50 | Low | 2 |

### Fit-gated near-term pool (`product_fit ≥ 3`)

| Rank | ID | Composite | Note |
|-----:|----|----------:|------|
| 1 | S2 Homeschool | 74 | Highest composite in pool — **zero repo demand evidence** |
| 2 | S1 Families | 73 | Design ICP; strongest shipped fit (4) |
| 3 | S6 Grandparents | 58 | Depends on S1 share loop |
| 4 | S5 Teens | 55 | Often not the payer |

**Design ICP (S1) does not win raw composite.** It stays a top candidate because shipped fit is best and docs already invest there — still unvalidated.

---

## S1 — Parents + kids 6–11 (co-play)

**Job (stated in design):** Safe co-play money habits; progress parents can see.  
**Status:** Design ICP (`game-pillars.md`) — **unvalidated**.

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 4 | Money talks with kids are awkward; fear of raising spenders is common culturally — intensity unverified for Capital buyers. |
| FREQUENCY | 4 | Allowance, store trips, “can I buy X?” recur weekly. |
| CURRENT_SOLUTION_GAP | 4 | Allowance apps move money; lectures don’t stick; few adventure games teach irreversible choice. (Competitor depth unmeasured.) |
| COST_OF_PROBLEM | 3 | Long-term habit cost high in theory; short-term cash cost of kid mistakes often small. |
| URGENCY | 3 | Spikes at first allowance / holidays / back-to-school — not constant crisis. |
| ABILITY_TO_PAY | 4 | Parent controls purchase; games/apps already in many budgets. |
| REACHABILITY | 3 | Parenting channels exist; CAC unknown; share card may help. |
| PRODUCT_FIT | 4 | Cove family tier + signature loop match co-play fantasy; **parent progress view incomplete** (security gate + production week 9). |
| **Composite** | **73** | |

**Evidence supporting:** Pillars segment A; Cove elementary polish target; production beta = families; signature loop for felt save/spend.  
**Weaknesses:** Unvalidated demand; may want debit rails; parent dashboard incomplete.  
**Evidence missing:** Interviews, WTP, completed beta findings, competitor win/loss.

---

## S2 — Homeschool parents

**Job:** Curriculum-shaped money unit kids finish without worksheets.

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 4 | Must cover life skills; shopping for curricula is constant. |
| FREQUENCY | 4 | Scheduled learning blocks weekly. |
| CURRENT_SOLUTION_GAP | 4 | Workbooks + random YouTube; engagement gap plausible. |
| COST_OF_PROBLEM | 3 | Opportunity cost of weak life-skills coverage. |
| URGENCY | 4 | Term planning creates buy windows. |
| ABILITY_TO_PAY | 4 | Already buys curriculum packs. |
| REACHABILITY | 4 | Forums/co-ops/conventions are concentrated. |
| PRODUCT_FIT | 3 | Adventure fit strong; standards/lesson wraps and parent reports thin today. |
| **Composite** | **74** | |

**Evidence supporting:** Logical adjacency to family tier (hypothesis).  
**Weaknesses:** Not named in pillars; **zero** repo evidence; scores may be optimistic.  
**Falsify first:** IH-4 in interview plan.

---

## S3 — Youth orgs / after-school / credit-union education

**Job:** Engaging financial-literacy activity for groups without building a game.

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 4 | Engagement + outcomes reporting pressure. |
| FREQUENCY | 3 | Program cycles, not daily. |
| CURRENT_SOLUTION_GAP | 3 | Existing kits/speakers; digital adventure uncommon. |
| COST_OF_PROBLEM | 3 | Grant/mission metrics; reputation if kids disengage. |
| URGENCY | 3 | Grant calendars / program seasons. |
| ABILITY_TO_PAY | 4 | Institutional budget possible (seats). |
| REACHABILITY | 3 | Relationship sales; slow but real. |
| PRODUCT_FIT | 2 | No class codes, facilitator mode, or roster tools. |
| **Composite** | **63** | |

Fails fit gate for near-term GTM without product work (out of iconic freeze scope unless interiors-only deepening helps facilitators — unlikely).

---

## S4 — Teachers grades 3–8

**Job:** Standards-aligned quests, session length, no ads/data surprises (`game-pillars` C).

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 4 | Personal finance mandates rising in places; engagement hard. |
| FREQUENCY | 3 | Unit weeks, not daily forever. |
| CURRENT_SOLUTION_GAP | 3 | Free curricula exist (H-COMP-04). |
| COST_OF_PROBLEM | 3 | Student outcomes + prep time. |
| URGENCY | 3 | Curriculum calendar. |
| ABILITY_TO_PAY | 2 | Teacher personal spend low; district procurement slow. |
| REACHABILITY | 3 | Communities exist; sales cycle long. |
| PRODUCT_FIT | 2 | Class codes “later”; school-ready ops incomplete. |
| **Composite** | **57** | |

---

## S5 — Teens 12–17 self-directed

**Job:** Relevant jobs/cards/goals without lecture (`game-pillars` B).

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 3 | Care about money episodically. |
| FREQUENCY | 3 | Spiky. |
| CURRENT_SOLUTION_GAP | 3 | TikTok/YouTube + bank teen products. |
| COST_OF_PROBLEM | 3 | First paycheck/credit mistakes can be real. |
| URGENCY | 3 | First job / first card triggers. |
| ABILITY_TO_PAY | 2 | Parent often pays. |
| REACHABILITY | 2 | Hard without social machine or school channel. |
| PRODUCT_FIT | 3 | Paycheck/Credit topics age-up; Harbor may still read kid. |
| **Composite** | **55** | |

---

## S6 — Grandparents (gift)

**Job:** Meaningful gift that “teaches money.”

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 3 | Desire to help; guilt/distance. |
| FREQUENCY | 2 | Birthdays/holidays. |
| CURRENT_SOLUTION_GAP | 3 | Books/bonds/cash gifts. |
| COST_OF_PROBLEM | 2 | Low acute cost. |
| URGENCY | 4 | Gift calendar. |
| ABILITY_TO_PAY | 4 | Gift budgets. |
| REACHABILITY | 2 | Diffuse; depends on parent share loop. |
| PRODUCT_FIT | 3 | Share PNG helps story; gift SKU undefined. |
| **Composite** | **58** | |

---

## S7 — Solo adults 18–35

**Job:** Practical budget/invest basics in short sessions (`game-pillars` D).

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 3 | Real money stress — often needs utilities not games. |
| FREQUENCY | 4 | Bills are constant. |
| CURRENT_SOLUTION_GAP | 2 | Budget apps / fintech saturate. |
| COST_OF_PROBLEM | 4 | High real $ cost of adult mistakes — pulls composite up. |
| URGENCY | 3 | After shocks they want tools, not fantasy. |
| ABILITY_TO_PAY | 3 | Can pay; crowded category. |
| REACHABILITY | 3 | Broad but noisy. |
| PRODUCT_FIT | 2 | Harbor + Cove skew kid; adult tier thin. |
| **Composite** | **60** | |

**Warning:** High composite + low fit = **pain without product**. Do not chase without a different experience.

---

## S8 — Financial coaches / counselors

**Job:** Assign engaging practice between sessions.

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| PAIN | 3 | Client follow-through. |
| FREQUENCY | 3 | Session cadence. |
| CURRENT_SOLUTION_GAP | 3 | Worksheets/apps. |
| COST_OF_PROBLEM | 2 | Indirect. |
| URGENCY | 2 | Low fire drill. |
| ABILITY_TO_PAY | 3 | May expense tools. |
| REACHABILITY | 2 | Niche sales. |
| PRODUCT_FIT | 2 | No coach dashboard / assign flow. |
| **Composite** | **50** | |

---

## Score sensitivity

- Dropping S2 urgency or reachability by 1 each (optimistic scoring risk) can put **S1 ahead on raw composite** — another reason interviews must come before crowning.
- If S1 PRODUCT_FIT drops to 2 (rails required), S1 exits fit-gated pool.
- Raising S4 ABILITY_TO_PAY only matters after procurement proof.
