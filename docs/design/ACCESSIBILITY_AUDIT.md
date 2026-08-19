# Accessibility audit — Capital

**Date:** 2026-08-18  
**Scope:** Shipped `main` practices vs current game a11y expectations.  
**Policy:** **Do not implement cosmetic accessibility while gameplay blockers remain.** Fix remapping truth and softlocks before contrast polish.

---

## Already strong (do not regress)

| Area | Evidence |
|------|----------|
| **Text size** | Settings `textScale` presets (`sm`/`md`/`lg`/`xl`) → CSS `--cap-font-scale` (`SettingsModal`, `App.css`) |
| **High contrast** | Toggle → `data-high-contrast` + WCAG-oriented CSS variables |
| **Reduced motion** | Setting **or** `prefers-reduced-motion` → `useReducedMotion` / `a11yMotion.ts` / `spectacleReduced` |
| **Input remapping UI** | Full binding editor + conflict detection (`SettingsModal`, `inputBindings.ts`) |
| **Binding-aware copy (partial)** | `formatBinding` / `getHint` on FTUE, HUD tips, deal tips, pause |
| **Mute** | Persistent mute control with `aria-pressed` / `aria-label` |
| **Dignity fails** | Fail overlays name recovery; no mockery (`FAIL_COPY`) |
| **Load failsafes** | Corrupt save → recoverable path (`Game.tsx`) |
| **Returning players** | Harbor briefing when `voyagesCompleted ≥ 1` |
| **Tutorial replay (partial)** | Ashore teach replay via Settings; Harbor FTUE not fully replayable without flag wipe |

---

## Ranked findings

### BLOCKER

| ID | Check | Finding | Evidence | Fix direction |
|----|--------|---------|----------|---------------|
| **A1** | **Input remapping / keyboard** | **Interact remap is a lie in shore/Harbor 3D.** Players who rebind Interact away from `e`/`Enter` **cannot interact** with NPCs, doors, stations — keys stay hard-coded. | `WalkableHarborView.tsx` (`e`/`Enter`); `WalkableIslandExplore.tsx` (same); `PartyArena.tsx` (`KeyE`/`Enter`) | Route all Interact through `matchesBinding(..., 'interact')` (and Move through bindings). **Gameplay blocker for remappers.** |
| **A2** | **Keyboard / playability** | Quiet homecoming can strip Carpet → **no Escape / no Map** path off Harbor (if unfixed on `main`). Keyboard-only players stuck. | `Game.tsx` + `progressGates` quiet homecoming (see design debt / harbor friction) | Restore Carpet; never strip sole travel affordance. |

---

### HIGH

| ID | Check | Finding | Evidence | Fix direction |
|----|--------|---------|----------|---------------|
| **A3** | **Input remapping** | Explore / teach / Structure / Bag **footer strings hard-code** `WASD` / `E` / `Enter` even when bindings differ. Remappers get wrong instructions. | `AshoreTeachOverlay`, `StructureInteriorView`, `BagInteriorView`, fail footers (`Space`/`Enter`) | Generate footers from `formatBinding` / `getHint` only. |
| **A4** | **Screen narration** | **Signature moments are visual-only:** hush → scar → Plinth glow. No reliable `aria-live` / SR summary of “scar locked / Plinth lit / Piggy arrived.” Blind / SR players miss the product’s meaning beat. | Spectacle / hush / Piggy overlays | One polite `aria-live="assertive"` (or staged polite) line per beat; keep visual spectacle. |
| **A5** | **Visual-only cues** | Deal **deadline** pressure is primarily a **shrinking ring / timer UI**; low-time state is easy to miss without vision or if color-washed. | `DealPlayView` / timer UI | Parallel non-color cue: pulse pattern **and** optional short SFX **and** text “Time low”; never timer-color alone. |
| **A6** | **Color dependence** | Money kinds / weather / mastery rely on **hue + glow** more than shape/text in places (amber theme). High-contrast mode helps but isn’t default. | Theme CSS; weather FX; CF chrome | Icon/shape + text label for every money state; high-contrast as enhancement not sole fix. |
| **A7** | **Controller navigation** | Gamepad can advance some FTUE steps; **Harbor walk / Interact / UI menus are not a complete controller scheme.** Partial support ≠ accessible. | `gamepadConnected`; FTUE gamepad path | Document “keyboard primary” **or** ship full stick+face-button map with on-screen prompts from bindings. |
| **A8** | **Audio-only cues** | Critical feedback often has SFX (coin, deal, fail) — **mute is available**, but some beats may lack equivalent **visual** confirmation when muted. | Audio bus + mute | Every audio-critical cue needs a simultaneous visual state change (already true for many; audit deal/scar). |

---

### MEDIUM

| ID | Check | Finding | Evidence | Fix direction |
|----|--------|---------|----------|---------------|
| **A9** | **Focus states** | Interactive DOM controls generally use browser/focus styles; **canvas / R3F** targets have **no focus ring** — keyboard users depend on FTUE arrows / proximity, not focus traversal. | Harbor/shore WebGL | Accept canvas as spatial nav **if** remapping works; add SR “near: {target}” live region when in range. |
| **A10** | **Subtitles** | Little voiced dialogue; ambient/music have no captions. Not a speech-subtitle gap, but **important VO/coach lines** (if any play as audio) need text twins. | Coach is mostly text already | Policy: no audio speech without on-screen text. |
| **A11** | **Motion** | Reduced-motion path exists and is respected in many FX; **spectacle length / camera** may still disorient vestibular-sensitive players even when shortened. | `spectacleReduced`, cinema cameras | Hard cap camera yaw; offer **Skip spectacle** always (not only reduced-motion). |
| **A12** | **Timers** | Deal / event timers exist; pause should freeze them (verify). No global “extend timer” accessibility option. | Deal play | Pause-must-freeze; optional Settings “extra decision time” for learning mode. |
| **A13** | **Objective clarity** | Early FTUE objectives are clear; midgame **“what now?”** scatters across toast / Piggy / map pins. Screen readers may not get a single objective string. | Quest / FTUE / briefing | Persistent **Objective** live region: one sentence, always updated. |
| **A14** | **Tutorial replay** | Ashore teach **can** replay; Harbor FTUE / hush cinema **cannot** cleanly replay without debug/flag edits. Returning accessibility testers blocked. | Settings teach replay vs FTUE flags | “Replay Harbor welcome” that resets only FTUE flags 0–N, not economy. |
| **A15** | **Error states** | Dignity fails are clear; some **tech** errors (audio context, WebGL) may be cryptic or silent. | Boot / WebGL | Plain-language recovery: “3D failed — try refresh / lower graphics” with keyboard-reachable dismiss. |

---

### LOW

| ID | Check | Finding | Evidence | Fix direction |
|----|--------|---------|----------|---------------|
| **A16** | **Text size** | Presets exist; some absolute `px` in canvas HTML overlays may ignore scale. | Mixed UI | Audit overlay CSS for `rem` / `--cap-font-scale`. |
| **A17** | **Contrast** | Default amber-on-dark is stylish; some muted labels may sit near AA edge before high-contrast toggle. | Theme | Fix only after A1–A2; then AA on text/icons in high-contrast **and** default for body text. |
| **A18** | **Returning-player context** | Briefing helps; no “last session” one-liner in SR-first form. | Harbor briefing | Add optional `aria-live` summary on Harbor enter. |
| **A19** | **Screen narration extras** | Not all modals labeled with `role="dialog"` / `aria-modal`. | Settings / panels | Landmark pass after blockers. |

---

## Checklist status (requested axes)

| Axis | Status | Rank of worst gap |
|------|--------|-------------------|
| Text size | **Mostly met** | LOW (A16) |
| Contrast | **Partial** (toggle strong; default uneven) | LOW→MEDIUM (A17) |
| Color dependence | **Gap** | HIGH (A6) |
| Focus states | **DOM OK / canvas gap** | MEDIUM (A9) |
| Keyboard navigation | **Broken if remapped Interact** | **BLOCKER (A1)** |
| Controller navigation | **Incomplete** | HIGH (A7) |
| Input remapping | **UI yes / gameplay no** | **BLOCKER (A1)** + HIGH (A3) |
| Screen narration | **Weak on signature beats** | HIGH (A4) |
| Audio-only cues | **Mostly paired; verify** | HIGH (A8) |
| Visual-only cues | **Timers / scars** | HIGH (A5, A4) |
| Subtitles | **N/A-ish / policy** | MEDIUM (A10) |
| Motion | **Good foundation** | MEDIUM (A11) |
| Timers | **Needs a11y options** | MEDIUM (A12) |
| Objective clarity | **Early good / mid soft** | MEDIUM (A13) |
| Returning-player context | **Present** | LOW (A18) |
| Tutorial replay | **Partial** | MEDIUM (A14) |
| Error states | **Dignity strong / tech soft** | MEDIUM (A15) |

---

## Implementation order (mandatory)

```text
1. BLOCKER A1 — binding-true Interact/Move in Harbor + shore + PartyArena
2. BLOCKER A2 — Carpet / softlock (if still present)
3. HIGH A3  — all footer/hint copy from bindings
4. HIGH A4  — aria-live for hush / scar / Plinth / Piggy beats
5. HIGH A5–A8 — timer multi-cue, color+shape, controller honesty, mute parity
6. MEDIUM → LOW — focus landmarks, skip spectacle, objective live region, contrast, replay Harbor FTUE
```

**Explicit non-goals until A1–A2 ship:**

- New high-contrast themes / amber palette tweaks  
- Font pairing experiments  
- Decorative focus animations  
- Subtitle chrome for music  

---

## Test protocol (accessibility)

1. Remap Interact to `f` → confirm Harbor NPC + door + station still work.  
2. Remap Move to arrows → shore explore still walks.  
3. Keyboard-only cold run: no mouse; complete Ashore teach + one Harbor deal open.  
4. OS reduced motion ON → spectacle skips/shortens; no essential info lost.  
5. Mute ON → Take success still visually obvious.  
6. Screen reader (VoiceOver/NVDA): Settings open/close; fail overlay; scar complete announcement.  
7. High contrast ON → body text and primary CTAs readable.  
8. Text size XL → no clipped primary CTAs on 1280×720.

---

## Related docs

- `docs/design/FAILURE_STATE_AUDIT.md` — dignity / recovery copy  
- `docs/design/UI_LAYER_AUDIT.md` — chrome load  
- `docs/design/DESIGN_DEBT.md` — softlocks  
- Code: `a11yMotion.ts`, `inputBindings.ts`, `SettingsModal.tsx`, `WalkableHarborView.tsx`
