# Capital — Decision Preview Architecture

**Status:** Design specification for consequential financial commits  
**Layer:** UI Layer 2 — information for the **current decision** (`UI_LAYER_AUDIT.md`)  
**Companions:** `CAUSAL_TIME_SYSTEM.md` · `FINANCIAL_FEEDBACK_VOCABULARY.md` · `DECISION_AUDIT.md` · `STRONGEST_RECURRING_LOOP.md` · `CAPITAL_DESIGN_CONSTITUTION.md`  
**Law:** Preview only what the simulation can honestly know. **Do not reveal unknowable futures.** Presentation must teach **risk literacy** (certainty labels), not spreadsheet cosplay or casino odds theater.

**Prototype policy:** Spec first; implement with Living Cashflow Commit / Take Talk when approved — no production code in this doc.

---

## 1. Purpose

Before a consequential financial commit, Capital shows a **Decision Preview**: projected changes if *this option* is chosen, with an explicit **certainty** on every row.

Players learn:

- Some outcomes are **locked in** by the math (buy jar → CF +5).  
- Some are **estimated** from known rules (weather band often follows CF).  
- Some are **probabilistic** only when the fantasy truly has chance.  
- Some stay **unknown** until Harbor answers — and the UI says so.

---

## 2. When a preview is required

| Action class | Preview? | Notes |
|--------------|----------|-------|
| Spine Take (Cove / Paycheck / Credit forks) | **Yes** | Irreversible; highest literacy stakes |
| Harbor Opportunity / deal Accept | **Yes** | Recurring CF commit |
| Opportunity Wait / Pass | **Yes** (lighter) | Show opportunity cost of not taking the offer |
| Forced Debt Trap liability | **No commit UI** | Not a choice — still show **post** Owes feedback |
| Soft Beat dismiss | No | Information peek, not money commit |
| Capsule / polish / pet cosmetic | Light cash-only | Not full CF preview (anti “fake investment”) |
| Mastery quiz answer | No | Not a financial projection |
| Share / Witness | No | Social, not ledger |

If an action claims to be financial but has **no projectable CERTAIN/ESTIMATED rows**, it fails Decision Audit (MEANINGLESS) — fix the sim or demote the fantasy.

---

## 3. Projection fields

Each preview option may populate a subset. Omit empty rows (progressive disclosure). Use feedback vocabulary words/glyphs (`FINANCIAL_FEEDBACK_VOCABULARY.md`).

| Field | Player label | Meaning | Typical certainty |
|-------|--------------|---------|-------------------|
| `cash_after` | **Cash after** | Pouch if committed now | CERTAIN |
| `monthly_cf_change` | **Monthly cash flow** | Δ keep/drain `/mo` | CERTAIN when holding written; else UNKNOWN |
| `debt_change` | **Debt change** | Liability stock / owed burden Δ | CERTAIN for tab add; UNKNOWN if no debt model |
| `liquidity_change` | **On hand** | Buffer feel (e.g. coins left vs deal cost + buffer) | CERTAIN math; ESTIMATED “tight/ok” band |
| `risk_change` | **Risk** | Spiral / haste / storm exposure qualitative | ESTIMATED or UNKNOWN |
| `future_obligation` | **Still owes** | Ongoing drain or streak risk | CERTAIN if liability; ESTIMATED if streak |
| `expected_range` | **Expected range** | Bounded band when rules allow (e.g. next Pay Day coins) | ESTIMATED or PROBABILISTIC |
| `opportunity_cost` | **Instead of…** | What this fork forgoes | CERTAIN (other label) / ESTIMATED (forgone CF) |

### Mapping to Capital today

| Field | Cove jar | Cove treat | Deal Accept | Deal Wait | Credit wait | Credit borrow |
|-------|----------|------------|-------------|-----------|-------------|---------------|
| cash_after | same | same | −cost | same | same | same |
| monthly_cf_change | **+$5 CERTAIN** | **−$5 CERTAIN** | **+N CERTAIN** | 0 | 0 / UNKNOWN | 0; weather ESTIMATED |
| debt_change | 0 | +treat tab CERTAIN | 0 | 0 | UNKNOWN | UNKNOWN / narrative |
| liquidity_change | — | — | −cost CERTAIN | preserves CERTAIN | — | — |
| risk_change | lower Freedom pressure EST. | higher EST. | lower if CF↑ EST. | — | lower EST. | higher EST. |
| future_obligation | none | treat drain CERTAIN | none | none | none | living with haste UNKNOWN→EST. |
| expected_range | next Pay Day ≈ CF' EST. | thinner Pay Day EST. | next Pay Day ≈ CF' EST. | — | — | — |
| opportunity_cost | forgo treat plaque CERTAIN | forgo +5/mo CERTAIN | forgo Wait liquidity | forgo +N/mo EST. | forgo borrow plaque | forgo wait plaque |

---

## 4. Certainty taxonomy (literacy core)

Every preview row carries exactly one:

| Level | Word on UI | Glyph / shape (not color alone) | Means | Example |
|-------|------------|----------------------------------|-------|---------|
| **CERTAIN** | Certain | Solid underline · lock mark | Follows from rules already true; no hidden roll | Deal cost 40 → Cash after = pouch−40 |
| **ESTIMATED** | Estimated | Soft dashed underline · ≈ | Known model, incomplete world (other events may intervene) | “Sky often softens when keep ≥ $30” |
| **PROBABILISTIC** | Chance | Spiral · `p ≈` or odds text | True randomness or sample in fantasy | Only if EventDeck / insurance-like; **rare on spine** |
| **UNKNOWN** | Unknown | Hollow `?` · “Harbor will show” | Not computable yet — **honest blank** | “Whether Piggy’s exact words… Unknown” |

### Literacy rules

1. **Never dress UNKNOWN as CERTAIN** (no fake precise weather ° for unmodeled outcomes).  
2. **Never use PROBABILISTIC** to juice Accept (casino anti-pillar). Prefer ESTIMATED bands.  
3. CERTAIN rows use **exact numbers**; ESTIMATED use **≈** or “often / usually”; UNKNOWN use **em dash + “Unknown”**.  
4. Certainty label is **text + shape**; color is optional reinforcement only.  
5. Mute-test: certainty readable without SFX.

### Teaching microcopy (optional one-liner under panel)

> Certain = locked by the math. Estimated = our best read. Unknown = Harbor hasn’t answered yet.

Show once per session or behind a `?` — not a lecture wall.

---

## 5. UI architecture

### Placement

- **Layer 2** on the decision surface (Talk choice card · Opportunity panel).  
- Not a persistent Harbor HUD (`UI_LAYER_AUDIT.md`).  
- Compare mode: selecting option A updates preview; option B updates; Wait updates.

### Structure (wireframe)

```
┌─────────────────────────────────────────┐
│  If you choose: “Jar before treat”        │
│  ─────────────────────────────────────    │
│  Cash after          120        Certain   │
│  Monthly cash flow   keep +5/mo Certain   │
│  Still owes          —          —         │
│  Risk                softer chase ≈ Est.  │
│  Instead of…         Treat plaque Certain │
│  Next Pay Day        ≈ keep+…   Estimated │
│  Harbor’s exact line —          Unknown   │
│                                           │
│  [ Commit ]     [ Not yet ]               │
└─────────────────────────────────────────┘
```

Omit blank rows. Max **5–6** visible rows — if more, keep CERTAIN first, then ESTIMATED; park UNKNOWN behind “What we don’t know yet”.

### Visual literacy pattern

| Certainty | Row treatment |
|-----------|----------------|
| CERTAIN | Solid number · solid rule · “Certain” |
| ESTIMATED | `≈` prefix · dashed rule · “Estimated” |
| PROBABILISTIC | Range `a–b` · spiral mark · “Chance” |
| UNKNOWN | `—` · “Unknown · Harbor will show” |

Use Holds / Owes / Risk / Instead of… vocabulary — not raw engineer field names.

### Interaction

1. Highlight choice → preview updates (no commit).  
2. Soft preview chime optional (`sig.return.preview`) — quieter than Take mark.  
3. Commit → existing feedback chain (VALUE CHANGE → cinema / ledger).  
4. Defer / Not yet → close preview; no write.

### Anti-patterns

| Anti-pattern | Why |
|--------------|-----|
| Spoiling spectacle/Piggy exact dialogue as CERTAIN | Kills Harbor mystery; unknowable tone |
| Showing Freedom Seal “unlocked in 2 Pay Days” as CERTAIN when streak can break | Lie — use ESTIMATED |
| RNG % on Cove jar | Casino |
| Full spreadsheet of all holdings | Layer 3 only |
| Preview on Outfitter pets framed as “investment return” | Fake financial literacy |

---

## 6. Authoring contract

Each consequential option declares `preview_rows[]`:

```text
PreviewRow {
  field: cash_after | monthly_cf_change | debt_change | liquidity_change
       | risk_change | future_obligation | expected_range | opportunity_cost
  certainty: CERTAIN | ESTIMATED | PROBABILISTIC | UNKNOWN
  display: string          // player-facing value or "—"
  compute?: from_save      // optional pure function id
  hide_if_empty?: boolean
}
```

Rows must align with `CausalDecision` effects (`CAUSAL_TIME_SYSTEM.md`):

- CERTAIN preview ↔ `immediate_state_change` or certain `scheduled_effect`  
- ESTIMATED ↔ conditional scheduled (weather band, streak)  
- UNKNOWN ↔ Retell flavor, exact Piggy line, unmodeled social  

If preview says CERTAIN +$5/mo but sim writes nothing → **bug**.

---

## 7. Worked examples

### 7.1 Cove — Jar before treat

| Row | Display | Certainty |
|-----|---------|-----------|
| Cash after | (unchanged) | CERTAIN |
| Monthly cash flow | keep **+$5**/mo · Holds | CERTAIN |
| Still owes | — | — (omit) |
| Risk | Freedom chase often easier | ESTIMATED |
| Instead of… | “Treat before jar” plaque | CERTAIN |
| Next Pay Day | ≈ current CF + 5 | ESTIMATED |
| Exact Harbor words | — | UNKNOWN |

### 7.2 Cove — Treat before jar

| Row | Display | Certainty |
|-----|---------|-----------|
| Monthly cash flow | drain **−$5**/mo · Owes | CERTAIN |
| Still owes | Treat tab each Pay Day | CERTAIN |
| Risk | Sky often tighter while drained | ESTIMATED |
| Instead of… | +$5/mo jar hold | CERTAIN |
| Exact gossip tone | — | UNKNOWN |

### 7.3 Harbor deal — Accept Booth (cost 40, +10/mo)

| Row | Display | Certainty |
|-----|---------|-----------|
| Cash after | pouch − 40 | CERTAIN |
| Monthly cash flow | keep +10/mo · Holds | CERTAIN |
| On hand | buffer after buy (ok/tight) | CERTAIN / ESTIMATED band |
| Instead of… | Waiting / other spends | CERTAIN |
| Next Pay Day | ≈ new CF | ESTIMATED |
| Seal in N days | — | UNKNOWN or ESTIMATED only if streak math shown carefully |

### 7.4 Harbor — Wait

| Row | Display | Certainty |
|-----|---------|-----------|
| Cash after | unchanged | CERTAIN |
| Monthly cash flow | unchanged | CERTAIN |
| Instead of… | This offer’s +N/mo (may reshuffle) | ESTIMATED |
| On hand | powder dry | CERTAIN |

### 7.5 Credit — Borrow / haste

| Row | Display | Certainty |
|-----|---------|-----------|
| Monthly cash flow | unchanged by fork today | CERTAIN (honest about MEANINGLESS CF) **or** omit if zero |
| Risk | Haste · storm likelier if keep is low | ESTIMATED |
| Instead of… | Waited the spiral | CERTAIN |
| Sky exact look | — | UNKNOWN |

If CF is truly unchanged, **do not invent** a CERTAIN CF row — literacy includes admitting the fork is risk/identity, not cashflow (pressures content to add real stakes later).

---

## 8. Risk literacy outcomes (success)

After using previews, players should spontaneously say things like:

- “That plus five a month is **certain**; the sky is only **estimated**.”  
- “Waiting keeps my coins **certain**; the booth might not stay.”  
- “Harbor’s line is **unknown** until I go home.”  

Playtest probe (when prototyping): show two rows, ask which is locked vs maybe — ≥80% correct without coaching.

---

## 9. Phased delivery

| Phase | Scope |
|-------|--------|
| **P0** | Cove Take two options + Wait/defer: CF CERTAIN + Instead of + one UNKNOWN |
| **P1** | Opportunity Accept/Wait: cash_after + monthly_cf + liquidity + opp cost |
| **P2** | Credit risk rows ESTIMATED; Paycheck only if CF stakes exist |
| **P3** | Expected range on Pay Day; rare PROBABILISTIC for true chance events |

Align P0–P1 with strongest chain prototype (`SYSTEM_INTERACTION_MATRIX.md`).

---

## 10. Checklist before shipping a preview

- [ ] Every row has a certainty  
- [ ] No unknowable spoiled as CERTAIN  
- [ ] Words match feedback vocabulary (Holds / Owes / Risk / Instead of)  
- [ ] Color not sole certainty signal  
- [ ] ≤6 rows; CERTAIN prioritized  
- [ ] Commit still uses full post-feedback chain  
- [ ] Sim matches CERTAIN claims  
- [ ] Esc / Not yet available  

---

## 11. Open questions

- Exact buffer thresholds for liquidity “tight/ok” bands  
- Whether Freedom streak ETA ever appears as ESTIMATED (easy to over-promise)  
- Merge with `decisionTimeline` post-hoc “why” vs pre-commit preview (preview ≠ replay)
