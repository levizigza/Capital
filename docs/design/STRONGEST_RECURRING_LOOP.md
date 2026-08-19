# Capital — Strongest Recurring Loop (Specification)

**Status:** SPEC FOR APPROVAL — **do not prototype until approved**  
**Inputs:** `MASTER_DESIGN_AUDIT.md` · `CAPITAL_DESIGN_CONSTITUTION.md` · `DECISION_AUDIT.md` · shipped Voyager Ledger + signature cinema  
**Law:** Do **not** add extrinsic rewards (XP, vanity seals, login streaks, quiz clears) to compensate for an uninteresting decision. Interest must live in the decision’s tradeoffs and the world’s causal reply.

---

## 1. Verdict

### Strongest possible recurring loop (name)

**Living Cashflow Commit**

> A visible money situation offers a **commit under scarcity**; the ledger and Harbor answer immediately; the next Pay Day and weather prove whether the commit was wise; the player revises strategy before the next offer.

This is the smallest loop that can stay **intrinsically interesting** while staying Capital (living money, Harbor remembers, CF not pouch vanity).

### Why this wins over alternatives

| Candidate | Recurs? | Intrinsic interest (today) | Verdict |
|-----------|---------|----------------------------|---------|
| Signature Take → hush → spectacle → Piggy | Structure recurs; each Take key is **one-shot** | Highest **emotional** causality | **Keep as chapter climax**, not the grind loop |
| Soft Beat peek → dismiss | Recurs | No fork (**FAKE** as decision) | Preparation only |
| Mastery quiz | Recurs until clear | One right answer (**FAKE** strategy) | Anti-pillar if it *is* the loop |
| Era linger vs rush | Recurs per shore | **MEANINGLESS** for CF | Cut from loop core |
| Harbor deal accept vs pass | Recurs | **OBVIOUS** when chasing Freedom (Accept ≫ Pass); identical 4× ROI | **Right family**, wrong shape — must be redesigned for non-dominance |
| Ritual Pay Day alone | Recurs | **OBVIOUS** (always collect) | Necessary **beat**, not the decision |

**Conclusion:** The recurring core must be a **Cashflow Commit** (liquidity now vs income later vs wait), with Harbor CF weather + Pay Day as the proof engine, and light Memory (Piggy / sky / optional plaque whisper) as interpretation — **not** XP.

The iconic Take cinema remains the **rare irreversible organ beat** that teaches transfer; Living Cashflow Commit is what you **repeat** between those beats and after Freedom.

---

## 2. Canonical loop model

Map every lap to this chain. If a lap skips a link, it is incomplete.

```
FINANCIAL SITUATION
        ↓
   INFORMATION
        ↓
  PLAYER DECISION
        ↓
  SYSTEM RESPONSE
        ↓
  IMMEDIATE EFFECT
        ↓
 DELAYED CONSEQUENCE
        ↓
PLAYER INTERPRETATION
        ↓
  REVISED STRATEGY
        ↓
   NEW SITUATION  ──→ (loop)
```

### Instantiation — Living Cashflow Commit

| Link | Capital content (minimal) |
|------|---------------------------|
| **FINANCIAL SITUATION** | Pouch coins · net monthly CF · Freedom streak (N/3 at ≥$30) · Harbor weather mood from CF · optional “pressure” tag (tight/storm, or upcoming bill) |
| **INFORMATION** | One **Opportunity** card: two commits + Wait. Each commit shows **pouch cost**, **CF Δ /mo**, and one plain risk line (e.g. “Locks $40 until Pay Days refill you”). Weather visible. No hidden quiz. |
| **PLAYER DECISION** | **Commit A** · **Commit B** · **Wait** (defer — keeps pouch, no CF change) |
| **SYSTEM RESPONSE** | Ledger write (holding add / or none on Wait) · weather recalc · short diegetic ack (Piggy or Coin Bag one sentence) |
| **IMMEDIATE EFFECT** | Pouch changes · CF number updates · sky/shop tint shifts if mood crossed a band |
| **DELAYED CONSEQUENCE** | Next **Pay Day**: pouch += CF; Freedom streak ++ or reset; if Commit was wrong for the situation, streak breaks or storm deepens |
| **PLAYER INTERPRETATION** | Piggy / Coin Bag names cause→effect in kid sentence (“Booth helps every month — but your pouch is thin for the next storm”) |
| **REVISED STRATEGY** | Player updates rule: e.g. “Wait when pouch &lt; cost+buffer”; “Take smaller CF when storm”; “Spend into CF when fair + streak 2/3” |
| **NEW SITUATION** | New Opportunity drawn from a tiny deck **biased by** current CF/weather/streak so the *rational* pick shifts |

### Interest condition (non-negotiable)

At least **two** of {Commit A, Commit B, Wait} must be **rational under different circumstances** the player can see.

Examples of circumstance axes (use ≥2 in the minimal deck):

1. **Liquidity** — pouch high vs below buffer  
2. **Streak proximity** — 0/3 vs 2/3 Freedom  
3. **Weather band** — fair vs storm (shop/pressure feel)  
4. **Time preference** — need CF now vs need coins for a known next Commit  

If Wait is never rational, the loop collapses to **OBVIOUS_CHOICE** (today’s Accept ≫ Pass).

---

## 3. What makes it intrinsically interesting (no extrinsic sugar)

| Mechanism | Why it works without XP |
|-----------|-------------------------|
| **Non-dominated commits** | Different cost/CF/risk shapes — not three skins of 4× payback |
| **Visible proof** | Pay Day and weather are the scoreboard the fantasy already owns |
| **Wait as real strategy** | Option value under scarcity — same family as Cove “Maybe later” |
| **State-dependent deals** | New Situation changes which commit is smart — teaches judgment, not memorization of one “correct buy” |
| **Interpretation in myth** | Piggy/sky retell causality — identity + learning, not a toast |

**Forbidden compensators** (constitution / anti-pillars):

- XP, level-ups, mastery quiz clears as loop fuel  
- Vanity carpet polish as “reward for playing the loop”  
- Streak guilt / login theater  
- Random loot that buys Freedom  
- AI lecture after every commit  

---

## 4. Smallest playable implementation

**Goal:** Prove the loop is fun **because the decision is good**, with the least Capital surface area.

### In scope (minimum vertical slice)

| Piece | Role | Existing substrate |
|-------|------|-------------------|
| Harbor plaza (walk optional) | Place | `HomeHubView` / myth fallback OK |
| Voyager Ledger HUD | Situation + immediate CF | `VoyagerLedgerHud`, `voyagerLedger.ts` |
| Weather from CF | Delayed world | `harborWeather.ts` |
| Freedom streak display | Goal pressure | `HARBOR_ESCAPE_*` |
| **Opportunity panel** (1 UI) | Information + Decision | New thin UI **or** stripped deal modal — **spec only until approved** |
| Pay Day control | Delayed consequence | Ritual Pay Day path (strip rumor/chores) |
| Piggy or Coin Bag one-liner | Interpretation | `coinBagBuddy` / Piggy line table |
| Tiny opportunity deck (4–6 cards) | New Situation | Data only; shapes below |

### Out of scope for the minimal slice

- Full party board, rival turns, Debt Trap auto-liabilities  
- Arcade, Capsule, Outfitter, Studio, Family Room, Share PNG  
- Cove/Paycheck/Credit Takes (keep as separate chapter climaxes)  
- Soft Beat arm (optional later CONNECT)  
- Mastery quizzes, XP, carpet polish  
- Era shores, EventDecks  
- New islands / multiplayer  

### Minimal opportunity shapes (illustrative — not final numbers until prototype approval)

Design so ROI and liquidity **conflict**:

| Id | Commit pitch | Cost | CF Δ | When it’s smart | When Wait/other wins |
|----|--------------|-----:|-----:|-----------------|----------------------|
| `steady_jar` | Small jar | Low | +small | Low pouch, building toward $30 | When 2/3 streak and a larger commit is affordable |
| `booth_heavy` | Heavy booth | High | +large | Fair weather, pouch flush, streak wants a jump | Storm / pouch near zero |
| `tempt_tab` | Easy goods now | 0 pouch | **−CF** (liability) | Almost never for Freedom — exists so **avoiding** it is a decision when offered as “free fun” | Always prefer Wait or assets if Freedom is the goal |
| `wait` | Always available | 0 | 0 | Storm, saving for booth, Soft Beat timing (later) | When a clearly good asset fits buffer |

`tempt_tab` is optional in v1; if included, it must be a **true fork** (accept vs refuse), never an auto Debt Trap.

**Pass/Wait** must sometimes be the taught-good move (e.g. storm + thin pouch).

### One-lap script (approval test)

1. Show Situation: CF +$15, pouch 35, streak 1/3, weather *fair*.  
2. Offer: Jar (20, +5) vs Booth (40, +10) vs Wait.  
3. Player cannot afford Booth → Jar vs Wait both plausible (buffer vs speed).  
4. Commit Jar → pouch 15, CF +20, sky still fair.  
5. Pay Day → pouch += 20, streak 2/3.  
6. Piggy: “Jar holds a little every month — two more strong Pay Days and Harbor softens.”  
7. New offer: Booth now reachable vs Wait to keep buffer → rationality flipped.

If step 3 is always obvious, the deck failed — **fix the decision**, do not add a badge.

### Success criteria for a future prototype (when approved)

| Criterion | Pass look |
|-----------|-----------|
| Intrinsic interest | Playtesters pause; argue Jar vs Wait without being told “buy assets” |
| Causal clarity | Cold retell: “I bought X → CF/weather/Pay Day did Y” |
| Non-dominance | In ≥2 scripted situations, different options win |
| No extrinsic crutch | Fun with XP/polish/quizzes disabled |
| Transfer | After 3 laps, player states a rule in their own words |
| Scope | Slice runs without board/arcade/Credit |

### Failure criteria

- Players mash Accept whenever pouch ≥ cost  
- Interest only appears when a reward toast fires  
- Wait never chosen in playtests  
- HUD teaches spreadsheet, not Harbor fantasy  

---

## 5. Relationship to the signature (chapter) loop

```
Living Cashflow Commit (recurring)
        │
        │  funds / pressures / teaches judgment
        ▼
Organ Take (Cove → Paycheck → Credit) — irreversible, scar cinema
        │
        ▼
Harbor spectacle → Plinth → share → Piggy → day-2
        │
        ▼
Back to Living Cashflow Commit (new CF baseline)
```

- **Do not** replace Take cinema with deals.  
- **Do not** make deals require mastery quizzes.  
- Soft Beat may later **CONNECT** as information (peek) into Commit — still not a fake fork.

---

## 6. Constitution gate (pre-approval self-check)

| Principle | Spec stance |
|-----------|-------------|
| Interesting decisions over busywork | Non-dominated A/B/Wait |
| Causal clarity | CF + weather + Pay Day + Piggy sentence |
| Simple primitives | Ledger · Pay Day · Opportunity · Harbor mood · Piggy |
| Consequential agency | Commits write holdings; Wait is agency |
| Learning through experience | Proof on next Pay Day |
| Independent transfer | Later Opportunities remix circumstances |
| Informative failure | Bad commit → streak break / storm — dignity, no shame |
| Contextual UI | One opportunity panel + compact ledger |
| Progressive disclosure | No shop/arcade in minimal slice |
| No manipulative monetization | Pouch only |
| Measurable learning | Rule articulation + transfer prompts in playtest |
| Measurable enjoyment | Pause + retell without reward chrome |
| Technical reliability | Ledger + ritual Pay Day paths already exist |

---

## 7. Explicit non-goals (this spec)

- Rebalancing live `HARBOR_DEALS` numbers on `main` **before approval**  
- Implementing Opportunity UI  
- Widening the map  
- Adding extrinsic reward layers  

---

## 8. Approval ask

Please approve or amend:

1. **Loop name & model** — Living Cashflow Commit as the recurring core  
2. **Minimal slice scope** — Harbor + ledger + weather + Freedom streak + Opportunity A/B/Wait + Pay Day + Piggy line  
3. **Interest law** — fix non-dominance before any prototype; no XP/polish crutches  
4. **Separation** — signature Takes stay chapter climaxes  

**After written approval:** prototype the minimal slice only, instrument cold retell + which option was chosen by situation, and compare against failure criteria above.

---

## Appendix — Evidence pointers

- CF engine / Freedom: `src/islands/voyagerLedger.ts`  
- Weather from CF: `src/islands/harborWeather.ts`  
- Today’s deal dominance: `docs/design/DECISION_AUDIT.md` § D-DEAL  
- Signature emotional loop: `docs/iconic-path.md` · `CAPITAL_DESIGN_BIBLE.md`  
- Anti-pillars (quiz app, spreadsheet, casino, XP treadmill): `docs/design/CAPITAL_DESIGN_CONSTITUTION.md`
