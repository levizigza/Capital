# Capital — System Interaction Matrix

**Status:** Design analysis (docs only)  
**Canon:** `MASTER_DESIGN_AUDIT.md` · `DECISION_AUDIT.md` · `STRONGEST_RECURRING_LOOP.md` · `CAPITAL_DESIGN_CONSTITUTION.md`  
**Rule:** Prefer interactions that raise **meaningful decisions** without new UI surfaces or currencies.  
**Prototype policy:** Prototype **only the strongest chain first** (see §5). No build in this document.

---

## 1. Systems on both axes

Short codes used in the matrix:

| Code | System | Player-facing primitive |
|------|--------|-------------------------|
| **L** | Voyager Ledger (monthly CF + holdings) | Cashflow number, assets/liabilities |
| **P** | Pouch coins | WealthHud / spend fuel |
| **F** | Freedom streak / Seal | Escape paycheck-to-paycheck |
| **W** | Harbor weather + shop prices | Sky mood, price multiplier |
| **M** | Memory (Takes, scars, Plinth, irreversible) | Plaques, cinema, Harbor felt |
| **S** | Soft Beat arm | Peek → Talk suffix (timed) |
| **Y** | Pay Day (ritual / board) | Pouch += CF; streak tick |
| **O** | Opportunities / Harbor deals | Accept vs Pass (commit under scarcity) |
| **H** | Harbor shop (capsule, carpet polish, plaza pass) | Cosmetic / board toys |
| **B** | Buddy layer (Piggy Talk + Coin Bag) | Interpretation / next verb |
| **U** | Money Structures (Jar/Bank/Tower/Keep) | Enter, pads, Soft Beat sites |
| **C** | Carpet / travel / map | Sail spine + side shores |
| **Q** | Mastery quizzes | All-correct clears → Credit gate |
| **R** | Social (Share PNG, Witness, Family Room) | Local myth only |
| **X** | Parallel tracks (XP, skillStats, stance counters) | Mostly hidden / write-only |

*(Party board beyond deals is treated as delivery rail for **O** / **Y** / hazards — not a separate currency.)*

---

## 2. Classification legend

| Class | Meaning |
|-------|---------|
| **NO** | No meaningful wired interaction on shipped `main` |
| **CUR** | Current interaction exists in code/content |
| **POT** | High-value potential using existing primitives (no new currency/UI chrome) |
| **DAN** | Dangerous — splits truth, fake agency, quiz-wall, or extrinsic sugar |

Direction in cells is **row → column** (A affects B). Diagonal is `·`.

---

## 3. Pairwise matrix (row affects column)

Compact grid. Read: cell `(row, col)` = how **row** affects **col**.

```
     L    P    F    W    M    S    Y    O    H    B    U    C    Q    R    X
L    ·   CUR  CUR  CUR  CUR  NO   CUR  CUR  CUR  CUR  NO   NO   NO   NO   NO
P    CUR  ·   CUR  NO   NO   NO   CUR  CUR  CUR  NO   NO   CUR  NO   NO   CUR
F    NO   CUR  ·   NO   NO   NO   NO   NO   NO   CUR  NO   CUR  CUR  CUR  NO
W    NO   CUR  NO   ·   POT  NO   NO   POT  CUR  CUR  NO   NO   NO   NO   NO
M    CUR  NO   NO   CUR  ·   CUR  NO   POT  NO   CUR  CUR  CUR  NO   CUR  CUR
S    NO   NO   NO   NO   CUR  ·   NO   POT  NO   CUR  CUR  NO   NO   NO   NO
Y    CUR  CUR  CUR  CUR  NO   NO   ·   CUR  CUR  CUR  NO   NO   NO   NO   NO
O    CUR  CUR  CUR  CUR  POT  NO   CUR  ·   CUR  CUR  NO   NO   NO   NO   NO
H    NO   CUR  NO   NO   NO   NO   NO   DAN  ·   NO   NO   CUR  NO   NO   NO
B    NO   NO   NO   NO   CUR  NO   NO   POT  NO   ·   NO   CUR  NO   CUR  NO
U    NO   CUR  NO   NO   CUR  CUR  NO   NO   NO   CUR  ·   NO   CUR  NO   NO
C    NO   NO   NO   NO   CUR  NO   NO   NO   NO   CUR  CUR  ·   NO   NO   NO
Q    NO   NO   CUR  NO   NO   NO   NO   NO   NO   CUR  NO   CUR  ·   NO   CUR
R    NO   NO   NO   NO   CUR  NO   NO   NO   NO   CUR  NO   NO   NO   ·   NO
X    NO   CUR  NO   NO   NO   NO   NO   NO   NO   CUR  NO   NO   NO   NO   ·
```

### Notes on selected cells (evidence)

| Pair | Class | Evidence / note |
|------|-------|-----------------|
| L→W | CUR | `harborWeather.ts` mood + price mult from CF |
| L→Y | CUR | Pay Day pays `netCashflow` |
| L→F | CUR | Streak needs CF ≥ $30 |
| O→L | CUR | `acceptDeal` → `addHolding` |
| M→L | CUR | Cove Take footprint ±$5/mo (`firstFinancialScenario.ts`) |
| M→W | CUR | Haste/risk scar can close weather feedback loop (`feedbackLoopLine`) |
| S→M | CUR | Soft Beat suffix on next `setIrreversible`/`addScar` Talk |
| Y→P, Y→F | CUR | Coins + escape streak |
| W→H | CUR | `scaleHarborPrice` |
| F→C | CUR | Freedom floors carpet tier / Pavilion |
| Q→C | CUR | Credit unlock needs mastery clears + Freedom (`progressGates.ts`) |
| H→O | DAN | Polish/capsules compete for pouch **without** teaching CF — can starve deals (extrinsic sink) |
| O→O via W | POT | Weather-scaled future deal prices change Wait vs Commit value |
| S→O | POT | Armed Soft Beat as *information timing* before Commit (no new UI if Coin Bag whisper only) |
| M→O | POT | Plaque/CF baseline changes which deal is rational (Living Cashflow Commit) |
| Q→F / Q→* | DAN | Quiz-as-progress splits “judgment” from money truth |
| X→* | DAN / NO | Parallel XP/skills dilute one money conversation |

Full NO cells = no need to invent links (Family Room should not edit ledger; quizzes should not edit weather; etc.).

---

## 4. Triple chains (A → B → C → future A)

Form: **A affects B; B affects C; C changes future value of A.**

| # | Chain | A | B | C | Future A | Today | Priority |
|---|-------|---|---|---|----------|-------|----------|
| 1 | **Living Cashflow Commit** | **O** Opportunity | **L** CF | **Y** Pay Day (+**W** weather) | Next Opportunity’s rational pick (cost vs CF vs Wait) | CUR partial; O shapes weak (identical ROI) | **P0 — prototype first** |
| 2 | **Take weather market** | **M** Take/scar | **W** weather | **H**/**O** prices & affordability | Future Commit/Wait and pouch buffer for next Take prep | CUR (haste→weather); under-taught | P1 |
| 3 | **Soft Beat → Memory → Buddy → next Commit** | **S** Soft Beat | **M** Take/scar text | **B** Piggy/Bag interpretation | Player’s rule for next analogous fork / Wait | CUR S→M→B; weak into O | P1 |
| 4 | **Freedom flywheel** | **O**/**L** | **Y** | **F** Seal | Carpet floor / Pavilion / Credit gate changes travel & endgame value of grinding CF | CUR | P1 (don’t let F become extrinsic sugar for bad O) |
| 5 | **Pouch contest** | **P** pouch | **O** vs **H** | **L**/**W** | Future pouch + prices (shop vs deal) | CUR but H often DAN | P2 — only if H demoted |

### Chains to avoid amplifying

| Chain | Why dangerous |
|-------|----------------|
| Q → C → “more quizzes” | Quiz app with map pins |
| X → B → more XP tips | Coach races spectacle; hollow meters |
| H → P → H polish loop | Vanity treadmill without judgment |
| R → L | Social must not edit money truth (freeze: local myth only) |

---

## 5. Five strongest systemic chains (ranked)

### 1) Living Cashflow Commit — **prototype this first**

```
O (Opportunity) → L (CF holdings) → Y (Pay Day) + W (weather)
        ↘________________ future value of O (Wait vs Commit) _____↗
```

- **Meaningful decision:** Commit A / Commit B / Wait under scarcity (see `STRONGEST_RECURRING_LOOP.md`).  
- **No new currency.** Reuse ledger, Pay Day, weather, Coin Bag/Piggy line.  
- **Gap today:** deals are OBVIOUS (Accept ≫ Pass); identical 4× ROI. Prototype = **reshape O**, not add UI chrome.  
- **A→B→C→A′:** Opportunity changes CF; CF changes Pay Day/weather; weather/streak change which next Opportunity is smart.

### 2) Memory → Weather → Market pressure → next Memory prep

```
M → W → (H prices | O affordability) → P buffer → readiness for next M
```

Teaches Take → sky → prices (`feedbackLoopLine`). Strengthens Credit haste & digression scars without new meters.

### 3) Soft Beat → scarred Take → Buddy retell → revised strategy

```
S → M → B → (player rule) → next S/M timing
```

Already partially wired. Deepen by letting B name CF when M wrote holdings (Cove). Still no new UI if Bag sentence only.

### 4) CF grind → Freedom → Carpet/Pavilion → new situations

```
O/L → Y → F → C (travel options / carpet floor)
```

Valid long horizon. Keep F as **earned CF escape**, not quiz. Do not prototype before chain 1 fixes Opportunity interest.

### 5) Structure Soft Beat site → S → M on that organ’s shore

```
U → S → M → B → return to U pads as practice (not second Take)
```

Depth-before-width. Soft Beat stays peek; Structures host S. Prototype after 1–3 so peeks inform Commits/Takes players already understand.

---

## 6. Opportunities that need no new UI or currencies

| Opportunity | Use existing | Decision quality gain |
|-------------|--------------|----------------------|
| Non-dominated deal shapes + Wait | O, L, Y, W, B | Fixes OBVIOUS Accept |
| Show CF Δ + pouch cost on deal panel | O UI already | Cuts UNINFORMED |
| Piggy/Bag line after Pay Day naming streak/weather | B, Y, W, F | Interpretation link |
| Weather-scaled deal prices already exist for shop — extend feel to O | W, O | Future value of Wait |
| Cove-parity: ensure Clock/Spiral Takes eventually matter to L or W | M, L, W | Without new currency |
| Demote H polish while Freedom chase active (Coin Bag tip only) | B, H, O | Pouch contest clarity |

**Not opportunities:** new seal types, XP visible, second weather fiction, mastery-as-loop.

---

## 7. Prototype brief — strongest chain only

**When approved to build (not this doc):**

1. **Only** Living Cashflow Commit (chain 1).  
2. Minimal surface: Opportunity A/B/Wait + ledger + Pay Day + weather + one B line.  
3. Success = non-dominance in ≥2 situations + cold causal retell (per `STRONGEST_RECURRING_LOOP.md`).  
4. Do **not** prototype chains 2–5 in the same slice.  
5. Do **not** add currencies, XP, or shop polish rewards to “fix” interest.

---

## 8. Maintenance

Update this matrix when:

- Credit/Freedom gates change  
- Deal ROI or Wait rules change  
- Soft Beat gains/loses mechanical teeth  
- Any new currency or HUD language is proposed (default: reject)

Amendment PRs should cite changed cells and whether class moved CUR↔POT↔DAN.
