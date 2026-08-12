# Ashore Teach — iconic design (iter 21)

**Goal:** A pre-carpet chamber that feels like *playing Capital*, not reading a FAQ.  
**North stars:** Portal (prove in the room) · Mario 1-1 (body does the lesson) · BotW Plateau (vertical slice of the loop) · Astro Bot (toy clarity).

## Laws

1. **See your Voyager** — every control gate requires visible body motion on a practice pad.
2. **One verb per chamber** — walk markers → approach Talk → understand the loop → meet the paintings.
3. **Fantasy before chrome** — “Money is alive” and the signature loop before button legends.
4. **Show where games live** — Chamber 5 is a painting gallery (Harbor · Cove · Paycheck · Credit) with play-here lines, not abstract organ jargon alone.
5. **Take site ≠ Soft Beat peek** — play-here names the real fork (Kira / Vee / Rex), not Lid / Loft / Battlement. Hermans: [puzzle-explorable-craft.md](./puzzle-explorable-craft.md).
6. **No map widen** — pad is a local Canvas; Harbor / Cove / Paycheck / Credit stay the only travel spine.
7. **Soundtrack stays** — organ stingers on gallery; beds unchanged.

## Chamber sequence

| # | Chamber | Prove |
|---|---------|-------|
| 1 | Fantasy | Continue after seeing Voyager on the living-money pad |
| 2 | Walk | Reach three glowing markers (right · left · forward) with WASD — body must move |
| 3 | Talk | Walk into Piggy’s ring, press E when the prompt appears |
| 4 | Loop | Step through Harbor → Carpet → Cove Take → Harbor remembers |
| 5 | Paintings | Prove one spine painting card (place + play-here + organ kid line) |
| 6 | Toolkit | Light one new verb (Enter · Take · Return · Share — Walk/Talk already proved) |
| 7 | Carpet | Board with your Voyager — Harbor first, then Cove painting |

## Out of scope (Harbor still owns)

Outfitter deep customization, Daily Ritual, stall shopping — discovery after Ashore.

## Code

- `AshoreComprehensionTutorial.tsx` — chamber director + HUD + spine painting gallery
- `VoyagerWalkPracticeStage.tsx` — 3D pad (markers, Piggy ring, VoyagerMesh)
- Boot: `App.tsx` passes `bootCharacter` into teach
