# Coincraft Cove — Story Circle (Island 1)

**Island ID:** `coincraft_cove`  
**Role:** First painting / first full chapter after Harbor Castle Grounds  
**Learning kernel:** Earn → choose (save vs spend) → small craft identity  
**Island Ally:** Captain Penny (→ Money Mascot remaps over time; Harbor Keeper remains Piggy Penny)  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In Coincraft | IDs | Kid one-liner |
|---|------|--------------|-----|---------------|
| 1 | **You** | Land from carpet / enter Cove harbor as Voyager | area `cc_harbor` | “I’m at Coin Cove.” |
| 2 | **Need** | Captain Penny: earn your first coins the fair way | `npc_captain_penny`, `dlg_captain_penny`, `q_cc_first_coins` | “I need coins.” |
| 3 | **Go** | Accept the quest; step into craft market life | `cc_craft_market`, startQuest | “Let’s go earn.” |
| 4 | **Search** | Talk, sort/earn minigames, meet Alma / Shelly | `mg_coin_sort`, `npc_artisan_alma`, `npc_shelly` | “I try jobs.” |
| 5 | **Find** | First coins + pouch; feel of earned money | item `cc_coin_pouch`, quest rewards | “I earned it!” |
| 6 | **Take** | Save or Spend with Alma — a real tradeoff | `q_cc_save_or_spend`, `cc_savings_jar` | “Do I save or buy?” |
| 7 | **Return** | Carpet / Hub back to Harbor Haven | travel map, dock | “Back home.” |
| 8 | **Change** | Harbor guide notices; practice board / seals progress toward Freedom | ledger seals, Piggy Penny return line | “I’m getting better.” |

---

## Castle-grounds handoff

Harbor guided intro ends at Carpet Dock with:  
**“Ready for your first island? Coincraft Cove.”**

Piggy Penny’s job ends at the threshold; Captain Penny owns Need→Find on the island.

---

## Completeness gate

- [x] One-sentence goal: “Earn coins, then choose save or spend.”  
- [x] Verbs: Talk · Earn · Choose · Return  
- [x] Guides: Piggy (Harbor) → Captain Penny (Cove)  
- [x] Soft fails on minigames  
- [ ] Return Change still thin — strengthen Harbor welcome-back line when `q_cc_save_or_spend` completes (runtime guided beat)  
- [x] Fits Story Bible (no second myth)

**Next polish:** Wire `q_cc_save_or_spend` completion → Harbor Keeper celebration + optional Freedom progress hint.  
**Runtime (v34):** Cove is a separate chapter island from Harbor Haven; completing `q_cc_save_or_spend` sets `harborHomecoming` and unlocks Paycheck Peninsula.
