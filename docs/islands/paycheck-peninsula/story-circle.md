# Paycheck Peninsula (Dotgraph Atoll) — Story Circle (Island 2)

**Island ID:** `paycheck_peninsula`  
**Map name:** Dotgraph Atoll  
**Role:** Second painting — budget from a fixed paycheck after Cove Change  
**Unlock:** Complete Coincraft Cove quest `q_cc_save_or_spend`  
**Learning kernel:** Allocate a paycheck → categorize expenses → adjust when life happens  
**Island Ally:** Payroll Pat / Planner Priya  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In Dotgraph | IDs | Kid one-liner |
|---|------|-------------|-----|---------------|
| 1 | **You** | Land on Main Street after Harbor Change | area `pp_main_street` | “I’m at Dotgraph.” |
| 2 | **Need** | Payroll Pat: turn a paycheck into a plan | `npc_payroll_pat`, `dlg_payroll_pat` | “I got paid — now what?” |
| 3 | **Go** | Accept budgeting quests; enter Budget Bureau | `pp_budget_bureau`, startQuest | “Let’s plan.” |
| 4 | **Search** | Sort expenses, talk to Priya / Carlos / Vee | minigames + NPCs | “I try budgets.” |
| 5 | **Find** | A plan that covers needs first | quest rewards / first paycheck item | “Needs come first!” |
| 6 | **Take** | Cut or keep a want when a surprise hits | rainy-day / opportunity-cost choices | “What do I give up?” |
| 7 | **Return** | Carpet home to Harbor | travel / Hub | “Back home.” |
| 8 | **Change** | Harbor + Freedom progress notice you | Piggy / Coin Bag / seals | “I’m getting steadier.” |

---

## Handoff from Cove

Players unlock this island only after Cove’s save-or-spend **Change** beat.  
Coin Bag on the map should read: “Next painting: Dotgraph Atoll.”

---

## Completeness gate

- [x] Content JSON with areas, NPCs, quests, dialogues, minigames  
- [x] Progress gate after `q_cc_save_or_spend`  
- [x] Chapter play view + quest-aware Coin Bag  
- [ ] Optional board side-mode polish  
- [x] Fits Story Bible (no second myth)
