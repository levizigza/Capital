# Iconic craft plan — design · logic · mechanics

**Purpose:** Bring Capital’s game design, logic, and mechanics to the same iconic bar as the signature Harbor loop — without widening the map.

**Canon:** [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [iconic-path.md](./iconic-path.md) · [iconic-later.md](./iconic-later.md) · [mural-thesis.md](./mural-thesis.md) · [game-pillars.md](./game-pillars.md) · [story-bible.md](./story-bible.md)

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

**Balance sheet (Pillar 8 — guarded by `balanceSheet.test.ts`):**

| Beat | Earn / spend | Note |
|------|----------------|------|
| Cove quests | +80 coins | First Coins 30 + Save/Spend 50 |
| `mg_coin_sort` first clear | ~25–40 | Thresholds 20 / 35 / 55 |
| Cove Take | 0 pouch | Scar / irreversible only |
| Post-Cove pouch | ~105–120 | Typical |
| Carpet travel | 0 | Scrap rug free |
| Carpet polish → Coin | 50 | Soft upgrade after Cove |
| Carpet polish → Fortune | 175 | Not auto-bought by Cove earn |
| First Ledger Seal | 20 | Soft board sink |
| Escape deals (jar+shell) | 60 | CF 15 → 30 |
| Freedom Seal | CF ≥30 for **3** Pay Days | Was 2 — trivialised polish skip |

---

### 9. UI and player communication

| Must always answer | How |
|--------------------|-----|
| What now? | Coin Bag one next verb |
| Why did Harbor change? | Plinth / scar / share organ word |
| Why did I fail? | Hint on retry, not toast spam |
| Where am I? | Title voice + World Arrive + shore labels |

| Pass work | Navigability law audit (`player-fantasy-and-loop.md`). Every overlay: Esc + Leave + sticky Complete. |

**Shipped (Pillar 9):** `useOverlayEscape` — window Esc on HarborFelt share · Take hush · Scar spectacle · Soft Beat · signature trailer · day-2 echo · World Arrive. Share sticky Complete/Leave + backdrop dismiss; Leave labels + Esc hint copy. Guarded by `useOverlayEscape.test.ts`.

---

### 10. Art direction and visual identity

| Rule | |
|------|--|
| Instant read | Enemies/hazards/interactables silhouette in <1s |
| Consistency | Organ colors, Money Structure motifs, cast locks |
| Identity | Living money — not generic purple SaaS, not newspaper sim |

| Pass work | Screenshot Harbor + one structure: can you spot next interactable without HUD? If not, strengthen silhouette/VFX. |
| Refs | `docs/art-direction-bible.md` · `docs/islands-ui-style-guide.md` |

**Shipped (Pillar 10):** Money Structure pads silhouette without HUD — `StructurePartSilhouette` for every part id; Cove **Lid Lookout** is a screw-top hatch (was flat cyan disc); Soft Beat pads get a lookout beacon; stamp / battlement / teller / anvil distinct; interior labels use `SafeText` (Pages = silhouette + glow). Guarded by `StructurePartSilhouette.test.ts`. Harbor Memory Plinth / Carpet gate already carry the plaza read when troika text is off.

---

### 11. Sound and music

| Role | Capital cue |
|------|-------------|
| Place | Harbor / island / structure beds |
| Organ | Coin · Clock · Spiral · Memory stingers |
| Teach | Soft Beat / spectacle / take audio before visual clutter |
| Reward | Seal / share / Piggy homecoming |

| Pass work | Mute test: can audio alone telegraph Take → hush → Harbor felt that? Patch missing stingers. |

**Shipped (Pillar 11):** Mute-test stingers — Take mark → `take_mark` (was Soft Beat reuse); spectacle/share → `harbor_felt` Memory resolve (was trailer `harbor_cheer` on spectacle); Harbor plaza bed ducks during spectacle/share (`MusicPlace.harbor.hush`). Soft Beat keeps `soft_beat`. Guarded by `signatureMuteAudio.test.ts`.

---

### 12. Story, world, and context

| | |
|--|--|
| Frame | Story Bible only — Harmon circle mapped to islands |
| Why fight/choose? | Money is alive; Harbor remembers your Take |
| Villain | Debt Collector = late Credit ordeal — never Harbor terrace |

| Pass work | Cold player sentence per organ. If they invent a second mythology, copy failed. |

**Shipped (Pillar 12):** `coldOrganKidSentence` — one Story Bible sentence per organ (Coin holds · Clock shelters · Spiral withstands · Memory keeps). Spectacle headlines unified to suit verbs (cut “Coin Change” / “Clock Take” split). Family Room myth uses the same Harbor retell form. Guarded by `storyColdRetell.test.ts`. Debt Collector stays Credit Ordeal-only.

---

### 13. Onboarding and tutorials

| Pattern | One concept → practice → combine |
|---------|----------------------------------|
| Harbor | Piggy first meet → talk → carpet (quiet chrome) |
| Boot | Title mural → cast select → Money Carpet → Harbor |
| Anti-pattern | 30 options, stall grid, no Cancel |

| Pass work | Fresh profile, no coach reading ahead. Note first confusion; teach that one thing earlier or clearer. |

**Shipped (Pillar 13):** `meet_guide` Piggy Talk teaches Walk · Talk only (cut Outfitter pitch); `tiny_spend` coach stays on Capsule (Carpet / Cove wait for dock). One concept → practice → combine. Guarded by `onboardingNoAhead.test.ts` + harbor-tutorial e2e.

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

**Shipped (Pillar 14):** `sanitizeIslandSave` — corrupt version-1 blobs (null discovered / string inventory) coerce to playable Harbor defaults instead of bricking boot. Harbor failsafe timers live in `harborLoadFailsafe.ts` and wire into WalkableHarborView (sticky probe fail → myth; hard escape <3s). Guarded by `save.test.ts` + `harborLoadFailsafe.test.ts`.

---

### 15. Accessibility

| Must keep | Reduced motion · text size · volume split · hold/toggle where relevant · no soft-lock on color alone |
| Pass work | `prefers-reduced-motion` full signature loop. List any shake/flash that still blinds the beat. |

**Shipped (Pillar 15):** `prefersReducedMotion()` = Settings OR OS (synced from accessibility load/persist). Signature cinema timings, juice bounce/burst, Capital SFX, and music duck all honor it. Take mark / Plinth spectacle strobes damp via `cinemaFlashAmp()` (Coin Jar · Payroll Tower · Interest Keep · Memory Plinth). Guarded by `signatureA11y.test.ts`.

---

### 16. Testing and iteration

| Cadence | |
|---------|--|
| Automated | `npm run test:iconic` (pillar contracts + `signatureLoop` + content validate); Harbor/Cove: `npm run test:iconic:e2e` |
| Cold human | Fresh profile checklist in [iconic-path.md](./iconic-path.md) |
| Questions | Misunderstand · unfair · repetitive · ignored ability · lost · fun vs functional |
| Machine map | `src/qa/iconicCraftCadence.ts` — checklist rows ↔ guard files (rots → red) |

| Pass work | After each pillar fix: `test:iconic` → cold run + six questions → update this doc’s status table. |

**Shipped (Pillar 16):** Durable cadence — `iconicCraftCadence` maps cold checklist + pillar 7–16 contracts to real tests; `npm run test:iconic` / `test:iconic:e2e` are the gate; iconic-path checklist adds mute / Esc / corrupt-save / reduce + six iteration questions.

---

### 17. Scope and production

| | |
|--|--|
| MVP iconic | Signature loop + triangle organs cold-retellable |
| Cut before add | New island < deeper Take/feel |
| Milestones | Per-pillar pass verdicts below |
| Roles | Design truth in docs; code proof in `src/islands` + e2e |
| Later sink | [iconic-later.md](./iconic-later.md) · `iconicScopeFreeze.ts` |

| Pass work | Reaffirm freeze. Park a “later” list so feature creep doesn’t eat the loop. |

**Shipped (Pillar 17):** Freeze reaffirmed in code (`assertSpineTravelFrozen` — Harbor · Cove · Paycheck · Credit only). Parked “later” list at `docs/iconic-later.md` (out-of-scope laws + parked content + deferred polish from status Next fixes). Outer island story-circles carry explicit **PARKED** banners. Guarded by `iconicScopeFreeze.test.ts`.

---

## Status board (update as we pass)

| # | Pillar | Verdict | Last pass | Next fix |
|---|--------|---------|-----------|----------|
| 0 | Vision | playable | 2026-08-02 | Recite loop + mural; keep freeze |
| 1 | Fantasy | playable → iconic | 2026-08-02 | Talk Battle living-money stage (organ chip, I hear you / Walk on, Leave). Next: cold human Ashore→Cove |
| 2 | Core loop | playable → iconic | 2026-08-02 | Cold Take `doneMs` + pier guide + Carpet CTA after hush. Next: cold human Ashore→Cove pass |
| 3 | Goals / failure | playable → iconic | 2026-08-02 | Dignity fail overlay + Spend Take soft-fail parity (`resolveTakeFailFlavor`). Next: keep board honest on miss paths |
| 4 | Feel | playable → iconic | 2026-08-02 | Walk coast stop + carpet rail juice + Take/Plinth juice. Next: Soft Beat shore beacons |
| 5 | Progression | playable → iconic | 2026-08-02 | Freedom Seal + Seal chase chip after pouch dips; carpet tier. Next: cold kid retell |
| 6 | Encounters | playable → iconic | 2026-08-02 | Alma craft-bench → jar Take; Paycheck Priya owns payday buckets; Credit Score Scanner. Next: deepen organ vocabulary in Talk |
| 7 | Content | playable → iconic | 2026-08-02 | `spineContentRegistry` tags organ·verb·cold-retell; parks genre/asset packs + Cove digression minigames out of live loader/Arcade; Paycheck Clock identity; genre HUD muted on spine. Next: (done in P17) PARKED banners on outer island docs |
| 8 | Balance | playable → iconic | 2026-08-02 | Cove → Freedom balance sheet + Seal chase chip after pouch dips. Next: keep escape streak honest |
| 9 | UI / comms | playable → iconic | 2026-08-02 | Talk Battle Leave + organ stage + Esc · Leave overlays. Next: cold human Ashore→Cove |
| 10 | Art direction | playable → iconic | 2026-08-02 | Soft Beat crown beacon + organ verb pad labels; Cove Jar distance. Next: shore Soft Beat distance read |
| 11 | Audio | playable → iconic | 2026-08-02 | `take_mark` + `harbor_felt` + `piggy_homecoming` mute-test stingers. Next: keep duck honest on share |
| 12 | Story | playable → iconic | 2026-08-02 | Cold kid sentences + Talk Battle organ chip; Ashore→Cove retell contract. Next: cold human Ashore→Cove |
| 13 | Onboarding | playable → iconic | 2026-08-02 | meet_guide Talk-only; boot Board + Cancel look parity. Next: cold unseeded Ashore→Cove human pass |
| 14 | Technical | playable → iconic | 2026-08-02 | Harbor failsafe + `e2e/harbor-3d-failsafe` sticky/kill. Next: keep myth <3s honest in CI |
| 15 | Accessibility | playable → iconic | 2026-08-02 | Settings OR OS reduce; damp Take/Plinth strobes; high-contrast share lower-third. Next: keep reduce honest on new juice |
| 16 | Testing | playable → iconic | 2026-08-02 | `test:iconic` + cadence map (`iconicCraftCadence`); checklist + six questions. Next: keep board honest after every pillar |
| 17 | Scope | playable → iconic | 2026-08-02 | Freeze in code + `docs/iconic-later.md` creep sink + PARKED banners on outer docs. Next: deepen spine from later-list polish only |

---

## Session recipe (when we “run through” a pillar)

1. Read the pillar row above (2 min)  
2. Cold evidence (play or QA seed) (10–20 min)  
3. Write gap list in the status board (or park on [iconic-later.md](./iconic-later.md))  
4. Ship the single highest-leverage fix **or** mark defer with reason  
5. `npm run test:iconic` (and `test:iconic:e2e` if Harbor / Cove / carpet touched)  
6. Commit + note in PR / this board  

**Last shipped:** Pillar **17 — Scope and production** (freeze reaffirmed; later list + PARKED banners).  

**Craft sequence complete (0–17).** Next work: pick deferred polish from [iconic-later.md](./iconic-later.md) — deepen Harbor · Cove → Paycheck → Credit; do not widen the map.
