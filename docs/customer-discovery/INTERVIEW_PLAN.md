# Interview plan & falsification

**Goal:** Turn scorecard hypotheses into killable claims.  
**Do not** ship product changes from this doc alone.

---

## Interview hypotheses (must be tested)

These are the claims interviews are designed to break or support.

1. **IH-1:** Parents of kids 6–11 will describe a recurring, emotionally loaded money-teaching problem they would pay to solve *without* needing a debit card product.
2. **IH-2:** The “felt irreversible choice” job is unmet by allowance apps + lectures (parents can name the gap unprompted or with mild prompting).
3. **IH-3:** After a 10-minute Cove cold play, parents say the Plinth/share moment is something they’d show another adult (acquisition loop).
4. **IH-4:** Homeschool parents will pay curriculum-like prices for a complete “money unit” even if school features are missing.
5. **IH-5:** Teachers will not purchase on personal cards; without roster/session tools they churn in week 1 of trial.
6. **IH-6:** Teens will not self-serve discover Capital; parent or school must introduce it.
7. **IH-7:** Solo adults bounce on tone within 5 minutes (“this is for kids”).
8. **IH-8:** Willingness to pay for family base license clusters at a stated range we can measure (record numbers; no anchoring to our hypothesis first).

---

## Questions we need answered (by segment)

### All segments (opening)

- Walk me through the last time money came up with [child / students / yourself]. What did you try?
- What broke or felt unsatisfying about that?
- What have you already paid for in this area? What did you stop using and why?
- If a magic wand fixed one thing, what is it? (Do **not** pitch Capital first.)

### S1 Parents 6–11

- Do you need **real money movement** (card/account), or is practice-in-fiction enough?
- Who decides purchases of kids’ apps/games in your home?
- Would you play **with** the child or hand them the device?
- After Cove demo: What did your child learn? Would you pay? How much? What would make you refund?

### S2 Homeschool

- How do you pick life-skills curricula today?
- What does a “done” money unit look like for your records?
- Seat count? Co-op sharing?

### S3 Youth org / CU

- How do you measure program success today?
- Device constraints (Chromebook, no installs)?
- Procurement path and typical ticket size?

### S4 Teachers

- Which standards must map?
- Minutes per class period? Tech policy (accounts, PII)?
- Who pays (you / PTA / district)?

### S5 Teens

- Last money product/app you used without a parent?
- Does Harbor read “for kids”? Fatal or fine?

### S6 Grandparents

- Last gift meant to “teach”? What happened?
- Need parent involved to set up?

### S7 Solo adults

- What did you try for budgeting in the last year?
- When you are stressed about money, do you want a game?

### S8 Coaches

- Do you assign homework between sessions? Completion rate?
- Privacy constraints for recommending a game?

---

## Recommended interview candidates (recruit targets)

| Priority | Who | n (first wave) | Why |
|----------|-----|----------------|-----|
| P0 | Parents with at least one child **7–10**, mixed allowance/no-allowance | 8–10 | Tests S1 / IH-1–3, IH-8 |
| P0 | Homeschool parents who taught any life-skills unit in last 12 months | 5 | Tests S2 / IH-4 |
| P1 | Elementary teachers who taught any personal-finance or math-money unit | 5 | Tests S4 / IH-5 |
| P1 | After-school or credit-union youth-ed coordinator | 3 | Tests S3 |
| P2 | Teens 14–16 with first job or debit card | 5 | Tests S5 / IH-6 |
| P2 | Adults 22–30 who abandoned a budget app | 5 | Tests S7 / IH-7 |
| P2 | Grandparent who bought an educational gift last year | 3 | Tests S6 |
| P3 | Financial coach / counselor | 3 | Tests S8 |

**First wave total ~30 conversations** — matches production plan’s beta cohort *scale*, but **discovery interviews ≠ playtest metrics**. Do both; do not conflate.

**Screeners (examples):** Exclude employees of teen-banking competitors; exclude people who only want free forever with no problem story.

---

## Specific falsification criteria

| Claim | Falsified if… | Supported if… |
|-------|----------------|---------------|
| S1 is viable ICP | <30% of P0 parents articulate a problem Capital could own **or** >50% require real money rails as must-have | ≥60% describe non-rail teaching gap + ≥40% state WTP > $0 after demo |
| Adventure > rails for S1 | Majority say “without a card this is useless” after understanding product | Majority say practice/fiction is enough for ages 6–11 |
| Share loop works | <20% would show Plinth/share to another adult | ≥50% spontaneously or firmly agree they’d share |
| Homeschool outranks general family | Homeschool WTP/urgency clearly higher **and** S1 weak | Opposite or inconclusive → keep S1 provisional lead |
| Teachers are near-term revenue | Teachers cannot name a payer within 90 days **or** refuse trial without LMS features | Named budget + trial path despite missing LMS |
| Teen self-serve | Teens won’t finish Cove without parent/school push in moderated test | Teens return day-2 unprompted |
| Solo adult segment | Tone reject ≥60% in 5 minutes | Adults request adult skin / finish Paycheck for self |
| Premium base hypothesis | Modal WTP below cost-to-serve **or** “free only” dominates | Clustered WTP covers premium base narrative |

**Promotion rule:** A hypothesis in `HYPOTHESES.md` becomes a **verified fact** only when interview notes (or instrumented cohort data) are filed under `docs/customer-discovery/evidence/` with date, segment, and quote IDs — never from design consensus alone.

---

## Evidence folder (create when interviews exist)

```
docs/customer-discovery/evidence/
  YYYY-MM-DD-<segment>-<code>.md   # notes, quotes, WTP, falsifier outcomes
```

Until that folder has real files, **confidence stays Low–Med**.
