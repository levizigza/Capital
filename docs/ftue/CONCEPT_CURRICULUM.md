# Capital Concept Curriculum

**Date:** 2026-08-17  
**Rule:** Only concepts with **player-facing** proof in shipped gameplay/content.  
**Sources:** Cove / Paycheck / Credit island JSON, `worldMemory.ts`, Soft Beat kid lines, Voyager Ledger HUD, harbor weather, digression scars, mastery/lock copy.  
**Companion graph:** `CONCEPT_DEPENDENCIES.mmd`  
**Basis:** FTUE audit + core loop docs. **Docs only — no implementation.**

---

## Example-list audit (do not invent)

| Example term | In Capital? | How (if present) |
|--------------|-------------|------------------|
| cash | Embodied only | Coins / pouch / Cashflow — not a titled “cash” lesson |
| income | **Yes** | HUD Income; Paycheck dialogue |
| expenses | **Yes** | HUD Expenses; budget cards |
| liquidity | **No** | No player-facing string |
| obligations | **Partial** | “Bank of Obligation” (Credit digression metaphor) |
| risk | **Partial** | Stance / haste scars / weather — not early named lesson |
| debt | **Yes** | Credit Kingdom |
| interest | **Yes** | Spiral organ / Soft Beat / dialogue |
| assets | **Yes** | Ledger “Asset:…” deals / mastery |
| liabilities | **Yes** | Ledger “Liability:…” |
| return | **Late / partial** | Mastery compound language; era shores |
| opportunity cost | **Embodied, not named** | Foreshadow rows (quieter/louder); phrase in metadata/docs only |
| time horizon | **Era only** | financial-assets dialogue — not spine |
| diversification | **Era only** | Diversify games / era shores — not spine |
| credit | **Yes** | Credit Kingdom + Spiral lock |
| investment | **Partial** | Mastery / Interest Jar / era — light on spine |
| economic events | **Embodied** | News shocks, windfalls, weather — not that phrase |

---

## Concept catalog

Fields match the brief. `first_useful` = first moment the concept earns its keep in play.

### Foundation

#### `money_is_alive`
| Field | |
|-------|--|
| **player-facing meaning** | Money has temperaments; the world reacts like a place, not a spreadsheet. |
| **prerequisites** | None |
| **first_useful** | Harbor / Ashore fantasy — frames Takes as footprints |
| **demonstrate** | Organ toys poke; Talk among living money; scar gossip |
| **common misconception** | “Cute mascots = no real stakes” |
| **safe practice** | Fantasy poke / Piggy welcome (no irreversible cost) |
| **transfer** | Any Take → Harbor plaque |
| **advanced** | Soft Beat arms Talk; weather from haste scars |

#### `walk_talk`
| Field | |
|-------|--|
| **player-facing meaning** | Explore by walking; Talk is opt-in when near (E). |
| **prerequisites** | None |
| **first_useful** | Ashore Walk/Talk or Harbor first meet |
| **demonstrate** | Rings; near+E; Piggy Talk |
| **common misconception** | “E talks from anywhere” |
| **safe practice** | Ashore chambers |
| **transfer** | All shores / plaza |
| **advanced** | Guide arrows off; free roam digressions |

#### `carpet_voyage`
| Field | |
|-------|--|
| **player-facing meaning** | Money Carpet carries you between Harbor and paintings. |
| **prerequisites** | `walk_talk` |
| **first_useful** | First voyage to Cove |
| **demonstrate** | Board Carpet; map chip; return hush CTA |
| **common misconception** | Ashore practice painting = already visited Cove |
| **safe practice** | Dock board Cove painting (Ashore) |
| **transfer** | Paycheck / Credit / side shores |
| **advanced** | Carpet tiers after Freedom Seal |

---

### Coin organ (Hold)

#### `coin_denominations`
| Field | |
|-------|--|
| **player-facing meaning** | Penny/nickel/dime/quarter values. |
| **prerequisites** | `walk_talk` |
| **first_useful** | Cove · Captain Penny / Coin Sort |
| **demonstrate** | Coin Sort minigame |
| **common misconception** | Values are arbitrary game tokens |
| **safe practice** | Coin Sort with retry dignity |
| **transfer** | Pasaran / change-making mastery |
| **advanced** | Exact change under time pressure |

#### `exact_change`
| Field | |
|-------|--|
| **player-facing meaning** | Paying exact change avoids overpaying. |
| **prerequisites** | `coin_denominations` |
| **first_useful** | Cove Coin Sort / market |
| **demonstrate** | Make exact change challenges |
| **common misconception** | Overpay is fine / free |
| **safe practice** | Slow Coin Sort |
| **transfer** | Harbor market overlays |
| **advanced** | Mastery quiz items |

#### `earn_then_decide`
| Field | |
|-------|--|
| **player-facing meaning** | Earn fair coins before a money Take; earning ≠ the Take. |
| **prerequisites** | `carpet_voyage`, ideally `exact_change` or earn minigame |
| **first_useful** | Cove `q_cc_first_coins` |
| **demonstrate** | Penny pouch → Coin Sort → only then Kira |
| **common misconception** | “The Take is how I earn” |
| **safe practice** | First Coins quest |
| **transfer** | Paycheck stamp / Harbor deals |
| **advanced** | Life Fork career paths |

#### `needs_vs_wants`
| Field | |
|-------|--|
| **player-facing meaning** | Needs before pretty; wants aren’t evil but cost a story. |
| **prerequisites** | `earn_then_decide` (soft) |
| **first_useful** | Cove Shelly digression / vault puzzles |
| **demonstrate** | Shell Want fork; needs-vs-wants minigame |
| **common misconception** | Wants are “wrong” / needs are only rent |
| **safe practice** | Digression (no chapter-quiet scar) |
| **transfer** | Paycheck budget buckets |
| **advanced** | Tip plan vs rush |

#### `save_vs_spend`
| Field | |
|-------|--|
| **player-facing meaning** | Jar before treat vs treat before jar — two money stances. |
| **prerequisites** | `earn_then_decide` |
| **first_useful** | Cove Keeper Kira Take |
| **demonstrate** | Irreversible choice rows with Harbor foreshadow |
| **common misconception** | Both grant jar ⇒ outcomes identical |
| **safe practice** | None truly “safe” — Take is the practice; foreshadow is the prep |
| **transfer** | Paycheck umbrella vs glitter; Credit wait vs borrow |
| **advanced** | Stance greeting / plaza tone |

#### `irreversible_take`
| Field | |
|-------|--|
| **player-facing meaning** | A Take sticks forever; Harbor already listens. |
| **prerequisites** | `save_vs_spend` framing; `money_is_alive` |
| **first_useful** | First Cove Take |
| **demonstrate** | `setIrreversible` + scar + hush |
| **common misconception** | “I can undo at Harbor” |
| **safe practice** | Alma foreshadow before Kira |
| **transfer** | Every spine Take |
| **advanced** | Soft Beat arm burns on Take stakes |

#### `coin_hold`
| Field | |
|-------|--|
| **player-facing meaning** | “The Coin holds — save a little; the jar still waits.” |
| **prerequisites** | `irreversible_take` |
| **first_useful** | Immediate post-Take / Soft Beat Lid / Plinth shelf |
| **demonstrate** | Kid sentence; plaque “Coin holds · …” |
| **common misconception** | Hold = never spend again |
| **safe practice** | Soft Beat lookout (optional, after Take preferred) |
| **transfer** | Clock shelters / Spiral withstands as sister organs |
| **advanced** | Soft Beat → Talk chemistry |

#### `harbor_scar_memory`
| Field | |
|-------|--|
| **player-facing meaning** | Harbor remembers your Take on the Plinth / gossip / Piggy. |
| **prerequisites** | `irreversible_take` |
| **first_useful** | First carpet home + spectacle |
| **demonstrate** | Scar spectacle; plaque; homecoming |
| **common misconception** | Cutscene unrelated to choice |
| **safe practice** | First loop close (required) |
| **transfer** | Day-2 echo; digression myth shelf |
| **advanced** | Multiple plaques; Witness stamp |

**Embodied `opportunity_cost` (no concept_id as named term):** foreshadow quieter/louder Harbor futures. Treat as property of `save_vs_spend` / Takes, not a separate taught word.

---

### Harbor ledger (after first footprint)

#### `income`
| Field | |
|-------|--|
| **player-facing meaning** | Money coming in (+/mo). |
| **prerequisites** | Prefer `harbor_scar_memory` so ledger isn’t the first “interest” of the game |
| **first_useful** | Harbor HUD / Paycheck “first paycheck” |
| **demonstrate** | Income line; Pat dialogue |
| **common misconception** | Income = coins in pouch only |
| **safe practice** | Read HUD after first return |
| **transfer** | Budget Split; assets that add income |
| **advanced** | Human capital / Life Fork |

#### `expenses`
| Field | |
|-------|--|
| **player-facing meaning** | Money going out (−/mo). |
| **prerequisites** | `income` (contrast) |
| **first_useful** | HUD / Paycheck expense cards |
| **demonstrate** | Expenses line; bucket drag |
| **common misconception** | Only “bad” spending counts |
| **safe practice** | Label rent/food vs entertainment |
| **transfer** | Liabilities as recurring expenses |
| **advanced** | Pay Day shortfall messaging |

#### `cashflow`
| Field | |
|-------|--|
| **player-facing meaning** | Income − expenses; monthly breath of Harbor. |
| **prerequisites** | `income`, `expenses` (or lived paycheck/budget) |
| **first_useful** | HUD Cashflow; weather coach; Freedom chase |
| **demonstrate** | `+/mo` changes; boom/tight/storm sky |
| **common misconception** | Cashflow = one-time coin pickup |
| **safe practice** | Watch weather after a deal |
| **transfer** | Freedom Seal; shop prices |
| **advanced** | Haste scar + low cashflow → storm loop |

#### `asset`
| Field | |
|-------|--|
| **player-facing meaning** | Something that feeds cashflow (+$/mo). |
| **prerequisites** | `cashflow` |
| **first_useful** | Harbor deal toast “Asset: …” |
| **demonstrate** | Buy income asset; see Income rise |
| **common misconception** | Any purchase is an asset |
| **safe practice** | Small Shell Booth–style deal after footprint |
| **transfer** | Interest Jar; mastery income-asset items |
| **advanced** | Escape paycheck-to-paycheck math |

#### `liability`
| Field | |
|-------|--|
| **player-facing meaning** | Something that drains cashflow (−$/mo). |
| **prerequisites** | `cashflow` |
| **first_useful** | Harbor “Liability: …” deals / mastery traps |
| **demonstrate** | Accept snack tab; Expenses rise |
| **common misconception** | Loans are free money |
| **safe practice** | Mastery quiz identifying traps |
| **transfer** | Credit debt load |
| **advanced** | Stacking liabilities vs Freedom Seal |

#### `pay_day`
| Field | |
|-------|--|
| **player-facing meaning** | Monthly cashflow credited (ritual / board). |
| **prerequisites** | `cashflow` |
| **first_useful** | Daily Ritual Pay Day after Cove Change |
| **demonstrate** | Collect Pay Day; streak toward Seal |
| **common misconception** | Pay Day is a quiz reward |
| **safe practice** | One ritual after Change |
| **transfer** | Freedom Seal N Pay Days |
| **advanced** | Shortfall when expenses > income |

#### `harbor_weather`
| Field | |
|-------|--|
| **player-facing meaning** | Cashflow (and haste scars) paint Harbor sky and soft prices. |
| **prerequisites** | `cashflow`; haste path also needs `patience_vs_haste` |
| **first_useful** | Weather coach on tight/storm; feedback loop line |
| **demonstrate** | Sky + `weatherCoachLine` / `feedbackLoopLine` |
| **common misconception** | Weather is random cosmetics |
| **safe practice** | Read coach on first storm |
| **transfer** | Credit haste → fog |
| **advanced** | Price multiplier + Soft Beat literacy |

---

### Clock organ (Shelter)

#### `paycheck_income`
| Field | |
|-------|--|
| **player-facing meaning** | Timed earning — a paycheck lands and must be placed. |
| **prerequisites** | `harbor_scar_memory`, `carpet_voyage` |
| **first_useful** | Paycheck Peninsula · Pat |
| **demonstrate** | First paycheck dialogue; Clock suit |
| **common misconception** | Paycheck = Cove pouch again |
| **safe practice** | Arrive Paycheck after Cove Change |
| **transfer** | Budget buckets |
| **advanced** | Inbox Storm time pressure |

#### `budget_buckets`
| Field | |
|-------|--|
| **player-facing meaning** | Split payday into Needs · Wants · Savings. |
| **prerequisites** | `paycheck_income`; `needs_vs_wants` helps |
| **first_useful** | Priya / Budget Split / Bucket Press |
| **demonstrate** | Drag expenses into buckets |
| **common misconception** | Savings is leftover scraps only |
| **safe practice** | Budget Splitter minigame |
| **transfer** | Tip plan digression; emergency fund |
| **advanced** | Strategist 50/30/20 line (profile) |

#### `emergency_fund`
| Field | |
|-------|--|
| **player-facing meaning** | Rainy-day money you don’t touch unless something unexpected hits. |
| **prerequisites** | `budget_buckets` |
| **first_useful** | Carlos Rainy Day → Vee Take framing |
| **demonstrate** | Umbrella loft Soft Beat; shelter copy |
| **common misconception** | Emergency fund = investing |
| **safe practice** | Talk Carlos before Take |
| **transfer** | Credit Emergency Ledger events |
| **advanced** | News shocks / windfalls on Cove pads |

#### `protect_vs_spend`
| Field | |
|-------|--|
| **player-facing meaning** | Umbrella before glitter vs glitter ate the umbrella — Clock shelters. |
| **prerequisites** | `emergency_fund`, `irreversible_take` pattern |
| **first_useful** | Paycheck irreversible Take |
| **demonstrate** | Scar + Clock kid sentence |
| **common misconception** | Same as Cove jar/treat with new skin |
| **safe practice** | Foreshadow rows before commit |
| **transfer** | Credit wait vs borrow |
| **advanced** | Weather + plaza gossip |

#### `plan_vs_impulse`
| Field | |
|-------|--|
| **player-facing meaning** | Plan buckets before tipping vs tip-first haste. |
| **prerequisites** | `budget_buckets` |
| **first_useful** | Paycheck tip digression |
| **demonstrate** | `pp_tip_plan` / `pp_tip_rush` scars |
| **common misconception** | Digression doesn’t matter (Harbor still names it) |
| **safe practice** | Digression after buckets taught |
| **transfer** | Spiral patience vs haste |
| **advanced** | Myth shelf pairs / Family digression_pair |

---

### Gate

#### `freedom_seal`
| Field | |
|-------|--|
| **player-facing meaning** | Escaped paycheck-to-paycheck; opens Pavilion / carpet tier / path to Spiral. |
| **prerequisites** | `cashflow`, `pay_day` (sustained), preferably assets literacy |
| **first_useful** | When Seal unlocks; Bag “Freedom Seal first — then Spiral” |
| **demonstrate** | Seal toast; lock hints clear for Credit (with mastery) |
| **common misconception** | Seal = finished the game |
| **safe practice** | Chase with Bag horizons visible |
| **transfer** | Credit unlock conditions |
| **advanced** | Seal + mastery N/3 together |

#### `mastery_clear`
| Field | |
|-------|--|
| **player-facing meaning** | Quiz/mastery clears prove literacy; Spiral needs N/3. |
| **prerequisites** | Lived organ play (not glossary-first) |
| **first_useful** | After kinesthetic clears; Bag mastery counter |
| **demonstrate** | Mastery clear feedback; lock “Spiral locked — mastery N/3” |
| **common misconception** | Mastery replaces Takes |
| **safe practice** | One mastery after Cove/Paycheck play |
| **transfer** | Credit door |
| **advanced** | Fail → organ-informed retry |

---

### Spiral organ (Withstand)

#### `debt`
| Field | |
|-------|--|
| **player-facing meaning** | Borrowed money that weighs; Debt Canyon / Collector presence. |
| **prerequisites** | `freedom_seal` (gate), `cashflow`, lived Takes |
| **first_useful** | Credit Kingdom entry |
| **demonstrate** | Debt Loadout; canyon framing |
| **common misconception** | All debt is evil / all debt is free |
| **safe practice** | Listen-only Collector digression before Ordeal |
| **transfer** | Liability stacking; APR price |
| **advanced** | Utilization + late fees |

#### `interest_compounds`
| Field | |
|-------|--|
| **player-facing meaning** | Interest doesn’t yell — it compounds; haste feeds it. |
| **prerequisites** | `debt` (or borrow framing) |
| **first_useful** | Cleo/Rex/Soft Beat battlement |
| **demonstrate** | Kid sentence; Interest Keep |
| **common misconception** | Interest is a one-time fee |
| **safe practice** | Soft Beat Score Battlement after Credit unlock |
| **transfer** | APR as true price |
| **advanced** | Haste scar → Harbor storm |

#### `patience_vs_haste`
| Field | |
|-------|--|
| **player-facing meaning** | Waiting vs rushing leaves different Harbor weather. |
| **prerequisites** | `harbor_scar_memory`; reinforced by digressions |
| **first_useful** | Early digressions; crystallizes on Credit |
| **demonstrate** | Tip/shell/era forks; Credit ordeal |
| **common misconception** | Haste always wins short-term with no cost |
| **safe practice** | Cove shell patience digression |
| **transfer** | Wait vs borrow Ordeal |
| **advanced** | `feedbackLoopLine` weather |

#### `on_time_history`
| Field | |
|-------|--|
| **player-facing meaning** | On-time payment history is a strong credit signal; patience is a signal. |
| **prerequisites** | `interest_compounds` |
| **first_useful** | Credit practice / Inbox / Ordeal prep |
| **demonstrate** | Event copy; Cleo coaching |
| **common misconception** | Score is random / combat stat |
| **safe practice** | Credit Inbox on-time choices |
| **transfer** | Score rebuild quests |
| **advanced** | Utilization interaction |

#### `apr`
| Field | |
|-------|--|
| **player-facing meaning** | APR is the true price of borrowed money. |
| **prerequisites** | `interest_compounds` |
| **first_useful** | Credit Inbox “APR Whisper” |
| **demonstrate** | Dispatch letters; choice outcomes |
| **common misconception** | Sticker rate = full cost |
| **safe practice** | Read APR event before Ordeal |
| **transfer** | Secured vs unsecured doors |
| **advanced** | Stack with late fees |

#### `credit_utilization`
| Field | |
|-------|--|
| **player-facing meaning** | How much of your limit you use — spikes hurt. |
| **prerequisites** | `on_time_history` / score framing |
| **first_useful** | Rex / Utilization Spikes event |
| **demonstrate** | Debt Anvil / inbox event |
| **common misconception** | Maxing limit is fine if you pay later |
| **safe practice** | Event choice at low stakes |
| **transfer** | Ordeal haste path |
| **advanced** | Combined with APR |

#### `wait_vs_borrow`
| Field | |
|-------|--|
| **player-facing meaning** | Wait the spiral vs haste-fed borrow — Spiral withstands. |
| **prerequisites** | `interest_compounds`, `patience_vs_haste`, `freedom_seal`, `mastery_clear` |
| **first_useful** | Credit Ordeal Take |
| **demonstrate** | Irreversible wait/haste plaques |
| **common misconception** | Same as tip digression |
| **safe practice** | Practice inbox → then Ordeal |
| **transfer** | Harbor weather feedback |
| **advanced** | Day-2 canyon echo |

#### `bank_of_obligation`
| Field | |
|-------|--|
| **player-facing meaning** | Obligation pitch — listen vs lean into haste. |
| **prerequisites** | `debt` framing |
| **first_useful** | Credit digression |
| **demonstrate** | Collector listen/lean scars |
| **common misconception** | Listening = already borrowed |
| **safe practice** | Listen-only path |
| **transfer** | Ordeal foreshadow |
| **advanced** | Myth shelf |

---

### Era / late (not spine prerequisites)

#### `diversification` · `time_horizon` · `investment_return`
Present on **era side shores** / some mastery lines after Cove Change free roam.  
**Curriculum rule:** optional after `cashflow` + at least one Clock Take; never block spine.

---

## Premature introductions (current ship)

| Concept shown early | Missing prerequisite | Where it happens | Harm |
|---------------------|----------------------|------------------|------|
| Clock + Spiral organ names / mural thesis | `coin_hold`, `harbor_scar_memory` | Ashore Fantasy / Ready | Vocabulary without lived Hold |
| Signature-loop lecture | Lived Take→Harbor | Ashore Ready chamber | Spoils discovery; reading ≠ proof |
| Compound / snowball side toys | Closed `coin_hold` | Cove side minigames | “Growth” before “hold” |
| Asset / Liability deal cards | Felt `cashflow` | Harbor deals can appear before interpretation settles | Ledger as shop menu |
| Freedom Seal chase chrome | Stable `cashflow` literacy | Early Bag / pavilion hints | Goal without equation |
| APR / utilization events | Felt `interest_compounds` | If Inbox opened as grind before Soft Beat/Cleo | Jargon pile |
| Diversification era shores | `cashflow` + shelter Take | Available after Paycheck Change unlock | OK if optional; bad if tipped as “next main” |
| Soft Beat before first Take | `irreversible_take` | Optional Jar climb on Cove | Toy without footprint thesis |

---

## Proposed ordering (conceptual dependency — not menu order)

### Phase 0 — Enablers (not the interesting loop)
1. `money_is_alive` (light)  
2. `walk_talk`  
3. `carpet_voyage`  

### Phase 1 — Smallest core loop (Coin Hold)
4. `coin_denominations` → `exact_change`  
5. `earn_then_decide`  
6. `needs_vs_wants` *(optional digression; may wait until after first Take)*  
7. `save_vs_spend` → `irreversible_take` → `coin_hold`  
8. `harbor_scar_memory` **← loop interest proof**  

### Phase 2 — Harbor ledger literacy (only after Phase 1)
9. `income` → `expenses` → `cashflow`  
10. `harbor_weather` (cashflow-driven)  
11. `asset` / `liability` (contrast pair)  
12. `pay_day`  

### Phase 3 — Clock Shelter
13. `paycheck_income`  
14. `budget_buckets` (uses `needs_vs_wants` if not yet)  
15. `emergency_fund` → `protect_vs_spend` (second irreversible Take)  
16. `plan_vs_impulse` (digression)  
17. Reinforce `patience_vs_haste`  

### Phase 4 — Gate
18. `freedom_seal`  
19. `mastery_clear` (parallel, never replacing Takes)  

### Phase 5 — Spiral Withstand
20. `debt`  
21. `interest_compounds`  
22. `on_time_history` → `apr` → `credit_utilization`  
23. `bank_of_obligation` (digression)  
24. `wait_vs_borrow` (third spine Take)  
25. `harbor_weather` haste feedback  

### Phase 6 — Optional era transfer
26. `time_horizon` · `diversification` · `investment_return`  

---

## Curriculum principles

1. **Footprint before ledger.** Never let Income/Expenses/Assets be the first “why this is interesting.”  
2. **Hold → Shelter → Withstand.** Organ order is conceptual, not a menu list.  
3. **Name after feel.** APR after interest drama; diversification after cashflow breath.  
4. **Digressions reinforce, don’t introduce spine.** Needs/wants may seed Clock but must not replace Cove Take.  
5. **Embodied > jargon.** Keep opportunity cost as foreshadow rows until (if ever) a later named beat is designed.  
6. **Do not implement in this pass** — ordering is a teaching contract for future FTUE work.

---

## Alignment with core loop

| Core loop node | Concepts that must already be live |
|----------------|-------------------------------------|
| SITUATION | `earn_then_decide` |
| INFORMATION | `save_vs_spend` foreshadow (embodied opportunity cost) |
| PLAYER DECISION | `irreversible_take` |
| SYSTEM RESPONSE | `coin_hold` signals |
| VISIBLE CONSEQUENCE | `harbor_scar_memory` |
| PLAYER INTERPRETATION | `money_is_alive` confirmed |
| REVISED STRATEGY | readiness for `patience_vs_haste` / next organ |
| NEXT DECISION | Phase 3+ Takes |
