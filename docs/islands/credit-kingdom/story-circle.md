# Credit Kingdom — Story Circle (Ordeal)

**Island ID:** `credit_kingdom`  
**Role:** Late-game **Ordeal** chapter — Debt Cloud country; mastery required to open the door  
**Learning kernel:** Credit score · on-time payments · APR · utilization · emergency fund vs haste  
**Island Ally:** Cleo the Archivist  
**Canon:** [story-bible.md](../../story-bible.md) — boss arc compresses beats 4–6 into a storm; Return still lands on Harbor with Change visible.

Display name is **Credit Kingdom**. Ruined temples are the *flavor* (place), not a competing product name.

---

## 8 beats

| # | Beat | In Credit Kingdom | IDs | Kid one-liner |
|---|------|-------------------|-----|---------------|
| 1 | **You** | Pass the Ruined Gate as a Voyager who already escaped paycheck-to-paycheck | area `ck_gate` | “This place remembers mistakes.” |
| 2 | **Need** | Cleo: recover trust — scores, shards, on-time history | `npc_credit_cleo_ruins`, `dlg_cleo_ruins` | “I need to rebuild credit.” |
| 3 | **Go** | Enter Score Vault / party board | `ck_score_vault`, startQuest `q_ck_first_recovery` | “Into the vault.” |
| 4 | **Search** | Inbox dispatches, Debt Loadout, Score Scanner; soft fails | `mg_ck_inbox_credit`, `mg_ck_budget_balancer`, `mg_ck_signal` | “I try, learn, try again.” |
| 5 | **Find** | First Recovery clear — credit shard path opens | quest rewards, `ck_credit_shard` | “I earned trust back!” |
| 6 | **Take** | Borrow-vs-wait / APR / utilization choices that cost haste | EventDeck `credit_kingdom` | “Interest feeds on rushing.” |
| 7 | **Return** | Carpet home on the Fortune Thread | travel map | “Back to Harbor.” |
| 8 | **Change** | Harbor notices Ordeal clear (Freedom Pavilion already open; plaque/scar later) | `q_ck_first_recovery` completed | “I faced the storm.” |

---

## Castle-grounds handoff

Harbor Freedom Seal + mastery clears open this Big Door (`progressGates` / `BOSS_ISLAND_ID`).  
Piggy / Coin Bag: late-game storm — only when ready.

---

## Completeness gate

- [x] One-sentence goal: “Rebuild credit trust without feeding interest haste.”  
- [x] Verbs: Talk · Choose · Pay · Return  
- [x] Guides: Cleo (island) · Piggy (Harbor return)  
- [x] Soft fails on minigames  
- [ ] Harbor Change scar/plaque after Ordeal (Phase 2 emotion pass)  
- [x] Fits Story Bible (no second myth; Kingdom = Ordeal, ruins = scenery)

**Unlock:** Harbor freedom + mastery clears (no off-spine medallion soft-lock).  
**Main course done:** `q_ck_first_recovery` completed.
