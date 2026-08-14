/**
 * Economy as a dynamic system — opportunity cost + second-order consequences.
 * Canon: GAME_DESIGN_ECONOMY.md
 *
 * Not a realism sim. Every major decision must change market or actor response.
 */

export type EconomyStock = {
  /** Liquid pouch coins */
  pouch: number;
  /** Net monthly cashflow engine */
  cashflow: number;
  /** Memory marks that Harbor can name (0–3 in prototype) */
  memory: number;
  /** 0–3 toward Freedom-style escape */
  escapeStreak: number;
};

export type HarborMarketMood = "boom" | "fair" | "tight" | "storm";

export type EconomyActorId = "piggy" | "collector" | "local" | "rival";

export type EconomyDecisionId =
  | "hold_jar"
  | "spend_treat"
  | "buy_asset"
  | "keep_liquidity"
  | "wait_spiral"
  | "haste_spiral";

export type EconomyConsequence = {
  decisionId: EconomyDecisionId;
  /** What you forgo — opportunity cost, never a shame lecture. */
  opportunityCost: string;
  direct: {
    pouchDelta: number;
    cashflowDelta: number;
    memoryDelta: number;
    label: string;
  };
  market: {
    mood: HarborMarketMood;
    priceMult: number;
    line: string;
  };
  actor: {
    id: EconomyActorId;
    line: string;
  };
  next: {
    kind: "opportunity" | "risk";
    line: string;
  };
  stocks: EconomyStock;
};

export type EconomyDecisionDef = {
  id: EconomyDecisionId;
  organ: "coin" | "clock" | "spiral";
  label: string;
  prompt: string;
  /** Pair id — the alternative you forgo */
  forgoes: EconomyDecisionId;
};

export const ECONOMY_DECISION_PAIRS: readonly [EconomyDecisionDef, EconomyDecisionDef][] = [
  [
    {
      id: "hold_jar",
      organ: "coin",
      label: "Jar before treat",
      prompt: "Pay Day lands. The Coin is listening.",
      forgoes: "spend_treat",
    },
    {
      id: "spend_treat",
      organ: "coin",
      label: "Treat before jar",
      prompt: "Pay Day lands. The Coin is listening.",
      forgoes: "hold_jar",
    },
  ],
  [
    {
      id: "buy_asset",
      organ: "clock",
      label: "Buy Interest Jar (−20 pouch, +8 CF)",
      prompt: "A deal desk opens. Liquidity or engine?",
      forgoes: "keep_liquidity",
    },
    {
      id: "keep_liquidity",
      organ: "clock",
      label: "Keep the pouch flexible",
      prompt: "A deal desk opens. Liquidity or engine?",
      forgoes: "buy_asset",
    },
  ],
  [
    {
      id: "wait_spiral",
      organ: "spiral",
      label: "Wait the spiral",
      prompt: "Credit heat rises. Weigh or rush?",
      forgoes: "haste_spiral",
    },
    {
      id: "haste_spiral",
      organ: "spiral",
      label: "Haste feeds the spiral",
      prompt: "Credit heat rises. Weigh or rush?",
      forgoes: "wait_spiral",
    },
  ],
];

export function createEconomyStocks(): EconomyStock {
  return { pouch: 40, cashflow: 15, memory: 0, escapeStreak: 0 };
}

export function marketMoodFromStocks(stocks: EconomyStock, haste = false): HarborMarketMood {
  if (haste && stocks.cashflow < 20) return "storm";
  if (stocks.cashflow >= 40) return "boom";
  if (stocks.cashflow >= 15) return "fair";
  if (stocks.cashflow >= 0) return "tight";
  return "storm";
}

export function priceMultForMood(mood: HarborMarketMood): number {
  switch (mood) {
    case "boom":
      return 1.1;
    case "fair":
      return 1;
    case "tight":
      return 0.92;
    case "storm":
      return 0.85;
  }
}

function clampStock(s: EconomyStock): EconomyStock {
  return {
    pouch: Math.max(0, Math.round(s.pouch)),
    cashflow: Math.round(s.cashflow),
    memory: Math.max(0, Math.min(5, s.memory)),
    escapeStreak: Math.max(0, Math.min(3, s.escapeStreak)),
  };
}

function withPayday(stocks: EconomyStock): EconomyStock {
  return clampStock({
    ...stocks,
    pouch: stocks.pouch + Math.max(0, stocks.cashflow),
  });
}

function tickEscape(stocks: EconomyStock): EconomyStock {
  if (stocks.cashflow >= 30) {
    return clampStock({ ...stocks, escapeStreak: stocks.escapeStreak + 1 });
  }
  return clampStock({ ...stocks, escapeStreak: 0 });
}

/**
 * Resolve a living-economy decision into the full second-order chain.
 * Equal cinema dignity: both forks of a pair are valid; futures differ.
 */
export function resolveEconomyDecision(
  decisionId: EconomyDecisionId,
  before: EconomyStock,
): EconomyConsequence {
  const pair = ECONOMY_DECISION_PAIRS.find(([a, b]) => a.id === decisionId || b.id === decisionId);
  const def = pair?.find((d) => d.id === decisionId);
  const other = pair?.find((d) => d.id !== decisionId);
  const opportunityCost = other
    ? `You forgo “${other.label}.”`
    : "You forgo the other path.";

  let pouchDelta = 0;
  let cashflowDelta = 0;
  let memoryDelta = 0;
  let directLabel = "";
  let haste = false;
  let actor: EconomyConsequence["actor"];
  let next: EconomyConsequence["next"];

  switch (decisionId) {
    case "hold_jar": {
      // Pay Day into pouch; CF steady; Memory marks hold.
      const paid = withPayday(before);
      pouchDelta = paid.pouch - before.pouch;
      memoryDelta = 1;
      directLabel = `Pay Day +${pouchDelta} pouch. Coin holds — plaque inked.`;
      actor = {
        id: "piggy",
        line: "Piggy: Harbor will name the jar. Locals tip quieter jars.",
      };
      next = {
        kind: "opportunity",
        line: "Deal desk warms — Interest Jar wants your liquidity next.",
      };
      break;
    }
    case "spend_treat": {
      const paid = withPayday(before);
      // Treat spends part of Pay Day; cinema-equal Memory mark.
      const treat = Math.min(8, Math.max(3, Math.round(paid.pouch * 0.15)));
      pouchDelta = paid.pouch - before.pouch - treat;
      memoryDelta = 1;
      directLabel = `Pay Day lands, then −${treat} treat. Plaque still writes.`;
      actor = {
        id: "local",
        line: "A local: Treat-first still teaches — plaza prop remembers glitter.",
      };
      next = {
        kind: "risk",
        line: "Collector sniffs thinner pouch — keep a buffer or buy engine soon.",
      };
      break;
    }
    case "buy_asset": {
      const cost = Math.min(20, before.pouch);
      pouchDelta = -cost;
      cashflowDelta = 8;
      directLabel = `−${cost} pouch → +8 monthly cashflow (Interest Jar).`;
      actor = {
        id: "piggy",
        line: "Piggy: Engine first. Carpet polish can wait.",
      };
      next = {
        kind: "opportunity",
        line: "Freedom streak can tick if CF stays ≥ 30 after next Pay Day.",
      };
      break;
    }
    case "keep_liquidity": {
      directLabel = "Pouch stays flexible — no new engine.";
      actor = {
        id: "rival",
        line: "Rival captain: Flexible pouch — but my raid still smells coins.",
      };
      next = {
        kind: "risk",
        line: "Escape streak stalls while CF sits still. Deal may not wait.",
      };
      break;
    }
    case "wait_spiral": {
      memoryDelta = 1;
      cashflowDelta = 2;
      directLabel = "Spiral withstands — calm CF +2. Plaque: waited.";
      actor = {
        id: "piggy",
        line: "Piggy: Weighed. Harbor weather softens.",
      };
      next = {
        kind: "opportunity",
        line: "Fair shops. Soft Beat battlement peek unlocks for a look.",
      };
      break;
    }
    case "haste_spiral": {
      memoryDelta = 1;
      cashflowDelta = -4;
      haste = true;
      directLabel = "Haste feeds the spiral — CF −4. Plaque still true.";
      actor = {
        id: "collector",
        line: "Collector: Storm pressure. I walk the pier heavier.",
      };
      next = {
        kind: "risk",
        line: "Storm prices + Ordeal heat — Credit painting flickers.",
      };
      break;
    }
  }

  let stocks = clampStock({
    ...before,
    pouch: before.pouch + pouchDelta,
    cashflow: before.cashflow + cashflowDelta,
    memory: before.memory + memoryDelta,
  });
  stocks = tickEscape(stocks);
  const mood = marketMoodFromStocks(stocks, haste);
  const priceMult = priceMultForMood(mood);

  const marketLine =
    mood === "boom"
      ? "Harbor boom — shops mark up; lights bright."
      : mood === "fair"
        ? "Harbor fair — prices steady."
        : mood === "tight"
          ? "Harbor tight — small discounts, thin smiles."
          : "Harbor storm — deep discounts, heavy sky.";

  return {
    decisionId,
    opportunityCost,
    direct: {
      pouchDelta,
      cashflowDelta,
      memoryDelta,
      label: directLabel,
    },
    market: { mood, priceMult, line: marketLine },
    actor,
    next,
    stocks,
  };
}

/** Detect dominant “always buy asset / never trade off” for audit tooling. */
export function isLiquidityStarved(stocks: EconomyStock): boolean {
  return stocks.pouch < 10 && stocks.cashflow >= 30;
}

export function isEscapeReady(stocks: EconomyStock): boolean {
  return stocks.escapeStreak >= 3 && stocks.cashflow >= 30;
}
