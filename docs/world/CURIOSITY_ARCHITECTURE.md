# Curiosity architecture

**Status:** Location/POI audit + attraction design  
**Companion:** [MEMORY_MAP.md](./MEMORY_MAP.md) · [ECONOMIC_ENVIRONMENT_SYSTEM.md](./ECONOMIC_ENVIRONMENT_SYSTEM.md) · [QUEST_AUDIT.md](../narrative/QUEST_AUDIT.md)  
**Law:** Curiosity is preferable to checklist exploration (Constitution 10). Map markers are for **destinations you cannot see**, not every pad. Economic attraction must match sim state (no fake cranes).

---

## How to read a place

For every location / POI:

| Question | Why it matters |
|----------|----------------|
| Perceive before arriving? | Silhouette, sound, rumor, map chip, carpet rail |
| Why curious? | Contrast, motion, unfinished question |
| Mystery? | A dramatic question, not a tooltip |
| System? | Ledger, Talk, structure, board, weather… |
| Character/story? | Who lives here; which Harmon beat |
| What can change? | Scar, hush, unlock, weather, NPC line |
| What can you learn? | Transferable, or only local drill |
| Map marker? | **Yes** only if you cannot find it by landmark + Coin Bag |

---

## Classes

| Class | Meaning |
|-------|---------|
| **ESSENTIAL** | Loop dies without it |
| **SYSTEMIC** | A live system operates here |
| **NARRATIVE** | Authored situation / Change / cinema |
| **CHARACTER** | Named NPC home |
| **ECONOMIC** | CF/weather/prices/holdings readable |
| **SCENIC** | Mood, organ look, peek |
| **UTILITY** | Settings, journal, map UI, studio |
| **FILLER** | No mystery, no unique system, interchangeable with another pad |

A place may wear **two** classes (e.g. ESSENTIAL + NARRATIVE). **FILLER** is exclusive: if filler, it should be cut, merged, or demoted off the first hour.

---

## Attraction toolkit (honest)

Pull the eye **without** inventing GDP.

| Tool | Use | Do not |
|------|-----|--------|
| **Landmarks** | Jar, Bank, Tower, Keep, Plinth, Carpet gate | Second fake skyline per era shore |
| **Movement** | Carpet rail, fountain, Coin Bag, roaming locals | Traffic sim |
| **Crowds** | Bound to weather **when** `crowdDensity(mood)` exists; until then **constant** plaza cast | Extra NPCs = prosperity |
| **Construction** | Future Shores scaffold **only** (authored unfinished) | Random Harbor cranes |
| **Sound** | Organ bed, hush duck, Take/Harbor-felt; weather bed later | Recession sting vs boom CF |
| **Signage** | Lock hints, organ verb, price tags that match `scaleHarborPrice` | Quest % checklists |
| **NPC conversation** | Opt-in Talk; ambient scar echo | Tip curriculum racing Take |
| **Visual contrast** | Quiet Harbor vs organ shores; hush dims structure | Genre HUD on spine |
| **Economic change** | Sky/fog/prices from CF; plaques from scars | Store closures without books |

**Before arriving:** map chip (island) or plaza silhouette (POI). **After landing:** landmark + motion + one Coin Bag sentence — not a GPS pin on every cork.

---

## Map marker policy

| Needs a **travel-map** marker | Does not |
|------------------------------|----------|
| Harbor, Cove, Paycheck, Credit (spine chips) | Outfitter, Capsule, Settings |
| Side shores **after** Paycheck Change (outer ring) | Individual shore play pads |
| — | Structure **parts** (cork, teller) |
| — | Journal, arcade catalog games |
| — | Demo Key Cove (parked) |

Shore **pier** is the leave verb, not a world pin. Coin Bag may point at **main** next verb without spraying markers.

---

# Audit — destinations (islands)

Perceive-before = archipelago map / carpet approach / lock copy.

### Harbor Haven — `harbor_haven`

| | |
|--|--|
| Perceive | Meadow hub; Memory courtyard; carpet dock |
| Curious | Ordinary World vs living money; Piggy; Plinth after a Take |
| Mystery | Will this place remember me? |
| System | Hub verbs, shop, weather, cinema, Family Room |
| Story | Castle Grounds; homecoming |
| Change | Scars, quiet, Freedom pavilion, prices |
| Learn | Presence verbs; Memory *keeps* |
| Map marker | **Yes** (hub) |
| Class | **ESSENTIAL** · NARRATIVE · ECONOMIC · CHARACTER |

### Coincraft Cove

| | |
|--|--|
| Perceive | Coin organ painting; jar landmark on approach |
| Curious | First real fork |
| Mystery | Hold or spend — which does Harbor keep? |
| System | Take, jar structure, first coins |
| Story | Island 1 Change |
| Change | Footprint, scar, side-shore unlock |
| Learn | Coin *holds*; irreversible |
| Map marker | **Yes** |
| Class | **ESSENTIAL** · NARRATIVE · SYSTEMIC |

### Paycheck Peninsula

| | |
|--|--|
| Perceive | Clock organ; tower chute |
| Curious | New stall, **no** Cove mapping |
| Mystery | Shelter or glitter? |
| System | Transfer Take, payroll structure |
| Story | Island 2 Change |
| Change | Clock plaque, CF |
| Learn | Independent transfer |
| Map marker | **Yes** |
| Class | **ESSENTIAL** · NARRATIVE · SYSTEMIC |

### Credit Kingdom

| | |
|--|--|
| Perceive | Spiral organ; Keep; lock until Freedom + Paycheck |
| Curious | Forbidden door, then canyon |
| Mystery | Wait or haste under interest? |
| System | Rex graph, Keep, ordeal quest |
| Story | Boss foldback |
| Change | Spiral plaque |
| Learn | Interest; Spiral *withstands* |
| Map marker | **Yes** |
| Class | **ESSENTIAL** · NARRATIVE · CHARACTER |

### Era side shores (8) — after Cove Change

`signal_city` Phosphor Reef · `venture_foundry` Gridlock Galleria · `financial_assets` Budget Kart Coast · `digital_assets` Digital Asset Atoll · `business_assets` Diversify Keep · `intangibles` Intangible Isle · `future_shores` Portfolio Skies · `real_estate` Real Estate Row

| | |
|--|--|
| Perceive | Outer ring **after** Change; genre lens; own music |
| Curious | “A painting woke” — should be myth, not homework |
| Mystery | Weak on most (curriculum districts) |
| System | Side quests, pads; **not** main Take |
| Story | Digression at best |
| Change | Digression scars if authored; else pouch |
| Learn | Often exposition (see quest audit) |
| Map marker | **Yes** as a **shore**, not per-area |
| Class | **SYSTEMIC** (longevity) · often **FILLER** interiors |

**FILLER flag (islands):** none of the 8 should be main-course chips. Several **areas inside** them are filler (below).

Parked **Key Cove**: no marker.

---

# Audit — Harbor POIs (plaza hotspots)

Quiet homecoming may strip to **Plinth only**. First meet hides Bank so E prefers Piggy.

| POI | Perceive | Curious | Mystery | System | Character/story | Change | Learn | Marker | Class | Filler? |
|-----|----------|---------|---------|--------|-----------------|--------|-------|--------|-------|---------|
| **Money Carpet** | Dock silhouette, Piggy points | Where do paintings go? | What’s past Harbor? | Travel | Threshold | Unlocks | Travel verb | No (local) | **ESSENTIAL** | |
| **Piggy** (NPC, not hotspot id) | Fountain, keeper | Who’s home? | Will they name me later? | Talk, homecoming | Guide | Bond, copy | Memory | No | **ESSENTIAL** · CHARACTER | |
| **Memory Plinth** | Glow after scar | What did Harbor keep? | Cold retell | Scars, share | Memory organ | Plaques | Identity | No | **ESSENTIAL** · NARRATIVE | |
| **Ledger Bank** | Vault door east | What’s inside the machine? | Soft Beat vs arcade | Structure | Vince/Memory | Hush dim | Peek / pads | No | **SYSTEMIC** · SCENIC | |
| Outfitter | Stall | Who am I visually? | Weak | Character save | Expression | Look | None required | No | UTILITY | First-hour **FILLER** if it gates |
| Capsule | Stall | Toys for board | Weak | Shop | — | Items | Sinks | No | UTILITY · ECONOMIC | Demote first hour |
| Arcade | After Cove | Replay pads | None | Catalog | — | None | Drill | No | UTILITY | **FILLER** as magnet |
| Harbor Board | Notice slot | Dice? | Weak | Party CF | Rivals | Ledger if cashflow mode | Pay Day toy | No | SYSTEMIC | **FILLER** first hour |
| Daily Ritual | Same slot vs board | Streak? | Weak | Ritual | — | Rumor tick | Low | No | UTILITY | **FILLER** (rumor) |
| Pasaran / market | Market room | Fair trade | Weak | Overlay **no save** | Locals | None | Fake | No | | **FILLER** |
| Freedom Pavilion | Requires Freedom | What did escape buy? | Victory lap | Rooms, carpet floor | — | Unlocks | Agency | No | SYSTEMIC | |
| Studio / gallery | After Cove | Make a level? | Weak | VibeCode | — | Local stamp | Authoring | No | UTILITY | **FILLER** first hour |
| Family Room | Modal | Household myth | Weak | Local JSON | Humans | Witness | Social | No | UTILITY | |
| Settings | Menu | — | — | a11y | — | Prefs | — | No | UTILITY | |
| Editor | DEV | — | — | Content | — | — | — | No | UTILITY | Not product |

---

# Audit — Money Structures (landmarks)

Perceive: unique entry motif (slot / vault / chute / spiral). Marker: **no** (on-shore landmark).

| Structure / part | Mystery | System | Change | Learn | Class | Filler? |
|------------------|---------|--------|--------|-------|-------|---------|
| **Giant Coin Jar** | What’s inside the village hold? | Cove structure | Hush dim after Take | Coin organ | ESSENTIAL · SYSTEMIC | |
| Cork Vault | Arcade world? | `mg_treasure_vault` | Score | Toy | SYSTEMIC | Side |
| Coin Spring | Catch? | `mg_coin_catcher` | Score | Kinesthetic | SYSTEMIC | |
| **Lid Lookout** | Quiet peek — not a Take | Soft Beat | Curiosity | Scenic organ | **SCENIC** · NARRATIVE | |
| **Ledger Bank** | What does Memory keep? | Harbor structure | — | Memory | SYSTEMIC | |
| Safe Heart / Stamp | Arcade | Harbor mgs | — | Toy | SYSTEMIC | |
| **Teller Window** | Peek | Soft Beat | — | SCENIC | |
| **Payroll Tower** | How does a check become buckets? | Clock structure | Hush | Clock | SYSTEMIC | |
| Bucket Press / Time Clock | Pads | budget / inbox | — | Support | SYSTEMIC | Don’t steal Vee |
| **Umbrella Loft** | Peek | Soft Beat | — | SCENIC | |
| **Interest Keep** | How does interest weigh? | Spiral structure | Hush | Spiral | SYSTEMIC | |
| Anvil / Hatch | Practice | signal / inbox | — | Support | SYSTEMIC | Don’t steal Rex Take |
| **Score Battlement** | Peek | Soft Beat | — | SCENIC | |

Soft Beats are **not filler**: they are curiosity without checklist.

---

# Audit — spine shore areas (JSON)

| Area | Perceive | Curious | Mystery | System / who | Change | Learn | Marker | Class | Filler? |
|------|----------|---------|---------|--------------|--------|-------|--------|-------|---------|
| `cc_harbor` | Dock | Earn first? | Pouch | Penny, sort pad | Pouch | Earn | No | CHARACTER · SYSTEMIC | |
| `cc_craft_market` | Stalls | Glitter vs work | Alma / Shelly | Talk, shell | Digression | Want/need | No | NARRATIVE · CHARACTER | |
| `cc_savings_lighthouse` | Jar glow | What’s the Take? | Kira | Irreversible | Scar | Hold | No | **ESSENTIAL** · NARRATIVE | |
| `pp_main_street` | Stall | Two prices | Vee | Transfer Take | Scar | Transfer | No | **ESSENTIAL** | |
| `pp_budget_bureau` | Charts | Buckets? | Pat/Priya | Split pad | Weak | Cashflow **after** Vee | No | SYSTEMIC | Risk filler if before Take |
| `pp_rainy_day_park` | Fountain | Rain? | Carlos | Dignity | Weak | Fail recovery | No | CHARACTER | Mild filler |
| `ck_gate` | Ruins | Ordeal start | Cleo | Quest | — | Threshold | No | NARRATIVE | |
| `ck_score_vault` | Tablets | History? | Cleo | Inbox | — | Practice | No | SYSTEMIC | |
| `ck_debt_canyon` | Echoes | Rex? | Rex / Collector | Take | Scar | Spiral | No | **ESSENTIAL** · CHARACTER | |
| `hh_plaza` | Meadow | Home | Piggy | Hub | Weather | Memory | No | ESSENTIAL | |
| `hh_dock` | Carpet | Leave | Threshold | Travel | — | Go | No | ESSENTIAL | |
| `hh_market` | Lane | Trade? | — | Pasaran | None | — | No | | **FILLER** |
| `hh_pavilion` | Locked wing | Freedom? | Escape | Rooms | Unlocks | Agency | No | SYSTEMIC | |

Shore **generic POIs** (every non-hub): pier, journal, party board, play pads, item pickups.

| Kind | Class | Map marker | Filler? |
|------|-------|------------|---------|
| Pier | UTILITY · ESSENTIAL (leave) | No | |
| Journal | UTILITY | No | If it becomes the default face of the island |
| Party board | SYSTEMIC | No | First-hour filler |
| Play pads | SYSTEMIC | No | Arcade-lane pads **FILLER** as “quests” |
| Item pickups | UTILITY / FETCH | No | Often filler |

---

# Audit — era interiors (compressed)

Three-district islands with talk-talk-lab pattern: **SYSTEMIC + FILLER** unless a unique landmark + fork exists.

| Shore | Areas (typical) | Unique curiosity | Filler? |
|-------|-----------------|------------------|---------|
| Phosphor Reef | Plaza, Credit Lane, Investor Tower | Credit lecture vs Ordeal | Credit Lane **FILLER**/spoiler |
| Gridlock Galleria | Workshop, Pitch, Growth Lab | Pitch if it can fail | Growth Lab dashboard **FILLER** |
| Budget Kart Coast | Market, Broker, News, ETF lab | 4th area extra | ETF lab **FILLER** quiz |
| Digital Atoll | Wharf, Exchange, Volatility | FOMO vs Hodl **if** fork | Else FILLER |
| Diversify Keep | Store, Office, Warehouse | Weak | Office spreadsheets **FILLER** |
| Intangible Isle | Patent, Brand, Goodwill | Weak | Boulevard billboards **FILLER** |
| Portfolio Skies | Scaffold, Canvas, Dock | **Construction as thesis** | Dock “open Studio” **UTILITY** |
| Real Estate Row | Auction, Rental, REIT | Auction pad | REIT tower **FILLER** lecture |

**Future Shores scaffold** is the only honest **construction** attraction (authored unfinished world).

---

## Filler register (cut, merge, or demote)

1. Harbor **Pasaran market** (no save)  
2. Harbor **Arcade / Ritual / Studio** as first-hour magnets  
3. All `*_arcade_lane` as **places you must map-pin**  
4. Era **third districts** that only exist to hold a second NPC + collectible  
5. `hh_market` JSON area vs plaza already covering shop  
6. Journal as island **hero** surface (resume is `explore`)

Not filler: Plinth, Carpet, Piggy, three Change shores, four structure **exteriors**, Soft Beat lookouts, Future scaffold.

---

## Design moves (no new islands)

1. **Landmarks first** — Coin Bag points at organ silhouette, not journal.  
2. **Movement** — carpet rail + one roaming local per plaza hour (already).  
3. **Sound** — organ sting on structure enter; weather bed follows CF.  
4. **Signage** — lock text is curiosity (“painting woke”), not homework.  
5. **NPC talk** — ambient echo of **public** scars only.  
6. **Contrast** — hush desaturates structure; boom does not add fake shops.  
7. **Side shores** — one unique landmark question each, or keep them off the strip.

---

## QA

- Cold Harbor: player finds Carpet without a POI radar.  
- After Cove: Plinth curious before map dump of eight shores.  
- No map pin on Lid Lookout / Teller / Battlement.  
- Filler list does not appear in first-hour Coin Bag.
