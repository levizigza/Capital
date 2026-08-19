# Capital — Player Verb Matrix

**Date:** 2026-08-19  
**Companion:** [PLAYER_FANTASY.md](./PLAYER_FANTASY.md) · [CAPITAL_MASTER_AUDIT.md](./CAPITAL_MASTER_AUDIT.md)

**Legend**

| Column | Meaning |
|--------|---------|
| **Tier** | S = spine · A = consequential · B = session · C = presence · D = busywork |
| **Story** | Y = Harbor/scar retell · P = partial · N = none |
| **Transfer** | Y = supports ITR · P = partial · N = none |
| **BW** | ⚠️ = flagged busywork |

**Fantasy pillars:** BL = Build life · EA = Economic agency · AU = Adapt uncertainty · OP = Create opportunities · RE = Relationships · CW = Change world

---

## 1. Boot & identity

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **choose_cast** | Pick Voyager on coin board | `BootCastSelect` → `StreetFighterCoinSelect` | express | BL, RE | `character`, `playerOnboarding`, starter companion | Cast identity | Persistent look + companion | P | N | A | |
| **declare_experienced** | “I've played before” | `BootCastSelect` checkbox | adapt | EA | `playerOnboarding.declaredMode` | Skip Ashore? | Reduced FTUE scaffolding | N | N | A | |
| **customize_look** | Customize appearance | `CharacterCreator` in boot | express | BL | `character` draft | Outfit choices | Saved on continue | P | N | A | |
| **complete_ashore_teach** | Finish Ashore chambers | `AshoreComprehensionTutorial.finish` | learn | EA | FTUE telemetry only | Step progression | `onboardingComplete` path | N | P | C | ⚠️ tutorial |
| **skip_intro** | Skip title / carpet intro | `CapitalOpeningIntro`, `CarpetOpeningIntro` | — | — | session | — | — | N | N | C | |
| **land_harbor** | Arrive Harbor from carpet | `CarpetOpeningIntro.finish` | travel | CW | session flag `capital_boot_land_hub` | — | Hub view | N | N | C | |

---

## 2. Movement & presence

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **walk** | Walk plaza / shore | `WalkableHarborView`, `WalkableIslandExplore`, WASD | explore | BL, CW | position (no save) | — | — | N | N | C | ⚠️ alone |
| **touch_walk** | Drag to walk (mobile) | `TouchWalkPad` | explore | BL | intent vector | — | — | N | N | C | ⚠️ alone |
| **approach_hotspot** | Near store / journal / structure | Proximity prompts | explore | OP | UI only | — | Interact prompt | N | N | C | |
| **toggle_guide_arrows** | Coin Bag wayfinder | `HomeHubView.toggleGuide` | adapt | EA | `settings.a11y.guideArrows` | — | Visual aid | N | N | C | |
| **open_settings** | Settings panel | `menu` binding, Hub modal | — | — | `island_settings_v1` | Profile, a11y, juice | Persisted prefs | N | N | C | |
| **leave_overlay** | Esc · Leave | `useOverlayEscape` | — | — | UI stack | — | Dismiss cinema | N | N | C | |

---

## 3. Travel & voyage

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **open_map** | Open Money Carpet map | Hub `travel` hotspot, `map` key | travel | OP, EA | `hubGuidedIntro`, view `travel` | Which island? | Gate hints if locked | P | N | C | |
| **select_island** | Choose painting / shore | `TravelMapView.beginVoyage` | travel | OP, EA | `voyageTargetId`, progress gates | Destination under constraints | Voyage start / lock toast | P | N | A | |
| **voyage** | Carpet flight | `PovVoyageView`, `CarpetFlightView` | travel | CW | view, music | Boost hold | Arrival timing | N | N | C | |
| **arrive_island** | Land on shore | `enterIsland`, `handleArrive` | explore | OP | `currentIslandId`, `discovered` | — | Shore explore default | P | N | C | |
| **board_boat_free** | Board carpet (no target) | `boardBoat()` | travel | OP | voyage | — | Free roam flight | N | N | C | |
| **cancel_voyage** | Leave carpet mid-flight | `cancelVoyage` | — | — | view stack | — | Return prior view | N | N | C | |
| **return_harbor** | Sail home | Travel / chapter Leave | travel | RE, CW | view `home` | — | Harbor state reads scars | P | N | C | |

---

## 4. Social & talk

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **talk** | Talk (E) | `openNpcDialogue`, `TalkBattleScreen` | talk | RE, EA | `discovered.npcs`, `npcMemory` | Dialogue branch | Effects chain | Y | P | A | |
| **continue_dialogue** | Advance line | `onDialogueContinue` | talk | RE | dialogue state | — | Next node | N | N | C | |
| **leave_talk** | End conversation | `finishTalk`, Esc | talk | RE | `npcMemory`, ritual weekly talk | — | Piggy homecoming clear | P | N | C | |
| **take** | Irreversible Take | `setIrreversible` effect | commit | EA, CW, BL | `irreversibleChoices`, ledger footprint | Jar/treat, umbrella/glitter, wait/haste | Scar + hush + homecoming | Y | Y | S | |
| **leave_scar** | World marks choice | `addScar` effect | commit | CW, RE | `harborScars`, `stance`, `chapterQuietPending` | Side digression branch | Plinth, gossip, day-2 | Y | P | S | |
| **start_quest_talk** | Accept quest from NPC | `startQuest` effect | — | OP | `questStatus` | Start chain | Objectives open | P | N | A | |
| **complete_quest_talk** | Quest step in dialogue | `completeQuest` effect | — | EA | `questStatus.completed` | — | Rewards, homecoming | Y | P | S | |
| **give_item_talk** | Receive item | `giveItem` → `collectItem` | — | OP | `inventory` | — | Quest progress | P | N | A | |
| **start_minigame_talk** | NPC sends to pad | `startMinigame` effect | learn | EA | minigame modal | — | Kinesthetic redirect if needed | P | P | B | |

---

## 5. Quests & journal

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **start_quest** | Start quest (journal) | `startQuest` | — | OP | `questStatus.started` | Commit to chain | Objectives active | P | N | A | |
| **complete_objective** | Finish talk/collect/minigame obj | `completeObjective` | work/learn | EA | `completedObjectives` | — | Quest progress | P | P | A | |
| **complete_quest** | Finish quest chain | `maybeCompleteQuest` | — | EA, CW | rewards, `harborHomecoming`, timeline | — | Unlock next painting | Y | Y | S | |
| **collect_item** | Pick up item | `collectItem` | explore | OP | `inventory`, `discovered.items` | — | Objective credit | P | N | A | |
| **enter_area** | Enter journal area | `enterArea` | explore | OP | `currentAreaId`, `discovered.areas` | — | Area scene | N | N | C | |
| **browse_journal** | Quest / bag tabs | `IslandPlayView` sections | — | — | read-only | — | — | N | N | C | ⚠️ |
| **open_journal_shore** | Financial Quest Journal pad | Shore hotspot `journal` | — | EA | embed `IslandPlayView` | — | — | N | N | C | |

---

## 6. Money commit — ledger & board

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **payday** | Pay Day (board / ritual) | `applyPayday`, board `payday` space | work | BL, EA | `voyagerLedger`, pouch coins, escape streak | — | CF income, Freedom progress | Y | P | S | |
| **pay_bill** | Bill space | `applyBill`, board `bill` | spend | AU, BL | ledger expenses, coins | — | CF drops | P | P | A | |
| **buy_deal** | Accept deal | `resolveDealOffer(true)` | buy, invest | OP, BL | holdings, pouch | Opportunity vs cost | Asset/liability holding | P | P | A | |
| **pass_deal** | Pass on deal | `resolveDealOffer(false)` | refuse | EA | — | Opportunity cost | — | P | P | A | |
| **borrow** | Borrow on liability | `resolveLiabilityOffer("borrow")` | borrow | AU, EA | ledger liability | Debt vs liquidity | Monthly drag | P | P | A | |
| **repay** | Buy out liability | `resolveLiabilityOffer("buyout")` | repay | EA | ledger, coins | Lump sum vs walk | Remove liability | P | P | A | |
| **refuse_debt** | Walk from liability | `resolveLiabilityOffer("walk")` | refuse | EA | — | Avoid obligation | — | P | P | A | |
| **claim_cashflow** | Cashflow Claim (seal space) | `makeBoardCashflowClaim` | save, invest | BL, EA | pouch → monthly CF | Spend coins for CF | Ledger holdings | P | P | A | |
| **roll_dice** | Roll on board | `IslandBoardView.handleRoll` | compete | AU | `partyBoard` position, turns | Random + item use | Space resolve | N | N | B | |
| **use_capsule_item** | Use Fortune Capsule | `usePartyItem` | adapt | AU | buffs, rivals | Tactical | Board advantage | N | N | B | |

---

## 7. Harbor shop & expression

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **buy_capsule** | Buy capsule item | `applyCapsulePurchase` | buy | BL | pouch, `partyBoard.items` | Coin sink vs utility | Board items | N | N | A | |
| **polish_carpet** | Polish carpet tier | `applyCarpetPolish` | express | BL, OP | `harborShop.carpetTierId`, coins | Vanity vs save | Travel presentation | P | N | A | |
| **buy_plaza_pass** | Buy market room pass | `applyPlazaPass` | buy | OP | `harborShop.unlockedRooms` | Access vs coins | Market modal | N | N | A | |
| **adopt_companion** | Adopt pet | `applyCompanionPurchase` | express | RE, BL | `ownedCompanions`, coins | Companion choice | Plaza presence | P | N | A | |
| **save_outfit** | Save look | `saveCharacter`, Outfitter | express | BL | `character` | Identity | Persistent avatar | P | N | A | |
| **fair_trade_pasaran** | Pasaran buyer/seller rounds | `HarborMarketOverlay` | sell, buy | OP | local round score only | Trade rounds | **No save write** | N | N | D | ⚠️ |
| **hub_guided_dock** | Open map (FTUE) | `onHubGuidedEvent("opened_map")` | travel | EA | `hubGuidedIntro` | — | FTUE step | N | N | C | |

---

## 8. Money structures

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **enter_structure** | Enter Jar / Bank / Tower / Keep | Structure hotspot → interior | explore | CW, OP | overlay, music | — | Interior pads | P | N | C | |
| **play_structure_pad** | Play part minigame | `onPlayStructureMinigame` | learn, work | EA | minigame complete path | Score threshold | Quest / coins / ledger | P | P | B | |
| **soft_beat_peek** | Quiet peek (lookout/teller/…) | `SoftBeatOverlay` | explore | CW, RE | cinema | — | Curiosity beat | P | N | C | |
| **exit_structure** | Leave interior | `MoneyStructureInteriorView.onExit` | — | — | view | — | Return shore | N | N | C | |

---

## 9. Minigames (by literacy family)

| Verb | Player-facing | Component | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-----------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **sort_coins** | Coin sort | `ModularMinigame` / cove pads | learn | EA | score, quest obj | Allocation | Objective | P | P | B | |
| **catch_coins** | Coin catcher | `CoinCatcherMinigame` | work | EA | score | Timing | Quest / coins | P | N | B | |
| **split_budget** | Budget split | `BudgetSplitterGame` | save, spend | EA, BL | timeline → ledger | Buckets | Holdings if wired | P | Y | A | |
| **balance_budget** | Budget balancer | `BudgetBalancerMinigame` | save, spend | EA | score | Trade-offs | Credit path | P | P | A | |
| **scan_signal** | Score scanner | `SignalScannerGame` | research | EA, AU | score | Credit spiral step | Rex fork unlock | P | P | A | |
| **inbox_storm** | Inbox storm | structure/budget pads | adapt | AU | optional scar | Triage | Side scar | P | P | B | |
| **compound_snowball** | Compound snowball | `CompoundSnowballGame` | invest | BL | score | Time horizon | Coins / optional | P | P | B | |
| **explore_puzzle** | Explorable puzzle | `ExplorablePuzzleGame` | explore, research | EA | score | Path | Credit side | P | P | B | |
| **party_dash** | Party dash arena | `PartyDashMinigame` | compete | AU | course world | Movement | Painting world | N | N | B | |
| **party_arena** | Party arena | `PartyArenaMinigame` | compete | AU | course world | Movement | Painting world | N | N | B | |
| **paper_trade** | Paper trading | `PaperTradingGame` | invest | OP | market sim | Trades | Session score | P | P | B | |
| **property_auction** | Property auction | `PropertyAuctionGame` | buy, invest | OP | bid choices | Price vs value | Session | P | P | B | |
| **life_fork** | Life fork quiz | `LifeForkGame` | learn | EA | choices | Branch | Low persistence | N | P | D | ⚠️ quiz-like |
| **retry_minigame** | Retry after fail | `MinigameFailOverlay` | adapt | EA | hints | Try again | Information | P | Y | A | |
| **abandon_minigame** | Keep walking | `handleMinigameFailWalk` | refuse | EA | — | — | Dignity preserved | N | N | C | |
| **mastery_quiz** | Optional mastery worksheet | `MasteryQuiz` | learn | EA | `masteryClears` | Quiz answers | Optional clear | N | N | D | ⚠️ |

*24 minigame components registered in `minigames/registry.ts`; side-shore pads reuse literacy families above.*

---

## 10. Harbor memory & signature loop

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **watch_spectacle** | Harbor felt that | `ScarSpectacleOverlay` | — | CW, RE | cinema | — | Emotional peak | Y | N | C | |
| **share_felt_card** | Share / download PNG | `HarborFeltShareOverlay` | share | RE, CW | OS share | — | Social object | Y | N | C | |
| **witness_reaction** | Cheer / caution / curious | `recordShareWitness` | help | RE | `familyRoom.witnesses` | Stance | Local myth | P | N | B | |
| **day2_echo** | Still here cinema | `Day2EchoOverlay` | — | CW, RE | `echoSurpriseSeen` | Visit plinth | Scar persistence felt | Y | N | C | |
| **read_plinth** | Memory Plinth | Hub `memory` modal | — | CW, RE | scars, digression myths | — | Cold retell read | Y | N | C | |
| **dismiss_hush** | After Take hush | `dismissTakeHush` | — | CW | UI quiet | — | Resume shore | N | N | C | |

---

## 11. Harbor ritual & meta

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **hear_rumor** | Daily rumor | `onMarkRitualRumor` | — | RE | `harborRitual.today.rumorSeen` | — | Gossip tick | N | N | D | ⚠️ |
| **ritual_payday** | Claim ritual Pay Day | `onClaimRitualPayday` | work | BL, EA | `applyPayday`, coins | — | Same as board Pay Day | P | P | A | |
| **copy_share_line** | Copy weekly line | Ritual modal | share | RE | clipboard | — | — | N | N | D | ⚠️ |
| **open_ritual** | Daily Ritual modal | Hub `ritual` | — | — | UI | — | — | N | N | C | |
| **open_pavilion** | Freedom Pavilion | Hub `pavilion` (gated) | explore | EA, OP | Freedom required | — | Room access | P | N | C | |
| **exit_game** | Leave Archipelago | `handleExit` | — | — | analytics | — | Shell exit | N | N | C | |

---

## 12. Family Room (local)

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **create_room** | Create Family Room | `createFamilyRoom` | partner | RE | local KV | Room name | Code | P | N | B | |
| **join_room** | Join with code | `joinFamilyRoom` | partner | RE | local index | — | Membership | P | N | B | |
| **import_room** | Paste room JSON | `importFamilyRoomJson` | partner | RE | Zod validate | Trust import | Re-keyed room | P | N | B | |
| **post_challenge** | Post household challenge | `postFamilyChallenge` | help | RE | `familyRoom.challenge` | Challenge kind | Local goal | P | N | B | |
| **mark_cleared** | “I cleared it” | `completeFamilyChallenge` | help | RE | completions list | Honor system | **No verify** | N | N | D | ⚠️ |
| **leave_room** | Leave room | `leaveFamilyRoom` | — | RE | active pointer | — | — | N | N | C | |

---

## 13. Arcade & studio

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **open_arcade** | Harbor Arcade | Hub/board → `ArcadeView` | explore | OP | view | Filter games | Replay | N | N | C | |
| **play_arcade** | Replay cleared game | `playArcadeGame` | learn | EA | minigame path | Score | Coins if any | N | N | D | ⚠️ |
| **open_studio** | VibeCode Studio | Hub/journal → `VibeCodeStudio` | build | CW | view | — | Authoring | N | N | C | |
| **author_level** | Vibe-code / edit JSON | `applyPrompt`, `applyJson` | build | CW | draft level | Design | Local draft | N | N | B | |
| **playtest_level** | Playtest draft | `VibeLevelPreview` | learn | EA | local | — | `bumpPlays` | N | N | D | ⚠️ |
| **publish_level** | Publish to gallery | `publish` → community storage | build | CW | `harborStudioMarks` | Share level | Plaza stamp | P | N | B | |
| **hide_community_level** | Hide from gallery | `hideCommunityLevel` | refuse | — | local | — | — | N | N | D | ⚠️ |

---

## 14. Learning & adaptation (meta)

| Verb | Player-facing | Code anchor | Canonical | Pillars | Systems | Decisions | Consequences | Story | Transfer | Tier | BW |
|------|---------------|-------------|-----------|---------|---------|-----------|--------------|-------|----------|------|-----|
| **change_learning_profile** | Explorer / Apprentice / Strategist | `SettingsPanel` | adapt | EA | thresholds, copy | Hint density | Easier/harder hints | N | P | A | |
| **concept_phase_advance** | Concept mastery (implicit) | `conceptProgression/engine` | learn | EA | `conceptProgress` | Transfer tasks | INDEPENDENT phase | Y | Y | S | |
| **receive_coach_nudge** | Coin Bag tip | `adaptiveCoach`, `coinBagBuddy` | adapt | EA | heuristics | — | Next verb hint | P | P | C | |
| **replay_ashore** | Replay Ashore teach | Settings → tutorial overlay | learn | EA | FTUE | — | — | N | P | D | ⚠️ |
| **returning_briefing** | Returning player summary | `ReturningPlayerBriefing` | — | EA | read `nextMainCourseStep` | — | Orientation | N | N | C | |
| **export_analytics** | Export learning events | `AnalyticsExportView` | — | — | KV read | — | CSV/JSON | N | N | C | |

---

## Canonical family rollup

| Canonical family | Shipped verbs (count) | Tier S/A | Busywork | Transfer Y |
|------------------|----------------------:|---------:|---------:|-----------:|
| **explore** | walk, approach, enter_structure, soft_beat, open_map, journal, arcade browse | 4 | 5 | 0 |
| **travel** | select_island, voyage, arrive, return_harbor, board_boat | 2 | 3 | 0 |
| **talk** | talk, continue, leave_talk | 3 | 2 | 0 |
| **commit / take** | take, leave_scar | 2 | 0 | 2 |
| **save** | payday, claim_cashflow, budget splits, Cove jar Take | 5 | 1 | 2 |
| **spend** | pay_bill, treat Take, shop buys, board costs | 8 | 2 | 1 |
| **work / earn** | payday, ritual_payday, coin minigames | 4 | 2 | 1 |
| **buy** | buy_deal, buy_capsule, polish, plaza pass, companion, property pads | 10 | 2 | 1 |
| **sell** | fair_trade_pasaran only | 0 | 1 | 0 |
| **borrow** | borrow, Credit haste Take | 2 | 0 | 1 |
| **repay** | buyout, patience Take | 2 | 0 | 1 |
| **invest** | deals, compound pads, paper trade, claim_cashflow | 6 | 3 | 2 |
| **refuse / pass** | pass_deal, walk liability, abandon minigame | 4 | 0 | 2 |
| **negotiate** | talk forks (not price haggle) | 1 | 0 | 1 |
| **learn** | minigames, mastery_quiz, ashore, concept phases | 3 | 4 | 2 |
| **research** | signal scan, explorable puzzle | 2 | 0 | 1 |
| **help** | witness, family challenge | 0 | 2 | 0 |
| **partner** | family room join/create/import | 0 | 0 | 0 |
| **compete** | board roll, rivals, party dash/arena | 0 | 4 | 0 |
| **share** | share_felt_card, copy_share_line | 1 | 1 | 0 |
| **adapt** | learning profile, coach, weather-priced shop | 3 | 2 | 1 |
| **express** | cast, outfit, companion, carpet | 5 | 0 | 0 |
| **build** | studio publish | 0 | 2 | 0 |
| **insure** | — | 0 | 0 | 0 |
| **hire** | — | 0 | 0 | 0 |

---

## Busywork register (⚠️)

Verbs that exist primarily as **retention, practice, or navigation** without judgment depth:

| Verb | Why busywork | Recommendation |
|------|--------------|----------------|
| Ashore teach steps (except cast) | No save scar; tutorial theater | KEEP pre-Cove only; persist experienced flag |
| hear_rumor | Retention tick | Demote post-Cove or tie to scar echo |
| fair_trade_pasaran | No ledger write | CONNECT to pouch or cut from first hour |
| play_arcade | Replay without quest | MOVE_LATER until post-Change |
| mastery_quiz | Worksheet recall | KEEP optional; never gate |
| mark_cleared (Family) | Honor system | KEEP local myth only |
| playtest_level | Draft loop | Studio-only |
| hide_community_level | Metadata | Fine |
| walk / voyage alone | No commit | Required presence |
| browse_journal / journal tabs | Read-only | Fine as support |
| hub proximity flags | FTUE telemetry | Fine |
| life_fork quiz pad | Quiz-shaped | Side shore only |
| copy_share_line | Clipboard | Fine as social utility |

---

## Missing verbs (primary fantasy gaps)

| Example verb | Status | Notes |
|--------------|--------|-------|
| **hire** | MISSING | No labor market |
| **insure** | MISSING | `shield_ledger` is board buff, not insurance |
| **negotiate** (price) | PARTIAL | Talk forks only |
| **sell** (persistent) | WEAK | Pasaran only |
| **build** (economic) | PARTIAL | Studio ≠ economic building |
| **research** (deep) | PARTIAL | Literacy pads, not research tree |

---

## Spine verb chain (minimum viable story)

The **smallest set of verbs** that deliver the full primary fantasy on a cold playthrough:

```
choose_cast → walk → talk (Piggy) → travel (Cove) → explore → talk (Take)
→ travel (home) → watch_spectacle → share_felt_card → talk (Piggy homecoming)
→ [transfer surface: Paycheck talk Take] → payday… → freedom → Credit take
```

Every other verb is **optional depth** (structures, board, side shores, shop, Family Room, studio).

---

## Maintenance

When adding a player action in `IslandsApp.tsx` or a new hotspot:

1. Add a row to the appropriate section above  
2. Assign tier, story, transfer, and busywork flag  
3. Map to canonical family + fantasy pillar  
4. Cross-check [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) Principle 3 (trade-offs) and Principle 10 (curiosity vs checklist)
