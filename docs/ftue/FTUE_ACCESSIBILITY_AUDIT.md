# FTUE Accessibility Audit — Onboarding, Multi-Channel Design

**Date:** 2026-08-17  
**Law:** Every essential tutorial signal must remain understandable **without depending on one sensory channel**. Displayed control instructions must reflect the player's **current binding**, not hard-coded button names. Tutorials/help must be **replayable**.  
**Code:** `src/input/actionHints.ts` · `FtueControlsHint.tsx` · `SettingsPanel` replay · `docs/ftue/*`  
**Related:** `ACCESSIBILITY_GUIDE.md` · `PERCEPTUAL_LITERACY.md` · `FAILURE_RECOVERY.md`

---

## Executive summary

| Area | Status (post-fix) | Highest residual risk |
|------|-------------------|------------------------|
| Control copy | **Improved** — binding-aware hints on Ashore, Harbor, shore, Talk, hush | Legacy strings in deep 3D debug HUD |
| Multi-channel signals | **Good** on spine — text + icon + touch + audio SFX | Some organ stingers still audio-first |
| Text scaling | **Supported** — normal / large / xl on island root | Ashore chamber titles fixed px on sm breakpoint |
| Contrast | **Supported** — `highContrast` → `contrast-more` | Custom gold-on-amber Ashore still dense |
| Motor / precision | **Good** — TouchWalkPad, pointer-safe buttons, talk cooldown | Coin Sort still needs pile precision |
| Cognitive load | **Moderate** — 5 Ashore chambers; Bag coach after | Ready chamber still text-heavy |
| Replayable help | **Added** — Settings → Replay walk & talk chambers | Coin Bag has no full FTUE script replay |

---

## Audit dimensions

### 1. Text readability

| Surface | Finding | Severity | Verdict |
|---------|---------|----------|---------|
| Ashore chambers | Display serif headings, `text-sm` body, min-h-12 CTAs | S2 | **OK** with text size setting |
| Harbor coach strip | `text-sm` on dark blur panel | S2 | **OK** |
| Talk Battle | `text-base`/`text-lg` body, choice sublines for footprint | S1 | **OK** — footprint adds words not color alone |
| Coin Bag tips | Short lines + optional coach | S2 | **OK** |
| Mastery fail overlay | Escalating hints, score + threshold words | S1 | **OK** |

**Fix:** Island root applies `textSizeClass(a11y.textSize)` — scales all FTUE copy proportionally.

---

### 2. Text density

| Surface | Finding | Severity | Verdict |
|---------|---------|----------|---------|
| Ashore `ready` chamber | Signature loop preview before lived play | S2 | **ADAPT** — skippable via Esc |
| Kira Take rows | Foreshadow + stance in one line | S1 | Mitigated by footprint subline (PERCEPTUAL_LITERACY) |
| Piggy meet | One verb per step after Ashore | S2 | **OK** |
| Settings / Controls | Separate panels | S3 | **OK** |

**Rule:** Fail-tier hints add text only after a miss — not on attempt 1.

---

### 3. Contrast

| Surface | Finding | Severity | Verdict |
|---------|---------|----------|---------|
| Global | `highContrast` → Tailwind `contrast-more` on island root | — | **Supported** |
| Harbor HUD whisper | White/75–85 on plaza | S2 | Acceptable; high contrast helps |
| Take footprint strip | `#fffdf6` on `slate-950/55` border | S1 | **OK** — words + border |
| Amber coach on dark | Ashore / Harbor | S2 | Monitor with color-blind profiles |

---

### 4. Scaling

| Control | Location | Status |
|---------|----------|--------|
| Text size normal / large / xl | Harbor Settings → Accessibility | **Shipped** |
| Touch targets ≥44px | Ashore CTA `min-h-12`, Talk choices `min-h-12` | **Shipped** |
| UI zoom | Browser/OS | Relies on user agent |

---

### 5. Keyboard navigation

| Path | Finding | Severity | Fix |
|------|---------|----------|-----|
| Ashore talk | Was **KeyE hard-coded** only | **S0** | **`useInputAction("interact")` + Enter near ring** |
| Talk Battle | Enter / Esc via InputManager | S2 | Footer uses `InputPromptHint` |
| Harbor shops | Enter when near | S2 | Existing |
| Tab focus | Game UI components | S2 | Partial — 3D canvas not tab-focusable (expected) |

---

### 6. Controller / gamepad navigation

| Path | Finding | Severity | Fix |
|------|---------|----------|-----|
| Interact / map | Default gamepad bindings in `DEFAULT_BINDINGS` | — | **Supported** |
| Prompt glyphs | Xelu pack + fallback SVG | — | **Supported** |
| FTUE copy | Was keyboard-only "WASD · E" | **S0** | **`formatMovePhrase` → stick/D-pad on gamepad** |
| Ashore | Walk pad always shown (coarse pointer) | S1 | TouchWalkPad not gated off reduced motion |

---

### 7. Remapped controls

| Path | Finding | Severity | Fix |
|------|---------|----------|-----|
| Harbor whisper | Hard-coded E | **S0** | **`MoveTalkMapHint` + `actionHints.ts`** |
| Piggy dialogue | Hard-coded WASD/E | **S0** | **`{move}` / `{interact}` placeholders** |
| Keeper bubble | "Press E" | **S0** | **`{interact}` + `resolveControlPlaceholders`** |
| Ashore gate line | "Press E to talk" | **S0** | **`formatInteractPhrase`** |
| Take hush footer | "Esc · Leave" | S1 | **`actionBindingLabel("cancel")`** |
| Controls settings | Full rebind UI | — | **`ControlsSettingsPanel`** |

**Implementation:** `loadInputSettings()` → primary binding → `formatBindingLabel` / `InputPrompt`.

---

### 8. Screen reader compatibility (where supported)

| Surface | Support | Notes |
|---------|---------|-------|
| Talk Battle | `aria-modal`, `aria-label` on dialog; **choice `aria-label` includes footprint** | Fixed this pass |
| Take hush | `role="dialog"`, **`aria-live="polite"`** on caption phases | Fixed this pass |
| Ashore talk gate | **`aria-live="polite"`** on gate line | Fixed this pass |
| Harbor plaza | `sr-only` plaza room marker | Existing |
| 3D walk canvas | Not fully SR-navigable | **Gap** — compensated by text gate + touch button |

---

### 9. Subtitles / captions

| Beat | Visual text | Audio | Verdict |
|------|-------------|-------|---------|
| Take hush | Scar label, organ line, footprint, carpet CTA | Organ stinger + chime | **Multi-channel** — captions always on |
| Talk Battle | Full dialogue text | SFX only | **OK** — not audio-only lore |
| Scar spectacle | Plaque shelf line | Music duck | **OK** |
| Coin Sort fail | Score, Clear at, hint string | Fail SFX | **OK** |

**Fix:** Hush "…" replaced with **"Quiet after your Take…"** for SR legibility.

---

### 10. Audio-only information

| Case | Verdict |
|------|---------|
| Walk ring claim | Visual emissive + counter + SFX | **OK** |
| Insufficient funds | Toast text + unchanged wallet | **OK** |
| Organ poke | Visual toy pulse + SFX | **OK** |
| Weather mood | **Text coach** (`weatherCoachLine`) + sky | **OK** — not audio-only |

---

### 11. Color-only information

| Case | Verdict | Mitigation |
|------|---------|------------|
| Cove Take stance | Was risk | **Footprint subline** keep +$/mo · drain −$/mo |
| Walk rings | Pink ring + words | **OK** |
| Clear-at Coin Sort | Amber + number | **OK** |
| Jar vs treat | Foreshadow words | Harbor gossip differs by text |

---

### 12. Time pressure

| Beat | Timer? | Verdict |
|------|--------|---------|
| Ashore chambers | Auto-advance 500ms after walk rings only | **Low pressure** |
| Coin Sort (First Coins) | No countdown on spine | **OK** |
| Take hush | Auto-advance cinema; Esc skips | **OK** |
| Mastery quiz | No clock | **OK** |

---

### 13. Motor precision

| Beat | Demand | Mitigation |
|------|--------|------------|
| Walk rings | Reach marker | Large rings + walk pad |
| Talk | Near ring | **Tap "Talk to Piggy?" button** — no E required |
| Coin Sort | Pile taps | Fail recovery + retry stay-put |
| Rapid E spam | Accidental double-talk | 2.8s talk cooldown |

---

### 14. Memory burden

| Beat | Load | Mitigation |
|------|------|------------|
| Ashore | 5 steps | Progress dots; replay from Settings |
| Harbor guided | 2 steps | Coin Bag tip |
| Cove chain | Multi-NPC | Bag objective label |
| Irreversible Take | High | Footprint preview before commit |

---

### 15. Cognitive load

| Factor | Mitigation |
|--------|------------|
| One verb at a time | Ashore + `hubGuidedIntro` |
| Escalating hints | 4-tier ladder — conceptual before explicit |
| Optional digressions | Side quests don't block spine |
| Autonomy progression | Proof-gated coach removal (`AUTONOMY_PROGRESSION.md`) |

---

## Multi-channel checklist (essential signals)

| Signal | See | Hear | Touch | Read (SR) |
|--------|-----|------|-------|-----------|
| Move | Rings, pad | walk_stop | TouchWalkPad | Move phrase in copy |
| Talk near | Pink ring, CTA button | organ memory | Tap button | aria-live gate |
| Talk commit | Talk Battle UI | talk_confirm | Tap choice | aria-label + footprint |
| Broke spend | Toast, wallet | insufficient SFX | — | Toast text |
| Take sticks | Hush captions, scar | chime, organ | Esc/dismiss | aria-live dialog |
| Cashflow footprint | Strip text ±$/mo | — | — | Spoken in label |
| Map / carpet | HUD hint, hotspot | — | Tap | Binding icon + label |

---

## Replayable tutorial / help

| Resource | Replay path | Status |
|----------|-------------|--------|
| Ashore chambers | Harbor Settings → **Replay walk & talk chambers** | **Shipped** |
| Control bindings | Settings → Controls | **Shipped** |
| Coin Bag tips | Always available in HUD | **Shipped** |
| Failure hints | Re-trigger on retry | **Shipped** |
| Opening title cinema | `onReplayIntro` (App) | Existing |
| Full Cove quest script | — | **Gap** — use live NPCs + Bag |

---

## Fixes shipped (severity order)

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| A11Y-01 | S0 | Hard-coded E/WASD in FTUE HUD | `actionHints.ts`, `MoveTalkMapHint`, placeholders |
| A11Y-02 | S0 | Ashore ignored remapped interact | `useInputAction("interact")` |
| A11Y-03 | S0 | Piggy / keeper copy said "Press E" | `{interact}` templates + resolve |
| A11Y-04 | S1 | Take hush "…" opaque to SR | Verbal hush + `aria-live` |
| A11Y-05 | S1 | Talk choices SR missed footprint | `aria-label` on choices |
| A11Y-06 | S1 | Talk footer hard-coded Enter/Esc | `InputPromptHint` |
| A11Y-07 | S1 | Tutorial not replayable post-boot | Settings replay overlay |
| A11Y-08 | S2 | Shore whisper hard-coded | `IslandShoreView` hint component |

---

## Residual gaps (documented, not blocking)

- Full screen-reader traversal of 3D plaza (industry-hard; mitigated by HUD + talk button).
- Coin Sort still benefits from future **larger hit targets** mode.
- Some dev/QA strings still say WASD in comments only.
- Era shores / side content not re-audited this pass.

---

## Regression tests

```bash
npx vitest run src/input/actionHints.test.ts
npx vitest run src/islands/ftueAccessibility.test.ts
npx vitest run src/islands/story/onboardingNoAhead.test.ts
npx vitest run src/islands/views/ashoreComprehensionTutorial.test.ts
```

---

## Design principle (repeat)

> If a player cannot see color, hear audio, or use the default keyboard, they must still learn the **same money rule** from the FTUE — via words, numbers, icons, and touch targets that reflect **their** bindings.
