# Ashore Teach — iconic design (iter 22)

**Goal:** A pre-carpet **course** that feels like playing Capital — longer, one idea per chamber, each with a dedicated interactive visual.  
**North stars:** Portal (prove in the room) · Mario 1-1 (body does the lesson) · BotW Plateau (vertical slice) · Astro Bot (toy clarity) · Hermans Presentation (show the pieces).

**Deep research (iter 23):** [ashore-tutorial-research.md](./ashore-tutorial-research.md) — diagnosis of the 12-chamber course + recommended shrink to Chamber-00 (≤5 prove-it pages; first Cove→Harbor *is* the tutorial).

## Laws

1. **See your Voyager** — Walk / Talk / Board gates require visible body motion on the practice pad.
2. **One idea per chamber** — never cram Harbor + four paintings + toolkit into one strip under the pad.
3. **Talk = show** — anything named gets a full-chamber showcase of how it looks in-game (`AshoreTeachShowcases.tsx`).
4. **Fantasy before chrome** — “Money is alive” + your Voyager before place lessons.
5. **Each painting earns a page** — Cove · Paycheck · Credit each have a large portal + practice Take fork (does not stick).
6. **Take site ≠ Soft Beat peek** — forks name Kira / Vee / Rex plaque vocabulary; Enter chamber teaches arcade vs Soft Beat.
7. **No map widen** — still Harbor · Cove → Paycheck → Credit only.
8. **Soundtrack stays** — organ stingers; opening bed.

## Chamber sequence (12)

| # | Chamber | Prove / interact |
|---|---------|------------------|
| 1 | Fantasy | Continue — Voyager + mural thesis only |
| 2 | Walk | Reach three glowing markers (WASD / stick) |
| 3 | Talk | Pink ring → E (or Talk button) |
| 4 | Harbor Haven | Light Piggy · Plinth · Carpet Dock |
| 5 | Money Carpet | Tap-board the lit Cove painting |
| 6 | Coincraft Cove | Practice Take fork (jar / treat) |
| 7 | Paycheck Peninsula | Practice Take fork (umbrella / glitter) |
| 8 | Credit Kingdom | Practice Take fork (wait / haste) |
| 9 | Harbor remembers | Tap Plinth — scar glow with plaque preview |
| 10 | Enter machines | Light Arcade pads + Soft Beat peeks |
| 11 | Share | Freeze “Harbor felt that” card |
| 12 | Board | Launch carpet with Voyager — Cove first |

## Out of scope (Harbor still owns)

Outfitter deep customization, Daily Ritual, stall shopping — discovery after Ashore.

## Code

- `AshoreComprehensionTutorial.tsx` — 12-chamber director
- `AshoreTeachShowcases.tsx` — Harbor / Carpet / painting lessons / return / enter / share visuals
- `VoyagerWalkPracticeStage.tsx` — 3D pad (markers, Piggy ring, VoyagerMesh)
- Boot: `App.tsx` passes `bootCharacter` into teach
