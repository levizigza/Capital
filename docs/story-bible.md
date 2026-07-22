# Capital — Story Bible (Central Mythology)

**Status:** Canon · living document  
**Law:** The *entire* player journey *is* the story. Individual islands, stalls, NPCs, and minigames are **chapters** inside one circle — not side content bolted on.

**Story engines we use (always):**

1. **Dan Harmon’s Story Circle** (8 beats) — session-scale and island-scale structure  
2. **Joseph Campbell’s Hero’s Journey** — mythic spine across the whole Archipelago  

If a feature cannot answer *which beat it serves* and *how the Voyager returns changed*, it is out of whack — **push back or reframe** before shipping.

---

## One-sentence myth

> In a world where **money is alive**, a washed-ashore **Voyager** learns that fortune is not a pile to grab — it is a **journey of choices** — guided by Money Mascots, tested across the Fortune Archipelago, until they escape paycheck-to-paycheck living and return home transformed.

---

## The world

| Name | Role in myth |
|------|----------------|
| **Fortune Archipelago** | The known world — islands of money lessons (paintings / doors to adventure) |
| **Harbor Haven** | **Castle Grounds** — safe yard, guides, shops, carpet dock. Ordinary World. |
| **Money Mascots** | The people of Capital (Dollar Dash, Piggy Penny, Debt Cloud…). Living money, not humans. |
| **The Fortune Thread** | Invisible bond between islands; the magic carpet rides it. |
| **Ledger Seals / Freedom Seal** | Proof of growth — stars that change what Harbor opens to you. |
| **Credit Kingdom** | Late-game **Ordeal** island — debt storms, mastery required. |
| **The Voyager** | The player — begins plain (Threadbare rug, no pet), becomes someone Harbor recognizes. |

**Expansion rule:** New islands, NPCs, and side stories must **plug into** this mythology (a new trial on the Thread, a new mascot temperament, a new seal). They must not invent a second competing cosmos.

---

## The whole game = one Story Circle

| # | Harmon beat | Campbell echo | Capital beat (whole game) | Player-facing (age ~5) |
|---|-------------|---------------|---------------------------|-------------------------|
| 1 | **You** | Ordinary World | Wash ashore in Harbor Haven; walk the plaza | “This is home.” |
| 2 | **Need** | Call to Adventure | Guide names the want: earn, choose, escape paycheck-to-paycheck | “You need a first seal.” |
| 3 | **Go** | Crossing the Threshold | Board the carpet → first island (Coincraft Cove) | “Let’s go!” |
| 4 | **Search** | Trials / Allies / Enemies | Island quests, mascots, minigames, soft fails | “Try, learn, try again.” |
| 5 | **Find** | Ordeal / Reward | Big lesson wins; Freedom Seal / Harbor escape | “You did it!” |
| 6 | **Take** | Price / Responsibility | Spending, risk, debt lessons — power has a cost | “Choices have prices.” |
| 7 | **Return** | Road Back | Carpet home; Harbor looks familiar | “Back to Harbor.” |
| 8 | **Change** | Master of Two Worlds | New plaza wing, carpet tier, guide acknowledges growth | “You’re different now.” |

**Boss arc (late):** Credit Kingdom compresses beats 4–6 into a storm (Debt Cloud country). Return still lands on Harbor with Change visible.

---

## Harbor Haven = Super Mario 64 Castle Grounds

Harbor is **not** a menu. It is the yard that teaches **one verb at a time**:

1. Look / wonder (carpet landing)  
2. Walk  
3. Talk to a guide (**Piggy Penny** — Harbor Keeper)  
4. Become *you* (Outfitter)  
5. Coins mean something (tiny Capsule spend)  
6. How challenges feel (optional practice board)  
7. Cross a threshold (Carpet Dock → map → island)  
8. Return changed (seal / unlock / new line from guide)

**Push-back:** Free-roam before the guided lap is done is allowed only as soft exploration — the **next good action** must always be obvious (glow, guide line, one HUD sentence).

---

## Every island = a full Story Circle

No island ships without a filled `story-circle.md` (see template).  
**Completeness check** (kid can retell it):

> “I left Harbor → I needed ___ → I tried ___ → I learned ___ → I paid a price ___ → I came home ___.”

Coincraft Cove is **Island 1 / first painting** — reference implementation.

---

## Guides (Lakitu / Toad energy)

| Guide | Mascot | Beat ownership |
|-------|--------|----------------|
| **Harbor Keeper** | Piggy Penny | Castle Grounds verbs; points to Outfitter, Capsule, Dock |
| **Island Ally** | Per-island (Cove: Captain Penny → remap to mascot cast over time) | Search / Find on that island |
| **Return Witness** | Budget Bot or Vault Vince | Names the Change when you come home |

Guides **point, wait, celebrate**. They never dump the whole myth at once.

---

## Money Mascots in the myth

The cast is the population of the myth. Playable now for feel-testing; **canon end-state** = NPCs with lives. Temperaments map to lessons (Spendy Sue = Need/Want tension; Debt Cloud = Ordeal shadow; Future Fund = Change/Return).

---

## Design law (use when reviewing PRs / content)

1. Which **whole-game beat** (1–8) does this serve?  
2. Which **island beat** (1–8) if island content?  
3. What **one verb** does a 5-year-old practice?  
4. Who is the **guide** in this beat?  
5. What **changes on Return**?  

If answers are fuzzy → **do not ship**; reframe or cut.

---

## Related docs

- [game-pillars.md](./game-pillars.md) — product pillars (adventure-first, consequences, juice)  
- [islands/_template/story-circle.md](./islands/_template/story-circle.md) — required island fill-in  
- [islands/coincraft-cove/story-circle.md](./islands/coincraft-cove/story-circle.md) — Island 1 reference  
- [island-design-process.md](./island-design-process.md) — pipeline; Story Circle is now a required deliverable  

**Runtime:** `src/islands/story/` mirrors this bible for guided Harbor + beat helpers.
