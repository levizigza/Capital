# Capital — Master Design Audit

**Role:** Principal game / systems / UX / learning / architecture audit  
**Mission goal:** *Create an outstanding financial game whose gameplay itself develops better financial reasoning.*  
**Scope:** Repository as of branch base **`main`** (live GitHub Pages).  
**Method:** Reconstruct from `src/` + canon docs. **Do not invent.** Mark **UNKNOWN** when unverified.  
**Constraint:** This audit **does not modify production code**.

**Canon anchors:** `docs/CAPITAL_DESIGN_BIBLE.md` · `docs/iconic-path.md` · `docs/player-fantasy-and-loop.md` · `docs/ftue/NORTH_STAR.md` · `docs/COMPLEXITY_CUT_REVIEW.md`

**Learning king KPI (docs + local telemetry):** Independent Transfer Rate — players reason with a taught principle in a new situation without being told what to do (`docs/ftue/NORTH_STAR.md`). Tutorial completion is diagnostic only.

**Open PR note (not on `main`):** `cursor/harbor-friction-clear-2fc5` proposes quieter homecoming carpet + Credit after Paycheck Change. **This audit scores shipped `main`**, not that PR.

---

## Executive verdict

Capital already has a **signature money loop** with real causality (Take → scar → Harbor remembers → Piggy names it) and a **cashflow ledger** that can teach “fortune is monthly leftovers,” not pouch vanity. The biggest risks to the mission goal are:

1. **Parallel languages** (XP, skillStats, stance counters, boom/recession `economy.ts` vs Harbor CF weather) that dilute “one money conversation.”
2. **Credit unlock** (Freedom Seal + 3 mastery quizzes) that may feel like a **quiz wall** rather than a spine organ beat.
3. **Quiet-homecoming plaza strip** on `main` (Plinth-only) that can soft-lock travel until Piggy Talk — navigability vs presence tension.
4. **Legacy App shell** (creative/structured modes, `AIChatHelper`, archetype quiz) still in tree beside Islands product.
5. **ITR** is instrumented locally; **live product ITR / remote analytics** are **UNKNOWN / MISSING**.

**Strategic recommendation:** Deepen interactions among Take · CF · Soft Beat · Plinth · transfer tasks. Do **not** widen the map. Cut or hide write-only meters. Protect Independent Transfer over tutorial completion.

---

## Classification legend

| Tag | Meaning |
|-----|---------|
| **KEEP** | Protect; central to fantasy or learning |
| **IMPROVE** | Keep intent; fix clarity, causality, or craft |
| **SIMPLIFY** | Same job with fewer surfaces / languages |
| **CONNECT** | Wire existing systems so consequences compound |
| **MOVE LATER** | Valid idea; outside iconic freeze / first Change |
| **REMOVE** | Dead, misleading, or fights the mission |
| **MISSING** | Needed for the goal; not present |

Eval axes (each system): interesting decisions · understandable causality · agency · mastery depth · **transfer of financial learning** · emotional meaning · UX friction · accessibility · performance · maintenance complexity.

---

## 1. Core gameplay loop

### Reconstruction (exists)

Signature loop (bible + iconic-path + code):

1. Irreversible **Take** on Cove / Paycheck / Credit (`setIrreversible` + `addScar` in `IslandsApp.tsx`)
2. Shore **hush** cinema (`TakeHushOverlay.tsx`) → Carpet home
3. Harbor **scar spectacle** (`ScarSpectacleOverlay.tsx`) gated by `signatureCinemaGate.ts`
4. **Plinth** glow + **share** PNG (`HarborFeltShareOverlay.tsx` / `weeklyShareCard.ts`)
5. Quiet plaza → **Piggy** homecoming Talk
6. **Day-2** echo (`Day2EchoOverlay.tsx`)

Journey shape: Harbor → Carpet → island Story Circle → return changed → Soft Beat / Freedom / harder doors.

Journey helpers: `chapterLoop.ts` (`nextIncompleteObjective`, Cove/Paycheck Change timelines); `mainCourse.ts` spine steps.

### Classification

| Aspect | Tag | Notes |
|--------|-----|--------|
| Signature cinema chain | **KEEP** | Best expression of “world marks your money choice” |
| Cove Take → real ledger footprint | **KEEP** / **CONNECT** | `firstFinancialScenario.ts` ties jar/treat to CF holdings |
| Dual “hub loop” language in older docs (`game-pillars` XP/unlock) | **SIMPLIFY** | Prefer bible signature loop |
| Quiet homecoming strips plaza to Plinth-only (`shouldStripPlazaForPresence`) | **IMPROVE** | Presence good; soft-lock risk (**UX friction**) |
| Long travel / stacked coaches | **REMOVE** if reintroduced | Bible loop killers |

### Eval snapshot

| Axis | Score (qualitative) |
|------|---------------------|
| Interesting decisions | Strong at Take forks; weaker between Takes |
| Causality | Strong when scar → Piggy names plaque |
| Transfer | Designed (Cove → Paycheck analogous); live ITR **UNKNOWN** |
| UX friction | Cinema hide-HUD good; quiet strip / Piggy-bypass friction on `main` |
| Maintenance | High (many overlays) but intentional |

---

## 2. Primary player verbs

### Reconstruction (exists)

| Layer | Verbs (bible + code) |
|-------|----------------------|
| Organ suit | Memory *keeps* · Coin *holds* · Clock *shelters* · Spiral *withstands* |
| Body | Walk · Look · Poke (structure toys) |
| Social | Talk (opt-in E) · Share · Witness (local) |
| Money commit | Take · Spend/Deal · Soft Beat peek · Pay Day · Board fork |
| Travel | Board Carpet · Enter Structure · Leave (Esc) |

Ashore order: Walk · Talk · board Cove (`harborAshore.ts`). Coin Bag pointer: `coinBagBuddy.ts`. Input: `src/input/` + `TouchWalkPad`.

### Classification

| Item | Tag |
|------|-----|
| Opt-in Talk + Esc/Leave overlays | **KEEP** |
| Commit as satisfying beat | **KEEP** |
| Outfitter / Capsule / Ritual as first-hour gates | **REMOVE** (already demoted; do not restore as gates) |
| Multiple coaches racing | **SIMPLIFY** / **REMOVE** |
| Poke discoverability without HUD | **IMPROVE** / **UNKNOWN** (claim in docs; cold play not in repo) |

---

## 3. Financial simulation model

### Reconstruction (exists)

**Primary engine — Voyager Ledger** (`voyagerLedger.ts`):

- Salary 40 / living 25 baseline
- Holdings: assets (+) / liabilities (−) monthly
- `netCashflow` = income − expenses (north-star metric)
- Pay Day → pouch coins; optional Harbor escape tracking
- Freedom: CF ≥ `$30/mo` for **3** consecutive Pay Days (`HARBOR_ESCAPE_TARGET` / `HARBOR_ESCAPE_STREAK`)
- Harbor deals (`HARBOR_DEALS`), event log (capped)
- First Cove Take can write real CF holdings (`firstFinancialScenario.ts`)

**Harbor weather / shop** from CF: `harborWeather.ts` (boom|fair|tight|storm), `harborShop.ts` price scale.

**Secondary engine — `economy.ts`:** boom/normal/recession multipliers used by some minigames (`ModularMinigame`, paper trading). Harbor ritual Pay Day uses multiplier **1** (does not consume boom/recession).

**Pouch coins:** `UserProfile.totalCoins` (liquid vanity / shop polish).

### Classification

| Item | Tag |
|------|-----|
| One pouch + one CF as player-facing truth | **KEEP** (`COMPLEXITY_CUT_REVIEW`) |
| Take → CF footprint | **KEEP** / **CONNECT** |
| Dual weather fictions (Harbor CF vs minigame boom/recession) | **SIMPLIFY** / **CONNECT** |
| `EconomyWeatherIndicator` (imported, not rendered) | **REMOVE** candidate |
| Interest compounding / credit utilization as deep sim | **MISSING** as continuous sim (Credit has minigames; not a full amortization engine) |
| Whether `economyState` advances in live Harbor | **UNKNOWN** |

### Eval vs learning goal

| Axis | Notes |
|------|--------|
| Causality | Strong when Take changes CF and Harbor sky/prices |
| Transfer | CF as “monthly leftovers” is teachable; quiz mastery ≠ CF mastery |
| Depth | Soft Beats + deals compound; still shallow vs real personal finance |
| Friction | Ledger HUD late (after Cove) supports progressive disclosure |

---

## 4. Existing progression

### Reconstruction (exists)

- **Main course** (`mainCourse.ts`): Harbor → Cove Change → Paycheck Change → Freedom Seal → Credit Ordeal
- **Gates** (`progressGates.ts` on `main`):
  - Side shores soft-locked until Cove Change
  - Cove + Paycheck open after Harbor (playability sweep)
  - **Credit Kingdom:** Freedom Seal **and** `masteryClears.length >= 3`
  - Freedom Pavilion requires Freedom
- **Carpet tiers** (`boats.ts`): Threadbare → Coin → Fortune flyer → higher vanity; Freedom floors at Fortune flyer
- **Mastery quizzes** (`masteryGate.ts`) feed Credit unlock
- **XP** still awarded in `IslandsApp`; `BIBLE_RUNTIME_LAWS.hideIslandsXpChrome` hides chrome
- **Stance** counters increment on scars; HUD organ-only law

### Classification

| Item | Tag |
|------|-----|
| Cove → Paycheck → Credit strip freeze | **KEEP** |
| Freedom as sustained CF escape | **KEEP** |
| Credit = Freedom + 3 mastery quizzes | **IMPROVE** / **SIMPLIFY** — risk: quiz wall vs organ transfer |
| XP awards while chrome hidden | **SIMPLIFY** / **REMOVE** write-only |
| skillStats mutated for adaptive coach while panel hidden | **SIMPLIFY** |
| Carpet vanity past Fortune flyer | **SIMPLIFY** (expression, not mastery) |
| Party “Ledger Seals” naming | **REMOVE** / rename → Board Star (bible) |
| New main-course islands | **MOVE LATER** (`iconic-later.md`) |

---

## 5. Existing story / narrative

### Reconstruction (exists)

- Myth: Voyager · Fortune Archipelago · Harbor Haven · money is alive (`story-bible.md`)
- Organs + cold kid sentences (`worldMemory.ts` `coldOrganKidSentence`)
- Scars / plaques as living receipts; Piggy + locals retell
- Series cast (`docs/series-cast.md`); Debt Collector = Credit Ordeal villain only
- Talk graphs: `harborTalks.ts`; island JSON content under `src/islands/content/`
- Genre biome lenses (`genreWorlds.ts`) — presentation layer; spine content registry tags organ truth

### Classification

| Item | Tag |
|------|-----|
| One mythology + organ cold-retell | **KEEP** |
| Stance as silent counters | **SIMPLIFY** (no stance HUD) |
| Extra Story Circle island docs under `docs/islands/*` | **MOVE LATER** |
| Every Talk Battle organ-true | **UNKNOWN** (content volume) |
| Identity from menu (“I am a Saver”) | **REMOVE** if reintroduced |

---

## 6. Existing economy

### Reconstruction (exists)

| Resource | Role |
|----------|------|
| Pouch coins | Spend shop / carpet polish / deals cost |
| Monthly cashflow | Freedom grind + Harbor weather |
| Freedom Seal | Pavilion + carpet floor + Credit gate (with mastery) |
| Scars | Narrative/memory capital (not currency) |
| Board Stars | Party score (must not be called Freedom) |
| Capsule / Arcade / Studio | Side toys; magnets after Cove Change |

Money Structures (4): Coin Jar · Ledger Bank · Payroll Tower · Interest Keep (`moneyStructures.ts`) — enter motifs + Soft Beat lookouts + arcade pads.

### Classification

| Item | Tag |
|------|-----|
| Structures as depth-not-width | **KEEP** |
| Soft Beat as peek, not second Take | **KEEP** |
| WealthHud rank ladder as progress | **SIMPLIFY** |
| Harbor shop as “real store” implication | **REMOVE** from copy |
| Real-money checkout | **MISSING** on `main` (see §15) |

---

## 7. Existing onboarding

### Reconstruction (exists)

**Boot (`App.tsx`):** title → `BootCastSelect` → `AshoreComprehensionTutorial` (FTUE-7) → carpet opening → Islands. Experienced checkbox can skip teach; QA `?skipIntro=1` + `VITE_QA`.

**FTUE-7 steps** (`ftueTelemetry.ts` / `AshoreComprehensionTutorial.tsx`): goal → walk → economy → decision → consequence → reward → deeper.

**Harbor Ashore:** Talk Piggy (`meet_guide`) → Carpet (`to_dock`) → Cove. Outfitter/Capsule/Ritual discoveries. Ritual magnets after Cove Change.

**Player modes:** `playerOnboarding/` (new / experienced / returning). Ashore replay via Settings.

**Dead path:** `WelcomeOnboarding.tsx` still on disk; **not mounted**.

### Classification

| Item | Tag |
|------|-----|
| FTUE-7 prove-it + Piggy meet | **KEEP** |
| Teaching north star = Independent Transfer | **KEEP** |
| Docs lag (some FTUE audits still describe older chambers) | **IMPROVE** (docs) |
| Map open before Piggy (`piggy_bypassed`) | **IMPROVE** recovery |
| Classroom roster FTUE | **MOVE LATER** |
| Legacy creative/structured App modes as co-equal product | **SIMPLIFY** / **MOVE LATER** (Islands is product) |

---

## 8. Existing UI / HUD

### Reconstruction (exists)

- Shell: `GameHudLayout.tsx`
- Harbor: quiet chips (first-meet / quiet homecoming); compact `WealthHud`; `VoyagerLedgerHud` after Cove + magnets; Freedom chip when seal-chasing; cinema hides HUD
- Coin Bag: `CoinBagBuddyHud.tsx` (one tip + optional painting/seal horizons)
- Global mute: `GlobalMusicMuteButton.tsx`
- Navigability: Esc + Leave on signature overlays (`useOverlayEscape`)
- Myth fallback when 3D fails: `HarborMythFallback.tsx` (Talk + Carpet)

### Classification

| Item | Tag |
|------|-----|
| Quiet first hour + one Coin Bag sentence | **KEEP** |
| Ledger late reveal | **KEEP** |
| Stacked CASH / Leave / stall chrome during cinema | **REMOVE** if returns |
| EconomyWeather HUD widget | **REMOVE** (unused) |
| WCAG AA on all non-spine screens | **UNKNOWN** |

---

## 9. Existing feedback systems

### Reconstruction (exists)

- SFX: `capitalSfx.ts` (procedural Web Audio beeps — scar_chime, take_mark, harbor_felt, organ stingers, etc.)
- Music place + hush duck: `capitalMusic.ts`; mute persist `musicMute.ts`
- Juice: `triggerJuice` on Take / spectacle / share / fail
- Share PNG with Plinth silhouette; mute-test chain documented in iconic-path
- Cold retell sentences shared across spectacle / Family / Piggy

### Classification

| Item | Tag |
|------|-----|
| Organ stingers + mute-test readability | **KEEP** |
| Juice vs SFX one-bed (except signature cinema) | **CONNECT** / **IMPROVE** |
| Sample-pack / licensed music quality | **UNKNOWN** / **IMPROVE** craft |
| Audio-only organ cues for low vision | **IMPROVE** (`FTUE_ACCESSIBILITY_AUDIT`) |

---

## 10. Existing difficulty / failure systems

### Reconstruction (exists)

- Dignity fail overlay: `minigameFail.ts` + `MinigameFailOverlay.tsx` (Retry / stay put; structure stays in structure)
- Assist ladder: `onboardingFailureAssist.ts` + `docs/ftue/FAILURE_RECOVERY.md`
- Settings `DifficultyLevel` easy/normal/hard + attempt records
- Soft lock hints: `islandLockHint`; corrupt save sanitize
- Harbor 3D failsafe / myth escape

### Classification

| Item | Tag |
|------|-----|
| Dignity + scars remain after fail | **KEEP** |
| Spend-Take shame copy | **REMOVE** (tests enforce saver-parity) |
| DifficultyLevel actually changing thresholds | **UNKNOWN** (type exists; full wiring not proven in this audit) |
| Piggy-bypass recovery | **IMPROVE** |

---

## 11. Existing AI systems

### Reconstruction (exists)

- **Heuristics “adaptive coach”** (`adaptiveCoach.ts`): weighted scoring over fails, skillStats, cashflow, learning profile — **not** ML/LLM
- **NPC BehaviorGraphAgent** (`npcBehavior/agent.ts`): behavior tree ticks — **not** generative
- Authored Talk graphs only
- Lazy `AIChatHelper` in `App.tsx` (legacy shell) — **not** the Islands teach path
- **No** OpenAI/Anthropic SDK in `package.json` / Islands gameplay on `main`

### Classification

| Item | Tag |
|------|-----|
| Honest heuristics behind Coin Bag | **KEEP** if subordinated to Main Quest |
| skillStats write-only for coach | **SIMPLIFY** |
| Generative AI tutor in-loop | **MISSING** (and freeze does not require it) |
| Company-OS agent docs on other branches | **MOVE LATER** / out of game |

---

## 12. Existing social systems

### Reconstruction (exists)

- **Family Room** (`familyRoom.ts`): local encrypted storage, invite code, JSON export/import, max members, challenges (studio_clear, freedom_seal, cove_take, digression_pair) — **no server**
- **Witness** stamps on share (cheer/caution/curious) — myth only; does not edit ledger/plaque
- Share PNG default social object
- Freeze: no fake multiplayer (`iconicScopeFreeze`)

### Classification

| Item | Tag |
|------|-----|
| Local Family Room + Witness | **KEEP** |
| Cross-device sync beyond paste JSON | **MISSING** by design / **MOVE LATER** |
| Ranked multiplayer / MMO | **MOVE LATER** / anti-pillar for freeze |

---

## 13. Existing telemetry

### Reconstruction (exists)

- Game analytics: `analytics.ts` → console + `window.spark.kv` ring (`island_analytics_v1`)
- Events include `core_loop_beat`, quest/minigame/dialogue, FTUE set (`types.ts`)
- FTUE privacy allowlist: `analytics/ftue/`
- Local ITR math: `independentTransfer/` + `analytics/ftue/metrics.ts` (`independent_transfer_rate`)
- Export: Settings → Analytics
- SRE ring: `src/sre/telemetry.ts` (optional `TELEMETRY_URL`)

### Classification

| Item | Tag |
|------|-----|
| Id-only local events + privacy allowlist | **KEEP** |
| ITR as king KPI instrumentation | **KEEP** / **IMPROVE** (need human playtests) |
| Remote product analytics dashboard | **MISSING** |
| Fake published ITR numbers | **REMOVE** if invented — policy: do not fake |

---

## 14. Existing accessibility

### Reconstruction (exists)

- Settings: textSize, reducedMotion, highContrast, guideArrows, musicEnabled/volume (`settings.ts`)
- `a11yMotion.ts`: Settings **OR** OS reduce; `cinemaTimeScale`, `cinemaFlashAmp` (0 under reduce)
- High contrast on island root + share lower-third
- Binding-aware control hints; TouchWalkPad; pointer-safe CTAs; Esc overlays
- Global mute with `aria-pressed`

### Classification

| Item | Tag |
|------|-----|
| Reduce motion + flash damp | **KEEP** |
| Ashore contrast / fixed-px titles | **IMPROVE** (per FTUE a11y audit) |
| Color-blind profiles | **UNKNOWN** / monitor |
| Screen-reader coverage of 3D plaza | **UNKNOWN** / **IMPROVE** |
| Soft-lock on color alone | **REMOVE** if any remain |

---

## 15. Existing monetization

### Reconstruction

| Claim | On `main` `src/` |
|-------|------------------|
| Stripe / checkout / IAP / ads | **MISSING** (`package.json` has no stripe; no billing module) |
| In-game “purchases” | **EXISTS** as **pouch coin** shop (`harborShop.ts`, analytics `harbor_purchase`) — not real money |
| Policy | Premium / DLC hypothesis in `docs/game-pillars.md`; **store checkout out of slice**; bible: no pay-to-win |

Other branches may contain Stripe shells — **not shipped on `main`**. Treat as **MOVE LATER**.

### Classification

| Item | Tag |
|------|-----|
| No pay-to-win | **KEEP** |
| Real billing | **MOVE LATER** |
| Implying Harbor shop is a real store | **REMOVE** from UX copy |

---

## System scorecard (mission fit)

| # | System | Mission fit | Primary tag |
|---|--------|-------------|-------------|
| 1 | Signature loop | High — teaches consequence | KEEP |
| 2 | Verbs | High if Commit stays clear | KEEP |
| 3 | Voyager Ledger CF | High — real reasoning substrate | KEEP + CONNECT |
| 3b | Dual `economy.ts` | Medium/low — split causality | SIMPLIFY |
| 4 | Progression / Credit gate | Medium — quiz risk | IMPROVE |
| 5 | Narrative / scars | High — emotional memory | KEEP |
| 6 | Economy surfaces | Medium — pouch vs CF tension | SIMPLIFY |
| 7 | FTUE-7 + Ashore | High if transfer protected | KEEP + IMPROVE |
| 8 | HUD | Medium — quiet good; chrome creep | SIMPLIFY |
| 9 | Feedback | High for mute-test loop | KEEP |
| 10 | Failure dignity | High for learning persistence | KEEP |
| 11 | Adaptive coach | Medium — heuristics OK | SIMPLIFY |
| 12 | Family Room | Medium — relatedness, local | KEEP |
| 13 | Telemetry / ITR | High potential; local only | IMPROVE |
| 14 | Accessibility | Medium-high foundation | IMPROVE |
| 15 | Monetization | N/A on main | MOVE LATER |

---

## P0 / P1 / P2 priorities

### P0 — Protect learning causality & navigability (do first)

1. **Protect signature loop** from coach/HUD races (spectacle → share → Piggy order).
2. **Fix quiet-homecoming soft-lock** on `main`: keep presence, keep Carpet walkable (PR #156 direction — verify on merge).
3. **Clarify Credit unlock causality** so Spiral feels like spine transfer, not silent quiz grind (hint already names mastery; consider spine-tied unlock — debate vs Freedom pedagogy).
4. **Never publish fake ITR**; run human Independent Transfer playtests (`docs/ftue/INDEPENDENT_TRANSFER_PLAYTEST.md`).
5. **One money truth:** pouch vs CF must stay player-readable after first Take.

### P1 — Deepen transfer & cut parallel languages

1. Strengthen **Cove → Paycheck** analogous choice without labeling “this is the Take.”
2. **SIMPLIFY** XP / stance HUD / skillStats surfaces; keep scars + organs.
3. **CONNECT** Soft Beat peek → next Talk/Take chemistry consistently.
4. Align **FTUE docs** with FTUE-7 live boot (reduce audit lag).
5. Demote **legacy App modes** / `AIChatHelper` from product mental model.
6. Unify or clearly scope **Harbor CF weather** vs **minigame boom/recession**.

### P2 — Craft, social, monetization later

1. A11y polish (Ashore contrast, SR for plaza, color-blind monitoring).
2. Family Room paste-sync UX craft (still local).
3. Carpet vanity / Arcade / Studio as post-Freedom toys only.
4. Monetization / Stripe only after learning loop is iconic — never pay-to-win.
5. Performance pass on Harbor 3D failsafe paths (already partially gated).

---

## What this audit deliberately did not do

- Did not modify production code
- Did not invent Stripe, LLM tutors, or multiplayer backends
- Did not claim live ITR percentages
- Did not treat unmerged PR branches as shipped truth

See also: `CURRENT_GAME_LOOP.mmd` · `SYSTEM_MAP.mmd` · `DESIGN_DEBT.md`
