# Capital — Game Design Audit

**Role lens:** Senior game designer · gameplay systems · UX · technical direction  
**Scope:** Live Islands spine as of `main` @ Chamber 00 (Ashore ≤5) + iconic freeze  
**Method:** Code + canon docs first; no features recommended merely because other games have them  
**Freeze:** Harbor · Cove → Paycheck → Credit strip · Family Room local · no Nathan/BMO/CBE merges  

**Central fantasy (north star for every classification below):**  
> You are a Voyager in a world where money is alive — curious explorer + careful chooser.  
> One irreversible money choice must feel unforgettable because Harbor remembers.

**Smallest defining set (what Capital *is* if everything else burned):**  
1. Living-money organs (Coin holds · Clock shelters · Spiral withstands · Memory keeps)  
2. Irreversible **Take** that writes a plaque  
3. **Carpet home → Harbor felt that** (Plinth spectacle)  
4. **Share** as portable Memory  
5. Opt-in **Walk · Talk · Board** body literacy  

Everything else is support, depth, or risk of dilution.

---

## Classification legend

| Tag | Meaning |
|-----|---------|
| **KEEP** | Protect; already serves the fantasy |
| **IMPROVE** | Keep the idea; deepen craft / clarity / juice |
| **SIMPLIFY** | Same job with less chrome / fewer parallel rules |
| **CONNECT** | Wire to another system so it pays off the fantasy |
| **REMOVE** | Cut or park — fights fantasy or creates false promises |
| **MISSING** | Needed for fantasy; not present or not felt |

---

## 1. Primary player fantasy

| Finding | Classification |
|---------|----------------|
| Stated fantasy is clear and consistent across `player-fantasy-and-loop.md`, `mural-thesis.md`, `moneyOrgans.ts` | **KEEP** |
| Fantasy test (“Voyager among Money Mascots?”) is used as a ship gate in docs | **KEEP** |
| Dual cosmologies in older docs (`game-pillars.md` Hub→Minigame→Unlock vs iconic Take→Memory) confuse contributors | **SIMPLIFY** — make iconic signature the only core-loop diagram in pillars |
| Post-spectacle Harbor can still read as utility dashboard (stalls, Freedom chase chrome) | **IMPROVE** — quiet chrome after intimate share so fantasy doesn’t snap to spreadsheet |

**Evidence:** `docs/player-fantasy-and-loop.md`, `docs/mural-thesis.md`, `src/islands/moneyOrgans.ts`, `docs/iconic-path.md`

---

## 2. Core gameplay loop

**Implemented signature (protect):**  
Cove/Paycheck/Credit **Take** → `chapterQuietPending` hush → carpet home → **Harbor felt that** (Plinth) → **Share** → Piggy homecoming → day-2 echo.

**Broader campaign loop:**  
Harbor → Carpet → island chapter (Talk / earn / play) → Change Take → Harbor grows → next painting.

| Finding | Classification |
|---------|----------------|
| Signature cinema loop is authored, juiced, QA-seeded | **KEEP** |
| Campaign loop correctly remixes same shape per organ (Aspiration) | **KEEP** |
| Docs still show two “core loops” (pillars adventure RPG vs iconic) | **SIMPLIFY** |
| Soft Beat / Structure depth optional — easy to skip after Take | **CONNECT** — after first hush, one clear invitation into Coin Jar (not a glossary) |

**Evidence:** `docs/iconic-path.md`, `src/qa/signatureLoop.ts`, `src/islands/chapterLoop.ts`, `src/islands/story/coinBagBuddy.ts`

---

## 3. Primary player verbs

| Verb | Role | Classification |
|------|------|----------------|
| **Walk** | Body literacy | **KEEP** |
| **Talk** (opt-in) | Social / quest | **KEEP** |
| **Board / Carpet** | Voyage | **KEEP** |
| **Take** | Irreversible fork | **KEEP** — fantasy climax |
| **Return** | Carpet home | **KEEP** |
| **Share** | Social Memory object | **KEEP** |
| **Enter** (structures) | Astro-style depth | **IMPROVE** — teach-when-needed after first Take |
| **Play** (minigames) | Chapter practice | **KEEP** on spine; **SIMPLIFY** parked genre packs stay parked |
| **Spend / Earn** | Economy toys | **CONNECT** to plaque fantasy more often (pouch rarely feels the Take) |
| Hold / Hush / Stamp / Shelter / Borrow / Weigh / Withstand | Organ suit mythology | **KEEP** as cold-retell vocabulary; don’t invent parallel HUD jargon |

**Evidence:** `AshoreComprehensionTutorial.tsx`, `harborAshore.ts`, `moneyOrgans.ts`, `worldMemory.ts`

---

## 4. Short-term gameplay loop (seconds → minutes)

Move → opt-in prompt → act (Talk / Enter / Play / Take) → juice + one next-verb coach.

| Finding | Classification |
|---------|----------------|
| Opt-in Talk / near-prompt Enter respects agency | **KEEP** |
| Coin Bag one-tip coaching | **KEEP** |
| Dignity fail + Retry | **KEEP** |
| Too many simultaneous chrome verbs after Ashore quiet ends | **SIMPLIFY** early Harbor surface |

---

## 5. Medium-term gameplay loop (session / chapter)

Harbor orient → Carpet to painting → Story Circle → optional Structure → **Change Take** → hush → home → spectacle → share → Piggy names next painting.

| Finding | Classification |
|---------|----------------|
| Medium loop is the product’s best hour | **KEEP** |
| Main vs side quest tracks reduce checklist fog | **KEEP** |
| Side tomfoolery / party board don’t feed Freedom or Memory | **CONNECT** or keep clearly “play,” not progression |

---

## 6. Long-term gameplay loop (multi-day / meta)

Day-2 scar echo · Daily Ritual (after Cove Change) · Freedom Seal (cashflow streak) · mastery clears → Credit · carpet tiers · era side shores (outer ring).

| Finding | Classification |
|---------|----------------|
| Day-2 Memory echo | **KEEP** — fantasy of living money over time |
| Freedom Seal as escape paycheck-to-paycheck | **KEEP** fantasy win; **IMPROVE** readability of “why locked” |
| Mastery quiz clears as Credit door | **IMPROVE** — ensure kinesthetic clear feels like Voyager skill, not worksheet |
| Era side shores after Cove Change | **KEEP** as digression; **IMPROVE** so they don’t steal cold-retell of Clock/Spiral Takes |
| XP / skillStats as long-term | **SIMPLIFY** or **CONNECT** — currently shallow vs Freedom/mastery |

---

## 7. Progression systems

| System | Classification | Note |
|--------|----------------|------|
| Spine order Harbor · Cove → Paycheck → Credit | **KEEP** | Freeze |
| Soft gates (Cove Change, Freedom, mastery) | **KEEP** | Never silent soft-lock |
| Carpet tiers / polish | **KEEP** | Toy voyage depth |
| `progressGates` + Coin Bag naming next painting | **KEEP** |
| XP levels | **SIMPLIFY** | Not a gate; noise |
| Parallel StructuredMode / legacy hub progression UI | **REMOVE** or park from cold path |

**Evidence:** `progressGates.ts`, `mainCourse.ts`, `masteryGate.ts`, `voyagerLedger.ts`

---

## 8. Economy systems

| Layer | Classification | Note |
|-------|----------------|------|
| Pouch coins (toys, capsules, polish) | **KEEP** | |
| Voyager Ledger cashflow → Freedom | **KEEP** | Pedagogy: toys ≠ escape |
| Split store: coins/XP on `UserProfile`, progress on `IslandSaveV1` | **IMPROVE** | Technical debt; player-facing ok if sync solid |
| Boom/Recession `economyState` | **CONNECT** or **SIMPLIFY** | Advances on minigame clear; barely feeds Pay Day / shop |
| Harbor weather from cashflow + haste scar | **KEEP** | Soft living-money reactivity |
| Take does not debit pouch (identity risk) | **KEEP** | Documented; risk is Memory not wallet |

---

## 9. Reward systems

| Reward | Classification |
|--------|----------------|
| Plaque / scar identity | **KEEP** — primary reward |
| Spectacle + share PNG | **KEEP** — default social object |
| Piggy naming newly open painting | **KEEP** |
| Quest coins / items | **KEEP** |
| Soft Beat (no coin) | **KEEP** aspiration |
| Daily Ritual +5 / weekly challenges | **KEEP** retention after Change |
| Party Ledger Seals | **SIMPLIFY** — side score, not spine reward |
| Stance deltas | **CONNECT** — flavor only today |

---

## 10. Risk / reward systems

| Beat | Classification |
|------|----------------|
| Cove jar vs treat (irreversible plaque) | **KEEP** |
| Paycheck umbrella vs glitter | **KEEP** |
| Credit wait vs haste (+ weather) | **KEEP** |
| Minigame fail dignity | **KEEP** |
| Structure abandon → Harbor dump | **IMPROVE** — harsher than fail-stay; fights navigability pillar |
| Dominant strategy? | **IMPROVE** — monitor if “always saver” is obvious with no cost; fantasy allows both plaques, so both must feel playable and remembered |

---

## 11. Feedback systems

| Channel | Classification |
|---------|----------------|
| Signature cinema (hush / spectacle / share / Soft Beat / day-2) | **KEEP** |
| Organ SFX + mute-test stingers | **KEEP** |
| Juice + Game Feel setting | **KEEP** |
| titleVoice brand → organ → verb | **KEEP** |
| Plinth camera lock / mark flash | **KEEP** |
| Dual coach surfaces (Coin Bag + plaza chrome + Talk) stacking | **SIMPLIFY** |
| Reduced motion / Esc · Leave | **KEEP** |

---

## 12. Player-agency systems

| Agency | Classification |
|--------|----------------|
| Irreversible Takes with Harbor receipt | **KEEP** — definition of agency here |
| Opt-in Talk | **KEEP** |
| Learning profile tip tone | **KEEP** light |
| Stance as “build” | **MISSING** payoff — or rename to flavor so players don’t expect saver builds |
| No in-save Take rewrite | **IMPROVE** UX — make Replay / fresh-profile “what if” obvious without undoing Memory |

Agency is **binary forks + permanent Memory**, not simulation webs. That matches fantasy; do not fake BotW chemistry.

---

## 13. Social systems

| System | Classification |
|--------|----------------|
| HarborFelt share card | **KEEP** |
| Family Room local invite / export | **KEEP** — freeze |
| Piggy + plaza locals naming plaque | **KEEP** |
| Fake multiplayer / live sync | **REMOVE** if reappears — freeze |
| Legacy `multiplayerChallenges` / PRD noise | **REMOVE** from contributor-facing paths |
| Classroom codes (pillars aspiration) | **MISSING** — only if it serves co-play Voyager myth later; not P0 |

---

## 14. Emergent / systemic interactions

| Finding | Classification |
|---------|----------------|
| Closed retell graph (scar → rumor → Piggy → share → Family myth) | **KEEP** — authored “living” Memory |
| Open multiplicative systems | **MISSING** by design — do not add unless it serves Memory fantasy |
| Weather / haste / shop soft links | **IMPROVE** lightly |
| Era shores × spine organs | **CONNECT** carefully or keep decorative |

---

## 15. Onboarding flow

```
Title → Cast → Ashore Chamber 00 (Fantasy poke · Walk · Talk · Dock · Launch)
  → Carpet → Harbor → Talk Piggy → Carpet → Cove Take (real combine)
  → Harbor remembers → Share → Piggy → (later) day-2
```

| Finding | Classification |
|---------|----------------|
| Chamber 00 elegancy (≤5) | **KEEP** |
| Body proves Walk/Talk/Dock | **KEEP** |
| Double Teach (Ashore Dock Cove then Harbor Talk→Carpet→Cove) | **IMPROVE** — intentional checklist→world, but copy must not feel like two FTUEs |
| Glossary Takes removed from Ashore | **KEEP** |
| Soft Beat / Share taught too early (fixed) | **KEEP** fix |

**Evidence:** `docs/ashore-teach-design.md`, `docs/ashore-tutorial-research.md`, `AshoreComprehensionTutorial.tsx`

---

## 16. Replayability systems

| System | Classification |
|--------|----------------|
| Day-2 echo / daily ritual | **KEEP** |
| Signature trailer from Plinth | **KEEP** |
| Decision timeline / ReplayModal | **IMPROVE** discoverability |
| Irreversible forks (NG+ via new profile) | **KEEP** |
| Era side shores | **KEEP** as post-signature digression |
| Roguelike / branching campaign | **REMOVE** as goal — wrong fantasy |

---

## 17. Failure states

| Failure | Classification |
|---------|----------------|
| Minigame miss → dignity + Retry | **KEEP** |
| Board fail consolation | **KEEP** light |
| Negative Pay Day pouch | **KEEP** |
| No hard wipe / corrupt save sanitize | **KEEP** |
| Structure abandon Harbor remount | **IMPROVE** |
| Soft-lock “what do I do?” | **IMPROVE** — Coin Bag + quiet chrome must always name one next verb |

---

## 18. Win / success states

| Win | Classification |
|-----|----------------|
| Chapter Change + Harbor felt that | **KEEP** — emotional win |
| Freedom Seal escape | **KEEP** — long-term fantasy win |
| Credit Ordeal complete | **KEEP** — spine end |
| Soft Beat / day-2 acknowledgement | **KEEP** Memory wins |
| XP level-up | **SIMPLIFY** — not the win fantasy |

---

## 19. Sources of player mastery

| Source | Classification |
|--------|----------------|
| Cold-retell organ kid sentences | **KEEP** — true mastery of Capital |
| Story Circle + Takes | **KEEP** |
| Minigame adaptive skill | **KEEP** |
| Structure spatial literacy | **IMPROVE** invitation |
| Mastery quiz clears | **IMPROVE** diegesis (feels school if not framed as Voyager trials) |
| Learning profile | **KEEP** light |

---

## 20. Sources of player expression

| Source | Classification |
|--------|----------------|
| Series cast select | **KEEP** |
| Outfitter Body · Coat · Gear | **KEEP** discovery after Ashore |
| Share PNG as choice identity | **KEEP** — strongest expression of fantasy |
| Companions / Coin Bag | **KEEP** |
| Family Room myth | **KEEP** local |
| Buildcrafting / base-building | **REMOVE** as aspiration — not Voyager fantasy |

---

## Cross-cutting diagnosis

### Duplicated mechanics
- Two “core loop” diagrams in docs (pillars vs iconic).  
- Coaching: Coin Bag tip + HUD chrome + Talk Battle can stack.  
- Cove boarding taught in Ashore Dock and again as first Harbor voyage.  
- XP and Freedom both signal “progress” but only Freedom matters.

### Disconnected mechanics
- `economyState` Boom/Recession ↔ Pay Day / shop.  
- Stance ↔ almost nothing mechanical.  
- Party seals / some structure clears ↔ spine gates.  
- Legacy multiplayer / genre packs on disk ↔ live loader.

### Shallow complexity
- Stance “builds.”  
- XP / skillStats.  
- Soft Beat if never entered.  
- Macro economy weather.

### Dominant strategies
- Risk that “always choose saver plaque” is obvious if spender path only changes text color. Both plaques must feel socially and cinematically equal; spender/haste paths need equal Harbor truth (already partly true via plaza_prop + weather).

### Unclear feedback loops
- Why Credit is locked (Freedom + mastery) can feel opaque.  
- Cashflow vs pouch distinction is pedagogically good but under-taught in-world.  
- After share, “what’s newly open?” sometimes competes with stall chrome.

### Unnecessary friction
- Structure abandon → full Harbor remount.  
- Long utility surfaces immediately after intimate spectacle.  
- Contributor confusion from parked multiplayer/genre content.

---

## Smallest set that defines Capital

If shipping a vertical slice that *must* feel like Capital:

1. **Mural fantasy** — money is alive; organs speak kid verbs.  
2. **Walk · Talk · Board** — body agency.  
3. **One irreversible Take** (Cove) with plaque vocabulary.  
4. **Carpet home → Plinth spectacle → Share.**  
5. **Piggy names what changed / what’s newly open.**  

Optional depth that still serves fantasy: Money Structure Soft Beat, day-2 echo, Freedom Seal, Clock/Spiral remix Takes.  
Everything else is either support chrome or a candidate to park.

---

## Prioritized roadmap

### P0 — Protect fantasy (ship craft, don’t widen)

| Item | Why it strengthens Voyager fantasy |
|------|-------------------------------------|
| **P0.1** Unify docs on signature loop only (`game-pillars` / whole-game craft outdated Ashore notes) | Contributors stop shipping a second product identity |
| **P0.2** Post-spectacle / quiet homecoming chrome discipline | Memory intimacy isn’t broken by stall dashboard |
| **P0.3** Always one next verb (Coin Bag wins over chrome stacks) | Voyager never feels lost after a living choice |
| **P0.4** Equal cinematic dignity for saver *and* spender/haste plaques | Careful chooser fantasy requires both forks to matter |
| **P0.5** Structure abandon = fail-stay dignity, not Harbor dump | Navigability / dignity pillars |
| **P0.6** Cold playtest Chamber 00 + Cove→Harbor against six iconic questions | Prove literacy without glossary |

### P1 — Deepen Memory without new islands

| Item | Why |
|------|-----|
| **P1.1** After first Cove hush, one diegetic invite into Coin Jar Soft Beat | Enter teaches aspiration in the world |
| **P1.2** Make Freedom / mastery lock reasons kid-readable on plaza | Escape paycheck-to-paycheck stays earned, not mysterious |
| **P1.3** Teach pouch vs cashflow once in-world (Piggy or Ledger Bank) | Dual economy serves fantasy only if understood |
| **P1.4** Discoverable Replay / “what if” via fresh profile framing | Agency without undoing Memory |
| **P1.5** Connect or gut Boom/Recession macro | Living money should not have a dead weather system |
| **P1.6** Stance: either pay off lightly (one Piggy/local beat) or stop implying builds | Honesty with player mental models |
| **P1.7** Soft-gate era shores messaging so Clock/Spiral Takes stay the next myth | Depth before width |

### P2 — Expression & polish (after P0/P1)

| Item | Why |
|------|-----|
| **P2.1** Share card as default social object polish (thumbnail truth) | Portable Memory |
| **P2.2** Family Room myth line richer from organ plaque | Local co-play without fake MMO |
| **P2.3** Outfitter discovery beats that don’t gate voyage | Expression after literacy |
| **P2.4** Park/delete legacy multiplayer & dead genre UI from cold paths | Reduce false scope |
| **P2.5** XP UI quiet or merge into non-gate flavor | Remove fake progression |
| **P2.6** Only then: classroom / parent view if it amplifies shared plaque myth | Must serve fantasy, not SaaS |

---

## Explicit non-goals (do not add because “games have them”)

| Temptation | Why it weakens Capital |
|------------|------------------------|
| Fake multiplayer backend | Breaks freeze; Harbor Memory is local truth |
| New main-strip islands before Clock/Spiral Takes iconic | Width before depth |
| Combat HP / duel fantasy | Wrong fantasy (not combat god) |
| Spreadsheet hero dashboards pre-Change | Spreadsheet operator, not Voyager |
| Roguelike run wipe of plaques | Attacks Memory keeps |
| Meta-build trees from stance | Promises systemic depth the Take loop doesn’t use |
| Merging Nathan/BMO/CBE | Foreign cosmologies |

---

## Evidence index (primary)

| Area | Paths |
|------|--------|
| Fantasy / loop | `docs/player-fantasy-and-loop.md`, `docs/iconic-path.md`, `docs/mural-thesis.md` |
| Organs | `src/islands/moneyOrgans.ts`, `src/islands/worldMemory.ts` |
| Signature QA | `src/qa/signatureLoop.ts` |
| Onboarding | `src/islands/views/AshoreComprehensionTutorial.tsx`, `docs/ashore-tutorial-research.md` |
| Coaching | `src/islands/story/coinBagBuddy.ts`, `src/islands/harborAshore.ts` |
| Progression | `src/islands/progressGates.ts`, `src/islands/mainCourse.ts`, `src/islands/voyagerLedger.ts` |
| Structures | `src/islands/moneyStructures.ts`, `src/islands/views/SoftBeatOverlay.tsx` |
| Cinema | `TakeHushOverlay`, `ScarSpectacleOverlay`, `HarborFeltShareOverlay`, `Day2EchoOverlay` |
| Social | `src/islands/familyRoom.ts`, `weeklyShareCard.ts` |
| Freeze | `.cursor/rules/iconic-freeze.mdc`, `src/islands/iconicScopeFreeze.ts` |

---

*Audit complete. No systems implemented in this pass — diagnosis and roadmap only.*
