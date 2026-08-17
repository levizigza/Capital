# Onboarding Failure & Recovery

**Date:** 2026-08-17  
**Scope:** Title → Cast → Ashore → Harbor meet → Cove First Coins + Take → hush → carpet home → spectacle → Piggy homecoming → free roam  
**Law:** Escalate assist ATTEMPT 1→4. Never reveal optimal strategy early. Prevent softlocks, irreversible tutorial losses, long replays, ambiguous failure, and failure unrelated to the learning objective.  
**Related:** `FTUE_FRICTION_MAP.md` · `FEEDBACK_AUDIT.md` · `PERCEPTUAL_LITERACY.md` · `FIRST_FINANCIAL_SCENARIO.md`

---

## Escalation ladder (global)

| Attempt | Mode | Player-facing |
|---------|------|----------------|
| **1** | Natural attempt | Existing world signal only (clear-at, muted CTA, “Not enough”) |
| **2** | Highlight relevant information | Emphasize the same signal (amber strip, Bag tip pulse, Touch pad) |
| **3** | Conceptual hint | Name the *idea* (earn/spend share a wallet; score vs clear line) — not the button sequence |
| **4** | Explicit assistance | Name verbs/places to try — still no “correct Take” or optimal Coin Sort order |

Telemetry on every escalate: `hint_escalated` with `failureKind`, `attempt`, `assistChannel`, `recovery`.  
On every fail: `fail_reason` + `quest_failed_attempt` (when quest-tied).

---

## Failure catalog

For each: WHAT · WHY · SIGNALS · NOTICE · TRY DIFFERENTLY · PRESERVE · RESET

### F-ASH-01 Fantasy Continue before poke
| | |
|--|--|
| WHAT | Continue stays muted |
| WHY | Gate needs ≥1 organ poke |
| SIGNALS | Muted CTA · toy nudge pulse |
| NOTICE | Toy ring + organ SFX |
| TRY | Poke Memory/Coin toy |
| PRESERVE | Chamber progress |
| RESET | Soft — poke anytime; Esc skips Ashore |

### F-ASH-02 Walk rings uncleared / no touch pad *(S0)*
| | |
|--|--|
| WHAT | Cannot claim rings; no auto-advance |
| WHY | Must claim all markers; TouchWalkPad was gated off under reduced motion |
| SIGNALS | `n/3 rings` |
| NOTICE | Emissive bob → fade + `walk_stop` |
| TRY | WASD; on coarse pointer use walk pad (now shown even when reduced) |
| PRESERVE | Claimed rings |
| RESET | Soft stay; Esc = skip literacy |

**Assist:** A1 natural rings · A2 show TouchWalkPad on coarse · A3 “Step into glowing rings” · A4 Bag/gate line names nearest verb (no Esc cheat)

### F-ASH-03 Talk E outside pink ring
| | |
|--|--|
| WHAT | E ignored |
| WHY | `nearTalk` gate |
| SIGNALS | “Walk to Piggy” vs “Press E” |
| NOTICE | Pink ring |
| TRY | Enter ring then E/button |
| PRESERVE | Soft |
| RESET | Soft |

### F-ASH-04 Dock Launch without boarding
| | |
|--|--|
| WHAT | Launch muted |
| WHY | `carpetBoarded` gate |
| SIGNALS | “Board Cove first” · dock nudge |
| NOTICE | Painting “Boarded” |
| TRY | Tap Cove painting |
| PRESERVE | Soft |
| RESET | Soft |

### F-ASH-05 Esc skip Ashore *(literacy loss)*
| | |
|--|--|
| WHAT | Entire teach skipped |
| WHY | Veteran Esc path |
| SIGNALS | None post-skip |
| NOTICE | — |
| TRY | Harbor Piggy re-hooks Talk |
| PRESERVE | Intentional skip |
| RESET | Cannot redo Ashore without full boot |

**Telemetry:** `tutorial_step` `{ step, action: "skip" }`

### F-HAR-01 Piggy missed / map opened first
| | |
|--|--|
| WHAT | Guided completes without Keeper Talk |
| WHY | `opened_map` advances from `meet_guide` → `done` |
| SIGNALS | Bag “Talk Piggy”; stalls still walkable |
| NOTICE | Piggy wave / pulse |
| TRY | Talk Piggy (optional); homecoming force Talk later |
| PRESERVE | Map allowed (no hard block) |
| RESET | Soft re-hook via Bag + `didMeetGuide` |

**Assist:** A1 natural · A2 Bag “Fountain first” · A3 after bypass tip · A4 quiet homecoming Talk CTA  
**Telemetry:** `core_loop_beat` `{ beat: "piggy_bypassed", via: "opened_map" }`

### F-COV-01 First Coins deferred (“Maybe later”)
| | |
|--|--|
| WHAT | Quest never starts |
| WHY | Dialogue defer |
| SIGNALS | “No rush…” |
| NOTICE | Bag still tips Penny |
| TRY | Re-talk Penny |
| PRESERVE | Soft defer (valid) |
| RESET | Soft |

### F-COV-02 EarnSpend insufficient
| | |
|--|--|
| WHAT | Spend rejected; wallet unchanged |
| WHY | `wallet < cost` |
| SIGNALS | “Not enough money!” · disabled spends |
| NOTICE | Wallet · earn +$ labels |
| TRY | Earn first |
| PRESERVE | Session state |
| RESET | Soft same round |

**Assist:** A1 natural toast · A2 highlight wallet line · A3 “earn and spend share one wallet” · A4 name earn jobs exist (no optimal order)

### F-COV-03 Coin Sort below threshold
| | |
|--|--|
| WHAT | Finish succeeds locally; quest fail overlay |
| WHY | Score < profile threshold |
| SIGNALS | Clear at N+ · fail card score vs need |
| NOTICE | Score HUD vs clear-at |
| TRY | Retry stay-put |
| PRESERVE | Shore stay; no Harbor dump |
| RESET | Soft retry; fail counter++ |

**Assist:** A1 clear-at only · A2 fail amber highlight Clear at · A3 “score grows when change matches the ask” · A4 “Earn jobs · match change · Finish → See result” (no pile order)

### F-COV-04 Mastery quiz fail after kinesthetic clear *(long replay)*
| | |
|--|--|
| WHAT | Quiz miss → fail overlay; previously discarded clear |
| WHY | Mastery gate before `completedMinigames` write |
| SIGNALS | Quiz UI then fail |
| NOTICE | Quiz prompts (literacy) |
| TRY | **Retry quiz only** (preserve kinesthetic clear pending) |
| PRESERVE | Pending mastery snapshot · score · timeline |
| RESET | Soft quiz retry — not full Coin Sort replay |

### F-COV-05 Minigame abandon
| | |
|--|--|
| WHAT | Leave mid-round; no quest progress |
| WHY | Abandon path |
| SIGNALS | Return to shore |
| NOTICE | Weak |
| TRY | Re-enter pad |
| PRESERVE | Structure stay-put |
| RESET | Soft |

### F-COV-06 Alma / Kira defer
| | |
|--|--|
| WHAT | Take / Change deferred |
| WHY | Maybe later |
| SIGNALS | Clear defer copy |
| NOTICE | Bag tip |
| TRY | Return when ready |
| PRESERVE | Valid path |
| RESET | Soft |

### F-TAKE-01 Irreversible Take commit
| | |
|--|--|
| WHAT | Jar or treat sticks forever this save |
| WHY | Learning objective (signature) |
| SIGNALS | Footprint subline · hush · Plinth echo |
| NOTICE | Keep/drain before decide |
| TRY | Maybe later *before* commit only |
| PRESERVE | Scar + ledger footprint |
| RESET | New save only — **not** a softlock |

### F-TAKE-02 Esc hush early
| | |
|--|--|
| WHAT | Miss mark captions |
| WHY | Overlay Esc |
| SIGNALS | May miss footprint |
| NOTICE | Bag pier coach after |
| TRY | Watch mark; Carpet home still available |
| PRESERVE | Scar + chapter quiet |
| RESET | Cannot re-watch hush |

### F-HAR-02 Spectacle gated
| | |
|--|--|
| WHAT | “Harbor felt” cinema waits |
| WHY | Guided incomplete / plaza not ready / Talk open |
| SIGNALS | Weak wait |
| NOTICE | Bag / quiet CTA |
| TRY | Finish guided or close Talk |
| PRESERVE | Scar stored |
| RESET | Soft wait |

### F-HAR-03 Chapter quiet stuck feeling
| | |
|--|--|
| WHAT | Shore chrome stripped; magnets hidden |
| WHY | Quiet pending until Carpet home |
| SIGNALS | Carpet home CTA · Bag pier |
| NOTICE | Desaturated shore |
| TRY | Board pier Carpet |
| PRESERVE | Clear quiet on home |
| RESET | Soft if CTA seen |

### F-FREE-01 Choice paralysis after Change
| | |
|--|--|
| WHAT | Too many unlocks |
| WHY | Cove Change opens Paycheck + sides |
| SIGNALS | Bag “Next painting: Paycheck” |
| NOTICE | One horizon tip |
| TRY | Follow Bag main track |
| PRESERVE | Digressions allowed |
| RESET | Soft |

---

## Prevention rules (shipped / required)

| Risk | Rule |
|------|------|
| Softlock | Always Esc/Leave or stay-put Retry; TouchWalkPad on coarse during Ashore walk/talk even if reduced motion |
| Irreversible tutorial loss | Mastery fail → quiz-only retry; kinesthetic clear preserved in `pendingMastery` |
| Long replay | Fail overlays stay on shore; never dump to Harbor |
| Ambiguous failure | Fail card names score vs need; escalate hint tiers; footprint on Take |
| Unrelated to learning | Digression / Soft Beat optional; Maybe later valid; both Takes teach |

---

## Telemetry contract

| Event | When | Key payload |
|-------|------|-------------|
| `fail_reason` | Minigame / mastery fail | `reason`, `attempt`, `hintLevel`, `failureKind` |
| `quest_failed_attempt` | Quest-tied fail | `questId`, `attempt` |
| `hint_escalated` | Assist tier ≥2 shown | `failureKind`, `attempt`, `assistChannel`, `hintLevel` |
| `minigame_retry` | Retry pressed | `afterMasteryFail?`, `quizOnly?` |
| `tutorial_step` | Ashore enter/complete/skip | `step`, `action` |
| `core_loop_beat` | Piggy bypass | `beat: "piggy_bypassed"`, `via` |
| `core_loop_beat` | Recovery | `beat: "failure_recovered"`, `failureKind`, `via` |

---

## Implementation status

| Item | Status |
|------|--------|
| `docs/ftue/FAILURE_RECOVERY.md` | **Done** |
| Escalating Coin Sort / mastery fail hints | **Done** — `onboardingFailureAssist` → `minigameFailCopy` |
| Fail telemetry every tier + `quest_failed_attempt` | **Done** |
| Mastery quiz-only retry | **Done** |
| Ashore TouchWalkPad under reduced + coarse | **Done** |
| Piggy bypass flag + Bag tip + telemetry | **Done** |
| EarnSpend escalating insufficient copy | **Done** |
| Ashore `tutorial_step` | **Done** |
| Spectacle wait Bag tip | Follow-up |
| Alma pouch / 3D requiredItems parity | Follow-up |

Code: `onboardingFailureAssist.ts` · `minigameFail.ts` · `IslandsApp.tsx` · `AshoreComprehensionTutorial.tsx` · `storyBible.ts` · `coinBagBuddy.ts` · `EarnSpendModule.ts`
