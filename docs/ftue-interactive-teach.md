# FTUE — Interactive environmental teach (first session)

**Canon:** [ashore-teach-design.md](./ashore-teach-design.md) · [ashore-tutorial-research.md](./ashore-tutorial-research.md) · [iconic-path.md](./iconic-path.md)  
**Code:** `AshoreComprehensionTutorial.tsx` · `ftueTelemetry.ts` · `AshoreTeachShowcases.tsx`  
**Mode:** `data-teach-mode="ftue-7"`

---

## Laws

1. **Seven beats, one idea each** — goal → walk → economy → decision → consequence → reward → deeper hint.  
2. **Body proves** — advance requires doing the verb, not reading a dump.  
3. **≤1 short line of copy** per beat (headline + one sentence max).  
4. **Teach when needed** — Paycheck / Credit / quizzes / Freedom Seal stay out.  
5. **Veterans skip** — Leave · Esc, `?skipTeach=1`, or prior complete/dismiss.  
6. **Instrument every step** — start / complete / time / retries / abandon / first core-loop success.

---

## Beats

| # | Id | Teaches | Prove (do, don’t read) |
|---|----|---------|-------------------------|
| 1 | `goal` | Fundamental goal | Touch the empty Memory Plinth — “Leave a mark Harbor keeps” |
| 2 | `walk` | Primary interaction | Reach glowing walk rings (WASD / pad) |
| 3 | `economy` | Core resource | Poke **Coin holds** — living money answers |
| 4 | `decision` | Meaningful decision | Commit jar vs treat (both valid; irreversible practice) |
| 5 | `consequence` | Consequence | Witness hush — plaque writes; world goes quiet |
| 6 | `reward` | Reward | Tap the lit Plinth — “Harbor felt that” |
| 7 | `deeper` | Deeper strategy hint | Soft Beat look + dim Clock painting, then board lit Cove |

Real Cove→Harbor Take remains the stakes version of 4–6. Ashore is the safe checklist room.

---

## Instrumentation (`ftueTelemetry.ts`)

| Metric | Event / payload |
|--------|-----------------|
| Start rate | `ftue_started` / sessions with it |
| Completion rate | `ftue_completed` vs `ftue_started` |
| Time per step | `ftue_step_completed.durationMs` |
| Retries | `ftue_step_retry` count per `stepId` |
| Abandonment point | `ftue_abandoned.stepId` (+ Leave · Esc) |
| First core-loop success | `core_loop_first_success` after first Harbor spectacle |

Also: `ftue_step_started`, `ftue_skipped` (`veteran` \| `query` \| `leave`).

Analyze with `analyzeFtueFunnel(events)` for step reach / drop-off / avg duration / retries.

---

## Out of scope until needed

Talk Battle chrome · Soft Beat full structure · Share modal · Paycheck/Credit Takes · Freedom Seal · mastery quizzes · stall dashboard.
