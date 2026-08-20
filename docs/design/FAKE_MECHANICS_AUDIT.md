# Fake-mechanics audit — Capital

**Date:** 2026-08-18  
**Scope:** Shipped product path (Islands / Fortune Archipelago) on `main`. Outer Structured Mode / ECS noted as legacy.  
**Lens:** Mechanics that **imitate games** without creating **meaningful play** (decisions with consequences).  
**Law:** Prioritize **intrinsic gameplay** over extrinsic reward scaffolding. For every flag: *Can meaningful decision-making replace this mechanism?*

---

## Hard law

| Prefer | Avoid |
|--------|--------|
| Irreversible Takes, scars, ledger CF, weather, Soft Beats, transfer proofs | XP bars, login streaks, fill-% collections, quiz gates, parallel meters |
| One liquid (pouch) + one engine (monthly CF) | Points that don’t force tradeoffs |
| Progress = new decisions unlocked | Progress = bigger number |

Tutorial completion, tip dismiss, and quiz ace are **not** mastery. See `docs/design/CONCEPT_MASTERY_PEDAGOGY.md` / `LEARNING_TELEMETRY.md`.

---

## Meaningful play (do not cut)

| System | Why it is real play | Evidence |
|--------|---------------------|----------|
| Voyager Ledger + cashflow | Spends/deals change the monthly engine | `voyagerLedger.ts` |
| Freedom Seal (Pay Day streak @ CF target) | Sustained CF is a sim gate, not a login theater | `voyagerLedger.ts`, `VoyagerLedgerHud.tsx` |
| Irreversible Takes + Harbor scars | Forks stain the world | `worldMemory.ts`, hush / Plinth |
| Harbor weather ↔ shop prices | Economy reads as place | `harborWeather.ts` |
| Soft Beats / Money Structure interiors | Lookouts deepen memory without worksheets | shore / structure views |
| Pouch coins as spend currency | Opportunity cost vs deals / Freedom | `harborShop.ts` |

---

## Flag catalog

Severity = risk to **learning authenticity** / meaningful play (not eng polish).

### QUIZZES_DISGUISED_AS_GAMEPLAY — **BLOCKER**

| | |
|--|--|
| **Where** | Mastery Gates after Party Dash / island clears; Credit unlock needs mastery clears |
| **Evidence** | `masteryGate.ts` (“kinesthetic win is not enough… ace all-correct quiz”); `MasteryQuiz.tsx`; `IslandsApp` pending mastery; `progressGates` / Credit boss mastery count |
| **What it imitates** | “Boss fight” / level clear via multiple choice |
| **What it fails to create** | In-world financial judgment under uncertainty |
| **Can decision-making replace it?** | **Yes.** Prove literacy via Soft Beat fork, deal tradeoff, weather read, independent transfer surface, or irreversible Take with different numbers — same concepts, real verbs. |
| **Recommendation** | **Replace** spine mastery quizzes as unlock gates. Optional quiz only as Soft Beat digression (never Credit / Freedom gate). Keep Ashore kinesthetic teach. |

---

### POINTS_WITHOUT_PURPOSE — **HIGH**

| | |
|--|--|
| **Where** | Islands XP still awarded; chrome hidden. Board Stars as party score. Outer shell XP→level. |
| **Evidence** | `designBible.ts` `hideIslandsXpChrome`; `IslandsApp` XP increments; `partyBoard.ts` / `PartyRewardOverlay`; outer `App.tsx` / `XPSystem.ts` |
| **What it imitates** | RPG leveling / arcade high score |
| **What it fails to create** | Tradeoffs against pouch, CF, or Takes |
| **Can decision-making replace it?** | **Yes.** Drop spine XP. Board outcomes should hit ledger or scars — not a star counter. |
| **Recommendation** | **Cut** Islands XP awards on product path. **Replace** Board Stars with ledger-tied board consequences, or demote to post-Freedom toy. Outer XP: cut from product entry. |

---

### MULTIPLE_CURRENCIES_WITHOUT_DECISION_VALUE — **HIGH**

| | |
|--|--|
| **Where** | Parallel tracks: pouch coins, monthly CF, XP, Board Stars, skillStats, stance axes, ritual +5, Freedom Seal, party capsules |
| **Evidence** | Save fields in `types.ts`; awards in `IslandsApp`; shop capsules in `harborShop.ts` / `partyItems.ts` |
| **What it imitates** | Live-ops multi-currency games |
| **What it fails to create** | Forced tradeoffs (except pouch ↔ CF ↔ real shop) |
| **Can decision-making replace it?** | **Partial.** Keep **pouch + CF + memory**. Fold/delete XP, stars-as-progress, skill bars, stance-as-meter. Capsules OK only if priced against CF deals and never shortcut Freedom. |
| **Recommendation** | **Cut** XP / skillStats / stance meters from player-facing progress. **Keep** coins + CF. Document capsules as side-economy with opportunity cost. |

---

### FAKE_PROGRESS — **HIGH**

| | |
|--|--|
| **Where** | skillStats bars (written, panel hidden); concept phase machine; weekly ritual %; outer level = floor(xp/100); stance axes silent |
| **Evidence** | `skillStats.ts`; `hideSkillStatsPanel`; `conceptProgression/engine.ts`; `harborRitual` weekly; adaptive coach still reads skills |
| **What it imitates** | Character growth / curriculum completion bars |
| **What it fails to create** | New Takes, deals, or shop decisions |
| **Can decision-making replace it?** | **Yes.** Progress = organs cleared, scars, CF, Soft Beats, Freedom, transfer proof. Coach can use fail counts + CF only. |
| **Recommendation** | **Cut** skillStats persistence/UI. Concept phases → analytics only. Weekly % → cut as progress chrome. |

---

### STREAK_MANIPULATION — **HIGH** (ritual) / **KEEP** (Freedom)

| | |
|--|--|
| **Where** | Harbor ritual calendar streak (“show up, listen, collect” + coins); weekly checklist. Freedom Pay Day streak is separate. |
| **Evidence** | `harborRitual.ts`; `HomeHubView.tsx` streak toast; `voyagerLedger` `positivePaydayStreak` (sim-honest) |
| **What it imitates** | Habit-app / login retention streaks |
| **What it fails to create** | A financial choice (ritual path) |
| **Can decision-making replace it?** | **Yes** for ritual — day-2 scar echo / Soft Beat arm already better craft. **No** for Freedom Pay Day streak — that *is* the decision pressure (hold CF). |
| **Recommendation** | **Cut** ritual streak counter + weekly progress framing. **Keep** Freedom Pay Day streak. Local minigame combo meters OK as juice only. |

---

### BADGES_WITHOUT_MEANING — **MEDIUM**

| | |
|--|--|
| **Where** | Digression shelf fill; chapter “craft badge” copy; outer achievements / trophy room |
| **Evidence** | `digressionShelf.ts`; `chapterLoop.ts` badge language; `AchievementsTab` / `TrophyRoom3D` (outer) |
| **What it imitates** | Achievement hunting |
| **What it fails to create** | Spendable unlocks or Harbor consequences (digression never gates Credit) |
| **Can decision-making replace it?** | **Partial.** Keep scars/plaques as *named gossip*. Cut fill-% and rarity dashboards. |
| **Recommendation** | **Keep** scar/plaque memory. **Cut** achievement dashboards from product path. Shelf = myth lines, not collection %. |

---

### PAY_TO_WIN — **ABSENT** (real money) / **LOW** (watch capsules)

| | |
|--|--|
| **Where** | No IAP / Stripe on Islands spine. In-game shop sells capsules, carpet vanity, companions. |
| **Evidence** | `harborShop.ts`; design bible anti-PTW notes |
| **Can decision-making replace it?** | N/A for real money. Capsules: keep opportunity cost vs CF visible. |
| **Recommendation** | **Keep** no real-money advantage. **Watch** capsules never shortcut Freedom / Credit. |

---

### ARTIFICIAL_SCARCITY — **ABSENT / LOW**

| | |
|--|--|
| **Where** | No energy/stamina gates. Shop ±15% from CF weather is sim-linked. |
| **Evidence** | `harborWeather.ts` `scaleHarborPrice` |
| **Recommendation** | **Keep** weather pricing. **Do not add** energy gates. |

---

### FALSE_URGENCY — **ABSENT** (FOMO timers) / fold ritual under STREAK

| | |
|--|--|
| **Where** | No countdown shop FOMO. Mastery quiz untimed. Flavor FOMO in rival/minigame copy only. |
| **Recommendation** | **ABSENT** as product category. Do not add limited-time offers. |

---

### LOOTBOX_LOGIC — **ABSENT**

| | |
|--|--|
| **Where** | Capsule shop is fixed-price. Party board dice = board luck, not monetized packs. |
| **Recommendation** | **ABSENT.** Do not add gacha / mystery packs. |

---

## Priority fix order

```text
1. BLOCKER  QUIZZES_DISGUISED_AS_GAMEPLAY — replace mastery quiz spine gates
2. HIGH     POINTS_WITHOUT_PURPOSE + MULTIPLE_CURRENCIES — cut XP; demote stars
3. HIGH     FAKE_PROGRESS — cut skillStats / weekly % as player progress
4. HIGH     STREAK_MANIPULATION — cut ritual login streak; keep Freedom streak
5. MEDIUM   BADGES_WITHOUT_MEANING — cut achievement chrome; keep scars
6. —        LOOTBOX / ENERGY / IAP PTW / FOMO timers — absent; do not introduce
```

**Do not** add more extrinsic scaffolding (daily login chests, gem currency, battle pass) while quiz gates and silent XP still exist.

---

## Replacement test (use on every flag)

For any proposed or existing reward mechanism, answer:

1. Does this force a **tradeoff** against pouch, CF, time, or reputation?  
2. Does success unlock a **new decision**, not a bigger number?  
3. Could a player explain the outcome as **because of a choice**, not “I filled a bar”?  
4. If we remove the chrome, does the **same play** still make sense?

If (1)–(3) fail → **cut or replace with a decision**. If (4) fails → the mechanism was load-bearing for the wrong reason — redesign the decision, don’t thicken the reward.

---

## Related

- `docs/CAPITAL_DESIGN_BIBLE.md` · `docs/COMPLEXITY_CUT_REVIEW.md`  
- `docs/design/CONCEPT_MASTERY_PEDAGOGY.md` · `PROGRESSION_TAXONOMY.md`  
- `docs/design/HEALTH_DASHBOARD.md` — don’t raise ENGAGEMENT via streaks while Learning (ITR) falls  
- Code: `masteryGate.ts`, `skillStats.ts`, `harborRitual.ts`, `voyagerLedger.ts`, `design/designBible.ts`
