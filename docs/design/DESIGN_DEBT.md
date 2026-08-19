# Capital Design Debt Register

**Date:** 2026-08-19  
**Snapshot:** `main` @ `a6dcc204`  
**Companion:** [CAPITAL_MASTER_AUDIT.md](./CAPITAL_MASTER_AUDIT.md) · [CURRENT_SYSTEM_MAP.mmd](./CURRENT_SYSTEM_MAP.mmd)

This register tracks **design debt** — gaps between intended player experience (Design Bible + iconic freeze) and what the repository actually ships or validates. It is not a bug list; it is a prioritization ledger for craft decisions.

**Severity:** 🔴 P0 (blocks iconic ship truth) · 🟠 P1 (degrades loop quality) · 🟡 P2 (longevity / scale / later gates)

---

## How debt is classified

| Tag | Meaning |
|-----|---------|
| **Honest gap** | System missing or unvalidated; not pretending to exist |
| **Parallel language** | Two systems express the same progression differently |
| **Surface debt** | Code works; player-facing clarity or emotional landing weak |
| **Schema debt** | Dead or write-only fields add maintenance cost |
| **Measurement debt** | Infrastructure exists; human/cohort validation missing |
| **Scope creep risk** | Feature threatens iconic freeze if surfaced early |

---

## P0 — Ship truth debt

### DD-P0-01 · Human playtest gate not executed

| Field | Value |
|-------|-------|
| **Severity** | 🔴 P0 |
| **Type** | Measurement debt |
| **Classification** | MISSING → IMPROVE |
| **FACTS** | Pattern #94 status PENDING in `docs/pattern-human-playtest.md`. Observer script exists: `docs/playtest/COLD_SESSION_OBSERVER_SCRIPT.md`. Production checklist: `docs/playtest/PRODUCTION_SHIP_CHECKLIST.md`. |
| **INFERENCE** | Machine tests (642 pass) cannot validate Independent Transfer Rate, emotional landing of signature loop, or first-hour confusion. |
| **RECOMMENDATION** | Run cold session with observer script; log six iconic questions from `docs/iconic-path.md`. Do not block code merge on this, but do not claim "ship" without it. |

---

### DD-P0-02 · Independent Transfer Rate unmeasured in humans

| Field | Value |
|-------|-------|
| **Severity** | 🔴 P0 |
| **Type** | Measurement debt |
| **Classification** | MISSING → IMPROVE |
| **FACTS** | King KPI defined in `docs/ftue/NORTH_STAR.md`. Local telemetry + health dashboard exist (`analytics/ftue/`, `healthDashboard.ts`). Remote cohort deferred in `docs/design/CONSTRAINT_PLAY_TRUTH.md`. |
| **INFERENCE** | Code can emit `transfer_success` / `transfer_failure` events; no recruited cohort has been analyzed. |
| **RECOMMENDATION** | Minimum viable: n=5–10 local sessions with transfer task observation + event export. Target: Paycheck stall after Cove Take without answer leakage. |

---

### DD-P0-03 · Post-Cove side shore discovery unverified (production locks)

| Field | Value |
|-------|-------|
| **Severity** | 🔴 P0 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | `isIslandProgressLocked()` unlocks side shores after Paycheck Change. `TravelMapView` shows spine strip when `PLAYTEST_UNLOCK_ALL_ISLANDS = false`; full archipelago when true. Lock hint: *"Finish Paycheck Change — then outer-ring shores open"*. |
| **INFERENCE** | Players may not discover outer ring without map UX pass; code gate ≠ felt unlock. |
| **RECOMMENDATION** | Cold playtest: after Paycheck Change, can player find one side shore without Coin Bag spoiling? |

---

### DD-P0-04 · Freedom Seal vs endgame messaging ambiguity

| Field | Value |
|-------|-------|
| **Severity** | 🔴 P0 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | `MAIN_COURSE` step 4 = Freedom Seal (Harbor); step 5 = Credit Ordeal. `bossUnlockProgress` requires Freedom + Paycheck Change for Credit. Freedom = 3× PayDay @ $30+/mo CF. |
| **INFERENCE** | Players may treat Freedom as "won the game" and miss Credit spiral; or treat Credit as blocked unfairly if Freedom messaging unclear. |
| **RECOMMENDATION** | Piggy homecoming + map copy: Freedom = escape paycheck-to-paycheck; Credit = new organ ordeal. Audit all "seal" strings. |

---

### DD-P0-05 · First-hour coach multiplicity regression risk

| Field | Value |
|-------|-------|
| **Severity** | 🔴 P0 |
| **Type** | Scope creep risk |
| **Classification** | SIMPLIFY |
| **FACTS** | Complexity Cut mandates one coach (Ashore + Piggy `meet_guide`). Outfitter/Capsule/Ritual demoted to discoveries (`docs/COMPLEXITY_CUT_REVIEW.md`). Harbor content rewrite added areas/market/pavilion. |
| **INFERENCE** | Content expansion can re-introduce parallel guidance if not regression-tested cold. |
| **RECOMMENDATION** | Iconic checklist step "No coach ahead" + cold boot on slow device after every Harbor content change. |

---

## P1 — Loop quality debt

### DD-P1-01 · Macro economy causality invisible to players

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Surface debt |
| **Classification** | CONNECT · IMPROVE |
| **FACTS** | `economy.ts` advances phases; modifiers affect event weights. `EconomyWeatherIndicator` demoted on Harbor per Design Bible. `harborWeather.ts` ties CF to sky. `feedbackLoopLine` in spine footprints. |
| **INFERENCE** | Systemic depth exists; player may not connect Take → weather → shop prices. |
| **RECOMMENDATION** | One organ-true causal line per spine Take in Piggy or Coin Bag; avoid dashboard widget. |

---

### DD-P1-02 · Dual quest paradigms in monorepo

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Parallel language |
| **Classification** | SIMPLIFY · REMOVE |
| **FACTS** | Canonical: `IslandSaveV1.questStatus` + JSON island quests. Parallel: `src/utils/questSystem.ts` FinanceQuest tiers. |
| **INFERENCE** | Contributors may wire features to wrong quest system. |
| **RECOMMENDATION** | Document deprecation in Design Bible; gate legacy dashboard off product path (partially done in constraint-play branch). |

---

### DD-P1-03 · Dual currency HUD confusion (pouch vs ledger)

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Parallel language |
| **Classification** | SIMPLIFY |
| **FACTS** | `WealthHud` (pouch) + `VoyagerLedgerHud` (monthly CF) both visible post-Cove. Design Bible: ledger is north star after Change. |
| **INFERENCE** | Pre-Cove pouch-first is fine; post-Cove both compete for attention. |
| **RECOMMENDATION** | Progressive disclosure: thin pouch HUD after first Take; ledger chip primary on Harbor return. |

---

### DD-P1-04 · explore vs chapter vs island view redundancy

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Surface debt |
| **Classification** | SIMPLIFY |
| **FACTS** | Resume defaults to `explore`. `chapter` = journal/areas UI. `island` = party board. Comment in `IslandShoreView`: walkable shore first, never auto-launch quiz. |
| **INFERENCE** | `chapter` may be legacy path still reachable; confuses wayfinding if surfaced accidentally. |
| **RECOMMENDATION** | Audit navigation entry points; demote `chapter` to in-shore journal pad only. |

---

### DD-P1-05 · Story voice coherence post content rewrite

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | 12 `story-circle.md` docs filled. Island JSON packs deepened via `scripts/deepen-island-content.py`. Locked scar/quest IDs validated in tests. |
| **INFERENCE** | Structural content complete; NPC voice, Take moment poetry, and organ cold-retell consistency may vary by pack author. |
| **RECOMMENDATION** | Story-of-Capital pass: spine Takes + Piggy lines + side shore cold retells against story bible tone. |

---

### DD-P1-06 · Gameplay ability clarity during play

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | Verbs documented in Design Bible. Input bindings in `defaultBindings.ts`. Coin Bag tips in `coinBagBuddy.ts`. Transfer tasks in `conceptProgression/`. |
| **INFERENCE** | Docs describe verbs; in-session affordance (what can I do *right now*) may lag, especially on side shores and structures. |
| **RECOMMENDATION** | Gameplay ability audit: one visible next verb per screen state without spoiling transfer. |

---

### DD-P1-07 · Side shore craft bar vs Cove depth

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | `islandContentDepth.test.ts` enforces ≥8 minigames, ≥3 quests per non-hub island. Side shores unlocked after Paycheck Change. |
| **INFERENCE** | Machine depth ≠ iconic feel; side shores may read as content packs vs organ-true districts. |
| **RECOMMENDATION** | Per-shore cold retell + one signature side scar pair playtest per `digressionShelf.ts` slots. |

---

### DD-P1-08 · Save schema dead fields

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Schema debt |
| **Classification** | SIMPLIFY · REMOVE |
| **FACTS** | Complexity Cut targets: affinity (no longer written), skillStats (no-op coach), silent XP (`cutIslandsXpAwards`). Still in types/save paths. |
| **INFERENCE** | Dead fields increase sanitize/migrate burden and confuse audits. |
| **RECOMMENDATION** | Schema audit branch: remove write-only fields with migration + test updates. |

---

### DD-P1-09 · Experienced player Ashore re-show

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | `experienced` mode = checkbox on cast select each boot; skips Ashore. `returning` mode = 72h absence → `ReturningPlayerBriefing`. |
| **INFERENCE** | Returning players who don't check experienced repeat Ashore; may feel patronizing. |
| **RECOMMENDATION** | Persist experienced declaration on save after first opt-in; still allow Ashore replay from settings. |

---

### DD-P1-10 · Mastery quiz discoverability vs honesty

| Field | Value |
|-------|-------|
| **Severity** | 🟠 P1 |
| **Type** | Honest gap (partially closed) |
| **Classification** | SIMPLIFY |
| **FACTS** | Credit no longer gated by mastery (`BOSS_MASTERY_REQUIRED = 0`). Optional CTA on cleared play pads. Constraint-play fixed gate lie. |
| **INFERENCE** | Worksheet framing may still feel like "real gate" if CTA copy wrong. |
| **RECOMMENDATION** | Audit all "mastery" / "quiz" strings on spine; ensure optional digression framing. |

---

## P2 — Longevity / scale / later gates

### DD-P2-01 · Remote analytics sink missing

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Measurement debt |
| **Classification** | MISSING |
| **FACTS** | Events stored in Spark KV locally; export via Settings. No server-side aggregation in repo. |
| **RECOMMENDATION** | Add when ITR cohort scale exceeds manual export. |

---

### DD-P2-02 · Economy batch simulation harness missing

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Honest gap |
| **Classification** | MISSING |
| **FACTS** | Design Bible references economy sim framework; no `economy-sim/` runner in repo. Spec: [ECONOMIC_STRESS_TEST_PLAN.md](../qa/ECONOMIC_STRESS_TEST_PLAN.md). Balance validated via unit tests + manual play. |
| **RECOMMENDATION** | Build when balance churn increases or second currency interactions multiply. |

---

### DD-P2-03 · Real-money monetization undefined

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Honest gap |
| **Classification** | MISSING · MOVE_LATER |
| **FACTS** | No Stripe/checkout in repo. Harbor shop uses pouch coins only. ConsentDialog states no real money. |
| **RECOMMENDATION** | Business model decision after iconic + ITR proof; do not implement in iconic phase. |

---

### DD-P2-04 · LLM / neural guide deferred

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Honest gap |
| **Classification** | MOVE_LATER |
| **FACTS** | `adaptiveCoach.ts` explicitly not neural net. `iconicProofLaw.ts` gates "giant sim / AI guide." |
| **RECOMMENDATION** | Do not add until heuristic coach + ITR baseline established. |

---

### DD-P2-05 · Arcade + Studio first-hour magnetism

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Scope creep risk |
| **Classification** | MOVE_LATER · SIMPLIFY |
| **FACTS** | Arcade = spine minigame replay. Studio = VibeCode level authoring. Complexity Cut demotes both from first hour. |
| **RECOMMENDATION** | Hide or soft-lock until post-Cove Change or Freedom; verify Harbor hub doesn't foreground them. |

---

### DD-P2-06 · Screen reader coverage unknown

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Surface debt |
| **Classification** | IMPROVE |
| **FACTS** | Reduced motion + high contrast tested for signature overlays. `FTUE_ACCESSIBILITY_AUDIT.md` exists. 3D views dominate. |
| **RECOMMENDATION** | Dedicated SR pass on Talk Battle, share overlay, settings — after iconic loop validated. |

---

### DD-P2-07 · 100h side shore longevity unproven

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Surface debt |
| **Classification** | IMPROVE · MOVE_LATER |
| **FACTS** | `docs/LONGEVITY_100H.md` defines aspiration. 8 side shores live with depth tests. Digression shelf tracks heard myths. |
| **RECOMMENDATION** | Deepen one side shore to Cove bar per sprint; measure return sessions via local analytics. |

---

### DD-P2-08 · Family Room witness loop underused

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Surface debt |
| **Classification** | KEEP · CONNECT |
| **FACTS** | Local-only; Zod-validated import; witness myth lines name plaques. Kill switch `capital_kill_familyRooms`. |
| **INFERENCE** | Social object defaults to Share PNG; Family Room is opt-in deep feature. |
| **RECOMMENDATION** | Connect witness stamps to share card flow post-iconic; no fake multiplayer backend. |

---

### DD-P2-09 · Market sim ↔ ledger integration partial

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Parallel language |
| **Classification** | CONNECT |
| **FACTS** | `market-sim.ts` is sophisticated GBM sim inside minigames. Ledger holdings updated via board/deals/Takes, not consistently from market games. |
| **RECOMMENDATION** | Connect only where literacy intent requires; avoid sim complexity on spine first hour. |

---

### DD-P2-10 · Content authoring toolchain gap

| Field | Value |
|-------|-------|
| **Severity** | 🟡 P2 |
| **Type** | Honest gap |
| **Classification** | IMPROVE |
| **FACTS** | Island content in JSON packs; deepen script `scripts/deepen-island-content.py`. Story-circle docs separate from JSON. No visual quest editor in repo. |
| **RECOMMENDATION** | Improve idempotent deepen + validation scripts before scaling content team. |

---

## Debt summary by classification

| Classification | Count | Examples |
|----------------|------:|----------|
| KEEP | 12 | Signature loop, ledger, world memory, organs |
| CONNECT | 8 | Take→weather, coach→Coin Bag, market→ledger |
| IMPROVE | 14 | Side shores, story voice, a11y SR, ITR |
| SIMPLIFY | 9 | Dual currencies, coaches, legacy quests, HUD |
| REBUILD | 0 | — |
| REMOVE | 3 | Legacy questSystem, skillStats UI, affinity |
| MOVE_LATER | 6 | Stripe, LLM guide, Arcade/Studio prominence |
| MISSING | 5 | Human playtest, remote telemetry, economy harness, real monetization |

---

## Resolved debt (constraint-play pass — do not regress)

These items were **fixed** in the constraint-play / island rewrite merge. Treat as regression guards:

| Item | Fix location |
|------|--------------|
| Mastery quizzes gate Credit | `progressGates.ts` — `BOSS_MASTERY_REQUIRED = 0` |
| Only Cove bites ledger | `spineTakeFootprints.ts` |
| Deal catalog empty grind | `regenerateAssetDealOffer()` |
| Party stars confuse Freedom | Cashflow Claims rename |
| Digression shelf fill-percent chrome | `digressionShelf.ts` — heard myths only |
| Islands XP on product path | `cutIslandsXpAwards` |
| skillStats coach RPG | `adaptiveCoach.ts` ignores skillStats |
| Bag spoils transfer answers | Credit tip + Piggy homecoming audit |
| Production playtest unlock | `PLAYTEST_UNLOCK_ALL_ISLANDS = false` |

---

## Recommended paydown order

```
P0: Human playtest → ITR log → Freedom messaging → coach regression
P1: Story voice → gameplay ability → Take causal lines → schema cleanup
P2: Remote telemetry → SR audit → side shore longevity → monetization decision
```

**Next action after this audit:** Story of Capital + in-game ability pass (user priority) — grounded in story-circle docs and verb clarity, not new systems.

---

## Prior audit cross-reference

`MASTER_DESIGN_AUDIT.md` (earlier branch audit) remains as a supplementary deep dive. **This register supersedes it** for gate truth post `a6dcc204` — notably Credit unlock no longer requires mastery quizzes (`BOSS_MASTERY_REQUIRED = 0`).

### Additional items from prior audit (still open)

| ID | Severity | Debt | Evidence | Tag |
|----|----------|------|----------|-----|
| DD-P1-11 | 🟠 P1 | Quiet homecoming may strip plaza to Plinth-only; Carpet unavailable until Piggy Talk | `harborAshore.ts` `shouldStripPlazaForPresence`; `HomeHubView.tsx` | IMPROVE |
| DD-P1-12 | 🟠 P1 | Legacy creative/structured modes + `AIChatHelper` coexist with Islands product | `App.tsx` | SIMPLIFY · MOVE_LATER |
| DD-P1-13 | 🟠 P1 | FTUE audit docs describe older chamber flows vs live Ashore teach | `docs/ftue/FTUE_AUDIT.md` vs `AshoreComprehensionTutorial.tsx` | IMPROVE |
| DD-P1-14 | 🟠 P1 | Map can open before Piggy Talk (`piggy_bypassed` recovery path) | `IslandsApp.tsx`; `coinBagBuddy.ts` | IMPROVE |
| DD-P2-11 | 🟡 P2 | Dead code paths: `EconomyWeatherIndicator`, unmounted `WelcomeOnboarding.tsx` | `IslandPlayView.tsx`; `onboardingNoAhead.test.ts` | REMOVE |
| DD-P2-12 | 🟡 P2 | Procedural SFX beeps — craft ceiling vs iconic mute-test law | `capitalSfx.ts` | IMPROVE |
| DD-P2-13 | 🟡 P2 | `DifficultyLevel` wiring to score thresholds not fully traced | `settings.ts` | IMPROVE |

