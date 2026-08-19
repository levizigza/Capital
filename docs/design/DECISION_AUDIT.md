# Capital — Decision Audit

**Status:** Evidence inventory of recurring (and signature) player decisions  
**Derived from:** shipped `main` + `docs/design/MASTER_DESIGN_AUDIT.md` · `CAPITAL_DESIGN_CONSTITUTION.md`  
**Constraint:** Document only. **Do not rebalance** in this pass.  
**Method:** Choices must exist in `src/` or island content JSON. UNKNOWN marked. Parked / unwired content noted separately.

**Strength law (constitution):** A decision is strongest when **different choices become rational under different circumstances.**

---

## Flag definitions

| Flag | Meaning |
|------|---------|
| **INTERESTING_CHOICE** | Tradeoffs; ≥2 options can be rational under different goals/states |
| **OBVIOUS_CHOICE** | One option dominates for any reasonable goal the game teaches |
| **FAKE_CHOICE** | UI offers options but outcomes converge / no lasting branch |
| **MEANINGLESS_CHOICE** | Outcomes differ cosmetically; no strategy, learning, or memory stake worth naming |
| **UNINFORMED_CHOICE** | Player lacks information needed to judge consequences at decide time |

A row may note a **secondary** flag (e.g. interesting for identity, obvious for CF).

---

## Inventory summary

| ID | Decision | Primary flag | Recurs? |
|----|----------|--------------|---------|
| D-COVE | Cove jar vs treat Take | INTERESTING (identity) / OBVIOUS (pure CF) | One-shot key; signature archetype |
| D-PAY | Paycheck umbrella vs glitter | INTERESTING (CF + scar) | One-shot |
| D-CREDIT | Credit wait vs borrow | INTERESTING | One-shot (gated) |
| D-DEFER | Take / digression “Maybe later” | INTERESTING | Until committed |
| D-SHELL | Cove Shell Want need vs want | INTERESTING (thin) | One-shot digression |
| D-TIP | Paycheck tip plan vs rush | MEANINGLESS (CF) | One-shot |
| D-COLLECTOR | Credit collector listen vs lean | INTERESTING (thin) | One-shot |
| D-ERA | Era shore linger vs rush pattern | MEANINGLESS / FAKE (strategy) | Per shore, one-shot each |
| D-DEAL | Harbor board deal accept vs pass | INTERESTING (contextual) | Recurring |
| D-LIAB | Board Debt Trap liability | FAKE_CHOICE (no picker) | Recurring hazard |
| D-SHOP | Capsule / polish / plaza pass buy | INTERESTING (thin) | Recurring |
| D-PET | Outfitter companion buy | MEANINGLESS (economy) | Recurring |
| D-CAST | Series lead / Outfitter look | MEANINGLESS (economy) / INTERESTING (expression) | Boot + recurring |
| D-PAYDAY | Ritual Collect Pay Day | OBVIOUS | Daily recurring |
| D-SHARE | Share PNG vs keep walking | FAKE (progression) | Per spectacle |
| D-WITNESS | Family Witness reaction | INTERESTING (social) | Per share |
| D-SOFT | Soft Beat dismiss | FAKE_CHOICE | Recurring peek |
| D-QUIZ | Mastery quiz answers | FAKE_CHOICE (strategy) | Until clear |
| D-FTUE | Ashore jar/treat practice | FAKE_CHOICE | Once per teach |
| D-CREDIT-GATE | Rex Score Scanner vs Not yet | INTERESTING | Until scanner done |
| D-PROFILE | Learning profile pick | OBVIOUS (for ease) | Settings |
| D-LIFE | LifeFork minigame forks | OBVIOUS (`better` keyed) | Parked / board caveat |
| D-EVENT | EventDeck draws | UNINFORMED / mixed | Per minigame session |

---

## Signature Takes

### D-COVE — Cove jar vs treat (`cove_save_vs_spend`)

**CONTEXT**  
Coincraft Cove · Keeper Kira Talk · node `kk1` · after earn path. First irreversible money Take on the spine.  
Evidence: `coincraft-cove.islands.json`, `firstFinancialScenario.ts`, `IslandsApp.tsx`.

**PLAYER GOAL**  
Complete Cove Change; leave a plaque Harbor will name; (often) grow toward Freedom.

**AVAILABLE INFORMATION**  
Choice copy names hush/gossip tone. Ledger footprint (+$5/−$5 mo) is applied in code; **UNKNOWN** whether UI fully previews CF delta at decide time for every player path. Both Takes still `giveItem` `cc_savings_jar`.

**OPTIONS**  
1. `kk1_a` — Jar before treat (`save`)  
2. `kk1_spend` — Treat before jar (`spend`)  
3. `kk1_b` — Maybe later (no effects) → **D-DEFER**

**IMMEDIATE CONSEQUENCES**  
Irreversible key + scar plaque + item; hush cinema; stance saver/spender ±2; ledger holding jar asset **+$5/mo** or treat liability **−$5/mo**.

**DELAYED CONSEQUENCES**  
Harbor spectacle / Plinth / Piggy retell; weather/shop via CF; Freedom streak harder after spend; Paycheck painting opens after Change.

**RISK**  
Spend: lower CF, storm-er weather thresholds, slower Freedom. Save: forgoes “treat” fantasy identity.

**OPPORTUNITY COST**  
The other plaque forever (first write wins). CF path divergence.

**REVERSIBILITY**  
Irreversible for that key. Defer is reversible until Take.

**UNCERTAINTY**  
Medium if CF preview incomplete; low if player already saw earn/ledger teach.

**VALID STRATEGIES**  
- **CF / Freedom hunter:** save  
- **Identity / story of impulse:** spend (accepts worse CF)  
- **Explore first:** defer  

**DOMINANT STRATEGY**  
For pure cashflow / Freedom: **save dominates spend** (strictly better monthly CF).

**LEARNING VALUE**  
High — opportunity cost + living consequence + Harbor memory. Strongest when player feels both identities are playable.

**FLAG:** **INTERESTING_CHOICE** (goals differ) · secondary **OBVIOUS_CHOICE** under pure CF optimization · watch **UNINFORMED_CHOICE** if CF not previewed

---

### D-PAY — Paycheck umbrella vs glitter (`paycheck_protect_vs_spend`)

**CONTEXT**  
Paycheck Peninsula · Vendor Vee · `vv1`. Clock organ Change.  
Evidence: `paycheck-peninsula.islands.json`.

**PLAYER GOAL**  
Stamp Paycheck Change; get rainy-day item; scar for Harbor.

**AVAILABLE INFORMATION**  
Copy contrasts umbrella vs glitter. Talk Battle preview rows show **±$4/mo** holdings before commit (`spineTakeFootprints.ts`).

**OPTIONS**  
1. `vv_protect` — Umbrella before glitter  
2. `vv_spend` — Glitter ate the umbrella  
(No defer row on this node.)

**IMMEDIATE CONSEQUENCES**  
Both: `startQuest` rainy-day · irreversible · scar · `giveItem` · **ledger footprint ±$4/mo**.

**DELAYED CONSEQUENCES**  
Different plaque / Piggy retell / stance. Pay Day cites holding labels; weather follows net CF.

**RISK**  
Glitter branch tightens monthly cushion.

**OPPORTUNITY COST**  
Other plaque; monthly dollars differ.

**REVERSIBILITY**  
Irreversible.

**UNCERTAINTY**  
Low on numbers (previewed); medium on Harbor emotional weight.

**VALID STRATEGIES**  
Protect for buffer; spend for scar/identity with tighter CF.

**DOMINANT STRATEGY**  
None — CF and scar both move.

**LEARNING VALUE**  
High for Clock *shelter* + cashflow transfer when preview read.

**FLAG:** **INTERESTING_CHOICE** (CF + identity) · watch **UNINFORMED_CHOICE** if preview skipped

---

### D-CREDIT — Credit wait vs borrow (`credit_borrow_vs_wait`)

**CONTEXT**  
Credit Kingdom · Rex · `r_fork` after Score Scanner (`creditEncounter.ts`).  
Evidence: `credit-kingdom.islands.json`, `harborWeather.ts` (haste scar can worsen weather when CF low).

**PLAYER GOAL**  
Clear Ordeal fork; earn canyon seal; survive spiral fantasy.

**AVAILABLE INFORMATION**  
Copy names wait vs haste. CF Δ from fork = **0**. Both grant `ck_canyon_seal`. Prior Scanner is a gate, not the Take.

**OPTIONS**  
1. `r_wait` — Waited the spiral  
2. `r_borrow` — Haste fed the spiral  

**IMMEDIATE CONSEQUENCES**  
Irreversible + scar (patience vs haste) + item; stance saver vs risk.

**DELAYED CONSEQUENCES**  
Plaque / Piggy; haste scar id can contribute to **storm** weather when CF &lt; threshold — cheaper shops, worse sky (indirect).

**RISK**  
Borrow/haste: weather/shop pressure if CF already weak. Wait: forgoes haste fantasy.

**OPPORTUNITY COST**  
Other plaque; possible weather path.

**REVERSIBILITY**  
Irreversible; afterward Rex `r_remember` only.

**UNCERTAINTY**  
Medium — weather coupling may be opaque at decide time → lean **UNINFORMED**.

**VALID STRATEGIES**  
- Low CF / storm-averse: wait  
- High CF / want risk scar story: borrow  

**DOMINANT STRATEGY**  
None absolute; wait safer if CF fragile.

**LEARNING VALUE**  
High for Spiral *withstands* if weather/scar coupling is felt; weaker if only plaque text differs.

**FLAG:** **INTERESTING_CHOICE** · secondary **UNINFORMED_CHOICE** if weather link untaught

---

### D-DEFER — “Maybe later” / “Not yet” before commit

**CONTEXT**  
Cove Take defer; Credit `r1_later`; many quest-start digressions. No `setIrreversible` until accept.

**PLAYER GOAL**  
Explore, earn, Soft Beat, or leave without locking plaque.

**OPTIONS**  
Commit now vs return later (flavor reconverge).

**IMMEDIATE / DELAYED**  
None until later commit. Soft Beat arm may expire (3 min) independently.

**RISK**  
Missing teach momentum; arm expiry.

**OPPORTUNITY COST**  
Time; Soft Beat suffix on Take.

**REVERSIBILITY**  
Fully reversible.

**VALID STRATEGIES**  
Bank Soft Beat → Take; earn coins first; map digression first.

**DOMINANT STRATEGY**  
None — depends on preparation.

**LEARNING VALUE**  
Medium — teaches option value / timing.

**FLAG:** **INTERESTING_CHOICE**

---

### D-CREDIT-GATE — Run Score Scanner vs Not yet

**CONTEXT**  
Rex `r1` before `r_fork`.

**OPTIONS**  
Start `mg_ck_signal` vs defer.

**CONSEQUENCES**  
Scanner required to open Take fork; defer loops.

**FLAG:** **INTERESTING_CHOICE** (timing) · not the moral Take itself

---

## Digression forks

### D-SHELL — Shell Want (`sh_fork`)

**CONTEXT**  
Cove side digression · need vs want. Scars `cc_shell_patience` / `cc_shell_impulse`. Completes `q_cc_shell_want`. **0 CF.**

**OPTIONS**  
Want waits / Buy the shell.

**LEARNING VALUE**  
On-theme for want vs need; thin if only stance/scar.

**FLAG:** **INTERESTING_CHOICE** (thin) · not OBVIOUS if player values plaque story

---

### D-TIP — Paycheck tip plan vs rush (`pri_fork`)

**OPTIONS**  
Plan vs tip rush · scars only · **0 CF.**

**FLAG:** **MEANINGLESS_CHOICE** (economy) · thin **INTERESTING** for shelf fill

---

### D-COLLECTOR — Listen vs lean (`dc_fork`)

**OPTIONS**  
Listen / lean · scars `ck_collector_*` · **0 CF.** Side tomfoolery, not Ordeal.

**FLAG:** **INTERESTING_CHOICE** (thin social/risk fantasy)

---

### D-ERA — Era shore linger/listen vs rush (pattern)

**CONTEXT**  
Same pattern on Signal, Foundry, Financial Assets, Digital Assets, Business Assets, Intangibles, Future Shores, Real Estate (see content JSON `*_fork` nodes). Soft-locked until Paycheck Change. Each: `addScar` ±1 stance, **0 CF**, idempotent scars.

**OPTIONS**  
Linger/listen/peek/watch vs rush (labels vary).

**VALID STRATEGIES**  
Fill digression shelf vs skip shores entirely (shores optional).

**DOMINANT STRATEGY**  
For spine completion: **skip era shores** (optional). For shelf completion: either fork fills a slot — often **FAKE** which side you pick.

**LEARNING VALUE**  
Low for CF; mild for “pace vs rush” theme repetition.

**FLAG:** **MEANINGLESS_CHOICE** / **FAKE_CHOICE** (strategy) · shelf completion is the real meta-choice (visit or not)

---

## Harbor economy (recurring)

### D-DEAL — Accept Harbor deal vs Pass

**CONTEXT**  
Party board `deal` space · `HARBOR_DEALS` · UI Pass / Buy.  
Evidence: `voyagerLedger.ts`, `IslandBoardView.tsx`.

**PLAYER GOAL**  
Raise CF toward Freedom ($30/mo × 3 Pay Days); or conserve pouch.

**AVAILABLE INFORMATION**  
Offer name, cost, monthly amount (UI-dependent — assume shown on accept panel).

**OPTIONS**  
| Offer | Cost | CF Δ |
|-------|-----:|-----:|
| Interest Jar | 20 | +5/mo |
| Shell Craft Booth | 40 | +10/mo |
| Lemonade Stand | 48 | +12/mo |

(Liabilities appear on Debt Trap — not this picker.)

**IMMEDIATE**  
−pouch + holding; or nothing if Pass.

**DELAYED**  
Higher Pay Day coins; Freedom streak; weather from CF.

**RISK**  
Illiquid after buy (miss other spends). Pass delays Freedom.

**OPPORTUNITY COST**  
Carpet polish / capsules / pets vs CF engine.

**REVERSIBILITY**  
Holdings persist (no sell path found in this audit — **UNKNOWN** if sell exists).

**UNCERTAINTY**  
Low if numbers shown.

**VALID STRATEGIES**  
- Freedom race: buy best affordable asset  
- Broke: pass, earn, return  
- All three assets share **4× payback** — choose by pouch constraint, not ROI rank  

**DOMINANT STRATEGY**  
If pouch ≥ cost and goal is Freedom: **Accept ≫ Pass**. Among assets, none dominates on ROI; liquidity dominates pick.

**LEARNING VALUE**  
High — assets vs liquidity; canonical recurring CF decision.

**FLAG:** **OBVIOUS_CHOICE** when pursuing Freedom with enough coins · **INTERESTING_CHOICE** when pouch contested (polish/capsules vs deal)

---

### D-LIAB — Debt Trap auto liability

**CONTEXT**  
Board lands on liability space → auto Snack Tab (−$8/mo) or Gadget Loan (−$12/mo). **No accept/pass.**

**FLAG:** **FAKE_CHOICE** (hazard, not a decision) · listed so “forced spend” is not mistaken for agency

---

### D-SHOP — Capsule, carpet polish, plaza pass

**CONTEXT**  
`harborShop.ts` · Capsule stall. Weather-scaled prices. Max 3 party items.

**OPTIONS (examples, fair weather base)**  
Shield 40 · Magnet 55 · Writ 45 · Charm 70 · Buoy 60 · Plaza pass 80 · Carpet polish `max(50, 0.35× next tier minCoins)`.

**IMMEDIATE**  
Pouch down; item or look or market unlock.

**DELAYED**  
Board convenience (shield/magnet); **0 CF** from cosmetics/pass.

**RISK**  
Starving deal fund.

**OPPORTUNITY COST**  
Direct vs D-DEAL.

**VALID STRATEGIES**  
Buy board toys after CF engine funded; polish as expression after Freedom floor.

**DOMINANT STRATEGY**  
For Freedom: **prefer deals over polish/pets**. Capsules situational on board.

**LEARNING VALUE**  
Medium — liquidity allocation; weak if shop reads as “progress.”

**FLAG:** **INTERESTING_CHOICE** when budgeting against deals · else **OBVIOUS** (skip until CF healthy) · polish alone **MEANINGLESS** for learning

---

### D-PET / D-CAST — Companions & looks

**CONTEXT**  
Outfitter / boot cast. Pets: tortoise 0, finch 30, crab 35, otter 40, iguana 45. Cast select among series leads (+ Harbor extras). Cosmetic.

**FLAG:** **INTERESTING_CHOICE** (expression / identity) · **MEANINGLESS_CHOICE** (financial reasoning)

---

### D-PAYDAY — Collect ritual Pay Day

**CONTEXT**  
Harbor Daily Ritual · `applyPayday` with Harbor escape tracking. No explicit Skip button; closing modal = implicit skip.

**OPTIONS**  
Collect vs leave without collecting.

**DOMINANT STRATEGY**  
**Collect** if chasing Freedom (streak). Skip only if intentional delay (**UNKNOWN** why a player would).

**FLAG:** **OBVIOUS_CHOICE** · weak as “decision”

---

## Social / cinema / peek

### D-SHARE — Share Harbor-felt PNG vs keep walking

**CONTEXT**  
After scar spectacle · `HarborFeltShareOverlay.tsx`.

**OPTIONS**  
Download/share then close · Leave — find Piggy / Esc.

**IMMEDIATE**  
Optional PNG; both paths close overlay and continue to Piggy beat.

**DELAYED**  
None on ledger/scar. Witness only if Family Room active.

**FLAG:** **FAKE_CHOICE** for progression · **INTERESTING_CHOICE** for social expression outside save

---

### D-WITNESS — Cheer / caution / curious

**CONTEXT**  
`familyRoom.ts` · local myth only · does not edit plaque/ledger.

**OPTIONS**  
Three reactions.

**FLAG:** **INTERESTING_CHOICE** (household meaning) · **MEANINGLESS** for sim

---

### D-SOFT — Soft Beat lookout dismiss

**CONTEXT**  
Overlay dismiss-only · arms suffix on next scar/Take Talk · no fork vista shipped.

**FLAG:** **FAKE_CHOICE** (timing peek, not a branch) · valuable as **preparation**, not as decision tree

---

## Quizzes, FTUE, minigames

### D-QUIZ — Mastery gate answers

**CONTEXT**  
`masteryGate.ts` · all-correct → `masteryClears` · Credit on `main` needs 3 clears + Freedom.

**OPTIONS**  
MCQ with one `correctIndex`.

**FLAG:** **FAKE_CHOICE** as strategy decision (one right answer) · valid as **knowledge check**, conflicts with constitution if it *is* the game

---

### D-FTUE — Ashore DecisionForkShowcase jar vs treat

**CONTEXT**  
FTUE-7 practice · local React state only · **does not** write irreversible.

**FLAG:** **FAKE_CHOICE** (rehearsal) · acceptable as teach if later Cove Take is real

---

### D-LIFE — LifeForkGame session forks

**CONTEXT**  
Four prompts with keyed `better` a/b · score path. Parked from shore/arcade; may still appear via Cove party board (**UNKNOWN** intent).

**FLAG:** **OBVIOUS_CHOICE** if player learns `better` · quiz-like

---

### D-EVENT — EventDeck card resolves

**CONTEXT**  
Inbox Storm / Credit inbox / Ledger mail decks · session money/score. Many draws; effects in JSON.

**AVAILABLE INFORMATION**  
Often partial — cards reveal on draw.

**FLAG:** mixed · often **UNINFORMED_CHOICE** at draw · skill emerges across session · not spine Takes

---

### D-PROFILE — Explorer / Apprentice / Strategist

**CONTEXT**  
Settings learning profile scales penalties/rewards/quest bars.

**DOMINANT STRATEGY**  
Explorer easier for clears → **OBVIOUS** if goal is completion.

**FLAG:** **OBVIOUS_CHOICE** (ease) · meta, not money sim

---

## Cross-cutting findings (no rebalance — observe only)

1. **Only Cove Take + Harbor deals move CF with a real fork.** Paycheck/Credit Takes are memory-first; economy teaching load sits unevenly on Cove + deals.  
2. **Identical 4× deal ROI** removes “which asset?” interest — only liquidity differs.  
3. **Era linger/rush** repeats a FAKE/MEANINGLESS fork eight times — pattern fatigue risk.  
4. **Soft Beat** is preparation, not a choice — constitution-aligned if sold as peek, not fork.  
5. **Mastery quizzes as Credit gate** are strategy-FAKE by nature — tension with Independent Transfer north star.  
6. **Share vs walk** is progression-FAKE — fine if social is optional.  
7. **Forced liabilities** are hazards, not decisions — do not count as agency.  
8. Strongest shipped INTERESTING cluster: **D-COVE** (multi-goal), **D-CREDIT** (if weather felt), **D-DEAL** (when pouch contested), **D-DEFER** (option value).

---

## Decision quality heatmap

```
                 Learning ↑
                    │
         D-COVE ●   │
                    │  D-CREDIT ●
              D-DEAL│●     D-SHELL ○
                    │  D-DEFER ●
                    │         D-WITNESS ○
        ────────────┼────────────────→ Agency / lasting branch
           D-PAY △  │  D-ERA △
           D-TIP △  │  D-SHARE ░
                    │  D-QUIZ ░  D-FTUE ░
                    │  D-SOFT ░  D-LIAB ░
                 Cosmetic / converge
```

● INTERESTING · ○ thin interesting · △ MEANINGLESS (econ) · ░ FAKE / non-decision

---

## Out of scope / UNKNOWN

- Exact in-UI CF preview completeness for Cove Take  
- Sell/remove holding UX  
- Whether party board intentionally hosts parked LifeFork/News  
- Live EventDeck skill ceiling vs noise  
- Unmerged PRs that change Credit unlock (gates ≠ this fork)

---

## Next steps (explicitly not this doc)

Do **not** rebalance here. Future design work may: add CF stakes to Clock/Spiral Takes, differentiate deal ROIs, collapse era fork sameness, or demote quiz gates — each must pass `CAPITAL_DESIGN_CONSTITUTION.md`.
