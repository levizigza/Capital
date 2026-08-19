# Capital — Progression Audit

**Date:** 2026-08-19  
**Scope:** Read-only audit of every shipped progression reward and gate in the Islands product path. No production code modified.  
**Unlock test (mandatory):** *What new decision does this allow?*  
**Companions:** [PROGRESSION_TAXONOMY.md](./PROGRESSION_TAXONOMY.md) · [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) · [AUTONOMY_PROGRESSION.md](../ftue/AUTONOMY_PROGRESSION.md) · [CONCEPT_MASTERY_PEDAGOGY.md](./CONCEPT_MASTERY_PEDAGOGY.md) · [PLAYER_FANTASY.md](./PLAYER_FANTASY.md) · [QUEST_AUDIT.md](../narrative/QUEST_AUDIT.md)

**Identity law:** Do not ask the player to choose a financial personality. Cast look is costume. Archetype readouts (Holder, Escaped, haste-scarred) emerge from irreversible Takes and ledger residue — never from a creation menu.

---

## Executive summary

Capital’s **strong progression** is decision-bearing: spine Takes → scars → access → CF-driven Freedom → Credit Ordeal. The product correctly retires several hollow RPG layers (Board Stars, minigame XP, skill-stat mutation) on the Islands path.

**Remaining hollow progression** still exists in schema, content, or legacy surfaces: quest JSON `xp` fields (unused at runtime), wealth rank ladder in `WealthHud`, carpet tiers beyond Fortune flyer, learning-profile percentage scalers, daily ritual streak theater, and a full legacy `ProgressionSystem` (skill tree + achievements) in the old game engine — not wired to `IslandsApp`.

**Credit gate** is fixed to **Freedom Seal + Paycheck Change** (`BOSS_MASTERY_REQUIRED = 0`). Mastery quizzes survive as **optional digression worksheets**, not spine locks — correct direction.

---

## Methodology

### Sources audited

| Layer | Primary files |
|-------|---------------|
| Spine gates | `progressGates.ts` · `chapterLoop.ts` · `mainCourse.ts` · `spineArchipelago.ts` |
| Financial progression | `voyagerLedger.ts` · `harborShop.ts` · `boats.ts` · `wealth.ts` |
| Knowledge / coach | `conceptProgression/` · `masteryGate.ts` · `hubGuidedIntro.ts` / `storyBible.ts` |
| World memory / identity | `worldMemory.ts` · `harborRitual.ts` · `softBeatArm.ts` |
| Side / collection | `partyBoard.ts` · `partyItems.ts` · `harborShop.ts` |
| Content rewards | `src/islands/content/*.islands.json` |
| Legacy (non-Islands) | `src/game/systems/ProgressionSystem.ts` · dashboard components |

### Reward categories (this audit)

| Category | Meaning | Progresses when… |
|----------|---------|------------------|
| **KNOWLEDGE** | Concepts understood; coach can go quiet | Transfer passes, concept phases, mastery digression |
| **SKILL** | Execution under pressure | Minigame clears, profile thresholds, assist decay |
| **ACCESS** | Places / systems reachable | Map pins, Pavilion, side shores, Credit, structure interiors |
| **RESOURCES** | Stocks that fuel decisions | Pouch, CF, holdings, capsules, deals |
| **REPUTATION** | How the world speaks of you | Scars, rumors, Witness stamps, Piggy tone |
| **RELATIONSHIPS** | NPC bond depth | Homecomings, talk memory, bond counter |
| **FINANCIAL CAPABILITY** | New money verbs / instruments | Deals, borrow/wait, Pay Day streak, board seal spaces |
| **PLAYER IDENTITY** | Who you became (readout, not class) | Irreversible Takes, plaques, stance residue, organ verbs |

### Anti-progression flags

| Flag | Meaning |
|------|---------|
| `XP` | Experience points with no decision unlock |
| `BADGE` | Trophy / achievement chrome without fork |
| `ARBITRARY_LEVEL` | Level number gates content without proof |
| `CURRENCY_INFLATION` | Same decisions, bigger pouch display |
| `PERCENTAGE_BONUS` | Flat % buff without new tradeoff shape |

---

## 1. Spine progression (MAIN_COURSE)

Ordered beats from `mainCourse.ts`. Each row answers the unlock test.

| Step | Trigger / proof | Categories | **What new decision does this allow?** | Verdict |
|------|-----------------|------------|----------------------------------------|---------|
| **Harbor Grounds** | `onboardingComplete` + `character` | ACCESS, SKILL | Walk plaza, Talk to Piggy, open travel map | **KEEP** — verb literacy |
| **Coincraft Cove · Change** | `COVE_CHANGE_QUEST_ID` complete | ACCESS, IDENTITY, KNOWLEDGE | Paycheck sail; side shores; jar vs treat lived with; organ Coin verb | **KEEP** — gold-standard |
| **Paycheck · Change** | `PAYCHECK_CHANGE_QUEST_ID` complete | ACCESS, IDENTITY, FINANCIAL | Credit gate half; umbrella vs glitter; Clock organ; transfer proof | **KEEP** |
| **Freedom Seal** | `harborEscaped` (CF ≥ $30/mo × 3 Pay Days) + inventory seal | ACCESS, IDENTITY, FINANCIAL | Pavilion room; Fortune flyer carpet floor; Credit door; deal timing under CF pressure | **KEEP** — sim proof, not quiz |
| **Credit Ordeal** | `CREDIT_ORDEAL_QUEST_ID` complete | ACCESS, IDENTITY, FINANCIAL | Wait vs borrow; Interest Keep interior; storm band vs patience plaque | **KEEP** |

### Spine access gates (`progressGates.ts`)

| Gate | Condition | New decision | Verdict |
|------|-----------|--------------|---------|
| Hub (`harbor_haven`) | Never locked | Full plaza verbs | **KEEP** |
| Cove / Paycheck | Always open post-Harbor on strip | First-run stays on signature triangle | **KEEP** |
| Side shores (8 era islands) | `hasCompletedCoveChange` | Which digression shore to explore; listen vs rush scars | **KEEP** — discovery, not grind |
| Credit Kingdom | Freedom + Paycheck Change (`PLAYTEST_UNLOCK_ALL_ISLANDS = false`) | Borrow vs wait Ordeal | **KEEP** — fixed from quiz inflation |
| `requiredItems` on island/area | Inventory key | Depends on item — mostly side content | **AUDIT per item** |

**FACT:** `BOSS_MASTERY_REQUIRED = 0` — quiz count no longer gates Credit (`progressGates.ts`).

**INFERENCE:** Side shores opening after Paycheck Change is the correct “breadth earned by depth” expression of iconic freeze.

---

## 2. Harbor guided intro (FTUE capability)

| Reward / step | Category | New decision | Verdict |
|---------------|----------|--------------|---------|
| `meet_guide` → Talk Piggy | SKILL, ACCESS | Talk verb; relationship seed | **KEEP** |
| `to_dock` → board carpet | ACCESS | Choose first painting (Cove) | **KEEP** |
| `done` | ACCESS | Full hub without coach overlay | **KEEP** |
| Legacy steps (`walk_outfitter`, `become_you`, `tiny_spend`, …) | — | Remapped to `to_dock` in `normalizeHubGuidedIntro` | **DEMOTED** — no separate progress |

**FACT:** Critical path is **meet → dock → done**; outfitter/spend beats demoted (`storyBible.ts`).

**No financial personality pick** at cast select — `character` is look-only; `stance` updates from Takes (`worldMemory.ts`).

---

## 3. Concept progression (KNOWLEDGE track)

Eight spine concepts in `CONCEPT_REGISTRY`. Phases: `LOCKED → … → MASTERED`.

| Concept | Mastery proof (examples) | New decision when mastered | Verdict |
|---------|---------------------------|----------------------------|---------|
| `money_is_alive` | Cove scar + second-island scar | Coach silent on “money remembers” | **KEEP** |
| `earn_then_decide` | Quest + `gate_coin_sort` mastery | Independent Coin Sort threshold | **KEEP** — skill + knowledge |
| `save_vs_spend` | Irreversible + Cove Change | Transfer without Cove coach | **KEEP** |
| `irreversible_take` | Plaque + second painting scar | Commit without hush re-tutorial | **KEEP** |
| `harbor_scar_memory` | Cove + Paycheck + Credit scars | Read world without Plinth lecture | **KEEP** |
| `cashflow` | Freedom Seal | Deal Accept/Wait under real CF | **KEEP** |
| `interest_compounds` | Credit borrow/wait irreversible | Ordeal without interest lecture | **KEEP** |

**FACT:** Concept advance uses **predicates over save state** — never time or “Next” alone (`conceptProgression/engine.ts`).

**INFERENCE:** MASTERED phase should primarily **remove coach chrome**, not grant % bonuses — aligns with Constitution Principle 12 (knowledge as progression).

---

## 4. Voyager Ledger & Harbor Grind (FINANCIAL CAPABILITY + RESOURCES)

| Reward / state change | Category | New decision | Verdict |
|-----------------------|----------|--------------|---------|
| Salary / living expenses baseline | RESOURCES | Which deal fits remaining CF | **KEEP** |
| Asset deal (booth, jar, stand) | FINANCIAL, RESOURCES | Accept vs Wait vs liability trap | **KEEP** — reshape deal differentiation (P1) |
| Liability deal (tab, loan) | FINANCIAL, RESOURCES | Borrow / buyout / walk on board | **KEEP** |
| `regenerateAssetDealOffer()` | FINANCIAL | New tradeoff shape when catalog owned | **KEEP** — anti-grind |
| Pay Day (monthly CF → pouch) | RESOURCES | Spend now vs hold for deal | **KEEP** when CF changes rationality |
| Positive Pay Day streak (×3) | FINANCIAL, ACCESS | Freedom Seal chase vs pouch dip | **KEEP** — sim proof |
| Freedom Seal + `HARBOR_FREEDOM_ITEM` | ACCESS, IDENTITY | Pavilion; carpet floor; Credit | **KEEP** |
| `masteryClears[]` on ledger | KNOWLEDGE | Optional worksheet only — **not** Credit | **KEEP** as digression; **never** re-gate boss |
| Board “seal space” → ledger claim | FINANCIAL | Cashflow claim vs star chrome | **KEEP** — stars retired |

**FLAG `CURRENCY_INFLATION`:** Pouch growth **without** CF change (arcade farming, ritual coins) — same Accept/Wait math, bigger number.

---

## 5. Takes, scars, and identity (PLAYER IDENTITY + REPUTATION)

| Reward | Category | New decision | Verdict |
|--------|----------|--------------|---------|
| Cove jar Take | IDENTITY, RESOURCES | Live with Holds; weather/Freedom path | **KEEP** |
| Cove treat Take | IDENTITY, RESOURCES | Recovery under Owes pressure | **KEEP** |
| Paycheck umbrella / glitter | IDENTITY, FINANCIAL | Rainy-day protection vs impulse | **KEEP** |
| Credit wait / borrow | IDENTITY, FINANCIAL | Storm band vs patience; Interest Keep | **KEEP** |
| Digression scars (side shores) | REPUTATION, IDENTITY | Side ACCESS only; Harbor gossip | **KEEP** — never gate Credit |
| `stance` axes (saver/spender/risk) | IDENTITY (silent) | Colors NPC copy — **not** buffs | **KEEP** silent; **FLAG** if surfaced as HUD badge |
| Plinth share card | REPUTATION | Witness myth; social proof | **KEEP** |
| Day-2 scar echo (`harborRitual`) | REPUTATION, KNOWLEDGE | Return visit vs walk-on | **KEEP** |
| Soft Beat arm (lookout/ledger/umbrella/battlement) | KNOWLEDGE, SKILL | Timed foreshadow on next Take Talk | **KEEP** — multiplicative depth |
| `piggyBondHomecomings` | RELATIONSHIPS | Warmer Piggy lines — not mechanics | **KEEP** expression |

**Emergent tags (descriptive, not chosen):** Holder · Spender-of-now · Patient spiral · Haste-scarred · Escaped · Witnessed — see [PROGRESSION_TAXONOMY.md §5](./PROGRESSION_TAXONOMY.md).

---

## 6. Access unlocks (places & systems)

| Unlock | Condition | New decision | Verdict |
|--------|-----------|--------------|---------|
| Travel map / carpet voyage | Hub guided done | Which island to sail | **KEEP** |
| Paycheck Peninsula (homecoming) | Cove Change | Umbrella vs glitter Take | **KEEP** |
| Side shores (8) | Cove Change | Era digression; listen vs rush | **KEEP** |
| Credit Kingdom | Freedom + Paycheck Change | Wait vs borrow Ordeal | **KEEP** |
| Freedom Pavilion (`requiresFreedom`) | Freedom Seal | Carpet polish shop — weak decisions | **DEMOTE** to expression |
| Pasaran / market lane | Default + plaza pass optional | Fair trade minigame | **OK** if forks real |
| Money Structure interiors (Jar, Bank, Tower, Keep) | Shore presence | Which arcade part / Soft Beat peek | **KEEP** — depth, not gate |
| Harbor Arcade / Studio / Gallery | Post-Cove discovery | Replay / create — optional | **KEEP** side tomfoolery |
| `requiredItems` on side areas | Quest loot | Area entry — check per island | **MIXED** — risk fetch gates |

---

## 7. Shop, carpet, and collection (EXPRESSION vs progress)

| Reward | Category | New decision | Flags | Verdict |
|--------|----------|--------------|-------|---------|
| Pouch coins from quests/minigames | RESOURCES | Deal / capsule purchase | `CURRENCY_INFLATION` if CF unchanged | **KEEP** when tied to CF |
| Fortune Capsules (board items) | RESOURCES | Shield vs spend vs raid on board | — | **KEEP** tactical |
| Starter companion (tortoise) | — | None — cosmetic | — | **EXPRESSION** |
| Companion purchases | — | None | — | **EXPRESSION** |
| Carpet tier: Threadbare → Coin → **Fortune flyer** | ACCESS (floor) | Freedom floor = same map decisions | — | **KEEP** Freedom floor |
| Carpet: Mint magic / Vault soar / Royal | — | **None** — vanity scale | `CURRENCY_INFLATION` | **REMOVE from progression** |
| Carpet polish purchase | — | **None** | `CURRENCY_INFLATION` | **EXPRESSION shop only** |
| Plaza pass (`PLAZA_PASS_PRICE`) | ACCESS | Mild market lane | — | **OK** |
| Wealth rank (`Flat broke` → `Tycoon`) | — | **None** | `CURRENCY_INFLATION` · `ARBITRARY_LEVEL` | **REMOVE from HUD** |
| `harborStudioMarks` | IDENTITY (myth) | None — plaza stamp | — | **EXPRESSION** |
| Party Board Stars | — | Retired | `BADGE` | **REMOVED** ✓ |
| Minigame reward XP | — | Retired (`xp: 0`) | `XP` | **REMOVED** ✓ |

**FACT:** `computeMinigameReward` returns `xp: 0`, `starEarned: false` (`partyBoard.ts`). `biblePlayerVisible.test.ts` enforces no XP/Board Star chrome.

**FACT:** `WealthHud` still renders rank from `wealth.ts` on hub/shore/board views.

---

## 8. Mastery quizzes (KNOWLEDGE — digression only)

Eight gates in `MASTERY_GATES` + optional `PARTY_DASH_MASTERY_GATE`.

| Gate | Attached minigame | Gates spine? | New decision | Verdict |
|------|-------------------|--------------|--------------|---------|
| `gate_coin_catcher` | Coin Catcher | No | Optional worksheet after clear | **KEEP** digression |
| `gate_coin_sort` | Coin Sort | No (concept mastery only) | Transfer proof for `earn_then_decide` | **KEEP** |
| `gate_treasure_vault` | Vault | No | Optional worksheet | **KEEP** |
| `gate_news_shocks` | News Shocks | No | Optional worksheet | **KEEP** |
| `gate_compound_snowball` | Compound | No | Optional worksheet | **KEEP** |
| `gate_pasaran_market` | Pasaran | No | Optional worksheet | **KEEP** |
| `gate_mancala_compound` | Mancala | No | Optional worksheet | **KEEP** |
| `gate_life_fork` | Life Fork | No | Optional worksheet | **KEEP** |
| `gate_party_dash` | Party Dash | No | Explicit: Credit from Freedom + Paycheck | **KEEP** |

**FACT:** `IslandPlayView` shows mastery as **“Optional digression · worksheet”** after minigame clear — not a block.

**RECOMMENDATION:** Never reattach mastery count to `bossUnlockProgress` (regression test exists in `spineTakeFootprints.test.ts`).

---

## 9. Quest completion rewards (content JSON)

Quest `rewards` schema: `{ coins?, xp?, items? }` (`types.ts`).

| Reward field | Applied in `IslandsApp`? | New decision | Verdict |
|--------------|--------------------------|--------------|---------|
| `coins` | Yes → `userProfile.totalCoins` | Pouch-funded deals | **KEEP** when proportionate |
| `items` | Yes → `inventory` | Area keys, souvenirs | **KEEP** if not fetch-busywork |
| `xp` | **No** — not read on quest clear | None | **FLAG `XP`** — dead content field |
| Skill stat bonuses | Called but `applySkillChanges` is **no-op** | None | **FLAG `ARBITRARY_LEVEL`** — retired |

**FACT:** Quest clear applies coins, items, and calls `questCompletionBonuses` → `applySkillChanges` which returns state unchanged (`skillStats.ts` comment: “Extrinsic meters retired”).

**INFERENCE:** Content authors may still author `xp` in JSON — misleading for editors; strip or document as deprecated.

---

## 10. Harbor ritual & weekly challenge (retention)

| Reward | Category | New decision | Flags | Verdict |
|--------|----------|--------------|-------|---------|
| Daily rumor (scar-aware) | REPUTATION, KNOWLEDGE | Visit Plinth / Piggy | — | **KEEP** |
| Ritual Pay Day | RESOURCES | +5 coins (`DAILY_RITUAL_REWARD_COINS`) | `CURRENCY_INFLATION` | **DEMOTE** — login theater |
| Streak counter | — | None | `BADGE` | **DEMOTE** |
| Weekly: talk 3 / one payday / studio | — | Weak — social/studio nudge | `BADGE` | **COLLECTION** — never gate spine |

---

## 11. Learning profile (Explorer / Apprentice / Strategist)

| Effect | Category | New decision | Flags | Verdict |
|--------|----------|--------------|-------|---------|
| Hint frequency | SKILL (scaffold) | When hints appear | — | **KEEP** as settings |
| Score thresholds | SKILL | Clear bar per age band | — | **KEEP** |
| `penaltyScale` / `rewardScale` | — | Same fork, different % | `PERCENTAGE_BONUS` | **RECONSIDER** — prefer number bands |
| `showForecasts` / APR copy | KNOWLEDGE | Richer preview text | — | **KEEP** for Strategist |
| Profile at cast | — | Not a money class | — | **OK** — pedagogy tier, not Holder/Spender pick |

**FACT:** Profiles are **age-band difficulty**, stored in `localStorage` (`learningProfile.ts`) — distinct from financial archetype menus forbidden by Constitution.

---

## 12. Economy macro-phase (partially wired)

| Phase | Effect | New decision | Verdict |
|-------|--------|--------------|---------|
| Boom | `incomeMultiplier: 1.2` | Accept deal timing in boom | **CONNECT** — must bind UI + events |
| Recession | Higher bill weights | Cut wants vs protect needs | **CONNECT** |
| Normal | Baseline | — | **KEEP** |

**FACT:** `economyState` exists in save schema; full world binding incomplete per master audit.

**INFERENCE:** Phase shifts should change **which Wait/Accept is rational**, not flat +20% with identical forks — otherwise `PERCENTAGE_BONUS`.

---

## 13. Family Room (local REPUTATION)

| Reward | Category | New decision | Verdict |
|--------|----------|--------------|---------|
| Witness stamp on share | REPUTATION | Myth tone at home | **KEEP** — local only |
| Household challenge post | REPUTATION | Family goal framing | **KEEP** — no server rank |
| Pinned studio levels | ACCESS (local) | Play community level | **KEEP** side |

**FACT:** Kill switch `capital_kill_familyRooms`; no backend (`familyRoom.ts`).

---

## 14. Legacy / parallel progression (not Islands product path)

These exist in repo but **do not** drive `IslandsApp` save progression:

| System | Location | Primary purpose | Flags |
|--------|----------|-----------------|-------|
| `ProgressionSystem` — XP, levels, skill tree, achievements | `src/game/systems/ProgressionSystem.ts` | Level ups; `%` income/expense/investment bonuses | `XP` · `ARBITRARY_LEVEL` · `PERCENTAGE_BONUS` |
| Dashboard XP / level widgets | `StructuredModeDashboard.tsx`, etc. | Display level + XP | `XP` · `BADGE` |
| Quest JSON `xp` (all era packs) | `content/*.islands.json` | Authoring artifact | `XP` |
| Trophy room | `TrophyRoom3D.tsx` | Retired no-op shell | `BADGE` |
| PokemonWorldMap boss badges | `PokemonWorldMap.tsx` | Legacy hub | `BADGE` · `XP` |

**RECOMMENDATION:** Treat as **REMOVE / quarantine** for Capital ship — do not wire Islands saves into legacy `ProgressionSystem`.

---

## 15. Preferred unlock types — coverage assessment

| Preferred unlock | Shipped examples | Gap |
|------------------|------------------|-----|
| **New jobs** | Salary baseline; deal “booth/stand” as income assets | No distinct job ladder — assets stand in for micro-business |
| **New business models** | Harbor deals; side shore entrepreneurship lanes | Era packs lean quiz/template — weak business-model forks |
| **New financial instruments** | Credit borrow/wait; Interest Keep; capsules as metaphors | No bonds/options depth on spine (intentional freeze) |
| **New locations** | Cove → Paycheck → Credit + 8 side shores + structures | **Strong** within iconic freeze |
| **New partnerships** | NPC Takes (Kira, Vee, Rex); Family Room myth | No co-invest / joint venture sim |
| **New negotiations** | Board borrow/buyout/walk; Pasaran fair price | Limited multi-round negotiation |
| **New information** | Soft Beat, Decision Preview, scar retell | **Strong** on spine |
| **New risks** | Liabilities, Credit storm, Collector | **Strong** on spine |
| **New strategies** | Wait vs Accept vs Take families | **Strong** — core design |

---

## 16. Master reward register (condensed)

| ID | Reward | Category | New decision? | Flags | Disposition |
|----|--------|----------|---------------|-------|-------------|
| P-01 | Hub guided complete | ACCESS, SKILL | Yes — voyage | — | KEEP |
| P-02 | Cove Change | ACCESS, IDENTITY, KNOWLEDGE | Yes — Paycheck sail (side shores after Paycheck Change) | — | KEEP |
| P-03 | Paycheck Change | ACCESS, IDENTITY, FINANCIAL | Yes — Credit half + transfer | — | KEEP |
| P-04 | Freedom Seal | ACCESS, IDENTITY, FINANCIAL | Yes — Pavilion + Credit | — | KEEP |
| P-05 | Credit Ordeal clear | ACCESS, IDENTITY | Yes — end spine Ordeal | — | KEEP |
| P-06 | Side shore unlock | ACCESS | Yes — digression | — | KEEP |
| P-07 | Harbor deal asset/liability | FINANCIAL, RESOURCES | Yes — CF tradeoff | — | KEEP |
| P-08 | Concept MASTERED | KNOWLEDGE | Yes — quieter coach | — | KEEP |
| P-09 | Mastery quiz clear | KNOWLEDGE | Weak — worksheet | — | KEEP digression |
| P-10 | Soft Beat arm | KNOWLEDGE | Yes — timed Take foreshadow | — | KEEP |
| P-11 | Fortune Capsule | RESOURCES | Yes — board tactics | — | KEEP |
| P-12 | Freedom carpet floor | ACCESS | Weak after seal | — | KEEP floor only |
| P-13 | Carpet Mint+ tiers | — | No | INFLATION | EXPRESSION |
| P-14 | Wealth rank HUD | — | No | INFLATION, LEVEL | REMOVE |
| P-15 | Quest JSON xp | — | No | XP | REMOVE field |
| P-16 | skillStats bars | — | No (no-op) | LEVEL | REMOVE schema/HUD |
| P-17 | Daily ritual +5 coins | RESOURCES | No | INFLATION | DEMOTE |
| P-18 | Ritual streak | — | No | BADGE | DEMOTE |
| P-19 | Learning profile % scale | — | No | PERCENTAGE | RECONSIDER |
| P-20 | Legacy ProgressionSystem | — | No | XP, % | QUARANTINE |
| P-21 | Board Stars | — | No | BADGE | REMOVED ✓ |
| P-22 | Minigame XP | — | No | XP | REMOVED ✓ |
| P-23 | Cast outfit | IDENTITY costume | No money judgment | — | EXPRESSION ✓ |
| P-24 | Stance axes | IDENTITY silent | Colors readout only | — | KEEP silent |
| P-25 | Piggy bond counter | RELATIONSHIPS | Tone only | — | KEEP |
| P-26 | Studio plaza marks | IDENTITY myth | None | — | EXPRESSION |
| P-27 | Weekly challenge | — | Weak | BADGE | COLLECTION |
| P-28 | Economy boom +20% income | RESOURCES | Situational | PERCENTAGE | CONNECT honestly |

---

## 17. Identity policy audit

| Question | Finding |
|----------|---------|
| Does cast select ask “pick your money personality”? | **No** — outfit/look only (`character`) |
| Are Holder/Spender classes chosen upfront? | **No** — `stance` derived from Takes |
| Do archetype tags grant buffs? | **No** in Islands path — descriptive only |
| Can player break an emergent tag? | **Yes** — except spent irreversible plaques (“you once chose…”) |
| Is learning profile a financial class? | **No** — age-band scaffolding; not identity |

**Constitution Test passed** on identity — continue forbidding archetype menus and pay-to-identity buffs.

---

## 18. Roadmap (progression-specific)

### P0 — truth & trust

1. **Keep Credit gate** on Freedom + Paycheck Change — add regression if mastery count reappears in `bossUnlockProgress`.
2. **Remove wealth rank from player-facing progress story** — Cash integer + CF chip suffice (`WealthHud` demotion).
3. **Strip or deprecate quest `xp` in content JSON** — unused at runtime; confuses authors.

### P1 — deepen decisions

1. **Differentiate Harbor deals** — each offer a distinct risk shape (Living Cashflow Commit), not stacked identical ROI.
2. **Carpet tiers above Fortune flyer** — expression shop only; never map to new islands or gates.
3. **Bind economy phases** to visible signals per [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) — phase must change rational Wait/Accept, not invisible %.
4. **Wire emergent tags** to Piggy / Fortune Thread readouts after evidence thresholds — still no buffs.

### P2 — hygiene

1. Delete or quarantine legacy `ProgressionSystem` from Capital product entry points.
2. Remove `skillStats` from save schema when migration allows — already no-op.
3. Demote daily ritual streak and +5 coin reward to pure flavor or remove.
4. Audit side-shore `requiredItems` for fetch-quest gates ([QUEST_AUDIT.md](../narrative/QUEST_AUDIT.md)).

---

## 19. Facts · inferences · recommendations

### FACTS FOUND IN REPOSITORY

- Spine gates: Cove/Paycheck open; side shores after Paycheck Change; Credit after Freedom + Paycheck Change (`progressGates.ts`).
- Freedom = CF ≥ $30/mo for 3 consecutive tracked Pay Days (`voyagerLedger.ts`).
- Mastery quizzes optional; `BOSS_MASTERY_REQUIRED = 0`.
- Minigame rewards grant coins only; XP and Board Stars retired (`partyBoard.ts`, `IslandsApp.tsx`).
- Skill stat application is explicitly no-op (`skillStats.ts`).
- Quest `xp` in JSON is not applied on quest clear (`IslandsApp.tsx` handles coins + items only).
- Wealth rank ladder active in `WealthHud` (`wealth.ts`).
- Eight concept spine entries with predicate-driven phases (`conceptProgression/registry.ts`).
- Identity from irreversible Takes + scars + silent stance — not cast class (`worldMemory.ts`, Constitution).

### DESIGN INFERENCES

- Players experience progression as **“Harbor opened a new painting”** when decisions land — not as level-ups.
- Hollow rewards persist mainly as **schema/content debt**, not active game loops.
- Era side shores risk **REPEATED_TEMPLATE** progression feel if rewards are coins+XP without new forks ([QUEST_AUDIT.md](../narrative/QUEST_AUDIT.md)).

### RECOMMENDATIONS (summary)

- **KEEP** spine Takes → access → CF → Freedom → Credit as the progression backbone.
- **REMOVE** wealth rank, quest xp fields, and any revival of quiz-gated Credit.
- **DEMOTE** carpet polish, ritual streak, daily coin drip to expression/collection.
- **CONNECT** macro economy and deal catalog to decision quality, not display inflation.
- **INFER** identity from behavior; never ask for financial personality at creation.

---

## 20. Checklist for every new unlock

- [ ] Primary category named (one; secondary optional)
- [ ] **“What new decision does this allow?”** answered in one sentence
- [ ] Not flagged `XP` / `BADGE` / `ARBITRARY_LEVEL` / `CURRENCY_INFLATION` / `PERCENTAGE_BONUS` without new tradeoff
- [ ] If ACCESS: names fork or place opened
- [ ] If IDENTITY: emerges from evidence, not menu
- [ ] If COLLECTION: cannot gate Credit / Freedom
- [ ] Cross-check [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) Principles 11–13

---

*Audit complete. Production code unchanged.*
