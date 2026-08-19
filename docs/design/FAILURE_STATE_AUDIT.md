# Capital — Failure State Audit

**Status:** Evidence inventory + design law for failure  
**Scope:** Player-facing fails, irreversible “hard” money outcomes, and anti-softlock fail-safes on shipped `main`  
**Companions:** `docs/ftue/FAILURE_RECOVERY.md` · `onboardingFailureAssist.ts` · `CONCEPT_MASTERY_PEDAGOGY.md` · `AI_GUIDE_MINIMUM_INTERVENTION.md` · `DECISION_PREVIEW_ARCHITECTURE.md` · `FINANCIAL_FEEDBACK_VOCABULARY.md` · `CAUSAL_TIME_SYSTEM.md`

**Laws**

1. **Early failure is inexpensive** — FTUE / first Coin Sort / EarnSpend “not enough” cost time and hints, not Freedom or permanent CF (except the intentional first Take).  
2. **Consequences grow with comprehension** — after Cove Change / CF literacy / Credit, world pressure (weather, streak, Ordeal) may bite harder.  
3. **Not every failure is reversible** — Takes, liabilities, haste scars stick; that *is* the lesson.  
4. **Players must see decision → outcome** — preview + hush + Piggy/Plinth/Pay Day because-lines; never silent soft-lock.

---

## 1. Field legend

| Field | Meaning |
|-------|---------|
| **cause** | What triggers the fail / hard outcome |
| **warning** | Signal before or at the moment of risk |
| **consequence** | What changes in state / UI |
| **learning value** | What judgment it teaches |
| **recovery route** | How to continue productively |
| **time to retry** | Immediate / next lap / never / N/A |
| **alternative strategy** | Other valid approaches (guide must not force one early) |
| **reversible?** | Can the outcome be undone? |
| **cost tier** | `T0` free · `T1` time/retry · `T2` coins · `T3` CF/streak · `T4` irreversible identity/economy |

---

## 2. Catalog

### A. Practice & pad fails (mostly reversible)

#### F-MG — Minigame / quest threshold miss

| | |
|--|--|
| **cause** | `success === false` or score &lt; quest `scoreThreshold` (Coin Sort, Inbox Storm, many arcade pads) |
| **warning** | “Clear at N+ pts”; round-over “Harbor will say if this clears”; assist ladder |
| **consequence** | Fail overlay; no quest clear; board consolation +2 coins; difficulty may ease |
| **learning value** | Standards exist; miss ≠ shame; stay and improve |
| **recovery route** | Retry same pad; Walk stay-put (structure: stay in interior) |
| **time to retry** | Immediate |
| **alternative strategy** | Different module tactics; easier profile; practice then return |
| **reversible?** | Yes (progress). Coins consolation kept |
| **cost tier** | `T1` (early) → `T2` light on board |

#### F-STRUCT — Structure pad miss

| | |
|--|--|
| **cause** | Same as F-MG with `minigameSource === "structure"` |
| **warning** | Same |
| **consequence** | Overlay “Stay in the structure”; no Harbor dump |
| **learning value** | Failure doesn’t exile you from the money machine |
| **recovery route** | Retry / poke Soft Beat / leave vault when ready |
| **time to retry** | Immediate |
| **alternative strategy** | Soft Beat peek then retry; leave and return later |
| **reversible?** | Yes |
| **cost tier** | `T1` |

#### F-QUIZ — Mastery quiz wrong / closed

| | |
|--|--|
| **cause** | Wrong MCQ or dismiss before all-correct |
| **warning** | “ALL answers correct… no skipping”; per-row explain |
| **consequence** | Overlay “Retry quiz”; pad may already be kinesthetic-cleared; no coin hit |
| **learning value** | Vocabulary check (school-shaped — keep off spine meaning) |
| **recovery route** | Retry quiz; Walk stay-put |
| **time to retry** | Immediate |
| **alternative strategy** | Re-read explains; replay pad if offered |
| **reversible?** | Yes |
| **cost tier** | `T1` |

#### F-EARN — EarnSpend insufficient funds

| | |
|--|--|
| **cause** | Spend action with wallet &lt; cost |
| **warning** | Mid-round toast “Not enough”; clear earn/spend share wallet |
| **consequence** | Action refused; wallet unchanged |
| **learning value** | Liquidity / on-hand |
| **recovery route** | Earn then spend |
| **time to retry** | Immediate after earn |
| **alternative strategy** | Cheaper buy; skip spend |
| **reversible?** | N/A (no bad write) |
| **cost tier** | `T0`–`T1` |

#### F-SHOP — Harbor shop not enough coins

| | |
|--|--|
| **cause** | Buy with pouch &lt; price |
| **warning** | Price shown; refuse reason |
| **consequence** | No purchase |
| **learning value** | Cash vs want |
| **recovery route** | Pay Day / earn / cheaper item |
| **time to retry** | When pouch allows |
| **alternative strategy** | Wait; prioritize deals over polish |
| **reversible?** | N/A |
| **cost tier** | `T0` |

#### F-EVENT — EventDeck bad branch (session)

| | |
|--|--|
| **cause** | Worse card choice in Inbox / Credit decks |
| **warning** | Card copy (fees, APR) |
| **consequence** | Session money/score/debt only (rarely persists to Voyager Ledger) |
| **learning value** | Tradeoff literacy in a safe sandbox |
| **recovery route** | Finish round; overlay if score threshold miss |
| **time to retry** | Immediate (retry minigame) |
| **alternative strategy** | Other branch next run |
| **reversible?** | Session yes |
| **cost tier** | `T1` (early/safe) |

---

### B. Board pressure (coins & CF — mid game)

#### F-BILL — Board bill

| | |
|--|--|
| **cause** | Land on bill space |
| **warning** | Space flavor |
| **consequence** | Pouch −amount |
| **learning value** | Expenses hit liquidity |
| **recovery route** | Coin spaces / Pay Day / minigames |
| **time to retry** | Next lap (hazard recurs) |
| **alternative strategy** | Capsules; route planning |
| **reversible?** | Coin loss kept |
| **cost tier** | `T2` |

#### F-COLLECT — Board Collector fee

| | |
|--|--|
| **cause** | Land on collector without shield/bailout |
| **warning** | Labels; items can pre-arm |
| **consequence** | Pouch −12 (typical) |
| **learning value** | Emergencies / preparation |
| **recovery route** | Earn; buy Emergency Ledger / Bailout |
| **time to retry** | Next collector land |
| **alternative strategy** | Hold shield; avoid space when possible |
| **reversible?** | Coin loss kept |
| **cost tier** | `T2` |

#### F-RAID — Rival raid on you

| | |
|--|--|
| **cause** | Rival Fee Raid unless shielded |
| **warning** | Board fiction |
| **consequence** | Pouch loss |
| **learning value** | Risk / protection toys |
| **recovery route** | Shield item; earn back |
| **time to retry** | Next AI raid |
| **alternative strategy** | Stay liquid; shield |
| **reversible?** | Coin loss kept |
| **cost tier** | `T2` |

#### F-TRAP — Debt Trap liability

| | |
|--|--|
| **cause** | Land on liability space → auto Snack Tab / Gadget Loan |
| **warning** | Flavor only — **no confirm** (gap for literacy) |
| **consequence** | Permanent −$/mo holding; CF↓; streak/weather risk |
| **learning value** | Liabilities / future obligation (harsh) |
| **recovery route** | Raise income assets; cannot remove holding today |
| **time to retry** | N/A (already applied); other traps if unused |
| **alternative strategy** | Avoid spaces; build CF buffer first |
| **reversible?** | **No** |
| **cost tier** | `T3`–`T4` — should appear **after** CF concept exposure |

---

### C. Irreversible money identity (intentional hard fails)

#### F-TAKE-TREAT — Cove treat before jar

| | |
|--|--|
| **cause** | Talk choice `spend` on `cove_save_vs_spend` |
| **warning** | “This Take sticks”; footprint preview −$5/mo when shown |
| **consequence** | Irreversible + spender scar + Treat Tab liability −$5/mo forever |
| **learning value** | Opportunity cost · Holds vs Owes · Harbor remembers |
| **recovery route** | Deals/assets; live with plaque; Piggy names it without shame |
| **time to retry** | **Never** (same key) |
| **alternative strategy** | Jar path; defer “Maybe later” then jar |
| **reversible?** | **No** |
| **cost tier** | `T4` — first expensive lesson; preview required |

#### F-TAKE-GLITTER — Paycheck glitter path

| | |
|--|--|
| **cause** | `paycheck_protect_vs_spend` spend |
| **warning** | Copy names gossip; **weak CF warning** (no ledger Δ today) |
| **consequence** | Scar + stance; chapter still clears |
| **learning value** | Identity/scar (economy thin — **gap**) |
| **recovery route** | Continue spine; Piggy/Plinth |
| **time to retry** | Never |
| **alternative strategy** | Protect path |
| **reversible?** | No (scar) |
| **cost tier** | `T4` identity / `T1` economy — improve stakes |

#### F-TAKE-HASTE — Credit borrow / haste

| | |
|--|--|
| **cause** | `credit_borrow_vs_wait` borrow |
| **warning** | Rex framing; Scanner gate |
| **consequence** | Haste scar; storm weather if CF &lt; 20; shop prices softer |
| **learning value** | Risk · wait vs haste · weather BECAUSE |
| **recovery route** | Raise CF ≥20 to ease storm; scar remains |
| **time to retry** | Never |
| **alternative strategy** | Wait path |
| **reversible?** | Scar no; weather yes with CF |
| **cost tier** | `T3`–`T4` — late game |

#### F-DIGRESS — Digression impulse / lean scars

| | |
|--|--|
| **cause** | Shell want / tip rush / collector lean / era rush |
| **warning** | Talk labels |
| **consequence** | Tone scar; shelf fill; little/no CF |
| **learning value** | Thin — pace vs rush |
| **recovery route** | Continue; optional other digressions |
| **time to retry** | Never same scar id |
| **alternative strategy** | Patience / listen forks |
| **reversible?** | No |
| **cost tier** | `T1`–`T2` narrative |

---

### D. Freedom & weather (graduated)

#### F-STREAK — Escape streak reset

| | |
|--|--|
| **cause** | Harbor Pay Day with CF &lt; $30 while tracking escape |
| **warning** | Ledger HUD Seal chase · $30/mo × 3 |
| **consequence** | `positivePaydayStreak = 0`; Freedom delayed |
| **learning value** | Sustained cashflow, not one good month |
| **recovery route** | Raise CF; complete 3 qualifying Pay Days again |
| **time to retry** | Next Pay Day |
| **alternative strategy** | Assets over polish; Wait for right deal |
| **reversible?** | Streak yes; Seal once earned permanent |
| **cost tier** | `T3` — after CF taught |

#### F-STORM — CF storm / tight sky

| | |
|--|--|
| **cause** | CF &lt; 0, or haste/risk scar with CF &lt; 20 |
| **warning** | Weather coach / Bag loop line |
| **consequence** | Fog; shop mult 0.85–0.92; mood pressure |
| **learning value** | Ledger ↔ world |
| **recovery route** | Raise CF; note scar may keep storm band until CF≥20 |
| **time to retry** | Continuous (state) |
| **alternative strategy** | Jar/booth; avoid new liabilities |
| **reversible?** | Weather yes |
| **cost tier** | `T2`–`T3` |

#### F-NEG-PAY — Negative CF Pay Day

| | |
|--|--|
| **cause** | Pay Day when net CF &lt; 0 |
| **warning** | Ledger drain display |
| **consequence** | Thin/negative pouch settlement; streak break likely |
| **learning value** | Expenses vs income |
| **recovery route** | Cut drains / add assets |
| **time to retry** | Next Pay Day |
| **alternative strategy** | Deal Wait until buffer |
| **reversible?** | Partial |
| **cost tier** | `T3` |

---

### E. Softlocks & fail-safes (not “fails,” but failure of presentation)

#### F-QUIET — Quiet homecoming Carpet risk

| | |
|--|--|
| **cause** | Plaza strip / missing travel chrome until Piggy |
| **warning** | Quiet chip; Talk CTA |
| **consequence** | Possible travel friction (myth fallback keeps Carpet) |
| **learning value** | Presence — must not brick voyage |
| **recovery route** | Talk Piggy; myth Carpet; map |
| **time to retry** | N/A |
| **alternative strategy** | — |
| **reversible?** | N/A |
| **cost tier** | `T0` if fixed; treat unresolved softlock as **bug** |

#### F-3D — Canvas fail

| | |
|--|--|
| **cause** | WebGL/hung load |
| **warning** | Loading veil → Enter |
| **consequence** | Myth / flat path |
| **learning value** | Reliability |
| **recovery route** | Fallback CTAs |
| **time to retry** | Immediate enter |
| **reversible?** | N/A |
| **cost tier** | `T0` |

#### F-SAVE — Corrupt save sanitize

| | |
|--|--|
| **cause** | Poison `island_save_v1` |
| **warning** | None |
| **consequence** | Defaults / possible progress loss if total parse fail |
| **learning value** | — (platform) |
| **recovery route** | Fresh Harbor boot |
| **time to retry** | N/A |
| **reversible?** | Progress may be lost |
| **cost tier** | Platform — minimize |

#### F-XFER — Transfer “fail”

| | |
|--|--|
| **cause** | Conceptually: wrong principle on new surface |
| **warning** | None today (any irreversible counts success — **gap**) |
| **consequence** | Not player-facing demotion |
| **learning value** | Should teach without spoiling |
| **recovery route** | Dignity retry on analogous fork |
| **time to retry** | Immediate next opportunity |
| **alternative strategy** | Valid multi-strategies |
| **reversible?** | Take still sticks |
| **cost tier** | Design: keep irreversible; fix metrics so glitter≠auto “success” if principle failed |

#### F-TALK — Talk Battle fail

| | |
|--|--|
| **cause** | None — no lose state |
| **note** | Leave abandons without Take write |

---

## 3. Graduated cost design (target)

| Comprehension stage | Allowed cost tiers | Examples |
|---------------------|--------------------|----------|
| Ashore / first Harbor | `T0`–`T1` | Muted CTA, ring miss, EarnSpend refuse |
| First Cove earn pads | `T1` (+ light `T2`) | Coin Sort miss, board bill |
| **First irreversible Take** | `T4` with **strong warning + preview** | Jar vs treat |
| Post–Cove CF literacy | `T2`–`T3` | Streak, weather, deals |
| Debt Trap / multi liabilities | `T3`–`T4` | After player has seen Owes vocabulary |
| Credit Ordeal | `T3`–`T4` risk/weather | Haste scar |

**Do not** put permanent liability auto-traps before CF HUD exists.  
**Do not** make early Coin Sort wipe Freedom.  
**Do** keep Takes irreversible once previewed.

---

## 4. Causal clarity requirements

Every fail/hard outcome must support:

| Link | Mechanism |
|------|-----------|
| Warning | Preview CERTAIN rows, clear-at, HUD chase, Talk “sticks” |
| Consequence | Vocab: Owes / Risk / drain / streak reset |
| Explanation | Piggy / Plinth / Pay Day / weather because-line |
| Guide | Escalate 1→4 without naming optimal Take (`FAILURE_RECOVERY` · AI MNI) |

If consequence exists without explanation → **bug**.  
If explanation without consequence → **worksheet STOP**.

---

## 5. Priority gaps

1. Debt Trap: add confirm or stronger Owes preview (inexpensive early → expensive late).  
2. Paycheck glitter: add real CF/obligation or stop calling it economic failure.  
3. Transfer metrics: don’t treat every irreversible as principle success.  
4. Quiet homecoming: keep Carpet walkable (navigability).  
5. Liability removal path (recovery) — optional later; until then teach “still owes.”  

---

## 6. Success criteria

- New players describe first pad miss as “try again,” not “I broke the game.”  
- After treat Take, they can say tab/Pay Day/Harbor remembered — decision→outcome.  
- Freedom streak break feels fair given $30 HUD.  
- No softlock without myth Carpet / Enter Harbor.  
- Late haste storm reads as consequence of borrow, not random night.
