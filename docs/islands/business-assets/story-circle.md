# Business Assets — Story Circle (Diversify Keep)

> **SIDE SHORE** — Era chapter on the outer ring. Soft-locked until Cove Change.

**Island ID:** `business_assets`  
**Map name:** Diversify Keep (2010s mobile-shop gloss)  
**Learning kernel:** Inventory · cashflow · depreciation · storefront vs back office  
**Island Ally:** Shop Owner Sam · Accountant Amy · Supplier Steve · Tax Advisor Tina  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In this island | IDs | Kid one-liner |
|---|------|----------------|-----|---------------|
| 1 | **You** | Arrive at the storefront | area `ba_storefront` | “Diversify Keep!” |
| 2 | **Need** | Sam: inventory hustle starts here | `npc_shop_sam`, `q_inventory_hustle` | “I need stock.” |
| 3 | **Go** | Back office ledger with Ana | `ba_back_office`, `ba_ledger` | “Let’s count it.” |
| 4 | **Search** | Depreciation 101; warehouse equipment | `q_depreciation_101`, `ba_warehouse` | “Stuff wears out.” |
| 5 | **Find** | Cashflow report + equipment | `ba_cashflow_report`, `ba_equipment` | “I see the books!” |
| 6 | **Take** | Digression: browse shop vs rush a buy | `sm_fork`, `ba_shop_browse` / `ba_shop_rush` | “Browse or grab?” |
| 7 | **Return** | Carpet home | travel | “Back to Harbor.” |
| 8 | **Change** | Harbor myth shelf | `harborScars` | “Harbor gossiped.” |

**Main quests:** `q_inventory_hustle`, `q_depreciation_101`

---

## Completeness gate

- [x] Beats filled with concrete IDs  
- [x] Digression scar pair wired (`ba_shop_browse` / `ba_shop_rush`)  
- [x] Minigames registered  
- [x] Fits Story Bible (side shore literacy)
