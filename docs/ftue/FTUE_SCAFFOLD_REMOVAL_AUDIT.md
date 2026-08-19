# FTUE scaffold removal audit

**Objective:** Remove as much tutorial as possible **without reducing comprehension**.  
**Desired end state:** Scaffolding gradually becomes indistinguishable from normal Capital gameplay.  
**Law:** Do not strip instruction for minimalism alone. Every removal must clear the metric gates below.

**Related:** `FTUE_USABILITY_PROTOCOL.md` · `FTUE_EXPERIMENTATION.md` · `FTUE_TELEMETRY.md` · `PLAYER_ONBOARDING.md` · `FAILURE_RECOVERY.md`

---

## Metric gates (every removal)

| Gate | Pass means |
|------|------------|
| **independent_transfer** | Player can still apply earn→decide / save-vs-spend in a new context |
| **failure_recovery** | Failures still escalate to useful assist without softlock |
| **player_hesitation** | Does not create new freezes at next-verb beats |
| **accessibility** | Binding-aware / reduced-motion / non-visual paths remain |
| **freeplay_conversion** | After guidance thins, players still find a next verb |

If any gate is **risk**, prefer **DEFER** (optional / later / experiment) over **DELETE**.

---

## Decision vocabulary

| Decision | Meaning |
|----------|---------|
| **KEEP** | Gameplay/feedback cannot yet replace it without comprehension risk |
| **TRIM** | Shorten or merge duplicate chrome; keep the teach |
| **DEFER** | Appear later, only on failure, or behind Settings |
| **OPTIONAL** | Player-toggled or proximity-only |
| **DELETE** | Remove; world already teaches it |

For each item, the seven questions are answered in compressed form: **G**ameplay · **F**eedback · **C**ontext · **U**I · **L**ater · **O**ptional · **X** delete?

---

## Inventory & rulings

### Boot

| # | Element | Type | Q (G/F/C/U/L/O/X) | Decision | Metric notes |
|---|---------|------|-------------------|----------|--------------|
| 1 | Title mural | cinematic | G no · F no · C yes (fantasy) · U — · L yes · O skip exists · X no | **KEEP** (+ Skip) | Fantasy context; skip already optional |
| 2 | Cast select | modal | Required identity | **KEEP** | Not tutorial chrome |
| 3 | Experienced skip checkbox | mode | — | **KEEP** | Reduces Ashore for skilled players |

### Ashore Teach

| # | Element | Type | Q | Decision | Metric notes |
|---|---------|------|---|----------|--------------|
| 4 | 5-chamber shell | explanation | G partial (Harbor could teach walk) · Esc skip | **KEEP** shell; **TRIM** copy | Cold players need prove-it; Esc preserves autonomy |
| 5 | Fantasy poke gate | forced_click | G yes (organ toys) · X no | **KEEP** | Living-money fantasy; short |
| 6 | Walk rings | forced_click | G yes · Harbor could teach later | **KEEP** | Transfer of *controls* to Harbor; a11y TouchWalkPad |
| 7 | Talk prove | forced_click | G yes | **KEEP** | Prevents Harbor Talk hesitation |
| 8 | Dock board prove | forced_click | G yes (painting) | **KEEP** | Map metaphor before Cove |
| 9 | Launch route explanation | explanation | C yes · U chips enough · long prose X | **TRIM** | One sentence + chips; cut lecture |
| 10 | TouchWalkPad | control | A11y | **KEEP** | Accessibility gate |

### Carpet

| # | Element | Type | Q | Decision | Metric notes |
|---|---------|------|---|----------|--------------|
| 11 | Carpet flight | cinematic | O skip | **KEEP** | Fantasy continuity; skippable |
| 12 | WorldArriveOverlay | overlay | F/C yes · short | **KEEP** | Perceptual literacy; Esc |

### Harbor guided

| # | Element | Type | Q | Decision | Metric notes |
|---|---------|------|---|----------|--------------|
| 13 | `hubGuidedIntro` state | other | Needed for soft sequencing | **KEEP** (invisible) | Not chrome |
| 14 | **Castle coach banner** | advisor_line | G Piggy pulse · F bag · C presence · U CTA · **X yes** (duplicate) | **DELETE** | Same next-verb as presence + Coin Bag + proximity CTA; was stacking tutorial HUD |
| 15 | Piggy presence line | advisor_line | C/U yes · short | **KEEP** | World whisper, not a tip card |
| 16 | Near-Piggy Talk CTA | forced_click | Proximity = O | **OPTIONAL** (already) | Keep proximity-only; never ambush |
| 17 | Board Carpet CTA | forced_click | U hotspot also works | **KEEP** on `to_dock` | Primary freeplay conversion lever |
| 18 | Piggy bubble + pulse | highlight | G/C | **KEEP** | Gameplay-native attention |
| 19 | MoveTalkMapHint (Harbor) | tooltip | Ashore already taught · L failure · O | **TRIM** | Don’t re-teach bindings on first meet; keep when no CTA / for a11y remap |
| 20 | Coin Bag tip strip | advisor_line | G pointing · lifelong | **KEEP** tip; **TRIM** coach | Buddy is normal Capital, not FTUE popup |
| 21 | 3D guide arrow | arrow | O Settings | **OPTIONAL** | Default on for cold; toggleable |
| 22 | GuideEdgeCue | arrow | O with arrows | **OPTIONAL** | Same toggle |
| 23 | Harbor myth fallback | other | Failsafe | **KEEP** | Accessibility / recovery |

### Map / Cove

| # | Element | Type | Q | Decision | Metric notes |
|---|---------|------|---|----------|--------------|
| 24 | Locked islands | locked_control | Progression truth | **KEEP** | Context teach; lock hints OK |
| 25 | Proximity Board carpet | forced_click | O | **KEEP** | World verb |
| 26 | Cove First Coins bag tip | advisor_line | Quest context | **KEEP** | Points at Penny — normal buddy |
| 27 | Objective pointing | arrow | O guide arrows | **OPTIONAL** | |
| 28 | Shore interact CTA | forced_click | Proximity | **KEEP** | Normal Capital interact |
| 29–30 | Soft Beat | overlay | Fully optional digression | **KEEP** optional | Must not become required FTUE |
| 31 | Minigame fail overlay | modal | F recovery | **KEEP** | failure_recovery gate |

### Consequence

| # | Element | Type | Q | Decision | Metric notes |
|---|---------|------|---|----------|--------------|
| 32 | Take hush | overlay | F consequence | **KEEP** | Core loop comprehension |
| 33 | Carpet-home quiet CTA | forced_click | One verb | **KEEP** | Prevents post-Take freeze |
| 34 | Scar spectacle | overlay | F Harbor memory | **KEEP** | Transfer of “money is alive” |
| 35 | Felt share | modal | O dismiss | **OPTIONAL** | Already |
| 36 | Quiet homecoming Talk | forced_click | Names scar | **KEEP** (trimmed push) | Comprehension of consequence |
| 37 | Day-2 echo | overlay | L later | **DEFER** (already day-2) | Not first-session |

### Freeplay

| # | Element | Type | Q | Decision | Metric notes |
|---|---------|------|---|----------|--------------|
| 38 | **Daily Ritual auto-open** | modal | L/O · interrupts freeplay · **X auto** | **DELETE auto-open** | Ritual stays on plaza; freeplay_conversion ↑; discover via world |
| 39 | Settings replay / arrows | other | O | **KEEP** | Refresher without forcing |
| 40 | Returning briefing | modal | Returning only | **KEEP** | Not FTUE replay |
| 41 | WelcomeOnboarding | modal | Dead path | **DELETE** (already demoted) | Confirm stays unmounted |

---

## Removals shipping in this pass

| Change | Why safe |
|--------|----------|
| **Delete Castle Grounds coach banner** | Duplicate of presence line + Coin Bag + Piggy pulse + Board Carpet CTA. Experienced/returning already suppressed. |
| **Never auto-open Daily Ritual** | Post-Cove modal stole freeplay; plaza/Piggy can surface ritual as normal gameplay. |
| **Trim Coin Bag meet_guide coach** | Drop “I’m Coin Bag…” self-intro; keep point-at-Piggy tip. |
| **Trim Ashore Launch prose** | One short sentence + route chips; lesson stays “Harbor then Cove / choice stains.” |
| **Trim Harbor first-meet controls re-teach** | Ashore already proved bindings; whisper becomes “walk to Piggy” without re-listing keys. |

### Explicitly **not** removed (comprehension holds)

- Ashore prove chambers (Esc remains)  
- Take hush + scar spectacle  
- Fail overlay / hint escalation  
- Coin Bag pointing (normal Capital buddy)  
- Guide arrows default-on (optional in Settings)  
- Quiet Carpet-home CTA after Take  
- Side-shore map locks until Paycheck Change  

---

## Gradual indistinguishability plan

| Stage | Scaffolding character |
|-------|----------------------|
| **0 Ashore** | Explicit prove chambers (skippable) — only place that *looks* like a tutorial |
| **1 Harbor meet** | World props only: Piggy pulse, presence whisper, proximity Talk, Coin Bag |
| **2 Voyage** | Board Carpet CTA + bag tip — same as later “go to painting” verbs |
| **3 Cove** | Quest objectives via bag + shore CTAs — identical to Paycheck/Credit |
| **4 Consequence** | Cinema + quiet CTA — signature gameplay, not tips |
| **5 Freeplay** | No auto modals; bag + arrows optional; ritual as place, not popup |

Target: a returning designer cannot tell Stage 2+ from “normal Capital” without checking `hubGuidedIntro`.

---

## Validation plan

1. Usability cohort (n=3–5) after this pass — protocol silence rules.  
2. Watch primary metrics: `freeplay_conversion`, `time_to_first_core_loop`, `failure_recovery_rate`, `independent_transfer_rate`.  
3. If hesitation spikes at Piggy or Carpet, **restore** a single presence/CTA only — not the castle coach card.  
4. Experiment `ashore_coach_density_v1` can treat this DELETE as the new control.

---

## Code touchpoints

- `src/islands/harborAshore.ts` — `shouldShowCastleCoach`, `shouldAutoOpenDailyRitual`  
- `src/islands/story/coinBagBuddy.ts` — meet_guide tip  
- `src/islands/views/AshoreComprehensionTutorial.tsx` — Launch copy  
- `src/islands/views/HomeHubView.tsx` — first-meet whisper trim  
- Tests: `harborAshore.test.ts`, `onboardingNoAhead.test.ts`
