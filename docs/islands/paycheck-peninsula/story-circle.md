# Paycheck Peninsula — Story Circle (Island 2)

**Island ID:** `paycheck_peninsula`  
**Map / kid name:** Paycheck Peninsula  
**Organ:** **Clock** (shelters)  
**Role:** Second painting — budget from a fixed paycheck after Cove Change  
**Unlock:** Complete Coincraft Cove quest `q_cc_save_or_spend`  
**Change quest:** `q_pp_rainy_day` (`PAYCHECK_CHANGE_QUEST_ID`)  
**Learning kernel:** Allocate a paycheck → categorize expenses → adjust when life happens  
**Island Ally:** Payroll Pat / Planner Priya / Coach Carlos / Vendor Vee  
**Canon:** [story-bible.md](../../story-bible.md) · [capital-iconic-game-criteria.md](../../capital-iconic-game-criteria.md)

---

## 8 beats

| # | Beat | On the Clock shore | IDs | Kid one-liner |
|---|------|--------------------|-----|---------------|
| 1 | **You** | Land on Main Street after Harbor Change | area `pp_main_street` | “I’m at Paycheck Peninsula.” |
| 2 | **Need** | Payroll Pat: turn a paycheck into a plan | `npc_payroll_pat`, `dlg_payroll_pat` | “I got paid — now what?” |
| 3 | **Go** | Accept budgeting quests; enter Budget Bureau | `pp_budget_bureau`, startQuest | “Let’s plan.” |
| 4 | **Search** | Sort expenses, talk to Priya / Carlos / Vee | minigames + NPCs | “I try budgets.” |
| 5 | **Find** | A plan that covers needs first | `mg_budget_split` / first paycheck | “Needs come first!” |
| 6 | **Take** | Protect rainy-day vs spend stash on glitter | `dlg_vendor_vee` fork | “What do I give up?” |
| 7 | **Return** | Carpet home to Harbor (quiet HUD) | travel / Hub | “Back home.” |
| 8 | **Change** | Piggy homecoming + Memory Plinth scar | `harborHomecoming` | “I’m getting steadier.” |

**Side digression:** `q_pp_inbox_storm` (Inbox Storm) — optional Clock practice; never required for Change.

---

## Irreversible / scars

| Key / id | Choice | Harbor scar |
|----------|--------|-------------|
| `paycheck_protect_vs_spend` / `protect` | Fountain first | `pp_protector_plaque` — “Peninsula: rainy-day before glitter” |
| `paycheck_protect_vs_spend` / `spend` | Glitter sale first | `pp_spender_plaque` — “Peninsula: glitter ate the umbrella” |

---

## Handoff from Cove

Players unlock this island only after Cove’s save-or-spend **Change** beat.  
Main course `second_painting` completes only when `q_pp_rainy_day` is done — not a lone minigame.

---

## Completeness gate

- [x] Content JSON with areas, NPCs, quests, dialogues, minigames  
- [x] Progress gate after `q_cc_save_or_spend`  
- [x] Chapter play view + quest-aware Coin Bag  
- [x] Irreversible Take + scars + Harbor homecoming  
- [x] Main course done = Change quest  
- [x] Clock organ language only (no Dotgraph dual mythology)
