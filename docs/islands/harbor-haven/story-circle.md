# Harbor Haven — Story Circle (Castle Grounds hub)

**Island ID:** `harbor_haven`  
**Role:** SM64-style Castle Grounds — home base, not a chapter painting  
**Learning kernel:** Orient · meet Coin Bag · tiny spend · board carpet  
**Runtime guides:** Piggy Penny · Coin Bag · Outfitter (plaza code, not JSON NPCs)  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In Harbor | IDs | Kid one-liner |
|---|------|-----------|-----|---------------|
| 1 | **You** | Spawn on Main Plaza as Voyager + Coin Bag | area `hh_plaza` | “I’m home at Harbor.” |
| 2 | **Need** | Guided intro: meet Piggy, learn carpet | runtime `dlg_harbor_*` | “Where do I go?” |
| 3 | **Go** | Walk plaza → dock; optional Safe Heart / Ledger Mail | `mg_harbor_safe_memory`, `mg_harbor_ledger_mail` | “Let’s explore.” |
| 4 | **Search** | Outfitter, Capsules, Arcade, Memory Plinth | plaza rooms | “Harbor has toys.” |
| 5 | **Find** | First painting named — Coincraft Cove | travel strip | “Cove is next!” |
| 6 | **Take** | Chapters live on outer paintings; Harbor holds scars | `harborScars` from Cove/Paycheck/Credit + digressions | “Harbor remembers.” |
| 7 | **Return** | Every chapter ends here | carpet home / `harborHomecoming` | “Back to Harbor.” |
| 8 | **Change** | Plinth glow · weather · digression myth shelf | Memory Plinth, Piggy return Talk | “I’m different.” |

**JSON pack:** 0 NPCs / 0 quests by design — plaza runtime owns the hub loop.

---

## Completeness gate

- [x] Hub areas: `hh_plaza`, `hh_dock`  
- [x] Harbor minigames wired (`mg_harbor_safe_memory`, `mg_harbor_ledger_mail`)  
- [x] Chapters live on outer islands (Cove first)  
- [x] Fits Story Bible (one myth; Harbor is memory, not a second Take island)
