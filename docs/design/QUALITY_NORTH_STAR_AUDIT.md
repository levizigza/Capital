# Quality north-star audit — Capital

**Date:** 2026-08-18  
**Scope:** Live Islands / Harbor product path on this repo (`main`-line spine). Not every minigame.  
**Freeze:** Harbor · Cove → Paycheck → Credit; no map widen; Family Room local — [`iconic-path.md`](../iconic-path.md).  
**Formula:**

```text
CAPITAL QUALITY ≈
  INTERESTING FINANCIAL DECISIONS
× UNDERSTANDABLE CAUSALITY
× PLAYER AGENCY
× TRANSFERABLE LEARNING
× EMOTIONAL MEANING
× SYSTEM DEPTH
× FRICTIONLESS UX
× TRUST
```

**Related audits on main:** [`LONGEVITY_100H.md`](../LONGEVITY_100H.md) · [`COMPLEXITY_CUT_REVIEW.md`](../COMPLEXITY_CUT_REVIEW.md) · [`FEATURE_GATE.md`](../FEATURE_GATE.md) · FTUE stack under [`ftue/`](../ftue/) (esp. [`NORTH_STAR.md`](../ftue/NORTH_STAR.md)).  
**Related audit on branch only:** `docs/design/FAKE_MECHANICS_AUDIT.md` / `SKILLED_PLAYER_100H.md` (design branches; merge when ready) — quiz gates, silent XP/skillStats, ritual streaks flagged as fake play.

**Scoring:** `STRONG` · `OK` · `WEAK` · `DAMAGE` · `N/A`  
`DAMAGE` = actively hurts that dimension (not merely thin).

**Law:** Do **not** automatically implement fixes from this audit. Use the backlog for prioritized design decisions. Raising one dimension must not trash another.

---

## 1. Major features (Islands / Harbor path)

| # | Feature | Primary evidence |
|---|---------|------------------|
| A | Ashore teach (FTUE-7 prove) | `AshoreComprehensionTutorial.tsx`, `harborAshore.ts`, `docs/harbor-ashore.md` |
| B | Harbor plaza walk + quiet chrome | `WalkableHarborView.tsx`, `HomeHubView.tsx`, iconic quiet-homecoming laws |
| C | Cove Take + hush / scar / Plinth | `chapterLoop.ts`, `TakeHushOverlay`, `worldMemory.ts`, `iconic-path.md` signature loop |
| D | Piggy / Coin Bag | `harborTalks.ts`, `coinBagBuddy.ts`, `CoinBagBuddyHud.tsx` |
| E | Soft Beats (Money Structure lookouts) | `SoftBeatOverlay.tsx`, `softBeatArm.ts`, structure interiors |
| F | Voyager Ledger + Freedom Seal | `voyagerLedger.ts`, `VoyagerLedgerHud.tsx`, `$30×3` Pay Days |
| G | Harbor weather + shop prices | `harborWeather.ts` (CF + haste scar → mood → ±15% prices) |
| H | Party board deals | `partyBoard.ts`, deal catalog / Pay Day |
| I | Paycheck Take (independent transfer) | `paycheck-peninsula/story-circle.md`, `independentTransfer/` |
| J | Credit Ordeal | `credit-kingdom/story-circle.md`, `progressGates` boss unlock |
| K | Mastery quizzes | `masteryGate.ts`, `MasteryQuiz.tsx`, Credit needs 3 clears |
| L | Carpet / travel map | `TravelMapView.tsx`, `MoneyCarpet.tsx`, organ world-arrive |
| M | Digression shelf | `digressionShelf.ts` (scar pairs; never gates Credit) |
| N | Family Room (local) | `familyRoom.ts` — codes / JSON paste / witnesses / challenges |
| O | Share card (“Harbor felt that”) | `HarborFeltShareOverlay.tsx`, weekly share helpers |
| P | Daily Ritual | `harborRitual` / `shouldAutoOpenDailyRitual` in `harborAshore.ts` |
| Q | Money Structure interiors | `moneyStructures.ts`, `MoneyStructureInteriorView.tsx` |
| R | Outfitter / companions | `OutfitterStudio3D.tsx`, cosmetic pets |
| S | Adaptive coach | `adaptiveCoach.ts` (heuristics over fails / CF / skillStats) |
| T | Settings / a11y / bindings | `SettingsPanel.tsx`, `settings.ts`, `a11yMotion.ts` |
| U | XP / skillStats (hidden) | `skillStats.ts`, `designBible.ts` hide flags; still written |
| V | Progress gates | `progressGates.ts` — Freedom + mastery → Credit; island locks |

---

## Score matrix (all features × dimensions)

| Feature | IFD | UC | PA | TL | EM | SD | UX | TR |
|---------|-----|----|----|----|----|----|----|-----|
| Ashore teach | WEAK | STRONG | OK | OK | OK | WEAK | STRONG | STRONG |
| Harbor plaza walk | WEAK | OK | STRONG | WEAK | STRONG | OK | STRONG | OK |
| Cove Take + hush/scar/Plinth | STRONG | STRONG | STRONG | OK | STRONG | STRONG | OK | STRONG |
| Piggy / Coin Bag | WEAK | STRONG | OK | OK | STRONG | OK | OK | OK |
| Soft Beats | OK | STRONG | OK | OK | STRONG | STRONG | STRONG | STRONG |
| Ledger + Freedom Seal | STRONG | STRONG | STRONG | STRONG | OK | STRONG | OK | STRONG |
| Weather + shop prices | OK | STRONG | OK | STRONG | OK | STRONG | STRONG | STRONG |
| Party board deals | STRONG | OK | STRONG | OK | WEAK | OK | OK | WEAK |
| Paycheck Take | STRONG | STRONG | STRONG | STRONG | STRONG | OK | OK | STRONG |
| Credit Ordeal | STRONG | OK | STRONG | STRONG | STRONG | STRONG | WEAK | WEAK |
| **Mastery quizzes** | **DAMAGE** | WEAK | **DAMAGE** | **DAMAGE** | **DAMAGE** | WEAK | WEAK | **DAMAGE*** |
| Carpet / travel map | WEAK | STRONG | OK | WEAK | OK | WEAK | STRONG | STRONG |
| Digression shelf | OK | OK | OK | WEAK | OK | WEAK | OK | OK |
| Family Room (local) | OK | OK | STRONG | OK | STRONG | OK | OK | STRONG |
| Share card | N/A | STRONG | OK | OK | STRONG | WEAK | STRONG | STRONG |
| **Daily Ritual** | **DAMAGE** | WEAK | WEAK | **DAMAGE** | **DAMAGE** | WEAK | WEAK | **DAMAGE** |
| Money Structure interiors | OK | STRONG | OK | OK | STRONG | STRONG | STRONG | STRONG |
| Outfitter / companions | N/A | OK | OK | N/A | OK | WEAK | OK | OK |
| Adaptive coach | WEAK | OK | WEAK | WEAK | WEAK | WEAK | OK | WEAK |
| Settings / a11y / bindings | N/A | OK | STRONG | N/A | N/A | N/A | STRONG | STRONG |
| **XP / skillStats (hidden)** | **DAMAGE** | **DAMAGE** | WEAK | **DAMAGE** | WEAK | **DAMAGE** | OK | **DAMAGE** |
| Progress gates | OK | OK | OK | WEAK | WEAK | OK | OK | WEAK |

\*Quiz aces inflate *team* “they learned it” trust while damaging *player* trust that Capital is judgment under uncertainty.

**Legend:** IFD Interesting Financial Decisions · UC Understandable Causality · PA Player Agency · TL Transferable Learning · EM Emotional Meaning · SD System Depth · UX Frictionless UX · TR Trust


## 2. Per-feature scores

Dimensions: **IFD** Interesting Financial Decisions · **UC** Understandable Causality · **PA** Player Agency · **TL** Transferable Learning · **EM** Emotional Meaning · **SD** System Depth · **UX** Frictionless UX · **TR** Trust

### A. Ashore teach

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| WEAK | STRONG | OK | OK | OK | WEAK | STRONG | STRONG |

**Why:** Body proves Walk · Talk · poke Coin · jar vs treat (`docs/harbor-ashore.md`). Strong causality of *verbs*, weak financial stakes until Cove. Trust high: no ahead-coach naming Outfitter/Ritual (`onboardingNoAhead` / iconic checklist). Transfer starts later (Paycheck), not here.

### B. Harbor plaza walk

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| WEAK | OK | STRONG | WEAK | STRONG | OK | STRONG | OK |

**Why:** Free roam + quiet chrome until Piggy Talk is craft-strong (presence, fantasy). Few decisions until deals/weather matter. Longevity doc: plaza alone does not teach CF literacy unless weather/Piggy speak it.

### C. Cove Take + hush / scar / Plinth

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| STRONG | STRONG | STRONG | OK | STRONG | STRONG | OK | STRONG |

**Why:** Signature product moment — irreversible Take → hush → Harbor felt that → Plinth (`iconic-path.md`). Real plaque / scar / stance footprint. **Caveat (complexity cut #11):** fork stains memory but **same next-island unlock** — IFD/agency strong for identity, weaker for campaign graph. Cinema UX can be heavy for some players; Esc/Leave laws mitigate trap risk.

### D. Piggy / Coin Bag

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| WEAK | STRONG | OK | OK | STRONG | OK | OK | OK |

**Why:** Living receipts + homecoming name what Harbor kept (not a quiz) — emotional + causal. Risk: tip-NPC / Bag lines that **point answers** can DAMAGE transfer (FTUE north star: Coin Bag must not solve Paycheck). Meet_guide path is agency-respecting; generic tip worksheets are weaker (`COMPLEXITY_CUT` #9).

### E. Soft Beats

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| OK | STRONG | OK | OK | STRONG | STRONG | STRONG | STRONG |

**Why:** Lookout hush + `softBeatArm` foreshadows next Talk/Take organ chemistry without new islands — depth without width. Longevity: stock Soft Beat copy + low fork vistas → IFD/TL ceiling today; arm→consume on real stakes is the depth path. High trust as “poem not worksheet.”

### F. Voyager Ledger + Freedom Seal

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| STRONG | STRONG | STRONG | STRONG | OK | STRONG | OK | STRONG |

**Why:** Monthly CF (income − expenses + holdings) is the honest sim; Freedom = `$30×3` Pay Day streak (`voyagerLedger.ts`). Best transferable engine on the product. Emotional meaning thinner than scars (escape is sticky then vanity — `LONGEVITY_100H`). UX: HUD literacy needed; once taught, fair.

### G. Harbor weather + shop prices

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| OK | STRONG | OK | STRONG | OK | STRONG | STRONG | STRONG |

**Why:** Closed loop CF (+ haste scar) → sky → shop ±15% (`harborWeather.ts`, `feedbackLoopLine`). Strong causality and transfer (read the plaza as ledger mood). Decision interest medium — soft prices rarely force a hard fork unless taught as mastery. Fake-mechanics audit: keep; do not add second boom/recession Pay Day fiction.

### H. Party board deals

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| STRONG | OK | STRONG | OK | WEAK | OK | OK | WEAK |

**Why:** Real buy-vs-hold vs CF / pouch. Ceiling collapses when deal pool empties (`LONGEVITY_100H`). Trust WEAK if Board Stars / “party seals” read like Freedom (`designBible` renames to Board Star — still confusing if taught early). Complexity cut: demote to post-Freedom toy.

### I. Paycheck Take

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| STRONG | STRONG | STRONG | STRONG | STRONG | OK | OK | STRONG |

**Why:** Designed Independent Transfer surface (Vee stall, new numbers, no Cove mapping) — king KPI alignment (`ftue/NORTH_STAR.md`, paycheck story circle). Emotional plaque + Harbor Change. Depth OK (one fork + optional Clock buckets after).

### J. Credit Ordeal

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| STRONG | OK | STRONG | STRONG | STRONG | STRONG | WEAK | WEAK |

**Why:** Spiral organ + borrow/wait Take + Interest Keep — real stakes after Freedom. **Trust/UX hit:** door also needs **3 mastery clears** (`progressGates` / `BOSS_MASTERY_REQUIRED`) — quiz gate layered on Ordeal (`FAKE_MECHANICS` blocker). Causality of credit concepts OK inside chapter; unlock story mixed (sim Freedom + worksheet clears).

### K. Mastery quizzes

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| DAMAGE | WEAK | DAMAGE | DAMAGE | DAMAGE | WEAK | WEAK | DAMAGE* |

\*Quiz aces **inflate “they learned it” trust for the product team** while **damaging player trust** that Capital is a world of judgment under uncertainty (`masteryGate.ts`: “kinesthetic win is not enough”).

**Why:** All-correct MCQ after play (`MasteryQuiz.tsx`) — fake boss. Hurts IFD/PA/TL/EM; weak depth. Fake-mechanics: **BLOCKER**. Longevity: solved by ~10–20h as rote bank.

### L. Carpet / travel map

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| WEAK | STRONG | OK | WEAK | OK | WEAK | STRONG | STRONG |

**Why:** Readable organ map + short carpet rail (≤12s) — navigability / fantasy. Vanity coin thresholds are grind-shaped longevity poison (`LONGEVITY_100H`) — IFD WEAK if treated as progress. Freeze-safe as travel myth, not width.

### M. Digression shelf

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| OK | OK | OK | WEAK | OK | WEAK | OK | OK |

**Why:** Incomplete scar pairs = curiosity (`digressionShelf.ts`); never gates Credit — good trust. Slots include **era / outer shores** labels → collection pressure that fights iconic freeze psychologically (fill-% badge risk per fake-mechanics BADGES). Prefer myth lines over % complete.

### N. Family Room (local)

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| OK | OK | STRONG | OK | STRONG | OK | OK | STRONG |

**Why:** Local-only codes / JSON / witnesses / challenges (`familyRoom.ts`) — freeze-honest social. Emotional meaning high when humans stamp cheer/caution. IFD/TL depend on Challenge use; thin if unused. No fake MMO → trust STRONG.

### O. Share card

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| N/A | STRONG | OK | OK | STRONG | WEAK | STRONG | STRONG |

**Why:** Default social object after spectacle — freeze-frame retell (`HarborFeltShareOverlay`). Causal retell of *their* scar; expression > strategy. Variants from live weather/scar still thin (`LONGEVITY` proposal).

### P. Daily Ritual

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| DAMAGE | WEAK | WEAK | DAMAGE | DAMAGE | WEAK | WEAK | DAMAGE |

**Why:** Login/checklist streak chrome competes with day-2 Soft Beat craft (`COMPLEXITY_CUT` #14, `LONGEVITY` hollow meters, FAKE_MECHANICS STREAK_MANIPULATION). Auto-open gated after Cove (`shouldAutoOpenDailyRitual`) — mitigates UX trap but mechanism still extrinsic. Damages IFD/TL/EM/TR relative to signature return beats.

### Q. Money Structure interiors

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| OK | STRONG | OK | OK | STRONG | STRONG | STRONG | STRONG |

**Why:** Astro-style depth on freeze spine (Coin Jar · Ledger Bank · Payroll Tower · Interest Keep). Toys + Soft Beat pads = place literacy. Decisions inside vary by part minigames; depth is structural/emotional more than ledger forks — OK IFD unless Soft Beat/Take arm connects.

### R. Outfitter / companions

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| N/A | OK | OK | N/A | OK | WEAK | OK | OK |

**Why:** Expression shelf. Trust OK **only while cosmetic** (`COMPLEXITY_CUT` #12). DAMAGE risk if sold as power / CF gate. N/A on IFD/TL by design.

### S. Adaptive coach

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| WEAK | OK | WEAK | WEAK | WEAK | WEAK | OK | WEAK |

**Why:** Honest heuristics (`adaptiveCoach.ts`) help soft-locks (UX OK). Still reads **skillStats** + can over-hint → agency/transfer risk. Parallel personality vs organs (complexity cut #5). Prefer fail counts + CF only.

### T. Settings / a11y / bindings

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| N/A | OK | STRONG | N/A | N/A | N/A | STRONG | STRONG |

**Why:** Reduced motion, high contrast, bindings, Esc/Leave on signature overlays — trust + UX multipliers. Learning profiles as a11y not progression (`COMPLEXITY_CUT` #15). Does not create financial decisions (N/A).

### U. XP / skillStats (hidden)

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| DAMAGE | DAMAGE | WEAK | DAMAGE | WEAK | DAMAGE | OK* | DAMAGE |

\*Hidden chrome improves surface UX (`hideIslandsXpChrome`, `hideSkillStatsPanel`) while **silent write** still lies to coach/analytics — causality and trust damage.

**Why:** Fake progress / parallel RPG (`skillStats.ts`, FAKE_MECHANICS POINTS + FAKE_PROGRESS). No spend vs pouch/CF. Longevity: meaningless by 20–50h.

### V. Progress gates

| IFD | UC | PA | TL | EM | SD | UX | TR |
|-----|----|----|----|----|----|----|-----|
| OK | OK | OK | WEAK | WEAK | OK | OK | WEAK |

**Why:** Freedom + island locks keep spine coherent. Mixing **sim-honest Freedom** with **quiz mastery count** for Credit (`progressGates.ts`) splits the unlock story — Trust WEAK, TL WEAK (prove via quiz not transfer). Organ/scar gates would score higher.

---

## 3. Cross-damage pairs

Features that are **STRONG** on one dimension while **DAMAGE/WEAK** on another (product of the formula shrinks):

| Feature | Strong on | Hurts | Mechanism |
|---------|-----------|-------|-----------|
| **Mastery quizzes** | Team “proof” / gate clarity | IFD · PA · TL · EM · player TR | MCQ boss after kinesthetic clear; Credit unlock count |
| **Daily Ritual** | Habit chrome / return reminder | IFD · TL · EM · TR · day-2 craft | Streak checklist vs Soft Beat cinema |
| **XP / skillStats** | Coach inputs / RPG feel (internal) | UC · TL · SD · TR | Silent meters; parallel to organs/CF |
| **Adaptive coach** | Soft-lock UX | PA · TL | Over-hint + skillStat focus |
| **Party board** | IFD (deals) | TR · EM | Stars/seal naming; isolated from Take myth if early |
| **Cove Take forks** | EM · PA · UC (plaque) | Campaign IFD | Same unlock either fork — memory-only consequence |
| **Freedom Seal (late)** | IFD · UC early | EM / longevity goals | Sticky solved meter → vanity chase |
| **Digression shelf** | Curiosity / agency to wander | TL · freeze psychology | Fill-% + era slots as collection |
| **Carpet vanity unlocks** | UX fantasy travel | IFD · longevity TR | Pouch grind thresholds |
| **Piggy tip curriculum** | UC of next verb | TL (if maps Paycheck) | Bag solving transfer surface |
| **Credit Ordeal + quiz gate** | IFD/EM inside chapter | UX · TR of unlock | Ordeal earned *and* quiz homework |
| **Outfitter** (if power-fiction) | EM expression | TR | Cosmetic sold as strength |

**Product rule:** never “fix” Trust via quizzes or Ritual streaks if the fix trashes Transferable Learning or Interesting Decisions. Prefer proving literacy with **Takes · Soft Beat forks · weather reads · deal tradeoffs · Independent Transfer**.

---

## 4. Prioritized design backlog (recommendations only)

Respect freeze: **no new main-course islands**, **no fake multiplayer**, deepen Cove → Paycheck → Credit + Harbor memory. Raising one dim must not trash another.

### P0 — protect the product of the formula

1. **Replace mastery quizzes as spine / Credit gates**  
   Prove concepts via Soft Beat fork vista, deal/weather read, or transfer surface. Optional digression quiz only — never Freedom/Credit lock.  
   *Lifts:* IFD · PA · TL · EM · player TR · UX. *Protects:* Trust of “Capital is a world.”  
   *Refs:* FAKE_MECHANICS BLOCKER · `progressGates` · `masteryGate.ts`.

2. **Kill or fully bury Ritual streak-as-progress**  
   Day-2 scar echo + Soft Beat remain the return mastery beat; Ritual never auto-opens over spectacle. Prefer cut streak/% chrome; keep optional quiet calendar if needed without coins-as-login.  
   *Lifts:* EM · TL · TR. *Protects:* signature loop.  
   *Refs:* `COMPLEXITY_CUT` #14 · `LONGEVITY` · FAKE STREAK.

3. **Stop writing / coaching on skillStats + Islands XP**  
   Coach = fail counts + CF (+ scars) only. Delete or analytics-only skillStats. Keep hide flags until cut.  
   *Lifts:* UC · SD · TR. *Does not trash:* organs / CF.  
   *Refs:* `designBible` hides · `adaptiveCoach.ts` · FAKE_PROGRESS.

4. **Teach weather × CF as readable mastery (Piggy names the loop)**  
   Surface `feedbackLoopLine` / storm causes without a quiz.  
   *Lifts:* UC · TL · IFD (when to spend). *Protects:* existing `harborWeather` depth.  
   *Refs:* `LONGEVITY` mastery proposals.

5. **Paycheck transfer hygiene**  
   Keep Bag/Piggy from mapping Cove → Vee; protect Independent Transfer Rate as ship gate.  
   *Lifts:* TL · PA. *Protects:* FTUE north star.

### P1 — deepen interactions without width

6. **Soft Beat fork vistas keyed to scar** — same pad, different moral weather.  
7. **Take → ledger residue** (spender/haste footprints that alter Soft Beat / Pay Day / weather). Same unlock graph OK if world diverges.  
8. **Liability land = borrow / buyout / walk** on party board; regenerate deal tradeoffs after catalog clear (**not** higher prices).  
9. **Unify Freedom unlock story** — Credit opens on Freedom + organ Soft Beats / transfer proofs, not quiz count.  
10. **Share card variants from live weather + scar**; Family **Share Witness** + **Family Challenge** as default local social (already modeled in `familyRoom.ts`).  
11. **Rename/demote Board Stars** everywhere players see progress language; board discoverable post-Freedom or post–first Change.  
12. **Digression shelf = myth lines, not fill-%**; freeze-focus spine pairs in first chrome; era slots stay outer curiosity.

### P2 — polish / longevity without grind

13. Soft Beat **arms next Pay Day** with tiny bias (peek → consequence).  
14. Emergent archetype naming from Piggy/weather/Plinth (Saver · Hasteheart · Stormdock) — earned titles, not XP ranks.  
15. Voyage Log of **detected chains** (binge → streak break → storm), not quest checklist.  
16. Carpet vanity: treat as expression faucet only — never longevity goal.  
17. Companions: keep cosmetic; never gate CF.  
18. Settings a11y: maintain Esc/Leave / reduce-motion / contrast as **quality multipliers** on every new cinema beat.

### Explicit non-goals (formula poison)

- New main-course islands / map widen  
- Fake online multiplayer / leaderboards  
- Daily login chests, gem currency, battle pass  
- Second Harbor weather (boom/recession Pay Day fiction)  
- More quiz gates to “raise Trust”  
- Grind XP sinks for 100h retention (`LONGEVITY_100H` law)

---

## 5. Snapshot: formula health by dimension

| Dimension | Spine health | Biggest drag | Biggest lift lever |
|-----------|--------------|--------------|--------------------|
| Interesting financial decisions | Strong on Takes / ledger / deals | Quizzes · Ritual · empty deal pool | Soft Beat/ledger residue · liability forks |
| Understandable causality | Strong on Take→scar→weather | Silent skillStats · quiz unlock myth | Piggy weather literacy · one unlock language |
| Player agency | Strong on plaza + forks | Coach over-hint · quiz forced | Transfer hygiene · optional quizzes only |
| Transferable learning | Strong Paycheck design | Mastery MCQ · Ritual · Bag spoilers | ITR as ship KPI · Soft Beat transfer |
| Emotional meaning | Strong signature loop | Ritual / quiz homework | Fork vistas · Family witness · share variants |
| System depth | Strong structures + CF×weather | Parallel meters · solved Freedom | Combinatorics (`LONGEVITY` engine) |
| Frictionless UX | Strong Esc/a11y/carpet rail | Quiz walls · Ritual auto chrome | Cut extrinsic gates |
| Trust | Strong local Family + sim CF | Quiz-as-learning · silent XP · seal naming | Honest meters only |

**Verdict:** Capital’s iconic spine already multiplies **emotional meaning × causality × (real) agency**. The product of the formula is most hurt by **extrinsic proof systems** (mastery quizzes, ritual streaks, silent RPG stats) stacked on top of an otherwise honest money world. Deepen Cove→Paycheck→Credit interactions; do not widen the map.
