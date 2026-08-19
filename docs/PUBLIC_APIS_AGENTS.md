---
id: docs/PUBLIC_APIS_AGENTS
title: Public API connectors & first justified agents
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Public APIs + Next Agents

Sources drawn from [public-apis/public-apis](https://github.com/public-apis/public-apis) — **no-key / free** endpoints only, behind Capital connectors.

## Connectors (`src/business/publicApis/`)

| Connector | Upstream | Use |
|-----------|----------|-----|
| `frankfurter` | Frankfurter FX | Educational FX / scenario context |
| `dictionary` | Free Dictionary API | Money-term definitions for teach copy |
| `openLibrary` | Open Library | Reading list hooks for lead magnets |
| `coinGecko` | CoinGecko simple price | Market signal (not financial advice) |
| `zenQuotes` | ZenQuotes | Quote hooks **only** when tied to a product insight |
| `hackerNews` | HN Firebase API | Lightweight tech/market headlines for research |

All calls go through `PublicApiClient` with timeouts, attribution URLs, and **no secrets**.

## Agents (justified — not role-fill)

Registered via Agent Registry with `InstantiationJustification`:

1. **`agent_finance_scenario_research`** — FX + dictionary for Harbor educational scenarios  
2. **`agent_marketing_insight_enricher`** — Open Library + quotes enrich *existing* product/customer insights for Product-to-Content  
3. **`agent_market_signal_scout`** — CoinGecko + HN signals into Research OBSERVE (never auto-trading / advice)

Each agent: least-privilege tools only · HITL before side effects · outputs → temp / agent_run_history.

## Loop fit

Agents emit or enrich operating-loop events (OBSERVE/LEARN). They do **not** skip DECIDE or write canonical memory.
