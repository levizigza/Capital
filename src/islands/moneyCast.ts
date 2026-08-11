/**
 * The People of Capital — Money Mascots (+ series leads).
 *
 * These anthropomorphic money characters are the world's population:
 * Harbor locals, island NPCs, rivals, and Outfitter body choices.
 * Variations = same archetype + color / accessory / companion tweaks.
 *
 * Series leads (Cashwell, Cashmere, …) are mythically central but never steal
 * Piggy / Coin Bag ownership of the signature Harbor loop.
 * The Debt Collector is the Credit Kingdom Ordeal villain — never a terrace lead.
 *
 * Note: keep this file free of imports from `character.ts` to avoid cycles.
 */

export type MoneyMascotId =
  | "cashwell"
  | "cashmere"
  | "peso_pedro"
  | "fortuna_fernanda"
  | "billionaire_bao"
  | "jade_fortune"
  | "sultan_stacks"
  | "dinar_dahlia"
  | "mansa_moneybaggs"
  | "kandake_kash"
  | "moneybagg_bro"
  | "mula_mami"
  | "debt_collector"
  | "dollar_dash"
  | "euro_ella"
  | "pound_pal"
  | "yen_yogi"
  | "coiny"
  | "cash_stack_jack"
  | "baggy_bucks"
  | "piggy_penny"
  | "vault_vince"
  | "receipt_rita"
  | "card_shark"
  | "wallet_walt"
  | "coupon_cutie"
  | "goldie_bar"
  | "budget_bot"
  | "debt_cloud"
  | "fortune_chest"
  | "safe_sally"
  | "market_money"
  | "tip_jar_tom"
  | "crypto_coin"
  | "dividend_dan"
  | "loan_ranger"
  | "risk_rocket"
  | "saver_star"
  | "spendy_sue"
  | "value_vault"
  | "tax_tally"
  | "trade_buddy"
  | "future_fund";

/** Primary series face — Cashwell Capital. */
export const SERIES_LEAD_MASCOT_ID: MoneyMascotId = "cashwell";

/** Illustrated series leads currently in Harbor (grow one-by-one). */
export const SERIES_LEAD_MASCOT_IDS: readonly MoneyMascotId[] = [
  "cashwell",
  "cashmere",
  "peso_pedro",
  "fortuna_fernanda",
  "billionaire_bao",
  "jade_fortune",
  "sultan_stacks",
  "dinar_dahlia",
  "mansa_moneybaggs",
  "kandake_kash",
  "moneybagg_bro",
  "mula_mami",
] as const;

export function isSeriesLeadMascot(id: string | null | undefined): boolean {
  return Boolean(id && (SERIES_LEAD_MASCOT_IDS as readonly string[]).includes(id));
}

/** Ultimate Ordeal villain — Credit Kingdom boss face (never a Harbor terrace lead). */
export const ENDGAME_VILLAIN_MASCOT_ID: MoneyMascotId = "debt_collector";

export function isEndgameVillainMascot(id: string | null | undefined): boolean {
  return id === ENDGAME_VILLAIN_MASCOT_ID;
}

/** Silhouette id — must match MoneyForm in character.ts */
export type MascotFormId = string;

export type MoneyMascot = {
  id: MoneyMascotId;
  name: string;
  emoji: string;
  /** Short lesson-flavored tagline from the cast sheet */
  tagline: string;
  form: MascotFormId;
  /** Optional face glyph for currency / branded marks ($, €, £, ¥, B, %) */
  glyph?: string;
  /** Default coat color id from CHARACTER_COLORS, or raw hex */
  color: string;
  /** Suggested accessory id */
  accessory: string;
  /** Soft role for casting NPCs */
  role: "currency" | "cash" | "save" | "spend" | "credit" | "invest" | "protect" | "plan" | "trade";
};

/** Canonical roster — the people of Fortune Archipelago. */
export const MONEY_CAST: MoneyMascot[] = [
  {
    id: "cashwell",
    name: "Cashwell",
    emoji: "🎩",
    tagline: "Always up. Always ahead. Growth is his signature.",
    form: "coin",
    glyph: "$",
    color: "cashwell",
    accessory: "cap",
    role: "invest",
  },
  {
    id: "cashmere",
    name: "Cashmere Couture",
    emoji: "👜",
    tagline: "Inherited. Intelligent. Iconic. Capital is her couture.",
    form: "coin",
    glyph: "$",
    color: "cashmere",
    accessory: "cape",
    role: "invest",
  },
  {
    id: "peso_pedro",
    name: "Peso Pedro",
    emoji: "🪅",
    tagline: "He leads with charm. Wealth follows. Always in circulation.",
    form: "coin",
    glyph: "P",
    color: "peso",
    accessory: "cap",
    role: "currency",
  },
  {
    id: "fortuna_fernanda",
    name: "Fortuna Fernanda",
    emoji: "🌹",
    tagline: "Bold. Brilliant. Blessed. Fortune loves Fernanda.",
    form: "coin",
    glyph: "P",
    color: "fortuna",
    accessory: "cape",
    role: "currency",
  },
  {
    id: "billionaire_bao",
    name: "Billionaire Bao",
    emoji: "🦁",
    tagline: "Subtle. Refined. Undeniably exclusive. Every move compounded.",
    form: "coin",
    glyph: "BB",
    color: "bao",
    accessory: "vest",
    role: "invest",
  },
  {
    id: "jade_fortune",
    name: "Jade Fortune",
    emoji: "🪷",
    tagline: "Polished. Poised. Prosperous. Fortune favors Jade.",
    form: "coin",
    glyph: "JF",
    color: "jade",
    accessory: "cape",
    role: "invest",
  },
  {
    id: "sultan_stacks",
    name: "Sultan Stacks",
    emoji: "🕌",
    tagline: "Wealth worn like a crown. Generosity with grandeur.",
    form: "coin",
    glyph: "$",
    color: "sultan",
    accessory: "cap",
    role: "invest",
  },
  {
    id: "dinar_dahlia",
    name: "Dinar Dahlia",
    emoji: "🌺",
    tagline: "Radiant. Regal. Rewarded. Fortune follows Dahlia.",
    form: "coin",
    glyph: "DD",
    color: "dahlia",
    accessory: "cape",
    role: "invest",
  },
  {
    id: "mansa_moneybaggs",
    name: "Mansa Moneybaggs",
    emoji: "☀️",
    tagline: "Rooted in history. Built to inspire. Gold is a legacy.",
    form: "coin",
    glyph: "M",
    color: "mansa",
    accessory: "cap",
    role: "invest",
  },
  {
    id: "kandake_kash",
    name: "Kandake Kash",
    emoji: "👑",
    tagline: "Crowned. Cultured. Collected. Wealth walks with Kandake.",
    form: "coin",
    glyph: "KK",
    color: "kandake",
    accessory: "cape",
    role: "invest",
  },
  {
    id: "moneybagg_bro",
    name: "Moneybagg Bro",
    emoji: "🕶️",
    tagline: "Building empires. Inspiring dreams. That’s the Moneybagg Bro way.",
    form: "coin",
    glyph: "MB",
    color: "moneybagg",
    accessory: "vest",
    role: "cash",
  },
  {
    id: "mula_mami",
    name: "Mula Mami",
    emoji: "👠",
    tagline: "Bold. Bossed up. Bankrolled.",
    form: "coin",
    glyph: "MM",
    color: "mula",
    accessory: "vest",
    role: "cash",
  },
  {
    id: "debt_collector",
    name: "The Debt Collector",
    emoji: "🏦",
    tagline: "Pay in full. Or else. Default is not an option.",
    form: "vault",
    glyph: "$",
    color: "obligation",
    accessory: "cape",
    role: "credit",
  },
  {
    id: "dollar_dash",
    name: "Dollar Dash",
    emoji: "💵",
    tagline: "Represents the US dollar.",
    form: "currency",
    glyph: "$",
    color: "seafoam",
    accessory: "none",
    role: "currency",
  },
  {
    id: "euro_ella",
    name: "Euro Ella",
    emoji: "💶",
    tagline: "Represents the euro.",
    form: "currency",
    glyph: "€",
    color: "tide",
    accessory: "none",
    role: "currency",
  },
  {
    id: "pound_pal",
    name: "Pound Pal",
    emoji: "💷",
    tagline: "Represents the British pound.",
    form: "currency",
    glyph: "£",
    color: "ledger",
    accessory: "none",
    role: "currency",
  },
  {
    id: "yen_yogi",
    name: "Yen Yogi",
    emoji: "💴",
    tagline: "Represents the Japanese yen.",
    form: "currency",
    glyph: "¥",
    color: "marigold",
    accessory: "none",
    role: "currency",
  },
  {
    id: "coiny",
    name: "Coiny",
    emoji: "🪙",
    tagline: "Change in your pocket.",
    form: "coin",
    color: "marigold",
    accessory: "none",
    role: "cash",
  },
  {
    id: "cash_stack_jack",
    name: "Cash Stack Jack",
    emoji: "💸",
    tagline: "Stack of cash strength.",
    form: "stack",
    color: "seafoam",
    accessory: "none",
    role: "cash",
  },
  {
    id: "baggy_bucks",
    name: "Baggy Bucks",
    emoji: "💰",
    tagline: "Big money energy.",
    form: "bag",
    color: "marigold",
    accessory: "none",
    role: "cash",
  },
  {
    id: "piggy_penny",
    name: "Piggy Penny",
    emoji: "🐷",
    tagline: "Saves your spare change.",
    form: "piggy",
    color: "coral",
    accessory: "none",
    role: "save",
  },
  {
    id: "vault_vince",
    name: "Vault Vince",
    emoji: "🏦",
    tagline: "Keeps your wealth safe.",
    form: "vault",
    color: "ink",
    accessory: "goggles",
    role: "protect",
  },
  {
    id: "receipt_rita",
    name: "Receipt Rita",
    emoji: "🧾",
    tagline: "Tracks every purchase.",
    form: "receipt",
    color: "tide",
    accessory: "none",
    role: "plan",
  },
  {
    id: "card_shark",
    name: "Card Shark",
    emoji: "💳",
    tagline: "Swipes and spends.",
    form: "card",
    color: "tide",
    accessory: "none",
    role: "credit",
  },
  {
    id: "wallet_walt",
    name: "Wallet Walt",
    emoji: "👛",
    tagline: "Holds what you own.",
    form: "wallet",
    color: "marigold",
    accessory: "bandana",
    role: "cash",
  },
  {
    id: "coupon_cutie",
    name: "Coupon Cutie",
    emoji: "🏷️",
    tagline: "Saves you extra.",
    form: "coupon",
    color: "coral",
    accessory: "none",
    role: "spend",
  },
  {
    id: "goldie_bar",
    name: "Goldie Bar",
    emoji: "🥇",
    tagline: "Solid value that shines.",
    form: "ingot",
    color: "marigold",
    accessory: "none",
    role: "invest",
  },
  {
    id: "budget_bot",
    name: "Budget Bot",
    emoji: "🧮",
    tagline: "Plans every dollar.",
    form: "calc",
    color: "seafoam",
    accessory: "headset",
    role: "plan",
  },
  {
    id: "debt_cloud",
    name: "Debt Cloud",
    emoji: "⛈️",
    tagline: "The Debt Collector’s weather — burden of what you owe.",
    form: "cloud",
    color: "ink",
    accessory: "none",
    role: "credit",
  },
  {
    id: "fortune_chest",
    name: "Fortune Chest",
    emoji: "🧰",
    tagline: "Hidden treasures inside.",
    form: "chest",
    color: "marigold",
    accessory: "lantern",
    role: "save",
  },
  {
    id: "safe_sally",
    name: "Safe Sally",
    emoji: "🔐",
    tagline: "Security you can count on.",
    form: "safe",
    color: "ink",
    accessory: "none",
    role: "protect",
  },
  {
    id: "market_money",
    name: "Market Money",
    emoji: "📈",
    tagline: "Rides market ups and downs.",
    form: "chart",
    color: "seafoam",
    accessory: "none",
    role: "invest",
  },
  {
    id: "tip_jar_tom",
    name: "Tip Jar Tom",
    emoji: "🫙",
    tagline: "Thanks for the extra!",
    form: "jar",
    color: "tide",
    accessory: "none",
    role: "cash",
  },
  {
    id: "crypto_coin",
    name: "Crypto Coin",
    emoji: "₿",
    tagline: "Digital money future.",
    form: "crypto",
    glyph: "B",
    color: "marigold",
    accessory: "goggles",
    role: "invest",
  },
  {
    id: "dividend_dan",
    name: "Dividend Dan",
    emoji: "📜",
    tagline: "Shares pay you back.",
    form: "certificate",
    color: "seafoam",
    accessory: "cap",
    role: "invest",
  },
  {
    id: "loan_ranger",
    name: "Loan Ranger",
    emoji: "🤠",
    tagline: "Borrow today, repay later.",
    form: "loan",
    color: "marigold",
    accessory: "cap",
    role: "credit",
  },
  {
    id: "risk_rocket",
    name: "Risk Rocket",
    emoji: "🚀",
    tagline: "High risk, high reward.",
    form: "rocket",
    color: "coral",
    accessory: "none",
    role: "invest",
  },
  {
    id: "saver_star",
    name: "Saver Star",
    emoji: "⭐",
    tagline: "Reward for saving.",
    form: "star",
    color: "marigold",
    accessory: "lantern",
    role: "save",
  },
  {
    id: "spendy_sue",
    name: "Spendy Sue",
    emoji: "🛍️",
    tagline: "Loves to shop.",
    form: "shopbag",
    color: "seafoam",
    accessory: "bandana",
    role: "spend",
  },
  {
    id: "value_vault",
    name: "Value Vault",
    emoji: "🛡️",
    tagline: "Protects your value.",
    form: "shield",
    color: "tide",
    accessory: "none",
    role: "protect",
  },
  {
    id: "tax_tally",
    name: "Tax Tally",
    emoji: "📋",
    tagline: "Pays what's fair.",
    form: "clipboard",
    color: "ledger",
    accessory: "none",
    role: "plan",
  },
  {
    id: "trade_buddy",
    name: "Trade Buddy",
    emoji: "🌍",
    tagline: "Money moves the world.",
    form: "globe",
    color: "tide",
    accessory: "none",
    role: "trade",
  },
  {
    id: "future_fund",
    name: "Future Fund",
    emoji: "⏳",
    tagline: "Invests in tomorrow.",
    form: "hourglass",
    color: "marigold",
    accessory: "none",
    role: "invest",
  },
];

export const MONEY_CAST_BY_ID: Record<MoneyMascotId, MoneyMascot> = Object.fromEntries(
  MONEY_CAST.map((m) => [m.id, m]),
) as Record<MoneyMascotId, MoneyMascot>;

/** Legacy Outfitter base ids → money-mascot ids (saved characters stay valid). */
export const LEGACY_BASE_TO_MASCOT: Record<string, MoneyMascotId> = {
  voyager: "dollar_dash",
  cartographer: "coiny",
  ledger_kid: "budget_bot",
  tide_ranger: "cash_stack_jack",
  coin_smith: "piggy_penny",
  signal_scout: "market_money",
  quest_adept: "dividend_dan",
  ruin_walker: "goldie_bar",
};

export function resolveMascotId(base?: string | null): MoneyMascotId {
  if (!base) return "dollar_dash";
  if (base in MONEY_CAST_BY_ID) return base as MoneyMascotId;
  return LEGACY_BASE_TO_MASCOT[base] ?? "dollar_dash";
}

export function getMascot(id?: string | null): MoneyMascot {
  return MONEY_CAST_BY_ID[resolveMascotId(id)] ?? MONEY_CAST[0];
}

/** Outfitter swatches — playable bodies (villain excluded from fighter select). */
export function moneyCastAsBases(): { id: string; emoji: string; label: string }[] {
  return MONEY_CAST.filter((m) => m.id !== "debt_collector").map((m) => ({
    id: m.id,
    emoji: m.emoji,
    label: m.name,
  }));
}

export type MascotCharacterLook = {
  name: string;
  base: string;
  color: string;
  accessory: string;
  companion: string;
};

export function mascotToCharacter(
  mascot: MoneyMascot,
  overrides: Partial<MascotCharacterLook> = {},
): MascotCharacterLook {
  return {
    name: overrides.name ?? mascot.name,
    base: overrides.base ?? mascot.id,
    color: overrides.color ?? mascot.color,
    accessory: overrides.accessory ?? mascot.accessory,
    companion: overrides.companion ?? "none",
  };
}

/**
 * NPC variation: same mascot family, different color/accessory tint.
 * `seed` is any string (npc id, island id, index).
 */
export function varyMascot(mascotId: string, seed: string): MascotCharacterLook {
  const mascot = getMascot(mascotId);
  // Series leads + endgame villain keep the sheet look — never random coat / gear swaps.
  if (isSeriesLeadMascot(mascot.id) || isEndgameVillainMascot(mascot.id)) {
    return mascotToCharacter(mascot, {
      name: mascot.name,
      color: mascot.color,
      accessory: mascot.accessory,
      companion: "none",
    });
  }
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const colors = ["tide", "marigold", "seafoam", "ink", "coral", "ledger"];
  const accessories = ["none", "cap", "goggles", "bandana", "headset", "lantern", "cape", "scarf", "vest", "sash"];
  return mascotToCharacter(mascot, {
    name: mascot.name,
    color: colors[h % colors.length],
    accessory: accessories[(h >> 3) % accessories.length],
    companion: h % 5 === 0 ? "finch" : "none",
  });
}

/** Stable mascot assignment for an NPC id / island slot. */
export function castMascotForNpc(npcId: string, preferredRole?: MoneyMascot["role"]): MoneyMascot {
  const pool = preferredRole
    ? MONEY_CAST.filter((m) => m.role === preferredRole)
    : MONEY_CAST;
  const list = pool.length ? pool : MONEY_CAST;
  let h = 0;
  for (let i = 0; i < npcId.length; i++) h = (h * 33 + npcId.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/** Piggy plaza slot — SW of fountain, clear of basin water (Coin Bag look-at + first-meet). */
export const HARBOR_PIGGY_POS: [number, number, number] = [-2.8, 0, 2.4];

/** Harbor plaza sample — readable crowd without spawning all 30.
 *  baggy_bucks is reserved for the hopping Coin Bag guide (MoneyBagGuide).
 *  Series leads flank the Memory Courtyard (SE Plinth terrace) — never Piggy's fountain slot. */
export const HARBOR_LOCAL_CAST: { mascotId: MoneyMascotId; pos: [number, number, number]; yaw: number }[] = [
  { mascotId: "piggy_penny", pos: HARBOR_PIGGY_POS, yaw: 0.35 },
  // Series leads — SE Memory Courtyard terrace (south of Plinth, clear of Bank door)
  { mascotId: "cashwell", pos: [4.4, 0, 6.2], yaw: -0.55 },
  { mascotId: "cashmere", pos: [5.2, 0, 7.0], yaw: -0.75 },
  { mascotId: "peso_pedro", pos: [6.0, 0, 6.4], yaw: -0.95 },
  { mascotId: "fortuna_fernanda", pos: [6.8, 0, 7.2], yaw: -1.1 },
  { mascotId: "billionaire_bao", pos: [7.6, 0, 6.0], yaw: -1.25 },
  { mascotId: "jade_fortune", pos: [8.4, 0, 7.0], yaw: -1.4 },
  { mascotId: "sultan_stacks", pos: [9.0, 0, 5.8], yaw: -1.55 },
  { mascotId: "dinar_dahlia", pos: [9.6, 0, 6.8], yaw: -1.7 },
  { mascotId: "mansa_moneybaggs", pos: [10.2, 0, 5.6], yaw: -1.85 },
  { mascotId: "kandake_kash", pos: [10.8, 0, 6.6], yaw: -2.0 },
  { mascotId: "moneybagg_bro", pos: [11.4, 0, 5.4], yaw: -2.1 },
  { mascotId: "mula_mami", pos: [12.0, 0, 6.4], yaw: -2.2 },
  { mascotId: "coiny", pos: [-6.2, 0, 4.0], yaw: 0.9 },
  { mascotId: "dollar_dash", pos: [2.2, 0, 8.4], yaw: -2.2 },
  { mascotId: "budget_bot", pos: [-2.8, 0, -7.4], yaw: 0.4 },
  { mascotId: "spendy_sue", pos: [-8.0, 0, -2.8], yaw: 1.1 },
  { mascotId: "vault_vince", pos: [1.2, 0, -9.0], yaw: 0.2 },
  { mascotId: "tip_jar_tom", pos: [-1.8, 0, 9.0], yaw: 3.0 },
];

/** Rival captains mapped onto the money cast. */
export const RIVAL_MASCOT_IDS = {
  spender_sally: "spendy_sue",
  hoarder_hank: "vault_vince",
  gambler_gus: "risk_rocket",
  planner_pip: "budget_bot",
} as const;
