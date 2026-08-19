# Capital Master Design Audit

**Date:** 2026-08-19  
**Repository snapshot:** `main` @ `a6dcc204` (post island-content rewrite merge)  
**Scope:** Read-only reconstruction of what exists in code and docs. No production code was modified for this audit.  
**Auditors (roles):** Principal game designer · economy designer · narrative systems designer · UX architect · learning scientist · senior software architect.

**Companion artifacts:** [CURRENT_SYSTEM_MAP.mmd](./CURRENT_SYSTEM_MAP.mmd) · [DESIGN_DEBT.md](./DESIGN_DEBT.md) · [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) · [PLAYER_FANTASY.md](./PLAYER_FANTASY.md) · [PLAYER_VERB_MATRIX.md](./PLAYER_VERB_MATRIX.md) · [PROGRESSION_AUDIT.md](./PROGRESSION_AUDIT.md) · [FINANCIAL_DECISION_UI.md](../ui/FINANCIAL_DECISION_UI.md) · [AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md) · [AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md) · [LEARNING_TRANSFER_FRAMEWORK.md](../research/LEARNING_TRANSFER_FRAMEWORK.md) · [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) · [NARRATIVE_EVENT_ENGINE.md](../narrative/NARRATIVE_EVENT_ENGINE.md) · [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) · [MASTER_DESIGN_AUDIT.md](./MASTER_DESIGN_AUDIT.md) (prior partial audit — supplementary)

---

## Executive summary

Capital is a **local-first, browser-based financial literacy adventure** set in the **Fortune Archipelago**. The player is a **Voyager** among **Money Mascots** in a world where money is alive. The shipped product spine is frozen at **Harbor → Cove → Paycheck → Credit**, with eight optional **era side shores** and **Money Structure** interiors for depth.

The codebase is **machine-complete** for the iconic phase: **642 tests pass**, content depth bars enforced, production island locks on (`PLAYTEST_UNLOCK_ALL_ISLANDS = false`). The primary remaining gate is **human playtest** (Pattern #94 / Independent Transfer Rate cohort), explicitly deferred.

**Strongest systems:** Signature Take → hush → scar spectacle → Plinth share → Piggy homecoming → day-2 echo; Voyager Ledger cashflow; organ mythology; constraint-play truth fixes on spine Takes.

**Weakest systems:** Dual quest paradigms (Islands JSON vs legacy tier quests); macro economy partially wired; remote telemetry cohort execution; real-money monetization absent; some parallel progression languages still present in save schema.

---

## How to read this document

Each system section contains:

1. **Classification** — one of: `KEEP` · `CONNECT` · `IMPROVE` · `SIMPLIFY` · `REBUILD` · `REMOVE` · `MOVE_LATER` · `MISSING`
2. **Scores (1–5)** — nine dimensions (see rubric below)
3. **FACTS FOUND IN REPOSITORY** — evidenced in code/docs/tests
4. **DESIGN INFERENCES** — intent or player experience not fully provable from code alone
5. **RECOMMENDATIONS** — prioritized design direction (not implementation)

### Scoring rubric (1 = weak / absent · 5 = exemplary)

| Dimension | Question |
|-----------|----------|
| **Player agency** | Can the player meaningfully steer outcomes? |
| **Decision quality** | Are forks real, legible, and consequence-bearing? |
| **Causal clarity** | Does the player understand why outcomes happened? |
| **Systemic depth** | Do systems interact to create emergent play? |
| **Emotional meaning** | Does the moment land emotionally, not just mechanically? |
| **Narrative integration** | Is story stateful and woven into mechanics? |
| **Financial learning** | Does play teach transferable money literacy? |
| **UX clarity** | Can players navigate without getting lost? |
| **Technical maintainability** | Is the system testable, bounded, and honest? |

---

## 1. Player fantasy

**Classification:** `KEEP`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 5 |
| Narrative integration | 5 |
| Financial learning | 4 |
| UX clarity | 4 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

- Design constitution: `docs/CAPITAL_DESIGN_BIBLE.md` — *"You are a Voyager in a world where money is alive."*
- Product name **Capital**; world **Fortune Archipelago**; home **Harbor Haven** (`docs/CAPITAL_DESIGN_BIBLE.md`, `src/islands/spineArchipelago.ts`).
- Four **money organs** with suit verbs: Memory *keeps* · Coin *holds* · Clock *shelters* · Spiral *withstands* (`src/islands/moneyOrgans.ts`, `docs/mural-thesis.md`).
- Identity emerges from **scars, weather, Soft Beats, Piggy lines** — not from a "I am a Saver" menu (`docs/CAPITAL_DESIGN_BIBLE.md`).
- 30+ **Money Mascots** in cast registry (`src/islands/moneyCast.ts`); Harbor Keeper = `piggy_penny`.
- Anti-fantasy list enforced in docs and tests: no HP duel chrome, no spreadsheet-as-hero before Change (`docs/player-fantasy-and-loop.md`, `src/islands/biblePlayerVisible.test.ts`).

### DESIGN INFERENCES

- The fantasy successfully differentiates Capital from finance worksheets and combat RPGs; the **living receipt** metaphor (Piggy + Coin Bag) is the emotional anchor.
- Side shores and genre lenses risk diluting organ clarity if surfaced too early — freeze rules exist but UX discovery path is still tuning-dependent.

### RECOMMENDATIONS

- **KEEP** organ suit verbs as the non-negotiable vocabulary gate for all new content.
- **CONNECT** every new surface (HUD chip, NPC line, structure toy) to an organ + verb before ship.
- Run cold playtest specifically on: *"Does this feel like a Voyager among mascots, or a settings app?"*

---

## 2. Core gameplay loop

**Classification:** `KEEP` (signature loop) · `CONNECT` (secondary loops)

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 5 |
| Causal clarity | 4 |
| Systemic depth | 4 |
| Emotional meaning | 5 |
| Narrative integration | 5 |
| Financial learning | 5 |
| UX clarity | 3 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Signature loop** (protected in `docs/iconic-path.md`, implemented across `IslandsApp.tsx`, `HomeHubView.tsx`, `IslandShoreView.tsx`):

1. Irreversible **Take** (Cove → Paycheck → Credit)
2. Soft chapter **hush** (`chapterQuietPending`)
3. Harbor **scar spectacle** + Memory **Plinth** glow
4. **Share** PNG (default social object)
5. Quiet plaza → **Piggy** homecoming
6. **Day-2** rumor + locals naming the plaque

**Campaign spine** (`src/islands/mainCourse.ts` — `MAIN_COURSE[]`, five ordered steps):

| Step | Place | Done when |
|------|-------|-----------|
| `harbor_grounds` | Harbor | `onboardingComplete && character` |
| `first_painting` | Cove | `hasCompletedCoveChange` |
| `second_painting` | Paycheck | Paycheck Change quest complete |
| `freedom_seal` | Harbor | `hasHarborFreedom` |
| `boss_ordeal` | Credit | Credit Ordeal quest complete |

**Reasoning loop** (`docs/ftue/CORE_LOOP.md`): Harbor → Guide → Act → Carpet → Island chapter → Earn/choose/learn → Return changed → Harbor grows.

**Side tomfoolery** (`SIDE_TOMFOOLERY[]` in `mainCourse.ts`): optional digressions; several entries use `done: () => false` (never complete the meta-list).

**View orchestration** (`IslandsApp.tsx`): `home | travel | voyage | explore | island | chapter | arcade | studio`. Resume defaults to **`explore`** (walkable shore), not board/quiz menus.

### DESIGN INFERENCES

- The **smallest interesting cycle** is: irreversible Take → Harbor remembers → next choice differs — this is the design north star, not star counters or pouch hoarding.
- Secondary loops (party board, arcade, studio) are intentionally **non-gating** but may still compete for first-hour attention if surfaced too early.
- Freedom Seal (step 4) is mid-spine, not endgame — messaging risk if players conflate Freedom with "beat the game."

### RECOMMENDATIONS

- **KEEP** signature cinema chain as untouchable spine; any feature touching Take/Plinth/share must pass iconic checklist (`docs/iconic-path.md`).
- **CONNECT** Paycheck and Credit Takes to ledger footprints (done via `spineTakeFootprints.ts`) into weather/shop feedback loops — verify player-facing causal lines land in playtest.
- **SIMPLIFY** competing first-hour loops: one coach path (Ashore + Piggy `meet_guide` → Carpet → Cove).

---

## 3. Player verbs

**Classification:** `KEEP` · `IMPROVE` (discoverability)

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 4 |
| Narrative integration | 4 |
| Financial learning | 4 |
| UX clarity | 3 |
| Technical maintainability | 5 |

### FACTS FOUND IN REPOSITORY

**Input bindings** (`src/input/defaultBindings.ts`): move (WASD/stick), interact (E/A), confirm, cancel, map (M), inventory (I), quest log (J), menu.

**Quest objective verbs** (`src/islands/types.ts`): `talkToNpc`, `collectItem`, `completeMinigame` (optional `scoreThreshold`).

**Dialogue effect verbs** (`DialogueEffect`): `startQuest`, `completeQuest`, `giveItem`, `startMinigame`, `setIrreversible`, `addScar` (with `stance` / `stanceDelta`).

**Primary journey verbs** (docs + code): Walk · Talk (opt-in E) · Board Carpet · Take · Play (minigame pads) · Return · Share · Soft Beat peek · Pay Day · Board fork.

**Hub guided critical path** (`src/islands/story/storyBible.ts`): `meet_guide` → `to_dock` → `done`. Legacy steps remapped via `normalizeHubGuidedIntro()`.

**Kinesthetic-first rule** (`IslandsApp.applyDialogueEffects`): non-kinesthetic minigame requests redirect to movement pad with toast.

**Failure dignity** (`MinigameFailOverlay`): retry-with-dignity; structure fails do not dump to Harbor.

### DESIGN INFERENCES

- **Commit** (confirm a living-money fork) is the most frequent satisfying beat — walk positions; commit lands.
- Coin Bag should prefer Main Quest tips but must not race ahead of player discovery (partially implemented in `coinBagBuddy.ts`).

### RECOMMENDATIONS

- **IMPROVE** verb discoverability on side shores post-Cove — map unlock vs hidden outer ring needs playtest validation.
- **SIMPLIFY** duplicate navigation paths (`explore` vs `chapter` vs `island`) — clarify which is canonical for resumed sessions.

---

## 4. Financial systems

**Classification:** `KEEP` (Voyager Ledger) · `CONNECT` (macro economy) · `SIMPLIFY` (dual currencies)

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 4 |
| Emotional meaning | 3 |
| Narrative integration | 4 |
| Financial learning | 5 |
| UX clarity | 3 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Voyager Ledger** (`src/islands/voyagerLedger.ts`) — north-star financial model:

- Net cashflow = income − expenses
- Default: salary $40/mo, living $25/mo
- **Freedom escape:** 3 consecutive Pay Days at ≥$30/mo net CF (`HARBOR_ESCAPE_TARGET`, `HARBOR_ESCAPE_STREAK`)
- Holdings: assets/liabilities with monthly amounts; deal catalog (`HARBOR_DEALS`, `regenerateAssetDealOffer`)
- Board integration: Cashflow Claims (pouch → monthly CF), not party stars

**Party board** (`src/islands/partyBoard.ts`):

- 16-space loop; space types: payday, bill, deal, liability, seal, capsule, raid, collector, bank, minigame
- `computeMinigameReward`: `starEarned: false` by design
- Modes via `boardEconomy.ts`: `harbor_cashflow`, `era_cashflow`, `party`

**Macro economy** (`src/islands/economy.ts`):

- Phases: boom / normal / recession; Markov transitions; tag-weighted event modifiers
- Stored on `IslandSaveV1.economyState`; `advanceEconomy()` called from `IslandsApp.tsx`

**Dual currency surfaces:**

- **Pouch coins** — session earn/spend (Harbor shop, board, minigames)
- **Monthly cashflow** — Freedom Seal progression (`VoyagerLedgerHud`)

**Spine Take footprints** (`src/islands/spineTakeFootprints.ts`): Paycheck + Credit Takes write ledger holdings like Cove; CF → weather → shop prices diverge by stance.

### DESIGN INFERENCES

- Ledger is canonical win condition; pouch is toy economy — Design Bible alignment is strong post constraint-play pass.
- Macro economy tints events but is not legible to players on Harbor (EconomyWeatherIndicator demoted per Bible).
- Board "stars" decoupled from Freedom — naming cleanup largely done but player mental model still at risk.

### RECOMMENDATIONS

- **KEEP** Voyager Ledger + Freedom CF grind as spine progression language.
- **CONNECT** macro economy to visible, organ-true feedback (sky/weather already partially wired via `harborWeather.ts`) — one causal line per Take.
- **SIMPLIFY** post-Cove HUD: prioritize ledger over pouch when both visible.

---

## 5. Economic simulation

**Classification:** `CONNECT` · `IMPROVE`

| Dimension | Score |
|-----------|------:|
| Player agency | 3 |
| Decision quality | 3 |
| Causal clarity | 2 |
| Systemic depth | 3 |
| Emotional meaning | 2 |
| Narrative integration | 3 |
| Financial learning | 4 |
| UX clarity | 2 |
| Technical maintainability | 3 |

### FACTS FOUND IN REPOSITORY

| Layer | Location | Status |
|-------|----------|--------|
| Macro cycle | `economy.ts` | Implemented; turn-advanced |
| Cashflow sim | `voyagerLedger.ts` | Core; player-facing |
| Board sim | `partyBoard.ts` + `boardEconomy.ts` | Post-Freedom toy |
| Market sim | `minigames/market-sim.ts` | GBM + sector correlation; minigame-local |
| Transaction sim | `src/lib/transaction-simulator.ts` | Separate lib layer |
| Balance tooling | `docs/CAPITAL_DESIGN_BIBLE.md` references economy sim | No standalone batch harness in repo |

**Constraint-play fixes** (`docs/design/CONSTRAINT_PLAY_TRUTH.md`): deal catalog renewal, liability choice on board, Take→ledger footprints.

### DESIGN INFERENCES

- "Economy sim" in docs means **cross-system balance**, not a single orchestrator — accurate but easy to misread.
- Market sim and macro economy are parallel models with varying integration depth per minigame.
- No automated economy regression suite visible — balance changes are test-adjacent, not sim-driven.

### RECOMMENDATIONS

- **IMPROVE** player-facing causal clarity for macro phase (or **SIMPLIFY** by hiding until post-Freedom).
- **CONNECT** minigame market outcomes to ledger holdings where literacy intent demands it.
- **MOVE_LATER** dedicated economy batch harness unless balance churn increases.

---

## 6. Story architecture

**Classification:** `KEEP`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 5 |
| Causal clarity | 4 |
| Systemic depth | 4 |
| Emotional meaning | 5 |
| Narrative integration | 5 |
| Financial learning | 4 |
| UX clarity | 4 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Story Bible** (`docs/story-bible.md`, `src/islands/story/storyBible.ts`):

- Harmon 8-beat Story Circle + Campbell Hero's Journey
- `STORY_BIBLE_VERSION = 1`; Harbor Keeper = `piggy_penny`
- 12 live islands have filled `docs/islands/*/story-circle.md` (post rewrite merge)

**World memory** (`src/islands/worldMemory.ts`):

- `HarborScar` types: `plaque | npc_tone | plaza_prop`
- `IrreversibleChoiceRecord`; `VoyagerStance` axes: saver/spender/risk
- Scar cap: 24; organ mapping for cold retell
- APIs: `coldRetellLine`, `plaqueShelfLine`, `coldSpectacleHeadline`, `day2EchoBody`, `scarRumorLine`

**Digression shelf** (`src/islands/digressionShelf.ts`):

- 12 shelf slots; pair logic (either branch counts as heard)
- Player UI: heard myths only — no empty checklist (constraint-play fix)

**Harbor talks** (`src/islands/story/harborTalks.ts`):

- Plaza cast, role tips per learning profile, scar-aware gossip

**Painting progression** (`nextPaintingAfterScar()`): Coin → Paycheck → Credit

### DESIGN INFERENCES

- Story is **stateful across sessions** via scars + irreversible choices, not branching cutscenes alone — this is Capital's narrative moat.
- Side digressions create `npc_tone` scars for gossip but must not steal Take/Plinth spectacle from spine quests.

### RECOMMENDATIONS

- **KEEP** scar/plaque/plinth as the single "Harbor remembers" surface (Complexity Cut alignment).
- **IMPROVE** NPC arc coherence across spine — audit Take moments against story-circle docs per island.
- **CONNECT** cold retell lines to independent transfer tasks (no answer leakage in Piggy homecoming).

---

## 7. Quest architecture

**Classification:** `KEEP` (Islands JSON) · `SIMPLIFY` (dual paradigms)

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 4 |
| Narrative integration | 5 |
| Financial learning | 4 |
| UX clarity | 3 |
| Technical maintainability | 3 |

### FACTS FOUND IN REPOSITORY

**Schema** (`src/islands/types.ts`):

```typescript
type QuestTrack = "main" | "side";
type IslandQuest = { id, title, description, track?, objectives[], rewards? };
type QuestObjective = talkToNpc | collectItem | completeMinigame;
```

**Spine quest IDs** (`src/islands/islandIds.ts`):

- Cove Change: `q_cc_save_or_spend`
- Paycheck Change: `q_pp_rainy_day`
- Credit Ordeal: `q_ck_first_recovery`

**Orchestration:**

- `chapterLoop.ts` — `nextIncompleteObjective()`, prefers `track: "main"`
- `questTracks.ts` — missing track defaults to `"main"`
- Dialogue-driven flow via `DialogueEffect` in Talk Battle

**Content:** 12 live island JSON packs under `src/islands/content/*.islands.json` (+ parked `demo.islands.json`).

**Depth bar** (`src/islands/islandContentDepth.test.ts`): non-hub islands ≥8 minigames, ≥3 quests; Harbor hub exempt from quest count.

**Recovery:** `ftueQuestRecovery.ts` — proof predicates on save reconcile

**Legacy parallel:** `src/utils/questSystem.ts` — FinanceQuest tier model separate from `IslandSaveV1.questStatus`

### DESIGN INFERENCES

- Quests are data-authored + dialogue-triggered; no separate quest VM beyond objective key matching — appropriate for scope.
- Two quest systems coexist in monorepo — Islands path is canonical for Capital product; legacy may confuse contributors.

### RECOMMENDATIONS

- **KEEP** JSON quest + dialogue effect pipeline.
- **SIMPLIFY** — deprecate or gate legacy `questSystem.ts` off product path explicitly in docs.
- **IMPROVE** side quest discoverability without fill-percent chrome (already cut per constraint-play).

---

## 8. NPC / relationship systems

**Classification:** `KEEP` · `SIMPLIFY`

| Dimension | Score |
|-----------|------:|
| Player agency | 3 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 4 |
| Narrative integration | 4 |
| Financial learning | 3 |
| UX clarity | 4 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

| System | File | Mechanism |
|--------|------|-----------|
| Cast | `moneyCast.ts` | 30+ mascots + series leads + `debt_collector` |
| Personas | `npcPersonas.ts` | 8 personas; genre → persona weights |
| Talk memory | `worldMemory.ts` | `recordNpcTalk()` — count + last 8 choice IDs |
| Stance | `worldMemory.ts` | `applyStanceDelta()`, `dominantStance()` — affinity no longer written |
| Bond | save | `piggyBondHomecomings` |
| Ritual | `harborRitual.ts` | Daily rumors, scar echo, weekly challenges |
| 3D behavior | `npcBehavior/NpcBrainViews.tsx` | Ambient lines fed by scar echo + memory |
| Harbor lives | `harborNpcLives.ts` | Hour-based poses/lines |

**Piggy** is primary emotional relationship; series leads (Cashwell, Cashmere, etc.) are plaza cast, not Harbor Keeper.

### DESIGN INFERENCES

- Relationships are **lightweight by design**: talk counts + stance axes + permanent scars — not affinity meters or romance trees.
- Piggy homecoming is the relationship payoff beat; bond counter supports repeat returns.

### RECOMMENDATIONS

- **KEEP** scar/stance-driven relationships; **REMOVE** any revived affinity UI (Complexity Cut).
- **IMPROVE** Credit Rex (`creditEncounter.ts`) as villain relationship — spiral organ truth already structured (Inbox → Scanner → Take).
- **CONNECT** plaza gossip to digression shelf without spoiling transfer tasks.

---

## 9. Progression

**Classification:** `KEEP` · `CONNECT`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 4 |
| Emotional meaning | 4 |
| Narrative integration | 5 |
| Financial learning | 5 |
| UX clarity | 3 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Gates** (`src/islands/progressGates.ts`):

- `PLAYTEST_UNLOCK_ALL_ISLANDS = false` (production)
- Side shores locked until Cove Change (`isSideShoreTravelId`)
- Credit locked until Freedom + Paycheck Change (`bossUnlockProgress`)
- `BOSS_MASTERY_REQUIRED = 0` — quizzes do not gate Credit
- Freedom Pavilion requires Freedom Seal (`PLAZA_ROOMS`)

**Concept progression** (`src/islands/conceptProgression/`):

- Concepts: `money_is_alive`, `earn_then_decide`, `save_vs_spend`, `irreversible_take`, `harbor_scar_memory`, `cashflow`, `interest_compounds`
- Phases: LOCKED → … → MASTERED / INDEPENDENT

**Progression surfaces:**

- Carpet tiers, companions, plaza pass, capsules (Harbor shop)
- Mastery clears (optional digression)
- Party board stars (session score, not Freedom)

**Scope freeze** (`src/islands/iconicScopeFreeze.ts`, `.cursor/rules/iconic-freeze.mdc`):

- Main strip: Harbor · Cove · Paycheck · Credit
- No new outer islands; Family Room stays local

### DESIGN INFERENCES

- Progression is **literacy-first**: Cove Change → side shores; Freedom + Paycheck Change → Credit.
- Concept phases and onboarding complete are intentionally separate — prevents fake completion.

### RECOMMENDATIONS

- **KEEP** literacy-first gate order; resist quiz/XP substitutes.
- **CONNECT** concept INDEPENDENT phase to map unlock messaging ("a painting woke").
- **IMPROVE** Freedom vs endgame messaging — Freedom is capability unlock, not credits roll.

---

## 10. Exploration

**Classification:** `KEEP` · `IMPROVE`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 3 |
| Causal clarity | 3 |
| Systemic depth | 3 |
| Emotional meaning | 4 |
| Narrative integration | 4 |
| Financial learning | 3 |
| UX clarity | 3 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Topology** (`src/islands/spineArchipelago.ts`):

- Spine: `harbor_haven` → `coincraft_cove` → `paycheck_peninsula` → `credit_kingdom`
- Side shores (8): `signal_city`, `venture_foundry`, `financial_assets`, `digital_assets`, `business_assets`, `intangibles`, `future_shores`, `real_estate`
- Map: Seed-of-Life layout (`worldMapLayout.ts`, `sacredGeometry.ts`)

**Views:**

- `explore` — walkable 3D shore (`IslandShoreView`, `WalkableIslandExplore`)
- `travel` — archipelago map (`TravelMapView`, `ArchipelagoMap3D`)
- Money Structure interiors (`moneyStructures.ts`, `MoneyStructureInteriorView.tsx`)

**Shore craft:** `ShoreRhythmCraft`, organ-true motifs, hush dims landmark after Take

**Failsafe:** flat hotspot shore fallback if 3D Canvas hangs (`SHORE_3D_FAIL_KEY`)

**Playtest mode:** `TravelMapView` shows full archipelago when `PLAYTEST_UNLOCK_ALL_ISLANDS = true`; production shows spine strip only.

### DESIGN INFERENCES

- World follows **hub-and-spoke**: Harbor safe hub → triangle spine → optional outer ring after first Take.
- Money Structures are depth vector (Astro-style climb-inside), not alternate main quests.

### RECOMMENDATIONS

- **KEEP** explore-first resume default.
- **IMPROVE** post-Cove discovery of side shores on production map — verify outer ring visibility without playtest flag.
- **CONNECT** Soft Beat lookouts to exploration rewards without forced FTUE.

---

## 11. World structure

**Classification:** `KEEP`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 5 |
| Narrative integration | 5 |
| Financial learning | 4 |
| UX clarity | 4 |
| Technical maintainability | 5 |

### FACTS FOUND IN REPOSITORY

- SM64 pattern documented in `mainCourse.ts`: Harbor = castle grounds; shores = painting lobbies; main course = required beats; side tomfoolery = optional.
- Four Money Structures mapped to spine + Harbor (`docs/iconic-path.md`).
- Genre biome cities as **district lenses** under genre packs — parked from live loader where appropriate (`spineContentRegistry.ts`).
- `PARKED_ISLAND_IDS = ["starter_key_cove"]`; demo pack excluded from live loader.
- 3D world: `src/islands/world3d/` — Harbor, shores, structures, carpet voyage.

### DESIGN INFERENCES

- World structure is one of Capital's most coherent systems — organ mythology + geographic spine + structure depth is shippable.
- Era side shores add longevity (100h doc) without widening main quest strip — correct freeze discipline.

### RECOMMENDATIONS

- **KEEP** freeze; deepen Money Structure interiors before any map width.
- **IMPROVE** side shore organ/verb/cold-retell consistency vs spine bar.

---

## 12. UI / HUD

**Classification:** `KEEP` · `IMPROVE`

| Dimension | Score |
|-----------|------:|
| Player agency | 3 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 2 |
| Emotional meaning | 4 |
| Narrative integration | 4 |
| Financial learning | 3 |
| UX clarity | 3 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Shell:** `IslandsApp.tsx` → `GameViewport`, overlays (Talk Battle, minigame modal, fail overlay, mastery quiz, returning briefing).

**Primary HUD components:**

| Component | Role |
|-----------|------|
| `VoyagerLedgerHud` | Income/expenses/net CF, Freedom streak |
| `CoinBagBuddyHud` | Adaptive tips + edge cue |
| `WealthHud` | Pouch/profile coins |
| `FtueControlsHint` | Move/Talk/Map hints |
| `GlobalMusicMuteButton` | Audio mute |

**Signature overlay chain:** `TakeHushOverlay` → `ScarSpectacleOverlay` → `HarborFeltShareOverlay` → `Day2EchoOverlay` → `SoftBeatOverlay`

**Quiet modes:**

- `chapterQuietPending` — soft HUD after Take
- `harborHomecoming.quietPending` — Harbor quiet until Piggy homecoming Talk

**Navigability:** Esc + visible Leave on overlays (`useOverlayEscape`); sticky primary actions.

**Settings analytics:** `AnalyticsExportView.tsx`, health dashboard in Settings.

### DESIGN INFERENCES

- HUD **intentionally thins** after irreversible choices — correct for emotional beat protection.
- Dual economy HUD (pouch + ledger) may confuse pre-Cove players; post-Cove ledger should dominate.

### RECOMMENDATIONS

- **KEEP** hush/spectacle HUD thinning.
- **SIMPLIFY** early Harbor chrome (Complexity Cut: no CASH/Leave/stall grid until Piggy talk).
- **IMPROVE** resumed session wayfinding — Coin Bag + `nextMainCourseStep` in ReturningPlayerBriefing.

---

## 13. Onboarding / FTUE

**Classification:** `KEEP` · `IMPROVE` (ITR measurement)

| Dimension | Score |
|-----------|------:|
| Player agency | 3 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 4 |
| Narrative integration | 4 |
| Financial learning | 5 |
| UX clarity | 3 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Boot sequence** (`src/App.tsx`):

1. `CapitalOpeningIntro`
2. `BootCastSelect` (Street Fighter coin board)
3. `AshoreComprehensionTutorial` (7 steps — skipped if experienced checkbox)
4. `CarpetOpeningIntro` → islands mode

**FTUE steps** (`ftueTelemetry.ts`): goal, walk, economy, decision, consequence, reward, deeper_strategy_hint

**Player modes** (`playerOnboarding/`):

- `new` | `experienced` | `returning` (≥72h absence)
- `onboardingComplete` separate from concept mastery
- `reconcileFtueQuestProofs` on every save update

**North star KPI:** Independent Transfer Rate (`docs/ftue/NORTH_STAR.md`)

**Telemetry stack:** `analytics/ftue/`, privacy sanitization, health dashboard ENGAGEMENT · LEARNING · BUSINESS categories

**Human playtest:** Pattern #94 PENDING — `docs/playtest/COLD_SESSION_OBSERVER_SCRIPT.md` ready; not executed

### DESIGN INFERENCES

- FTUE is **layered**: boot teach → hub coach → in-world Cove Take as real loop proof.
- Experienced mode is honesty checkbox, not save detection — returning players may still see Ashore unless they declare each boot.
- King KPI (ITR) infrastructure exists locally; remote cohort execution deferred.

### RECOMMENDATIONS

- **KEEP** Ashore → Harbor meet → Cove as first-hour path.
- **IMPROVE** — run Pattern #94 human playtest when ready; log ITR cohort.
- **SIMPLIFY** — resist adding coaches (Outfitter/Capsule/Ritual stay discoveries).

---

## 14. Save / state architecture

**Classification:** `KEEP` · `IMPROVE`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 4 |
| Causal clarity | 4 |
| Systemic depth | 4 |
| Emotional meaning | 4 |
| Narrative integration | 5 |
| Financial learning | 4 |
| UX clarity | 4 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Primary save:** `IslandSaveV1` (`types.ts`), version `"1"`, key `island_save_v1`

**Core fields:** questStatus, inventory, voyagerLedger, character, partyBoard, economyState, completedMinigames

**Narrative blobs:** harborScars, irreversibleChoices, stance, npcMemory, hubGuidedIntro, harborHomecoming, chapterQuietPending, scarSpectacle, conceptProgress, playerOnboarding, harborRitual, harborShop

**Persistence** (`save.ts`):

- Dual write: localStorage + Spark KV
- Merge by newer `updatedAt`
- `sanitizeIslandSave()` — corrupt save failsafe (Pillar 14)
- `migrateIslandSave()` — Harbor/Cove split migrations

**Kill switches** (`storageRegistry.ts`): telemetry, partyBoard, familyRooms, etc.

**Test coverage:** 642 tests across 119 files (vitest, 2026-08-19 run)

### DESIGN INFERENCES

- Single-player local-first; no cloud sync conflict resolution — appropriate for current product stage.
- Save version stayed `"1"` while fields grew additively — migration discipline needed if schema churn accelerates.

### RECOMMENDATIONS

- **KEEP** sanitize failsafe and dual-write pattern.
- **SIMPLIFY** save schema — audit dead fields (affinity, silent XP paths) for removal candidates per Complexity Cut.
- **IMPROVE** export/import story for classroom use (Family Room JSON path exists).

---

## 15. AI systems

**Classification:** `KEEP` (honest heuristics) · `MISSING` (LLM guide)

| Dimension | Score |
|-----------|------:|
| Player agency | 3 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 2 |
| Emotional meaning | 3 |
| Narrative integration | 3 |
| Financial learning | 3 |
| UX clarity | 4 |
| Technical maintainability | 5 |

### FACTS FOUND IN REPOSITORY

**Adaptive Coach** (`src/islands/gameSystems/adaptiveCoach.ts`):

- Header: *"Not a neural net — honest heuristics."*
- Inputs: save, learning profile, idle seconds, fail pressure, cashflow
- Nudge IDs: softlock, stuck, cashflow, explore
- Threshold: show if score ≥ 4.5; structural tips win unless stuck ≥ 7
- Explicitly ignores `skillStats`

**World director** (`worldDirector.ts`): idle ≥45s soft-lock detection; sky intent from cashflow/fail pressure

**Learning profiles** (`learningProfile.ts`): Explorer / Apprentice / Strategist — hint frequency scaling

**No LLM inference** in product path; `iconicProofLaw.ts` lists "fake multiplayer / Family Room backend" and giant sim / AI guide as chase-order gated.

### DESIGN INFERENCES

- "AI" in Capital means **director/coach heuristics** — honest and maintainable.
- Future LLM guide would be `MOVE_LATER` per freeze and constraint-play docs.

### RECOMMENDATIONS

- **KEEP** heuristic coach; maintain honesty in player-facing copy.
- **CONNECT** coach nudges to Coin Bag tips — avoid dual coaching.
- **IMPROVE** policy toward productive struggle — see [AI_GUIDE_ARCHITECTURE.md](../ai/AI_GUIDE_ARCHITECTURE.md) (assistance ladder, transfer lock, context pack) and [AI_GUIDE_GUARDRAILS.md](../ai/AI_GUIDE_GUARDRAILS.md) (allow/deny + PromptPack).
- **MOVE_LATER** any neural guide until ITR baseline established.

---

## 16. Telemetry

**Classification:** `KEEP` · `IMPROVE` (remote cohort)

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 3 |
| Emotional meaning | 2 |
| Narrative integration | 3 |
| Financial learning | 5 |
| UX clarity | 4 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Client:** `src/islands/analytics.ts` → ConsoleAndKVSink; cap 2,000 stored events

**Event taxonomy** (`types.ts`): 40+ event names including FTUE lifecycle, `decision_committed`, `concept_transfer`, `core_loop_beat`, `take_foreshadow`, `harbor_purchase`

**Submodules:**

- `analytics/funnel.ts` — 5-min onboarding funnel
- `analytics/ftue/` — privacy sanitization, segmented metrics
- `analytics/healthDashboard.ts` — ENGAGEMENT · LEARNING · BUSINESS damage flags
- `analytics/export.ts` — CSV/JSON export UI

**Docs:** `docs/design/LEARNING_TELEMETRY.md`, `docs/design/HEALTH_DASHBOARD.md`

**Kill switch:** `capital_kill_telemetry`

**Business metric note:** in-game pouch coins from harbor_purchase — not USD

### DESIGN INFERENCES

- Telemetry is local/KV-first, privacy-conscious — aligned with kid/family product.
- Remote cohort execution is the gap between infrastructure and king KPI validation.

### RECOMMENDATIONS

- **KEEP** FTUE event taxonomy and health dashboard.
- **IMPROVE** — execute Pattern #94 + ITR cohort when remote sink/recruitment ready.
- **CONNECT** `core_loop_beat` events to iconic checklist failures in playtest logs.

---

## 17. Accessibility

**Classification:** `KEEP` · `IMPROVE`

| Dimension | Score |
|-----------|------:|
| Player agency | 4 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 2 |
| Emotional meaning | 3 |
| Narrative integration | 2 |
| Financial learning | 3 |
| UX clarity | 4 |
| Technical maintainability | 4 |

### FACTS FOUND IN REPOSITORY

**Settings** (`settings.ts` → `island_settings_v1`):

- `textSize`: normal | large | xl
- `reducedMotion`, `highContrast`, `guideArrows` (Coin Bag wayfinder)
- `musicEnabled`, `musicVolume`

**Motion** (`a11yMotion.ts`):

- `prefersReducedMotion()` = OS OR settings
- `cinemaTimeScale()`, `cinemaFlashAmp()` — flash → 0 under reduce

**Tests:** `a11yFailsafeCraft.test.ts` — interior beacon, share overlay high contrast, shore motion settings-aware

**3D failsafe:** flat hotspot fallback if Canvas hangs

**FTUE audit doc:** `docs/ftue/FTUE_ACCESSIBILITY_AUDIT.md`

**Iconic checklist:** reduced motion path for Take/Plinth strobes

### DESIGN INFERENCES

- A11y is first-class for signature loop cinema — not bolt-on.
- Full screen-reader audit coverage not provable from architecture alone.

### RECOMMENDATIONS

- **KEEP** reduced-motion cinema scaling.
- **IMPROVE** — dedicated SR pass on Talk Battle + share overlay text alternatives.
- **IMPROVE** — verify side shore 3D fallback on low-end devices in human playtest.

---

## 18. Monetization

**Classification:** `MISSING` (real revenue) · `KEEP` (in-game economy)

| Dimension | Score |
|-----------|------:|
| Player agency | 3 |
| Decision quality | 3 |
| Causal clarity | 4 |
| Systemic depth | 2 |
| Emotional meaning | 2 |
| Narrative integration | 2 |
| Financial learning | 4 |
| UX clarity | 5 |
| Technical maintainability | 5 |

### FACTS FOUND IN REPOSITORY

**No Stripe/checkout/subscription code** in repository.

**In-game Harbor shop** (`harborShop.ts`):

- Capsules: 40–70 coins
- Companions: tortoise free, finch 30, etc.
- Plaza pass: 80 coins
- Carpet polish markup: 35%
- Prices scaled by `scaleHarborPrice()` from cashflow-reactive weather

**Legal/UX:** ConsentDialog — "No real money is involved"; SecureFooter — practice data only

**Analytics:** `harbor_purchase` event; health dashboard BUSINESS category tracks in-game conversion only

### DESIGN INFERENCES

- Monetization model today is **pedagogical game economy** (coin sinks for retention), not IAP/subscription.
- Any future Stripe integration (branch names in agent history) is not present in this snapshot.

### RECOMMENDATIONS

- **KEEP** honest "no real money" positioning for iconic phase.
- **MOVE_LATER** real-money monetization until ITR and iconic loop validated with humans.
- **MISSING** — business model decision: subscription vs one-time vs B2B classroom — not in repo.

---

## 19. Additional systems (cross-cut)

| System | Classification | Notes |
|--------|----------------|-------|
| **Minigames (24 registered)** | `KEEP` · `IMPROVE` | Registry in `minigames/registry.ts`; kinesthetic-first routing; Credit Inbox→Scanner→Take |
| **Party board** | `KEEP` · `SIMPLIFY` | Post-Freedom toy; stars decoupled from Freedom |
| **Arcade** | `MOVE_LATER` | Spine-only replay; demote from first hour |
| **VibeCode Studio** | `MOVE_LATER` | User level authoring; community storage |
| **Family Room** | `KEEP` | Local-only; Zod-validated import; no server (`familyRoom.ts`) |
| **Mastery quiz** | `SIMPLIFY` | Optional digression; never gates Credit |
| **Harbor ritual** | `SIMPLIFY` | Daily/weekly; streak +5 chrome removed |
| **Concept progression** | `KEEP` · `CONNECT` | ITR king KPI alignment |
| **Market sim minigame** | `CONNECT` | Deep sim; partial ledger integration |
| **Legacy questSystem.ts** | `REMOVE` or `MOVE_LATER` | Parallel to Islands quests |
| **Skill stats** | `REMOVE` | No-op on product path |
| **Human playtest gate** | `MISSING` | Pattern #94 infrastructure ready; execution pending |
| **Remote analytics sink** | `MISSING` | Local KV only |
| **Economy batch harness** | `MISSING` | Referenced in Bible; not in repo |

---

## System classification summary

| System | Classification |
|--------|----------------|
| Player fantasy | KEEP |
| Signature loop | KEEP |
| Core campaign loop | KEEP · CONNECT |
| Player verbs | KEEP · IMPROVE |
| Voyager Ledger / Freedom | KEEP |
| Pouch economy | KEEP · SIMPLIFY |
| Macro economy | CONNECT · IMPROVE |
| Economic simulation (aggregate) | CONNECT · IMPROVE |
| Story / world memory | KEEP |
| Quest architecture (Islands) | KEEP |
| Legacy quest system | REMOVE / MOVE_LATER |
| NPC / relationships | KEEP · SIMPLIFY |
| Progression gates | KEEP · CONNECT |
| Exploration / 3D shores | KEEP · IMPROVE |
| World structure / archipelago | KEEP |
| Money Structures | KEEP |
| UI / HUD | KEEP · IMPROVE |
| Onboarding / FTUE | KEEP · IMPROVE |
| Save architecture | KEEP · IMPROVE |
| Adaptive coach (heuristics) | KEEP |
| LLM / neural guide | MISSING · MOVE_LATER |
| Telemetry (local) | KEEP |
| Telemetry (remote cohort) | MISSING · IMPROVE |
| Accessibility | KEEP · IMPROVE |
| Real-money monetization | MISSING · MOVE_LATER |
| In-game monetization sinks | KEEP |
| Family Room | KEEP |
| Party board | KEEP · SIMPLIFY |
| Arcade / Studio | MOVE_LATER |
| Human playtest | MISSING |
| Side shores (8) | KEEP · IMPROVE |
| Content depth enforcement | KEEP |

---

## Aggregate health (weighted judgment)

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| Player agency | **4.0** | Strong Takes; some coach/HUD competition |
| Decision quality | **4.2** | Irreversible forks real; side systems occasionally fake |
| Causal clarity | **3.8** | Signature loop clear; macro economy less so |
| Systemic depth | **3.6** | Scar↔ledger↔weather connected; parallel langs remain |
| Emotional meaning | **4.5** | Signature cinema is product moat |
| Narrative integration | **4.6** | Stateful scars/plinth/day-2 excellent |
| Financial learning | **4.4** | Constraint-play honest; ITR unmeasured in humans |
| UX clarity | **3.5** | Dual views/currencies; early chrome risks |
| Technical maintainability | **4.2** | 642 tests; bounded systems; some schema debt |

**Overall:** Capital is **architecturally coherent** for iconic phase ship. Primary risk is not missing code — it is **unvalidated human transfer** and **residual complexity** competing with the signature loop in the first hour.

---

## P0 / P1 / P2 Roadmap

### P0 — Ship truth (before calling iconic phase "done")

| # | Item | Classification | Rationale |
|---|------|----------------|-----------|
| P0-1 | Execute Pattern #94 cold human playtest | MISSING → IMPROVE | Only remaining production gate; observer script ready |
| P0-2 | Log Independent Transfer Rate cohort (even n=5–10) | IMPROVE | King KPI infrastructure exists; no human validation |
| P0-3 | Verify post-Cove side shore discovery on production map (no playtest flag) | IMPROVE | Lock logic clear; UX discovery unverified |
| P0-4 | Freedom vs endgame player messaging pass | IMPROVE | Step 4 vs step 5 confusion risk |
| P0-5 | One-coach first hour audit (Ashore + Piggy only) | SIMPLIFY | Complexity Cut item; regression check after rewrite |

### P1 — Connect and deepen (next craft sprint)

| # | Item | Classification | Rationale |
|---|------|----------------|-----------|
| P1-1 | Spine Take → weather → shop causal lines in player copy | CONNECT | Code exists (`spineTakeFootprints`, `harborWeather`); verify felt |
| P1-2 | Story of Capital pass: NPC arcs vs story-circle docs | IMPROVE | Content rewrite done; voice coherence next |
| P1-3 | Gameplay ability pass: verb clarity during play | IMPROVE | User-stated next focus after audit |
| P1-4 | Money Structure interior depth (Jar · Bank · Tower · Keep) | KEEP · IMPROVE | Iconic freeze preferred deepening vector |
| P1-5 | Side shore cold-retell + organ consistency vs Cove bar | IMPROVE | 8 shores live; depth bar met; craft bar may not |
| P1-6 | Deprecate legacy `questSystem.ts` from product path docs | SIMPLIFY | Dual paradigm confusion |
| P1-7 | Save schema dead-field audit (affinity, silent XP) | SIMPLIFY | Complexity Cut follow-through |

### P2 — Later / gated

| # | Item | Classification | Rationale |
|---|------|----------------|-----------|
| P2-1 | Remote analytics sink + cohort tooling | MISSING | Required for scale ITR |
| P2-2 | Economy batch simulation harness | MISSING | Balance at scale |
| P2-3 | Real-money monetization (Stripe) | MOVE_LATER | Not in repo; chase after iconic proof |
| P2-4 | LLM adaptive guide | MOVE_LATER | Constraint-play deferred |
| P2-5 | Arcade + Studio first-hour demotion completion | MOVE_LATER | Longevity systems |
| P2-6 | Full screen-reader accessibility audit | IMPROVE | Beyond reduced-motion cinema |
| P2-7 | Side shore narrative deepening (100h longevity) | IMPROVE | `docs/LONGEVITY_100H.md` |

---

## Audit methodology

1. Read design constitution: `CAPITAL_DESIGN_BIBLE.md`, `iconic-path.md`, `CONSTRAINT_PLAY_TRUTH.md`
2. Trace runtime orchestration: `IslandsApp.tsx`, `mainCourse.ts`, `progressGates.ts`, `chapterLoop.ts`
3. Verify financial truth: `voyagerLedger.ts`, `partyBoard.ts`, `spineTakeFootprints.ts`
4. Verify narrative state: `worldMemory.ts`, `digressionShelf.ts`, story-circle docs
5. Run test suite: 642/642 pass (2026-08-19)
6. Cross-check content: 12 live island JSON packs, depth tests, production lock flag

**This audit did not modify production code.**
