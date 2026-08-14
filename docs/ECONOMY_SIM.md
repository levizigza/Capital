# Capital economy simulation (headless)

Monte Carlo framework for Harbor systemic / economic mechanics.  
**Measures imbalance and explains WHY** — it does **not** auto-rebalance live game constants.

Freeze: Harbor · Cove → Paycheck → Credit. Sims exercise the **Harbor cashflow grind** (ledger + board pattern + shop sinks).

---

## What it simulates

Each game is a headless Harbor board loop using real APIs:

- `voyagerLedger` — Pay Day, deals, bills, liabilities, Freedom streak (CF ≥ $30 for 3 Pay Days)
- `partyBoard` / `boardEconomy` — cashflow space pattern, pass-start payday, seals, collector
- `economy` — boom / normal / recession income multipliers (optional sticky bias)
- Harbor shop sinks — carpet polish, capsules, plaza pass (agent-chosen)

Coins live in a sim pouch (mirrors `UserProfile.totalCoins`); ledger lives beside it.

**Win:** `ledger.harborEscaped` within `maxTurns`.

---

## Agents (strategies)

| Id | Behavior sketch |
|----|-----------------|
| `conservative` | Cheap/high-ROI deals only; large pouch buffer; rare seals |
| `aggressive` | Take any affordable asset; buy seals/shops freely |
| `random` | ~50% decisions |
| `optimizer` | Prefer deals that cross CF 30; shop after Freedom path |
| `collector` | Prioritize Ledger Seals; light deals |
| `long_term_investor` | Asset ROI / Freedom path; shop after escape |
| `short_term_trader` | Cheap deals; magnet capsule; shy seals |
| `resource_hoarder` | Avoid spends until pouch is fat or time runs short |
| `balanced` | Mid ROI deals; occasional seals/shops |

---

## How to run

```bash
# Vitest (fast smoke + medium batch)
npm test -- src/islands/sim

# Thousands of games (default ~3.1k = 50 × 9 strategies × 7 conditions)
npm run sim:economy

# Larger sweep
npm run sim:economy -- --games 200
```

Reports print markdown to stdout and write:

- `artifacts/economy-sim/report.md`
- `artifacts/economy-sim/report.json`

---

## Metrics (investigation only)

| Metric | Meaning |
|--------|---------|
| Win rates | Freedom share by strategy × condition |
| Wealth distribution | Final coins, CF, assets, liabilities, seals |
| Strategy dominance | Leads win rate by ≥12pp in ≥50% of conditions (configurable) |
| Resource inflation | End pouch >> start stake |
| Resource scarcity | Share of turns with pouch &lt; 10 |
| Time to milestones | Freedom / first asset / CF30 / seal / shop |
| Runaway leaders | Freedom in first ~25% of turn budget |
| Deadlocks | Broke + negative CF + no deals |
| Economic collapse | Deep negative CF / repeated bankruptcy |
| Feedback loops | Deal adoption ↔ Freedom win correlation |

**Never treat a high win rate as proof the strategy is “fun” or “correct for kids.”**  
Dominance is a **flag** for designers to playtest and reason about rules — not a patch trigger.

---

## Condition grid (default)

- Starting coins: 20 / 40 / 80  
- Turn budgets: 30 / 45 / 60  
- Macro: natural Markov, sticky boom, sticky recession  

---

## Code map

| Path | Role |
|------|------|
| `src/islands/sim/game.ts` | Single seeded game |
| `src/islands/sim/agents.ts` | Strategy policies |
| `src/islands/sim/batch.ts` | Monte Carlo grid |
| `src/islands/sim/metrics.ts` | Aggregates + WHY findings |
| `src/islands/sim/types.ts` | Stable report shapes |
| `scripts/run-economy-sim.mjs` | CLI |

---

## Anti-patterns

- Auto-tuning deal prices / escape thresholds from sim output  
- Treating dominance as a mandate to nerf without a human design thesis  
- Logging player PII (sims are synthetic; keep them that way)
