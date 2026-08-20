# Capital Design Bible

**Status:** Living design constitution  
**Role:** Single north-star for fantasy, loop, systems, social, balance, metrics, and feature approval.  
**Not:** A frozen feature spec. Prefer amending this document when the game’s truth changes — do not silently invent parallel laws.

**Canon companions (detail):**  
[iconic-path.md](./iconic-path.md) · [iconic-later.md](./iconic-later.md) · [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [game-pillars.md](./game-pillars.md) · [mural-thesis.md](./mural-thesis.md) · [story-bible.md](./story-bible.md) · [harbor-ashore.md](./harbor-ashore.md) · [era-shores-restore.md](./era-shores-restore.md) · [design/CAUSAL_STORY_ARCHITECTURE.md](./design/CAUSAL_STORY_ARCHITECTURE.md)

**Chase target (subject + build order):**  
[design/DECISION_CONSTRAINTS_NORTH_STAR.md](./design/DECISION_CONSTRAINTS_NORTH_STAR.md) — Capital’s real subject is **decision-making under constraints**; money is the medium; literacy **is** the gameplay. Implementation order: Audit → constitution → decisions → core loop → playable finance → system depth → feedback → UI → learning transfer → measurement → real users. Do **not** start with AI guide, story engine, social, or giant simulation.

**Audit siblings (deep dives; may live on design branches until merged):**  
quality north-star · complexity cut · longevity 100h · feature gate · secrets · replayability · social · progression · economy · risk/reward · choices · system interactions · feedback · curiosity · identity · metrics · economy sim · playtest

**Freeze (always on):** Main quest strip stays **Harbor · Cove → Paycheck → Credit**. Family Room stays **local**. No Nathan Project / BMO / CBE merges. Prefer deepening hush → scar spectacle → Plinth → share → Piggy → day-2 → Money Structure interiors over map width.

---

## How to use this bible

1. Read the fantasy, one-sentence game, and core loop before proposing anything.  
2. Check anti-pillars and freeze — many ideas die here.  
3. Score with **Feature-approval rules** (or `FEATURE_GATE` when present).  
4. End with the **final question**. If the answer is weak, deepen interactions among existing systems instead of adding chrome.

When two docs conflict, **this bible + iconic freeze** win until the constitution is deliberately updated.

---

## THE PLAYER FANTASY

**You are a Voyager in a world where money is alive.**

Feel: curious explorer + careful chooser — not a spreadsheet operator, not a combat god.

Every UI and mechanic asks: *Does this make me feel like a Voyager among Money Mascots?*

| Fantasy yes | Fantasy no |
|-------------|------------|
| Piggy + Coin Bag as living receipts | HP bars / duel chrome on Talk |
| Money Carpet as myth islands | PERF / Dev Errors as first-viewport chrome |
| Quiet first-meet Harbor | Sterile settings void behind Talk |
| Cove Take that Harbor can name later | Ledger dashboards as hero before Change |
| Organs speaking (Coin holds · Clock shelters · Spiral withstands · Memory keeps) | Genre cities that are not money organs |

**Identity** emerges from play (scars, weather, Soft Beats, Piggy lines) — never from an “I am a Saver” menu.

**World names:** product **Capital** · player world **Fortune Archipelago** · home **Harbor Haven**.

---

## THE ONE-SENTENCE GAME

> In a world where money is alive, a washed-ashore Voyager learns that fortune is a journey of choices — guided by Money Mascots across the Fortune Archipelago — until they escape paycheck-to-paycheck and return home transformed.

**Craft compression:**  
*I choose something about money → the living world marks it → Harbor remembers → I face the next living choice.*

**Iconic phase north star:** Make **one money choice** feel unforgettable.

**Mural:** *You are inside living money. Harbor remembers. Cove holds. Paycheck clocks. Credit spirals.*

**Subject (chase target):** Capital’s real subject is **decision-making under constraints**. Money is the medium. Liquidity, debt, risk, careers, housing, inflation — different environments for the same deeper questions (want · information · tradeoff · possibility · uncertainty tolerance · what this locks in later). If that is fun, financial literacy does not bolt onto the game — **it is the gameplay.** See [design/DECISION_CONSTRAINTS_NORTH_STAR.md](./design/DECISION_CONSTRAINTS_NORTH_STAR.md).

---

## THE CORE LOOP

### Signature loop (protect this)

1. Irreversible **Take** (Cove → Paycheck → Credit)  
2. Soft chapter **hush**  
3. Harbor **scar spectacle** (“Harbor felt that”) + Memory **Plinth** glow  
4. **Share** PNG (default social object)  
5. Quiet plaza → **Piggy** homecoming  
6. **Day-2** rumor + locals naming the plaque  

### Journey shape

```
Harbor (home) → Guide points → Act (talk / spend / outfit)
  → Carpet → Island Story Circle
    → Earn / choose / learn → Return changed
      → Harbor grows → Soft Beat / Freedom / harder doors
```

### Money Structures (depth, not width)

| Place | Structure | Soft Beat |
|-------|-----------|-----------|
| Coincraft Cove | Giant Coin Jar | Lid Lookout |
| Harbor Haven | Ledger Bank | Teller Window |
| Paycheck Peninsula | Payroll Tower | Umbrella Loft |
| Credit Kingdom | Interest Keep | Score Battlement |

### Loop killers (do not ship)

- Long travel that cools the Take mark  
- Stall / Freedom / Arcade dashboards stacked on spectacle  
- Multiple coaches racing the same first hour  
- XP / seals / quizzes substituting for Memory feel  
- Soft Beat never invited after Change  

---

## PRIMARY PLAYER VERBS

| Layer | Verbs |
|-------|--------|
| **Organ suit** | Memory *keeps* · Coin *holds* · Clock *shelters* · Spiral *withstands* |
| **Body** | Walk · Look · Poke (toys answer) |
| **Social** | Talk (opt-in: approach → **E**) · Share · Witness (local) |
| **Money commit** | Take · Spend / Deal · Soft Beat peek · Pay Day · Board fork |
| **Travel** | Board Carpet · Enter Structure · Leave (Esc) |

**Most frequent satisfying beat:** **Commit** — confirm a living-money fork when the world offers a clear prompt. Walk positions; Commit lands.

**Coin Bag:** lifelong pointer buddy — prefers Main Quest; never races ahead alone.

**Ashore teach order:** Walk · Talk · board Cove — then Harbor remembers.

---

## DESIGN PILLARS

1. **Adventure-first learning** — money concepts are quests in a place, not worksheets with sprites.  
2. **Decisions have consequences** — branches, fail/retry dignity, weather, scars; wrong answers cost time or coins, not shame.  
3. **Delightful juice** — motion, SFX, stingers, readable UI; accessibility is part of delight.  
4. **Depth before width** — Soft Beat · scar · Plinth · share · Piggy · day-2 · Structure interiors before new main-course islands.  
5. **Mural law** — if it cannot name a **money organ + suit verb**, it does not ship on the spine.  
6. **Fewer systems, richer interactions** — depth = cross-system consequences, not more meters.  
7. **Harbor names truth** — progression as plaza memory and Plinth glow, not level-up toast spam.  
8. **Secrets from rules** — Takes, Soft Beats, weather, ledger, Family Room — not scavenger collectibles.  
9. **Local humans when it matters** — social features only when another person creates gameplay a CPU cannot fake.  
10. **Longevity without grind** — mastery · interaction · uncertainty · expression · local social · emergence.

---

## ANTI-PILLARS

| Do not | Why |
|--------|-----|
| Widen main quest beyond Cove → Paycheck → Credit | Breaks iconic freeze; dilutes organs |
| Fake multiplayer / global leaderboards / online trade / alliances | Retention theater; grief; freeze break |
| Merge Nathan / BMO / CBE into Capital | Foreign cosmos |
| Justify with “other games have this” | Copycat; fails fantasy test |
| Parallel hollow meters (affinity, silent XP, stance/skill panels as progress) | Cognitive load without story |
| Dual weather fictions (macro boom + CF sky) on Harbor Pay Day | Unreadable economy |
| Genre HUD / tip curriculum instead of Harbor memory | Second syllabus |
| Grind longevity (XP sinks, vanity carpet walls, login theater) | Time without judgment |
| Secret % meters / “find all Soft Beats” | Completionist hunt ≠ curiosity |
| Treat retention telemetry as proof of love | Metrics investigate; they don’t celebrate |
| Pay-to-win | Product law |

---

## ECONOMIC PHILOSOPHY

Economy is a **living loop**, not a pile of counters:

```
Liquidity (pouch) ↔ Cashflow (monthly engine) ↔ Memory (scars)
        ↕                      ↕
   Harbor weather / shops    Next opportunity / risk
```

**Laws**

1. **One liquid currency** — pouch coins.  
2. **One engine** — net monthly cashflow (assets − living − liabilities).  
3. **Memory is a stock** — Takes spend options, weather, and trust — not only pouch.  
4. **Opportunity cost** on every major spend verb.  
5. **Second-order response** — if Harbor doesn’t react, it doesn’t ship as economy.  
6. **Finite exploit surface** after Freedom — regenerate tradeoffs; don’t invent XP sinks.  
7. **Unify shocks on CF weather** for Harbor sky/shops; keep modular-market boom/recession scoped to those minigames.

**Freedom Seal:** cashflow ≥ **$30/mo** for **3** Harbor Pay Days — earned escape, not an instant Fortune flyer.

**Assets** = pouch now → CF later. **Takes** = identity investment Harbor can name.

**Sims** (`ECONOMY_SIM`) measure imbalance and *why*; they never auto-rebalance live constants.

---

## PROGRESSION PHILOSOPHY

Every unlock must answer: **What new decision does this create?**  
If none → demote, hide, or cut.

**Nest, don’t stack**

| Horizon | Example |
|---------|---------|
| Short | Take → Soft Beat → day-2 |
| Medium | Deals → CF → Freedom Seal |
| Long | Freedom + mastery → Credit Ordeal |

**Keep as progress (decision-bearing):** Cove/Paycheck/Credit Change · Soft Beat lookouts · Freedom · mastery gates into Credit · capsules as board verbs · Structure pads · Piggy/day-2 · Harbor Felt share · plaza memory.

**Demote as “progress”:** Islands XP/level · skillStats HUD · wealth rank ladder · carpet vanity past Fortune flyer · ritual streak counters · weekly % · party seals confused with Freedom · companions-as-power · economy-phase widget on Harbor.

Side tomfoolery and era **SIDE SHORES** never gate Credit. Carpet’s *progression* story ends at Fortune flyer; further polish is expression, not mastery.

---

## SYSTEMIC DESIGN RULES

Prefer: **What could existing systems do together?** over **What new system can we add?**

**High-value chains (multiply these)**

```
Take residue → Ledger → Pay Day / CF → Harbor weather → Soft Beat / Piggy → next Take
Day-2 echo → Weather reading → Soft Beat → next organ door
Board fork → Capsule / liability choice → CF → weather
Scar → Plinth share → Family Witness → household myth
```

**Dangerous pairs**

- Dual weather engines on Harbor  
- Stance + skillStats as dual personality vs organs  
- Party board taught as second Freedom campaign  
- Tip NPC syllabus vs organ cold-retell  

**Complexity law:**  
value ≈ (decisions + interactions + emergence) / (rules + UI + cognitive load)

**Cut rule of thumb:** If a system does not change a **Take**, **Soft Beat**, **scar**, **Freedom CF**, or **Plinth** truth within one session → cut candidate.

**Target end-state:** one pouch · one CF · one Harbor weather · Memory scars as identity · Take→Plinth as depth engine · local Family Room as human myth.

---

## PLAYER AGENCY RULES

A choice is meaningful when it has:

- Multiple viable options  
- Different consequences  
- Incomplete information  
- Real trade-offs  
- Context dependence  
- Future implications  

Fix weak agency by changing **system relationships**, not only numbers.

**Concrete Capital rules**

- Soft Beat vs arcade: Soft Beat **arms the next living choice**; arcade earns *now*.  
- Deals: in storm/tight weather, **passing** can be correct.  
- Liability land: **borrow / buyout / walk** — informed forks, not silent drain.  
- Lucky / capsule RNG must **pressure a choice** (spend vs bank; pick 1 of 2) — not auto-payout.  
- Spine Take forks: equal cinema dignity; economic futures *may* differ via ledger residue.  
- Talk never auto-starts — approach → prompt → E.  
- Fake choices (cosmetic A/B continues, identical unlock both ways with no Soft Beat/Piggy read) → cut or deepen consequence.

Vanity spend (companions / polish) must not pretend to be power. Capsules may be tactical; pets are look.

---

## DIFFICULTY / FAILURE RULES

| Situation | Law |
|-----------|-----|
| Minigame miss | Dignity overlay: why + **Retry** / stay put; keep self-respect |
| Structure fail | Do not dump to Harbor; clearer next verb in place |
| Soft gates | Coins, Freedom, mastery — never silent soft-locks |
| Risk | Higher return needs exposure; no arbitrary punishment |
| Dice | May surprise; **choice after land** teaches |
| Loss | Must open a new decision (paydown, rebuild CF, walk) |
| Recovery | Restores agency; **scars remain** on the Plinth |
| Mastery quiz | Knowledge gate; dignity on fail; no coin slap for curiosity |
| Storm economy | Do not turn low CF into a permanent bargain bin that rewards failure |

Wrong answers cost **time or coins**, never shame.

---

## FEEDBACK RULES

Chain every important action:

**INPUT → RESPONSE TIME → ANIMATION → AUDIO → VISUAL → STATE → REWARD**

Clarify response first. Never substitute excess juice for missing mechanics.

| Layer | Use |
|-------|-----|
| Micro | Walk, poke, hover |
| Confirm | Talk open, pad enter, deal buy |
| Economy | Coin gain/spend, Pay Day |
| Progress | Soft gates, Freedom, Change |
| Signature | Take mark, scar hush, Plinth spectacle, share, Soft Beat, day-2 |

**Audio:** one bed per frequent action (juice *or* Capital SFX — not both), except signature cinema. Reserve `scar_chime` / organ stingers for Memory-true beats.

**Cinema:** world captions over Plinth camera lock — not modal quest cards. Share = freeze-frame lower-third over live Harbor.

**Mute test:** Take mark + Harbor felt must still *read* at volume 0.  
**Motion:** `prefers-reduced-motion` = Settings OR OS; damp Take/Plinth strobes.

If copy says Piggy waves, the mesh plays that emote the same frame.

---

## SOCIAL DESIGN RULES

Ask of every social feature:

> **What interesting gameplay exists specifically because another human is involved?**

If a CPU temperament, rumor deck, or scripted NPC could fake it → **skip**.

| Ship (local) | Do not ship |
|--------------|-------------|
| Family Room roster + JSON paste | Fake multiplayer backend |
| Family Challenge (one household-authored goal) | Global leaderboards |
| Share Witness (cheer / caution / curious) | Online trade / markets |
| Hot-seat board rivalry | Alliances across accounts |
| Harbor Felt PNG outbound | Global reputation |

**Anti-grief:** no wipe powers over another’s scars or coins; soft text only; voluntary complete; one challenge at a time; Witness never edits plaque or ledger.

Community “secrets” = household organ shelf (local myth) — never a server ARG.

---

## CONTENT DESIGN RULES

- The **whole journey is the story** (Harmon Story Circle + Hero’s Journey). A feature must serve a beat and return the Voyager changed.  
- **Main Quest** vs **Side Tomfoolery** — Coin Bag prefers Main.  
- Expansions **plug into** Fortune Archipelago mythology — no second cosmos.  
- Era **SIDE SHORES** may ride the outer ring; they are not new main-course strip chips.  
- Park creep in [iconic-later.md](./iconic-later.md).  
- **Piece checklist:** organ? verb? poke answers? home changes? child can name after one session?  
- Secrets ladder: ambient → experiment → cross-system → local community. Soft curiosity tracking; never a Credit gate; no “find all” meter.  
- Authored spine stays myth (don’t multiply Takes for longevity); deepen **mechanical possibility** (residue, board seeds, forks).  
- Cold-retell kid sentences per organ (Coin · Clock · Spiral · Memory) are content law after Harbor return.

---

## UI / UX RULES

### Navigability law (bugs if broken)

- **Esc** + visible **Leave** on every overlay  
- Tall content scrolls; Complete stays sticky  
- Backdrop closes unless mid-purchase  
- Coach = **one** next verb  
- Coin Bag stays in sync with the real next Main beat  
- Corrupt save sanitizes to playable Harbor — never bricks  

### Harbor chrome

- Quiet until Piggy first meet / quiet homecoming: no CASH / stall grid / Ritual auto-open over cinema  
- Ashore path: Talk Piggy → Carpet → Cove; Outfitter / Capsule / Ritual = discoveries, not gates  
- One first-hour coach path (Ashore + Piggy `meet_guide`)  
- Memory chrome collapses into the **Plinth** (one “Harbor remembers” surface)  
- Structure pads readable by silhouette without HUD text  
- Title voice on thresholds: Capital → Fortune Archipelago → organ/place → diegetic verb  
- One Harbor kid-drawable icon: **Memory Plinth**

New chrome, cards, dashboards, and hero overlays are **high cost** in feature approval.

---

## BALANCE PRINCIPLES

1. Higher return ↔ meaningful exposure.  
2. Recovery without erasing scars.  
3. Dominant strategies (always-buy, always-one-Take-fork with identical futures, quiz-only Credit) are design bugs — fix relationships.  
4. Post-Cove earn should clear early polish/first seal without forcing Fortune grind.  
5. Freedom requires sustained CF — not a single lucky Pay Day.  
6. Companions and cast faces are **expression**, never CF gates.  
7. Party board is a **post-Freedom toy**, not a second campaign.  
8. Economy Monte Carlo flags investigation; humans change constants.  
9. No pay-to-win.  
10. Prefer regenerating **tradeoffs** after the deal catalog clears over inflating prices or XP.

---

## METRICS

### Product targets (investigate, don’t worship)

From [game-pillars.md](./game-pillars.md): D1 / D7 retention, quest and tutorial completion, minigame clear rate, time to first quest. Session targets: **10–15 min** families · **20–30 min** teens/adults.

### Telemetry principles

- Stable, append-only event names  
- **Id-only** payloads — scrub names, dialogue text, scar labels, PII  
- Local-first where possible  
- Metrics **flag investigation**; they never prove enjoyment  
- Instrument: onboarding, core_loop_cycle (take · harbor_felt · soft_beat · …), fail loci, resource flows, decision skew (>90% one branch ⇒ fake choice), abandon points, retries, system interactions  

### Playtest laws

- Capture attempted · believed · actual  
- **OBSERVATION ≠ INTERPRETATION ≠ PROPOSED FIX**  
- Don’t fix every complaint — ship on recurring patterns (≥2 sessions); blockers always candidates  
- After each iconic pass: the cold six questions in [iconic-path.md](./iconic-path.md)

---

## FEATURE-APPROVAL RULES

Before building:

1. Pass **freeze** and **anti-pillars**.  
2. Pass the **chase-target tests** in [design/DECISION_CONSTRAINTS_NORTH_STAR.md](./design/DECISION_CONSTRAINTS_NORTH_STAR.md) (constraint · deeper questions · money-as-medium · transfer · order).  
3. Name **organ + suit verb** if it touches the spine.  
4. Prefer lifting **≥3 existing systems** over adding a toy.  
5. Score value vs cost (see `FEATURE_GATE` / `docs/feature-gate/` when present).  
6. Respect **implementation order** — do not jump to AI guide, story engine, social, or giant sim before Audit→…→Real users holds.

**Value axes (examples):** fantasy · loop · meaningful decisions under constraints · existing systems · emergence · mastery · expression · replay · local social · memorable stories.

**Cost axes (examples):** cognitive · UI · tech · balance · maintenance · content.

| Verdict | When |
|---------|------|
| **Reject** | Freeze fail, copycat-only why, value &lt; cost, literacy bolted on as quiz/chrome |
| **Park** | Interesting but not now → [iconic-later.md](./iconic-later.md) |
| **Accept with conditions** | High cost or weak multi-system coupling — require Soft Beat / Plinth / CF wiring |
| **Accept** | Value ≥ cost, no freeze fails, preferably ≥3 systems touched |

**Prefer:** one change that lifts Soft Beat + ledger + Plinth over three unrelated toys; world teaching over chrome; local social myth over leaderboards; emergent rules over collectibles.

**Hard rejects:** map width · fake MP · foreign merge · “other games have this” as the main why · grind-as-longevity · starting with AI guide / story engine / social / giant simulation before the chase sequence.

---

## Final question (every future feature)

> **Does this make decision-making under constraints more interesting — with money as the medium — and help Capital generate a more interesting player story?**

A *player story* is a retellable chain the quest log did not fully author — across Take residue → ledger → weather → Soft Beat → Plinth share → (optionally) a household Witness stamp — spoken in organ language (“The Coin holds — Harbor remembered…”).

If the honest answer is only “they clear content faster,” “they farm longer,” or “they pass a quiz,” **do not ship**. Deepen interactions among Take · Soft Beat · cashflow · weather · Plinth · Family Room instead.

---

## Living amendment

This constitution evolves when cold playtests, economy sims, or merged audits prove a law wrong. Amend deliberately: update this file, note the reason in the PR, and retire conflicting one-off rules.

**Runtime wiring (player-visible):** `src/design/designBible.ts` + Harbor / Soft Beat / Family Room / Board Star / tip Talk changes — see `BIBLE_RUNTIME_LAWS`. If a law is listed there as `true`, it must show up when you play Capital, not only in this doc.

When in doubt: make the Plinth glow true, make tomorrow remember yesterday — and make the remembrance **interesting**.
