# Screener (privacy-minimal)

**Purpose:** decide if someone belongs in the target population for a given round.  
**Not:** a marketing lead form.  
**Data rule:** collect the minimum needed to schedule and segment. Prefer alias over legal name.

---

## What we collect

| Field | Required? | Notes |
|-------|-----------|--------|
| Preferred name or alias | Yes | |
| Contact for scheduling (email **or** platform handle) | Yes | Delete after study window if they opt out |
| Timezone (coarse) | Yes | e.g. US Eastern — not GPS |
| Round applied for (A/B/…) | Yes | |
| Screener answers below | Yes | |
| Age band of adult (18–24 / 25–34 / 35–44 / 45–54 / 55+) | Optional | Band only |
| Child age band (for S1/S2/S5) | Yes if relevant | Age number OK; **no** child name |
| Consent checkboxes | Yes | |

## What we never collect in screener

- SSN / government ID  
- Exact street address  
- Income / net worth / bank balances  
- Child’s full legal name or photos  
- School student ID / grades transcript  
- Health / disability details (offer accessibility **accommodations** as free text if they volunteer)  
- Precise geolocation  

---

## Shared disqualify (all rounds)

Auto-exclude if:

1. Under 18 applying without guardian (for adult rounds)  
2. Works at named competitor (see list) in last 24 months  
3. Cannot do remote session in next 21 days and declines async alternative  
4. Refuses consent / privacy notice  

**Competitor employment list (self-report):** Greenlight, GoHenry, Current, Step, FamZoo, Copper, GoGoMoney, BusyKid, or “other kids debit/allowance app” (specify).

---

## Round A — Families (S1)

**Qualify if all true:**

1. I am a parent/guardian of a child who is **7, 8, 9, or 10** years old.  
2. That child lives with me at least half the time.  
3. In the last 90 days we talked about spending, saving, allowance, or “can I buy X?”  
4. I can join a 30–60 min video call; if my child plays, I will stay present.  
5. I am not employed by a kids’ money/debit app competitor (last 24 months).

**Soft flags (do not auto-kill; balance cohort):**

- Already pays for Greenlight-class product → label “rails user”  
- Never gives allowance → label “no allowance”  
- Works in education/games → label “pro adjacent”

**Open (optional, free text, skippable):**  
“In one sentence, what’s hardest about teaching your child about money?”  
*(If blank and all else pass → still eligible; blank is OK.)*

---

## Round B — Homeschool (S2)

**Qualify if all true:**

1. I homeschool or hybrid-school at least one child **6–12**.  
2. In the last 12 months I taught **or** in the next 6 months I plan a life-skills or money-related unit.  
3. In the last 18 months I evaluated or bought at least one curriculum/resource (any subject).  
4. I can describe what “done” looks like for a unit.  
5. Competitor employment bar (same).

---

## Round C — Teachers (S4)

1. I teach or taught grades **3–8** within last 24 months.  
2. I taught a money, personal-finance, or money-in-math unit (or will this year).  
3. I can speak to how tools get approved/paid at my school (even if answer is “I don’t know”).  
4. Competitor bar.

---

## Round D — Youth org / CU (S3)

1. My role includes youth financial education or program coordination.  
2. I influence tool choice or can introduce researchers to the person who does.  
3. Competitor bar (fintech kids products).

---

## Round E — Teen via parent

**Parent qualifies first (Round A-like), then:**

1. Teen is **14–16**.  
2. Teen has a job **or** a debit/teen banking product **or** regular own spending money.  
3. Parent will attend start of session; teen assents.  
4. No cold contact with teen alone.

---

## Round F — Solo adult

1. Age **22–30** (band).  
2. Abandoned or stopped using a budget/money app in last 12 months.  
3. Willing to try a short play session and say if it feels “for kids.”  
4. Competitor bar optional (adult fintech OK).

---

## Round G — Grandparent

1. I am a grandparent (or grandparent-figure).  
2. I bought an educational gift for a grandchild in last 12 months **or** plan to this year.  
3. Child age in family roughly 6–12 (band).

---

## Pass / fail recording (for humans)

Store in private sheet / CRM — **not** in git:

`screener_id, round, pass|fail, fail_reason_code, channel, scheduled(y/n), cohort_id`

Fail reason codes: `age`, `no_money_talk`, `competitor`, `no_consent`, `capacity`, `other`.

De-identified weekly tally **may** go in `cohorts/COHORT_xx_NOTES.md` (counts only).
