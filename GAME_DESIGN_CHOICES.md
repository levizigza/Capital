# Meaningful choices — Capital audit

Recurring decisions on the frozen path (Harbor · Cove → Paycheck → Credit). A meaningful choice needs: multiple viable options, different consequences, incomplete information, trade-offs, context dependence, and future implications.

**Method:** find fake choices (one option almost always superior), then change **system relationships** — not XP/coin number tweaks — so each option becomes valuable under different circumstances.

Related: [docs/iconic-path.md](./docs/iconic-path.md) · `src/islands/meaningfulChoices.ts`

---

## Fake / dominant options found

| Decision | Why it was fake | Relationship fix |
|----------|-----------------|------------------|
| Soft Beat vs arcade pad | Soft Beat was cinema-only; arcade always “won” for progress | Soft Beat **arms next Pay Day** (organ buff). Arcade still earns now; Soft Beat shapes the next month. |
| Deal buy vs pass (CF &lt; target, affordable) | Buy always improved Freedom chase | **Weather settle:** storm/tight can delay asset income one Pay Day; pass → buy in fair weather for immediate cashflow. Runway + capsule context tips. |
| Shop polish / pets vs hold (pre-Freedom) | Cosmetics never touched Freedom math | **Vanity spend pauses Freedom streak** (companions, carpet polish, plaza pass). Capsules stay strategic. |
| Liability landings | Auto-add liability; capsule unused | **Emergency Ledger / Bailout absorbs Debt Trap** (burns buff) — holding a capsule becomes the counterstrategy. |
| Spine Takes (jar/treat, umbrella/glitter, wait/haste) | Equal cinema + same quest coins; myth-only | Keep scar dignity. Stance already diverges; Soft Beat affinity + deal advice now **read stance** so saver/spender/risk feel different futures. |
| Talk “maybe later” / flavor forks | Delay-only or cosmetic line | Documented as low-stakes; not forced into economy. |

---

## Decision cards

### 1. Soft Beat vs structure arcade

**CHOICE**  
Climb a Money Structure pad: Soft Beat (Lid / Teller / Loft / Battlement) or an arcade/minigame pad.

**OPTIONS**  
A) Soft Beat hush  
B) Arcade / structure minigame

**KNOWN INFORMATION**  
Structure name, organ verb chip, that Soft Beat is quiet cinema.

**UNKNOWN INFORMATION**  
Exact Pay Day multiplier/floor from Soft Beat; whether the next Pay Day is ritual or board; rival/board timing.

**IMMEDIATE CONSEQUENCE**  
A) Arms `armedSoftBeat` for the next Pay Day (lookout → coin boost; umbrella → shortfall floor; battlement → liability drag damp once; ledger → memory tip + mild boost).  
B) Coins/XP/mastery now; does not arm Pay Day.

**LONG-TERM CONSEQUENCE**  
A) Shapes Freedom streak math on the next claim.  
B) Faster pouch for deals/shop; no organ arm.

**OPPORTUNITY COST**  
Soft Beat delays earn-now. Arcade forgoes the next-month organ buff.

**COUNTERSTRATEGY**  
Chase Freedom with Soft Beat before ritual Pay Day. Need pouch for a deal today → arcade first, Soft Beat after purchase.

---

### 2. Deal accept vs pass

**CHOICE**  
Board Deal space: buy asset or pass.

**OPTIONS**  
A) Buy (pay pouch, add holding)  
B) Pass

**KNOWN INFORMATION**  
Name, cost, +$/mo, current pouch, rough cashflow chip, weather mood line.

**UNKNOWN INFORMATION**  
Next bill / Debt Trap; whether storm will settle the asset one Pay Day; rival tempo; exact Freedom streak risk if pouch runs dry.

**IMMEDIATE CONSEQUENCE**  
A) Pouch down; holding added. In **storm** (or tight + spender stance), asset may **settle one Pay Day** before income counts.  
B) No change; tip may favor patience.

**LONG-TERM CONSEQUENCE**  
A) Higher CF when settled → Freedom path. Thin pouch → bill/Collector pain.  
B) Preserve runway; buy later in fair weather for full immediate income.

**OPPORTUNITY COST**  
Buy spends coins that could buy Emergency Capsule or polish. Pass delays CF growth.

**COUNTERSTRATEGY**  
Storm + thin pouch → pass (or buy only with capsule ready). Fair + CF below target + runway OK → buy. Stance tip leans saver → patience in fog; spender → close when CF already strong.

---

### 3. Harbor vanity vs Freedom chase

**CHOICE**  
Spend pouch on companion / carpet polish / plaza pass while Freedom Seal is still chasing.

**OPTIONS**  
A) Buy vanity / plaza identity  
B) Hold for deals / Pay Days / capsule

**KNOWN INFORMATION**  
Price, weather markup, Freedom chip (streak / CF goal).

**UNKNOWN INFORMATION**  
How many Pay Days until Freedom; whether a deal appears before next ritual.

**IMMEDIATE CONSEQUENCE**  
A) Item owned; **positive Pay Day streak resets** if not yet escaped (event on ledger). Capsule purchases do **not** reset.  
B) Pouch intact; streak intact.

**LONG-TERM CONSEQUENCE**  
A) Identity on plaza; Freedom delayed.  
B) Faster seal; quieter carpet.

**OPPORTUNITY COST**  
Vanity vs seal date. Hold vs looking “done” on the plaza.

**COUNTERSTRATEGY**  
Buy polish after Freedom. Mid-streak (2/3) → hold. Boom weather + already escaped → vanity is safe flavor.

---

### 4. Debt Trap vs Emergency Ledger

**CHOICE**  
(Automatic when buff ready) Liability space while shielded / bailout ready.

**OPTIONS**  
A) Burn Emergency Ledger / Bailout — liability never sticks  
B) No buff — liability attaches (−$/mo)

**KNOWN INFORMATION**  
Space type; whether buff icons show on HUD.

**UNKNOWN INFORMATION**  
When the next Fee Raid / Collector hits (buff might have been better saved).

**IMMEDIATE CONSEQUENCE**  
A) Buff consumed; CF unchanged.  
B) Liability added; CF drops; weather may worsen.

**LONG-TERM CONSEQUENCE**  
A) Freedom path preserved; vulnerable to next raid.  
B) Harder escape; may push storm mood.

**OPPORTUNITY COST**  
Capsule spent on Debt Trap can’t block Collector.

**COUNTERSTRATEGY**  
Carry capsule when CF is near escape target. Spend capsule on Collector when liabilities already maxed.

---

### 5. Ritual Pay Day timing

**CHOICE**  
Claim Harbor daily ritual Pay Day now vs later the same day (after Soft Beat / deal / shop).

**OPTIONS**  
A) Claim now  
B) Delay (same day window)

**KNOWN INFORMATION**  
Ritual available; streak; whether Soft Beat is armed.

**UNKNOWN INFORMATION**  
Whether you’ll Soft Beat before logout; board Pay Day elsewhere today.

**IMMEDIATE CONSEQUENCE**  
A) Consumes armed Soft Beat buff; advances Freedom streak if CF qualifies.  
B) Time to arm Soft Beat or close a deal first.

**LONG-TERM CONSEQUENCE**  
Order changes streak/pouch path without changing the calendar day key.

**OPPORTUNITY COST**  
Claiming unarmed forgoes organ buff. Waiting risks forgetting the ritual.

**COUNTERSTRATEGY**  
Soft Beat → claim. Need a deal first → board then Soft Beat then claim.

---

### 6. Spine Takes (Cove / Paycheck / Credit)

**CHOICE**  
Irreversible jar vs treat · umbrella vs glitter · wait vs haste.

**OPTIONS**  
Two myth forks each (scar + stance axis).

**KNOWN INFORMATION**  
Talk framing; that Harbor will remember; organ hush.

**UNKNOWN INFORMATION**  
Exact plaza plaque line until homecoming; how Soft Beat / deal tips will lean later.

**IMMEDIATE CONSEQUENCE**  
Equal cinema dignity; scar; stance bump (saver / spender / risk). **No pouch debit** (balance sheet contract).

**LONG-TERM CONSEQUENCE**  
Plaque, day-2 echo, stance-weighted Soft Beat strength + deal advice. Haste scar can deepen storm weather when CF is weak.

**OPPORTUNITY COST**  
The other myth; the other stance lean.

**COUNTERSTRATEGY**  
None “correct.” Play the plaque you want Harbor to retell; use Soft Beat/deals that match the stance you built.

---

### 7. Travel digression (side shore vs spine)

**CHOICE**  
Carpet to next spine island vs era/side shore.

**OPTIONS**  
A) Main course (Cove → Paycheck → Credit)  
B) Side tomfoolery / genre shore

**KNOWN INFORMATION**  
Map labels; main-course coach.

**UNKNOWN INFORMATION**  
Side reward density; time to next Take.

**IMMEDIATE CONSEQUENCE**  
A) Story progress / Take readiness.  
B) Exploration, different music, delayed Change.

**LONG-TERM CONSEQUENCE**  
A) Iconic loop sooner.  
B) Richer map memory; slower Freedom/scar arc.

**OPPORTUNITY COST**  
Spectacle delayed vs novelty now.

**COUNTERSTRATEGY**  
Cold iconic run → spine only. Day-2+ → side shores when CF/streak is stable.

---

### 8. Capsule buy vs hold coins

**CHOICE**  
Harbor Capsule shop: Emergency Ledger / Bailout vs keep pouch.

**OPTIONS**  
A) Buy protection  
B) Hold for deal / Pay Day runway

**KNOWN INFORMATION**  
Price, item blurb, weather price mult.

**UNKNOWN INFORMATION**  
Next Debt Trap / Collector timing.

**IMMEDIATE CONSEQUENCE**  
A) Buff inventory; coins down; **does not** pause Freedom streak.  
B) Liquidity.

**LONG-TERM CONSEQUENCE**  
A) Can absorb Debt Trap or block raid.  
B) Faster deal buys; exposed to traps.

**OPPORTUNITY COST**  
Protection vs CF growth speed.

**COUNTERSTRATEGY**  
Near Freedom with board sessions ahead → capsule. Pure ritual grind → hold for Interest Jar deal.

---

## Prototype / code map

| Relationship | Module / hook |
|--------------|---------------|
| Soft Beat arms Pay Day | `armSoftBeatForPayDay` → `IslandSaveV1.armedSoftBeat`; consumed in `applyPaydayWithChoices` / ritual + board |
| Storm asset settle | `LedgerHolding.settlingPaydays` via `acceptDealWithContext` |
| Vanity pauses Freedom | `onHarborPurchase` → `pauseFreedomStreakForVanity` |
| Capsule absorbs Debt Trap | `partyBoard` liability case |
| Deal / Soft Beat tips | `dealChoiceCounsel`, `softBeatCounsel` |

Query `?choices=1` shows a compact counselor strip on Harbor when chasing Freedom (see `ChoicesCounselStrip`).
