# Transfer Tasks — Rule Transfer, Not Button Memory

**Date:** 2026-08-17  
**Law:** Each foundational concept has ≥1 transfer task that tests the **same underlying rule** in a **new surface**, with **new numbers**, **no tutorial chrome**, and **no repeated button sequence**.  
**Code:** `src/islands/conceptProgression/transferTasks.ts` · `transferMetrics.ts`  
**Curriculum:** `CONCEPT_CURRICULUM.md`

---

## Principle

| | TRAINING (guided) | TRANSFER |
|--|-------------------|----------|
| **Tests** | Underlying rule | Same rule |
| **Surface** | Spine tutorial context | Different place / NPC / UI |
| **Numbers** | First-session amounts | Different $ / thresholds |
| **Guidance** | Bag · clear-at · footprint · chambers | Removed or reduced to fail-tier only |
| **Sequence** | Scripted quest chain | Player-chosen path OK when noted |

**Example — session liquidity**

- **TRAINING:** Cove EarnSpend — insufficient wallet before craft buy; “Not enough money!”; jobs labeled +$.  
- **TRANSFER:** Paycheck rainy-day vendor — different obligation, different amounts, no Cove module labels; earn-first still valid, skip spend valid, cheaper buy valid.

---

## Measurement row (per concept_id)

Recorded on `ConceptRuntimeEntry` + exported via `getConceptTransferMetrics`:

| Field | Meaning |
|-------|---------|
| `concept_id` | Curriculum / registry id |
| `guided_success` | Guided practice proof met (→ REDUCED_GUIDANCE) |
| `guided_attempts` | Attempts at guided phase |
| `hints_used` | Escalated hints consumed |
| `transfer_success` | Transfer scenario passed (→ INDEPENDENT) |
| `transfer_attempts` | Transfer-window tries |
| `transfer_time` | ms from transfer window open to pass |
| `strategy_selected` | Stance / choice id when inferrable (e.g. `protect`, `spend`, `wait`, `borrow`) |

Telemetry: `concept_transfer` event with the same payload.

Scenario passes also stored in `save.conceptTransferPasses[scenarioId]`.

---

## Escalating assist (unchanged)

ATTEMPT 1 natural → 2 highlight → 3 conceptual → 4 explicit.  
Transfer tasks **never** reveal optimal strategy on attempt 1.  
See `FAILURE_RECOVERY.md`.

---

## Catalog (foundational concepts)

Each row: **rule** · **training** · **transfer scenario id** · **transfer context**

### Foundation

| concept_id | rule | training | transfer id | transfer |
|------------|------|----------|-------------|----------|
| `money_is_alive` | Choice becomes Harbor memory | Cove Take + hush | `ts_money_alive_pp_take` | Paycheck Vee Take |
| `walk_talk` | Near + Talk | Ashore ring | `ts_walk_talk_cove_npc` | Cove NPCs without ring UI |
| `carpet_voyage` | Carpet between paintings | Ashore dock | `ts_carpet_paycheck` | Paycheck voyage |

### Coin organ

| concept_id | rule | training | transfer id | transfer |
|------------|------|----------|-------------|----------|
| `coin_denominations` | Coin values | Coin Sort | `ts_denoms_harbor_market` | Mastery / market change |
| `exact_change` | Exact pay beats overpay | Sort rounds | `ts_exact_change_mastery` | Mastery quiz |
| `earn_then_decide` | Earn before Take | First Coins chain | `ts_earn_decide_pp_budget` | Paycheck budget → Take |
| `session_liquidity` | Can't pay without wallet | Cove EarnSpend | `ts_liquidity_pp_vendor` | Paycheck vendor wallet |
| `needs_vs_wants` | Needs before treats | Shelly digression | `ts_needs_wants_pp_buckets` | Budget buckets |
| `save_vs_spend` | Protect vs spend stance | Cove jar/treat | `ts_save_spend_pp_umbrella` | Umbrella vs glitter |
| `irreversible_take` | Take sticks | Cove hush | `ts_irreversible_credit` | Credit wait/borrow |
| `coin_hold` | Quiet hold | Cove Soft Beat | `ts_coin_hold_soft_beat` | Paycheck loft |
| `harbor_scar_memory` | Plinth remembers | Spectacle | `ts_scar_memory_day2` | Day-2 + Paycheck scar |

### Harbor ledger

| concept_id | rule | training | transfer id | transfer |
|------------|------|----------|-------------|----------|
| `income` | +$/mo in | HUD after Change | `ts_income_harbor_deal` | Harbor asset deal |
| `expenses` | −$/mo out | Treat tab | `ts_expenses_liability_deal` | Liability / spender path |
| `cashflow` | Net /mo → weather | Cove footprint | `ts_cashflow_weather` | Freedom chase |
| `asset` | keep + holding | Jar hold | `ts_asset_second_deal` | Second Harbor asset |
| `liability` | drain − holding | Treat tab | `ts_liability_stack` | Credit / deal drain |
| `pay_day` | Monthly credit rhythm | First ritual | `ts_payday_ritual` | Seal streak |
| `harbor_weather` | CF paints sky | Spender Cove fog | `ts_weather_storm_loop` | Credit haste fog |

### Clock organ

| concept_id | rule | training | transfer id | transfer |
|------------|------|----------|-------------|----------|
| `paycheck_income` | Timed paycheck | Pat dialogue | `ts_paycheck_income_inbox` | Inbox Storm |
| `budget_buckets` | Split buckets | Bureau drag | `ts_buckets_envelope` | Envelope module |
| `emergency_fund` | Shock reserve | Carlos rainy | `ts_emergency_credit_shock` | Credit shock |
| `protect_vs_spend` | Shelter first | Vee Take | `ts_protect_spend_pp` | Credit wait/borrow |
| `plan_vs_impulse` | Plan before tip | Tip digression | `ts_plan_impulse_tip` | Spiral haste |

### Gate

| concept_id | rule | training | transfer id | transfer |
|------------|------|----------|-------------|----------|
| `freedom_seal` | Sustained CF | First streak UI | `ts_freedom_seal_chase` | Credit unlock gate |
| `mastery_clear` | Quiz proves literacy | Cove mastery | `ts_mastery_spiral_gate` | Later gate ids |

### Spiral organ

| concept_id | rule | training | transfer id | transfer |
|------------|------|----------|-------------|----------|
| `debt` | Borrowed weight | Credit entry | `ts_debt_canyon` | Borrow Take |
| `interest_compounds` | Compounding cost | Interest Keep | `ts_interest_apr_wall` | Borrow APR path |
| `patience_vs_haste` | Wait vs now | Soft Beat arm | `ts_patience_haste_take` | Ordeal without arm |
| `on_time_history` | Streak terms | Credit minigames | `ts_on_time_streak` | New payment window |
| `apr` | True borrow price | Rex dialogue | `ts_apr_true_price` | Borrow irreversible proof |
| `credit_utilization` | Limit usage hurts | Util minigame | `ts_utilization_borrow_path` | High borrow path |
| `wait_vs_borrow` | Wait saves interest | Ordeal Talk | `ts_wait_borrow_ordeal` | Second credit beat |
| `bank_of_obligation` | Obligation as place | Bank digression | `ts_obligation_digression` | Gossip without signpost |

**Era-only** (`diversification`, `time_horizon`, `investment_return`) — no spine transfer in iconic freeze; defer to era shores PR.

---

## Registry linkage

Spine concepts in `CONCEPT_REGISTRY` use `primaryTransferPredicate(concept_id)` → `{ type: "transfer_scenario_passed", scenarioId }`.

Phases:

1. **GUIDED** — `success_condition` (training)  
2. **REDUCED_GUIDANCE** — guided metrics stamped  
3. **INDEPENDENT** — transfer scenario passed + transfer metrics stamped  
4. **MASTERED** — `mastery_condition`

---

## Implementation status

| Item | Status |
|------|--------|
| `TRANSFER_SCENARIOS` catalog (33+ concepts) | **Done** |
| `conceptTransferPasses` on save | **Done** |
| `ConceptTransferMetrics` + runtime fields | **Done** |
| `transfer_scenario_passed` predicate | **Done** |
| `syncConceptTransferPasses` in `applyConceptSync` | **Done** |
| `concept_transfer` analytics | **Done** (on phase → INDEPENDENT) |
| Dedicated transfer UI shells (no guidance) | Follow-up per scenario |
| `session_liquidity` in CONCEPT_REGISTRY | Follow-up (catalog + scenario exist) |

---

## Non-goals

- Re-running Cove Coin Sort as “transfer”  
- Same button order with reskinned art  
- Tutorial arrows on transfer surfaces  
- Forcing one optimal strategy when multiple valid strategies are documented
