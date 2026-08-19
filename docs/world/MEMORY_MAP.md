# Memory map

**Status:** Spatial memory of the Fortune Archipelago — what the **world** remembers vs what the **UI map** shows  
**Companion:** [CURIOSITY_ARCHITECTURE.md](./CURIOSITY_ARCHITECTURE.md) · [CHARACTER_MEMORY_ARCHITECTURE.md](../narrative/CHARACTER_MEMORY_ARCHITECTURE.md) · [worldMemory.ts](../../src/islands/worldMemory.ts)

This is not a GIS layer and not NPC chat history. It is the **player’s mental map**: organs, landmarks, scars, and which pins are allowed to exist.

---

## Two maps

| Map | What it stores | Player-facing |
|-----|----------------|---------------|
| **Travel map** | Destinations (spine always; side shores after Cove Change) | `TravelMapView` / `ArchipelagoMap3D` |
| **Memory map** | What Harbor and organs **kept** | Plinth, plaques, weather, hush, Piggy lines, day-2 |

The travel map answers *where can I go?*  
The memory map answers *what became true because I went?*

**Law:** Unlocking a pin without a memory is homework. Memory without a way home is a soft-lock (navigability).

---

## Layers (bottom → top)

```
1. MYTH GEOGRAPHY     Harbor meadow → triangle spine → outer era ring
2. ORGAN SUIT         Memory keeps · Coin holds · Clock shelters · Spiral withstands
3. LANDMARKS          Plinth · Carpet · Jar · Bank · Tower · Keep
4. SITUATIONS         Ashore, Takes, homecoming (narrative event ids)
5. SCARS / FLAGS      harborScars, irreversibleChoices, Freedom, quiet
6. WEATHER            CF → sky/prices (economic environment)
7. UI PINS            Only destinations, never every POI
```

Character memory (per NPC) **filters** layer 5. It does not add pins.

---

## Myth geography (stable)

| Place | Memory job | Travel pin |
|-------|------------|------------|
| Harbor Haven | Ordinary World; files Takes | Always |
| Coincraft Cove | First Change; Coin | Always (first painting) |
| Paycheck Peninsula | Transfer Change; Clock | After Cove memory exists |
| Credit Kingdom | Ordeal; Spiral | After Freedom + Paycheck Change |
| 8 era shores | Digression / longevity | After Cove Change, **not** as main chips |
| Key Cove (demo) | None | **Never** (parked) |

Player should be able to **point at the skyline** (jar / tower / keep / plinth) before they can name the JSON area id.

---

## Organ memory (what each land *is*)

| Organ | Where it lives | What gets remembered |
|-------|----------------|----------------------|
| Memory | Harbor Plinth, Bank, Piggy, day-2 | Plaque labels, homecoming, weather as leftover |
| Coin | Cove jar, lighthouse, Alma’s bench | Jar vs treat footprint |
| Clock | Paycheck stall, tower, Pat **after** Vee | Umbrella vs glitter; not Cove’s answer |
| Spiral | Credit canyon, Keep, Rex | Wait vs haste; not umbrella mapping |

If a location cannot name **organ + suit verb**, it does not belong on the spine (mural law). Era shores use **lenses**; they must not overwrite organ memory.

---

## Landmark memory (diegetic)

| Landmark | Encodes | Changes when |
|----------|---------|----------------|
| Memory Plinth | Scar count / latest plaque | Each qualifying Take / digression myth (display rules) |
| Money Carpet | Threshold | Hub guided `to_dock`; always findable |
| Giant Coin Jar | Village hold | Hush **dims** after Cove Take |
| Ledger Bank | Memory machine | First-meet may hide so Talk isn’t stolen |
| Payroll Tower | Clock machine | Dim after Paycheck Take |
| Interest Keep | Spiral machine | Dim after Credit Take |
| Freedom Pavilion | Escape | `harborEscaped` |
| Future Shores scaffold | Unfinished world | Authored; not Harbor construction |

Soft Beat lookouts (lid, teller, loft, battlement) are **peek memory** — no pin, no second Take.

---

## Scar map (what Harbor files)

Not every quest gets a plaque. **Spine Takes** do. Digressions get **gossip**, not Plinth theft.

| Memory object | Source | Visible on |
|---------------|--------|------------|
| Plaque / shelf line | `harborScars` kind plaque | Plinth, share card |
| NPC tone | Digression scars | Plaza rumor |
| Plaza prop | Authored | Rare |
| Irreversible key | `cove_save_vs_spend` etc. | Ledger + weather |
| Quiet pending | Take | Thinned plaza |
| Day-2 | Scar age | Echo cinema |

**Mental map test:** After Cove, the player can find **Plinth** by glow, not by a “Memory” GPS quest marker.

---

## What the travel map must not remember

- Outfitter, Capsule, Arcade, Studio, Settings  
- Journal, individual play pads, cork/spring/anvil  
- Fetch items (`cc_coin_pouch`)  
- Pasaran overlay  
- Credit 101 as a pin that spoils the Ordeal  

Those live in **curiosity architecture** as local POIs. Pinning them trains checklist exploration.

---

## Player mental model (target)

```
Harbor (home, remembers)
    └─ Carpet
         ├─ Cove (jar) ──► Harbor felt that
         ├─ Paycheck (tower) ──► new plaque, no jar lecture
         ├─ Credit (keep) ──► spiral, after Freedom
         └─ Outer ring (optional, after first plaque)
```

Coin Bag prefers this tree (Main Quest). It does not enumerate era districts.

---

## Location → memory cheat sheet

| Location | Remembered as | Pin |
|----------|---------------|-----|
| `hh_plaza` | Home | Hub |
| `hh_dock` | Leave | Local landmark |
| `hh_market` | — (filler) | No |
| `hh_pavilion` | Freedom wing | No (find by unlock) |
| `cc_*` | Coin shore | Island pin only |
| Lighthouse / jar | The Take | Landmark |
| `pp_main_street` | The stall | Island pin |
| Bureau / park | Clock support | No |
| `ck_debt_canyon` | Rex | Island pin |
| Era `*_lab` / `*_office` | Curriculum rooms | **No** extra pins |
| Structure interiors | Inside the machine | No |

---

## Systems that write the memory map

| Writer | Reads as |
|--------|----------|
| `addScar` / `setIrreversible` | Plaque + irreversible |
| `spineTakeFootprints` | CF → weather (place looks different) |
| `hasHarborFreedom` | Pavilion / carpet floor |
| `chapterQuietPending` | Dimmed landmark |
| Narrative situations | Foldbacks (homecoming) |
| NPC observers | Who may **speak** a memory (not new pins) |

UI `discovered.areas` is **fog of war for journal**, not Harbor’s myth. Prefer landmarks over area checklists.

---

## Attraction × memory

Curiosity brings you; memory proves you were there.

| Tool | Memory proof |
|------|----------------|
| Landmark | Still there, maybe dimmed |
| Sound | Organ sting on re-enter |
| Economic change | Sky/prices match leftover |
| NPC conversation | Piggy names **this** plaque |
| Signage | Lock hint names the missing Change, not a % bar |
| Construction | Only Future scaffold — “unfinished on purpose” |

---

## Filler vs memory

Filler locations **create no memory object**. If a place never writes a scar, flag, holding, or unlock, it should not ask for a map marker and should not appear in Coin Bag as “unexplored %.”

---

## QA

1. After first Take, player can walk to Plinth without opening Travel.  
2. Travel strip is 4 chips until Cove Change, then outer ring — not 40 POIs.  
3. Quiet Harbor: Carpet + Plinth still findable (navigability vs presence).  
4. Paycheck visit does not require remembering Cove’s **answer** — only that Harbor keeps choices.  
5. Era shores do not add main-course pins.
