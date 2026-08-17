# FTUE Red Team — Unpredictable Systems Play

**Date:** 2026-08-17  
**Method:** Break every tutorial beat with valid-but-unexpected player behavior. Classify outcomes. Fix genuine state failures. Never rewind choices to force the designer path.  
**Code:** `src/islands/ftueQuestRecovery.ts` · `src/islands/ftueRedTeam.test.ts`  
**Related:** `FAILURE_RECOVERY.md` · `FTUE_FRICTION_MAP.md` · `FIRST_FINANCIAL_SCENARIO.md` · `AUTONOMY_PROGRESSION.md`

---

## Classification key

| Verdict | Meaning |
|---------|---------|
| **RECOVERS** | Player can continue without losing progress; world responds clearly |
| **ADAPTS** | System accepts the alternate path; rules stay correct; coach may re-hook softly |
| **BECOMES CONFUSED** | Playable but misleading copy, coach, or feedback |
| **SOFTLOCKS** | Cannot reach next spine beat without cheat/debug |
| **TEACHES INCORRECTLY** | Underlying financial rule differs from production (forbidden on spine) |

**Law:** Valid alternate strategies must **ADAPT** or **RECOVER** — never **SOFTLOCK** or **TEACH INCORRECTLY**. We do not teleport the player back to the golden path.

---

## Attack matrix

### A. Unexpected valid choices

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Kira **jar** vs **treat** Take | ADAPTS | Both irreversible; different scar + ledger footprint | `firstFinancialScenario.test.ts` |
| Kira **Maybe later** (defer) | RECOVERS | No irreversible; return anytime | Content + test |
| Shelly digression patience vs impulse | ADAPTS | Side quest; no chapter quiet | Optional path |
| EarnSpend **earn-only** (never spend) | ADAPTS | Wallet grows; no forced spend | `firstFinancialScenario.test.ts` |
| Coin Sort fail → retry | RECOVERS | Stay-put + escalating hints | `FAILURE_RECOVERY.md` |
| Mastery quiz fail → quiz-only retry | RECOVERS | No full pad replay | `onboardingFailureAssist.test.ts` |

### B. Unusual order of actions

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| **Map before Piggy Talk** | ADAPTS | `opened_map` → guided `done`; `didMeetGuide` false; Bag re-hook | `onboardingFailureAssist.test.ts` |
| **Kira Take before Alma** | ~~SOFTLOCK~~ → **ADAPTS** | Was: Change quest never started → Paycheck locked. **Fixed:** `backfillCoveChangeObjectives` | `ftueRedTeam.test.ts` |
| **Kira before First Coins** | ADAPTS | Take + ledger valid; First Coins may stay open; Bag may still mention Penny | No forced rewind |
| **Alma before Penny** | ADAPTS | Both quests can start; Alma copy no longer assumes pouch | Content fix + test |
| **Talk Kira → defer → earn → return** | RECOVERS | Defer has no irreversible | — |
| **Soft Beat before Take** | ADAPTS | Optional; arm consumes on Take choice | — |

### C. Extreme values / early spending

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Spend at **$0 wallet** | RECOVERS | Real insufficient-funds reject; state unchanged | `EarnSpendModule` test |
| Partial earn → expensive buy | RECOVERS | Still broke; earn more works | `firstFinancialScenario.test.ts` |
| Max rapid earn taps | ADAPTS | Production wallet math; no cap exploit on spine | — |
| Coin Sort score **0** | RECOVERS | Fail overlay + tier hints | `minigameFail.ts` |

### D. Refusing suggested actions

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Esc **Ashore** chambers | ADAPTS | Skips literacy; Harbor still reachable | Document literacy loss |
| Esc **Piggy Talk** before choice | RECOVERS | ~~Was: advanced to `to_dock` without engagement~~ **Fixed:** `piggyTalkEngagedRef` | `IslandsApp.tsx` + test wire |
| Penny **Maybe later** | RECOVERS | No quest start | Content |
| Alma **Not right now** | RECOVERS | No Change quest start | Content |
| Skip hush / spectacle Esc | ADAPTS | Progress not lost; scar already saved | — |
| Decline Share PNG | ADAPTS | Optional social beat | — |

### E. Menu navigation out of order

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Open **map** during `meet_guide` | ADAPTS | Completes guided; carpet available | `harborAshore.test.ts` |
| **Outfitter / Capsule** during first meet | ADAPTS | Plaza walkable; not hero-taught | `onboardingNoAhead.test.ts` |
| Leave Cove mid-quest → Harbor | RECOVERS | Quest state persists | `hubCoveNav.test.ts` |
| Open Travel before `to_dock` | RECOVERS | Blocked by muted CTA until board | Ashore dock gate |
| Structure enter during FTUE | ADAPTS | Gated by chapter progress elsewhere | — |

### F. Saving / loading / close-reopen

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Mid **First Coins** reload | RECOVERS | Cove `currentIslandId` preserved | `hubCoveNav.test.ts` |
| Mid **hub guided** reload | RECOVERS | `normalizeHubGuidedIntro`; legacy → `to_dock` | `harborAshore.test.ts` |
| Take done but quest incomplete on disk | ~~SOFTLOCK~~ → **RECOVERS** | **Fixed:** `sanitizeIslandSave` → `reconcileFtueQuestProofs` | `ftueRedTeam.test.ts` |
| Corrupt save blob | RECOVERS | `sanitizeIslandSave` → fresh Harbor | `save.test.ts` |
| KV vs localStorage conflict | ADAPTS | Newer `updatedAt` wins | `save.ts` |

### G. Skipping / replaying

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Title / cast skip | ADAPTS | Faster entry | — |
| Replay Cove after Change | ADAPTS | Irreversible locked; NPC memory adapts | `worldMemory.test.ts` |
| Carpet boot after guided `done` | ADAPTS | Ceremony resets to `meet_guide` once | `harborAshore.test.ts` |
| QA seed signature loop | ADAPTS | Debug only | QA bridge |

### H. Rapid repeated input

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Spam **E** on NPC | RECOVERS | 2.8s talk cooldown | `IslandsApp.tsx` |
| Double-click Take choice | RECOVERS | Irreversible write-once | `worldMemory.ts` |
| Mash minigame Finish | ADAPTS | Last score wins | — |

### I. Partial progress

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| First Coins 1/3 objectives | RECOVERS | Reload keeps objectives | `hubCoveNav.test.ts` |
| Change quest started, no Take | RECOVERS | Kira defer valid | — |
| Scar without homecoming flag | ~~CONFUSED~~ → **RECOVERS** | **Fixed:** `reconcileCoveHomecoming` on load | `ftueQuestRecovery.ts` |
| Guided `done` + spectacle pending | RECOVERS | Gate opens when plaza ready | `signatureCinemaGate.test.ts` |

### J. Different financial strategies

| Case | Verdict | Notes | Fix / test |
|------|---------|-------|------------|
| Saver vs spender Take | ADAPTS | Real ±$/mo holdings | `firstFinancialScenario.test.ts` |
| Earn-heavy before Take | ADAPTS | Valid prep | — |
| Skip Coin Sort, still Take | ADAPTS | Take proof drives Change recovery | `ftueRedTeam.test.ts` |
| Borrow vs wait (Credit, later) | ADAPTS | Both documented valid | `TRANSFER_TASKS.md` |

---

## Fixes shipped (this pass)

| Issue | Was | Fix |
|-------|-----|-----|
| Kira-first Take | SOFTLOCK (Paycheck locked) | `backfillCoveChangeObjectives` + `reconcileFtueQuestProofs` on every save sync / sanitize |
| Missing homecoming after out-of-order Take | CONFUSED | `reconcileCoveHomecoming` when Change complete + scar + no celebration |
| Esc Piggy Talk advances guided | CONFUSED | `piggyTalkEngagedRef` — choice or end node required for `talked_guide` |
| Alma assumes Coin Pouch | CONFUSED | Copy neutralized in `coincraft-cove.islands.json` |
| Change quest after dialogue Take | SOFTLOCK edge | `maybeCompleteQuest(COVE_CHANGE)` after choice effects + reconcile |

---

## Non-goals (accepted ADAPTS)

- First Coins quest may remain incomplete if player skips to Take — **not a softlock**; Paycheck unlocks from Change proof.
- Map bypass skips Piggy meet — Bag soft re-hook only, not a block.
- Double Talk teach (Ashore + Harbor) when Ashore not skipped — copy redundancy, not rule error.
- Spectacle waits for guided complete — if player stays on `meet_guide`, reward delays until map or substantive Talk.

---

## Regression tests

```bash
npx vitest run src/islands/ftueRedTeam.test.ts
npx vitest run src/islands/onboardingFailureAssist.test.ts
npx vitest run src/islands/firstFinancialScenario.test.ts
npx vitest run src/islands/harborAshore.test.ts
npx vitest run src/islands/hubCoveNav.test.ts
npx vitest run src/islands/save.test.ts
```

---

## Future red-team targets

- Paycheck / Credit out-of-order Takes (mirror Cove proof reconcile)
- `plazaReady` stuck false blocking spectacle (3D load integration test)
- Simultaneous `q_cc_first_coins` + `q_cc_save_or_spend` coach priority in Coin Bag
- Automated E2E: map bypass cold path, Kira-first 3D shore

---

## Principle (repeat)

> Measure whether the player understands the **rule**, not whether they clicked the **script**.  
> If their valid choice differs from designer expectation, the simulation must **adapt** — not **rewind**.
