# PLAYTEST_FINDINGS — Cycle 00 — framework baseline (desk synthesis)

**Cycle id:** `cycle-00-baseline`  
**Window:** 2026-08-14 → 2026-08-14  
**Sessions:** 3 (`sess-20260814-01`, `sess-20260814-02`, `sess-20260814-03`)  

## Hypothesis

Quiet Harbor teach, Soft Beat discoverability, and post-Change goal clarity dominate first-loop friction.

## Summary

3 sessions → 3 recurring patterns; 3 one-offs parked; 0 ship candidates. Do not fix every complaint.

> **Law:** OBSERVATION ≠ INTERPRETATION ≠ PROPOSED FIX.  
> Do **not** fix every individual complaint — ship work only against **recurring** patterns.

## Recurring behavioral patterns

### pat_01_cove_take — cove_take · confusion, hesitation

Sessions: 2 · Codes: cove_take · Reactions: confusion, hesitation

#### OBSERVATION

[sess-20260814-01 @ 05:10] attempted: Chose treat path in Keeper talk; believed: Could undo the spend later in a menu; actual: Irreversible Take + hush cinema; no undo
[sess-20260814-02 @ 03:15] attempted: Picked jar/save; believed: Immediate coin reward popup; actual: World hush + organ line; coins not the hero beat

#### INTERPRETATION

Recurs in 2 sessions. Shared belief flavor: “could undo the spend later in a menu”. Reactions: confusion, hesitation.

#### PROPOSED FIX

Propose one craft change that addresses the shared beat — not each quote. Prefer world-teaching over new chrome. Park if only one session after next cycle.

**Disposition:** `investigate`

### pat_02_scar_spectacle — scar_spectacle · delight, smile

Sessions: 2 · Codes: scar_spectacle · Reactions: delight, smile

#### OBSERVATION

[sess-20260814-01 @ 07:00] attempted: Waited for a popup explaining the plaque; believed: Modal card with quest complete; actual: Plinth camera lock + Harbor felt captions
[sess-20260814-03 @ 04:10] attempted: Looked for a share button in settings; believed: Share buried in a menu; actual: Share freeze-frame after Plinth spectacle

#### INTERPRETATION

Recurs in 2 sessions. Shared belief flavor: “modal card with quest complete”. Reactions: delight, smile.

#### PROPOSED FIX

Propose one craft change that addresses the shared beat — not each quote. Prefer world-teaching over new chrome. Park if only one session after next cycle.

**Disposition:** `investigate`

### pat_ignored_intent_soft_beat — soft_beat · ignored_intent

Sessions: 3 · Codes: soft_beat · Reactions: ignored_intent

#### OBSERVATION

sess-20260814-01: attempted “Walked past Coin Jar Soft Beat pad without climbing” → Pad readable but ignored; never opened Lid Lookout
sess-20260814-02: attempted “Ignored loft/lid glow after returning to structures” → Never entered Soft Beat; feared a second irreversible choice
sess-20260814-03: attempted “Opened Teller Soft Beat after reading ‘peek’ language in craft docs mentally — in-world still skipped Lid” → Skipped; went to Travel map instead

#### INTERPRETATION

Players repeatedly bypassed content we thought was the path. Intent may be invisible, optional-looking, or competing with a louder affordance.

#### PROPOSED FIX

Make the intended beat impossible to miss without a coach card — or demote it from “required teach.”

**Disposition:** `investigate`

## Ship candidates (still need craft owner)

_None this cycle._

## Parked one-offs (not every complaint)

These appeared once or lack recurrence. Keep for the next cycle; do not open drive-by PRs.

- `tri-a-softbeat` — Player never climbed a Soft Beat pad after first Change.
- `tri-b-bankfirst` — Player entered Ledger Bank before first Piggy Talk.
- `tri-c-mapwidth` — After first Change, player opened Travel seeking Paycheck immediately.

## Session index

| Session | Player | Device | Source | Moments |
|---------|--------|--------|--------|---------|
| sess-20260814-01 | P-alpha | desktop | desk_synthesis | 5 |
| sess-20260814-02 | P-bravo | phone | desk_synthesis | 5 |
| sess-20260814-03 | P-charlie | desktop · RM | desk_synthesis | 5 |

## Six-question rollup

### sess-20260814-01

1. Misunderstood: At Harbor spawn looked for a checklist instead of Piggy.
2. Unfair: Treat choice felt permanent without warning tone.
3. Repetitive: No.
4. Ignored ability: Could walk everywhere but didn’t know Soft Beat pads mattered.
5. Lost: Briefly on Harbor before noticing Piggy pulse.
6. Fun vs functional: Spectacle felt fun; early Harbor felt empty-functional.

### sess-20260814-02

1. Misunderstood: Thought shops/rituals were the tutorial.
2. Unfair: No.
3. Repetitive: Worried Soft Beat would repeat the Take.
4. Ignored ability: Could open bank early — game didn’t stop me.
5. Lost: On phone UI density after homecoming.
6. Fun vs functional: Spectacle fun; ritual hunt felt busywork-shaped.

### sess-20260814-03

1. Misunderstood: Post-Change goal felt like ‘open the map’ not Soft Beat.
2. Unfair: Map gates felt unclear for a second.
3. Repetitive: No.
4. Ignored ability: Share worked without account — good.
5. Lost: Only when hunting Soft Beat language that wasn’t on plaza.
6. Fun vs functional: Share beat was fun; RM Take felt quieter but still a beat.

## Next cycle

1. Copy `docs/playtest/session-template.md` (or JSON schema) per player.
2. Fill moments with attempted / believed / actual + reaction tags.
3. Run `npm run playtest:findings -- --cycle <id>` after ≥2 sessions.
4. Only schedule craft work from **recurring patterns** with disposition `investigate` → `ship_candidate`.
