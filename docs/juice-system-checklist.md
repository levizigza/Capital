# Juice System Checklist

**Goal:** Players feel responsive feedback within **5 seconds** of first interaction (hover, click, quest, or fail).

**Toggle:** `JuiceLevel` = `off` | `low` | `high` (Settings → Game Feel)

---

## Checklist

| # | Juice element | off | low | high | Implemented |
|---|---------------|-----|-----|------|-------------|
| 1 | **Hover state** (scale / glow on buttons) | — | subtle | full | `GameButton` + `.juice-high` CSS |
| 2 | **Press state** (tap squash) | — | subtle | full | `GameButton` whileTap |
| 3 | **Accept SFX** (UI confirm) | — | ✓ | ✓ | `juiceSfx.playAccept()` |
| 4 | **Complete SFX** (quest / win) | — | — | ✓ | `juiceSfx.playComplete()` |
| 5 | **Fail SFX** (error stinger) | — | — | ✓ | `juiceSfx.playFail()` |
| 6 | **Screen shake** (failures) | — | — | subtle | `.juice-shake` on viewport |
| 7 | **Reward burst** (coins, quest done) | — | small | full | `BurstParticles` |
| 8 | **UI bounce** (haptic-like) | — | ✓ | ✓ | `.juice-ui-bounce` |
| 9 | **Camera nudge** (complete/reward) | — | — | ✓ | `.juice-nudge` on viewport |
| 10 | **Respect reduced motion** | caps at low | caps at low | full | `JuiceProvider` + a11y read |

---

## When to trigger

| Event | API | SFX | Motion |
|-------|-----|-----|--------|
| Button / choice click | `trigger('accept')` | accept | UI bounce |
| Quest completed | `trigger('complete', { burst: true })` | complete | nudge + burst |
| Minigame / quest fail | `trigger('fail')` | fail | shake |
| Item / coin reward | `trigger('reward')` | coin | burst + bounce |

---

## 5-second playtest script

1. Open Islands hub → hover **Open Travel Map** (hover lift).
2. Click it → hear accept chirp + button bounce (< 2s).
3. Settings → change **Game Feel** to High.
4. Enter island → talk to NPC → accept on choice.
5. Fail a minigame (or dev cheat) → hear fail + brief screen shake.

---

## Files

- `src/juice/` — provider, SFX, CSS, bursts
- `src/islands/SettingsPanel.tsx` — JuiceLevel control
- `src/game-ui/components/GameButton.tsx` — wired accept + scaled motion

*See also [islands-ui-style-guide.md](./islands-ui-style-guide.md) pillar “Delightful juice”.*
