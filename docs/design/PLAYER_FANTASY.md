# Capital — Player Fantasy Model

**Date:** 2026-08-19  
**Snapshot:** `main` @ post island-content rewrite  
**Companion:** [PLAYER_VERB_MATRIX.md](./PLAYER_VERB_MATRIX.md) · [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) · [CAPITAL_MASTER_AUDIT.md](./CAPITAL_MASTER_AUDIT.md)

This document defines **who the player is pretending to be**, what they are trying to accomplish, and how every performable action maps to that fantasy. It is derived from code inspection of the Islands product path — not aspirational design.

---

## Primary fantasy (north star)

> **Build a life, gain economic agency, adapt to uncertainty, create opportunities, form relationships, and change your world.**

In Capital's shipped voice, that compresses to:

> *You are a Voyager in the Fortune Archipelago — a washed-ashore chooser among living Money Mascots — until Harbor remembers who you became and paycheck-to-paycheck no longer owns you.*

The primary fantasy is **economic agency in a world that remembers**, not education completion.

---

## Fantasy pillars → what “build a life” means in Capital

Capital does not simulate a full life sim (career ladder, housing market, family budget spreadsheet). It simulates **judgment under money constraints** across a myth archipelago. Each pillar maps to concrete systems:

| Pillar | Player felt goal | Shipped expression | Primary systems |
|--------|------------------|-------------------|-----------------|
| **Build a life** | Accumulate holdings, habits, and identity that compound over sessions | Ledger holdings, scars, carpet/companion expression, Freedom Seal | `voyagerLedger.ts` · `harborScars` · `harborShop` · `character` |
| **Gain economic agency** | My choices change what I can afford, access, and weather | Takes → ledger footprints → CF → Freedom → Credit unlock | `spineTakeFootprints.ts` · `progressGates.ts` · `bossUnlockProgress` |
| **Adapt to uncertainty** | Boom/recession, bills, rival board, rainy-day forks without a single right answer | Macro phase, board spaces, Paycheck Change, Credit wait/haste | `economy.ts` · `partyBoard.ts` · `creditEncounter.ts` |
| **Create opportunities** | Deals, side shores, Soft Beats, digressions — optional upside with cost | Board deals, `regenerateAssetDealOffer`, side quests, structure pads | `partyBoard.ts` · island JSON side tracks · `moneyStructures.ts` |
| **Form relationships** | Mascots remember talks; Piggy names your plaque; plaza gossip | Talk memory, homecoming, bond counter, Family Room myth | `worldMemory.ts` · `harborTalks.ts` · `familyRoom.ts` |
| **Change your world** | Harbor physically and socially reflects your Takes | Scar spectacle, Plinth, weather, day-2 echo, pavilion unlock | `worldMemory.ts` · `harborWeather.ts` · `HomeHubView` cinema chain |

---

## Secondary fantasy (Design Bible — still canonical)

From `docs/CAPITAL_DESIGN_BIBLE.md`, the **organ suit** layer overlays the primary fantasy:

| Organ | Suit verb | Fantasy beat |
|-------|-----------|--------------|
| Memory (Harbor) | *keeps* | Home remembers your choices |
| Coin (Cove) | *holds* | Saving vs spending is physical |
| Clock (Paycheck) | *shelters* | Income timing and rainy-day trade-offs |
| Spiral (Credit) | *withstands* | Debt pressure and patience vs haste |

Every spine verb should be nameable as **organ + suit verb** or it is off-fantasy for main course content.

---

## Verb architecture (three layers)

Capital exposes verbs at three layers. Only **Layer 2 Commit verbs** reliably produce persistent stories and transferable learning.

```
Layer 1 — PRESENCE     Walk · Look · Approach · Open map · Enter structure · Browse journal
Layer 2 — COMMIT       Take · Deal · Borrow · Buy · Pass · Complete quest · Pay Day · Claim CF
Layer 3 — EXPRESSION   Outfit · Companion · Carpet polish · Share PNG · Witness · Studio publish
```

**Design law:** Walk positions; **Commit** lands. Expression must not outrank judgment on the spine (`CAPITAL_DESIGN_CONSTITUTION.md` Principle 2).

---

## Canonical verb families (player mental model)

The matrix in [PLAYER_VERB_MATRIX.md](./PLAYER_VERB_MATRIX.md) maps **~90 shipped actions** to these **19 canonical families**. Families marked ⚠️ include significant busywork variants.

| Family | Shipped? | Fantasy pillar | Notes |
|--------|----------|----------------|-------|
| **explore** | ✅ Strong | Build life · Change world | Walk shores, structures, side shores post-Cove |
| **travel** | ✅ Strong | Create opportunities | Carpet, archipelago map, voyage |
| **talk** | ✅ Strong | Relationships · Agency | Opt-in E; choices carry effects |
| **commit / take** | ✅ Core | Agency · Change world | Irreversible spine + side digression Takes |
| **save** | ✅ Core | Build life · Agency | Cove jar path; CF-positive Pay Days |
| **spend** | ✅ Strong | Build life · Adapt | Treat path, bills, shop sinks, board costs |
| **work / earn** | ✅ Partial | Build life | Pay Day (ledger + pouch), minigame coin rewards |
| **buy** | ✅ Strong | Build life · Opportunities | Deals, capsules, companions, plaza pass, buyout |
| **sell** | ⚠️ Weak | Opportunities | Pasaran market overlay — **local practice only, no save** |
| **borrow** | ✅ Strong | Adapt · Agency | Board liability borrow; Credit haste Take |
| **repay** | ✅ Partial | Agency | Liability buyout; patience Take as anti-borrow |
| **invest** | ✅ Partial | Build life · Opportunities | Asset deals → ledger holdings; compound minigames |
| **refuse / pass** | ✅ Strong | Agency | Pass deal, walk from liability, digression branches |
| **negotiate** | ⚠️ Partial | Relationships · Agency | Talk Battle forks — not haggling sim |
| **insure** | ❌ Missing | Adapt | `shield_ledger` capsule is board buff, not insurance product |
| **hire** | ❌ Missing | Build life | No labor/hiring sim |
| **build** | ⚠️ Partial | Change world | VibeCode publish → local gallery stamp only |
| **learn** | ⚠️ Mixed | Agency | Concept phases + transfer tasks = real; mastery quiz = optional busywork |
| **research** | ⚠️ Weak | Learn | Signal scanner, explorable puzzles — literacy pads not research sim |
| **help** | ⚠️ Local | Relationships | Family Room challenges — honor system, no backend |
| **partner** | ⚠️ Local | Relationships | Family Room join/import — local JSON only |
| **compete** | ⚠️ Partial | Adapt | Board rival turns — session toy, not ranked PvP |
| **share / witness** | ✅ Strong | Relationships · Change world | Harbor felt PNG, Family witness myth |
| **adapt** | ✅ Partial | Adapt | Learning profile, coach nudges, weather-reactive shop prices |
| **express** | ✅ Strong | Build life | Cast, outfit, companion, carpet — demoted from first-hour gates |

---

## Verb tiers (consequence density)

| Tier | Definition | Count (approx.) | Examples |
|------|------------|-----------------|----------|
| **S — Spine** | Irreversible; persists in scars/ledger; drives campaign | 12 | Cove/Paycheck/Credit Take, quest Change completion, Freedom Pay Day streak |
| **A — Consequential** | Mutates save; affects CF, inventory, or unlocks | 25 | Board deal/borrow/buyout, harbor purchases, quest objectives, ritual Pay Day |
| **B — Session** | Real within session; weak or no persistence | 18 | Board roll/dice, capsule use, arcade replay, minigame coin without quest |
| **C — Presence** | Navigation, UI, cinema dismiss | 30 | Walk, map, journal tabs, Esc/Leave, structure enter/exit |
| **D — Busywork** | No judgment depth; retention or practice chrome | 15+ | Ritual rumor tick, Pasaran fair trade, Family honor clear, studio playtest loop |

**Audit finding:** ~**17%** of performable actions are Tier S/A (story + transfer worthy). ~**20%** are Tier D busywork. The product is correctly weighted toward presence verbs — risk is **too many Tier B/D verbs surfacing in the first hour** (Complexity Cut target).

---

## Fantasy ↔ verb alignment scorecard

| Pillar | Strong verbs | Weak / missing verbs | Gap |
|--------|--------------|----------------------|-----|
| Build a life | save, spend, buy, invest (deals), express, work (Pay Day) | hire, long-horizon invest sim, housing | No career/labor layer — intentional freeze |
| Economic agency | take, refuse, borrow, repay, buy, pass | negotiate (no price haggle) | Agency is fork-based, not spreadsheet-based |
| Adapt to uncertainty | borrow, spend (bills), compete (board), adapt (weather) | insure | Macro economy partially invisible |
| Create opportunities | explore, travel, buy (deals), invest | sell (real), build (economic) | Side shores post-Cove; Studio not economic |
| Relationships | talk, help, partner, share | — | Light by design (scar/stance, not affinity) |
| Change your world | take, share, explore (structures) | build (world edit) | World change is memory/weather, not terraforming |

---

## Story-generating verbs (Harbor can retell)

These verbs write objects the **cold retell** system reads:

1. **Take** (`setIrreversible` + `addScar`) → plaque, ledger footprint, stance
2. **Complete Change quest** → `harborHomecoming`, next painting unlock
3. **Board deal / liability choice** → holdings (if player reaches board post-Freedom)
4. **Freedom Seal earned** → `harborEscaped`, pavilion, carpet floor
5. **Share / witness** → social object (PNG), Family myth line
6. **Side digression scar** → digression shelf myth (heard, not checklist)

Verbs that **do not** generate retrievable story state: arcade replay, Pasaran overlay, ritual rumor seen, settings toggles, walk-only exploration without Take.

---

## Transfer-worthy verbs (Independent Transfer surface)

From `docs/ftue/NORTH_STAR.md`, transfer requires a **new situation without answer leakage**.

| Verb context | Transfer potential | Status |
|--------------|-------------------|--------|
| Cove Take → Paycheck stall (Vee) | **High** — analogous problem, no mapping | Designed; human ITR unmeasured |
| Paycheck Take → Credit spiral | **High** — new organ, no umbrella | Designed |
| Mastery quiz | **Low** — same-format recall | Optional digression; de-gated |
| Arcade replay | **None** — same minigame | Busywork |
| Pasaran market | **Low** — isolated round | Busywork |
| Board deal pass/buy | **Medium** — if player connects to CF | Post-Freedom toy |

---

## Busywork flag (summary)

Verbs flagged **BUSYWORK** in the matrix (see [PLAYER_VERB_MATRIX.md](./PLAYER_VERB_MATRIX.md) § Busywork register):

- Ashore Teach steps (except cast pick) — tutorial theater, no save scars
- Hear daily rumor (ritual) — retention tick
- Pasaran Lane fair trade — no ledger write
- Arcade replay without quest link
- Mastery quiz (optional) — worksheet framing
- Family challenge “I cleared it” — honor system
- VibeCode playtest loop — local draft only
- Gallery hide/pin — metadata only
- Proximity guided intro flags (`near_outfitter`, etc.)
- Pure navigation: walk, map scroll, journal tab switch, structure exit

**Not busywork despite looking casual:** Piggy Talk (unlocks quiet homecoming), Travel map (opens paintings), Soft Beat peek (curiosity without checklist), Share PNG (default social object).

---

## Input → verb mapping

Global bindings (`src/input/defaultBindings.ts`) enable verbs; they are not verbs themselves.

| Binding | Default verbs enabled |
|---------|----------------------|
| WASD / stick | walk, explore |
| E / A | talk, interact, enter hotspot |
| M / Y | travel (open map) |
| J / LB | quest log (journal) |
| I / X | inventory / bag view |
| Esc / B | leave, cancel, dismiss overlay |
| O / Start | settings |

---

## Gaps vs primary fantasy (honest)

| Primary fantasy phrase | Gap |
|------------------------|-----|
| “Build a life” | No multi-year sim; life = ledger + scars + expression |
| “Create opportunities” | Limited **sell**, no player-driven deal creation |
| “Form relationships” | No deep NPC arcs beyond talk count + scars |
| “Adapt to uncertainty” | Macro `economy.ts` weakly surfaced on Harbor |
| “Insure / hire / negotiate” | Not shipped as first-class verb families |

These gaps are **consistent with iconic freeze** (depth before width). New verbs should deepen Tier S/A before adding Tier D breadth.

---

## How to use this model

1. **Feature proposals:** Name which fantasy pillar and verb tier the feature serves. Reject Tier D in first hour.
2. **Content authoring:** Every island beat should expose at least one **Commit** verb with ledger or scar write.
3. **Playtest observer script:** Ask players to retell using verb language (*“I took…” “Harbor remembered…” “I borrowed…”*).
4. **Matrix maintenance:** When adding handlers in `IslandsApp.tsx`, add a row to [PLAYER_VERB_MATRIX.md](./PLAYER_VERB_MATRIX.md).

---

## Relationship to canon

| Document | Role |
|----------|------|
| This file | Fantasy pillars + verb architecture |
| [PLAYER_VERB_MATRIX.md](./PLAYER_VERB_MATRIX.md) | Per-verb audit table |
| [CAPITAL_DESIGN_CONSTITUTION.md](./CAPITAL_DESIGN_CONSTITUTION.md) | Non-negotiable principles |
| [CAPITAL_DESIGN_BIBLE.md](../CAPITAL_DESIGN_BIBLE.md) | Organ suit + loop detail |
| [PLAYER_HISTORY_SYSTEM.md](./PLAYER_HISTORY_SYSTEM.md) | Scar/plaque/decision history (if present) |
