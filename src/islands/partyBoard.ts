import type { IslandDefinition, IslandId, IslandSaveV1, MinigameId } from "./types";

export type BoardSpaceType = "start" | "minigame" | "coins" | "star" | "event" | "lucky";

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

/** Fixed loop size — Mario Party boards feel best with ~12 spaces. */
export const BOARD_SIZE = 12;

const COIN_SPACE_REWARDS = [5, 8, 10, 12, 15];
const EVENT_MESSAGES = [
  "A friendly NPC shares a money tip: save a little every time you earn!",
  "You found a shortcut — take a breather and plan your next move.",
  "Market buzz: prices go up and down. Diversifying helps!",
  "Bonus wisdom: needs before wants keeps your coin pouch happy.",
];

/** Percent positions for a rounded-rectangle party board (viewBox 0–100). */
export const BOARD_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 14, y: 18 },
  { x: 32, y: 14 },
  { x: 50, y: 12 },
  { x: 68, y: 14 },
  { x: 86, y: 18 },
  { x: 90, y: 38 },
  { x: 90, y: 58 },
  { x: 86, y: 78 },
  { x: 68, y: 84 },
  { x: 50, y: 86 },
  { x: 32, y: 84 },
  { x: 14, y: 78 },
];

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function advancePosition(current: number, steps: number, boardSize = BOARD_SIZE): number {
  return (current + steps) % boardSize;
}

export function getPartyState(save: IslandSaveV1, islandId: IslandId): PartyIslandState {
  return (
    save.partyBoard?.[islandId] ?? {
      position: 0,
      turnsPlayed: 0,
      stars: 0,
    }
  );
}

export function buildBoardForIsland(island: IslandDefinition): BoardSpace[] {
  const minigames = island.minigames ?? [];
  const spaces: BoardSpace[] = [];

  spaces.push({
    index: 0,
    type: "start",
    label: "Start",
    icon: "🏁",
    eventText: "Roll the dice and tour the island!",
  });

  const fillerTypes: BoardSpaceType[] = ["coins", "event", "lucky", "coins", "star", "event"];
  let fillerIdx = 0;
  let mgIdx = 0;

  for (let i = 1; i < BOARD_SIZE; i++) {
    const useMinigame = minigames.length > 0 && (i % 2 === 1 || mgIdx < minigames.length);
    if (useMinigame && mgIdx < minigames.length) {
      const mg = minigames[mgIdx % minigames.length];
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

    const kind = fillerTypes[fillerIdx % fillerTypes.length];
    fillerIdx += 1;

    if (kind === "coins") {
      spaces.push({
        index: i,
        type: "coins",
        label: "Coin Bonus",
        icon: "🪙",
        coinReward: COIN_SPACE_REWARDS[i % COIN_SPACE_REWARDS.length],
      });
    } else if (kind === "star") {
      spaces.push({
        index: i,
        type: "star",
        label: "Star Space",
        icon: "⭐",
        eventText: "Land here after a minigame win to earn a star!",
      });
    } else if (kind === "lucky") {
      spaces.push({
        index: i,
        type: "lucky",
        label: "Lucky Space",
        icon: "🍀",
        coinReward: 20,
        eventText: "Lucky break! Extra coins if you pass through.",
      });
    } else {
      spaces.push({
        index: i,
        type: "event",
        label: "Event",
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
      return "var(--party-start)";
    case "minigame":
      return "var(--party-minigame)";
    case "coins":
      return "var(--party-coins)";
    case "star":
      return "var(--party-star)";
    case "lucky":
      return "var(--party-lucky)";
    default:
      return "var(--party-event)";
  }
}

export function computeMinigameReward(
  success: boolean,
  score: number | undefined,
  firstClear: boolean,
  landedOnStarNext: boolean,
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
  const starEarned = firstClear || landedOnStarNext;

  return {
    coins: baseCoins + bonusCoins,
    xp: baseXp,
    starEarned,
    message: starEarned
      ? "Victory! You earned a star on this island."
      : "Minigame cleared! Coins added to your pouch.",
  };
}

export function pickRandomBoardMinigame(island: IslandDefinition): MinigameId | null {
  const pool = island.minigames ?? [];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)]!.id;
}
