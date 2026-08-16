# Capital playtesting framework

Structured human (and desk) playtests for the Harbor · Cove → Paycheck → Credit signature loop.

**Laws**

1. Capture **attempted · believed · actual** on every important moment.  
2. Keep **OBSERVATION / INTERPRETATION / PROPOSED FIX** in separate boxes.  
3. **Do not fix every complaint** — synthesize **recurring** patterns across sessions.  
4. After each cycle, publish **`PLAYTEST_FINDINGS.md`** for that cycle (and refresh the latest copy).

Machine cold checklist stays in [`docs/iconic-path.md`](../iconic-path.md) + `src/qa/iconicCraftCadence.ts`. This framework is the **human observation** layer.

---

## Folder map

| Path | Role |
|------|------|
| [`protocol.md`](./protocol.md) | How to run a cycle |
| [`session-template.md`](./session-template.md) | Facilitator form |
| [`moment-codes.md`](./moment-codes.md) | Stable beat tags |
| `sessions/*.json` | Machine-readable captures |
| `cycles/<id>/PLAYTEST_FINDINGS.md` | Per-cycle report |
| [`PLAYTEST_FINDINGS.md`](./PLAYTEST_FINDINGS.md) | **Latest** cycle findings |
| `src/playtest/` | Types + pattern synthesis + markdown render |

---

## Quick start

```bash
# 1. Copy session template → fill during/after play
cp docs/playtest/session-template.md docs/playtest/sessions/notes-PLAYER.md

# 2. Or author JSON (preferred for synthesis)
#    docs/playtest/sessions/<session-id>.json

# 3. Compile findings for a cycle
npm run playtest:findings -- --cycle cycle-00-baseline
```

---

## Capture fields (required per moment)

| Field | Question |
|-------|----------|
| Attempted | What did they try? |
| Believed | What did they think would happen? |
| Actual | What did the game do? |
| Reactions | hesitation · failure · smile · confusion · ignored_intent · unexpected_strategy · … |

Plus session-level: where they hesitated / failed / smiled / got confused / ignored intended content / invented strategies (rolled into moment `reactions` + notes).

---

## Triage

| Layer | Allowed content |
|-------|-----------------|
| **OBSERVATION** | Behavior + quotes + timestamps only |
| **INTERPRETATION** | Why it might have happened (one thesis) |
| **PROPOSED FIX** | One craft change — world-first, not chrome pile-on |

One-offs → **park**. Recurring (≥2 sessions default) → **investigate**. Only then → **ship_candidate**.
