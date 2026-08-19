#!/usr/bin/env python3
"""Deepen island JSON packs toward Cove bar (8 minigames, 3 quests, 15+ dialogue nodes)."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "src/islands/content"

COVE_MINIGAMES = 8
COVE_QUESTS = 3
COVE_NODES = 15

# Extra minigame templates per island — componentId must exist in registry.
DEEPEN: dict[str, dict] = {
    "signal-city.islands.json": {
        "quest": {
            "id": "q_sc_reef_arcade",
            "track": "side",
            "title": "Reef Arcade Lane",
            "description": "Optional wireframe arcade — compound patience and life forks without the Take.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_sc_compound"},
                {"type": "completeMinigame", "minigameId": "mg_sc_life_fork"},
            ],
            "rewards": {"coins": 45, "xp": 90},
        },
        "minigames": [
            {
                "id": "mg_sc_compound",
                "name": "Reef Snowball",
                "description": "Watch diversified savings compound under phosphor glow.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "sc_investor_tower",
                "genre": "simulation",
                "complexity": "easy",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 100, "ratePct": 7, "years": 12, "label": "reef portfolio"}}
                ],
            },
            {
                "id": "mg_sc_life_fork",
                "name": "Signal Life Fork",
                "description": "Career and credit choices fork your cashflow path.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "sc_credit_lane",
                "genre": "quiz",
                "complexity": "medium",
            },
            {
                "id": "mg_sc_explore",
                "name": "Tower Treasure Walk",
                "description": "Explore Investor Tower rooms for portfolio clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "sc_investor_tower",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_sc_news",
                "name": "Reef News Shocks",
                "description": "Navigate market news dispatches — read before you react.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "sc_signal_plaza",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
            {
                "id": "mg_sc_pasaran",
                "name": "Plaza Fair Trade",
                "description": "Practice fair prices at the signal plaza stalls.",
                "icon": "🧺",
                "componentId": "PasaranMarketGame",
                "areaId": "sc_signal_plaza",
                "genre": "party",
                "complexity": "easy",
            },
            {
                "id": "mg_sc_price",
                "name": "Ticker Price Lab",
                "description": "Slide a mock ticker price and watch demand react.",
                "icon": "📈",
                "componentId": "PriceItRightGame",
                "areaId": "sc_credit_lane",
                "modules": [
                    {"id": "PriceConfig", "config": {"product": "signal subscription", "emoji": "📡", "cost": 2, "maxDemand": 50, "chokePrice": 20}}
                ],
            },
        ],
    },
    "venture-foundry.islands.json": {
        "quest": {
            "id": "q_vf_arcade_lane",
            "track": "side",
            "title": "Foundry Arcade Lane",
            "description": "Optional neon lane — cashflow sim and compound snowball after your pitch.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_vf_cashflow"},
                {"type": "completeMinigame", "minigameId": "mg_vf_compound"},
            ],
            "rewards": {"coins": 55, "xp": 110},
        },
        "minigames": [
            {
                "id": "mg_vf_cashflow",
                "name": "Foundry Cashflow",
                "description": "Simulate twelve months of startup cashflow after seed funding.",
                "icon": "💵",
                "componentId": "CashFlowSimGame",
                "areaId": "vf_growth_lab",
            },
            {
                "id": "mg_vf_compound",
                "name": "Growth Snowball",
                "description": "Reinvest profits and watch the snowball under synth sunset.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "vf_pitch_stage",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 200, "ratePct": 10, "years": 10, "label": "revenue reinvested"}}
                ],
            },
            {
                "id": "mg_vf_explore",
                "name": "Workshop Walk",
                "description": "Explore the maker workshop for prototype clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "vf_workshop",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_vf_life_fork",
                "name": "Founder Life Fork",
                "description": "Bootstrap vs loan vs equity — watch paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "vf_workshop",
            },
            {
                "id": "mg_vf_diversify",
                "name": "Seed Baskets",
                "description": "Spread seed budget across departments before a market year hits.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "vf_growth_lab",
            },
            {
                "id": "mg_vf_news",
                "name": "Pitch Deck News",
                "description": "Investor dispatches — choose responses before the stage lights dim.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "vf_pitch_stage",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
        ],
    },
    "digital-assets.islands.json": {
        "quest": {
            "id": "q_da_arcade_lane",
            "track": "side",
            "title": "Wharf Arcade Lane",
            "description": "Optional web-era lane — compound and life forks without FOMO.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_da_compound"},
                {"type": "completeMinigame", "minigameId": "mg_da_life_fork"},
            ],
            "rewards": {"coins": 45, "xp": 90},
        },
        "minigames": [
            {
                "id": "mg_da_compound",
                "name": "HODL Snowball",
                "description": "Long-horizon compounding — patience beats panic sells.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "da_volatility_valley",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 80, "ratePct": 9, "years": 8, "label": "mock wallet"}}
                ],
            },
            {
                "id": "mg_da_life_fork",
                "name": "Wallet Life Fork",
                "description": "Security vs speed vs speculation — pick a path.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "da_wallet_wharf",
            },
            {
                "id": "mg_da_explore",
                "name": "Valley Vault Walk",
                "description": "Explore volatility valley for chart clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "da_volatility_valley",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_da_news",
                "name": "Crypto Dispatch",
                "description": "Read dispatches before you click buy.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "da_exchange_plaza",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
            {
                "id": "mg_da_pasaran",
                "name": "Exchange Fair Stall",
                "description": "Fair trade practice at the mock exchange.",
                "icon": "🧺",
                "componentId": "PasaranMarketGame",
                "areaId": "da_exchange_plaza",
            },
            {
                "id": "mg_da_price",
                "name": "Token Price Lab",
                "description": "Find a fair mock-token price before the hype hits.",
                "icon": "🪙",
                "componentId": "PriceItRightGame",
                "areaId": "da_exchange_plaza",
                "modules": [
                    {"id": "PriceConfig", "config": {"product": "mock token", "emoji": "🪙", "cost": 1, "maxDemand": 80, "chokePrice": 15}}
                ],
            },
        ],
    },
    "business-assets.islands.json": {
        "quest": {
            "id": "q_ba_arcade_lane",
            "track": "side",
            "title": "Shop Arcade Lane",
            "description": "Optional shop lane — budget split and compound after inventory hustle.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_ba_budget"},
                {"type": "completeMinigame", "minigameId": "mg_ba_compound"},
            ],
            "rewards": {"coins": 50, "xp": 100},
        },
        "minigames": [
            {
                "id": "mg_ba_budget",
                "name": "Shop Budget Split",
                "description": "Split shop income across inventory, payroll, and reserves.",
                "icon": "📊",
                "componentId": "BudgetSplitterGame",
                "areaId": "ba_back_office",
            },
            {
                "id": "mg_ba_compound",
                "name": "Ledger Snowball",
                "description": "Reinvest shop profits and watch reserves grow.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "ba_back_office",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 120, "ratePct": 8, "years": 10, "label": "shop reserves"}}
                ],
            },
            {
                "id": "mg_ba_explore",
                "name": "Warehouse Walk",
                "description": "Explore the warehouse for depreciation clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "ba_warehouse",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_ba_life_fork",
                "name": "Business Life Fork",
                "description": "Lease vs buy vs hire — business paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "ba_storefront",
            },
            {
                "id": "mg_ba_diversify",
                "name": "Inventory Baskets",
                "description": "Spread stock across categories before a slow season.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "ba_warehouse",
            },
            {
                "id": "mg_ba_news",
                "name": "Shop Dispatch",
                "description": "Supplier and tax dispatches — read before you sign.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "ba_storefront",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
        ],
    },
    "intangibles.islands.json": {
        "quest": {
            "id": "q_in_arcade_lane",
            "track": "side",
            "title": "IP Arcade Lane",
            "description": "Optional IP lane — price licenses and compound goodwill.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_in_price"},
                {"type": "completeMinigame", "minigameId": "mg_in_compound"},
            ],
            "rewards": {"coins": 50, "xp": 100},
        },
        "minigames": [
            {
                "id": "mg_in_compound",
                "name": "Goodwill Snowball",
                "description": "Brand trust compounds like savings over years.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "in_goodwill_garden",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 150, "ratePct": 6, "years": 15, "label": "brand trust"}}
                ],
            },
            {
                "id": "mg_in_explore",
                "name": "Patent Office Walk",
                "description": "Explore the patent office for IP clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "in_patent_office",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_in_life_fork",
                "name": "IP Life Fork",
                "description": "License vs sell vs protect — paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "in_brand_boulevard",
            },
            {
                "id": "mg_in_diversify",
                "name": "Brand Baskets",
                "description": "Spread brand bets before a market mood swing.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "in_brand_boulevard",
            },
            {
                "id": "mg_in_news",
                "name": "IP Dispatch",
                "description": "Legal and merger dispatches — read before you sign.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "in_patent_office",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
            {
                "id": "mg_in_price",
                "name": "License Price Lab",
                "description": "Price a mock license and watch demand react.",
                "icon": "📜",
                "componentId": "PriceItRightGame",
                "areaId": "in_brand_boulevard",
                "modules": [
                    {"id": "PriceConfig", "config": {"product": "brand license", "emoji": "™️", "cost": 5, "maxDemand": 40, "chokePrice": 30}}
                ],
            },
        ],
    },
    "real-estate.islands.json": {
        "quest": {
            "id": "q_re_arcade_lane",
            "track": "side",
            "title": "Auction Arcade Lane",
            "description": "Optional property lane — auction sim plus equity snowball.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_re_explore"},
                {"type": "completeMinigame", "minigameId": "mg_re_budget"},
            ],
            "rewards": {"coins": 55, "xp": 110},
        },
        "minigames": [
            {
                "id": "mg_re_explore",
                "name": "Rental District Walk",
                "description": "Walk rental blocks for deed and ledger clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "re_rental_district",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_re_budget",
                "name": "Rent Budget Split",
                "description": "Split rental income across maintenance, mortgage, and reserves.",
                "icon": "📊",
                "componentId": "BudgetSplitterGame",
                "areaId": "re_rental_district",
            },
            {
                "id": "mg_re_life_fork",
                "name": "Property Life Fork",
                "description": "Flip vs hold vs REIT — paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "re_auction_yard",
            },
            {
                "id": "mg_re_diversify",
                "name": "Property Baskets",
                "description": "Spread bets across property types before a rate shock.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "re_reit_tower",
            },
            {
                "id": "mg_re_news",
                "name": "Auction Dispatch",
                "description": "Rate and zoning dispatches — read before you bid.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "re_auction_yard",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
            {
                "id": "mg_re_pasaran",
                "name": "Yard Fair Trade",
                "description": "Fair price practice before the auction bell.",
                "icon": "🧺",
                "componentId": "PasaranMarketGame",
                "areaId": "re_auction_yard",
            },
        ],
    },
    "future-shores.islands.json": {
        "quest": {
            "id": "q_fs_arcade_lane",
            "track": "side",
            "title": "Sky Arcade Lane",
            "description": "Optional sky lane — life forks and explore the scaffold grid.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_fs_life_fork"},
                {"type": "completeMinigame", "minigameId": "mg_fs_explore"},
            ],
            "rewards": {"coins": 40, "xp": 80},
        },
        "minigames": [
            {
                "id": "mg_fs_life_fork",
                "name": "Horizon Life Fork",
                "description": "Long horizon vs quick flip — portfolio paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "fs_blank_canvas",
            },
            {
                "id": "mg_fs_explore",
                "name": "Scaffold Grid Walk",
                "description": "Walk the unfinished scaffold for builder clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "fs_scaffold",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_fs_news",
                "name": "Sky Dispatch",
                "description": "Weather dispatches — read before you rebalance.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "fs_community_dock",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 6}}],
            },
            {
                "id": "mg_fs_pasaran",
                "name": "Dock Fair Trade",
                "description": "Fair trade at the community dock prototypes.",
                "icon": "🧺",
                "componentId": "PasaranMarketGame",
                "areaId": "fs_community_dock",
            },
            {
                "id": "mg_fs_price",
                "name": "Plot Price Lab",
                "description": "Price a sky plot before the storm front.",
                "icon": "📐",
                "componentId": "PriceItRightGame",
                "areaId": "fs_blank_canvas",
                "modules": [
                    {"id": "PriceConfig", "config": {"product": "sky plot lease", "emoji": "🎨", "cost": 4, "maxDemand": 35, "chokePrice": 28}}
                ],
            },
        ],
        "dialogue_nodes": [
            {
                "graph": "dlg_future_keeper",
                "after": "rush_done",
                "node": {
                    "id": "fs_arcade_hint",
                    "speaker": "The Keeper",
                    "text": "Sky Arcade Lane opens when you want extra practice — compound, explore, no Take required.",
                    "end": True,
                },
            },
            {
                "graph": "dlg_fs_weather",
                "after": "done",
                "node": {
                    "id": "fs_weather_extra",
                    "speaker": "Weather Weaver",
                    "text": "Try the Sky Arcade lane if baskets feel easy — life forks teach patience too.",
                    "end": True,
                },
            },
        ],
    },
    "financial-assets.islands.json": {
        "quest": {
            "id": "q_fa_arcade_lane",
            "track": "side",
            "title": "Market Arcade Lane",
            "description": "Optional coast lane — life fork and explore after your ETF badge.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_fa_life_fork"},
                {"type": "completeMinigame", "minigameId": "mg_fa_explore"},
            ],
            "rewards": {"coins": 60, "xp": 120},
        },
        "minigames": [
            {
                "id": "mg_fa_life_fork",
                "name": "Market Life Fork",
                "description": "Index vs stock-pick vs bond ladder — paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "fa_market_street",
            },
            {
                "id": "mg_fa_explore",
                "name": "Broker Hall Walk",
                "description": "Explore broker hall rooms for portfolio clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "fa_broker_hall",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_fa_news",
                "name": "News Stand Shocks",
                "description": "Headline dispatches — read before you trade.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "fa_news_stand",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["finance_kids"], "maxDraws": 8}}],
            },
        ],
    },
    "credit-kingdom.islands.json": {
        "quest": {
            "id": "q_ck_score_practice",
            "track": "side",
            "title": "Score Practice",
            "description": "Optional ruins lane — score scanner and compound without the Ordeal Take.",
            "objectives": [
                {"type": "completeMinigame", "minigameId": "mg_ck_signal"},
                {"type": "completeMinigame", "minigameId": "mg_ck_compound"},
            ],
            "rewards": {"coins": 35, "xp": 70},
        },
        "minigames": [
            {
                "id": "mg_ck_compound",
                "name": "Recovery Snowball",
                "description": "On-time payments compound trust like savings.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "ck_score_vault",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 50, "ratePct": 5, "years": 10, "label": "on-time streak"}}
                ],
            },
            {
                "id": "mg_ck_explore",
                "name": "Ruins Walk",
                "description": "Explore the ruined gate for credit shard clues.",
                "icon": "🗺️",
                "componentId": "ExplorablePuzzleGame",
                "areaId": "ck_gate",
                "genre": "exploration",
                "complexity": "medium",
                "visualShell": "explore",
            },
            {
                "id": "mg_ck_life_fork",
                "name": "Spiral Life Fork",
                "description": "Wait vs borrow vs balance — paths fork before Rex.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "ck_debt_canyon",
            },
            {
                "id": "mg_ck_news",
                "name": "Canyon Dispatch",
                "description": "APR and late-fee dispatches — read before you panic.",
                "icon": "📰",
                "componentId": "ModularMinigame",
                "areaId": "ck_debt_canyon",
                "modules": [{"id": "EventDeck", "config": {"deckIds": ["credit_kingdom"], "maxDraws": 6}}],
            },
            {
                "id": "mg_ck_diversify",
                "name": "Payment Baskets",
                "description": "Spread payments across debts before interest compounds.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "ck_debt_canyon",
            },
        ],
    },
    "paycheck-peninsula.islands.json": {
        "minigames": [
            {
                "id": "mg_pp_compound",
                "name": "Peninsula Snowball",
                "description": "Rainy-day fund compounding over calm seasons.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "pp_rainy_day_park",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 60, "ratePct": 6, "years": 8, "label": "rainy-day fund"}}
                ],
            },
            {
                "id": "mg_pp_life_fork",
                "name": "Clock Life Fork",
                "description": "Shelter vs splurge vs side gig — cashflow paths fork.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "pp_main_street",
            },
            {
                "id": "mg_pp_diversify",
                "name": "Bucket Baskets",
                "description": "Spread paycheck across buckets before surprise bills hit.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "pp_budget_bureau",
            },
            {
                "id": "mg_pp_pasaran",
                "name": "Main Street Fair",
                "description": "Fair trade at Vendor Vee's lane after the stall Take.",
                "icon": "🧺",
                "componentId": "PasaranMarketGame",
                "areaId": "pp_main_street",
            },
        ],
    },
    "harbor-haven.islands.json": {
        "areas": [
            {
                "id": "hh_market",
                "name": "Pasaran Lane",
                "description": "Fair trade practice and money-culture locals — Harbor's market wing.",
                "icon": "🧺",
                "connections": ["hh_plaza", "hh_pavilion"],
            },
            {
                "id": "hh_pavilion",
                "name": "Freedom Pavilion",
                "description": "Unlocked after Freedom Seal — carpet upgrades and victory lap toys.",
                "icon": "🏆",
                "connections": ["hh_market"],
            },
        ],
        "area_connections": {"hh_plaza": ["hh_dock", "hh_market"]},
        "minigames": [
            {
                "id": "mg_harbor_compound",
                "name": "Harbor Snowball",
                "description": "Watch Harbor savings compound in the vault display.",
                "icon": "❄️",
                "componentId": "CompoundSnowballGame",
                "areaId": "hh_market",
                "modules": [
                    {"id": "CompoundConfig", "config": {"principal": 25, "ratePct": 5, "years": 6, "label": "Harbor jar"}}
                ],
            },
            {
                "id": "mg_harbor_pasaran",
                "name": "Pasaran Practice",
                "description": "Fair trade stalls before your first voyage.",
                "icon": "🧺",
                "componentId": "PasaranMarketGame",
                "areaId": "hh_market",
            },
            {
                "id": "mg_harbor_coin_catcher",
                "name": "Plaza Coin Catcher",
                "description": "Catch coins, dodge impulse buys — Harbor arcade warm-up.",
                "icon": "🕹️",
                "componentId": "CoinCatcherMinigame",
                "areaId": "hh_plaza",
                "genre": "arcade",
                "complexity": "easy",
            },
            {
                "id": "mg_harbor_life_fork",
                "name": "Harbor Life Fork",
                "description": "Tiny spend choices fork before your first painting.",
                "icon": "🔀",
                "componentId": "LifeForkGame",
                "areaId": "hh_plaza",
            },
            {
                "id": "mg_harbor_budget",
                "name": "Dock Budget Warm-up",
                "description": "Split a tiny pouch into needs, wants, and voyage savings.",
                "icon": "📊",
                "componentId": "BudgetSplitterGame",
                "areaId": "hh_dock",
            },
            {
                "id": "mg_harbor_diversify",
                "name": "Pavilion Baskets",
                "description": "Spread Freedom rewards across Harbor upgrades.",
                "icon": "🧺",
                "componentId": "DiversifyBasketsGame",
                "areaId": "hh_pavilion",
            },
        ],
    },
}


def count_nodes(island: dict) -> int:
    return sum(len(d.get("nodes", [])) for d in island.get("dialogues", []))


def merge_island(island: dict, spec: dict) -> None:
    existing_mg = {m["id"] for m in island.get("minigames") or []}
    for mg in spec.get("minigames", []):
        if mg["id"] not in existing_mg:
            island.setdefault("minigames", []).append(deepcopy(mg))
            existing_mg.add(mg["id"])

    existing_q = {q["id"] for q in island.get("quests", [])}
    quest = spec.get("quest")
    if quest and quest["id"] not in existing_q:
        island.setdefault("quests", []).append(deepcopy(quest))

    for area in spec.get("areas", []):
        ids = {a["id"] for a in island.get("areas", [])}
        if area["id"] not in ids:
            island.setdefault("areas", []).append(deepcopy(area))

    for area_id, conns in spec.get("area_connections", {}).items():
        for area in island["areas"]:
            if area["id"] == area_id:
                merged = list(dict.fromkeys([*(area.get("connections") or []), *conns]))
                area["connections"] = merged

    for dn in spec.get("dialogue_nodes", []):
        for dlg in island.get("dialogues", []):
            if dlg["id"] != dn["graph"]:
                continue
            ids = {n["id"] for n in dlg.get("nodes", [])}
            if dn["node"]["id"] not in ids:
                dlg.setdefault("nodes", []).append(deepcopy(dn["node"]))


def main() -> None:
    for filename, spec in DEEPEN.items():
        path = CONTENT / filename
        data = json.loads(path.read_text())
        island = data["islands"][0]
        merge_island(island, spec)
        path.write_text(json.dumps(data, indent=2) + "\n")
        mg = len(island.get("minigames") or [])
        q = len(island.get("quests") or [])
        nodes = count_nodes(island)
        print(f"{island['id']}: minigames={mg} quests={q} nodes={nodes}")


if __name__ == "__main__":
    main()
