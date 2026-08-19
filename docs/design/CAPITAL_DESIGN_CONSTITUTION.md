# Capital Design Constitution

**Status:** Non-negotiable principles for product, design, and engineering judgment  
**Mission:** Create an outstanding financial game whose gameplay itself develops better financial reasoning.  
**Architecture:** [CAUSAL_STORY_ARCHITECTURE.md](./CAUSAL_STORY_ARCHITECTURE.md) — simulate causes · display effects · characters give meaning · decisions · time · failure → knowledge → possibilities → lives → stories.  
**Derived from:** [CAPITAL_MASTER_AUDIT.md](./CAPITAL_MASTER_AUDIT.md) · [CAPITAL_DESIGN_BIBLE.md](../CAPITAL_DESIGN_BIBLE.md) · [CONSTRAINT_PLAY_TRUTH.md](./CONSTRAINT_PLAY_TRUTH.md) · [ftue/NORTH_STAR.md](../ftue/NORTH_STAR.md) · iconic freeze  
**Not:** A feature backlog. Principles outlive features. When a proposal conflicts with this constitution, change the proposal — or deliberately amend this document.

**How to use**

1. Read the mission and **Anti-Pillars** first.  
2. Score every proposal against the **18 Principles** below.  
3. Prefer deepening interactions among existing primitives over adding systems.  
4. End with: *Does this help a player reason better about money through play — and remember how the world works?*

**Iconic freeze (always on):** Main quest strip stays **Harbor · Cove → Paycheck → Credit**. Family Room stays **local**. No Nathan Project / BMO / CBE merges. Depth before map width. See [iconic-path.md](../iconic-path.md).

---

## The one-sentence game

> In a world where money is alive, a washed-ashore Voyager learns that fortune is a journey of choices — until they escape paycheck-to-paycheck and return home transformed.

**Craft compression:** *I choose something about money → the living world marks it → Harbor remembers → I face the next living choice.*

**Causal compression:** *Simulate causes → display effects → characters mean → player decides → time consequences → failure knowledge → new possibilities → different lives → stories told.*

See [CAUSAL_STORY_ARCHITECTURE.md](./CAUSAL_STORY_ARCHITECTURE.md).

**Player fantasy:** Economic agency among Money Mascots — curious explorer + careful chooser. Not a student in a classroom. Not a spreadsheet operator.

---

## 18 Non-Negotiable Principles

Each principle states the law, what it means in Capital, repository evidence where it exists, and a **Constitution Test** for feature approval.

---

### 1. Financial literacy is gameplay

**Law:** Money concepts are not content to consume — they are rules the player operates under. Literacy must be expressed as situations, constraints, forks, and simulated outcomes inside the world.

**In Capital:** Takes change ledger holdings. Pay Day and bills run through `voyagerLedger.ts`. Credit is Inbox → Score Scanner → earned wait/haste Take — not a worksheet gate. Constraint-play law: *"Decision-making under constraints; literacy is gameplay — not quizzes."* (`docs/design/CONSTRAINT_PLAY_TRUTH.md`)

**Repository anchors:** `chapterLoop.ts` · `spineTakeFootprints.ts` · `creditEncounter.ts` · minigames as skill pads, not primary literacy delivery

**Constitution Test:** Could this beat teach the same concept if you removed all explanatory text and kept only the world reaction?

---

### 2. The fantasy is economic agency, not education

**Law:** The player is a **Voyager** exercising judgment in a living economy — not a pupil completing modules. Education is an outcome of agency, never the frame.

**In Capital:** Product world = **Fortune Archipelago**. Feel target: *"curious explorer + careful chooser — not a spreadsheet operator, not a combat god."* (`docs/CAPITAL_DESIGN_BIBLE.md`) FTUE north star measures **Independent Transfer Rate**, not course completion (`docs/ftue/NORTH_STAR.md`).

**Repository anchors:** `moneyCast.ts` · organ suit verbs · Talk Battle as commitment surface, not lecture modal · `playerOnboarding/` modes reduce scaffolding, not identity

**Constitution Test:** Would a player describe this moment as *"I decided something about money"* — not *"I finished a lesson"*?

---

### 3. Trade-offs over obvious answers

**Law:** Every meaningful fork must cost something. If one branch is clearly optimal with no situational nuance, it is not a Capital decision — it is a chore.

**In Capital:** Cove jar vs treat. Paycheck umbrella vs glitter stall (no Cove mapping). Credit wait vs haste. Board deals vs liabilities with Borrow / Buyout / Walk choice. Deal catalog renewed via `regenerateAssetDealOffer()` so empty grind cannot substitute for judgment.

**Repository anchors:** `DialogueEffect` irreversible Takes · `HARBOR_DEALS` · `spineTakeFootprints.ts` stance-divergent holdings

**Constitution Test:** Would a thoughtful player pause? Can you name what each branch gives up?

---

### 4. Decisions must produce consequences

**Law:** A choice that does not change simulation state, NPC behavior, available options, or world presentation is not a decision — it is theater.

**In Capital:** `setIrreversible` writes `irreversibleChoices` and ledger footprints. `addScar` updates `harborScars`, stance axes, and may trigger `chapterQuietPending`. Paycheck/Credit Takes now bite the ledger like Cove (`spineTakeFootprints.ts`). CF → weather → shop prices diverge by stance (`harborWeather.ts`).

**Repository anchors:** `IslandsApp.applyDialogueEffects` · `worldMemory.ts` · `harborHomecoming` ceremony chain

**Constitution Test:** What variable in save state changed? What can the player do now that they could not before — or vice versa?

---

### 5. Consequences must persist

**Law:** The world must remember. Session boundaries, returns, and day-2 beats exist so judgment accumulates into identity — not reset into a clean slate.

**In Capital:** **Harbor remembers.** Scars cap at 24 but persist across saves. Plinth glow, cold retell, day-2 echo, plaza gossip, and Piggy homecoming all read from `harborScars` and `irreversibleChoices`. Concept phases persist in `conceptProgress`. Freedom Seal and ledger holdings survive travel.

**Repository anchors:** `worldMemory.ts` · `digressionShelf.ts` · `Day2EchoOverlay` · `coldRetellLine()` · dual-write save (`save.ts`)

**Constitution Test:** If the player returns tomorrow, can Harbor name what they did without opening a recap menu?

---

### 6. Failure must generate information

**Law:** A miss must teach — never shame. Failure is a signal about constraints, timing, or trade-offs the player had not yet modeled.

**In Capital:** `MinigameFailOverlay`: dignity + Retry / stay-put; structure fails do not dump to Harbor. Escalating hints via `onboardingFailureAssist`. Quest fail attempts feed coach pressure, not RPG stats. Analytics events: `fail_reason`, `retry_started`, `retry_successful`.

**Repository anchors:** `docs/player-fantasy-and-loop.md` Pillar 3 · `adaptiveCoach.ts` (fail pressure capped) · `docs/ftue/FAILURE_RECOVERY.md`

**Constitution Test:** After a fail, is the next verb clearer than before — without moralizing language?

---

### 7. Few systems should create many combinations

**Law:** Depth comes from interactions among a small set of living primitives — not from parallel progression languages (XP, affinity, skill bars, dual weather fictions, quiz ladders).

**In Capital:** Core primitives: **Walk · Talk · Take · Soft Beat · Pay Day · Carpet · Structure · Scar / Plinth · Share**. Complexity Cut targets write-only meters and demoted chrome. Design Bible: *"Fewer systems, richer interactions."*

**Repository anchors:** `mainCourse.ts` · `partyPlayStyle.ts` kinesthetic-first · `COMPLEXITY_CUT_REVIEW.md` · `cutIslandsXpAwards` · coach ignores `skillStats`

**Constitution Test:** Can you name the primitive? If you need a new meter, you probably need a better interaction between existing ones.

---

### 8. Characters create human stakes

**Law:** Money is abstract until a character bears the weight of the choice. Mascots embody economic temperaments; relationships are felt through talk, memory, and return — not affinity percentages.

**In Capital:** **Piggy Penny** is Harbor Keeper — primary emotional anchor. 30+ Money Mascots with persona kits (`npcPersonas.ts`). Talk memory: counts + last choice IDs, not romance trees. `piggyBondHomecomings` tracks celebrated returns. Credit **Debt Collector Rex** is spiral organ villain, not a boss HP sponge.

**Repository anchors:** `harborTalks.ts` · `moneyCast.ts` · `creditEncounter.ts` · `NpcBrainViews.tsx` scar-echo lines

**Constitution Test:** Does a character's line change because of what the player did — not because a quest flag fired generically?

---

### 9. Authored emotional storytelling coexists with systemic freedom

**Law:** Capital ships authored Story Circle beats (Take → hush → spectacle → share → homecoming → day-2) **and** systemic replay (ledger, weather, board, side shores). Cinema delivers emotional peak; systems deliver living aftermath.

**In Capital:** Signature loop is authored and gated (`signatureCinemaGate.ts`). Within it, player stance, holdings, and scar history personalize Piggy lines, cold retell, and shop prices. Story Bible Harmon beats align with `mainCourse.ts` steps — not cutscene railroading outside Takes.

**Repository anchors:** `docs/story-bible.md` · `HomeHubView.tsx` cinema chain · `buildCoveChangeReplayTimeline()` for audit/replay

**Constitution Test:** Does the authored beat leave room for systemic variation on return — or does it reset the world to a single outcome?

---

### 10. Curiosity is preferable to checklist exploration

**Law:** Secrets emerge from rules (Takes, Soft Beats, weather, ledger, Family Room myth) — not from completion percentages, empty-slot checklists, or icon-filled chore maps.

**In Capital:** Digression shelf shows **heard myths only** — no X/Y fill (`digressionShelf.ts`). Soft Beats invite peeking; they do not demand bingo. Side tomfoolery entries in `SIDE_TOMFOOLERY` use `done: () => false` — optional, never homework. Coin Bag prefers Main Quest but must not spoil transfer tasks.

**Repository anchors:** `docs/CAPITAL_DESIGN_BIBLE.md` anti-pillar on secret % meters · `coinBagBuddy.ts` · `docs/puzzle-explorable-craft.md`

**Constitution Test:** Would a curious player discover this without a UI checklist — and would a completionist grind add judgment depth?

---

### 11. Progression expands possibilities

**Law:** Progress must unlock new verbs, places, deals, and constraints — not merely bigger numbers on the same action.

**In Capital:** Cove Change → side shores + Paycheck painting. Paycheck Change → Credit unlock (with Freedom). Freedom Seal → Pavilion, carpet tier floor, harder CF chase. `MAIN_COURSE` five steps expand the triangle — not an XP ladder.

**Repository anchors:** `progressGates.ts` · `nextPaintingAfterScar()` · `PLAZA_ROOMS` · `bossUnlockProgress`

**Constitution Test:** What new **kind** of decision becomes available — not just a higher score threshold?

---

### 12. Knowledge itself can be progression

**Law:** Understanding is a durable unlock. Concept phases (LOCKED → … → MASTERED / INDEPENDENT) are progression — not cosmetic badges.

**In Capital:** `conceptProgression/` registers: `money_is_alive`, `earn_then_decide`, `save_vs_spend`, `irreversible_take`, `harbor_scar_memory`, `cashflow`, `interest_compounds`. Transfer tasks gate INDEPENDENT phase. Paycheck unlock in `bossUnlockProgress` explicitly ties to **Independent Transfer surface passed**.

**Repository anchors:** `conceptProgression/engine.ts` · `transferTasks.ts` · `reconcileFtueQuestProofs` · analytics `concept_transfer`

**Constitution Test:** Does this change what the game assumes the player can reason about without hints?

---

### 13. The world communicates economic state

**Law:** The player should read fortune from the place — sky, weather, organ motifs, shop prices, Pay Day cadence — before reading a dashboard.

**In Capital:** Post-Cove, **Voyager Ledger** is north-star HUD (`VoyagerLedgerHud`). Harbor sky reacts to cashflow (`harborWeather.ts`). Organ floor motifs in Money Structures. Take hush dims landmarks. `feedbackLoopLine` names Take→sky loops. Macro `economy.ts` may tint events but must not create a second Harbor truth (Complexity Cut).

**Repository anchors:** `moneyOrgans.ts` · `MoneyStructureInteriorView.tsx` · `TakeHushOverlay` · `freedomPlazaChip()`

**Constitution Test:** Can a player answer *"how am I doing with money?"* from the world view alone — without opening a stats panel?

---

### 14. AI never owns simulation truth

**Law:** Heuristics may nudge, summarize, or prioritize tips. **No model** generates ledger outcomes, scar truth, quest completion, prices, or Takes. Simulation truth is authored + deterministic + auditable.

**In Capital:** `adaptiveCoach.ts` header: *"Not a neural net — honest heuristics."* Coach inputs: fail pressure, cashflow, idle time, learning profile — explicitly **not** `skillStats`. `iconicProofLaw.ts` gates giant sim / AI guide. Family Room is local JSON — no fake server intelligence.

**Repository anchors:** `worldDirector.ts` · `worldBlackboard.ts` · `familyRoom.ts` · no LLM inference in Islands product path · [AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md) · [AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md)

**Constitution Test:** If the coach were removed entirely, would money outcomes be identical? (Must be yes.)

---

### 15. Learning must transfer to new situations

**Law:** After Capital teaches a principle once, the player must reason with it in a **substantially different** context **without being told what to do**. Tutorial completion is diagnostic only.

**In Capital:** **Independent Transfer Rate** is king KPI (`docs/ftue/NORTH_STAR.md`). Paycheck stall deliberately avoids Cove mapping and *"this is the Take"* framing. Credit spiral is new organ — no umbrella mapping. Events: `transfer_started`, `transfer_success`, `transfer_failure`. Piggy homecoming must not spoil transfer answers (constraint-play fix).

**Repository anchors:** `analytics/ftue/` · `stampIndependentTransferWindows` · `conceptProgression/transferTasks.ts`

**Constitution Test:** Does this raise (or protect) transfer — or only completion / recall of instructions?

---

### 16. Accessibility does not require reduced strategic depth

**Law:** Accommodations change presentation, timing, and input — not the existence of real trade-offs. Reduced motion, readable text, mute-test cinema, and Esc/Leave are floors — not excuses to simplify decisions.

**In Capital:** Settings: `textSize`, `reducedMotion`, `highContrast`, `guideArrows`. `a11yMotion.ts`: `cinemaFlashAmp()` → 0 under reduce; signature beats still **read** at volume 0 (iconic checklist). 3D shore failsafe → flat hotspot fallback without removing Take consequences. Learning profile adjusts hint frequency — not quest difficulty truth.

**Repository anchors:** `settings.ts` · `a11yFailsafeCraft.test.ts` · `docs/ftue/FTUE_ACCESSIBILITY_AUDIT.md` · iconic-path mute-test row

**Constitution Test:** Can someone complete the signature loop with reduced motion and volume 0 while still facing the same irreversible fork?

---

### 17. Monetization must preserve trust

**Law:** Real money must never purchase judgment outcomes, Freedom, scars, transfer success, or Ordeal completion. In-world economy uses pouch coins only; practice data is honest.

**In Capital:** No Stripe/checkout in repository. `harborShop.ts`: capsules, companions, plaza pass, carpet polish — scaled by CF-reactive weather, not USD. `ConsentDialog`: *"No real money is involved."* Health dashboard BUSINESS category: in-game pouch coins only. Design Bible: no pay-to-win.

**Repository anchors:** `SecureFooter.tsx` · `harbor_purchase` analytics · `hasHarborFreedom()` never purchasable

**Constitution Test:** Can every learning-critical beat and Freedom Seal be earned without spending real money?

---

### 18. World breadth must be earned through proven depth

**Law:** New geography, side systems, and content rings unlock only after the player has demonstrated judgment on the existing strip — never as width substituting for depth.

**In Capital:** Iconic freeze: main strip **Harbor · Cove · Paycheck · Credit** only. Eight era side shores soft-locked until **Cove Change** (`isSideShoreTravelId` + `progressGates.ts`). Credit locked until Freedom + Paycheck Change. Money Structure interiors are the preferred deepening vector — not new main-course chips. `PLAYTEST_UNLOCK_ALL_ISLANDS = false` in production.

**Repository anchors:** `iconicScopeFreeze.ts` · `.cursor/rules/iconic-freeze.mdc` · `islandContentDepth.test.ts` · `docs/LONGEVITY_100H.md`

**Constitution Test:** Does this add a new **decision quality** on the proven strip — or only a new pin before the last Take landed?

---

## Anti-Pillars

**Capital is NOT any of the following.** If a proposal pushes toward these shapes, reject or redesign before implementation.

| Anti-pillar | What it looks like | Why it violates the constitution |
|-------------|-------------------|-----------------------------------|
| **A quiz app** | Mastery quizzes, worksheet pads, or scan-and-score loops as the primary verb | Literacy must live in Takes, CF, and Harbor memory — not answer keys (Principles 1, 2, 15) |
| **A spreadsheet with avatars** | Ledger dashboard as hero chrome before Change; grid-operating fantasy | Economic agency is felt in weather, Pay Day, and Freedom — not cell editing (Principles 2, 13) |
| **A casino** | Random-pay dopamine, loot boxes, variance-without-judgment | Trade-offs must be readable; no loot replacing decisions (Principles 3, 4) |
| **A lecture platform** | Tip walls, genre HUD syllabi, talk-NPC curriculum, explainer modals | Situation → choice → consequence → understanding — not slides (Principles 1, 2) |
| **An icon-filled chore map** | Completion percentages, empty-slot digression checklists, fetch quest chains | Curiosity over checklists (Principle 10) |
| **A generic AI chatbot** | LLM tutor cosplay, open-ended finance Q&A replacing authored Takes | AI never owns simulation truth (Principle 14) |
| **A giant shallow open world** | Map width before Take depth; side shores as content packs without organ truth | Breadth earned through proven depth (Principle 18) |
| **A pay-to-win game** | Real-money gates on Freedom, scars, transfer, or Ordeal outcomes | Monetization preserves trust (Principle 17) |
| **A net-worth leaderboard simulator** | Global rankings, vanity wealth comparison, pouch hoarding as win condition | One money truth: monthly CF + Memory scars — not scoreboard status (Principles 7, 13) |
| **An infinite procedural quest generator** | Endless fetch without scar/plinth consequence; procedural breadth without authorship | Authored emotional peaks + persistent memory (Principles 5, 9) |

### Additional anti-shapes (repository-enforced)

These appear in Design Bible and audit regression guards — treat as the same class of rejection:

| Anti-shape | Evidence |
|------------|----------|
| Combat RPG with coin skins | HP duel chrome removed from Talk Battle |
| Fake multiplayer / global leaderboards | Family Room local-only freeze |
| Dual Harbor weather fictions | `economy.ts` boom/recession vs CF sky — demote or scope |
| XP / stance / affinity progress languages | Complexity Cut; silent XP cut; affinity no longer written |
| Settings void behind Talk | Sterile onboarding chrome fails fantasy |
| Shame pedagogy | Failures inform; they do not moralize poverty or spending |
| Engagement dark patterns | Undismissable overlays, streak guilt, soft-locks without Leave |

---

## Constitution gate (feature approval)

Before shipping on the spine, a change must clear **all** of:

- [ ] **Principle 1** — Literacy expressed as gameplay, not content consumption  
- [ ] **Principle 2** — Frames economic agency, not education  
- [ ] **Principle 3** — Presents real trade-offs  
- [ ] **Principle 4** — Produces simulation consequences  
- [ ] **Principle 5** — Persists in save / Harbor memory  
- [ ] **Principle 6** — Failures generate information, not shame  
- [ ] **Principle 7** — Uses or justifies interaction among existing primitives  
- [ ] **Principle 8** — Characters bear human stakes where applicable  
- [ ] **Principle 9** — Authored beats coexist with systemic variation  
- [ ] **Principle 10** — Rewards curiosity, not checklist completion  
- [ ] **Principle 11** — Expands possibilities, not just numbers  
- [ ] **Principle 12** — Treats knowledge as progression where relevant  
- [ ] **Principle 13** — World-readable economic state (organ + verb on spine)  
- [ ] **Principle 14** — Does not delegate simulation truth to AI  
- [ ] **Principle 15** — Protects or raises Independent Transfer  
- [ ] **Principle 16** — Meets accessibility floor without gutting depth  
- [ ] **Principle 17** — Preserves monetization trust  
- [ ] **Principle 18** — Respects depth-before-width freeze  
- [ ] **Anti-Pillars** — Matches none of the ten rejected shapes  

**Rule:** If more than two principles fail — **do not ship**; deepen an existing interaction instead.

**Final question:** *Does this help Capital generate a more interesting player story — one the player can retell in one kid sentence?*

---

## Relationship to other canon

| Document | Role |
|----------|------|
| **This constitution** | Non-negotiable principles + anti-pillars |
| [CAPITAL_DESIGN_BIBLE.md](../CAPITAL_DESIGN_BIBLE.md) | Living fantasy, loop, economy, social detail |
| [CAPITAL_MASTER_AUDIT.md](./CAPITAL_MASTER_AUDIT.md) | Evidence snapshot of shipped systems @ `a6dcc204` |
| [DESIGN_DEBT.md](./DESIGN_DEBT.md) | Known violations / tensions to clear |
| [iconic-path.md](../iconic-path.md) | Freeze + cold playtest checklist |
| [ftue/NORTH_STAR.md](../ftue/NORTH_STAR.md) | Independent Transfer king KPI |
| [CONSTRAINT_PLAY_TRUTH.md](./CONSTRAINT_PLAY_TRUTH.md) | Honest gameplay laws + regression guards |
| [CAUSAL_STORY_ARCHITECTURE.md](./CAUSAL_STORY_ARCHITECTURE.md) | Nine-link causal story law + financial-model-as-machinery breakthrough |
| [AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md) | Productive-struggle guide system + truth hierarchy |
| [AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md) | Allow/deny law + LLM PromptPack contract |

**Conflict resolution:** **This constitution + iconic freeze** win until deliberately amended in a docs PR.

---

## Amendment rule

Amend this file when product truth changes. Cite which principle moved, what repository evidence changed, and why. Do not silently invent parallel laws in feature pitches or branch READMEs.

**Audit maintenance:** Re-read this constitution when signature loop order, Credit/Freedom gates, FTUE boot path, or real-money billing changes. Update [DESIGN_DEBT.md](./DESIGN_DEBT.md) in the same PR.
