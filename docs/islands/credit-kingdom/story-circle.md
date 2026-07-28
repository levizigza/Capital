# Credit Kingdom — Story Circle (Ordeal)

**Island ID:** `credit_kingdom`  
**Role:** Late-game **Ordeal** chapter — Debt Cloud country; mastery required to open the door  
**Learning kernel:** Credit score · on-time payments · APR · utilization · emergency fund vs haste  
**Island Ally:** Cleo the Archivist · Rex the Collector  
**Canon:** [story-bible.md](../../story-bible.md) — boss arc compresses beats 4–6 into a storm; Return still lands on Harbor with Change visible.

Display name is **Credit Kingdom**. Ruined temples are the *flavor* (place), not a competing product name.

---

## 8 beats

| # | Beat | In Credit Kingdom | IDs | Kid one-liner |
|---|------|-------------------|-----|---------------|
| 1 | **You** | Pass the Ruined Gate as a Voyager who already escaped paycheck-to-paycheck | area `ck_gate` | “This place remembers mistakes.” |
| 2 | **Need** | Cleo: recover trust — scores, shards, on-time history | `npc_credit_cleo_ruins`, `dlg_cleo_ruins` | “I need to rebuild credit.” |
| 3 | **Go** | Enter Score Vault / party board | `ck_score_vault`, startQuest `q_ck_first_recovery` | “Into the vault.” |
| 4 | **Search** | Inbox dispatches, then Debt Canyon with Rex | `mg_ck_inbox_credit`, `npc_collector_rex`, `mg_ck_budget_balancer` | “I try, learn, try again.” |
| 5 | **Find** | Canyon Seal + credit shard path | `ck_canyon_seal`, `ck_credit_shard` | “I earned trust back!” |
| 6 | **Take** | Borrow-vs-wait fork with Cleo (stains Harbor) | `credit_borrow_vs_wait` | “Interest feeds on rushing.” |
| 7 | **Return** | Quiet Harbor homecoming | travel / Piggy | “Back to Harbor.” |
| 8 | **Change** | Memory Plinth shows patience or haste plaque | `q_ck_first_recovery` | “I faced the storm.” |

---

## Castle-grounds handoff

Harbor Freedom Seal + mastery clears open this Big Door (`progressGates` / `BOSS_ISLAND_ID`).  
Piggy / Coin Bag: late-game storm — only when ready.

---

## Completeness gate

- [x] One-sentence goal: “Rebuild credit trust without feeding interest haste.”  
- [x] Verbs: Talk · Choose · Pay · Return  
- [x] Guides: Cleo (fork) · Rex (canyon) · Piggy (Harbor return)  
- [x] Soft fails on minigames  
- [x] Harbor Change scar/plaque after Ordeal (Memory Plinth + irreversible borrow-vs-wait)  
- [x] Two-beat ordeal (Vault Inbox + Canyon Loadout)  
- [x] Fits Story Bible (no second myth; Kingdom = Ordeal, ruins = scenery)

**Unlock:** Harbor freedom + mastery clears (no off-spine medallion soft-lock).  
**Main course done:** `q_ck_first_recovery` completed.  
**Irreversible:** `credit_borrow_vs_wait` via Cleo fork → Harbor scar (`credit_patience_plaque` / `credit_haste_plaque`).
