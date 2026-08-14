# Iconic later list — park before creep

**Purpose (Pillar 17):** Keep feature creep from eating the signature loop.  
Anything here is **parked** until the MVP iconic bar holds:  
**Signature loop + Cove · Paycheck · Credit organs cold-retellable at Harbor.**

**Before un-parking or inventing work:** pass [FEATURE_GATE.md](./FEATURE_GATE.md) (VALUE vs COST; multi-system prefer; no copycat justifications).

**Canon:** [iconic-path.md](./iconic-path.md) · [iconic-craft-plan.md](./iconic-craft-plan.md) · [mural-thesis.md](./mural-thesis.md) · [era-shores-restore.md](./era-shores-restore.md)  
**Code law:** `src/islands/iconicScopeFreeze.ts` · `src/islands/spineContentRegistry.ts` · `src/design/featureGate.ts`

---

## Freeze (do not ship)

| Law | Meaning |
|-----|---------|
| No map width | **Main quest** strip stays **Harbor · Cove → Paycheck → Credit**. Era **SIDE SHORE** chapters may ride the outer ring; do not add new main-course chips. |
| No fake MMO | Family Room stays local / device-share |
| No foreign merge | Nathan Project · BMO · CBE stay out of Capital |
| Cut before add | New main-course island < deeper Take / feel / Plinth proof |

Lift main-course width only when a cold player can retell Coin · Clock · Spiral · Memory in one kid sentence each after Harbor return.

---

## MVP iconic (in scope)

- Cove Take → carpet home → scar spectacle → Plinth share → Piggy → day-2 echo  
- Paycheck + Credit Takes that Harbor can name with organ words  
- Money Structure interiors on the spine (Coin Jar · Ledger Bank · Payroll Tower · Interest Keep)  
- Quiet Harbor chrome, Esc · Leave, corrupt-save / myth failsafe, reduced motion  
- Era **SIDE SHORE** restore (signal_city · venture_foundry · …) with per-shore soundtrack — see [era-shores-restore.md](./era-shores-restore.md)  

Deepen spine signature before inventing *new* main-course islands.

---

## Parked content (on disk, not live)

| Kind | IDs / packs | Why parked |
|------|-------------|------------|
| Demo island | `starter_key_cove` | Off map — demo / Key Cove only |
| Digression minigames | `mg_news_shocks` · `mg_compound_snowball` · `mg_pasaran_market` · `mg_mancala_compound` · `mg_life_fork` · `mg_ck_budget_balancer` | Out of Harbor Arcade |

## Live SIDE SHORE lane (outer ring — not main strip)

`signal_city` · `venture_foundry` · `financial_assets` · `digital_assets` · `business_assets` · `intangibles` · `future_shores` · `real_estate`  

Docs carry **SIDE SHORE** banners. Soft-locked until Cove Change. Soundtrack cues already in `soundtrackCatalog.ts`.

---

## Deferred polish (from craft status “Next fix”)

These are **allowed later** as spine depth — not new main-course islands:

| From | Parked polish |
|------|----------------|
| Fantasy / Story / UI | (iterated) Talk Battle + cold kid retell; Ashore Piggy/veil polish on PR #68 |
| Core loop | (iterated) Cold Take `doneMs` + pier guide + Carpet CTA after hush |
| Goals | (iterated) Bad-take Spend soft-fail copy parity |
| Feel | (iterated) Walk stop coast + carpet rail juice on hop/land |
| Progression | (iterated) Freedom Seal + Seal chase chip after pouch dips |
| Encounters | (iterated) Alma craft-bench ≠ Paycheck payday buckets |
| Content | SIDE SHORE banners on era island docs; demo Key Cove stays PARKED |
| Balance | (iterated) First seal plaza readability after pouch dips |
| Art | Harbor plaza master plan — fountain court clear of Bank door |
| Audio | Per-shore era cues live when side shores load |
| Onboarding | (iterated) Boot Board CTA + look-stage Cancel parity |
| Technical | (iterated) Kill-switch e2e for harbor3d sticky fail |
| A11y | (done) High-contrast share lower-third panel |
| Testing | Keep status board honest after every fix |
| Whole-game | See [whole-game-craft.md](./whole-game-craft.md) — parts + whole craft law |

---

## Production roles

| Role | Source of truth |
|------|-----------------|
| Design truth | `docs/` (path, craft plan, mural, this later list) |
| Code proof | `src/islands` + `e2e` + `npm run test:iconic` |
| Cadence | Cold checklist + six questions → board update |

When two ideas fight: **fantasy + signature loop win**. When a new *main-course* island idea appears: **add a row here, don’t widen the strip**.
