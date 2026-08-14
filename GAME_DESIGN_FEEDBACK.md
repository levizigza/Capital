# Game feel — frequent interaction feedback

Audit of frequent Capital actions. Chain: **INPUT → RESPONSE TIME → ANIMATION → AUDIO → VISUAL → STATE → REWARD**.

Principle: clarify response first; never substitute excess shake / particles / SFX for mechanics. One audio bed per frequent action (juice **or** Capital identity SFX — not both), except signature cinema.

Architecture: `src/islands/actionFeedback.ts` → `playActionFeedback(id)` layers restrained juice + optional Capital SFX + optional HUD flash. Builds on `src/juice/triggerJuice.ts` layer flags.

---

## Top 10 frequent actions

| # | Action | Was | Fix |
|---|--------|-----|-----|
| 1 | Hotspot activate | Silent route | `hotspot_activate` — confirm juice + bounce |
| 2 | Talk open | 220ms arm, no audio | `talk_open` — confirm on open |
| 3 | Talk choice | Button motion only | `talk_choice` — accept juice |
| 4 | Collect item | Mesh gone, no sensory | `collect_item` — reward (no shake) + toast |
| 5 | Dice roll | CSS emoji only | `dice_roll` — confirm + short tick |
| 6 | Deal accept | Message only | `deal_accept` — economy reward (light burst high only) |
| 7 | Deal pass | Message only | `deal_pass` — soft confirm |
| 8 | Pay Day claim | Toast only | `payday_claim` — economy reward |
| 9 | Shop purchase | Toast only | `shop_purchase` — economy reward |
| 10 | Carpet land | Free-flight silent; rail used `scar_chime` | `carpet_land` on all lands; rail start = accept only (not Take leitmotif) |

Also: **near enter** = throttled `micro` (optional, no spam).

---

## Grades (before → after intent)

| Action | Before | Issues |
|--------|--------|--------|
| Hotspot | weak / inconsistent | ambiguous success |
| Talk | underanimated | unresponsive open/choice |
| Collect | unresponsive | no reward feedback |
| Dice / deal / Pay Day / shop | weak | economy without feel |
| Carpet free land | inconsistent | underanimated |
| Soft Beat / Take / Share | OK | leave alone (already layered) |
| Structure enter | OK | leave alone |

---

## Layer map (importance)

| Importance | Juice | Burst | Shake | Capital SFX | Use |
|------------|-------|-------|-------|-------------|-----|
| micro | accept visuals only | no | no | none / rare tick | near enter (throttled) |
| confirm | accept | no | no | none | hotspot, talk, pass, roll |
| economy | reward | high only | no | none | collect, deal buy, Pay Day, shop |
| progress | complete | high only | no | harbor_cheer if land | carpet land |
| signature | existing stacks | yes | rare | organ / take / felt | Take · Plinth · Soft Beat — unchanged |

---

## Anti-patterns

- Do not fire `scar_chime` on carpet rail / generic UI (leitmotif dilution)
- Do not double juice SFX + Capital SFX on the same confirm
- Do not shake on economy success
- Do not particle-spam Soft Beat / Talk
- Do not force juice on hover (GameButton motion is enough)

## Test

`src/islands/actionFeedback.test.ts` — catalog covers top 10; layer flags mute SFX when Capital plays; throttle micro.
