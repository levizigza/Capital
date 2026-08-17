# Opening experience — Perceptual Literacy

**Date:** 2026-08-17  
**Scope:** Title → Cast → Ashore → Harbor meet → Cove First Coins + Take → hush → carpet home → spectacle → Piggy homecoming → free roam  
**Lens:** What the player must **NOTICE** to play well — not how to press buttons.  
**Law:** Prefer layout · movement · contrast · animation · timing · spatial grouping · progressive reveal · state change before arrows or modal lectures.  
**Related:** `FEEDBACK_AUDIT.md` (did it work?) · `CORE_LOOP.md` (Take → Harbor remembers) · `FIRST_FINANCIAL_SCENARIO.md`

---

## Attention curriculum (what we train)

Players gradually learn **WHAT TO WATCH**, **WHEN TO WATCH IT**, and **WHY IT MATTERS**:

| Skill | WHAT TO WATCH | WHEN TO WATCH IT | WHY IT MATTERS |
|-------|---------------|------|----------------|
| **Place pulse** | Glowing rings / Piggy hotspot / Plinth lamp | Before the verb | The world names the next honest action |
| **Quiet chrome** | What’s *missing* (Wealth/Ledger stripped) | First Harbor meet / homecoming | Attention belongs on Piggy and memory, not meters |
| **Decision stakes** | Keep / drain line under irreversible choices | At the Speak phase of Kira Take | Permanent cashflow is chosen *before* cinema |
| **Mark climax** | Footprint strip + organ landmark flash | Take hush `mark` → `line` | Numbers prove Harbor wrote the choice |
| **Harbor echo** | Plinth glow tip · Piggy scar line · fog mood | After carpet home | Same sentence returns in place / person / sky |
| **Clear bar** | “Clear at N+ pts” beside score | During Coin Sort | Threshold is a watchable goal, not a surprise fail |

---

## Decision inventory (perception)

For each important decision: signal · where · competition · know it matters? · meaning obvious? · if ignored.

### Ashore — Fantasy / Walk / Talk / Dock

| Decision | Signal | Where | Competing | Knows it matters? | Meaning obvious? | If ignored |
|----------|--------|-------|-----------|-------------------|------------------|------------|
| Which toy to poke | Organ ring brightens + SFX | Chamber stage | Headline + Continue | Soft — Continue stays locked | Spatial yes | Soft-stuck until Esc |
| Which walk rings | Emissive bob → fade on claim | Practice pad | “n/3” text + walk pad | Yes | Yes | Delay advance |
| Talk readiness | Pink ring + near gate | Piggy ring | CTA when near | Mostly | E gated | Feels broken |
| Board Cove | Painting “Boarded” state | Dock mural | Launch CTA | Yes | Yes | Can’t launch |

### Harbor — first meet

| Decision | Signal | Where | Competing | Knows it matters? | Meaning obvious? | If ignored |
|----------|--------|-------|-----------|-------------------|------------------|------------|
| Talk Piggy first | Wave + `pulseHotspot` guide | Plaza | Quiet chip, Carpet, Outfitter | Social yes; money *intentionally* absent | Piggy yes; CF no | Can open map and skip Talk (`opened_map`) |
| Hunt for Wealth | **Absence** of Ledger HUD | Top chrome | Presence line only | Often misread as bug | No — quiet is the signal | Distracted from Piggy |

### Cove — earn / sort

| Decision | Signal | Where | Competing | Knows it matters? | Meaning obvious? | If ignored |
|----------|--------|-------|-----------|-------------------|------------------|------------|
| Earn vs spend in session | Wallet number + toast | Minigame HUD | Score · turns · profile | Session yes | Yes for wallet | Broke spend fails safely |
| Finish Coin Sort | Score vs **Clear at N+** | HUD bar | Money · turn | Better after Feedback Audit | Threshold now visible | Fail overlay surprise (mitigated) |
| Collect pouch | Pad gone + toast/SFX | Shore | Alma Talk | Mild | Better after toast | Soft Alma gate |

### Cove — Take (signature)

| Decision | Signal | Where | Competing | Knows it matters? | Meaning obvious? | If ignored |
|----------|--------|-------|-----------|-------------------|------------------|------------|
| Alma foreshadow | “jar or treat… Harbor will hear” | Talk listen | Quest / digression | Soft myth | No numbers | Underweights permanence |
| **Kira jar vs treat** | Choice copy + **footprint subline** | Talk Speak rows | Juice · both give jar item · defer | **Must** | Subline makes CF explicit | Treat as cosmetic / both-jar fake |
| Survive hush | Progressive `…` → mark → quote → Carpet CTA | Overlay + jar flash | Juice bursts (reduced when footprint present) | Cinema strong | Footprint is the math | Esc past → miss early CF proof |

### Harbor — return

| Decision | Signal | Where | Competing | Knows it matters? | Meaning obvious? | If ignored |
|----------|--------|-------|-----------|-------------------|------------------|------------|
| Read memory | Spectacle captions + Plinth peak | Plaza camera | Share freeze · Bag tip | Myth yes | Math weak without tip echo | Miss memory object |
| Link sky to Take | Fog density (tight vs fair) | Harbor atmosphere | Spectacle mute · optional weather tip | Rarely | Not color-alone if tip fires | Never connect CF → weather |
| Hear Piggy math | Scar weight + **footprint clause** | Homecoming Talk | Bond / next painting | Presence yes | Better with keep/drain clause | Myth without ledger map |
| Trust Ledger later | `keep +` / `drain −` HUD | After Cove Change | Wealth · magnets | Late | Words+numbers | Paralysis / wrong organ |

---

## Confusion questions (perception edition)

| Player ask | Worst signal failure |
|------------|----------------------|
| What should I be paying attention to? | Quiet Harbor with no Piggy pulse; hush `…` without knowing a number is coming |
| Why did that happen? | Weather after spend Take with no prior keep/drain sentence |
| Was that good or bad? | Color-only polarity (forbidden); jar vs treat without CF subline |
| What changed? | Take write with no footprint at decide / hush / Plinth echo |

---

## Attention-training moments (designed)

Prefer non-modal craft:

1. **Decide with eyes open** — irreversible Cove Take rows carry a keep/drain subline *inside* the choice button (spatial grouping). Same words hush will confirm.  
2. **One climax plane** — when footprint is on hush mark, skip juice *bursts* that compete with the strip; keep organ mark flash + SFX.  
3. **Echo the sentence** — Plinth glow Bag tip and Piggy homecoming reuse `takeFootprintFeedbackLine` so Harbor repeats the math in place and person.  
4. **Clear-at beside score** — Coin Sort trains “watch the threshold” without a fail lecture.  
5. **Quiet strip** — first-meet Harbor removes Wealth/Ledger so the eye learns *absence* as intentional.

Deferred (still valid, not this pass): fog densify beat before spectacle captions; premature Ledger HUD (forbidden by early fantasy); concept `attention_target` chrome as a second pulse layer.

---

## Non-goals

- Tutorial arrows / advisor modals for cashflow  
- Color-only good/bad  
- Rainbow particles over captions  
- Second coach layer on top of `pulseHotspot` / Bag tips  
- Fake tutorial ledger  

---

## Implementation status

| Moment | Status |
|--------|--------|
| Take choice footprint subline | **Done** — Talk Speak rows via `coveTakeChoiceFootprintPreview` |
| Hush mark: protect footprint from juice burst | **Done** — burst skipped when footprint present |
| Plinth glow tip echoes footprint | **Done** — `coinBagHarborTip` + `footprintLine` |
| Piggy homecoming CF clause | **Done** — `piggyHomecomingGraph` opts |
| Coin Sort clear-at | Done (Feedback Audit) |
| Ledger keep/drain wording | Done (Feedback Audit) |
| Weather densify beat | Follow-up |
| Alma numeric foreshadow | Follow-up (keep myth; decide is the teach) |

Code: `firstFinancialScenario.ts` · `TalkBattleScreen.tsx` · `TakeHushOverlay.tsx` · `coinBagBuddy.ts` · `harborTalks.ts` · `HomeHubView.tsx` · `IslandsApp.tsx`
