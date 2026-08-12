# Ashore Teach — iconic design (iter 21)

**Goal:** A pre-carpet chamber that feels like *playing Capital*, not reading a FAQ.  
**North stars:** Portal (prove in the room) · Mario 1-1 (body does the lesson) · BotW Plateau (vertical slice of the loop) · Astro Bot (toy clarity).

## Laws

1. **See your Voyager** — every control gate requires visible body motion on a practice pad.
2. **One verb per chamber** — walk markers → approach Talk → understand the loop → meet the paintings.
3. **Fantasy before chrome** — “Money is alive” and the signature loop before button legends.
4. **Show where games live** — Chamber 5 is a painting gallery (Harbor · Cove · Paycheck · Credit) with play-here lines, not abstract organ jargon alone.
5. **Talk = show** — anything named (painting, Plinth, Carpet, Take fork, Share card, Money Structure) gets a visual showcase of how it looks in-game (`AshoreTeachShowcases.tsx`).
6. **Take site ≠ Soft Beat peek** — play-here names the real fork (Kira / Vee / Rex), not Lid / Loft / Battlement. Hermans: [puzzle-explorable-craft.md](./puzzle-explorable-craft.md).
7. **No map widen** — pad is a local Canvas; Harbor / Cove / Paycheck / Credit stay the only travel spine.
8. **Soundtrack stays** — organ stingers on gallery; beds unchanged.

## Chamber sequence

| # | Chamber | Prove |
|---|---------|-------|
| 1 | Fantasy | Continue after seeing Voyager on the living-money pad |
| 2 | Walk | Reach three glowing markers (right · left · forward) with WASD — body must move |
| 3 | Talk | Walk into Piggy’s ring, press E when the prompt appears |
| 4 | Loop | Step through Harbor → Carpet → Cove Take → Harbor remembers — each beat shows Plinth / gate / jar fork / scar glow |
| 5 | Paintings | Tap a framed painting portal (jar · tower · keep · plinth) — prove one with place + play-here |
| 6 | Toolkit | Light one new verb; showcase shows Enter structures / Take fork / Return carpet→Plinth / Share card |
| 7 | Carpet | Board with your Voyager — Carpet Dock composition with Cove painting lit |

## Out of scope (Harbor still owns)

Outfitter deep customization, Daily Ritual, stall shopping — discovery after Ashore.

## Code

- `AshoreComprehensionTutorial.tsx` — chamber director + HUD + spine painting gallery
- `AshoreTeachShowcases.tsx` — painting portals, loop/toolkit/ready visuals (gate · play_pad · Plinth language)
- `VoyagerWalkPracticeStage.tsx` — 3D pad (markers, Piggy ring, VoyagerMesh)
- Boot: `App.tsx` passes `bootCharacter` into teach
