# Financial Assets — Story Circle (Budget Kart)

> **SIDE SHORE** — Era chapter on the outer ring. Soft-locked until Paycheck Change.

**Island ID:** `financial_assets`  
**Map name:** Budget Kart Coast (1990s flat-color markets)  
**Learning kernel:** Stocks · bonds · ETFs · diversification · news shocks  
**Island Ally:** Penny the Trader · Marcus the Broker · Nina the Analyst · Dr. Fund · Old Timer Walt  
**Canon:** [story-bible.md](../../story-bible.md)

---

## 8 beats

| # | Beat | In this island | IDs | Kid one-liner |
|---|------|----------------|-----|---------------|
| 1 | **You** | Arrive on Market Street | area `fa_market_street` | “Budget Kart!” |
| 2 | **Need** | Penny: build a starter portfolio | `npc_penny`, `q_portfolio_starter` | “I need to invest smart.” |
| 3 | **Go** | Earn trading license; visit Broker Hall | `fa_broker_hall`, `fa_trading_license` | “Let’s go trade.” |
| 4 | **Search** | Bonds vs stocks; ETF detective; news stand | `q_bonds_vs_stocks`, `q_etf_detective`, `mg_paper_trading` | “I try the markets.” |
| 5 | **Find** | Portfolio report + ETF badge | `fa_portfolio_report`, `fa_etf_badge` | “My portfolio works!” |
| 6 | **Take** | Digression: peek boards vs rush a trade | `p_fork`, `fa_portfolio_peek` / `fa_portfolio_rush` | “Study or rush?” |
| 7 | **Return** | Carpet home | travel | “Back to Harbor.” |
| 8 | **Change** | Harbor myth shelf | `harborScars` | “Harbor gossiped.” |

**Main quests:** `q_portfolio_starter`, `q_bonds_vs_stocks`, `q_etf_detective`

---

## Completeness gate

- [x] Beats filled with concrete IDs  
- [x] Digression scar pair wired (`fa_portfolio_peek` / `fa_portfolio_rush`)  
- [x] Minigames registered (mock exchange, diversify, compound, news)  
- [x] Fits Story Bible (side shore literacy)
