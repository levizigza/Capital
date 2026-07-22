/**
 * Money pop-culture homage layer.
 *
 * Rules of the road (keep us out of copyright trouble):
 * - Parody tropes, historical events, public-domain Dickens energy, and
 *   generic "TV host / pitch show / arcade cabinet" archetypes only.
 * - Never use trademarked character names, show titles as game titles,
 *   logos, catchphrases owned as marks, or 1:1 costume clones.
 * - Teach a money lesson in every wink.
 */

import type {
  DialogueGraph,
  IslandDefinition,
  IslandMinigame,
  IslandNpc,
} from "./types";
import { castMascotForNpc, getMascot } from "./moneyCast";

export type PopHomageNpc = IslandNpc & {
  tagline: string;
  dialogue: DialogueGraph;
};

export type MinigameHomage = {
  /** Optional display-name tweak (still original) */
  name?: string;
  /** Appended / replacement description wink */
  description: string;
  homage: string;
};

/** Harbor plaza cameos — talkable flavor, not quest-gated. Money Mascot locals. */
export const PLAZA_POP_CAMEOS = [
  {
    id: "plaza_vault_vince",
    name: "Vault Vince",
    icon: "🏦",
    tagline: "Keeps your wealth safe",
    line: "I used to sleep on a mattress of coins. Then I learned: coins that only sit… never grow. Invest a little. Live a little.",
  },
  {
    id: "plaza_saver_star",
    name: "Saver Star",
    icon: "⭐",
    tagline: "Reward for saving",
    line: "You get a budget! You get a budget! Everybody gets a budget — and a rainy-day jar before the confetti.",
  },
  {
    id: "plaza_market_money",
    name: "Market Money",
    icon: "📈",
    tagline: "Rides market ups and downs",
    line: "BUY! …wait — research first. Screaming doesn't beat a diversified basket.",
  },
] as const;

/**
 * Island-specific homage NPCs injected at content load.
 * Keys = island id. areaId must exist on that island (falls back to first area).
 */
const ISLAND_POP_NPCS: Record<string, Omit<PopHomageNpc, "areaId"> & { preferredAreaHints: string[] }> = {
  coincraft_cove: {
    id: "npc_uncle_ledger",
    name: "Uncle Ledger",
    icon: "🕯️",
    dialogueGraphId: "dlg_uncle_ledger",
    tagline: "Coin-vault keeper who finally opened a savings jar",
    preferredAreaHints: ["cc_savings_lighthouse", "cc_harbor"],
    dialogue: {
      id: "dlg_uncle_ledger",
      startNodeId: "ul1",
      nodes: [
        {
          id: "ul1",
          speaker: "Uncle Ledger",
          text: "Bah— budget! I once counted every coin by candlelight. Want the moral of my Christmas story?",
          choices: [
            { id: "ul1_a", text: "Tell me.", nextNodeId: "ul2" },
            { id: "ul1_b", text: "Maybe later.", nextNodeId: "ul3" },
          ],
        },
        {
          id: "ul2",
          speaker: "Uncle Ledger",
          text: "Generosity without a plan becomes regret. A plan without joy becomes a vault you never open. Save, share, and still buy one shell you love.",
          end: true,
        },
        {
          id: "ul3",
          speaker: "Uncle Ledger",
          text: "Fine. The lighthouse jar still takes deposits when you're ready.",
          end: true,
        },
      ],
    },
  },
  paycheck_peninsula: {
    id: "npc_giveaway_gail",
    name: "Giveaway Gail",
    icon: "🎁",
    dialogueGraphId: "dlg_giveaway_gail",
    tagline: "Audience-hype host who gifts… envelopes",
    preferredAreaHints: ["pp_main_street", "pp_budget_bureau"],
    dialogue: {
      id: "dlg_giveaway_gail",
      startNodeId: "gg1",
      nodes: [
        {
          id: "gg1",
          speaker: "Giveaway Gail",
          text: "Under your seat — a needs envelope! Under your other seat — a wants envelope! Under the third seat — savings!",
          choices: [
            { id: "gg1_a", text: "I'll split the paycheck!", nextNodeId: "gg2" },
            { id: "gg1_b", text: "Can I just take wants?", nextNodeId: "gg3" },
          ],
        },
        {
          id: "gg2",
          speaker: "Giveaway Gail",
          text: "That's the show! Confetti is free. Compound interest is the real prize.",
          end: true,
        },
        {
          id: "gg3",
          speaker: "Giveaway Gail",
          text: "Bold choice — and a fast way to cancel next season. Try all three buckets.",
          end: true,
        },
      ],
    },
  },
  financial_assets: {
    id: "npc_howler_harbor",
    name: "Howler of Harbor Street",
    icon: "🐺",
    dialogueGraphId: "dlg_howler_harbor",
    tagline: "Wall-Street-wolf energy — paper trading only",
    preferredAreaHints: ["fa_broker_hall", "fa_market_street"],
    dialogue: {
      id: "dlg_howler_harbor",
      startNodeId: "hh1",
      nodes: [
        {
          id: "hh1",
          speaker: "Howler of Harbor Street",
          text: "I used to howl about overnight riches. Now I howl about risk tolerance. Paper trade first — ego later.",
          choices: [
            { id: "hh1_a", text: "Show me the paper desk.", nextNodeId: "hh2" },
            { id: "hh1_b", text: "Sounds loud.", nextNodeId: "hh3" },
          ],
        },
        {
          id: "hh2",
          speaker: "Howler of Harbor Street",
          text: "Diversify. Size positions small. If a tip needs a secret handshake, walk away.",
          end: true,
        },
        {
          id: "hh3",
          speaker: "Howler of Harbor Street",
          text: "Volume without research is just noise pollution.",
          end: true,
        },
      ],
    },
  },
  digital_assets: {
    id: "npc_pizza_day_pete",
    name: "Pizza Day Pete",
    icon: "🍕",
    dialogueGraphId: "dlg_pizza_day_pete",
    tagline: "Historical meme: spent early coins on dinner",
    preferredAreaHints: ["da_wallet_wharf", "da_exchange_plaza"],
    dialogue: {
      id: "dlg_pizza_day_pete",
      startNodeId: "pd1",
      nodes: [
        {
          id: "pd1",
          speaker: "Pizza Day Pete",
          text: "True story energy: I once traded a stack of internet coins for two pizzas. Best dinner. Worst timing. Lesson?",
          choices: [
            { id: "pd1_a", text: "Don't spend the whole stack.", nextNodeId: "pd2" },
            { id: "pd1_b", text: "Always buy pizza?", nextNodeId: "pd3" },
          ],
        },
        {
          id: "pd2",
          speaker: "Pizza Day Pete",
          text: "Exactly. Keep a runway. Treat speculative coins like hot sauce — a little goes far.",
          end: true,
        },
        {
          id: "pd3",
          speaker: "Pizza Day Pete",
          text: "Pizza is a need sometimes. Liquidating your whole wallet for pepperoni is a want with consequences.",
          end: true,
        },
      ],
    },
  },
  signal_city: {
    id: "npc_hot_take_hal",
    name: "Hot-Take Hal",
    icon: "📢",
    dialogueGraphId: "dlg_hot_take_hal",
    tagline: "Shouty market-commentary archetype",
    preferredAreaHints: ["sc_investor_tower", "sc_signal_plaza"],
    dialogue: {
      id: "dlg_hot_take_hal",
      startNodeId: "ht1",
      nodes: [
        {
          id: "ht1",
          speaker: "Hot-Take Hal",
          text: "THIS signal is… wait, let me actually read the chart. Teaching moment: hot takes cool off; credit scores don't.",
          choices: [
            { id: "ht1_a", text: "Scan with me.", nextNodeId: "ht2" },
            { id: "ht1_b", text: "I'll keep scrolling.", nextNodeId: "ht3" },
          ],
        },
        {
          id: "ht2",
          speaker: "Hot-Take Hal",
          text: "Separate news from noise. If it needs ALL CAPS to sell, it's probably selling you.",
          end: true,
        },
        {
          id: "ht3",
          speaker: "Hot-Take Hal",
          text: "Scroll responsibly. Your future self doesn't clap for rage-trades.",
          end: true,
        },
      ],
    },
  },
  real_estate: {
    id: "npc_flip_fran",
    name: "Flip-Channel Fran",
    icon: "📺",
    dialogueGraphId: "dlg_flip_fran",
    tagline: "Home-makeover montage energy — numbers first",
    preferredAreaHints: ["re_auction_yard", "re_rental_district"],
    dialogue: {
      id: "dlg_flip_fran",
      startNodeId: "ff1",
      nodes: [
        {
          id: "ff1",
          speaker: "Flip-Channel Fran",
          text: "Reveal day is fun. Carrying costs are the real plot twist. Want the untelevised math?",
          choices: [
            { id: "ff1_a", text: "Show me the math.", nextNodeId: "ff2" },
            { id: "ff1_b", text: "Just the before/after.", nextNodeId: "ff3" },
          ],
        },
        {
          id: "ff2",
          speaker: "Flip-Channel Fran",
          text: "Price, repairs, holding time, exit. If the montage skips taxes and vacancies, pause the show.",
          end: true,
        },
        {
          id: "ff3",
          speaker: "Flip-Channel Fran",
          text: "Pretty paint doesn't pay the note. Come back when you want the ledger cut.",
          end: true,
        },
      ],
    },
  },
  venture_foundry: {
    id: "npc_pitch_chair_pat",
    name: "Pitch-Chair Pat",
    icon: "🪑",
    dialogueGraphId: "dlg_pitch_chair_pat",
    tagline: "Generic pitch-panel archetype (no TV logos)",
    preferredAreaHints: ["vf_pitch_stage", "vf_workshop"],
    dialogue: {
      id: "dlg_pitch_chair_pat",
      startNodeId: "pc1",
      nodes: [
        {
          id: "pc1",
          speaker: "Pitch-Chair Pat",
          text: "I'm in for equity — if your unit economics aren't a mystery box. What's your burn rate?",
          choices: [
            { id: "pc1_a", text: "Help me budget the runway.", nextNodeId: "pc2" },
            { id: "pc1_b", text: "We'll figure it out later.", nextNodeId: "pc3" },
          ],
        },
        {
          id: "pc2",
          speaker: "Pitch-Chair Pat",
          text: "Love that answer. Runway beats vibes. Price the product before you hire the confetti cannon.",
          end: true,
        },
        {
          id: "pc3",
          speaker: "Pitch-Chair Pat",
          text: "I'm out — until there's a spreadsheet. Kindly.",
          end: true,
        },
      ],
    },
  },
  business_assets: {
    id: "npc_corner_office",
    name: "Corner-Office Cleo",
    icon: "🏢",
    dialogueGraphId: "dlg_corner_office",
    tagline: "Heir-apparent energy — cashflow over drama",
    preferredAreaHints: ["ba_back_office", "ba_storefront"],
    dialogue: {
      id: "dlg_corner_office",
      startNodeId: "co1",
      nodes: [
        {
          id: "co1",
          speaker: "Corner-Office Cleo",
          text: "Family empires look shiny until payroll hits. Want the unglamorous boardroom tip?",
          choices: [
            { id: "co1_a", text: "Yes — cashflow.", nextNodeId: "co2" },
            { id: "co1_b", text: "I'd rather scheme.", nextNodeId: "co3" },
          ],
        },
        {
          id: "co2",
          speaker: "Corner-Office Cleo",
          text: "Track inflows and outflows weekly. Empires fall to unpaid invoices, not missing theme music.",
          end: true,
        },
        {
          id: "co3",
          speaker: "Corner-Office Cleo",
          text: "Scheming without a ledger is just expensive improv.",
          end: true,
        },
      ],
    },
  },
  intangibles: {
    id: "npc_brand_remix",
    name: "Brand-Remix Remy",
    icon: "🎛️",
    dialogueGraphId: "dlg_brand_remix",
    tagline: "Sample-culture IP coach — license before you loop",
    preferredAreaHints: ["in_brand_boulevard", "in_patent_office"],
    dialogue: {
      id: "dlg_brand_remix",
      startNodeId: "br1",
      nodes: [
        {
          id: "br1",
          speaker: "Brand-Remix Remy",
          text: "Inspiration is free. Copying a logo is a lawsuit with a beat drop. Want the clean sample?",
          choices: [
            { id: "br1_a", text: "Teach me IP basics.", nextNodeId: "br2" },
            { id: "br1_b", text: "I'll freestyle.", nextNodeId: "br3" },
          ],
        },
        {
          id: "br2",
          speaker: "Brand-Remix Remy",
          text: "Patent, trademark, goodwill — know which asset you own before you monetize the vibe.",
          end: true,
        },
        {
          id: "br3",
          speaker: "Brand-Remix Remy",
          text: "Freestyle in the booth. License in the paperwork.",
          end: true,
        },
      ],
    },
  },
  credit_kingdom: {
    id: "npc_subprime_sam",
    name: "Subprime Sam",
    icon: "🏚️",
    dialogueGraphId: "dlg_subprime_sam",
    tagline: "2008 cautionary tale — history, not a biopic",
    preferredAreaHints: ["ck_debt_canyon", "ck_gate"],
    dialogue: {
      id: "dlg_subprime_sam",
      startNodeId: "ss1",
      nodes: [
        {
          id: "ss1",
          speaker: "Subprime Sam",
          text: "I signed for a house I couldn't stress-test. Rates moved. Story over. Want the recovery chapter?",
          choices: [
            { id: "ss1_a", text: "How do I rebuild credit?", nextNodeId: "ss2" },
            { id: "ss1_b", text: "Too bleak.", nextNodeId: "ss3" },
          ],
        },
        {
          id: "ss2",
          speaker: "Subprime Sam",
          text: "Pay on time, keep utilization low, read every term. Boring is beautiful when ruins are behind you.",
          end: true,
        },
        {
          id: "ss3",
          speaker: "Subprime Sam",
          text: "Fair. The Score Vault still has drills when you're ready.",
          end: true,
        },
      ],
    },
  },
  future_shores: {
    id: "npc_blank_canvas_bea",
    name: "Blank-Canvas Bea",
    icon: "🖌️",
    dialogueGraphId: "dlg_blank_canvas_bea",
    tagline: "New Gen maker — you paint the next decade",
    preferredAreaHints: ["fs_blank_canvas", "fs_scaffold"],
    dialogue: {
      id: "dlg_blank_canvas_bea",
      startNodeId: "bb1",
      nodes: [
        {
          id: "bb1",
          speaker: "Blank-Canvas Bea",
          text: "Every era left a style. Ours is unfinished on purpose — so your portfolio weather can look like you.",
          choices: [
            { id: "bb1_a", text: "I'll paint with diversification.", nextNodeId: "bb2" },
            { id: "bb1_b", text: "I only want one color.", nextNodeId: "bb3" },
          ],
        },
        {
          id: "bb2",
          speaker: "Blank-Canvas Bea",
          text: "That's New Gen. Mix horizons. Leave margin. Sign your own ledger seal.",
          end: true,
        },
        {
          id: "bb3",
          speaker: "Blank-Canvas Bea",
          text: "One color is a mood board. A portfolio needs a palette.",
          end: true,
        },
      ],
    },
  },
};

/** Minigame id → safe pop-culture wink (no trademarked titles as product names). */
export const MINIGAME_HOMAGE: Record<string, MinigameHomage> = {
  mg_coin_catcher: {
    description: "Coin-fall arcade vibes — catch value, dodge impulse buys. No claw-machine regrets.",
    homage: "Arcade cabinet energy",
  },
  mg_price_it_right: {
    name: "Set the Price",
    description: "Studio-lights optional. Guess fair value — showcase spinning is purely metaphorical.",
    homage: "Pricing-game show archetype",
  },
  mg_compound_snowball: {
    description: "The quiet sequel to every get-rich-quick montage: tiny flakes, long winters, real growth.",
    homage: "Montage vs math",
  },
  mg_diversify_baskets: {
    name: "Don't Break the Basket",
    description: "Eggs, baskets, and the oldest proverb on any trading street — split the risk.",
    homage: "Proverb, not a product placement",
  },
  mg_fs_diversify: {
    description: "Weather the New Gen skies — one basket per storm type.",
    homage: "Portfolio weather",
  },
  mg_life_fork: {
    description: "Choose-your-own career fork. Drama optional; tradeoffs required.",
    homage: "Branching-life trope",
  },
  mg_pasaran_market: {
    description: "Bazaar energy — haggle fair, walk away proud. No reality-TV confessional booth.",
    homage: "Market-day classic",
  },
  mg_mancala_compound: {
    description: "Sow coins, reap compound. Ancient board, modern interest lesson.",
    homage: "Public-domain board wisdom",
  },
  mg_cashflow_sim: {
    description: "Deal or pass — original Capital rules. Accept income, dodge liabilities.",
    homage: "Deal-table tension (original framing)",
  },
  mg_paper_trading: {
    description: "Howl at charts with fake money first. Real ego optional.",
    homage: "Wolfish paper desk",
  },
  mg_mock_exchange: {
    description: "FOMO meter included. Floor-price chaos without the ape profile pics.",
    homage: "Exchange frenzy trope",
  },
  mg_property_auction: {
    description: "Going once… check the rehab budget twice. Montage paint is not equity.",
    homage: "Auction gavel energy",
  },
  mg_startup_budget: {
    description: "Pitch-panel butterflies meet burn-rate reality.",
    homage: "Pitch chair nerves",
  },
  mg_signal_scan: {
    description: "Mute the hot takes. Read the signal.",
    homage: "Cable-finance volume dial",
  },
  mg_inbox_storm: {
    description: "Bills rain like a season finale. Sort needs from noise.",
    homage: "Chaos-mail montage",
  },
  mg_budget_split: {
    description: "You get a needs bucket! You get a wants bucket! You get savings!",
    homage: "Giveaway-host energy",
  },
  mg_etf_detective: {
    description: "Noir trench coat optional. Fee sleuthing required.",
    homage: "Detective serial vibes",
  },
  mg_bonds_vs_stocks: {
    description: "Buddy-cop mismatch: steady vs spicy. Both can share a portfolio.",
    homage: "Odd-couple asset duo",
  },
  mg_treasure_vault: {
    description: "Explore the vault like a Saturday morning quest — needs before shiny wants.",
    homage: "Adventure-vault trope",
  },
  mg_ip_scenario: {
    description: "Remix culture meets paperwork. License the loop.",
    homage: "Sample clearance parable",
  },
  mg_ck_budget_balancer: {
    description: "Debt loadout screen — equip payments, unequip regret.",
    homage: "RPG gear screen for bills",
  },
};

const EXTRA_FORBIDDEN = [
  "Mario",
  "Nintendo",
  "Monopoly",
  "Cashflow",
  "Rich Dad",
  "Shark Tank",
  "The Price Is Right",
  "Wolf of Wall Street",
  "DuckTales",
  "MrBeast",
  "Oprah",
  "Succession",
  "Billions",
];

function resolveAreaId(island: IslandDefinition, hints: string[]): string {
  for (const hint of hints) {
    const byId = island.areas.find((a) => a.id === hint);
    if (byId) return byId.id;
    const byName = island.areas.find((a) => a.name.toLowerCase() === hint.toLowerCase());
    if (byName) return byName.id;
  }
  return island.areas[0]?.id ?? "unknown";
}

function applyMinigameHomage(mg: IslandMinigame): IslandMinigame {
  const h = MINIGAME_HOMAGE[mg.id];
  if (!h) return mg;
  return {
    ...mg,
    name: h.name ?? mg.name,
    description: h.description,
    homage: h.homage,
  };
}

/** Enrich a parsed island with homage NPCs, dialogues, and minigame winks. */
export function enrichIslandWithPopCulture(island: IslandDefinition): IslandDefinition {
  const spec = ISLAND_POP_NPCS[island.id];
  let npcs = [...island.npcs];
  let dialogues = [...island.dialogues];

  if (spec && !npcs.some((n) => n.id === spec.id)) {
    const areaId = resolveAreaId(island, spec.preferredAreaHints);
    const { preferredAreaHints: _hints, dialogue, ...npcRest } = spec;
    npcs = [...npcs, { ...npcRest, areaId }];
    if (!dialogues.some((d) => d.id === dialogue.id)) {
      dialogues = [...dialogues, dialogue];
    }
  }

  // Every island local is a Money Mascot (variation of the world cast).
  npcs = npcs.map((n) => {
    if (n.mascotId) {
      const known = getMascot(n.mascotId);
      return {
        ...n,
        icon: known.emoji,
        tagline: n.tagline ?? known.tagline,
      };
    }
    const mascot = castMascotForNpc(n.id);
    return {
      ...n,
      mascotId: mascot.id,
      icon: mascot.emoji,
      tagline: n.tagline ?? mascot.tagline,
    };
  });

  const minigames = island.minigames?.map(applyMinigameHomage);

  const provenance = island.provenance
    ? {
        ...island.provenance,
        originality_notes: `${island.provenance.originality_notes} Pop-culture money nods use original Money Mascot characters and generic tropes only — never trademarked casts or show titles as product names.`,
        forbidden_references: Array.from(
          new Set([...(island.provenance.forbidden_references ?? []), ...EXTRA_FORBIDDEN]),
        ),
      }
    : island.provenance;

  return {
    ...island,
    npcs,
    dialogues,
    minigames,
    provenance,
  };
}

export function getMinigameHomageLine(minigameId: string): string | undefined {
  return MINIGAME_HOMAGE[minigameId]?.homage;
}
