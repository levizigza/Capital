/**
 * Rival Captains — CPU party opponents for Fortune Archipelago.
 *
 * Each rival is a financial personality (spender, hoarder, gambler, planner)
 * so competition teaches money temperaments without copying Nintendo casts.
 */

import type { PartyItemId } from "./partyItems";

export type RivalId = "spender_sally" | "hoarder_hank" | "gambler_gus" | "planner_pip";

export type RivalCaptain = {
  id: RivalId;
  name: string;
  icon: string;
  title: string;
  blurb: string;
  /** Color for tokens / HUD */
  accent: string;
  /** Personality bias when choosing items / targets */
  temperament: "spender" | "hoarder" | "gambler" | "planner";
};

export const RIVAL_CAPTAINS: RivalCaptain[] = [
  {
    id: "spender_sally",
    name: "Sally Splash",
    icon: "🛍️",
    title: "FOMO Drop Captain",
    blurb: "Buys every limited drop before the confetti settles. Teaches why budgets beat hype queues.",
    accent: "#fb7185",
    temperament: "spender",
  },
  {
    id: "hoarder_hank",
    name: "Hank Vault",
    icon: "🏦",
    title: "Mattress Captain",
    blurb: "Dickens-adjacent coin counter — never spends until seals force the lesson: opportunity cost.",
    accent: "#38bdf8",
    temperament: "hoarder",
  },
  {
    id: "gambler_gus",
    name: "Gus Gamble",
    icon: "🎰",
    title: "All-In Captain",
    blurb: "Treats every roll like March Madness. Teaches risk sizing without the casino neon.",
    accent: "#a78bfa",
    temperament: "gambler",
  },
  {
    id: "planner_pip",
    name: "Pip Plan",
    icon: "📋",
    title: "Spreadsheet Sage",
    blurb: "The hero every money montage skips — steady rolls, shields, and boring wins.",
    accent: "#34d399",
    temperament: "planner",
  },
];

export type RivalBoardState = {
  id: RivalId;
  position: number;
  coins: number;
  seals: number;
  items: PartyItemId[];
  skipNextTurn: boolean;
  shielded: boolean;
  /** Monthly income from snagged deals (cashflow rivalry) */
  monthlyIncome: number;
  /** Monthly drain from liabilities they accept (spender/gambler) */
  monthlyExpenses: number;
};

export function createDefaultRivals(count = 2): RivalBoardState[] {
  const picked = RIVAL_CAPTAINS.slice(0, Math.min(count, RIVAL_CAPTAINS.length));
  return picked.map((r, i) => ({
    id: r.id,
    position: (i * 3) % 16,
    coins: 20 + i * 5,
    seals: 0,
    items: [],
    skipNextTurn: false,
    shielded: false,
    monthlyIncome: 5 + i * 2,
    monthlyExpenses: r.temperament === "spender" || r.temperament === "gambler" ? 8 : 3,
  }));
}

export function getRivalDef(id: RivalId): RivalCaptain {
  return RIVAL_CAPTAINS.find((r) => r.id === id) ?? RIVAL_CAPTAINS[0]!;
}

/** Simple CPU dice — slight bias by temperament */
export function rivalRollDice(temperament: RivalCaptain["temperament"]): number {
  const base = Math.floor(Math.random() * 6) + 1;
  if (temperament === "gambler") {
    // Prefer extremes
    return Math.random() < 0.35 ? (Math.random() < 0.5 ? 1 : 6) : base;
  }
  if (temperament === "planner") {
    // Prefer mid rolls
    return Math.max(2, Math.min(5, base));
  }
  return base;
}

export function rivalPickItemTarget(
  self: RivalBoardState,
  rivals: RivalBoardState[],
  playerCoins: number,
  playerSeals: number,
): "player" | RivalId {
  const richerRival = rivals
    .filter((r) => r.id !== self.id)
    .sort((a, b) => b.coins - a.coins)[0];
  if (playerCoins >= (richerRival?.coins ?? 0) && playerSeals >= 0) return "player";
  return richerRival?.id ?? "player";
}

export type RivalTurnSummary = {
  rivalId: RivalId;
  roll: number;
  message: string;
  playerCoinDelta: number;
};

/**
 * Run one round of rival turns after the player moves.
 * Cashflow mode: rivals snatch deals, pick up liabilities, and payday from their own ledger.
 */
export function simulateRivalRound(
  rivals: RivalBoardState[],
  boardSize: number,
  playerCoins: number,
  playerShielded: boolean,
  opts?: { cashflowMode?: boolean },
): {
  rivals: RivalBoardState[];
  summaries: RivalTurnSummary[];
  playerCoinDelta: number;
  playerShieldConsumed: boolean;
} {
  const cashflow = opts?.cashflowMode ?? false;
  let shield = playerShielded;
  let playerDelta = 0;
  const summaries: RivalTurnSummary[] = [];
  const next = rivals.map((r) => ({
    ...r,
    items: [...r.items],
    monthlyIncome: r.monthlyIncome ?? 5,
    monthlyExpenses: r.monthlyExpenses ?? 4,
  }));

  for (const rival of next) {
    if (rival.skipNextTurn) {
      rival.skipNextTurn = false;
      summaries.push({
        rivalId: rival.id,
        roll: 0,
        message: `${getRivalDef(rival.id).name} is stuck in Inflation Fog and skips.`,
        playerCoinDelta: 0,
      });
      continue;
    }

    const def = getRivalDef(rival.id);
    const roll = rivalRollDice(def.temperament);
    rival.position = (rival.position + roll) % boardSize;

    const spaceKind = rival.position % (cashflow ? 6 : 5);
    let message = `${def.name} rolled ${roll}.`;

    if (cashflow && spaceKind === 0) {
      const net = rival.monthlyIncome - rival.monthlyExpenses;
      rival.coins = Math.max(0, rival.coins + net);
      message +=
        net >= 0
          ? ` Cashflow Pay Day +${net} (income ${rival.monthlyIncome} − bills ${rival.monthlyExpenses}).`
          : ` Cashflow shortfall ${net}.`;
    } else if (cashflow && spaceKind === 1) {
      // Snatch a deal — planners/hoarders more likely to keep it
      const bump = def.temperament === "planner" || def.temperament === "hoarder" ? 8 : 5;
      rival.monthlyIncome += bump;
      rival.coins = Math.max(0, rival.coins - bump * 3);
      message += ` Snagged a deal! +$${bump}/mo income (paid ${bump * 3} coins).`;
    } else if (cashflow && spaceKind === 2) {
      // Liability temptation — spenders/gamblers take bad debt
      if (def.temperament === "spender" || def.temperament === "gambler" || Math.random() < 0.35) {
        const drain = 6 + Math.floor(roll / 2);
        rival.monthlyExpenses += drain;
        message += ` Grabbed a liability (−$${drain}/mo). Impulse tax!`;
      } else {
        message += ` Passed on a shady liability — smart cashflow.`;
      }
    } else if (spaceKind === (cashflow ? 3 : 0)) {
      const gain = cashflow ? rival.monthlyIncome : 6 + roll;
      rival.coins += Math.max(4, gain);
      message += ` Payday +${Math.max(4, gain)}.`;
    } else if (spaceKind === (cashflow ? 4 : 1)) {
      rival.seals += 1;
      rival.coins = Math.max(0, rival.coins - 15);
      message += ` Claimed a Ledger Seal.`;
    } else if (spaceKind === (cashflow ? 5 : 2)) {
      const steal = 5 + Math.floor(roll / 2);
      if (shield) {
        shield = false;
        message += ` Tried to Fee Raid you — Emergency Ledger blocked it!`;
      } else {
        const taken = Math.min(steal, Math.max(0, playerCoins + playerDelta));
        playerDelta -= taken;
        rival.coins += taken;
        message += ` Fee Raided you for ${taken} coins!`;
      }
    } else if (!cashflow && spaceKind === 3) {
      rival.coins = Math.max(0, rival.coins - 8);
      message += ` Paid The Collector.`;
    } else {
      message += cashflow ? ` Scouted the shore for deals.` : ` Explored the shore.`;
    }

    summaries.push({
      rivalId: rival.id,
      roll,
      message,
      playerCoinDelta: playerDelta,
    });
  }

  return {
    rivals: next,
    summaries,
    playerCoinDelta: playerDelta,
    playerShieldConsumed: playerShielded && !shield,
  };
}
