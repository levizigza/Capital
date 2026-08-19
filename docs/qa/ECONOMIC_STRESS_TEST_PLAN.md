# Capital — Economic Stress Test Plan

**Status:** QA architecture for **automated deterministic scenario testing**  
**Law:** Given identical `initial_state`, `seed`, and `player_actions`, the simulation must reproduce the same **core result**.  
**Scope:** Iconic product path — Harbor · Cove → Paycheck → Credit · `voyagerLedger` · board · weather · quests · scars · save/load.  
**Honesty:** Several stress labels (housing stock, insurance product, city-wide unemployment) are **not live sim channels** today — scenarios use **authored shock fixtures** until schema ships ([ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md)).  
**Companions:** [CONSTRAINT_PLAY_TRUTH.md](../design/CONSTRAINT_PLAY_TRUTH.md) · [ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md) · [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) · [CONSEQUENCE_ENGINE.md](../simulation/CONSEQUENCE_ENGINE.md) · [DESIGN_DEBT.md](../design/DESIGN_DEBT.md) · [LEARNING_TRANSFER_FRAMEWORK.md](../research/LEARNING_TRANSFER_FRAMEWORK.md)

---

## 1. Purpose

Capital teaches money through **constrained decisions** whose outcomes must be **auditable and replayable**. This plan defines:

1. **Stress scenarios** — shocks and combinations that stress the ledger, weather, quests, and memory layers  
2. **Deterministic replay** — same inputs → same core outputs  
3. **Failure detectors** — exploits, dominant strategies, impossible recovery, contradictions, divergence, runaway loops  
4. **Automation shape** — scenario runner, fixtures, and assertions (implementation phased; spec first)

**Not a goal:** Auto-tune live constants from sim output ([CAPITAL_DESIGN_BIBLE.md](../CAPITAL_DESIGN_BIBLE.md) — sims measure imbalance; humans rebalance).

---

## 2. Deterministic replay contract

### Inputs (frozen)

```text
ScenarioRun {
  scenario_id: string
  initial_state: IslandSaveV1          // full save snapshot or fixture builder id
  seed: number                         // single RNG stream for all stochastic steps
  player_actions: PlayerAction[]     // ordered, no wall-clock
  options?: {
    freeze_time: boolean              // default true — no Date.now() in core path
    include_board: boolean
    include_macro_economy: boolean    // economy.ts phase transitions
  }
}
```

### Output — core result (compared)

**Core result** is the **gameplay-authoritative slice** — not UI chrome, not ephemeral event ids, not `recentEvents` timestamps.

```text
CoreResult {
  voyagerLedger: {
    salaryIncome, livingExpenses,
    holdings[] { id, kind, monthlyAmount },
    positivePaydayStreak, harborEscaped,
    masteryClears[]
  }
  pouch_coins: number                  // inventory coin total if tracked separately
  economyState?: { phase, totalTurns } // if macro included
  irreversibleChoices: Record<key, { choiceId }>
  harborScars[]: { id, kind, stance? }
  questStatus: Record<questId, status>
  conceptProgress?: keyed phases + transfer flags
  npcMemory?: allowed memory keys only
  partyBoard?: { position, turnsPlayed, ... }  // if board in scenario
  core_hash: string                    // stable hash of normalized CoreResult
}
```

### Replay law

```text
run(initial_state, seed, actions) → CoreResult A
run(initial_state, seed, actions) → CoreResult B

ASSERT core_hash(A) === core_hash(B)
```

### Save/load invariance (same run)

```text
mid = apply_actions(initial_state, seed, actions[0..k])
loaded = sanitizeIslandSave(JSON.parse(JSON.stringify(mid)))
tail = apply_actions(loaded, seed, actions[k+1..])
full = apply_actions(initial_state, seed, actions)

ASSERT core_hash(tail) === core_hash(full)
```

Uses `sanitizeIslandSave` / `migrateIslandSave` ([save.ts](../../src/islands/save.ts)) — the product path, not raw JSON equality.

---

## 3. Runner architecture (target)

```
fixtures/                    # JSON or TS builders per scenario_id
  stress/
    job_loss_payday.json
    recession_transfer_window.json
    ...
src/qa/econStress/
  runner.ts                  # apply PlayerAction[] to pure sim adapters
  rng.ts                     # seeded PRNG (mulberry32 or injectable)
  fingerprint.ts             # CoreResult normalizer + hash
  detectors/                 # one module per failure class
  combinations.ts            # Cartesian / pairwise schedule
  econStress.test.ts         # CI entry
```

**Action adapter** calls **pure** functions where they exist:

| Action kind | Target |
|-------------|--------|
| `take` | `applySpineTakeLedgerFootprint`, dialogue effects |
| `payday` | `applyPayday(ledger, incomeMultiplier, opts)` |
| `bill` | `applyBill` |
| `deal_accept` / `deal_wait` | `addHolding`, board deal resolution |
| `board_roll` | `rollDice` via **seeded** RNG only |
| `macro_advance` | `advanceEconomy` with **seeded** transition roll |
| `quest_complete` | quest graph predicates (authored) |
| `save_load` | serialize → sanitize → deserialize |

UI-only paths are **out of scope** for v1 — actions hit sim writers directly.

---

## 4. Stress scenario catalog

Each scenario defines: **fixture**, **action script**, **expected invariants**, optional **detector triggers**.

Legend: **Live** = binds to shipped sim · **Fixture** = injected shock on ledger/flags · **Future** = illegal until channel exists (test documents contract only)

### 4.1 Single shocks

| Stress | Capital binding | Mode | Fixture sketch |
|--------|-----------------|------|----------------|
| **Job loss** | `salaryIncome → 0` or `raiseSalary(-N)` | Fixture | Paycheck organ; Pat/Priya side quest later |
| **Recession** | `economyState.phase = recession` + CF `storm`/`tight` | Live + Fixture | Macro affects minigame weights; Harbor weather from **CF only** |
| **Interest-rate increase** | Credit haste holding, liability `monthlyAmount` ↑ | Live | `spineTakeFootprints` spiral scar |
| **Inflation** | `livingExpenses` ↑ + `harborPriceMultiplier` boom markup | Live | Dual channel — assert no Harbor/macro contradiction |
| **Housing decline** | *No housing stock* | Future | Shock: `livingExpenses` + treat tab — **not** for-rent décor |
| **Housing boom** | Asset holding + CF boom mood | Partial | Deal asset Accept — no city mesh |
| **Business failure** | Liability default, stall quest fail, `applyBill` | Live | Board liability space |
| **Business boom** | Asset deal + positive CF streak | Live | `regenerateAssetDealOffer` |
| **Portfolio crash** | Remove / write down assets; CF collapse | Fixture | Holdings array mutation |
| **High leverage** | Multiple liabilities, low/negative CF | Live | Board Borrow + deals |
| **Low liquidity** | Low pouch, upcoming bill, positive `/mo` drain | Live | Session liquidity transfer scenarios |
| **Medical / emergency expense** | `applyBill(large)`; recession `emergency` tag weight | Fixture | One-time shock |
| **Insurance** | *No insurance product* | Future | Fixture: bill offset holding id when authored |
| **Career change** | `raiseSalary(±)`, quest gate flip | Partial | Paycheck tower content |
| **Relationship obligation** | Digression scar, `npcMemory`, homecoming quiet | Partial | No invented NPC debts |

### 4.2 Combination matrix (minimum)

Run **pairwise** across spine-critical shocks; expand to **triple** for Pay Day + weather + quest gates.

| Combo id | Components | Why |
|----------|------------|-----|
| `C01` | job loss + recession | Income ↓ while macro bills tag ↑ |
| `C02` | low liquidity + emergency expense | Softlock risk |
| `C03` | high leverage + interest-rate ↑ | Spiral / haste scar path |
| `C04` | business boom + inflation | Markup vs raised expenses |
| `C05` | portfolio crash + recession @ transfer window | IFTR stress ([LEARNING_TRANSFER_FRAMEWORK.md](../research/LEARNING_TRANSFER_FRAMEWORK.md)) |
| `C06` | business failure + relationship obligation | Scar + NPC tone without fake memory |
| `C07` | career change (+salary) + housing boom asset | CF recovery path |
| `C08` | recession + Pay Day streak reset | Freedom escape edge |
| `C09` | deal Accept + low liquidity + board bill | Board grind |
| `C10` | Credit haste + storm weather + negative CF | `harborWeatherMood` storm predicate |
| `C11` | save/load mid-combo | Divergence detector |
| `C12` | regenerate deal + dominant strategy probe | Grind exploit scan |

**Schedule:** all singles + C01–C12 in CI nightly; full pairwise when runner &lt; 5 min.

---

## 5. Player action script format

```text
PlayerAction =
  | { op: "take", key: string, choiceId: string }
  | { op: "payday", trackEscape?: boolean, incomeMultiplier?: number }
  | { op: "bill", amount: number, label: string }
  | { op: "deal", dealId: string, choice: "accept" | "wait" | "buyout" | "walk" }
  | { op: "board_roll" }                    // consumes seeded die
  | { op: "board_resolve" }                 // land on space
  | { op: "macro_advance", turns?: number }
  | { op: "quest", questId: string, op: "start" | "complete" | "fail" }
  | { op: "shock", channel: string, delta: object }   // fixture-only
  | { op: "save_load" }
  | { op: "assert", detector: string, params?: object }
```

Actions are **wall-clock free**. Any step that today calls `Date.now()` or unseeded `Math.random()` must be routed through injectable clock/RNG in test builds.

---

## 6. Failure detectors

Each detector returns `{ pass: boolean, code: string, detail?: string }`.

### 6.1 Infinite-money exploits

**Detect:** pouch or CF increases without a authored **source action** in the script.

| Check | Rule |
|-------|------|
| Conservation | Δpouch ≈ sum(`coinDelta`) + minigame rewards in script |
| Double Pay Day | Same tick cannot credit Pay Day twice |
| Deal loop | Accept → sell → Accept same id with net positive |
| Board bailout | `bailoutReady` + raid cannot net infinite |
| Streak faucet | Removed +5 login — regression guard ([CONSTRAINT_PLAY_TRUTH.md](../design/CONSTRAINT_PLAY_TRUTH.md)) |

```text
FAIL if pouch(end) > pouch(start) + documented_sources(actions)
```

### 6.2 Dominant strategies

**Detect:** One action sequence dominates all others on **Freedom / CF / quest completion** with no situational trade-off.

| Method | Threshold |
|--------|-----------|
| Branch sweep | For each authored fork, ≥2 branches remain viable at scenario mid-state |
| Wait vs Accept | Accept not strictly optimal in &gt;80% of seeded sweeps when Wait authored |
| Haste vs wait | Credit fork — neither dominates all CF/weather states |
| Grind deal | `regenerateAssetDealOffer` — marginal CF gain bounded; no infinite gen |

Report **dominance ratio** per scenario — flag for design review, not auto-fail unless &gt;95% with zero cost.

### 6.3 Impossible recovery

**Detect:** States where **no legal action sequence** reaches solvency / quest progress within bounded horizon.

| Check | Bound |
|-------|-------|
| BFS recovery | From state S, exists path to CF ≥ 0 or quest advance within **H=24** actions |
| Dignity path | Fail overlay always offers Retry / stay-put ([FAILURE_RECOVERY.md](../ftue/FAILURE_RECOVERY.md)) |
| Softlock | No state where all verbs blocked and pouch &lt; 0 with mandatory spend |

```text
FAIL if BFS finds no recovery AND authored recovery verb exists in content spec
PASS with WARN if recovery requires grind &gt; H (design debt)
```

### 6.4 Economic contradictions

**Detect:** Two **truth channels** disagree on Harbor-facing literacy.

| Contradiction | Example | Rule |
|---------------|---------|------|
| Macro vs CF weather | `economy.phase=recession` but CF `boom` sky claims recession décor on plaza | Harbor mood from **CF** wins |
| Price vs mood | Shop multiplier inconsistent with `harborWeatherMood` | `harborPriceMultiplier` pure fn |
| Scar vs holding | Piggy line cites jar when treat tab holding active | Memory firewall |
| Freedom vs ledger | `harborEscaped` false but streak ≥ target | `applyPayday` streak logic |
| Decorative closure | Closed stall mesh without `flag_*_closed` | Forbidden ([ECONOMIC_ENVIRONMENT_SYSTEM.md](../world/ECONOMIC_ENVIRONMENT_SYSTEM.md)) |

### 6.5 Quest contradictions

**Detect:** Quest graph state inconsistent with save evidence.

| Check | Example |
|-------|---------|
| Complete without objectives | `quest_completed` but objective predicates false |
| Irreversible mismatch | Take key missing but quest assumes footprint |
| Gate skip | Credit unlocked without Paycheck Change + Freedom path |
| Parallel exclusives | Mutually exclusive quests both `complete` |

Use island JSON objective types + `reconcileFtueQuestProofs` behavior ([save.ts](../../src/islands/save.ts)).

### 6.6 NPC-memory contradictions

**Detect:** Spoken/recalled facts not backed by sim or authored memory.

| Check | Source |
|-------|--------|
| Scar echo without scar | `scarRumorLine` needs `harborScars` id |
| Transfer spoiler | Memory cites Cove choice during independent window |
| Invented debt | NPC line references liability not in holdings |
| Tone without scar | Digression tone scar kind present |

Align with [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) · [CHARACTER_MEMORY_ARCHITECTURE.md](../narrative/CHARACTER_MEMORY_ARCHITECTURE.md). v1: **structural** checks on saved memory keys — not LLM output.

### 6.7 Save/load divergence

**Detect:** Core hash drift across serialize cycle.

| Step | Assert |
|------|--------|
| Roundtrip at each action | hash before === hash after sanitize |
| Migrate idempotence | `migrate(migrate(save)) === migrate(save)` |
| Poison rejection | corrupt fields stripped, core unchanged or safe default |
| Partial write | interrupted save simulation — use atomic write policy when implemented |

Existing: [save.test.ts](../../src/islands/save.test.ts), [ftueRedTeam.test.ts](../../src/islands/ftueRedTeam.test.ts) — extend with core_hash.

### 6.8 Unbounded feedback loops

**Detect:** State variables grow without cap across repeated actions.

| Loop | Guard |
|------|-------|
| CF → weather → price → deal → CF | Multipliers clamped [0.85, 1.15] on Harbor |
| Pay Day streak | Caps at `HARBOR_ESCAPE_STREAK`; escape latches |
| Deal regeneration | Generation counter scales cost — bounded marginal gain |
| Scar stance | `stanceDelta` capped per Take |
| Event log | `recentEvents` slice ≤ 12 |
| Consequence engine (when wired) | pending queue finite per commit |

```text
FAIL if any scalar grows monotonically N=50 identical actions without asymptote
```

---

## 7. Non-determinism inventory (must isolate)

These **break replay** today unless seeded or frozen in test harness:

| Location | Source | Test fix |
|----------|--------|----------|
| [economy.ts](../../src/islands/economy.ts) `rollPhaseTransition` | `Math.random()` | Inject `rng()` from seed |
| [partyBoard.ts](../../src/islands/partyBoard.ts) `rollDice`, deal pick | `Math.random()` | Seeded stream |
| [voyagerLedger.ts](../../src/islands/voyagerLedger.ts) `pushEvent` | `Date.now()`, random id | Freeze clock; deterministic id seq |
| Minigame scores | input-dependent | Record inputs in action script |
| LLM / coach | N/A in sim path | Excluded — must not affect CoreResult |

**CI gate:** new sim code must not add unseeded `Math.random()` on authoritative paths (lint rule recommended).

---

## 8. Scenario fixtures (authored examples)

### S-RECESSION-TRANSFER

```yaml
scenario_id: S-RECESSION-TRANSFER
initial_state: post_cove_guided_success
seed: 42
shocks:
  - { channel: economyState.phase, value: recession }
  - { channel: voyagerLedger.livingExpenses, delta: +5 }
actions:
  - { op: macro_advance, turns: 1 }
  - { op: take, key: paycheck_protect_vs_spend, choiceId: protect }
  - { op: payday }
  - { op: assert, detector: economic_contradiction }
  - { op: assert, detector: quest_contradiction }
invariants:
  - harborWeatherMood derived from CF only
  - transfer_success allowed without coach spoil flag
```

### S-LEVERAGE-SPIRAL

```yaml
scenario_id: S-LEVERAGE-SPIRAL
initial_state: post_credit_unlock
seed: 99
actions:
  - { op: take, key: credit_borrow_vs_wait, choiceId: haste }
  - { op: deal, dealId: liability_tab, choice: accept }
  - { op: payday, trackEscape: true }
  - repeat: { op: payday, times: 6 }
detectors:
  - impossible_recovery
  - unbounded_feedback_loop
  - dominant_strategy
```

### S-SAVE-MID-PAYDAY

```yaml
scenario_id: S-SAVE-MID-PAYDAY
actions:
  - { op: payday }
  - { op: save_load }
  - { op: board_roll }
  - { op: board_resolve }
detectors:
  - save_load_divergence
```

---

## 9. CI integration

| Tier | When | Content |
|------|------|---------|
| **PR** | Every push | Singles: job loss, recession, leverage, low liquidity, save/load; detectors 6.1, 6.4, 6.7 |
| **Nightly** | Scheduled | Full combo matrix C01–C12 + recovery BFS sample |
| **Pre-playtest** | Human cohort | Export scenario hashes for build under test |

**Exit criteria for iconic phase:**

1. Zero infinite-money failures on spine scenarios  
2. Zero save/load core_hash mismatches  
3. Zero economic contradictions (CF vs Harbor)  
4. Documented WARN only for impossible recovery beyond horizon H  
5. `advanceEconomy` + board dice seeded in runner  

---

## 10. Relation to existing tests

| Existing | Extend toward |
|----------|---------------|
| [spineTakeFootprints.test.ts](../../src/islands/spineTakeFootprints.test.ts) | Take → ledger footprints in scenarios |
| [save.test.ts](../../src/islands/save.test.ts) | core_hash roundtrip |
| [ftueRedTeam.test.ts](../../src/islands/ftueRedTeam.test.ts) | quest reconcile under stress |
| [consequenceEngine.test.ts](../../src/simulation/consequence/consequenceEngine.test.ts) | Seeded long-horizon rows when integrated |
| [firstFinancialScenario.wire.test.ts](../../src/islands/firstFinancialScenario.wire.test.ts) | Wire checks → runtime scenario |

**Gap ([DESIGN_DEBT.md](../design/DESIGN_DEBT.md)):** No `economy-sim/` runner yet — this doc is the spec to implement it.

---

## 11. Reporting template

```text
StressRunReport {
  scenario_id
  seed
  core_hash
  detectors: { code, pass, detail }[]
  dominance_ratios?: Record<fork, number>
  recovery_depth?: number | null
  duration_ms
  git_sha
}
```

Fail the build on `pass: false` for **blocker** codes: `INFINITE_MONEY`, `SAVE_DIVERGENCE`, `ECON_CONTRADICTION`, `QUEST_CONTRADICTION`, `UNBOUNDED_LOOP`.

Warn-only: `DOMINANT_STRATEGY`, `IMPOSSIBLE_RECOVERY`, `NPC_MEMORY` (until memory schema complete).

---

## 12. Anti-patterns

| Anti-pattern | Why |
|--------------|-----|
| Assert UI text | Flaky; test CoreResult |
| Use wall clock in scenarios | Breaks replay |
| Fake housing/insurance channels in prod to satisfy tests | Violates eco honesty |
| Auto-ship balance changes from sim | Bible law |
| Seed omitted | Not deterministic |
| Compare full save JSON | Event ids/noise |

---

## 13. Phased delivery

| Phase | Deliverable |
|-------|-------------|
| **A** | This plan + fixture YAML for S-RECESSION-TRANSFER, S-LEVERAGE-SPIRAL, S-SAVE-MID-PAYDAY |
| **B** | `fingerprint.ts` + seeded RNG wrapper; PR-tier singles |
| **C** | Detector modules + combo matrix nightly |
| **D** | Recovery BFS + dominance sweep |
| **E** | Consequence engine scenarios when wired to save |

---

## 14. Success criteria

1. Two identical runs with same `(initial_state, seed, actions)` produce **identical `core_hash`**.  
2. Save/load mid-scenario produces same final hash as continuous run.  
3. All **live** stress channels have ≥1 scenario.  
4. **Future** channels documented as fixtures only — no fake plaza signals.  
5. Contradiction detectors catch macro-vs-CF weather regression.  
6. Team can add a scenario by authoring fixture + action list — no manual play required.
