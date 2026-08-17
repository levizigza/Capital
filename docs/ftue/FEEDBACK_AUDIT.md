# Opening experience — Feedback Audit

**Date:** 2026-08-17  
**Scope:** Title/Cast/Ashore → Harbor meet → Cove First Coins + Take → hush → carpet home → spectacle → Piggy homecoming  
**Model:** PLAYER INPUT → IMMEDIATE RESPONSE → STATE CHANGE → VISUAL FEEDBACK → OPTIONAL AUDIO/HAPTIC → DELAYED CONSEQUENCE  
**Rule:** Do not rely exclusively on color. Do not add decorative motion that hides numbers/captions.

---

## Financial dimensions legend

| Code | Meaning |
|------|---------|
| **CC** | Current cash (pouch / session wallet) |
| **CF** | Cash flow (/mo) |
| **IMM** | Immediate effect |
| **FUT** | Future effect |
| **RISK** | Risk |
| **OC** | Opportunity cost |
| **OBL** | Obligation |
| **UP** | Potential upside |

---

## Action inventory (opening path)

### Ashore

| Action | Input → … → Delayed | Confusion risks | Financial dims |
|--------|---------------------|-----------------|----------------|
| Poke organ toy | Tap → organ SFX + lit → `fantasyPoked` → ring bright → organ SFX → Continue unlocks | “Did that work?” mild if no SFX | N/A |
| Continue before poke | Tap muted → toy nudge → nudge flag → pulse → none → still blocked | “Why won’t it go?” | N/A |
| Claim walk ring | Enter radius → claim → `claimed[]` → ring fades + `n/3` → **no SFX** → auto-advance | Soft “Did that work?” without audio | N/A |
| Talk near+E | Near + E → memory SFX → `talked` → gate copy → SFX → advance | Clear | N/A |
| Board Cove painting | Tap → coin SFX → `carpetBoarded` → “Boarded” → SFX → Launch | Clear | N/A |

### Harbor first meet

| Action | Feedback chain | Confusion risks | Financial |
|--------|----------------|-----------------|-----------|
| Walk plaza | Move → pose → guided step → presence line; **Wealth/Ledger hidden** → — | “Where is my money?” intentional quiet | CC/CF **hidden** |
| Talk Piggy | Talk CTA → Talk Battle + juice → dialogue → listen/choose → advance guided | Clear for social verb | N/A |
| Talk choice | Choice → confirm SFX + juice → effects → next node | Effects often invisible | Depends on effect |

### Cove — earn / sort

| Action | Feedback chain | Confusion risks | CC | CF | IMM | FUT | RISK | OC | OBL | UP |
|--------|----------------|-----------------|----|----|-----|-----|------|----|-----|-----|
| Start First Coins | Choice → quest start → state → talk only | “Did quest start?” | — | — | weak | — | — | — | — | — |
| Collect pouch | Interact → inventory → pad gone | **“Did I get it?”** no toast/SFX | silent | — | weak | Alma gate | — | — | — | — |
| EarnSpend earn | Button → wallet↑ + toast → session money | Clear in-session | session | — | yes | — | — | — | — | score |
| EarnSpend broke spend | Button → “Not enough” → no change | Clear try-again | session | — | yes | — | soft | — | — | — |
| Finish Coin Sort | Finish → clear/fail → completedMinigames | Threshold **hidden until fail** | — | — | fail overlay | — | — | — | — | — |
| Quest reward coins | Auto → `totalCoins`↑ → **no toast** | **“What changed?”** | silent | — | missing | — | — | — | — | — |

### Cove — Take (signature)

| Action | Feedback chain | Confusion risks | CC | CF | IMM | FUT | RISK | OC | OBL | UP |
|--------|----------------|-----------------|----|----|-----|-----|------|----|-----|-----|
| Alma foreshadow | Talk → short line → quest | Mild | — | — | — | OC in words | — | words | — | — |
| Alma / Kira defer | Maybe later → end | Clear | — | — | — | — | — | — | — | — |
| **Kira jar/treat** | Choice → irreversible + scar + **`applyCoveTakeLedgerFootprint`** → hush | **“What changed?”** — CF written, HUD off | jar item silent | **written, not shown** | cinema | spectacle | — | choice copy | treat tab silent | jar hold silent |
| Take hush | Auto → captions + CTA → quiet | “…” phase ambiguous | hidden | hidden | myth | carpet | — | — | — | — |
| Carpet home | CTA → travel → Harbor | Clear verb | — | — | — | spectacle | — | — | — | — |

### Harbor return

| Action | Feedback chain | Confusion risks | Financial |
|--------|----------------|-----------------|-----------|
| Scar spectacle | Auto → cinema → plaque remembered | Strong myth; weak math | CF still quiet |
| Piggy homecoming | Forced Talk → bond/quiet clear | Presence OK | May name scar, not ±$/mo |
| Ledger HUD after quiet | Compact CF | Opens late; color-heavy emerald/rose | CF shown late |

---

## Player questions — hotspots

| Question | Worst moments |
|----------|----------------|
| Did that work? | Pouch pickup; quest start; walk ring (no SFX); Take (math invisible) |
| What changed? | Quest coin rewards; Take ledger footprint; session wallet vs Harbor coins |
| Why did that happen? | Weather after spend Take; fail overlay threshold surprise |
| Good or bad? | Jar vs treat — narrative only until late HUD |
| What should I watch? | Coin Sort clear score; Take hush “…”; quiet chrome hiding Wealth |

---

## Severity ranking (opening)

| # | Sev | Gap |
|---|-----|-----|
| 1 | **S0** | Take writes real CF footprint but never shows ±$/mo at decision/hush |
| 2 | **S0** | Item get (pouch / jar) silent — pad vanishes only |
| 3 | **S1** | Quest coin rewards silent |
| 4 | **S1** | Coin Sort clear threshold hidden until fail |
| 5 | **S1** | Three money concepts (session / pouch / ledger) unbridged |
| 6 | **S2** | Walk-ring claim has no audio |
| 7 | **S2** | Ledger polarity leans on color |
| 8 | **S3** | Juice bursts can compete with caption reading |

---

## Priority fixes (this pass)

1. **Take footprint strip** — text + numbers on hush mark/line: `Cashflow +$5/mo · Cove Jar Hold` / `−$5/mo · Cove Treat Tab` (not color-only).  
2. **Item get confirm** — aria-live + short toast + organ SFX on pouch/jar.  
3. **Quest reward toast** — `+N coins · quest name`.  
4. **Coin Sort clear-at-N** — show threshold in minigame chrome from quest objective.  
5. **Walk claim SFX** — `walk_stop` or coin tick on ring claim.  
6. **Ledger HUD labels** — prefer `+$/mo` / `−$/mo` words over color alone when shown.

Deferred: full wallet-bridge lecture; spectacle afterglow Bag line (follow-up).

---

## Non-goals

- Rainbow particles that cover captions  
- Color-only good/bad  
- New fake tutorial meters  

## Implementation status

| Fix | Status |
|-----|--------|
| Take hush footprint strip | **Done** — `takeFootprintFeedbackLine` → `TakeHushOverlay` |
| Item get toast + SFX | **Done** — toast + `organ_coin` on collect |
| Quest reward toast | **Done** — coin/XP grant surfaces toast |
| Coin Sort “Clear at N+ pts” | **Done** — from quest `scoreThreshold` |
| Walk ring claim SFX | **Done** — `walk_stop` on chamber claim |
| Ledger HUD keep/drain wording | **Done** — words + numbers, not color-only |
| Piggy Talk first-meet stall strip | Follow-up |
| Spectacle afterglow Bag line | Follow-up |
| Share telemetry + feedback | Follow-up |
| Wallet-bridge / Cove Change copy | Follow-up |

Code: `TakeHushOverlay` · `IslandsApp` collect/quest toasts · `ModularMinigame` clear hint · `AshoreComprehensionTutorial` claim SFX · `VoyagerLedgerHud` wording.
