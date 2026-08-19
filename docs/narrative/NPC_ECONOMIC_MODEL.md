# NPC economic model

**Status:** Design law for persistent economic actors — **not yet a live save schema**  
**Companion:** [CHARACTER_MEMORY_ARCHITECTURE.md](./CHARACTER_MEMORY_ARCHITECTURE.md)  
**Canon:** [CAPITAL_DESIGN_CONSTITUTION.md](../design/CAPITAL_DESIGN_CONSTITUTION.md) Principle 8 (characters create human stakes) · Principle 14 (AI never owns simulation truth)  
**Shipped today:** Cast + dialogue + light `npcMemory` (talk counts). **Not** per-NPC ledgers.

Capital NPCs are **Money Mascots who run lives**, not tip dispensers. A major NPC has an economic situation the player can bump into. The same Harbor event (a Take, a Pay Day, a bill) can be **true in one sim** and **interpreted differently** in each character's mouth.

---

## Four layers (non-negotiable)

| Layer | Who writes it | Who may speak it | May an LLM invent it? |
|-------|---------------|------------------|------------------------|
| **CANONICAL FACTS** | Authors / Story Bible / island JSON ids | Language may *name* them | **No** |
| **SIMULATION STATE** | Deterministic engine (ledger, scars, clocks, consequence rows) | Language may *report* them | **No** |
| **CHARACTER MEMORY** | Sim writes *what they observed*; authors seed starting memories | Language may *recall* them | **No new memories** |
| **CHARACTER INTERPRETATION** | Authored stance + rules; LLM may *phrase* the interpretation | This is the spoken layer | **Phrasing only** |

If a line needs a number, a holding, a scar, or a relationship that is not in layers 1–3, **do not generate it**. Fall back to authored Talk Battle graphs.

---

## Field dictionary (every major NPC)

All major NPCs share this card. Fields live in **exactly one layer**.

### CANONICAL FACTS (authored, versioned, rarely change)

| Field | Meaning |
|-------|---------|
| `id` | Stable id (`piggy_penny`, `npc_keeper_kira`, `npc_collector_rex`) |
| `name` / `organ` / `place` | Identity; money organ they embody or serve |
| `occupation` / `business` | How they earn in the myth (Harbor Keeper desk, lighthouse jar, stall, Bank of Obligation) |
| `goals` | Durable wants (keep Harbor safe, fill the village jar, get paid on time) |
| `values` | Trade-off ranking (liquidity vs display, patience vs haste, dignity vs collection) |
| `relationships` | Authored ties to other NPCs (not player) — Alma↔Kira, Pat↔Priya, Rex↔Bank |
| `risk_tolerance` | Authored band: `cautious` · `balanced` · `aggressive` |
| `knowledge` (curriculum) | Which money concepts they are *allowed to teach* without spoiling transfer |
| `starting_books` | Default income, expenses, assets, liabilities **templates** (not the live numbers) |

### SIMULATION STATE (live, tickable, never LLM-authored)

| Field | Meaning | Capital analogue |
|-------|---------|------------------|
| `income` | Recurring inflows this period | NPC mini-ledger (future); player uses `voyagerLedger` |
| `expenses` | Recurring outflows | Same |
| `assets` / `liabilities` | Named holdings | Same shape as `LedgerHolding` |
| `economic_pressures` | Derived: net CF, due dates, weather, player Takes that hit *their* books | `harborWeather`, spine footprints |
| `trust` | Willingness to offer deals / wait / gossip honestly — **not** an affinity heart | Derived from memories of player verbs |
| `player_relationship` | Structural role vs Voyager: `guide` · `peer` · `vendor` · `rival` · `collector` · `witness` | Dialogue graph + homecoming |
| `current_objective` | What they are trying to do *this session* | Harbor hour schedule + quest track |
| `long_term_objective` | What they want across the campaign | Authored + unlocked by player Change |

**Law:** Trust, income, and holdings change only through **verbs + consequence engine**, never through generated prose.

### CHARACTER MEMORY (observed events, capped)

See [CHARACTER_MEMORY_ARCHITECTURE.md](./CHARACTER_MEMORY_ARCHITECTURE.md). Memory stores **what happened from their vantage**, not how they feel about it.

### CHARACTER INTERPRETATION (lens)

How this NPC *reads* a remembered event given goals/values/pressures. Stored as a **lens id + parameters**, not as free text that becomes new canon.

Example lens ids: `keeper_of_jars`, `fountain_vendor`, `obligation_collector`, `plaza_gossip`.

---

## Who is “major”

Depth before width: full economic cards for **spine actors**. Plaza locals and series leads stay lighter until Cove Change is proven in human playtest.

### Tier A — full economic actors (design now)

| Id | Place | Occupation | Organ |
|----|-------|------------|-------|
| `piggy_penny` | Harbor Haven | Harbor Keeper | Memory *keeps* |
| `npc_keeper_kira` | Coincraft Cove | Savings lighthouse keeper | Coin *holds* |
| `npc_artisan_alma` | Coincraft Cove | Craft stall artisan | Coin *holds* |
| `npc_vendor_vee` | Paycheck Peninsula | Fountain stall vendor | Clock *shelters* |
| `npc_payroll_pat` | Paycheck Peninsula | Payroll / Clock buckets | Clock *shelters* |
| `npc_collector_rex` (`debt_collector`) | Credit Kingdom | Collector for Bank of Obligation | Spiral *withstands* |

### Tier B — supporting (cards exist; thinner books)

| Id | Role |
|----|------|
| `npc_captain_penny` | Dock / first earn |
| `npc_shelly` | Side digression (shell want) |
| `npc_planner_priya` | Optional Clock buckets (post-Take, no spoiling) |
| `npc_coach_carlos` | Practice / dignity fail |
| `vault_vince` | Harbor Bank / Soft Beat Teller |
| `coiny` | Plaza circulation (count before spend) |

### Tier C — presence only (no personal ledger)

Harbor roamers, series-lead terrace cameos (`cashwell`, `cashmere`, …). They may **witness** scars (gossip lines from `worldMemory`) without owning businesses. Family Room humans are **players**, not NPCs.

---

## Canonical cards (authored facts)

Numbers in **starting_books** are design defaults for a future NPC ledger — they do not ship as player HUD. They exist so interpretation has something true to stand on.

### Piggy Penny — Harbor Keeper

| Field | CANONICAL FACT |
|-------|----------------|
| Goals | Keep Harbor readable; name Takes without spoiling the next organ; get the Voyager to the carpet |
| Values | Memory over meters; dignity over shame; one next verb |
| Relationships | Plaza locals report to the Keeper desk; series leads are guests, not bosses |
| Occupation | Harbor Keeper (fountain / Plinth / homecoming) |
| Risk tolerance | Cautious (protects kids + first hour) |
| Knowledge | May name *this* plaque and *next painting* — may **not** map Cove answers onto Paycheck |
| Starting books | Small stipend from plaza (Memory organ). Expenses: keep the fountain and Plinth lit. Assets: Harbor trust, not a personal fortune. Liabilities: none that the Voyager owes Piggy |
| Current objective | `meet_guide` → `to_dock` until done; later: homecoming Talk after Change |
| Long-term objective | Voyager earns Freedom; Harbor still feels like home |

**Player relationship:** `guide` then `witness`. Trust starts high; drops only if the Voyager repeatedly skips Talk and treats Harbor as a menu (recovery: Coin Bag re-hook, not affinity punishment).

### Keeper Kira — Lighthouse / jar

| Field | CANONICAL FACT |
|-------|----------------|
| Goals | Village jar holds; the Take is real |
| Values | Hold before display; irreversible honesty |
| Relationships | Alma sends Voyagers to the lighthouse; Shelly competes for pouch attention |
| Occupation | Savings lighthouse keeper |
| Risk tolerance | Cautious |
| Knowledge | Coin Hold (jar vs treat). Not Clock buckets |
| Starting books | Income: village keep. Asset: the Giant Coin Jar (place, not player property). Liability: none |
| Current objective | Offer the jar Take once |
| Long-term objective | Harbor can name what the village held |

### Artisan Alma — Craft market

| Field | CANONICAL FACT |
|-------|----------------|
| Goals | Fair earn, clear the bench, send Voyagers toward Kira |
| Values | Work then choose; craft over glitter |
| Relationships | Mentors toward Kira; respects Captain Penny's dock |
| Occupation | Artisan stall |
| Risk tolerance | Balanced |
| Knowledge | Earn-then-decide. Must not complete the jar Take for the player |
| Starting books | Variable stall income; expenses: supplies; asset: craft bench; liability: none required |
| Current objective | Quest start (brushes / path to Take) |
| Long-term objective | Cove stays a place you return to, not a worksheet |

### Vendor Vee — Fountain stall

| Field | CANONICAL FACT |
|-------|----------------|
| Goals | Sell two prices honestly; Clock organ, not Coin rerun |
| Values | Shelter vs sparkle; no “this is the Take” lecture |
| Relationships | Pat/Priya own buckets *after* Vee's fork — Vee does not spoil |
| Occupation | Fountain vendor (umbrella vs glitter) |
| Risk tolerance | Balanced (lives on variable stall cash) |
| Knowledge | Rainy-day trade-off. Forbidden: naming Cove jar/treat answers |
| Starting books | Income: stall. Expenses: stock. Asset: fountain pitch. Pressure: weather + player's leftover |
| Current objective | Present the analogous problem |
| Long-term objective | Peninsula remembers which price won |

### Payroll Pat

| Field | CANONICAL FACT |
|-------|----------------|
| Goals | Pay on time; Clock buckets as optional deepen |
| Values | Predictable income; envelopes before wants |
| Occupation | Payroll / town Clock |
| Risk tolerance | Cautious |
| Knowledge | Cashflow, payday cadence — post-Vee only |
| Current / long-term | Side quest after Change; never first-hour coach |

### Collector Rex — Bank of Obligation

| Field | CANONICAL FACT |
|-------|----------------|
| Goals | Obligation honored; spiral test completed (Inbox → Scanner → Take) |
| Values | History over excuses; haste has interest |
| Relationships | Villain of the Ordeal, not Harbor staff. Debt Cloud is weather, not a second boss |
| Occupation | Collector |
| Risk tolerance | Aggressive **on the player's behalf** (pressure), cautious **on the bank's books** |
| Knowledge | Interest, wait vs borrow. Must not be a quiz wall |
| Starting books | The Bank's asset is *your* liability. Rex does not have a cute stipend — pressure is the point |
| Current objective | Advance `creditEncounter` graph (`r1` → `r_fork` → `r_remember`) |
| Long-term objective | Voyager withstands; Harbor still keeps the plaque |

**Player relationship:** `collector` / `rival`. Trust is **economic** (will the Bank wait?) not friendship.

---

## Simulation state (live)

Until an NPC ledger ships, **player-facing sim truth** remains:

- Voyager `voyagerLedger`
- `harborScars` / `irreversibleChoices`
- `harborWeather` (CF → sky → shop)
- Consequence engine (prototype, disconnected) domains: `relationships`, `reputation`, `neighborhood`, `story`

**Target NPC tick (later adapter):**

```
onConsequenceFired(domain, entities)
  → if entity.kind === "npc" && entity.id === this.id
      apply to this NPC's books / trust / current_objective
```

NPCs do **not** get Freedom Seal or Credit unlocks. Those belong to the Voyager. NPCs get **pressures** when the Voyager's Take changes shared Harbor weather or stall demand.

### Trust (derived, not a meter HUD)

```
trust = f(memories of player verbs)
  + Pay Day honored / bills faced
  + Takes that match this NPC's values
  − spoiling, skipping, treating them as a quiz
```

Never show a heart or XP bar. Piggy's `piggyBondHomecomings` is a **count of ceremonies**, not trust.

### Player relationship (enum)

`guide` · `witness` · `vendor` · `mentor` · `peer` · `rival` · `collector`

Changes only on authored beats (homecoming, Change complete, Credit graph node) — not on LLM chat.

---

## Same event, different interpretations

**Event (SIMULATION STATE):** Voyager commits Cove Take `spend` (treat). Ledger writes treat tab. Harbor schedules a scar.

| NPC | INTERPRETATION (lens) | They may say (authored or LLM-phrased) |
|-----|----------------------|------------------------------------------|
| **Kira** | Jar was refused; village hold failed this round | Names the treat as the thing Harbor will keep |
| **Alma** | Earn happened; the *choice* still counts | Dignity: you can rebuild; the bench is still there |
| **Piggy** | Memory keeps whichever fork; next verb is carpet home | Plaque language; **does not** lecture Paycheck answers |
| **Vee** | (If they ever hear it) Coin organ, not Clock | Must **not** remap treat → glitter |
| **Rex** | Irrelevant until Credit | Silence / no invented “I heard you spent” unless memory layer has a Harbor rumor they were authored to receive |
| **Vince** | Rainy-day buffer just got harder | Liquidity warning in Harbor voice, not shame |

**Law:** Interpretation cannot invent that the jar holding exists if the sim wrote a treat tab.

---

## LLM contract

Allowed:

- Generate Talk Battle *wording* from a **prompt pack**: canonical facts + allowed memories + current interpretation lens + visibility (`felt` vs `named`)
- Choose among authored line templates
- Vary warmth / shortness by learning profile (already in `ROLE_TIPS`)

Forbidden:

- New scars, holdings, prices, quest completion, trust deltas, map unlocks
- Teaching the next analog problem's answer
- Fake multiplayer (“your friend paid Rex”)
- Invented NPC businesses or debts

**Test:** Delete the LLM. Authored graphs still play. Simulation outcomes identical (Constitution 14).

---

## Mapping to shipped code (honest)

| Need | Exists | Gap |
|------|--------|-----|
| Identity, tagline, role | `moneyCast.ts` | No books |
| Persona kit | `npcPersonas.ts` | Visual, not economic |
| Talk graphs | island JSON + `harborTalks.ts` | Mostly tips, not books |
| Memory | `NpcMemoryEntry` talks + lastChoiceIds | No event log |
| Ambient lives | `harborNpcLives.ts` | Schedule, not CF |
| Behavior | `NpcBrainViews.tsx` | Pose + scar echo line |
| Villain graph | `creditEncounter.ts` | State machine, not ledger |
| Player books | `voyagerLedger.ts` | NPC books MISSING |

---

## Implementation order (not this doc PR)

1. Author Tier A cards as data (JSON or TS const) — canonical only  
2. Memory log (see sibling doc) — still no LLM  
3. Adapter: consequence rows with `affected_entities` of kind `npc`  
4. Optional language model **reader** of frozen prompt packs  
5. Never: NPC net-worth leaderboard (anti-pillar)

---

## Anti-patterns

- Affinity romance meters  
- Spreadsheet NPCs the player “operates”  
- Rex as HP boss  
- Piggy as lecture platform  
- Series leads with fuller books than Kira/Vee  
- LLM inventing that Alma is in debt this week
