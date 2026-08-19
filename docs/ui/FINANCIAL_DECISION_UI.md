# Capital — Financial Decision UI Audit

**Date:** 2026-08-19  
**Scope:** Read-only audit of every **major financial decision surface** on the Islands product path. No production code modified.  
**Unlock test (mandatory):** *What decision does this UI element help the player make?*  
**Companions:** [DECISION_PREVIEW_ARCHITECTURE.md](../design/DECISION_PREVIEW_ARCHITECTURE.md) · [FINANCIAL_FEEDBACK_VOCABULARY.md](../design/FINANCIAL_FEEDBACK_VOCABULARY.md) · [UI_LAYER_AUDIT.md](../design/UI_LAYER_AUDIT.md) · [DECISION_AUDIT.md](../design/DECISION_AUDIT.md) · [CAPITAL_FIRST_HOUR.md](../ftue/CAPITAL_FIRST_HOUR.md)

**Law:** Before commitment, show only what the simulation can honestly know — labeled by certainty. Never dress **UNKNOWN** as **KNOWN**. Presentation teaches **risk literacy**, not spreadsheet cosplay.

---

## 1. Pre-commit information dimensions

Every consequential financial commit should help the player judge these dimensions **when the sim supports them**:

| Dimension | Player question | Typical source in Capital |
|-----------|-----------------|---------------------------|
| **cash_after** | How many coins stay in my pouch if I pick this? | `userProfile.totalCoins` ± cost |
| **cashflow_change** | Does monthly keep/drain change? | `voyagerLedger` holdings, salary/expenses |
| **liquidity_change** | Will I still have enough on hand for the next obligation? | Pouch vs deal cost + buffer band |
| **debt_change** | Does owed burden / liability stock change? | Liability holdings, treat tabs |
| **future_obligation** | What keeps draining each Pay Day? | Liability `/mo`, streak obligations |
| **risk** | Does storm / haste / spiral exposure shift? | `harborWeather`, haste scars, CF band |
| **potential_upside** | What could this earn or protect? | Asset `/mo`, buffer holds |
| **potential_downside** | What could this cost or forfeit? | Drain, opp cost, weather |
| **opportunity_cost** | What road am I not taking? | Other fork label, Pass/Wait |
| **reversibility** | Can I undo this later? | Irreversible Take vs deal vs defer |

If a dimension is **not modeled**, show **UNKNOWN** — do not invent a number.

---

## 2. Certainty taxonomy

Map every pre-commit row to exactly one level. (Aligns with `DECISION_PREVIEW_ARCHITECTURE.md` — **KNOWN** = **CERTAIN** in player copy.)

| Level | UI word | Means | Example |
|-------|---------|-------|---------|
| **KNOWN** | Known · Certain | Follows from rules already in save; no hidden roll | Jar Take → keep +$5/mo holding |
| **ESTIMATED** | Estimated · ≈ | Model projection; other events may intervene | “Sky often softens when keep ≥ $30” |
| **PROBABILISTIC** | Chance | True randomness in fantasy | Rare on spine; board RNG spaces |
| **UNKNOWN** | Unknown | Not computable pre-commit | Exact Piggy line; unmodeled social tone |

### Literacy rules

1. **KNOWN** rows use exact integers (`120 coins`, `+$5/mo`).  
2. **ESTIMATED** rows use `≈`, “often”, “usually”.  
3. **PROBABILISTIC** never nudges Accept on spine Takes (anti-casino).  
4. **UNKNOWN** uses em dash + “Harbor will show” — not a fake precise value.  
5. Certainty = **text + shape** (solid vs dashed underline); color is reinforcement only.

---

## 3. Three information layers

| Layer | When visible | Holds | Must not hold |
|-------|--------------|-------|---------------|
| **1 — CRITICAL persistent state** | While surface is playable | Place, compact **Cash**, one next verb, Esc/Leave | Full CF spreadsheet, wealth rank, XP, stance bars, mastery count |
| **2 — DECISION-CONTEXT** | Only during active fork | Preview rows for **this** commit; lock hints; coach one-liner | Permanent plaza dashboard |
| **3 — DEEP ANALYSIS on demand** | Player opens intentionally | Expanded ledger, Plinth scars, holdings list, Settings analytics | Forced before Take |

Reference: [UI_LAYER_AUDIT.md](../design/UI_LAYER_AUDIT.md).

---

## 4. Major financial decision surfaces — summary register

| ID | Surface | Decision | Layer | Pre-commit preview quality | Primary gap |
|----|---------|----------|-------|---------------------------|-------------|
| **FD-01** | TalkBattle — Cove Take | Jar vs treat vs defer | 2 | **Partial** — `/mo` KNOWN for Cove only | cash_after, risk EST., opp cost in copy only |
| **FD-02** | TalkBattle — Paycheck Take | Umbrella vs glitter | 2 | **Weak** — narrative foreshadow only | No `/mo` preview in UI (code writes holdings) |
| **FD-03** | TalkBattle — Credit Take | Wait vs borrow | 2 | **Weak** — narrative + risk opaque | risk EST., CF KNOWN rows missing |
| **FD-04** | TalkBattle — digressions | Listen vs rush, shell, tip | 2 | **Thin** — tone foreshadow | CF correctly 0; opp cost narrative only |
| **FD-05** | TakeHushOverlay | *(post-commit)* | 2→3 | Shows footprint **after** commit | Not pre-commit; OK as consequence |
| **FD-06** | IslandBoard — Deal offer | Buy vs Pass | 2 | **Partial** | cash_after KNOWN; liquidity/risk/opp cost weak |
| **FD-07** | IslandBoard — Debt trap | Borrow vs buyout vs walk | 2 | **Partial** | debt KNOWN; liquidity on buyout only |
| **FD-08** | IslandBoard — CF claim space | Spend pouch for +$/mo | 2 | **Message-only** | No structured preview panel |
| **FD-09** | WealthHud | *(ambient)* | 1 | cash_after **now** only | Not a decision panel |
| **FD-10** | VoyagerLedgerHud | *(ambient)* | 1 / 3 | Aggregate CF KNOWN | Not per-option; expand = layer 3 |
| **FD-11** | Freedom chip | Collect Pay Day / chase | 2 | ESTIMATED streak | Can over-promise if labeled KNOWN |
| **FD-12** | Harbor ritual Pay Day | Collect today | 2 | CF→coins **implicit** | No keeps/drains breakdown |
| **FD-13** | Capsule / carpet / plaza shop | Buy cosmetic/tactical | 2–3 | cash_after KNOWN | Must not read as asset/income |
| **FD-14** | EarnSpend (Cove minigame) | Earn vs spend session wallet | 2 | wallet KNOWN | Separate from ledger; “Not enough!” |
| **FD-15** | Travel map lock hint | Sail vs blocked | 2 | Access only | Not financial preview |
| **FD-16** | Memory Plinth | *(post-hoc)* | 3 | Retell + scars | Analysis, not pre-commit |
| **FD-17** | MasteryQuiz | Quiz answers | — | **N/A** | Not a financial decision |
| **FD-18** | Credit Scanner gate | Scan now vs later | 2 | Access timing | Not money commit |

---

## 5. Detailed audits

### FD-01 — TalkBattle: Cove irreversible Take (`cove_save_vs_spend`)

**File:** `TalkBattleScreen.tsx` · `firstFinancialScenario.ts` · `coincraft-cove.islands.json`

**Decision helped:** Which plaque + monthly cushion shape — jar before treat or treat before jar?

| Dimension | Shown pre-commit? | Certainty | Where |
|-----------|-------------------|-----------|-------|
| cash_after | No | — | Pouch unchanged at Take |
| cashflow_change | **Yes** | **KNOWN** | `coveTakeChoiceFootprintPreview` → `Monthly keep +$5/mo` or `drain −$5/mo` |
| liquidity_change | No | UNKNOWN | — |
| debt_change | Partial (treat = liability) | **KNOWN** via drain line | Same footprint string |
| future_obligation | Partial | **KNOWN** (treat drain) | Wording “Treat Tab” |
| risk | Narrative only | **ESTIMATED** | Choice copy “quieter hush” / “louder gossip” |
| potential_upside | Partial | **KNOWN** (+$5/mo) | Footprint on save path |
| potential_downside | Partial | **KNOWN** (−$5/mo) | Footprint on spend path |
| opportunity_cost | Copy only | **ESTIMATED** | “Instead of treat/jar” in foreshadow text |
| reversibility | Copy | **KNOWN** | “This Take sticks”; Maybe later = reversible defer |

**Layer placement:** Footprint subline = **Layer 2** on choice row. Organ chip / Soft Beat arm = **Layer 2** context.

**What decision does this help?** Pick jar vs treat knowing **monthly CF direction** before commit.

**Verdict:** **KEEP** footprint — best-in-class today. **IMPROVE:** Add certainty glyph (“Known”) + `Instead of…` row per [DECISION_PREVIEW_ARCHITECTURE.md](../design/DECISION_PREVIEW_ARCHITECTURE.md) P0.

**Flag:** **UNINFORMED_CHOICE** risk if player skips reading subline (DECISION_AUDIT D-COVE secondary).

---

### FD-02 — TalkBattle: Paycheck Take (`paycheck_protect_vs_spend`)

**File:** `paycheck-peninsula.islands.json` · `spineTakeFootprints.ts`

**Decision helped:** Umbrella before glitter vs glitter ate umbrella.

| Dimension | Shown pre-commit? | Certainty | Notes |
|-----------|-------------------|-----------|-------|
| cash_after | No | — | — |
| cashflow_change | **No in UI** | **KNOWN in sim** | Code: +$4/mo asset vs −$4/mo liability |
| liquidity_change | No | UNKNOWN | — |
| debt_change | No | **KNOWN in sim** | Glitter tab liability |
| future_obligation | No | **KNOWN in sim** | — |
| risk | Copy tone | **ESTIMATED** | “quieter Main Street” / “louder rain gossip” |
| potential_upside/downside | No numeric | **UNKNOWN in UI** | **Gap vs Cove parity** |
| opportunity_cost | Copy | **ESTIMATED** | — |
| reversibility | **KNOWN** | “Harbor keeps whichever you pick” | Irreversible |

**Layer:** Choice text = Layer 2; **missing** automated footprint subline (`coveTakeChoiceFootprintPreview` is Cove-key-only).

**What decision does this help?** Transfer fork — player should decide **without** Cove labels; still needs honest `/mo` if sim writes holdings.

**Verdict:** **CONNECT** — wire `paycheckTakeFootprintPreview()` mirroring Cove (KNOWN rows). First-hour transfer ([CAPITAL_FIRST_HOUR.md](../ftue/CAPITAL_FIRST_HOUR.md)) depends on **felt** consequence, not plaque-only.

**Flag:** Was MEANINGLESS at CF=0 in older audit — **code now diverges CF**; UI lags sim → **UNINFORMED_CHOICE**.

---

### FD-03 — TalkBattle: Credit Take (`credit_borrow_vs_wait`)

**File:** `credit-kingdom.islands.json` · `spineTakeFootprints.ts` · `harborWeather.ts`

**Decision helped:** Wait the spiral vs haste fed the spiral.

| Dimension | Pre-commit | Certainty |
|-----------|------------|-----------|
| cashflow_change | Not in UI | **KNOWN in sim** (+$6/mo wait asset vs −$8/mo borrow tab) |
| risk | Not in UI | **ESTIMATED** — haste + low CF → storm band |
| opportunity_cost | Copy | **KNOWN** (other plaque label) |
| reversibility | **KNOWN** | Irreversible |

**What decision does this help?** Patience vs haste under spiral fantasy — needs **Risk ≈ Estimated** row when CF &lt; threshold.

**Verdict:** **IMPROVE** — add KNOWN `/mo` footprint + ESTIMATED risk chip; never PROBABILISTIC storm %.

---

### FD-04 — TalkBattle: Digression forks (shell, tip, era listen/rush)

**Decision helped:** Curiosity / shelf / gossip — **not** primary CF teaching.

| Dimension | Pre-commit |
|-----------|------------|
| cashflow_change | **KNOWN 0** (no holding) — correctly omit numeric CF |
| opportunity_cost | Narrative **ESTIMATED** |
| reversibility | Scar idempotent; **KNOWN** in content |

**What decision does this help?** Optional identity footprint — **do not** add fake `/mo` rows.

**Verdict:** **KEEP** thin; ensure no Asset/Income chrome (FINANCIAL_FEEDBACK_VOCABULARY §4 B6).

---

### FD-05 — TakeHushOverlay (post-commit cinema)

**Decision helped:** *Interpret* consequence — not choose.

Shows `footprintLine` (KNOWN `/mo`) + organ line + scar label. **Layer 2→3** bridge.

**Verdict:** **KEEP** as consequence feedback, not pre-commit preview.

---

### FD-06 — IslandBoard: Harbor deal offer

**File:** `IslandBoardView.tsx` · `acceptDeal()` · `HARBOR_DEALS`

**Decision helped:** Spend pouch now for recurring asset vs Pass (Wait).

| Dimension | Shown | Certainty |
|-----------|-------|-----------|
| cash_after | Partial | **KNOWN** — “Pay N coins”; shows pouch; insufficient message |
| cashflow_change | Partial | **KNOWN** — `+$X/mo` stated |
| liquidity_change | Weak | **ESTIMATED** — “not enough yet” binary only |
| debt_change | N/A | — |
| future_obligation | No | — |
| risk | No | UNKNOWN |
| potential_upside | Partial | **KNOWN** +$/mo |
| potential_downside | Partial | **KNOWN** −coins now |
| opportunity_cost | Weak | Pass copy only — **ESTIMATED** |
| reversibility | **KNOWN** | Pass reversible; buy sticks as holding |

**Layer:** Modal panel = **Layer 2** during board idle.

**What decision does this help?** Accept vs Pass on **this** deal given pouch and CF upside.

**Verdict:** **IMPROVE** — add `Cash after: N` KNOWN row, `Instead of: waiting` KNOWN, `Next Pay Day ≈` ESTIMATED; certainty labels.

**Flag:** Dominant Accept when chasing Freedom (DECISION_AUDIT D-DEAL OBVIOUS) — UI should not hide Pass opportunity cost.

---

### FD-07 — IslandBoard: Debt trap (liability offer)

**Decision helped:** Borrow vs buyout vs walk.

| Dimension | Shown | Certainty |
|-----------|-------|-----------|
| cash_after | Partial | Buyout cost vs pouch |
| cashflow_change | Partial | **KNOWN** −$/mo if borrow |
| debt_change | Partial | **KNOWN** liability |
| liquidity_change | Partial | Buyout affordability |
| future_obligation | Partial | **KNOWN** monthly drain if borrow |
| risk | No | **UNKNOWN** in UI |
| opportunity_cost | Walk = **KNOWN** no new liability |
| reversibility | Walk **KNOWN**; borrow sticks |

**What decision does this help?** Escape trap without confusing borrow with “free money.”

**Verdict:** **KEEP** structure · **IMPROVE** Owes dashed-row vocabulary + Risk UNKNOWN explicit for unmodeled compounding.

---

### FD-08 — IslandBoard: Cashflow claim space

**File:** `partyBoard.ts` — spend pouch for `BOARD_CASHFLOW_CLAIM`

**Decision helped:** Trade liquid coins for +$/mo asset on board.

Pre-commit: event text only — **no Layer 2 panel**.

**Verdict:** **REBUILD** preview to match deal panel (KNOWN cost, KNOWN +$/mo, liquidity).

---

### FD-09 — WealthHud (compact Cash)

**File:** `WealthHud.tsx` · `wealth.ts`

**Decision helped:** Can I afford the **next** shop/deal/commit?

| Shows | Layer |
|-------|-------|
| Pouch integer | **1** |
| Wealth rank (non-compact) | **1** — **UNNECESSARY** for decisions |

**Verdict:** **KEEP** compact Cash · **REMOVE** rank from decision path ([PROGRESSION_AUDIT.md](../design/PROGRESSION_AUDIT.md)).

---

### FD-10 — VoyagerLedgerHud

**File:** `VoyagerLedgerHud.tsx`

**Decision helped:** Is my monthly keep/drain healthy? Should I Accept deal or Wait?

| Shows | Certainty | Layer |
|-------|-----------|-------|
| Net CF `/mo` | **KNOWN** | 1 compact / 3 expanded |
| Income/expense split | **KNOWN** | 3 expanded |
| Holdings chips (4 max) | **KNOWN** per holding | 3 |
| Freedom streak | **KNOWN** count; **ESTIMATED** outcome | 1 when chasing |

**Not shown:** Per-choice projection — belongs on **Layer 2** at commit.

**What decision does this help?** Medium-horizon CF strategy — **not** substitute for Take preview.

**Verdict:** **KEEP** post–Cove Change · hide during quiet/cinema.

---

### FD-11 — Freedom plaza chip

**File:** `freedomPlazaChip()` · `HomeHubView.tsx`

**Decision helped:** Should I prioritize Pay Day / deals to chase Seal?

Copy: `Seal chase · streak N/3` or `+CF/mo (need $30)` — **ESTIMATED** unless streak math labeled carefully.

**Verdict:** **KEEP** as Layer 2 while chasing · never **KNOWN** “Seal in 2 days” if streak can break.

---

### FD-12 — Harbor ritual Collect Pay Day

**File:** `HomeHubView.tsx` · `applyPayday()`

**Decision helped:** Claim monthly CF → pouch now?

| Dimension | Shown | Gap |
|-----------|-------|-----|
| cash_after | Partial (after click) | Pre-click: no `+N coins` KNOWN preview |
| cashflow_change | Implicit | No keeps/drains breakdown |
| future_obligation | No | Liabilities not itemized at collect |

**Verdict:** **IMPROVE** — pre-collect ESTIMATED `≈ +N coins from keep − drains` (FINANCIAL_FEEDBACK_VOCABULARY P1).

---

### FD-13 — Harbor shop (Capsules, carpet polish, plaza pass)

**File:** `CapsuleStudioOverlay.tsx` · `harborShop.ts`

**Decision helped:** Spend coins on tactical toy / expression vs save for deal.

| Shows | Certainty |
|-------|-----------|
| Price | **KNOWN** |
| Owned state | **KNOWN** |
| CF impact | **KNOWN 0** — must stay absent |

**What decision does this help?** Afford without mistaking polish for investment.

**Verdict:** **KEEP** cash-only · forbid Asset/Income signals on cosmetics.

---

### FD-14 — EarnSpend session wallet (Cove First Coins)

**File:** `EarnSpendModule.ts` · Cove minigame host

**Decision helped:** Earn before spend; can I afford craft buy?

| Dimension | Shown | Certainty |
|-----------|-------|-----------|
| cash_after (session) | **KNOWN** wallet | Separate from global pouch until quest bridges |
| insufficient spend | **KNOWN** reject | “Not enough money!” |

**Layer:** Minigame UI = **Layer 2** for session liquidity.

**Verdict:** **KEEP** — teaches liquidity before Take · bridge to ledger in copy after sort clear.

---

### FD-15 — Travel map island lock

**Decision helped:** Where can I sail? — access, not CF fork.

**Verdict:** **KEEP** lock hints · not a financial preview surface.

---

### FD-16 — Memory Plinth (modal)

**Decision helped:** What did I choose? What organ painting next? — **Layer 3** analysis.

**Verdict:** **KEEP** post-hoc · must not replace pre-commit preview.

---

### FD-17 — MasteryQuiz

**Not a financial commit** — literacy worksheet. No CF preview required.

**Verdict:** **KEEP** non-money chrome.

---

### FD-18 — Credit Score Scanner gate

**Decision helped:** When to run scanner — pacing, not money.

**Verdict:** **KEEP** separate from Ordeal Take preview.

---

## 6. Cross-cutting matrix — dimensions × spine Takes

| Dimension | Cove Take UI | Paycheck Take UI | Credit Take UI | Target (all spine Takes) |
|-----------|--------------|------------------|----------------|--------------------------|
| cash_after | — | — | — | Show when pouch moves |
| cashflow_change | **KNOWN** subline | **Missing** | **Missing** | KNOWN `/mo` when holding writes |
| liquidity_change | — | — | — | ESTIMATED band on deals |
| debt_change | via drain line | **Missing** | **Missing** | KNOWN Owes label |
| future_obligation | partial | **Missing** | **Missing** | KNOWN on liability paths |
| risk | EST. copy | EST. copy | **Missing** | EST. chip when weather couples |
| potential_upside | KNOWN save | **Missing** | **Missing** | KNOWN asset row |
| potential_downside | KNOWN spend | **Missing** | **Missing** | KNOWN liability row |
| opportunity_cost | EST. copy | EST. copy | KNOWN plaque | KNOWN other fork name |
| reversibility | KNOWN | KNOWN | KNOWN | Always state Take stick |

**Repository fact:** `TalkBattleScreen` only calls `coveTakeChoiceFootprintPreview()` — Paycheck/Credit holdings exist in `spineTakeFootprints.ts` but **no symmetric preview helper** is wired.

---

## 7. Layer assignment by surface

| Surface | Layer 1 (persistent) | Layer 2 (decision) | Layer 3 (on demand) |
|---------|---------------------|--------------------|---------------------|
| Harbor plaza | Cash, Leave, mute | Coach, Talk, deal when open, freedom chip | Plinth, shop modals, ledger expand |
| Shore | Cash (non-quiet), place, Leave | Talk, Take choices + footprint, quiet CTA | Structure parts |
| TalkBattle | — (fullscreen) | Choice rows, footprint, Soft Beat | — |
| Party board | Cash, CF hud | Deal/liability panels | Event log |
| Travel map | Map | Lock hint on hover | — |

---

## 8. Gaps vs target architecture

From [DECISION_PREVIEW_ARCHITECTURE.md](../design/DECISION_PREVIEW_ARCHITECTURE.md) — shipped vs spec:

| Priority | Gap | Surfaces |
|----------|-----|----------|
| **P0** | Unified spine Take preview (`preview_rows` + certainty) | FD-02, FD-03 |
| **P0** | `Instead of…` + UNKNOWN row on Cove | FD-01 |
| **P1** | Deal Accept/Wait full preview | FD-06 |
| **P1** | Pay Day breakdown (keeps vs drains) | FD-12 |
| **P1** | CF claim space panel | FD-08 |
| **P2** | Credit risk ESTIMATED + weather because | FD-03 |
| **P2** | Liquidity tight/ok bands on deals | FD-06, FD-07 |

**Prototype policy:** Spec + this audit only — implement via `preview_rows[]` authoring contract when approved.

---

## 9. Anti-patterns (instant fail)

| Anti-pattern | Why |
|--------------|-----|
| Spoil Piggy exact line as KNOWN | Unknowable — kills Harbor mystery |
| Freedom “2 Pay Days left” as KNOWN when streak can reset | Lie → use ESTIMATED |
| PROBABILISTIC % on jar vs treat | Casino anti-pillar |
| Wealth rank as decision signal | Currency inflation |
| Mastery quiz styled as coin reward | Fake financial feedback |
| Cosmetic shop showing +$/mo | Fake investment |
| Paycheck/Credit Takes with no `/mo` while sim writes holdings | UI lies by omission |
| Full holdings spreadsheet on Take screen | Layer 3 bleed |

---

## 10. Checklist — new financial decision UI

Before shipping any new commit surface:

- [ ] Named decision in one sentence (*what fork?*)  
- [ ] Each applicable dimension populated or explicitly **UNKNOWN**  
- [ ] Every row labeled KNOWN / ESTIMATED / PROBABILISTIC / UNKNOWN  
- [ ] Layer 2 only during commit; Layer 1 stays minimal  
- [ ] Sim matches all **KNOWN** claims (test against `voyagerLedger`)  
- [ ] Vocabulary: Holds / Owes / Risk / Instead of… ([FINANCIAL_FEEDBACK_VOCABULARY.md](../design/FINANCIAL_FEEDBACK_VOCABULARY.md))  
- [ ] ≤6 visible preview rows; CERTAIN/KNOWN first  
- [ ] Esc / Not yet / Pass available where deferral is valid  
- [ ] Mute + reduced-motion: certainty readable without color/SFX alone  

---

## 11. Facts · inferences · recommendations

### FACTS FOUND IN REPOSITORY

- Cove Take shows **KNOWN** monthly CF preview on choice rows via `coveTakeChoiceFootprintPreview` (`TalkBattleScreen.tsx`, `firstFinancialScenario.ts`).
- Paycheck and Credit Takes write **real ledger holdings** (`spineTakeFootprints.ts`) but lack Talk choice preview wiring.
- Deal panel shows cost, +$/mo, pouch (`IslandBoardView.tsx` lines 700–735).
- Liability panel shows −$/mo, buyout, three-way choice.
- `VoyagerLedgerHud` exposes aggregate KNOWN CF; expanded view shows income/expense/holdings.
- `TakeHushOverlay` repeats footprint **after** commit.
- `DECISION_PREVIEW_ARCHITECTURE.md` defines target preview rows and certainty — **not fully implemented** on spine beyond Cove.
- `UI_LAYER_AUDIT.md` already classifies HUD elements by decision test.

### DESIGN INFERENCES

- Players who get Cove `/mo` preview may **expect numeric parity** on Paycheck transfer — absence reads as bug or fake choice.
- Deal Pass is under-taught as **opportunity cost** — patience skill vs UI clarity.
- Layer 1 CF chip post–Cove is correct for medium horizon but **must not replace** Layer 2 at Takes.

### RECOMMENDATIONS

1. **Wire `spineTakeChoiceFootprintPreview`** for Paycheck + Credit keys — same UX as Cove.  
2. **Adopt certainty labels** on all Layer 2 previews (start with Takes + deals).  
3. **Pay Day collect** — show ESTIMATED settlement before click.  
4. **Demote wealth rank** from any financial decision path.  
5. **Do not expand** preview to digressions with CF=0 — keep narrative-only.

---

## 12. Related code map

| Concern | Path |
|---------|------|
| Talk commit UI | `src/islands/views/TalkBattleScreen.tsx` |
| Cove preview | `src/islands/firstFinancialScenario.ts` |
| Spine holdings | `src/islands/spineTakeFootprints.ts` |
| Post-commit cinema | `src/islands/views/TakeHushOverlay.tsx` |
| Board deals | `src/islands/views/IslandBoardView.tsx` |
| Ledger HUD | `src/islands/views/VoyagerLedgerHud.tsx` |
| Cash HUD | `src/islands/views/WealthHud.tsx` |
| Target spec | `docs/design/DECISION_PREVIEW_ARCHITECTURE.md` |

---

*Audit complete. Production code unchanged.*
