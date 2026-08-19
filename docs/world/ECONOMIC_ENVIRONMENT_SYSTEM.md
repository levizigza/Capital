# Environmental economic storytelling

**Status:** Design law — partial live (Harbor sky, fog, shop prices). Most city-scale signals are **not** shipped and **must not** be faked.  
**Canon:** Constitution Principle 13 (world communicates economic state) · Complexity Cut (one Harbor weather, not CF sky + `economy.ts` boom widget) · mute-test / reduced-motion floors  
**Code today:** `harborWeather.ts` · `voyagerLedger.ts` · `spineTakeFootprints.ts` · `world3d/ledgerlight.ts` · plaza craft (motion amp is **a11y**, not GDP) · `economy.ts` (minigame/macro — **not** Harbor décor)

**Law:** Every visible or audible “economic” signal is a **pure function of named simulation channels**. If the channel is missing, the signal is **off** — never decorative.

---

## Why this exists

Players should read fortune from **place** (sky, prices, plaques, crowds that match books) before opening a ledger HUD. That only teaches if the plaza **cannot lie**.

A closed store with booming cashflow, or a construction boom during a treat-tab storm, is **fake literacy**. It trains the player to ignore the world.

---

## One weather (Harbor)

| Channel | Owns Harbor look? | Notes |
|---------|-------------------|--------|
| **Voyager net cashflow + haste scars** | **Yes** | `harborWeatherMood`: boom / fair / tight / storm → sky, fog, `scaleHarborPrice` |
| **`economy.ts` phase** (boom/normal/recession) | **No** on Harbor | May tint **minigame decks** only. Do not drive plaza recession props while CF is `boom`. |
| **Time of day** (`harborNpcLives` hour) | Schedule only | Morning/evening poses are **clock**, not GDP. May mix with weather but must not override CF mood. |
| **`plazaLifeAmp()`** | Accessibility | Reduced motion damps bobbing — **not** unemployment. |

If two channels disagree, **CF weather wins** on Harbor. Document the exception in the signal table or do not ship the prop.

---

## Simulation channels (inputs)

Signals may bind **only** to these (extend the list in this doc when new state ships):

| Id | Source | Exists now |
|----|--------|------------|
| `player.net_cf` | `netCashflow(voyagerLedger)` | Yes |
| `player.holdings[]` | assets/liabilities ids + monthly | Yes |
| `player.freedom` | `harborEscaped` / Freedom item | Yes |
| `player.scars[]` | `harborScars` | Yes |
| `player.quiet` | `chapterQuietPending` / homecoming quiet | Yes |
| `shop.prices` | `harborPriceMultiplier` | Yes |
| `shop.rooms` | plaza pass / pavilion | Yes |
| `take.footprints` | Cove/Paycheck/Credit holding ids | Yes |
| `weather.mood` | derived from CF + haste | Yes |
| `macro.phase` | `economyState.phase` | Yes, **off-plaza** |
| `npc.books` | NPC economic model | **No** |
| `npc.trust` | derived | **No** (talk counts only) |
| `labor.employed` | job sim | **No** |
| `housing.vacancy` | housing stock | **No** |
| `city.gini` | inequality index | **No** |
| `consequence.*` | prototype log | Isolated, not world |

**Rule:** A signal tagged `requires: npc.books` is illegal until that schema is live.

---

## Signal contract

Every prop, particle, NPC schedule override, and ambience layer needs:

```ts
type EcoSignal = {
  id: string;
  communicates: ConditionId;       // prosperity | recession | …
  channel: string;                 // from table above
  predicate: string;               // e.g. weather.mood === "storm"
  view: "mesh" | "density" | "audio" | "copy" | "npc_behavior";
  offWhen: string;                 // when it MUST disappear
  a11y: "scale_down" | "still_readable"; // reduced motion / mute
};
```

**Tests (when implemented):** for each `EcoSignal`, fixture save A (predicate true) shows it; save B (predicate false) does not; save C (contradictory macro vs CF) still follows CF on Harbor.

---

## Conditions → honest signals

Requested city language mapped to **what Capital can actually mean**. “World” here is **Fortune Archipelago places the Voyager has changed**, not a national stats bureau.

### Prosperity

| Signal | Bind to | Live? |
|--------|---------|-------|
| Bright sky / far fog | `weather.mood === "boom"` (`cf >= 40`) | Yes |
| Slight shop **markup** | same | Yes |
| Optional extra plaza sparkle | same + not `player.quiet` | Partial (cinema sparkle is Take-gated, not CF) |
| “New business” stall | `shop.rooms` unlocked or authored follow-up situation | No generic spawn |
| Crowd density up | **only if** we add `crowd = f(weather.mood)` — today crowd is cast count, **not** CF | Do not claim prosperity via extra NPCs until bound |

### Recession / tight times

| Signal | Bind to | Live? |
|--------|---------|-------|
| Grey sky, closer fog | `tight` or `storm` | Yes |
| Softer shop prices | multiplier 0.92 / 0.85 | Yes |
| Fog on dock | `storm` (CF < 0 or haste+low CF) | Yes |
| Store closures | **Not** unless a named stall’s NPC book or holding says closed | **Forbidden as décor** |
| Audio: thinner plaza bed, more wind | `weather.mood` | Partial (organ/hush exist; weather bed TBD) |

Do **not** play a “recession sting” because `macro.phase === "recession"` while Harbor mood is `boom`.

### Unemployment

**No labor market.** Do not show idle jobless crowds, layoff newspapers, or empty offices as “the economy.”

Allowed later: a **named** NPC (`npc_payroll_pat`) with `current_objective` / books showing missed Pay Day — then **that** character’s pose/line changes. Not a district-wide unemployment texture.

### Housing pressure / vacancies / for-rent signs

**No housing stock.** For-rent signs, vacancy windows, and rent-spike posters are **illegal** until a holding or NPC book represents a unit.

Exception: Real Estate Row **minigame** interiors may show auction/vacancy **inside the pad**, bound to that minigame’s state — not Harbor plaza.

### Business growth / decline / construction / new businesses / closures

| Honest version | Bind |
|----------------|------|
| Capsule / Outfitter / Pavilion **exist** | `harborShop` unlocks |
| Landmark Money Structures | Always present; **hush dims** after Take (`player.quiet`) — that’s story, not GDP |
| Construction scaffolds | Only `future_shores` authored plot / chalk quest — not random cranes on Harbor |
| Closure boards | Only if a situation resolves `business closed` on a **named** stall |

Spawning “new cafés” from a noise texture = decorative economy = **banned**.

### Consumer demand / advertising / traffic / vehicle mix

Not simulated. **Off.**  
Do not add billboard campaigns or car classes until a channel exists (e.g. shop `harbor_purchase` rate is **player** spend, not city demand — using it to fill the plaza with ads would **mis-teach**).

### Inequality / neighborhood change

**Neighborhood change (Harbor)** **is** in-sim:

| Signal | Bind | Live? |
|--------|------|-------|
| Memory Plinth / plaques | `player.scars` | Yes |
| Piggy / locals naming Takes | scars + talks | Yes |
| Freedom Pavilion | `player.freedom` | Yes |
| Quiet plaza (no stall grid) | first-meet / homecoming quiet | Yes |
| Organ motifs on shores | island organ, hush dim | Yes |
| Day-2 echo | scar age | Yes |

**Inequality** (rich vs poor blocks): **no gini channel**. Do not split Harbor into luxury vs slum meshes. Player vs NPC books (later) may change **one stall’s** maintenance, not a class map.

### Public spaces / maintenance quality / NPC behavior / local news / audio

| Signal | Bind | Live? |
|--------|------|-------|
| Fountain / Plinth maintenance | scars + freedom (authored tiers) | Partial |
| NPC roam vs hold | `harborNpcLives` **hour** + optional `weather.mood` overlay | Hour yes; CF overlay no |
| Scar echo lines | scars | Yes |
| “Local news” kiosk | **must** quote flags/scars/CF, never generated headlines | No kiosk yet |
| Ambience | `MusicPlace` harbor/shore/structure; hush ducks; mute-test stingers | Yes for signature; weather layers TBD |
| Crowd density | **Unbound today** — treat as constant until `crowdDensity(mood)` ships | |

---

## Visual / audio palette (only when bound)

When a channel **is** live, prefer **readable organ weather**, not SimCity chrome:

| Mood | Visual | Audio (proposed, bind to mood) |
|------|--------|--------------------------------|
| boom | Day sky, far fog, slightly dear prices | Fuller Memory bed, brighter clink |
| fair | Sunset-ish, steady prices | Default Harbor |
| tight | Grey, closer fog, discounts | Thinner bed, more cloth/wind |
| storm | Night/fog, deepest discount | Wind, muted market, **still readable at volume 0** via fog + price tags |

Hush / spectacle **override** density (fewer HUD magnets) regardless of boom — story beat > prosperity sparkle.

Reduced motion: keep **fog distance and price tags**; drop bobbing crowds. Mute: keep **visual** weather; stingers optional.

---

## Pipeline

```
SIM CHANNELS  →  weather.mood / flags / unlocks
        →  signal predicates (authored table)
        →  meshes, density, NPC overrides, audio layers
        →  never: LLM or random “news”
```

Narrative Event Engine may **queue** an authored situation that **also** sets a flag (`flag_vee_stall_closed`) which **then** drives a closure sign. The sign still reads a flag — not the writer’s vibe.

Consequence engine rows with `domain: neighborhood` + `visibility: felt` are the delayed layer (shop sky already). Environment system is the **renderer** of those rows, not a second sim.

---

## Anti-patterns

| Ban | Why |
|-----|-----|
| Decorative recession while `weather.mood === "boom"` | Contradicts the teaching model |
| Macro phase widget + CF sky both “the economy” | Dual Harbor weather (Complexity Cut) |
| Random store closures / construction | Infinite procedural city; no books |
| Unemployment/housing/inequality art without channels | Fake literacy |
| Ads driven by `harbor_purchase` as “consumer demand” | Misreads player spend as the island’s GDP |
| Crowd = prosperity using `plazaLifeAmp` | That’s reduced motion |
| LLM local news | Invents state |
| Pay-to-win luxury district | Monetization trust |

---

## Shipped vs later

| Now | Later (only with channels) |
|-----|----------------------------|
| CF → sky, fog, prices, coach lines, Take→sky copy | `crowdDensity(mood)` |
| Scars → Plinth, gossip, hush dim | Named stall open/closed from NPC books |
| Freedom → pavilion | Pat missed-payday pose |
| Quiet → fewer magnets | Weather-specific ambience layers |
| | Housing/vacancy **never** on Harbor until housing sim |

---

## QA

1. Save with jar holding + high CF: no fog-storm plaza.  
2. Save with treat tab + negative CF: no boom sparkle, no “Grand Opening” banners.  
3. `economyState.phase = recession` + high CF: Harbor still `boom` visuals.  
4. Reduced motion: weather still **readable**.  
5. Volume 0: Take/Harbor-felt still **read**; weather still **seen**.  
6. No signal id in the table without a `channel` + `offWhen`.

---

## Implementation order (not this doc)

1. Keep CF weather as single Harbor source of truth.  
2. Bind any new mesh to `harborWeatherMood` or a **named flag**.  
3. Add tests per signal.  
4. NPC books → then **one** stall’s maintenance.  
5. Never a city-stats dashboard as the hero — Principle 13 is **place**, not a second spreadsheet.
