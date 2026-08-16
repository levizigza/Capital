# Playtest protocol

## Cadence

1. Pick a **hypothesis** (one sentence) for the cycle.  
2. Run **≥2** sessions (target 3–5) on the same build.  
3. Phone + desktop; at least one **reduced-motion** pass.  
4. Prefer **fresh profile**; QA seeds only when testing mid-loop beats (`VITE_QA=1`).  
5. After sessions are filed as JSON, run `npm run playtest:findings`.  
6. Update [`iconic-craft-plan.md`](../iconic-craft-plan.md) only from **ship_candidate** patterns — not from single quotes.

Pair with machine gates: `npm run test:iconic` → (Harbor/Cove/carpet) `npm run test:iconic:e2e` → cold human run ([iconic-path.md](../iconic-path.md)).

---

## Session flow (facilitator)

1. State the goal prompt once (“Get to Harbor and see if it remembers your choice”).  
2. Do **not** coach Outfitter / Capsule / Ritual / Soft Beat unless the hypothesis is about those discoveries.  
3. Think-aloud encouraged; silence is data too — note hesitations.  
4. Log moments live or from recording within 24h while memory is sharp.  
5. Fill six iconic questions at the end (player words first).

---

## What to capture

For each meaningful beat:

- **Attempted** — verb + target (“walked to glowing jar”, “tapped Talk”)  
- **Believed** — prediction (“this opens a shop”, “I’ll undo the choice”)  
- **Actual** — build truth (“Take hush cinema”, “bank interior”)  
- **Reactions** — tag: `hesitation` `failure` `smile` `confusion` `ignored_intent` `unexpected_strategy` `delight` `frustration` `boredom`

Also note (can be moments or session `rawNotes`):

- Where they **hesitated**  
- Where they **failed**  
- Where they **smiled / reacted**  
- Where they became **confused**  
- Where they **ignored** intended content  
- Where they invented **unexpected strategies**

---

## Separation discipline

| Write first | Then | Only then |
|-------------|------|-----------|
| OBSERVATION | INTERPRETATION | PROPOSED FIX |

If you catch yourself writing “because the UI is bad” in observation — move it to interpretation.

---

## Recurrence rule

- **1 session:** park the triage card.  
- **≥2 sessions, same beat + similar belief/reaction:** pattern → investigate.  
- **Ship** only when a craft owner accepts a ship_candidate after reading the pattern’s WHY.

Never open a PR from a single complaint unless it is a **blocker** (soft-lock, crash, corrupt save) — blockers are always ship_candidate.

---

## Cycle close checklist

- [ ] All sessions JSON validated (`npm test -- src/playtest`)  
- [ ] `cycles/<id>/PLAYTEST_FINDINGS.md` written  
- [ ] Latest [`PLAYTEST_FINDINGS.md`](./PLAYTEST_FINDINGS.md) refreshed  
- [ ] One-offs explicitly parked in the findings doc  
- [ ] Hypothesis revisited: confirmed / revised / killed  
