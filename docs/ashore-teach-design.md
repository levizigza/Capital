# Ashore Teach — FTUE-7 interactive (iter 24)

**Goal:** Environmental prove-it first session — then the **real Cove→Harbor loop** is the stakes tutorial.  
**Design:** [ftue-interactive-teach.md](./ftue-interactive-teach.md) · [ashore-tutorial-research.md](./ashore-tutorial-research.md)

## Laws

1. **7 beats, one idea each** — Goal · Walk · Economy · Decision · Consequence · Reward · Deeper.  
2. **Body proves** — advance requires doing the verb.  
3. **≤1 short supporting line** per beat — no glossary dumps.  
4. **Teach when needed** — Talk Battle / Soft Beat structure / Share / Paycheck / Credit stay in the real world.  
5. **Veterans skip** — Leave · Esc, `?skipTeach=1`, or prior complete/dismiss (`ftueTelemetry`).  
6. **Instrument every step** — `ftue_*` + `core_loop_first_success`.

## Beat sequence

| # | Id | Teaches | Prove |
|---|----|---------|-------|
| 1 | goal | Fundamental goal | Touch empty Memory Plinth |
| 2 | walk | Primary interaction | Walk rings |
| 3 | economy | Core resource | Poke Coin holds |
| 4 | decision | Meaningful decision | Jar vs treat fork |
| 5 | consequence | Consequence | Witness hush + plaque |
| 6 | reward | Reward | Tap lit Plinth — Harbor felt that |
| 7 | deeper | Deeper strategy hint | Soft Beat peek + dim Clock → board Cove |

## Code

- `AshoreComprehensionTutorial.tsx` — `data-teach-mode="ftue-7"`
- `AshoreTeachShowcases.tsx` — goal / decision / consequence / reward / deeper
- `ftueTelemetry.ts` — tracker + `analyzeFtueFunnel`
- Boot: `App.tsx` uses `shouldSkipAshoreTeach()` after cast
