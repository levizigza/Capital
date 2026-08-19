# Venture Foundry — Story Circle (Gridlock Galleria)

> **SIDE SHORE** — Era chapter on the outer Fortune Archipelago ring. Soft-locked until Paycheck Change. See [era-shores-restore.md](../../era-shores-restore.md).

**Island ID:** `venture_foundry`  
**Map name:** Gridlock Galleria (1980s neon grid)  
**Learning kernel:** Idea → plan → pitch → P&L · startup funding trade-offs  
**Island Ally:** Founder Fern · Mentor Malik · Investor Ike · Strategist Sara  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In this island | IDs | Kid one-liner |
|---|------|----------------|-----|---------------|
| 1 | **You** | Land on the neon workshop floor | area `vf_workshop` | “Gridlock Galleria!” |
| 2 | **Need** | Fern: every business starts with a problem | `npc_founder_fern`, `dlg_founder_fern` | “I need an idea.” |
| 3 | **Go** | Draft plan with Malik; allocate seed budget | `q_vf_idea_to_plan`, `mg_startup_budget` | “Let’s build it.” |
| 4 | **Search** | Pitch Ike; enter Growth Lab with Sara | `vf_pitch_stage`, `vf_growth_lab` | “I try the pitch.” |
| 5 | **Find** | Seed funding + P&L sheet | `vf_seed_funding`, `vf_pnl_sheet` | “Investors said yes!” |
| 6 | **Take** | Digression: linger in foundry vs rush pitch | `ff_fork`, `vf_foundry_listen` / `vf_foundry_rush` | “Look first or pitch cold?” |
| 7 | **Return** | Carpet home | travel | “Back to Harbor.” |
| 8 | **Change** | Harbor myth shelf gossip | `harborScars` | “Harbor heard that.” |

**Main quests:** `q_vf_idea_to_plan`, `q_vf_pitch_and_grow`

---

## Completeness gate

- [x] Beats filled with concrete IDs  
- [x] Digression scar pair wired (`vf_foundry_listen` / `vf_foundry_rush`)  
- [x] Minigames registered (`mg_startup_budget`, `mg_price_it_right`)  
- [x] Fits Story Bible (side shore, not spine Take)
