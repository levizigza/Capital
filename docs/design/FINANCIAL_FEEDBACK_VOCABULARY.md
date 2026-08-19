# Capital — Financial Action Feedback Vocabulary

**Status:** Design law for consistent money feedback  
**Companions:** `docs/ftue/FEEDBACK_AUDIT.md` (opening path) · `CAUSAL_TIME_SYSTEM.md` · `DECISION_AUDIT.md` · `CAPITAL_DESIGN_CONSTITUTION.md`  
**Rule:** Every financial action uses the chain below. **Never use color as the sole distinguishing signal** (a11y + mute-test).  
**Scope:** Audit of financial actions on shipped `main` + the vocabulary Capital should speak everywhere.

---

## 1. Feedback chain (required model)

For every financial action:

```
INPUT
  → IMMEDIATE RESPONSE      (control ack: press, highlight, disable)
  → VALUE CHANGE            (what number/holding/scar actually moved)
  → VISUAL SIGNAL           (shape · motion · glyph · typography — not color alone)
  → AUDIO SIGNAL            (SFX id or intentional silence + visual compensate)
  → FUTURE CONSEQUENCE      (SOON / LATER / LONG-TERM — see CAUSAL_TIME_SYSTEM)
  → EXPLANATION             (one kid sentence: Bag / Piggy / Pay Day cite / Plinth)
```

If any link is missing, the action fails the vocabulary (players cannot trust “what happened”).

---

## 2. Distinguishing vocabulary (10 money kinds)

Each kind must be recognizable by **≥2 non-color channels** among: **glyph**, **word**, **motion**, **shape/layout**, **audio motif**, **duration**.

| Kind | Word (UI) | Glyph | Motion / shape | Audio motif | Never alone |
|------|-----------|-------|----------------|-------------|-------------|
| **Cash** | “Coins” / pouch | `🪙` or filled circle stack | Instant count-up/down on WealthHud; short pop | Soft coin tick (`organ_coin` family) | Hue shift only |
| **Income** | “In” / “keeps” | Up-chevron + `/mo` | CF line pulses **up** once; keep-column emphasis | Brighter short rising beep | Green alone |
| **Expense** | “Out” / “drains” | Down-chevron + `/mo` | CF line pulses **down**; drain-column emphasis | Lower short falling beep | Red alone |
| **Asset** | “Holds” (Coin organ) | Jar / booth silhouette | Holding row slides in with **solid** underline | `organ_coin` | Green badge alone |
| **Liability** | “Owes” | Tab / weight mark | Holding row slides in with **dashed** underline | Darker thud (distinct from coin) | Red badge alone |
| **Liquidity** | “On hand” | Open palm / pouch outline | Pouch ring breathes when buffer low (size, not hue) | Optional dry click when buffer warning | Blue alone |
| **Risk** | “Risk” / Spiral *withstands* | Spiral mark | Fog/edge vignette **plus** text chip “Risk” | `organ_spiral` | Purple/fog alone |
| **Future obligation** | “Still owes” | Calendar-weight / chain mark | Obligation chip persists until cleared; dashed CF | Soft repeating reminder only on Pay Day | Orange alone |
| **Potential return** | “Could hold” | Sprout / + foresight | Preview ghost row (`+N/mo if…`) before commit | Quiet preview chime (softer than commit) | Gold alone |
| **Opportunity cost** | “Instead of…” | Fork / split path | Other option fades with strikethrough label | None or hush dip (absence is signal) | Grey alone |

### Organ alignment (mural law)

| Kind | Primary organ verb |
|------|-------------------|
| Cash / Asset / Potential return | Coin *holds* |
| Expense / Future obligation | Clock *shelters* (timing of drains) + Memory *keeps* the tab |
| Risk | Spiral *withstands* |
| Opportunity cost | Memory *keeps* the road not taken (plaque / “instead of”) |
| Liquidity | Harbor pouch — not a fourth organ; always worded “on hand” |

### Mute / reduce-motion

- Mute: visual + word + glyph must still complete the chain (`cinemaFlashAmp` / juice damp already exist).  
- Reduced motion: replace pulses with **static** shape change (underline solid↔dashed, chevron, strikethrough) + text.

---

## 3. Shared signal tokens (implementation-facing names)

Use these ids in future UI/SFX work so Capital stays consistent (do not invent parallel words).

| Token | Means |
|-------|--------|
| `sig.cash.delta` | Pouch integer change |
| `sig.income.mo` | Positive monthly CF facet |
| `sig.expense.mo` | Negative monthly CF facet |
| `sig.asset.add` | New asset holding |
| `sig.liability.add` | New liability holding |
| `sig.liquidity.warn` | Pouch below buffer |
| `sig.risk.mark` | Risk/haste scar or storm band |
| `sig.obligation.tick` | Pay Day still paying a drain |
| `sig.return.preview` | Pre-commit +N/mo ghost |
| `sig.opp_cost.mark` | Fork “instead of” |

Audio map (extend `capitalSfx` only when prototyping — **spec now**):

| Token | Preferred SFX | Fallback if missing |
|-------|---------------|---------------------|
| cash delta + | `organ_coin` | WealthHud number motion |
| cash delta − | lower tick / talk_confirm variant | Number motion + “spent” word |
| asset add | `organ_coin` | Jar glyph + “Holds” |
| liability add | distinct thud (TBD) | Dashed row + “Owes” |
| risk | `organ_spiral` | Spiral glyph + “Risk” chip |
| take commit | `take_mark` + `scar_chime` | Hush captions |
| harbor remember | `harbor_felt` / `plinth_hum` | Spectacle captions |
| income Pay Day | rising motif + `organ_coin` | “Pay Day · +N” word |

---

## 4. Action audit

Legend for **Gap:** missing or weak link on shipped `main` (from code + prior audits).

### A. Pouch & shop

#### A1 — Earn coins (minigame clear / shore collect / board lucky)

| Link | Today |
|------|--------|
| INPUT | Clear / collect / land |
| IMMEDIATE RESPONSE | Score UI / toast |
| VALUE CHANGE | `totalCoins` ↑ |
| VISUAL SIGNAL | WealthHud; toast (often) |
| AUDIO SIGNAL | Often `organ_coin` / juice reward |
| FUTURE CONSEQUENCE | Liquidity for deals/shop |
| EXPLANATION | Weak — rarely “on hand grew because…” |

**Kinds:** Cash · Liquidity · Potential return (indirect)  
**Gap:** Explanation; distinguish earn vs Pay Day income  

#### A2 — Spend pouch (capsule, polish, pet, plaza pass)

| Link | Today |
|------|--------|
| INPUT | Buy confirm |
| IMMEDIATE RESPONSE | Modal close / owned state |
| VALUE CHANGE | Coins ↓; item/look/pass |
| VISUAL SIGNAL | Shop owned; WealthHud |
| AUDIO SIGNAL | Inconsistent |
| FUTURE CONSEQUENCE | Board toys / cosmetic; **opp cost vs deals** |
| EXPLANATION | Rarely names opportunity cost |

**Kinds:** Cash (−) · Opportunity cost · (not Asset CF)  
**Gap:** `sig.opp_cost.mark` vs deal; polish must not read as income  

#### A3 — Accept Harbor deal (asset)

| Link | Today |
|------|--------|
| INPUT | Buy deal / Pass |
| IMMEDIATE RESPONSE | Board UI |
| VALUE CHANGE | Coins ↓; holding asset +N/mo |
| VISUAL SIGNAL | Ledger when shown |
| AUDIO SIGNAL | Weak / inconsistent |
| FUTURE CONSEQUENCE | Every Pay Day larger; Freedom closer |
| EXPLANATION | Event log text; Bag rarely cites |

**Kinds:** Cash (−) · Asset · Potential return → Income · Opportunity cost (Pass)  
**Gap:** Preview ghost return; Pass as Wait vocabulary; Pay Day cite holding label  

#### A4 — Forced liability (Debt Trap)

| Link | Today |
|------|--------|
| INPUT | Land on space (no choice) |
| IMMEDIATE RESPONSE | Auto resolve |
| VALUE CHANGE | Liability holding |
| VISUAL SIGNAL | Minimal |
| AUDIO SIGNAL | Weak |
| FUTURE CONSEQUENCE | CF drains each Pay Day |
| EXPLANATION | Easy to miss as “Owes” |

**Kinds:** Liability · Expense · Future obligation · Risk  
**Gap:** Full vocabulary; not a decision but must still explain  

#### A5 — Ritual / board Pay Day

| Link | Today |
|------|--------|
| INPUT | Collect Pay Day |
| IMMEDIATE RESPONSE | Button disable |
| VALUE CHANGE | Pouch += CF; streak tick |
| VISUAL SIGNAL | WealthHud; Freedom chip sometimes |
| AUDIO SIGNAL | Incomplete standard |
| FUTURE CONSEQUENCE | Freedom Seal; weather via CF |
| EXPLANATION | Partial (`freedomPlazaChip`) |

**Kinds:** Cash (+) as settlement of **Income − Expense** · Liquidity · Future obligation ticks  
**Gap:** Breakdown “keeps vs drains”; cite assets/liabilities by kid label  

#### A6 — Freedom Seal earned

| Link | Today |
|------|--------|
| INPUT | 3rd strong Pay Day |
| IMMEDIATE RESPONSE | Flag / inventory |
| VALUE CHANGE | `harborEscaped`; seal item |
| VISUAL SIGNAL | Freedom chip / Pavilion |
| AUDIO SIGNAL | Cheer-ish possible |
| FUTURE CONSEQUENCE | Carpet floor; Credit gate (with mastery) |
| EXPLANATION | Homecoming message |

**Kinds:** Long-term outcome of Income discipline (not a new currency fantasy)  
**Gap:** Keep seal ≠ cash; word as escape not loot  

---

### B. Spine Takes & memory

#### B1 — Cove Take save (jar)

| Link | Today |
|------|--------|
| INPUT | Talk choice |
| IMMEDIATE RESPONSE | Graph advance; hush |
| VALUE CHANGE | Irreversible + scar + item + **+$5/mo asset** |
| VISUAL SIGNAL | Take hush · later spectacle/Plinth |
| AUDIO SIGNAL | `scar_chime` · `take_mark` · organ · `harbor_felt` |
| FUTURE CONSEQUENCE | CF/weather/Freedom; plaque forever |
| EXPLANATION | Piggy / cold kid sentence / Plinth |

**Kinds:** Asset · Income · Opportunity cost · (Liquidity unchanged NOW)  
**Gap:** Explicit `/mo` preview at choose time (UNINFORMED risk)  

#### B2 — Cove Take spend (treat)

| Link | Today |
|------|--------|
| INPUT | Talk choice |
| IMMEDIATE RESPONSE | Hush path |
| VALUE CHANGE | Liability **−$5/mo** + spender scar |
| VISUAL SIGNAL | Same cinema family |
| AUDIO SIGNAL | Same family (must not sound like “reward win” only) |
| FUTURE CONSEQUENCE | Thinner Pay Days; weather |
| EXPLANATION | Piggy names plaque |

**Kinds:** Liability · Expense · Future obligation · Opportunity cost · Risk (indirect)  
**Gap:** Liability visual (dashed/owes) distinct from saver path at commit  

#### B3 — Paycheck Take (protect vs glitter)

| Link | Today |
|------|--------|
| INPUT | Talk choice |
| VALUE CHANGE | Scar + item; **CF Δ 0** |
| VISUAL/AUDIO | Cinema family |
| FUTURE | Memory only |
| EXPLANATION | Plaque |

**Kinds:** Opportunity cost (identity) — **not** Asset/Income today  
**Gap:** Either add real CF/obligation or stop presenting as money-engine fork (Decision Audit)  

#### B4 — Credit Take (wait vs borrow)

| Link | Today |
|------|--------|
| INPUT | Talk choice after Scanner |
| VALUE CHANGE | Scar; CF Δ 0; haste may worsen weather |
| VISUAL/AUDIO | Spiral organ; spectacle |
| FUTURE | Weather / plaque |
| EXPLANATION | `feedbackLoopLine` when haste |

**Kinds:** Risk · Opportunity cost · (obligation mostly narrative)  
**Gap:** Risk chip + spiral glyph at commit; weather because-line  

#### B5 — Soft Beat peek

| Link | Today |
|------|--------|
| INPUT | Lookout pad / dismiss |
| VALUE CHANGE | Arm only |
| VISUAL | Overlay |
| AUDIO | `soft_beat` |
| FUTURE | Suffix on next Take/scar Talk |
| EXPLANATION | Whisper |

**Kinds:** Potential return (information) · Opportunity cost (time)  
**Gap:** Do not SFX like a Take commit  

#### B6 — Digression scar forks (shell, tip, collector, era)

| Link | Today |
|------|--------|
| VALUE CHANGE | Scar ± stance; CF 0 |
| VISUAL/AUDIO | Talk confirm; later Plinth if shown |
| FUTURE | Shelf / myth |

**Kinds:** Opportunity cost (thin)  
**Gap:** Do not use asset/income signals  

---

### C. Structures & board extras

#### C1 — Enter Money Structure / Soft Beat site

| Link | Non-financial enter + organ SFX |
| **Kinds:** Framing only — coin/clock/spiral place  
| **Gap:** Don’t show cash delta on enter |

#### C2 — Board star auto-buy / raid / collector hit

| Link | Forced pouch moves |
| **Kinds:** Cash · Risk · Expense-like hits  
| **Gap:** Explain as hazard not “Purchase” |

#### C3 — Mastery quiz clear

| Link | `masteryClears` ↑ |
| **Kinds:** **Not** cash/income — progress gate  
| **Gap:** Must use non-money chrome (check mark / “cleared”) so it never reads as Pay Day |

---

## 5. Consistency matrix (kind × signal)

| Kind | Must show word | Must show glyph/shape | Motion | Audio |
|------|----------------|-----------------------|--------|-------|
| Cash | Coins / on hand | Stack or pouch | Count | Coin tick |
| Income | In / keeps · `/mo` | Up-chevron | Up pulse or static ↑ | Rising |
| Expense | Out / drains · `/mo` | Down-chevron | Down pulse or static ↓ | Falling |
| Asset | Holds | Solid underline row | Slide-in | Coin organ |
| Liability | Owes | Dashed underline row | Slide-in | Thud |
| Liquidity | On hand | Pouch outline | Breath when low | Optional |
| Risk | Risk | Spiral | Fog **+** chip text | Spiral organ |
| Future obligation | Still owes | Chain/weight | Persists on Pay Day | Pay Day reminder |
| Potential return | Could hold | Ghost +N/mo | Preview only | Soft preview |
| Opportunity cost | Instead of… | Fork / strikethrough | Fade other option | Hush dip or silence |

---

## 6. Screen-by-screen vocabulary rules

| Surface | Allowed kinds | Forbidden |
|---------|---------------|-----------|
| WealthHud | Cash, Liquidity warn | CF pretending to be cash |
| VoyagerLedgerHud | Income, Expense, Asset, Liability, Obligation ticks | XP, quiz clears |
| Deal / Opportunity panel | Cash cost, Potential return, Opp cost (Pass/Wait), Asset/Liability | Mastery language |
| Take choices | Asset/Liability/Risk/Opp cost as fits organ | “You win” juice on treat path |
| Pay Day | Cash settlement + Income/Expense breakdown | Shop polish |
| Plinth / Piggy | Opp cost + Memory because-lines | Ledger spreadsheets |
| Shop | Cash, Opp cost | “Investment” for cosmetics |
| Mastery quiz | None of the 10 (use “Cleared”) | Coin SFX as success |

---

## 7. Priority gaps (no prototype in this doc)

1. **Pay Day breakdown** — keeps vs drains with kid labels (Income/Expense/Obligation).  
2. **Deal preview** — ghost Potential return + Pass as opportunity cost.  
3. **Cove commit** — `/mo` Holds vs Owes distinguishable without hue alone.  
4. **Liability / Debt Trap** — full Owes chain.  
5. **Risk Take** — spiral glyph + Risk word + because weather.  
6. **Shop vs deal** — cosmetics never use Asset/Income signals.  
7. **Unified SFX map** — liability thud + spend tick distinct from earn.

---

## 8. Success tests

- Mute + reduced motion: player still sorts Holds vs Owes vs Coins.  
- Cold retell after deal + Pay Day: names holding, not “I got points.”  
- Treat Take never uses identical “reward win” juice as jar without Owes framing.  
- Color-blind simulation: kinds still separable via word/glyph/shape.

---

## 9. Relation to prior docs

| Doc | Role |
|-----|------|
| `ftue/FEEDBACK_AUDIT.md` | Opening-path instance of this chain |
| `CAUSAL_TIME_SYSTEM.md` | FUTURE CONSEQUENCE + EXPLANATION (BECAUSE) |
| `DECISION_AUDIT.md` | Which actions are real decisions |
| `STRONGEST_RECURRING_LOOP.md` | Opportunity panel must speak this vocabulary |

**Amendment rule:** New financial actions must add a row to §4 and map kinds in §2 before ship.
