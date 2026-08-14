# Islands path — risk / reward audit

Scope: Harbor → Cove → Paycheck → Credit (not legacy structured mode).  
Focus: major actions where reward, loss, uncertainty, foresight, horizon, and recovery interact.

---

## Action catalog

### 1. Irreversible Takes / scars (Cove · Paycheck · Credit)

| | |
|---|---|
| **Files** | `/workspace/src/islands/content/coincraft-cove.islands.json` (`dlg_keeper_kira`), `/workspace/src/islands/content/paycheck-peninsula.islands.json` (`dlg_vendor_vee`), `/workspace/src/islands/content/credit-kingdom.islands.json` (`dlg_collector_rex`), `/workspace/src/islands/IslandsApp.tsx` (`setIrreversible` / `addScar`), `/workspace/src/islands/worldMemory.ts`, `/workspace/src/islands/views/TakeHushOverlay.tsx`, `/workspace/src/islands/views/ScarSpectacleOverlay.tsx` |
| **Reward** | Progress item either way (`cc_savings_jar` / `pp_rainy_day_fund` / `ck_canyon_seal`); chapter quiet → Harbor spectacle → Plinth plaque → share; unlocks next painting after Cove/Paycheck |
| **Loss** | Scar label + stance axis only (saver/spender/risk). No pouch debit. Spend/haste still get the same key item |
| **Uncertainty** | None on outcome — binary named choice |
| **Info before** | Explicit “sticks forever” / Ordeal copy; Credit gated behind Score Scanner practice (`creditEncounter.ts`) |
| **Horizon** | Permanent for the save; day-2 echo + Soft Beat retell |
| **Recovery** | Cannot re-pick. Soft-reset: both branches complete the quest; haste only softens weather (`harborWeather.ts`) |
| **Counterplay** | None after lock. Pre-act: delay (“Maybe later” / “Not yet”) |

**Relationship gap:** Choice is identity theater, not ledger trade. Spend/haste never costs cashflow vs save/wait.

**Smallest fix:** Branch-differentiated ledger residue (e.g. spend adds a small liability or delays Freedom streak; haste raises living expenses until a Credit recovery deal) — same item, different monthly weight.

---

### 2. Ledger deals (assets) & liability traps

| | |
|---|---|
| **Files** | `/workspace/src/islands/voyagerLedger.ts` (`HARBOR_DEALS`, `acceptDeal`, `addHolding`), `/workspace/src/islands/partyBoard.ts` (`deal` / `liability` resolve), `/workspace/src/islands/views/IslandBoardView.tsx` (`resolveDealOffer`), `/workspace/src/islands/boardEconomy.ts` |
| **Reward (deal)** | −coins now → +$/mo cashflow forever (e.g. Jar 20→+5, Booth 40→+10, Lemonade 48→+12) |
| **Loss (liability)** | Forced −$/mo with **no accept UI** (Snack Tab −8, Gadget Loan −12); no purchase cost |
| **Uncertainty** | Which unused deal/liability is drawn (`pickUnusedHolding` / random pool) |
| **Info before** | Deal: cost + monthly shown before accept/pass. Liability: land → instant apply |
| **Horizon** | Permanent holdings; no sell/payoff API |
| **Recovery** | Deals: pass. Liabilities: none — only grind higher income |
| **Counterplay** | Capsules/shields don’t block liability spaces |

**Relationship gap:** Assets are opt-in skill; liabilities are dice punishment with no new decision.

**Smallest fix:** Liability lands offer a fork (accept trap / pay lump-sum buyout / take stance scar) instead of silent `addHolding`.

---

### 3. Pay Day (board · pass-start · Harbor ritual)

| | |
|---|---|
| **Files** | `/workspace/src/islands/voyagerLedger.ts` (`applyPayday`), `/workspace/src/islands/partyBoard.ts` (`resolvePassStart`, `payday` case), `/workspace/src/islands/IslandsApp.tsx` (`onClaimRitualPayday`), `/workspace/src/islands/harborRitual.ts`, `/workspace/src/islands/views/HomeHubView.tsx` |
| **Reward** | `netCashflow` coins to pouch; streak toward Freedom when `trackHarborEscape` (Harbor board + ritual only) |
| **Loss** | Negative cashflow → negative coins; streak resets to 0 if below $30/mo |
| **Uncertainty** | Deterministic given ledger; board position / ritual day gate when you get it |
| **Info before** | Ledger HUD / Freedom chip (`freedomPlazaChip`); ritual UI states payday done |
| **Horizon** | Instant coins; streak is multi-day / multi-lap |
| **Recovery** | Buy assets, avoid liabilities; ritual once/day |
| **Counterplay** | Dividend Magnet doubles positive Pay Day once |

**Note:** `incomeMultiplier` on `applyPayday` is unused on islands path (always `1`). Macro boom/recession in `/workspace/src/islands/economy.ts` advances on minigame clear but does **not** scale Pay Day.

---

### 4. Freedom Seal chase

| | |
|---|---|
| **Files** | `/workspace/src/islands/voyagerLedger.ts` (`HARBOR_ESCAPE_TARGET=30`, `STREAK=3`), `/workspace/src/islands/progressGates.ts` (`withHarborFreedomRewards`, boss gate), `/workspace/src/islands/boats.ts` / `harborShop.ts` (Fortune flyer floor) |
| **Reward** | `harbor_freedom_seal`, pavilion unlock, carpet tier floor → Fortune flyer, Credit unlock (with mastery) |
| **Loss** | Opportunity cost of deal spends; streak break if cashflow dips |
| **Uncertainty** | Low once holdings known; streak is the only timing risk |
| **Info before** | Plaza chip “Seal chase · streak / cashflow” |
| **Horizon** | ≥3 qualifying Harbor Pay Days after cashflow ≥30 |
| **Recovery** | Rebuild streak; escape is sticky once earned |
| **Counterplay** | Era boards use cashflow Pay Days but **never** track escape (`tracksHarborEscape`) |

**Relationship gap:** Freedom flyer carpet is a large cosmetic/progress grant with no opposing spend pressure after seal.

**Smallest fix:** Tie flyer floor to a spend choice at Freedom Pavilion (claim seal **or** polish yourself) rather than auto-flooring `resolveHarborBoatTier`.

---

### 5. Capsules & party board spaces

| | |
|---|---|
| **Files** | `/workspace/src/islands/partyBoard.ts`, `/workspace/src/islands/partyItems.ts`, `/workspace/src/islands/harborShop.ts`, `/workspace/src/islands/world3d/CapsuleStudioOverlay.tsx` |
| **Reward** | Free board capsule (random item); shop buy (40–70× weather); use effects (double Pay Day, steal, skip rival, 10% pouch compound) |
| **Loss** | Collector −12 (unless shield/bailout); Fee Raid can fail vs shield; seal spend −20; shop sinks coins |
| **Uncertainty** | Dice landings; random capsule; raid steal amount 8–15 |
| **Info before** | Space labels on board; shop shows price; item tips on use |
| **Horizon** | Turn-local buffs; seals are session score |
| **Recovery** | Bailout/shield once; buy replacements at Capsule Studio |
| **Counterplay** | Rival shields; inventory cap 3 |

**Free-win note:** Board `capsule` / `lucky` / `bank` (+8 interest) / pass-start party dividend grant value with no opposing choice — soft sinks only if you later buy seals.

---

### 6. Credit / Debt Collector

| | |
|---|---|
| **Files** | `/workspace/src/islands/content/credit-kingdom.islands.json` (`dlg_collector_rex`, `dlg_debt_collector`), `/workspace/src/islands/creditEncounter.ts`, `/workspace/src/islands/moneyCast.ts`, board `collector` in `partyBoard.ts` |
| **Reward** | Ordeal plaque + `ck_canyon_seal` either branch; Rex remember node after |
| **Loss** | Haste scar → storm weather bias when cf&lt;20; board Collector coin tax |
| **Uncertainty** | Board tax only; Talk Ordeal is deterministic |
| **Info before** | Practice-first copy; fork after `mg_ck_signal` |
| **Horizon** | Permanent scar; weather while cashflow weak |
| **Recovery** | Copy promises rebuild; **no** payoff quest / liability clear mechanic |
| **Counterplay** | Wait branch; board shields |

**Relationship gap:** Debt Collector Talk is flavor only (defy/back → end). Haste “interest feeds” never compounds a number.

**Smallest fix:** Haste Take adds a Credit liability holding; wait Take grants a one-time Interest Keep Soft Beat that can **discharge** one liability — links Ordeal to ledger, not weather alone.

---

### 7. Storm / weather prices

| | |
|---|---|
| **Files** | `/workspace/src/islands/harborWeather.ts`, consumers in `harborShop.ts` |
| **Reward** | Storm/tight → **cheaper** shops (0.85–0.92×) |
| **Loss** | Boom → markup 1.1×; fog aesthetics |
| **Uncertainty** | Deterministic from cashflow + haste-scar rule |
| **Info before** | `weatherCoachLine` / EconomyWeatherIndicator |
| **Horizon** | While mood lasts |
| **Recovery** | Raise cashflow |
| **Counterplay** | None — weather helps the poor |

**Anti-pattern:** Punishment for haste/low cashflow **subsidizes** shopping — inverted risk/reward.

**Smallest fix:** Invert storm shop rule (storm marks up essentials / blocks polish) **or** keep discount but add a storm bill on ritual Pay Day so fog isn’t only a bargain.

---

### 8. Soft Beats

| | |
|---|---|
| **Files** | `/workspace/src/islands/views/SoftBeatOverlay.tsx`, `/workspace/src/islands/moneyStructures.ts` (part `softBeat`), shore/hub wiring |
| **Reward** | Aspiration / retell only (organ sentence + plaque receipt) |
| **Loss** | None |
| **Uncertainty** | None |
| **Info before** | Structure pad beacon |
| **Horizon** | ~4–5s cinema |
| **Recovery** | N/A |
| **Counterplay** | N/A |

Not a risk action — correctly non-punitive. Risk issue only if Soft Beat is mistaken for recovery from haste (copy says “Not a second Take”).

---

### 9. Carpet spends (polish · travel · Freedom floor)

| | |
|---|---|
| **Files** | `/workspace/src/islands/harborShop.ts` (`nextPurchasableCarpet`, `CARPET_POLISH_MARKUP=0.35`), `/workspace/src/islands/boats.ts`, `/workspace/src/islands/world3d/CarpetFlightView.tsx` |
| **Reward** | Visual tier + Freedom flyer auto-floor |
| **Loss** | Polish coins (weather-scaled); travel time only |
| **Uncertainty** | Price mood only |
| **Info before** | Capsule Studio / pavilion price |
| **Horizon** | Permanent tier |
| **Recovery** | Earn more coins |
| **Counterplay** | Skip polish; Freedom still floors flyer |

---

### 10. Mastery quizzes

| | |
|---|---|
| **Files** | `/workspace/src/islands/masteryGate.ts`, `/workspace/src/islands/views/MasteryQuiz.tsx`, `/workspace/src/islands/IslandsApp.tsx` (`finalizeSuccessfulClear` / `markMasteryClear`), `/workspace/src/islands/progressGates.ts` (`BOSS_MASTERY_REQUIRED=3`) |
| **Reward** | Mastery clear id; Credit unlock when Freedom + 3 clears; board/minigame coins via prior clear |
| **Loss** | Fail → retry minigame / re-answer; **no** coin debit |
| **Uncertainty** | Player knowledge only |
| **Info before** | “All must be correct”; hints after wrong submit |
| **Horizon** | Gate then permanent clear |
| **Recovery** | Unlimited retries (`minigameFail.ts` soft dignity) |
| **Counterplay** | None |

**Relationship gap:** Loss only deletes attempt progress — no new ledger/board decision on fail.

**Smallest fix:** On fail, offer a board fork (pay a small “tutoring bill” to keep pad position vs walk and lose the land resolve) so miss costs a choice, not just time.

---

### 11. Haste / interest

| | |
|---|---|
| **Files** | Credit Take (`credit_haste_plaque`), `/workspace/src/islands/harborWeather.ts` (hasteScar → storm if cf&lt;20), Interest Keep Soft Beat, board `bank` “interest payday” (+8 flat), `compound_charm` (10% pouch), `/workspace/src/islands/economy.ts` (legacy/macro — weakly wired) |
| **Reward** | Wait: patience plaque. Charm/bank: free-ish coins |
| **Loss** | Haste: weather fog + cheaper shops (see §7). No APR number |
| **Uncertainty** | Low |
| **Info before** | Ordeal copy after Signal minigame |
| **Horizon** | Scar permanent; weather while weak |
| **Recovery** | Raise cf ≥20 exits haste-storm; no interest paydown verb |
| **Counterplay** | Choose wait |

---

## Pattern findings (1–4)

### 1. High reward, little risk (arbitrary free wins)

| Spot | Why |
|---|---|
| Takes both grant the key item | `/workspace/*/content/*` Take effects — no pouch/ledger fork |
| Freedom → Fortune flyer auto-floor | `harborShop.resolveHarborBoatTier` / `boats.getEffectiveBoatTier` |
| Board lucky / bank / free capsules | `partyBoard.resolvePlayerSpace` |
| Ritual +5 after Pay Day | `harborRitual.DAILY_RITUAL_REWARD_COINS` — intentional tiny, still free |
| Storm discounts shops | `harborPriceMultiplier` storm 0.85 |
| Compound Charm / Dividend Magnet | Spend item → near-certain coin gain |

### 2. Losses that only delete progress (no new decision)

| Spot | Why |
|---|---|
| Mastery fail | Retry minigame/answers only |
| Minigame soft fail | `minigameFail.ts` — same shore, clearer try |
| Freedom streak reset | Binary wipe of streak counter when cf dips — no “pay to keep streak” / “accept scar” fork |
| Seal can’t afford | Message only; space resolves empty |

### 3. Punishment feels arbitrary

| Spot | Why |
|---|---|
| Liability space | Random trap on dice with no preview beyond label |
| Board Collector −12 | Flavor “Debt Drake’s cousin” unrelated to Credit Ordeal ledger |
| Haste → cheaper Harbor prices | Consequence fights the fiction (“interest feeds”) |

### 4. Recovery missing or soft-resets consequences

| Spot | Why |
|---|---|
| No `removeHolding` / payoff | Liabilities permanent |
| Take branches equalized | Spend/haste still complete quest + get item |
| Debt Collector Talk | No mechanical collect |
| Soft Beat / day-2 | Memory theater, not rebuild verbs |
| Macro economy unused on Pay Day | Boom/recession can’t bite cashflow ritual |

---

## Suggested smallest relationship fixes (priority)

1. **Takes ↔ ledger:** Differ savings vs spend / wait vs haste by a holding or living-expense delta, not plaque text alone.  
2. **Liability space ↔ deal space:** Same accept/pass UI; trap becomes a choice.  
3. **Haste scar ↔ weather:** Storm should cost (ritual bill / polish markup), not subsidize capsules.  
4. **Freedom seal ↔ carpet:** Pavilion claim spends or delays flyer floor.  
5. **Mastery fail ↔ board:** Fail opens a pay-or-walk decision tied to the land that started the pad.  
6. **Credit Ordeal ↔ Interest Keep:** One Soft Beat or Keep part that discharges haste liability — recovery as a place, not a toast.

Do not rely on number tweaks alone (e.g. raising Collector from 12→20); change what systems the action writes into.
