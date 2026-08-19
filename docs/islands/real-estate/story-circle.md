# Real Estate — Story Circle (Property Pier)

> **SIDE SHORE** — Era chapter on the outer ring. Soft-locked until Cove Change.

**Island ID:** `real_estate`  
**Map name:** Real Estate Row (rental + auction district)  
**Learning kernel:** Auctions · deeds · REITs · passive rental income  
**Island Ally:** Auctioneer Al · Flipper Fiona · Landlord Larry · REIT Rachel  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In this island | IDs | Kid one-liner |
|---|------|----------------|-----|---------------|
| 1 | **You** | Arrive at Auction Yard | area `re_auction_yard` | “Property Pier!” |
| 2 | **Need** | Al: learn auction rhythm before you bid | `npc_auctioneer`, `q_auction_flip` | “How do auctions work?” |
| 3 | **Go** | Rental district with Rita | `re_rental_district` | “Let’s see rent.” |
| 4 | **Search** | Passive income quest; REIT tower | `q_passive_income`, `re_reit_tower` | “Money while I sleep?” |
| 5 | **Find** | Deed + rental ledger + REIT share | `re_deed`, `re_rental_ledger`, `re_reit_share` | “I own a piece!” |
| 6 | **Take** | Digression: watch the auction vs rush a bid | `aa_fork`, `re_auction_watch` / `re_auction_rush` | “Watch or bid cold?” |
| 7 | **Return** | Carpet home | travel | “Back to Harbor.” |
| 8 | **Change** | Harbor myth shelf | `harborScars` | “Harbor heard that.” |

**Main quests:** `q_auction_flip`, `q_passive_income`

---

## Completeness gate

- [x] Beats filled with concrete IDs  
- [x] Digression scar pair wired (`re_auction_watch` / `re_auction_rush`)  
- [x] Minigames registered  
- [x] Fits Story Bible (side shore literacy)
