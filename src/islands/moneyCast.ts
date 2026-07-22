/**
 * The People of Capital — 30 Money Mascots.
 *
 * These anthropomorphic money characters are the world's population:
 * Harbor locals, island NPCs, rivals, and Outfitter body choices.
 * Variations = same archetype + color / accessory / companion tweaks.
 *
 * Note: keep this file free of imports from `character.ts` to avoid cycles.
 */

export type MoneyMascotId =
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
    tagline: "Burden of what you owe.",
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

/** Outfitter swatches — every mascot is a playable body. */
export function moneyCastAsBases(): { id: string; emoji: string; label: string }[] {
  return MONEY_CAST.map((m) => ({ id: m.id, emoji: m.emoji, label: m.name }));
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
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const colors = ["tide", "marigold", "seafoam", "ink", "coral", "ledger"];
  const accessories = ["none", "cap", "goggles", "bandana", "headset", "lantern"];
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

/** Harbor plaza sample — readable crowd without spawning all 30. */
export const HARBOR_LOCAL_CAST: { mascotId: MoneyMascotId; pos: [number, number, number]; yaw: number }[] = [
  { mascotId: "piggy_penny", pos: [4.8, 0, -4.0], yaw: -0.6 },
  { mascotId: "coiny", pos: [-5.4, 0, 2.8], yaw: 0.9 },
  { mascotId: "dollar_dash", pos: [3.8, 0, 6.0], yaw: -2.2 },
  { mascotId: "budget_bot", pos: [-3.2, 0, -6.6], yaw: 0.4 },
  { mascotId: "baggy_bucks", pos: [6.2, 0, 1.2], yaw: -1.4 },
  { mascotId: "spendy_sue", pos: [-6.0, 0, -2.2], yaw: 1.1 },
  { mascotId: "vault_vince", pos: [1.5, 0, -7.4], yaw: 0.2 },
  { mascotId: "tip_jar_tom", pos: [-1.8, 0, 7.2], yaw: 3.0 },
];

/** Rival captains mapped onto the money cast. */
export const RIVAL_MASCOT_IDS = {
  spender_sally: "spendy_sue",
  hoarder_hank: "vault_vince",
  gambler_gus: "risk_rocket",
  planner_pip: "budget_bot",
} as const;
