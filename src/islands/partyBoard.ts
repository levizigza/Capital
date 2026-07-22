/**
 * Fortune Archipelago party board — dice, chance, capsules, seals, rivals.
 *
 * Core loop (Mario Party–inspired, financially themed):
 *   Roll → Move → Resolve space → Optional minigame → Rival turns → repeat
 * Win condition for an island session: most Ledger Seals after N turns (or free play).
 */

import type { IslandDefinition, IslandId, IslandSaveV1, MinigameId } from "./types";
import { MAX_PARTY_ITEMS, pickRandomPartyItem, type PartyItemId } from "./partyItems";
import { createDefaultRivals, type RivalBoardState } from "./partyRivals";
import {
  HARBOR_DEALS,
  addHolding,
  applyBill,
  applyPayday,
  dealPurchaseCost,
  ensureLedger,
  type DealOffer,
  type LedgerHolding,
  type VoyagerLedger,
} from "./voyagerLedger";
import {
  CASHFLOW_SPACE_PATTERN,
  PARTY_SPACE_PATTERN,
  getBoardEconomyMode,
  getSpaceFlavor,
  tracksHarborEscape,
  usesCashflowPassStart,
  type BoardEconomyMode,
} from "./boardEconomy";
import { getIslandTheme } from "./themes/islandThemes";

function pickUnusedHolding(
  kind: LedgerHolding["kind"],
  ownedIds: string[],
): LedgerHolding | null {
  const pool = HARBOR_DEALS.filter((d) => d.kind === kind && !ownedIds.includes(d.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export type BoardSpaceType =
  | "start"
  | "minigame"
  | "coins"
  | "seal"
  | "event"
  | "lucky"
  | "capsule"
  | "raid"
  | "collector"
  | "bank"
  /** Cashflow grind spaces */
  | "payday"
  | "bill"
  | "deal"
  | "liability";

export type BoardSpace = {
  index: number;
  type: BoardSpaceType;
  label: string;
  icon: string;
  minigameId?: MinigameId;
  coinReward?: number;
  eventText?: string;
};

export type PartyIslandState = {
  position: number;
  turnsPlayed: number;
  stars: number;
  items?: PartyItemId[];
  buffs?: {
    doubleCoinsNext?: boolean;
    shielded?: boolean;
    bailoutReady?: boolean;
  };
  rivals?: RivalBoardState[];
  turnsRemaining?: number;
};

export type BoardMoveResult = {
  from: number;
  to: number;
  steps: number;
  space: BoardSpace;
  passedStart: boolean;
};

export type MinigameBoardReward = {
  coins: number;
  xp: number;
  starEarned: boolean;
  message: string;
};

export type SpaceResolvePayload = {
  coins: number;
  xp?: number;
  star?: boolean;
  message: string;
  itemGained?: PartyItemId;
  itemLost?: PartyItemId;
  rivalDelta?: Array<{ id: string; coins?: number; seals?: number; skip?: boolean; swapWithPlayer?: boolean }>;
  playerSkip?: boolean;
  /** Updated ledger after cashflow spaces */
  ledger?: VoyagerLedger;
  /** Interactive deal offer — player must accept or pass */
  pendingDeal?: import("./voyagerLedger").DealOffer;
};

/** Larger loop for richer party boards (~Mario Party density). */
export const BOARD_SIZE = 16;

/** Default turns in a ranked island party session */
export const DEFAULT_PARTY_TURNS = 15;

const COIN_SPACE_REWARDS = [5, 8, 10, 12, 15, 18];

const EVENT_MESSAGES = [
  "A dock mentor whispers: pay yourself first — stash coins before you spend.",
  "You spot a tide chart: markets rise and fall — diversifying rides the waves.",
  "Needs before wants keeps your pouch seaworthy.",
  "Compound interest is a quiet current — start early, drift farther.",
  "Compare prices like captains compare winds before setting sail.",
];

const COLLECTOR_MESSAGES = [
  "The Collector levies a surprise fee! Coins vanish into the fog of late charges.",
  "Debt Drake's cousin, The Collector, audits your pouch — taxes due!",
  "Inflation Specter hitchhikes with The Collector — your coins buy less this turn.",
];

/** Percent positions for a rounded-rectangle party board (viewBox 0–100). */
export const BOARD_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 12, y: 16 },
  { x: 28, y: 12 },
  { x: 44, y: 10 },
  { x: 60, y: 10 },
  { x: 76, y: 12 },
  { x: 90, y: 18 },
  { x: 92, y: 34 },
  { x: 92, y: 50 },
  { x: 90, y: 66 },
  { x: 76, y: 78 },
  { x: 60, y: 84 },
  { x: 44, y: 86 },
  { x: 28, y: 84 },
  { x: 14, y: 76 },
  { x: 10, y: 58 },
  { x: 10, y: 36 },
];

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDoubleDice(): number {
  return rollDice() + rollDice();
}

export function advancePosition(current: number, steps: number, boardSize = BOARD_SIZE): number {
  return (current + steps) % boardSize;
}

export function emptyPartyState(): PartyIslandState {
  return {
    position: 0,
    turnsPlayed: 0,
    stars: 0,
    items: [],
    buffs: {},
    rivals: createDefaultRivals(2),
    turnsRemaining: DEFAULT_PARTY_TURNS,
  };
}

export function getPartyState(save: IslandSaveV1, islandId: IslandId): PartyIslandState {
  const raw = save.partyBoard?.[islandId];
  if (!raw) return emptyPartyState();
  return {
    ...emptyPartyState(),
    ...raw,
    items: raw.items ?? [],
    buffs: raw.buffs ?? {},
    rivals: (raw.rivals ?? createDefaultRivals(2)).map((r, i) => ({
      id: r.id,
      position: r.position,
      coins: r.coins,
      seals: r.seals,
      items: r.items ?? [],
      skipNextTurn: r.skipNextTurn ?? false,
      shielded: r.shielded ?? false,
      monthlyIncome: r.monthlyIncome ?? 5 + i * 2,
      monthlyExpenses: r.monthlyExpenses ?? 4,
    })),
  };
}

export function buildBoardForIsland(island: IslandDefinition): BoardSpace[] {
  const minigames = island.minigames ?? [];
  const spaces: BoardSpace[] = [];
  const mode = getBoardEconomyMode(island);
  const theme = getIslandTheme(island.id, island.themeId);
  const flavor = getSpaceFlavor(mode, theme.animationStyle);
  const cashflow = usesCashflowPassStart(mode);

  spaces.push({
    index: 0,
    type: "start",
    label: flavor.startLabel,
    icon: flavor.startIcon,
    eventText: flavor.startEvent,
  });

  const pattern = cashflow ? CASHFLOW_SPACE_PATTERN : PARTY_SPACE_PATTERN;

  let mgIdx = 0;
  for (let i = 1; i < BOARD_SIZE; i++) {
    const kind = pattern[(i - 1) % pattern.length]!;

    if (kind === "minigame" && minigames.length > 0) {
      const mg = minigames[mgIdx % minigames.length]!;
      mgIdx += 1;
      spaces.push({
        index: i,
        type: "minigame",
        label: mg.name,
        icon: mg.icon,
        minigameId: mg.id,
      });
      continue;
    }

    if (kind === "minigame" && minigames.length === 0) {
      spaces.push({
        index: i,
        type: cashflow ? "payday" : "coins",
        label: cashflow ? flavor.paydayLabel : "Coin Bonus",
        icon: cashflow ? flavor.paydayIcon : "🪙",
        coinReward: cashflow ? undefined : COIN_SPACE_REWARDS[i % COIN_SPACE_REWARDS.length],
        eventText: cashflow
          ? flavor.paydayEvent
          : "A coin bonus washes ashore.",
      });
      continue;
    }

    switch (kind) {
      case "payday":
        spaces.push({
          index: i,
          type: "payday",
          label: flavor.paydayLabel,
          icon: flavor.paydayIcon,
          eventText: flavor.paydayEvent,
        });
        break;
      case "bill":
        spaces.push({
          index: i,
          type: "bill",
          label: flavor.billLabel,
          icon: "🧾",
          coinReward: 8 + (i % 5) * 2,
          eventText: flavor.billEvent,
        });
        break;
      case "deal":
        spaces.push({
          index: i,
          type: "deal",
          label: flavor.dealLabel,
          icon: "📈",
          eventText: flavor.dealEvent,
        });
        break;
      case "liability":
        spaces.push({
          index: i,
          type: "liability",
          label: flavor.liabilityLabel,
          icon: "📉",
          eventText: flavor.liabilityEvent,
        });
        break;
      case "coins":
        spaces.push({
          index: i,
          type: "coins",
          label: "Bonus",
          icon: "🪙",
          coinReward: COIN_SPACE_REWARDS[i % COIN_SPACE_REWARDS.length],
        });
        break;
      case "seal":
        spaces.push({
          index: i,
          type: "seal",
          label: "Ledger Seal",
          icon: "🏅",
          coinReward: 20,
          eventText: "Spend coins to claim a Ledger Seal — or earn one by winning a minigame!",
        });
        break;
      case "lucky":
        spaces.push({
          index: i,
          type: "lucky",
          label: "Windfall",
          icon: "🍀",
          coinReward: 20,
          eventText: "Lucky break! A surprise rebate fills your pouch.",
        });
        break;
      case "capsule":
        spaces.push({
          index: i,
          type: "capsule",
          label: "Capsule",
          icon: "📦",
          eventText: "A Fortune Capsule washes ashore — an item for your voyage!",
        });
        break;
      case "raid":
        spaces.push({
          index: i,
          type: "raid",
          label: "Fee Raid",
          icon: "⚔️",
          eventText: "Fee Writ energy! Steal coins from the richest rival (or get raided).",
        });
        break;
      case "collector":
        spaces.push({
          index: i,
          type: "collector",
          label: "Collector",
          icon: "😈",
          coinReward: -12,
          eventText: COLLECTOR_MESSAGES[i % COLLECTOR_MESSAGES.length],
        });
        break;
      case "bank":
        spaces.push({
          index: i,
          type: "bank",
          label: "Island Bank",
          icon: "🏦",
          coinReward: 8,
          eventText: "Interest payday! The Island Bank adds a modest return.",
        });
        break;
      default:
        spaces.push({
          index: i,
          type: "event",
          label: "Tide Tip",
          icon: "💬",
          eventText: EVENT_MESSAGES[i % EVENT_MESSAGES.length],
        });
    }
  }

  return spaces;
}

export function resolveMove(
  board: BoardSpace[],
  from: number,
  steps: number,
): BoardMoveResult {
  const to = advancePosition(from, steps, board.length);
  const passedStart = from + steps >= board.length;
  return {
    from,
    to,
    steps,
    space: board[to]!,
    passedStart,
  };
}

export function spaceAccent(type: BoardSpaceType): string {
  switch (type) {
    case "start":
    case "payday":
      return "var(--party-payday)";
    case "minigame":
      return "var(--party-minigame)";
    case "coins":
    case "bank":
      return "var(--party-coins)";
    case "seal":
      return "var(--party-star)";
    case "lucky":
      return "var(--party-lucky)";
    case "capsule":
      return "var(--party-capsule)";
    case "raid":
      return "var(--party-raid)";
    case "collector":
      return "var(--party-collector)";
    case "bill":
      return "var(--party-bill)";
    case "deal":
      return "var(--party-deal)";
    case "liability":
      return "var(--party-liability)";
    default:
      return "var(--party-event)";
  }
}

/** Pass-start payout — cashflow boards use Voyager Ledger; party boards get a flat dividend. */
export function resolvePassStart(
  mode: BoardEconomyMode,
  ledgerIn?: VoyagerLedger | null,
): SpaceResolvePayload {
  if (usesCashflowPassStart(mode)) {
    const trackEscape = tracksHarborEscape(mode);
    const { ledger, coins, escapedNow } = applyPayday(ensureLedger(ledgerIn), 1, {
      trackHarborEscape: trackEscape,
    });
    return {
      coins,
      xp: 3,
      message: escapedNow
        ? `Pay Day (+${coins}) — Harbor escape unlocked! Cashflow stayed strong.`
        : coins >= 0
          ? `Pay Day! Monthly cashflow credited (+${coins} coins).`
          : `Pay Day shortfall (${coins} coins). Grow income or cut expenses!`,
      ledger,
    };
  }
  return {
    coins: HARBOR_DIVIDEND,
    xp: 2,
    message: `Harbor dividend: +${HARBOR_DIVIDEND} coins (salary day)!`,
  };
}

/** Resolve non-minigame space effects for the human player. */
export function resolvePlayerSpace(
  space: BoardSpace,
  state: PartyIslandState,
  playerCoins: number,
  ledgerIn?: VoyagerLedger | null,
  opts?: { trackHarborEscape?: boolean },
): { next: PartyIslandState; payload: SpaceResolvePayload } {
  const next: PartyIslandState = {
    ...state,
    items: [...(state.items ?? [])],
    buffs: { ...(state.buffs ?? {}) },
    rivals: (state.rivals ?? []).map((r) => ({ ...r, items: [...r.items] })),
  };
  const payload: SpaceResolvePayload = { coins: 0, message: "" };
  let ledger = ensureLedger(ledgerIn);

  const addItem = (id: PartyItemId) => {
    const items = next.items ?? [];
    if (items.length >= MAX_PARTY_ITEMS) {
      payload.message = `Capsule full! You already hold ${MAX_PARTY_ITEMS} items.`;
      return;
    }
    items.push(id);
    next.items = items;
    payload.itemGained = id;
  };

  switch (space.type) {
    case "payday": {
      let { ledger: nextLedger, coins, escapedNow } = applyPayday(ledger, 1, {
        trackHarborEscape: opts?.trackHarborEscape ?? false,
      });
      if (next.buffs?.doubleCoinsNext && coins > 0) {
        coins *= 2;
        next.buffs = { ...next.buffs, doubleCoinsNext: false };
        payload.message = escapedNow
          ? `Dividend Magnet Pay Day (+${coins}) — Harbor escape unlocked!`
          : `Dividend Magnet! Pay Day doubled to +${coins} coins.`;
      } else {
        payload.message = escapedNow
          ? `Pay Day (+${coins}) — Harbor escape unlocked! Cashflow stayed strong.`
          : coins >= 0
            ? `Pay Day: +${coins} coins from monthly cashflow.`
            : `Pay Day shortfall: ${coins} coins.`;
      }
      payload.coins = coins;
      payload.xp = 5;
      payload.ledger = nextLedger;
      break;
    }
    case "bill": {
      const amount = space.coinReward ?? 10;
      const result = applyBill(ledger, amount, space.label);
      payload.coins = result.coins;
      payload.ledger = result.ledger;
      payload.message = result.ledger.recentEvents[0]?.text ?? `Bill: −${amount} coins.`;
      payload.xp = 2;
      break;
    }
    case "deal": {
      const owned = ledger.holdings.map((h) => h.id);
      const deal = pickUnusedHolding("asset", owned);
      if (!deal) {
        payload.message = "No new income deals left — keep grinding cashflow!";
        break;
      }
      const offer: DealOffer = {
        ...deal,
        purchaseCost: dealPurchaseCost(deal),
      };
      payload.pendingDeal = offer;
      payload.message = `Deal on the table: ${offer.icon} ${offer.name} — ${offer.purchaseCost} coins for +$${offer.monthlyAmount}/mo.`;
      break;
    }
    case "liability": {
      const owned = ledger.holdings.map((h) => h.id);
      const trap = pickUnusedHolding("liability", owned);
      if (!trap) {
        payload.message = "You already carry every Harbor liability — watch that cashflow!";
        break;
      }
      ledger = addHolding(ledger, trap);
      payload.ledger = ledger;
      payload.message = `Debt Trap! ${trap.icon} ${trap.name} (−$${trap.monthlyAmount}/mo).`;
      break;
    }
    case "coins":
    case "lucky":
    case "bank": {
      let coins = space.coinReward ?? 10;
      if (next.buffs?.doubleCoinsNext) {
        coins *= 2;
        next.buffs = { ...next.buffs, doubleCoinsNext: false };
        payload.message = `Dividend Magnet! Doubled to ${coins} coins.`;
      } else {
        payload.message =
          space.type === "bank"
            ? `Island Bank interest: +${coins} coins.`
            : `You collected ${coins} coins!`;
      }
      payload.coins = coins;
      payload.xp = 5;
      break;
    }
    case "seal": {
      const cost = space.coinReward ?? 20;
      if (playerCoins >= cost) {
        payload.coins = -cost;
        payload.star = true;
        payload.message = `You bought a Ledger Seal for ${cost} coins!`;
      } else {
        payload.message = `Seal costs ${cost} coins — earn more, then claim it.`;
      }
      break;
    }
    case "capsule": {
      const item = pickRandomPartyItem(next.items);
      addItem(item);
      if (payload.itemGained) {
        payload.message = `Fortune Capsule: you got a new item!`;
        payload.xp = 3;
      }
      break;
    }
    case "raid": {
      const rivals = next.rivals ?? [];
      const richest = [...rivals].sort((a, b) => b.coins - a.coins)[0];
      const steal = 8 + Math.floor(Math.random() * 8);
      if (richest && richest.coins > 0) {
        if (richest.shielded) {
          richest.shielded = false;
          payload.message = `${richest.id} blocked your Fee Raid with an Emergency Ledger!`;
        } else {
          const taken = Math.min(steal, richest.coins);
          richest.coins -= taken;
          payload.coins = taken;
          payload.rivalDelta = [{ id: richest.id, coins: -taken }];
          payload.message = `Fee Raid! You took ${taken} coins from a rival.`;
        }
      } else {
        payload.message = "No rivals with coins to raid — the fees echo empty.";
      }
      break;
    }
    case "collector": {
      if (next.buffs?.bailoutReady || next.buffs?.shielded) {
        next.buffs = { ...next.buffs, bailoutReady: false, shielded: false };
        payload.message = "Emergency Ledger / Bailout Buoy saved you from The Collector!";
      } else {
        const loss = Math.abs(space.coinReward ?? 12);
        payload.coins = -loss;
        payload.message = space.eventText ?? COLLECTOR_MESSAGES[0]!;
      }
      break;
    }
    case "event":
    case "start":
      payload.message = space.eventText ?? "Keep rolling — Fortune favors the prepared!";
      break;
    default:
      payload.message = space.eventText ?? "";
  }

  return { next, payload };
}

/** Fallback salary when passing start on non-Harbor islands */
export const HARBOR_DIVIDEND = 10;

export function computeMinigameReward(
  success: boolean,
  score: number | undefined,
  firstClear: boolean,
  landedOnSealSpace: boolean,
): MinigameBoardReward {
  if (!success) {
    return {
      coins: 2,
      xp: 5,
      starEarned: false,
      message: "Good try! You still learned something — roll again.",
    };
  }

  const baseCoins = 15 + Math.min(25, Math.floor((score ?? 70) / 4));
  const baseXp = 20 + Math.min(30, Math.floor((score ?? 70) / 5));
  const bonusCoins = firstClear ? 10 : 0;
  const starEarned = firstClear || landedOnSealSpace;

  return {
    coins: baseCoins + bonusCoins,
    xp: baseXp,
    starEarned,
    message: starEarned
      ? "Victory! You earned a Ledger Seal on this island."
      : "Minigame cleared! Coins added to your pouch.",
  };
}

export function pickRandomBoardMinigame(island: IslandDefinition): MinigameId | null {
  const pool = island.minigames ?? [];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)]!.id;
}

/** Apply a Fortune Capsule from the player's hand. */
export function usePartyItem(
  itemId: PartyItemId,
  state: PartyIslandState,
  playerCoins: number,
): { next: PartyIslandState; payload: SpaceResolvePayload; extraSteps?: number } {
  const next: PartyIslandState = {
    ...state,
    items: (state.items ?? []).filter((id) => id !== itemId),
    buffs: { ...(state.buffs ?? {}) },
    rivals: (state.rivals ?? []).map((r) => ({ ...r, items: [...r.items] })),
  };
  const payload: SpaceResolvePayload = { coins: 0, message: "", itemLost: itemId };

  switch (itemId) {
    case "double_die":
      payload.message = "Twin Tallies! Roll two dice on your next move.";
      return { next, payload, extraSteps: rollDoubleDice() };
    case "warp_buoy": {
      const rivals = next.rivals ?? [];
      const target = rivals[0];
      if (target) {
        const swap = target.position;
        target.position = next.position;
        next.position = swap;
        payload.rivalDelta = [{ id: target.id, swapWithPlayer: true }];
        payload.message = "Swap Buoy! You traded places with a rival.";
      } else {
        payload.message = "No rivals to swap with.";
      }
      break;
    }
    case "coin_magnet":
      next.buffs = { ...next.buffs, doubleCoinsNext: true };
      payload.message = "Dividend Magnet armed — next pay day doubles!";
      break;
    case "shield_ledger":
      next.buffs = { ...next.buffs, shielded: true };
      payload.message = "Emergency Ledger ready — next raid or tax is blocked.";
      break;
    case "bailout_buoy":
      next.buffs = { ...next.buffs, bailoutReady: true };
      payload.message = "Bailout Buoy ready — The Collector can't touch you once.";
      break;
    case "raid_writ": {
      const rivals = next.rivals ?? [];
      const richest = [...rivals].sort((a, b) => b.coins - a.coins)[0];
      const steal = 12;
      if (richest) {
        if (richest.shielded) {
          richest.shielded = false;
          payload.message = "Their Emergency Ledger blocked your Fee Writ!";
        } else {
          const taken = Math.min(steal, richest.coins);
          richest.coins -= taken;
          payload.coins = taken;
          payload.rivalDelta = [{ id: richest.id, coins: -taken }];
          payload.message = `Fee Writ! You seized ${taken} coins.`;
        }
      }
      break;
    }
    case "inflation_fog": {
      const rivals = next.rivals ?? [];
      const target = rivals.find((r) => !r.skipNextTurn) ?? rivals[0];
      if (target) {
        target.skipNextTurn = true;
        payload.rivalDelta = [{ id: target.id, skip: true }];
        payload.message = `Inflation Fog! ${target.id} skips a turn.`;
      }
      break;
    }
    case "compound_charm": {
      const bonus = Math.max(5, Math.floor(playerCoins * 0.1));
      payload.coins = bonus;
      payload.message = `Compound Charm! +${bonus} coins (10% of pouch).`;
      break;
    }
  }

  return { next, payload };
}
