# Capital — Design Debt Register

**Companion to:** `MASTER_DESIGN_AUDIT.md`  
**Rule:** Debt must cite **evidence** (path or doc). No invented systems.  
**Tags:** KEEP · IMPROVE · SIMPLIFY · CONNECT · MOVE LATER · REMOVE · MISSING  

Debt severity:

- **S0** — Blocks learning causality or soft-locks play  
- **S1** — High confusion / split truth  
- **S2** — Medium drag / maintenance  
- **S3** — Polish / docs lag  

---

## Active debt (shipped `main`)

| ID | Severity | Area | Debt | Evidence | Tag | Suggested disposition |
|----|----------|------|------|----------|-----|------------------------|
| D01 | S0 | Harbor UX | Quiet homecoming can strip plaza to Plinth-only — Carpet unavailable until Piggy Talk | `harborAshore.ts` `shouldStripPlazaForPresence`; `HomeHubView.tsx` | IMPROVE | Keep Talk CTA; keep Carpet+Plinth walkable |
| D02 | S1 | Progression | Credit unlock = Freedom + 3 mastery quizzes — may read as quiz wall vs spine organ | `progressGates.ts` `bossUnlockProgress` | IMPROVE | Revisit unlock tied to Paycheck Change and/or clearer CF pedagogy; keep named hints |
| D03 | S1 | Simulation | Two weather/economy languages: Harbor CF weather vs `economy.ts` boom/recession | `harborWeather.ts`, `economy.ts`, Pay Day multiplier fixed at 1 | SIMPLIFY / CONNECT | Scope boom/recession to market minigames only in copy + HUD |
| D04 | S1 | Progression | XP still awarded while Islands XP chrome hidden | `IslandsApp.tsx` xp increments; `designBible.ts` `hideIslandsXpChrome` | SIMPLIFY / REMOVE | Stop awarding or surface intentionally |
| D05 | S1 | Progression | `skillStats` mutated for adaptive coach while panel hidden | `adaptiveCoach.ts`, `COMPLEXITY_CUT_REVIEW.md` | SIMPLIFY | Drive coach from fails/CF/scars only |
| D06 | S1 | Learning | Independent Transfer instrumented locally; live product ITR unknown | `independentTransfer/`, `analytics/ftue/metrics.ts`, `NORTH_STAR.md` | IMPROVE / MISSING | Human playtests; no fake numbers; optional remote later |
| D07 | S2 | Docs | Some FTUE audits still describe older chamber flows vs live FTUE-7 | `docs/ftue/FTUE_AUDIT.md` vs `AshoreComprehensionTutorial.tsx` | IMPROVE | Doc sync only |
| D08 | S2 | Product shell | Legacy creative/structured modes + `AIChatHelper` coexist with Islands product | `App.tsx` | SIMPLIFY / MOVE LATER | Demote from default mental model |
| D09 | S2 | HUD | `EconomyWeatherIndicator` imported but not rendered | `IslandPlayView.tsx` lazy import pattern | REMOVE | Delete dead widget path |
| D10 | S2 | Onboarding | `WelcomeOnboarding.tsx` still on disk, unmounted | `onboardingNoAhead.test.ts`, Pillar 13 notes | REMOVE | Delete or quarantine |
| D11 | S2 | Narrative | Stance counters increment; bible forbids stance HUD | `IslandsApp.tsx` addScar path; design bible | SIMPLIFY | Keep silent or drop counters |
| D12 | S2 | Economy | Pouch vanity vs CF north star can confuse “am I winning?” | `WealthHud`, `VoyagerLedgerHud`, bible | CONNECT | Coin Bag / Piggy always name CF after first Take |
| D13 | S1 | FTUE recovery | Map can open before Piggy (`piggy_bypassed`) | `IslandsApp.tsx` core_loop_beat; `coinBagBuddy.ts` bypass tip | IMPROVE | Soft re-hook already exists — verify cold play |
| D14 | S2 | A11y | Ashore contrast / fixed-px titles; 3D SR coverage unknown | `FTUE_ACCESSIBILITY_AUDIT.md` | IMPROVE | Craft pass |
| D15 | S3 | Feedback | SFX are procedural beeps — craft ceiling vs iconic mute-test | `capitalSfx.ts` | IMPROVE | Later audio pack; keep mute-test law |
| D16 | S2 | Social | Family Room join only finds rooms on **this** device index | `familyRoom.ts` | MOVE LATER | Paste JSON is sync; no fake server |
| D17 | S3 | Monetization | No real billing on main; shop language can imply real money | `package.json`, `harborShop.ts`, `game-pillars.md` | MOVE LATER / REMOVE copy | Keep no pay-to-win |
| D18 | S2 | Maintenance | Large overlay / cinema stack — high craft cost | `HomeHubView.tsx`, signature overlays | KEEP / SIMPLIFY | Prefer deepening over new overlays |
| D19 | S1 | Learning depth | Continuous interest / debt amortization not a full sim | Credit minigames exist; no full amortization engine | MISSING / MOVE LATER | Teach via Interest Keep + Take, not spreadsheet |
| D20 | S2 | Difficulty | `DifficultyLevel` wiring to thresholds not fully proven here | `settings.ts` | UNKNOWN / IMPROVE | Trace or remove dead setting |

---

## Explicitly not debt (protect)

| Item | Why |
|------|-----|
| Signature loop Take → hush → spectacle → Plinth → share → Piggy → day-2 | Mission-critical emotional causality |
| Local-only Family Room | Freeze + honesty |
| Cove → Paycheck → Credit map freeze | Prevents width over depth |
| Dignity fail overlays | Protects learning persistence |
| Settings OR OS reduced motion + `cinemaFlashAmp` | A11y floor |
| FTUE-7 prove-it teach | Aligns with Independent Transfer architecture |
| No Stripe / no LLM required for iconic phase | Avoids fake polish |

---

## Debt themes (rollup)

1. **Split economic truth** — pouch, CF, XP, mastery quizzes, boom/recession  
2. **Presence vs navigability** — quiet Harbor vs Carpet soft-lock  
3. **Teach vs quiz** — mastery clears gating Spiral  
4. **Docs vs code lag** — FTUE audits, CORE_LOOP “docs only” remnants  
5. **Legacy shell gravity** — pre-Islands App surfaces  

---

## Priority mapping

### P0 (clear S0/S1 that block the mission)

- D01 quiet homecoming Carpet  
- D02 Credit unlock clarity  
- D06 ITR honesty + playtests  
- D03 / D12 one money truth after Take  
- D13 Piggy-bypass recovery verification  

### P1

- D04 D05 D11 parallel languages  
- D07 doc sync  
- D08 demote legacy shell  
- Soft Beat ↔ Talk CONNECT craft  
- Paycheck analogous transfer craft  

### P2

- D09 D10 dead code removal  
- D14 D15 a11y/audio craft  
- D16 D17 social/monetization later  
- D18 overlay budget discipline  
- D19 deeper credit sim only if it serves transfer  

---

## Open PR awareness (not scored as shipped)

`cursor/harbor-friction-clear-2fc5` / PR aiming to:

- stop full plaza strip on quiet homecoming  
- show travel earlier  
- unlock Credit after Paycheck Change  

Until merged to `main`, treat as **proposed**, not current product truth.

---

## Audit maintenance

Re-run this register when:

- Signature loop order changes  
- Credit / Freedom gates change  
- FTUE boot path changes  
- Any real-money billing lands  

Update `MASTER_DESIGN_AUDIT.md` executive verdict in the same PR as material gate changes.
