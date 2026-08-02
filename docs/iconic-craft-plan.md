# Iconic craft plan — design · logic · mechanics

**Purpose:** Bring Capital’s game design, logic, and mechanics to the same iconic bar as the signature Harbor loop — without widening the map.

**Canon:** [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [iconic-path.md](./iconic-path.md) · [mural-thesis.md](./mural-thesis.md) · [game-pillars.md](./game-pillars.md) · [story-bible.md](./story-bible.md)

**Freeze (still holds):** Cove → Paycheck → Credit + Harbor only · Family Room local · no Nathan/BMO/CBE merge · deepen organs, don’t add islands.

---

## How we’ll work

Each pillar below is one **pass**. A pass has four steps:

1. **Name the truth** — one sentence of what Capital claims today  
2. **Cold evidence** — play / read / code proof (fresh profile or QA seed)  
3. **Gap list** — what’s missing, muddy, or toy-like  
4. **Ship or cut** — one iconic fix *or* explicit defer (never silent debt)

**Pass verdicts:** `iconic` · `playable` · `toy` · `broken`  
Target for spine content: **iconic** or **playable** with a dated fix. **Toy** is a bug for the signature loop.

**Order of passes** follows Vision → Fantasy → Loop → … → Scope (below). Do not jump to content (#7) or art (#10) before fantasy (#1) and loop (#2) are locked for this phase.

---

## Master sequence

```
Vision (mural thesis)
  → 1 Fantasy
  → 2 Core loop
  → 3 Goals / rules / failure
  → 4 Controls & feel
  → 5 Progression
  → 6 Levels & encounters
  → 7 Content (spine only)
  → 8 Challenge & balance
  → 9 UI & communication
  → 10 Art direction
  → 11 Sound & music
  → 12 Story & world
  → 13 Onboarding
  → 14 Technical systems
  → 15 Accessibility
  → 16 Testing & iteration
  → 17 Scope & production
```

When two pillars fight, **fantasy + signature loop win**.

---

## Pillar runbook

### 0. Vision lock (before #1)

| | |
|--|--|
| **Claim** | You are inside living money. Harbor remembers. Cove holds. Paycheck clocks. Credit spirals. |
| **Evidence** | Cold retell after one Cove Take → Harbor return (kid can name Coin / Memory). |
| **Do** | Re-read mural thesis + iconic-path signature loop. Anything that can’t name **organ + suit verb** is out of this phase. |
| **Done when** | Team can recite the signature loop without notes. |

---

### 1. Clear player fantasy

| | |
|--|--|
| **Fantasy** | Voyager in a world where **money is alive** — curious explorer + careful chooser (not spreadsheet op, not combat god). |
| **Feel test** | After 60s in Harbor: “I’m among Money Mascots” not “I’m in a settings app.” |
| **Guide decisions** | Every UI/mechanic: *Does this make me feel like a Voyager among living money?* |
| **Anti-fantasy** | Ledger dashboards as hero chrome · combat stats · lecture modals · empty map width |
| **Pass work** | Write 3 “fantasy yes / fantasy no” examples from current Harbor + Cove. Patch the worst **no**. |
| **Code/docs** | `docs/player-fantasy-and-loop.md` §1 · Piggy / Coin Bag ownership · series leads tip hats only |

---

### 2. Core gameplay loop

| | |
|--|--|
| **Loop** | Harbor → guide points → act → carpet → island chapter → earn/choose → return changed → Harbor grows → harder doors |
| **Micro-loop (iconic)** | Cove Take → hush → Harbor scar + Plinth → share → Piggy → day-2 echo |
| **Mechanics vs loop** | Mechanics = walk / talk / take / spend / board. Loop = how Harbor *proves* the island choice. |
| **Pass work** | Time a cold session through the micro-loop. Note every place the chain breaks or needs a tip. |
| **Done when** | Micro-loop completable without QA seed on desktop + one phone; e2e `signature-loop` green. |

---

### 3. Goals, rules, failure states

| Question | Capital answer (must stay true in UI) |
|----------|----------------------------------------|
| Accomplish? | Escape paycheck-to-paycheck; seals; master organs |
| Can do? | Walk, talk, enter, take/spend, board carpet |
| Stops me? | Soft gates (coins, seals, mastery) — never silent soft-locks |
| Win? | Chapter Change Harbor can name |
| Lose? | Bad take / minigame fail — dignity + retry hint |
| After lose? | Same place, clearer next verb |

| Pass work | For Cove Take + one minigame: screenshot goal / affordance / fail / retry. Fix any “expensive toy” moment. |

---

### 4. Controls and game feel

| Layer | Iconic bar |
|-------|------------|
| Move | WASD tank, readable stop, no sticky drift |
| Talk / enter | Near-prompt; E/Enter; Esc leaves |
| Juice | Earn/spend/take have hit-stop, SFX, particles per juice checklist |
| Camera | Spectacle / carpet / structure each have intentional framing |
| Carpet | Reads as Money Carpet; rail ≤12s; never stuck free-flight |

| Pass work | Juice checklist on Take → hush → Plinth → share. Patch the weakest feedback beat. |
| Refs | `docs/juice-system-checklist.md` · `docs/input-system.md` |

---

### 5. Progression

| Kind | Spine expression |
|------|------------------|
| Ability | New verbs via organs (hold / earn / borrow) — not RPG skill trees |
| Upgrade | Carpet tiers, pets, plaza passes |
| Story | Story Circle Change + Plinth memory |
| Space | Structure interiors (depth), not new islands |
| Mastery | Day-2 echo, seals, boss/ordeal later (Debt Collector) |
| Cosmetic | Outfitter looks / cast select |

| Pass work | Draw “after Cove Take, what is newly true?” If nothing visible at Harbor, progression failed. |

---

### 6. Level and encounter design

| Rule | Detail |
|------|--------|
| Test skills, not HP | Cove = irreversible hold; Paycheck = clock/shelter; Credit = spiral wait vs haste |
| Encounters | Story Circle beats + structure toys + Soft Beat — not bigger bars |
| Arenas | Shore eye-path + Money Structure rooms with one clear verb each |

| Pass work | Per spine island: list 3 distinct skill tests. Cut or rewrite any “same fight, more HP.” |

---

### 7. Content

| In scope now | Out of scope now |
|--------------|------------------|
| Harbor cast + Piggy + Coin Bag | New outer islands |
| Cove / Paycheck / Credit chapters | Genre cities as primary spine |
| Structure parts + toys | Fake multiplayer |
| Outfitter / carpet / share card | Merging external IPs |

| Pass work | Content inventory vs mural thesis. Tag each piece: organ · verb · cold-retell word. Orphan content → cut or park. |

---

### 8. Challenge and balance

| Lever | Intent |
|-------|--------|
| Take cost | Feels irreversible; not brick-wall |
| Soft gates | Visible requirement + how to earn it |
| Minigames | Fail → hint → retry; no shame spiral |
| Upgrades | Interesting choices, not pay-to-skip-learn |
| Pace | Family session 10–15m to first meaningful Change |

| Pass work | One balance sheet for Cove Take + carpet price + first seal. Adjust numbers that stall or trivialise. |

---

### 9. UI and player communication

| Must always answer | How |
|--------------------|-----|
| What now? | Coin Bag one next verb |
| Why did Harbor change? | Plinth / scar / share organ word |
| Why did I fail? | Hint on retry, not toast spam |
| Where am I? | Title voice + World Arrive + shore labels |

| Pass work | Navigability law audit (`player-fantasy-and-loop.md`). Every overlay: Esc + Leave + sticky Complete. |

---

### 10. Art direction and visual identity

| Rule | |
|------|--|
| Instant read | Enemies/hazards/interactables silhouette in <1s |
| Consistency | Organ colors, Money Structure motifs, cast locks |
| Identity | Living money — not generic purple SaaS, not newspaper sim |

| Pass work | Screenshot Harbor + one structure: can you spot next interactable without HUD? If not, strengthen silhouette/VFX. |
| Refs | `docs/art-direction-bible.md` · `docs/islands-ui-style-guide.md` |

---

### 11. Sound and music

| Role | Capital cue |
|------|-------------|
| Place | Harbor / island / structure beds |
| Organ | Coin · Clock · Spiral · Memory stingers |
| Teach | Soft Beat / spectacle / take audio before visual clutter |
| Reward | Seal / share / Piggy homecoming |

| Pass work | Mute test: can audio alone telegraph Take → hush → Harbor felt that? Patch missing stingers. |

---

### 12. Story, world, and context

| | |
|--|--|
| Frame | Story Bible only — Harmon circle mapped to islands |
| Why fight/choose? | Money is alive; Harbor remembers your Take |
| Villain | Debt Collector = late Credit ordeal — never Harbor terrace |

| Pass work | Cold player sentence per organ. If they invent a second mythology, copy failed. |

---

### 13. Onboarding and tutorials

| Pattern | One concept → practice → combine |
|---------|----------------------------------|
| Harbor | Piggy first meet → talk → carpet (quiet chrome) |
| Boot | Title mural → cast select → Money Carpet → Harbor |
| Anti-pattern | 30 options, stall grid, no Cancel |

| Pass work | Fresh profile, no coach reading ahead. Note first confusion; teach that one thing earlier or clearer. |

---

### 14. Technical systems

| System | Iconic bar |
|--------|------------|
| Save/load | Survive refresh; never brick Harbor |
| Input | Keyboard + touch; Esc law |
| Perf | Harbor playable <3s myth escape |
| Collision / AI | Enough for talk targets + guides |
| Checkpoints | Chapter hush / scar / day-2 state durable |

| Pass work | Kill WebGL once; confirm myth path. Corrupt save once; confirm fallback. |

---

### 15. Accessibility

| Must keep | Reduced motion · text size · volume split · hold/toggle where relevant · no soft-lock on color alone |
| Pass work | `prefers-reduced-motion` full signature loop. List any shake/flash that still blinds the beat. |

---

### 16. Testing and iteration

| Cadence | |
|---------|--|
| Automated | `signatureLoop` unit + e2e; content validate |
| Cold human | Fresh profile checklist in iconic-path |
| Questions | Misunderstand · unfair · repetitive · ignored ability · lost · fun vs functional |

| Pass work | After each pillar fix: one cold run + update this doc’s status table. |

---

### 17. Scope and production

| | |
|--|--|
| MVP iconic | Signature loop + triangle organs cold-retellable |
| Cut before add | New island < deeper Take/feel |
| Milestones | Per-pillar pass verdicts below |
| Roles | Design truth in docs; code proof in `src/islands` + e2e |

| Pass work | Reaffirm freeze. Park a “later” list so feature creep doesn’t eat the loop. |

---

## Status board (update as we pass)

| # | Pillar | Verdict | Last pass | Next fix |
|---|--------|---------|-----------|----------|
| 0 | Vision | playable | 2026-08-02 | Recite loop + mural; keep freeze |
| 1 | Fantasy | playable → iconic | 2026-08-02 | Talk Battle living-money stage + no HP bars; PERF default off. Next: Leave/Apprentice chrome still SaaS-y after tutorial |
| 2 | Core loop | playable → iconic | 2026-08-02 | Gate spectacle/echo on plaza ready; hide Piggy HUD during all cinema; myth cinema stage; Piggy before day-2. Next: cold unseeded Cove Take timing |
| 3 | Goals / failure | playable → iconic | 2026-08-02 | Minigame miss → dignity overlay + Retry / stay-put; no Harbor dump on structure fail; ModularMinigame “Round over” (not fake Complete). Next: bad-take Spend soft-fail copy parity |
| 4 | Feel | playable → iconic | 2026-08-02 | Wire orphan juice into Take mark → Plinth complete → share accept/reward; Settings Game Feel; fail shake. Next: WASD stop readability + carpet rail juice |
| 5 | Progression | playable → iconic | 2026-08-02 | After Cove Take Harbor names Coin holds + Paycheck newly open (retell/shelf/share/Piggy/homecoming). Next: Freedom seal / carpet tier plaza reads |
| 6 | Encounters | playable → iconic | 2026-08-02 | Credit canyon: Score Scanner (not Paycheck categorize); wait/haste Take after practice. Next: Cove Alma vs Paycheck categorize overlap |
| 7 | Content | playable → iconic | 2026-08-02 | `spineContentRegistry` tags organ·verb·cold-retell; parks genre/asset packs + Cove digression minigames out of live loader/Arcade; Paycheck Clock identity; genre HUD muted on spine. Next: park docs under docs/islands/{signal-city,…} with explicit PARKED banners |
| 8 | Balance | | | |
| 9 | UI / comms | | | |
| 10 | Art direction | | | |
| 11 | Audio | | | |
| 12 | Story | | | |
| 13 | Onboarding | | | |
| 14 | Technical | | | |
| 15 | Accessibility | | | |
| 16 | Testing | | | |
| 17 | Scope | | | |

---

## Session recipe (when we “run through” a pillar)

1. Read the pillar row above (2 min)  
2. Cold evidence (play or QA seed) (10–20 min)  
3. Write gap list in the status board  
4. Ship the single highest-leverage fix **or** mark defer with reason  
5. Re-smoke the signature loop if the fix touched Harbor / Cove / carpet  
6. Commit + note in PR / this board  

**Last shipped:** Pillar **7 — Content** (spine registry + parked packs/minigames from Arcade; Paycheck Clock identity; genre HUD off spine).  

**Start next:** Pillar **8 — Challenge and balance** (Cove Take + carpet price + first seal balance sheet).
