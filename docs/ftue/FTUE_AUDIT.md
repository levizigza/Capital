# FTUE Audit — Capital first-time player experience

**Date:** 2026-08-17  
**Scope:** Code + design docs as shipped on `main` (post Pattern Library Pass L).  
**Rule:** Reconstruct only what exists. No invented features. **No production code changes in this pass.**

**Primary sources**

| Area | Path |
|------|------|
| Boot | `src/App.tsx` (`bootPhase`: title → cast → teach → carpet) |
| Ashore teach | `src/islands/views/AshoreComprehensionTutorial.tsx` · `docs/ashore-teach-design.md` · `docs/harbor-ashore.md` |
| Harbor first meet | `src/islands/harborFirstMeet.ts` · `harborAshore.ts` · `story/storyBible.ts` |
| Plaza | `src/islands/views/HomeHubView.tsx` |
| Cove Take | `src/islands/content/coincraft-cove.islands.json` |
| Gates | `src/islands/progressGates.ts` (`hasCompletedCoveChange`) |
| Telemetry | `src/islands/types.ts` (`AnalyticsEventName`) · call sites in IslandsApp / overlays |

**Canon spine (freeze):** Harbor · Cove → Paycheck → Credit. Side shores after Cove Change. Family Room local.

---

## Executive verdict

The first-time path is a **two-layer tutorial**:

1. **Chamber-00 Ashore** (tutorial-only pad) — Fantasy → Walk → Talk → Dock → Launch  
2. **Live signature loop** (normal gameplay) — Harbor Piggy → Carpet → Cove search/earn → irreversible Take → hush → carpet home → spectacle → optional share → Piggy homecoming → free roam

Onboarding **does** teach Walk / Talk / Carpet / irreversible Take / Harbor remembers through play. It **does not** yet guarantee comprehension of Soft Beat, Share, Outfitter, Paycheck organs, or fail dignity before they appear. Several steps are **bypassable** (`Leave · Esc` on Ashore; `opened_map` can complete guided without Piggy Talk). Telemetry is **sparse on boot UI** (title / cast / Ashore chambers emit almost nothing).

---

## Macro map

```
LAUNCH
→ FIRST CONTROL
→ FIRST MEANINGFUL ACTION
→ FIRST DECISION
→ FIRST CONSEQUENCE
→ FIRST REWARD
→ FIRST COMPLETE CORE LOOP
→ FIRST UNGUIDED DECISION
→ FREE PLAY
```

| Macro stage | Where it happens in Capital (code) |
|-------------|-------------------------------------|
| **LAUNCH** | Title mural (`CapitalOpeningIntro`) → Cast (`BootCastSelect`) |
| **FIRST CONTROL** | Ashore Walk chamber — Voyager displacement to glowing rings |
| **FIRST MEANINGFUL ACTION** | Ashore Talk (near + E) *or*, if Ashore skipped, Harbor Talk Piggy |
| **FIRST DECISION** | Cove Keeper Kira Take — jar vs treat (irreversible) |
| **FIRST CONSEQUENCE** | Scar + `chapterQuietPending` + Take hush cinema |
| **FIRST REWARD** | Savings jar item + organ hush line + “Carpet home — Harbor felt that” |
| **FIRST COMPLETE CORE LOOP** | Take → carpet home → scar spectacle → (optional share) → Piggy homecoming that names Coin hold + Paycheck open |
| **FIRST UNGUIDED DECISION** | After `q_cc_save_or_spend` complete: map opens Paycheck / side shores; player picks next painting without guided coach |
| **FREE PLAY** | Harbor magnets (Arcade / Studio / Ritual), era digressions, Soft Beat discovery, Outfitter — no critical-path coach |

---

## Stage-by-stage audit

Classification key: **KEEP · SIMPLIFY · MOVE LATER · MAKE INTERACTIVE · MAKE CONTEXTUAL · REMOVE · MISSING**

### 0. LAUNCH — Title mural

| Field | Code truth |
|-------|------------|
| Concept | Brand / Harbor mural fantasy (“Capital”) |
| Player action | Watch eras; CTA **“Choose your Voyager”**; optional skip mural sweep |
| Prior knowledge | None |
| Doing vs reading | Mostly watching + one CTA |
| Feedback | Era captions; brand title |
| Failure | None meaningful |
| Recovery | Skip mural control; QA-only full skip (`?skipIntro=1` + `VITE_QA=1`) |
| Success proves comprehension? | **No** |
| Necessary now? | Brand frame — yes for identity; length is debatable |
| Normal vs tutorial-only | **Boot-only** (every full page load) |
| Misconceptions | Tagline can promise Carpet before Ashore teach still runs |
| A11y | `useReducedMotion` on mural |
| Telemetry | **None** found in intro components |

**Classify:** **SIMPLIFY** (duration / skip clarity) · brand beat itself **KEEP**

---

### 1. LAUNCH — Cast select

| Field | Code truth |
|-------|------------|
| Concept | You are a Voyager; pick look |
| Player action | Select base cast; optional customize; **“Continue to Ashore Teach →”** |
| Prior knowledge | None |
| Doing vs reading | Doing |
| Feedback | Character preview |
| Failure | Soft — must pick to continue |
| Recovery | Defaults exist (`BASE_VOYAGER`) |
| Success proves comprehension? | **No** (identity, not systems) |
| Necessary now? | Helps ownership; not required for systems literacy |
| Normal vs tutorial-only | Boot-only; Outfitter later is discovery |
| Misconceptions | “I finished character creation = I finished tutorial” |
| A11y | Depends on cast UI contrast / focus |
| Telemetry | No boot-phase track; later `character_saved` only if Outfitter save |

**Classify:** **KEEP** (identity) · customize depth **MOVE LATER** if it delays first control

---

### 2. FIRST CONTROL — Ashore Fantasy poke

| Field | Code truth |
|-------|------------|
| Concept | “Money is alive here” + mural thesis; organ toys |
| Player action | Poke ≥1 Memory/Coin toy; Continue gated on poke |
| Prior knowledge | None |
| Doing vs reading | Doing + short copy / thesis |
| Feedback | Organ SFX; toy response; muted CTA + `toyNudge` if continue early |
| Failure | Blocked continue until poke |
| Recovery | Nudge pulse |
| Success proves comprehension? | **Weak** — proves poke, not organ literacy |
| Necessary now? | Fantasy door — yes per design bible; organ names can wait |
| Normal vs tutorial-only | **Tutorial-only** chamber |
| Misconceptions | “I understand Coin/Clock/Spiral/Memory” after one poke |
| A11y | Reduced motion shortens cinema; toys still required |
| Telemetry | **None** on chamber advance |

**Classify:** **KEEP** fantasy poke · organ glossary **MOVE LATER** · **MAKE CONTEXTUAL** thesis after first Take if still unread

---

### 3. FIRST CONTROL — Ashore Walk rings

| Field | Code truth |
|-------|------------|
| Concept | Explore by walking the Voyager |
| Player action | Reach all glowing markers (`WALK_MARKERS`); WASD/arrows; TouchWalkPad if not reduced |
| Prior knowledge | None |
| Doing vs reading | **Doing** (body lesson) |
| Feedback | `{n}/{total} rings · Chamber clear`; auto-advance |
| Failure | Stuck if controls unclear / no pad on reduced-motion desktop without keyboard |
| Recovery | Chamber stays until rings claimed |
| Success proves comprehension? | **Yes** — displacement required |
| Necessary now? | **Yes** — first control |
| Normal vs tutorial-only | Tutorial pad; same WASD used in Harbor/shores |
| Misconceptions | “Rings are collectibles forever” |
| A11y | TouchWalkPad **hidden** when reduced motion — keyboard-only risk on tablet with reduce on |
| Telemetry | **None** |

**Classify:** **KEEP** · **MAKE CONTEXTUAL** if player already walked Harbor (skip case) · a11y pad **MISSING** when reduced+touch

---

### 4. FIRST MEANINGFUL ACTION — Ashore Talk (near + E)

| Field | Code truth |
|-------|------------|
| Concept | Talk is opt-in: enter pink ring, then E (or Talk button) |
| Player action | Approach Piggy practice target; E |
| Prior knowledge | Walk |
| Doing vs reading | Doing |
| Feedback | Organ SFX; auto-advance; copy about meeting at Harbor |
| Failure | Stand outside ring and mash E — no talk |
| Recovery | Stay in ring; on-screen Talk CTA when near |
| Success proves comprehension? | **Yes** for near+E pattern |
| Necessary now? | Yes if player stays in teach; duplicated again on Harbor |
| Normal vs tutorial-only | Tutorial rehearsal of normal Talk |
| Misconceptions | “E talks from anywhere” |
| A11y | Needs clear near-state; button fallback exists |
| Telemetry | **None** in Ashore |

**Classify:** **KEEP** · if Ashore kept short, Harbor Talk alone may suffice → Ashore Talk **SIMPLIFY** or **REMOVE** for veterans who Esc

---

### 5. Ashore Dock + Launch

| Field | Code truth |
|-------|------------|
| Concept | Money Carpet = voyage vehicle; Cove is first painting |
| Player action | Tap-board lit Cove painting; Launch CTA |
| Prior knowledge | Fantasy of voyage |
| Doing vs reading | Doing + Ready chamber reading (“real lesson is Cove choice staining Harbor”) |
| Feedback | Dock nudge if board skipped; Launch advances boot |
| Failure | “Board Cove first” muted CTA |
| Recovery | Nudge + retry board |
| Success proves comprehension? | Partial — boards painting, not real travel map yet |
| Necessary now? | Teaches vehicle metaphor before real map |
| Normal vs tutorial-only | Tutorial-only; real dock is Harbor Carpet hotspot |
| Misconceptions | “I already went to Cove” (only boarded a practice painting) |
| A11y | Pointer-safe activate |
| Telemetry | **None** |

**Classify:** **KEEP** dock prove · Ready chamber copy **SIMPLIFY** · duplicate carpet teach vs Harbor **SIMPLIFY**

**Whole Ashore skip:** `Leave · Esc` → `onComplete` → carpet. **Classify skip:** **KEEP** (veteran path)

---

### 6. Carpet opening flight → Harbor land

| Field | Code truth |
|-------|------------|
| Concept | Transition into Ordinary World (Harbor Haven) |
| Player action | Mostly watch; Esc / timeout can finish (`CarpetOpeningIntro`) |
| Prior knowledge | Dock metaphor |
| Doing vs reading | Spectating |
| Feedback | Flight cinema; then plaza |
| Failure | WebGL fail → myth fallback |
| Recovery | Myth fallback always offers Talk + Carpet (`mythFallbackActions`) |
| Success proves comprehension? | No |
| Necessary now? | Ceremony; length tunable |
| Normal vs tutorial-only | Boot cinema |
| Telemetry | On Islands mount: `session_started`, `tutorial_started` (once), `onboarding_completed` (`ashore_land` / `carpet_boot`), `island_entered`, `screen_enter` |

**Classify:** **SIMPLIFY** duration · myth fallback **KEEP**

---

### 7. Harbor FIRST MEET — Piggy presence (`meet_guide`)

| Field | Code truth |
|-------|------------|
| Concept | One verb: find / talk Piggy; quiet chrome |
| Player action | Walk plaza; Talk when near (`shouldForceTalkCta` near Piggy) |
| Prior knowledge | Walk + Talk from Ashore (or not, if skipped) |
| Doing vs reading | Doing + Coin Bag tip + presence line |
| Feedback | Soft gold ring; coach: “Walk the plaza — Piggy waves by the fountain.”; Bag: “Talk to Piggy Penny…” |
| Failure | Wander into Outfitter/Capsule/Carpet distractions (stalls **not** stripped on first meet — only on quiet homecoming) |
| Recovery | Coin Bag + guide pulse; myth fallback Talk+Carpet |
| Success proves comprehension? | Talk end advances `talked_guide` → `to_dock` |
| Necessary now? | **Yes** — Harbor Keeper beat |
| Normal vs tutorial-only | Normal plaza with quiet chrome overlays |
| Misconceptions | Carpet is the job before Piggy; bank exists (Ledger Bank hidden on `meet_guide`) |
| Bypass | **`opened_map` from `meet_guide` sets `done`** — Piggy Talk not strictly forced |
| A11y | Guide arrows default on; Esc on Talk Battle Leave |
| Telemetry | `dialogue_started`, `dialogue_choice`, `screen_enter` `dialogue:…` |

**Classify:** **KEEP** presence law · plaza stall noise on first meet **SIMPLIFY** / **MOVE LATER** · Piggy-skip via map **MAKE CONTEXTUAL** (allow but re-hook Piggy) or tighten gate

---

### 8. Harbor — Board Money Carpet (`to_dock`)

| Field | Code truth |
|-------|------------|
| Concept | First voyage: Coincraft Cove painting |
| Player action | Open travel / board Carpet; CTA “Board Money Carpet · Coincraft Cove” |
| Prior knowledge | Talk done (or map bypass) |
| Doing vs reading | Doing |
| Feedback | Coach + Piggy line pointing at carpet; map spine only |
| Failure | Open wrong locked chip (Paycheck/side locked) |
| Recovery | Lock hints: “Finish Cove Change first — Coin holds” |
| Success proves comprehension? | Entering Cove proves voyage |
| Necessary now? | **Yes** |
| Normal vs tutorial-only | Normal travel |
| Telemetry | `opened_map` advances guided to `done`; `island_entered` Cove |

**Classify:** **KEEP**

---

### 9. Cove — Search / earn (pre-Take)

| Field | Code truth |
|-------|------------|
| Concept | Earn fair coins before a money Take; brushes vs glitter foreshadow |
| Player action | Talk Captain Penny → pouch → Coin Sort minigame → Alma → lighthouse (needs pouch) |
| Prior knowledge | Walk/Talk; minigame verbs new |
| Doing vs reading | Doing + dialogue reading |
| Feedback | Quest journal; Coin Bag tips; minigame juice |
| Failure | Minigame fail → dignity overlay Retry (`fail_reason`, `minigame_retry`) — **not pre-taught** |
| Recovery | Retry stay-put on structure path; Leave where allowed |
| Success proves comprehension? | Completing `q_cc_first_coins` proves earn loop; not Take yet |
| Necessary now? | Yes for fair Take setup |
| Normal vs tutorial-only | Normal quest (`TUTORIAL_QUEST_IDS` includes `q_cc_first_coins`) |
| Optional | Shelly digression `q_cc_shell_want` — scars do **not** trigger chapter quiet |
| Soft Beat | Optional inside Giant Coin Jar — **not** on critical path |
| Telemetry | `quest_*`, `tutorial_completed`, `minigame_*`, `item_collected`, `dialogue_*` |

**Classify:** **KEEP** earn path · Soft Beat **MOVE LATER** (already) · fail dignity **MAKE CONTEXTUAL** on first fail only · digression **KEEP** as optional

---

### 10. FIRST DECISION — Keeper Kira Take

| Field | Code truth |
|-------|------------|
| Concept | Irreversible money choice; Harbor already listening |
| Player action | Choose **“Jar before treat…”** / **“Treat before jar…”** / **“Maybe later.”** |
| Prior knowledge | Earn quest; Alma foreshadow |
| Doing vs reading | Doing (choice) + reading foreshadow rows |
| Feedback | Immediate dialogue naming Harbor; effects: `setIrreversible` `cove_save_vs_spend` + `addScar` plaque |
| Failure | Choosing “Maybe later” delays Change — lighthouse waits |
| Recovery | Return to Kira |
| Success proves comprehension? | **Partial** — choosing proves commitment; world memory proves later on Harbor |
| Necessary now? | **Yes** — heart of signature loop |
| Normal vs tutorial-only | **Normal gameplay** (first instance of Take pattern) |
| Misconceptions | Both paths “win” a jar → “choice didn’t matter”; foreshadow text is long |
| A11y | Talk Battle Esc · Leave abandons encounter |
| Telemetry | `dialogue_choice`; then hush `core_loop_beat` `{ beat: "take_mark" }` |

**Classify:** **KEEP** · choice row length **SIMPLIFY** · “Maybe later” **KEEP** · pre-Take practice **MISSING** (by design: teach-when-needed)

---

### 11. FIRST CONSEQUENCE — Take hush + chapter quiet

| Field | Code truth |
|-------|------------|
| Concept | Choice stains the shore; hush before carpet home |
| Player action | Read captions; dismiss / board carpet CTA |
| Prior knowledge | Take committed |
| Doing vs reading | Mostly reading + one CTA |
| Feedback | Organ line; mark “A Coin choice you can’t undo”; CTA carpet home; Coin Bag may coach “Walk to the pier · board Carpet” |
| Failure | Leave cinema early — still have scar |
| Recovery | Esc · Leave on overlays |
| Success proves comprehension? | Weak until Harbor spectacle |
| Necessary now? | **Yes** — bridges Take → home |
| Normal vs tutorial-only | Normal signature cinema |
| Telemetry | `core_loop_beat` `take_mark` |

**Classify:** **KEEP** · caption density **SIMPLIFY**

---

### 12. FIRST REWARD + COMPLETE CORE LOOP — Harbor felt

| Field | Code truth |
|-------|------------|
| Concept | Harbor remembers; Plinth / spectacle; optional share; Piggy names Change |
| Player action | Watch spectacle; Share / Keep walking / Witness optional; Talk Piggy on quiet homecoming |
| Prior knowledge | Scar exists; guided preferably complete (`canOpenSignatureCinema`) |
| Doing vs reading | Spectating + optional share doing + Talk |
| Feedback | Cinema; share card; quiet chrome strips stalls; homecoming message includes Coin kid sentence + Paycheck newly open |
| Failure | Spectacle blocked if guided incomplete / plaza not ready |
| Recovery | Gates in `signatureCinemaGate.ts`; myth fallback |
| Success proves comprehension? | **Strongest FTUE proof** if player can retell “Harbor felt my Take” |
| Necessary now? | **Yes** — closes loop |
| Normal vs tutorial-only | Normal signature loop |
| Share | Optional — no forced share tutorial |
| Telemetry | `core_loop_beat` `harbor_felt`; share overlay **no** `analytics.track` found |
| Quiet homecoming | `isQuietHomecoming` — Piggy presence; stalls stripped |

**Classify:** **KEEP** spectacle + Piggy · Share **MAKE CONTEXTUAL** (tip once) · share telemetry **MISSING** · Witness **KEEP** optional

---

### 13. FIRST UNGUIDED DECISION → FREE PLAY

| Field | Code truth |
|-------|------------|
| Concept | After Cove Change, player picks next goal without castle coach |
| Player action | Travel map: Paycheck unlocks; side shores unlock; Harbor Arcade/Studio/Ritual magnets open |
| Prior knowledge | Signature loop once |
| Doing vs reading | Doing; Coin Bag may tip “Next painting: Paycheck Peninsula” |
| Feedback | Lock hints clear; free-roam whisper on map |
| Failure | Ignore Paycheck; wander digressions (allowed) |
| Recovery | Coin Bag horizons (Now · Painting · Seal) |
| Success proves comprehension? | Choosing Paycheck vs digression shows goal literacy |
| Necessary now? | Free play **is** the goal of FTUE end |
| Normal vs tutorial-only | Normal |
| Daily Ritual | Auto-open only after Cove Change + dock + Piggy talked + no pending spectacle |
| Telemetry | Standard island/quest events; `dwell_stuck` if stuck 90s |

**Classify:** **KEEP** unlock gating · first free-choice coach **MAKE CONTEXTUAL** (one Bag tip) · Soft Beat / Outfitter remain discoveries **KEEP**

---

## Cross-cutting findings

### Doing vs reading balance
- **Strong doing:** Walk rings, Talk near+E, Dock board, Cove quests, Take choice.  
- **Reading-heavy:** Title mural, Ready chamber, Take hush captions, spectacle.  
- **Gap:** Boot chambers emit almost no telemetry → cannot measure drop-off before Harbor.

### Tutorial-only vs normal gameplay
| Tutorial-only | Normal gameplay used as teach |
|---------------|-------------------------------|
| Ashore 5 chambers | Harbor Talk / Carpet / Cove quests |
| Carpet boot cinema | Take · hush · spectacle · homecoming |
| Quiet chrome overlays | Travel locks until Cove Change |

### Forced vs skippable (code)

| Step | Forced? |
|------|---------|
| Title every boot | Forced (QA skip only) |
| Cast | Forced to continue |
| Ashore teach | **Skippable** (`Leave · Esc`) |
| Carpet boot | Forced after teach/skip |
| Piggy Talk | Soft-forced; **bypass via map** |
| Outfitter / Capsule / Soft Beat / Shelly | Optional |
| Kira Take commit | Optional until chosen |
| Share / Witness | Optional |
| Paycheck before Cove Change | Locked |

---

## Classification rollup (elements)

| Element | Class |
|---------|-------|
| Brand title mural | KEEP / SIMPLIFY length |
| Cast select | KEEP / MOVE LATER deep customize |
| Ashore Fantasy poke | KEEP |
| Ashore organ glossary ambition | MOVE LATER |
| Ashore Walk rings | KEEP |
| Ashore Talk rehearsal | KEEP / SIMPLIFY if Harbor Talk enough |
| Ashore Dock painting | KEEP |
| Ashore Ready lecture | SIMPLIFY |
| Ashore Esc skip | KEEP |
| Carpet boot cinema | SIMPLIFY |
| Harbor quiet first-meet chrome | KEEP |
| First-meet stall clutter | SIMPLIFY |
| Piggy Talk | KEEP |
| Map bypass of Piggy | MAKE CONTEXTUAL (re-hook) |
| Carpet → Cove | KEEP |
| Cove earn quest | KEEP |
| Coin Sort minigame | KEEP |
| Pre-teach of fail overlay | MISSING → MAKE CONTEXTUAL on first fail |
| Soft Beat before Take | MOVE LATER (already organic) |
| Kira Take fork | KEEP |
| Take foreshadow copy length | SIMPLIFY |
| Take hush | KEEP / SIMPLIFY |
| Scar spectacle | KEEP |
| Share teach | MAKE CONTEXTUAL / MISSING forced beat |
| Share analytics | MISSING |
| Piggy homecoming | KEEP |
| Paycheck unlock after Change | KEEP |
| Free-roam side shores gate | KEEP |
| Boot-chamber telemetry | MISSING |
| Touch pad when reduced+touch | MISSING |

---

## Prioritized list — 10 highest-impact onboarding problems

1. **Boot path has almost no telemetry (title / cast / Ashore)** — cannot see where first-timers abandon before Harbor; blocks evidence-based FTUE iteration.  
2. **Piggy Talk is bypassable via `opened_map` → `done`** — players can reach Cove without the Harbor Keeper beat; breaks “Ordinary World” comprehension.  
3. **Ashore is long and fully skippable, but Harbor still assumes Talk literacy** — Esc skippers get weaker first control proof; stay-ers may feel double-taught.  
4. **First-meet plaza still exposes Outfitter / Capsule / Carpet hotspots** — stalls are only stripped on quiet homecoming; dilutes “one verb: Piggy.”  
5. **Take foreshadow / choice rows are text-dense** — risk of reading fatigue at the single most important decision.  
6. **Fail dignity / Retry is not previewed** — first Coin Sort fail can feel like a soft-lock until overlay is understood.  
7. **Share is optional with no contextual teach and no analytics** — “talk outside the game” pattern (#46) is easy to miss; no funnel signal.  
8. **Soft Beat vs arcade remains undiscovered on critical path** — fine per teach-when-needed, but many FTUE sessions never prove the toy/quiet verb.  
9. **Ready chamber + mural thesis front-load organ/spine vocabulary** — Paycheck/Credit named before unlock; cognitive load without action.  
10. **Reduced-motion + touch can remove TouchWalkPad** — first control chamber may strand touch users who also prefer reduced motion.

---

## Explicit non-goals of this audit

- Did **not** modify production code.  
- Did **not** invent Soft Beat gates, multiplayer onboarding, or new islands (freeze).  
- Did **not** claim #94 human playtest Pass (still Hold on pattern library board).

## Suggested next artifacts (docs only; not written here)

- FTUE redesign brief keyed to the 10 problems above  
- Telemetry plan for `tutorial_step` on Ashore chambers  
- Cold script: Esc-skip Ashore vs full Ashore funnel compare
