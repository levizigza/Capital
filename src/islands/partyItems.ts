/**
 * Fortune Capsules — board items for Fortune Archipelago.
 *
 * Remix of party-game item loops with financial literacy metaphors:
 * shields = emergency funds, raids = opportunistic fees, fog = inflation drag.
 * Names intentionally avoid Nintendo item IP.
 */

export type PartyItemId =
  | "double_die"
  | "warp_buoy"
  | "coin_magnet"
  | "shield_ledger"
  | "raid_writ"
  | "inflation_fog"
  | "compound_charm"
  | "bailout_buoy";

export type PartyItemDef = {
  id: PartyItemId;
  name: string;
  icon: string;
  description: string;
  /** Short financial lesson tip shown when collected */
  moneyTip: string;
  /** How the item is used */
  kind: "move" | "offense" | "defense" | "economy";
};

export const PARTY_ITEMS: Record<PartyItemId, PartyItemDef> = {
  double_die: {
    id: "double_die",
    name: "Twin Tallies",
    icon: "🎲",
    description: "Roll two dice and move the combined total.",
    moneyTip: "Diversifying efforts can cover more ground — same idea as spreading risk.",
    kind: "move",
  },
  warp_buoy: {
    id: "warp_buoy",
    name: "Swap Buoy",
    icon: "🔄",
    description: "Swap board positions with a rival captain.",
    moneyTip: "Opportunity cost: sometimes trading places beats grinding ahead.",
    kind: "move",
  },
  coin_magnet: {
    id: "coin_magnet",
    name: "Dividend Magnet",
    icon: "🧲",
    description: "Next coin space pays double.",
    moneyTip: "Passive income compounds when you park money where it works for you.",
    kind: "economy",
  },
  shield_ledger: {
    id: "shield_ledger",
    name: "Emergency Ledger",
    icon: "🛡️",
    description: "Block the next raid or Collector tax once.",
    moneyTip: "An emergency fund is a shield against surprise expenses.",
    kind: "defense",
  },
  raid_writ: {
    id: "raid_writ",
    name: "Fee Writ",
    icon: "📜",
    description: "Steal coins from the rival with the most cash.",
    moneyTip: "Fees and late charges quietly move money between people — watch yours!",
    kind: "offense",
  },
  inflation_fog: {
    id: "inflation_fog",
    name: "Inflation Fog",
    icon: "🌫️",
    description: "A rival skips their next turn (prices rose too fast).",
    moneyTip: "Inflation makes the same cash buy less — plan ahead.",
    kind: "offense",
  },
  compound_charm: {
    id: "compound_charm",
    name: "Compound Charm",
    icon: "✨",
    description: "Gain bonus coins equal to 10% of your pouch (min 5).",
    moneyTip: "Compound growth rewards patience — small percents add up.",
    kind: "economy",
  },
  bailout_buoy: {
    id: "bailout_buoy",
    name: "Bailout Buoy",
    icon: "🛟",
    description: "If you land on a Collector space, cancel the penalty once.",
    moneyTip: "Safety nets help — but building habits beats relying on rescues.",
    kind: "defense",
  },
};

export const PARTY_ITEM_POOL: PartyItemId[] = Object.keys(PARTY_ITEMS) as PartyItemId[];

export function getPartyItem(id: PartyItemId | string): PartyItemDef | undefined {
  return PARTY_ITEMS[id as PartyItemId];
}

export function pickRandomPartyItem(exclude: PartyItemId[] = []): PartyItemId {
  const pool = PARTY_ITEM_POOL.filter((id) => !exclude.includes(id));
  const use = pool.length > 0 ? pool : PARTY_ITEM_POOL;
  return use[Math.floor(Math.random() * use.length)]!;
}

export const MAX_PARTY_ITEMS = 3;
