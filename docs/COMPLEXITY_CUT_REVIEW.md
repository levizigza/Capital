# Complexity cut review — fewer systems, richer interactions

**Goal:** Remove ~**30%** of Capital’s *mechanical* complexity while making the game **deeper**.  
**Law:** Favor fewer systems with richer interactions. Depth = meaningful consequences across systems, not more meters.

**North star (do not cut):** Cove Take → hush → Harbor scar spectacle → Plinth share → Piggy → day-2 · Money Structures Soft Beats · Freedom cashflow grind · organ cold-retell.

**Canon:** [iconic-path.md](./iconic-path.md) · [iconic-later.md](./iconic-later.md) · [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [FEATURE_GATE.md](./FEATURE_GATE.md)

---

## Executive verdict

Capital’s signature loop is already deep. Complexity bloat is mostly **parallel progression languages**, **side loops taught like spine**, **dead fields**, and **second economies**.

Cutting ~30% means:

1. **Delete or never surface** write-only / silent tracks (affinity, silent XP on Harbor, unused Pay Day multipliers).  
2. **Consolidate personality** into organs + scars (drop skill-stat RPG + stance HUD).  
3. **One first-hour coach** (Ashore + Piggy meet_guide) — Outfitter / Capsule / Ritual stay discoveries.  
4. **Rename / demote party seals** so they never confuse Freedom.  
5. **Demote arcade · studio · genre HUD · tip-NPC curriculum** off the first Change teach.  
6. **Collapse Memory chrome** into Plinth (one “Harbor remembers” surface).

Net strategic depth: **increases** — players feel Take → Harbor → Soft Beat → Freedom as one conversation, not five curricula.

---

## Inventory snapshot (what we’re cutting against)

| Bucket | Keep (spine) | Cut / demote candidates |
|--------|--------------|-------------------------|
| Currencies | Pouch coins, monthly cashflow, Freedom Seal | Silent XP, stance-as-HUD, affinity, party “Ledger Seals” naming |
| Progression | Main course triangle, scars, Freedom grind, Soft Beats, day-2 | Parallel hub guided chrome, skill stats, boom/recession Pay Day fiction |
| Menus | Talk, Soft Beat, spectacle/share/day-2, settings a11y | Memory modal (→ Plinth), early Ritual/Studio/Arcade magnets |
| Side systems | Family Room local, board as post-Freedom toy | Arcade/Studio as first-hour verbs; genre blurbs on spine |

---

## Removals & consolidations

Depth impact key:

- **↑ increases** — fewer systems, clearer consequences between remaining ones  
- **→ unchanged** — removes noise; strategy space intact  
- **↓ decreases** — only accept if cost was fake depth (fake choices / unused meters)

---

### 1. Delete write-only `npcMemory.affinity`

| | |
|--|--|
| **What** | Affinity increments on Talk; never read for branches |
| **Why** | Fake progression meter |
| **Do** | Remove field **or** wire into one greeting branch — prefer **remove** until a real read exists |
| **Depth** | **↑** — stops implying relationship RPG that isn’t there |

---

### 2. Stop awarding / surfacing Islands **XP** on Harbor

| | |
|--|--|
| **What** | `UserProfile.xp` from board/quests; almost no Harbor HUD |
| **Why** | Duplicate currency next to coins + cashflow |
| **Do** | Keep pouch coins + cashflow only on spine; XP stays in outer shell or becomes invisible |
| **Depth** | **↑** — one tactile spend currency + one monthly CF story |

---

### 3. Rename party **Ledger Seals** → **Party seals** (or stars only)

| | |
|--|--|
| **What** | Board `stars` named like Freedom **Ledger / Freedom Seal** |
| **Why** | Duplicate seal mythology; board seals don’t unlock Freedom |
| **Do** | Rename UI; never gate main course on party seals |
| **Depth** | **→** mechanically; **↑** cognitively (Freedom path readable) |

---

### 4. Collapse **stance HUD** into scar/organ consequences only

| | |
|--|--|
| **What** | saver/spender/risk axes + Memory tip language |
| **Why** | Third personality system beside organs + learning profile |
| **Do** | Keep stance as silent modifier for fail copy / greetings; **no panel** |
| **Depth** | **↑** — organ suit verbs remain the mastery language |

---

### 5. Cut **skill stats** (Resilience / Discipline / Foresight) from spine surfaces

| | |
|--|--|
| **What** | Island play skill panel + adaptive coach inputs |
| **Why** | Isolated RPG; rarely understood; overlaps stance/organs |
| **Do** | Remove panel; coach can use fail counts + CF only |
| **Depth** | **↑** — mastery = reading CF / organs / Soft Beat, not a third sheet |

---

### 6. Do **not** wire boom/recession into Harbor Pay Day

| | |
|--|--|
| **What** | `economy.ts` phases; `applyPayday` multiplier unused (always `1`) |
| **Why** | Second weather next to `harborWeather` CF mood |
| **Do** | Keep boom/recession **only** inside modular market minigames; Harbor uses CF weather + shop prices |
| **Depth** | **→** for Freedom path; **↑** clarity (one sky story) |

---

### 7. One first-hour coach path

| | |
|--|--|
| **What** | Ashore Teach + hub guided intro + Outfitter/Capsule/Ritual magnets |
| **Why** | Duplicate “what do I do?” teachers |
| **Do** | **Only** Ashore → Piggy `meet_guide` → Carpet → Cove. Outfitter/Capsule/Ritual/Studio/Arcade = post-Change discoveries |
| **Depth** | **↑** — same loop, fewer false goals |

---

### 8. Merge **Memory Plinth modal** into Plinth interact

| | |
|--|--|
| **What** | `hubModal === "memory"` plaque list vs lamp/Plinth cinema |
| **Why** | Same plaques, second menu |
| **Do** | Plinth hotspot opens shelf; drop separate Memory stall chrome from first-hour grid |
| **Depth** | **→** content; **↑** because remembrance stays diegetic |

---

### 9. Demote Harbor **tip NPC** curriculum

| | |
|--|--|
| **What** | Generic money-habit Talk Battles |
| **Why** | Fake choices (single continue) + second syllabus vs organ myth |
| **Do** | Tips only when plaques exist (name organ/scar) or cut to Piggy + 1–2 locals |
| **Depth** | **↑** — Talk becomes memory/character, not worksheet |

---

### 10. Demote **Arcade · Vibe Studio · genre HUD** from spine teach

| | |
|--|--|
| **What** | Arcade view, Studio stele marks, genre city blurbs on Cove/Paycheck/Credit |
| **Why** | Isolated mechanics / width pressure / competing fantasy |
| **Do** | Keep code; **hide** plaza magnets until Freedom or post–Cove Change; organ language leads spine shores |
| **Depth** | **↑** for iconic bar; side toys remain for later |

---

### 11. Soften **Take branch gates** (half-fake choice)

| | |
|--|--|
| **What** | Cove save vs spend → different plaque, **same unlock** |
| **Why** | Memory real; campaign consequence weak |
| **Do** | **Do not add new islands.** Enrich consequence via Soft Beat vista, Piggy line, day-2, Freedom affinity — already the preferred depth path |
| **Depth** | **↑** if Soft Beat/Piggy read the fork; **↓** if we only add another meter |

---

### 12. Companions stay cosmetic (no progression fiction)

| | |
|--|--|
| **What** | Outfitter pets |
| **Why** | Fine as expression; fake if sold as power |
| **Do** | Keep; never gate CF/Freedom |
| **Depth** | **→** |

---

### 13. Party board = post-Freedom toy, not second campaign

| | |
|--|--|
| **What** | 15-turn seal race, capsules, rivals |
| **Why** | Rich but isolated from Take→Harbor myth if taught early |
| **Do** | Discover after Freedom or after first Change; don’t ambush Ashore |
| **Depth** | **↑** spine; board depth **→** for players who find it |

---

### 14. Ritual streak chrome stays post–Piggy

| | |
|--|--|
| **What** | Daily Ritual modal + streak |
| **Why** | Retention system competing with day-2 Soft Beat cinema |
| **Do** | Never auto-open over spectacle/day-2; optional after homecoming |
| **Depth** | **↑** (day-2 remains the “return” mastery beat) |

---

### 15. Learning profiles stay (accessibility, not progression)

| | |
|--|--|
| **What** | Explorer / Apprentice / Strategist |
| **Why** | Real a11y for text/hints — not a cut target |
| **Do** | Keep in Settings |
| **Depth** | **→** |

---

## Systems without meaningful consequences (hit list)

| System | Consequence today | Action |
|--------|-------------------|--------|
| Affinity | None readable | Delete |
| Islands XP on Harbor | None felt | Hide |
| Boom/recession → Pay Day | None (mult=1) | Don’t wire; scope to modular only |
| Most tip Talk choices | Cosmetic continue | Cut or scar-gate |
| Party seals vs Freedom | Confuse unlock story | Rename / demote |
| Skill stats panel | Opaque coach spice | Remove panel |
| Stance panel | Parallel personality | Silent only |

---

## Fake choices

| Choice | Reality | Proposal |
|--------|---------|----------|
| Tip NPC A/B lines | Same continue | Remove choices or bind to plaque memory |
| Take A/B unlock | Same next island | Keep plaques; deepen Soft Beat/Piggy/day-2 reads (**↑ depth**) |
| Buy companion | Cosmetic | Label as look, not power |
| Early Ritual/Arcade as “progress” | Side loops | Demote magnets |

---

## Unnecessary menus (first-hour)

Remove or delay from quiet Harbor / Ashore:

- Memory stall (→ Plinth)  
- Studio stele / Arcade / Market magnets before first Change  
- Daily Ritual auto-open  
- Skill stats / stance panels  
- Analytics (dev/parent only)

Keep: Talk, Soft Beat overlays, spectacle/share/day-2, Settings (a11y), Family Room (local, post-discovery).

---

## ~30% complexity estimate

Rough mechanical “surface count” (currencies + tracks + menus + side loops taught early):

| | Before | After proposal |
|--|-------:|---------------:|
| Player-facing currencies / meters | ~12 | ~7 (−42%) |
| Progression languages (organs/stance/skills/XP/seals…) | ~6 | ~3 (−50%) |
| First-hour menus/magnets | ~10 | ~5 (−50%) |
| Parallel economies (CF weather + boom + XP) | 3 | 1–2 (−33–50%) |

Weighted toward what players must **hold in mind** on the signature loop ≈ **~30–40% cognitive load cut**, with strategic depth **up** via Soft Beat ↔ Take ↔ Freedom interactions.

---

## Implementation order (no auto-ship)

1. Rename party seals; hide XP on Harbor.  
2. Delete affinity (or document “unused — do not teach”).  
3. Remove skill-stat + stance panels from spine HUD.  
4. Plinth-only memory shelf; quiet first-hour magnets.  
5. Tip NPCs → plaque-aware only.  
6. Confirm boom/recession never touches Pay Day.  
7. Soft Beat fork vistas / Piggy lines (depth add, not system add).

Each step should pass [FEATURE_GATE.md](./FEATURE_GATE.md). Prefer multi-system deepening over new toys.

---

## What we are **not** removing

- Irreversible Takes, scars, spectacle, share, Piggy, day-2  
- Soft Beats inside Money Structures  
- Voyager Ledger cashflow + Freedom Seal  
- Main course Cove → Paycheck → Credit  
- Family Room **local**  
- Learning profiles / reduced motion / Esc·Leave  

---

## Depth summary table

| Proposal | Strategic depth |
|----------|-----------------|
| Delete affinity | ↑ |
| Hide Islands XP | ↑ |
| Rename party seals | → / ↑ clarity |
| Stance silent-only | ↑ |
| Cut skill stats panel | ↑ |
| Boom/recession Harbor demote | → / ↑ clarity |
| One first-hour coach | ↑ |
| Memory → Plinth | → / ↑ |
| Tip NPC demote | ↑ |
| Arcade/Studio/genre demote | ↑ spine |
| Enrich Take via Soft Beat (not new meter) | ↑ |
| Companions cosmetic | → |
| Board post-Freedom | ↑ spine |
| Ritual after Piggy | ↑ |

**Bottom line:** Cut parallel meters and menus; keep the living-money conversation. Depth rises when Take, Soft Beat, Plinth, and Freedom all speak the same organ language — not when we add a fifteenth counter.
