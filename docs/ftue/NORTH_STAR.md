# Capital FTUE north star

**King KPI:** Independent Transfer Rate  
After Capital teaches a financial principle once, what percentage of players can correctly reason with that principle in a substantially different situation **without being told what to do**?

Tutorial completion is diagnostic only. Players should not remember the instructions — they should remember **how the world works**.

---

## Target architecture (player experience)

```
Launch Capital
→ understandable situation
→ consequential choice
→ immediate response
→ simulated consequence
→ causal understanding
→ second analogous problem
→ independent transfer
→ freedom
→ new interacting concept
→ curiosity hook
→ normal play
```

Mapped onto live Capital (Cove → Paycheck → Credit + Harbor) — **player-felt, not docs-only**:

| Beat | Capital |
|------|---------|
| Launch → situation | Title → Cast → Ashore prove → Carpet → Harbor meet → Cove shore |
| Consequential choice | Cove Take (jar vs treat) on real ledger/scar systems |
| Immediate response + simulated consequence | Take hush → Carpet home → Harbor scar spectacle / Plinth |
| Causal understanding | Piggy names what Harbor kept (their plaque — not a quiz) |
| Second analogous problem | Paycheck fountain stall — two prices, **no Cove mapping**, **no “this is the Take”** |
| Independent transfer | Land on Paycheck after Cove Take stamps `transfer_started`; Vee commit → INDEPENDENT. King KPI uses those events. |
| Freedom | Map unlocks as curiosity (“a painting woke”), not homework. Coin Bag does not point the answer. |
| New interacting concept | Clock buckets / Credit spiral — new organ, still no “this is like the jar/umbrella” |
| Curiosity hook | Soft Beat, digressions, day-2 echo — never forced FTUE |
| Normal play | Scaffolding indistinguishable from Capital verbs |

---

## Implementation stack (code)

| Layer | Location |
|-------|----------|
| Transfer tasks | `src/islands/conceptProgression/` · `docs/ftue/TRANSFER_TASKS.md` |
| Autonomy stages | `docs/ftue/AUTONOMY_PROGRESSION.md` |
| Player modes | `src/islands/playerOnboarding/` |
| Telemetry + king KPI | `src/islands/analytics/ftue/` · Settings → Analytics |
| Experiments | `src/islands/ftueExperiments/` |
| Usability | `docs/ftue/FTUE_USABILITY_PROTOCOL.md` |
| Scaffold thinning | `docs/ftue/FTUE_SCAFFOLD_REMOVAL_AUDIT.md` |

---

## Ship question

Does this change raise **Independent Transfer Rate** (or protect it) without harming failure recovery, accessibility, or freeplay conversion?

If it only raises tutorial completion — **do not ship as a win**.
