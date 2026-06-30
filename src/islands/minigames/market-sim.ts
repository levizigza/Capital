// ---------------------------------------------------------------------------
// Market Simulator — Seeded, Explainable, Causal
// ---------------------------------------------------------------------------
// Price model: Geometric Brownian Motion with correlated sector noise,
// deterministic news shocks, and macro-economy modifiers. Every price
// movement is decomposed into explainable causal components so the
// player can learn WHY prices moved, not just THAT they moved.
//
// PRNG: mulberry32 — a proven 32-bit seeded generator commonly used
// in game development. Produces a full-period (2^32) sequence with
// good statistical properties while being fast and reproducible.
//
// Price model (per trading day):
//   return_i = drift_component + noise_component + shock_component
//
//   drift_component  = (μ - σ²/2) · dt          (risk-neutral GBM drift)
//   noise_component  = σ · √dt · z_i             (stochastic term)
//   shock_component  = event.shock · eco_mult     (news event, if any)
//
// Correlation: Stocks in the same sector share a common noise factor.
// Each stock's noise z_i = ρ · z_sector + √(1-ρ²) · z_idiosyncratic
// where ρ is the intra-sector correlation (Cholesky decomposition).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32
// ---------------------------------------------------------------------------
// Reference: Tommy Ettinger's mulberry32. Period 2^32, passes SmallCrush.
// Used over Math.random() so simulations are deterministic and replayable.
// The player sees the same market on the same seed — outcomes are learnable.

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller transform: convert two uniform [0,1) samples to a standard normal. */
function boxMuller(rng: () => number): number {
  const u1 = Math.max(1e-10, rng()); // avoid log(0)
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StockDef = {
  symbol: string;
  name: string;
  sector: string;
  startPrice: number;
  drift: number;     // annualised expected return (μ)
  vol: number;       // annualised volatility (σ)
};

export type NewsEvent = {
  day: number;
  headline: string;
  affectedSectors: string[];
  shock: number;     // single-day log-return shock (e.g. -0.08 = -8%)
  /** Human explanation of the causal mechanism */
  causalNote: string;
};

/** Decomposed return for a single stock on a single day. */
export type ReturnDecomposition = {
  day: number;
  driftComponent: number;
  noiseComponent: number;
  shockComponent: number;
  totalReturn: number;
  /** If a news event fired, its headline */
  newsHeadline?: string;
  /** Causal explanation of why the price moved */
  causalNote?: string;
};

export type StockTick = {
  day: number;
  price: number;
  /** Causal breakdown of this day's return */
  decomposition?: ReturnDecomposition;
};

// ---------------------------------------------------------------------------
// Stock definitions — drift/vol calibrated for educational clarity
// ---------------------------------------------------------------------------

export const STOCKS: StockDef[] = [
  { symbol: "SAFE",  name: "SafeBank Corp",     sector: "finance",   startPrice: 50,  drift: 0.04, vol: 0.12 },
  { symbol: "GROW",  name: "GrowthTech Inc",    sector: "tech",      startPrice: 120, drift: 0.10, vol: 0.30 },
  { symbol: "GREEN", name: "GreenEnergy Ltd",   sector: "energy",    startPrice: 35,  drift: 0.07, vol: 0.22 },
  { symbol: "HEAL",  name: "HealthPlus Co",     sector: "health",    startPrice: 80,  drift: 0.06, vol: 0.18 },
  { symbol: "BOND",  name: "US Treasury Bond",  sector: "bonds",     startPrice: 100, drift: 0.02, vol: 0.04 },
];

// ---------------------------------------------------------------------------
// News events — each with a causal explanation
// ---------------------------------------------------------------------------

export const NEWS_EVENTS: NewsEvent[] = [
  {
    day: 5,
    headline: "Tech earnings beat expectations!",
    affectedSectors: ["tech"],
    shock: 0.06,
    causalNote: "Strong earnings signal higher future profits, attracting buyers and pushing tech prices up.",
  },
  {
    day: 10,
    headline: "Fed raises interest rates.",
    affectedSectors: ["finance", "bonds"],
    shock: -0.03,
    causalNote: "Higher rates increase borrowing costs for banks and reduce the present value of existing bonds.",
  },
  {
    day: 15,
    headline: "New green energy bill passes Congress.",
    affectedSectors: ["energy"],
    shock: 0.08,
    causalNote: "Government subsidies make renewable energy projects more profitable, boosting the sector.",
  },
  {
    day: 20,
    headline: "Healthcare scandal rocks markets.",
    affectedSectors: ["health"],
    shock: -0.10,
    causalNote: "Scandal raises regulatory risk and erodes trust, causing investors to sell health stocks.",
  },
  {
    day: 25,
    headline: "Global recession fears ease.",
    affectedSectors: ["tech", "finance", "energy", "health"],
    shock: 0.04,
    causalNote: "Reduced recession risk makes riskier assets more attractive — broad market rally.",
  },
];

// ---------------------------------------------------------------------------
// Sector correlation matrix
// ---------------------------------------------------------------------------
// Intra-sector correlation (ρ): stocks in the same sector share common
// noise via Cholesky decomposition: z_stock = ρ·z_sector + √(1-ρ²)·z_own.
// Cross-sector correlations are handled by a shared "market factor".

const INTRA_SECTOR_CORR = 0.6;
const MARKET_FACTOR_WEIGHT = 0.3;

/** Pre-computed Cholesky factors for the two-factor model. */
const SECTOR_LOAD = INTRA_SECTOR_CORR;
const IDIO_LOAD = Math.sqrt(1 - INTRA_SECTOR_CORR ** 2);
const MARKET_LOAD = MARKET_FACTOR_WEIGHT;
const RESIDUAL_LOAD = Math.sqrt(1 - MARKET_FACTOR_WEIGHT ** 2);

// ---------------------------------------------------------------------------
// Economy phase integration
// ---------------------------------------------------------------------------

import {
  getPhaseModifiers,
  type EconomyPhase,
} from "@/islands/economy";

export type EconomyOverrides = {
  driftMultiplier: number;
  volatilityMultiplier: number;
  newsShockMultiplier: number;
};

export function economyOverridesForPhase(phase?: EconomyPhase): EconomyOverrides {
  if (!phase) return { driftMultiplier: 1, volatilityMultiplier: 1, newsShockMultiplier: 1 };
  const mods = getPhaseModifiers(phase);
  return {
    driftMultiplier: mods.incomeMultiplier,
    volatilityMultiplier: mods.volatilityMultiplier,
    newsShockMultiplier: phase === "boom" ? 0.7 : phase === "recession" ? 1.4 : 1.0,
  };
}

// ---------------------------------------------------------------------------
// Seed derivation — session-unique, deterministic
// ---------------------------------------------------------------------------

/**
 * Derive a simulation seed from gameplay context.
 * Same island + save timestamp + difficulty = same market.
 * Different sessions get different markets — but always reproducible.
 */
export function deriveSeed(islandId: string, saveTimestamp: string, difficulty: string): number {
  let hash = 0x811c9dc5; // FNV-1a offset basis
  const str = `${islandId}:${saveTimestamp}:${difficulty}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0;
}

// ---------------------------------------------------------------------------
// Price generation with causal decomposition
// ---------------------------------------------------------------------------

export type SimulationResult = {
  ticks: StockTick[];
  /** Per-day return decompositions for explainability */
  decompositions: ReturnDecomposition[];
};

export function generatePriceHistory(
  stock: StockDef,
  days: number,
  seed: number,
  events: NewsEvent[] = NEWS_EVENTS,
  economyPhase?: EconomyPhase,
  sectorNoise?: Map<string, number[]>,
  marketNoise?: number[],
): StockTick[] {
  const eco = economyOverridesForPhase(economyPhase);
  const effectiveDrift = stock.drift * eco.driftMultiplier;
  const effectiveVol = stock.vol * eco.volatilityMultiplier;

  const rng = mulberry32(seed + stock.symbol.charCodeAt(0));
  const dt = 1 / 252;
  const ticks: StockTick[] = [{ day: 0, price: stock.startPrice }];

  for (let d = 1; d <= days; d++) {
    const prev = ticks[d - 1].price;

    // --- Correlated noise via two-factor model ---
    // z_stock = market_load · z_market + residual_load · (sector_load · z_sector + idio_load · z_own)
    const zMarket = marketNoise?.[d] ?? 0;
    const zSector = sectorNoise?.get(stock.sector)?.[d] ?? 0;
    const zOwn = boxMuller(rng);

    const correlatedZ = MARKET_LOAD * zMarket
      + RESIDUAL_LOAD * (SECTOR_LOAD * zSector + IDIO_LOAD * zOwn);

    // --- Decompose return into causal components ---
    const driftComponent = (effectiveDrift - 0.5 * effectiveVol ** 2) * dt;
    const noiseComponent = effectiveVol * Math.sqrt(dt) * correlatedZ;

    let shockComponent = 0;
    let newsHeadline: string | undefined;
    let causalNote: string | undefined;

    const event = events.find((e) => e.day === d && e.affectedSectors.includes(stock.sector));
    if (event) {
      shockComponent = event.shock * eco.newsShockMultiplier;
      newsHeadline = event.headline;
      causalNote = event.causalNote;
    }

    const totalReturn = driftComponent + noiseComponent + shockComponent;

    const decomposition: ReturnDecomposition = {
      day: d,
      driftComponent,
      noiseComponent,
      shockComponent,
      totalReturn,
      newsHeadline,
      causalNote,
    };

    ticks.push({
      day: d,
      price: Math.max(0.01, prev * Math.exp(totalReturn)),
      decomposition,
    });
  }
  return ticks;
}

/**
 * Generate correlated price histories for all stocks.
 * Shared noise factors ensure sector correlation is consistent.
 */
export function generateAllPriceHistories(
  stocks: StockDef[],
  days: number,
  seed: number,
  events: NewsEvent[] = NEWS_EVENTS,
  economyPhase?: EconomyPhase,
): Record<string, StockTick[]> {
  const noiseRng = mulberry32(seed + 0xCAFE);

  // Pre-generate shared noise factors for correlation
  const marketNoise: number[] = [0]; // day 0 placeholder
  const sectors = [...new Set(stocks.map((s) => s.sector))];
  const sectorNoise = new Map<string, number[]>();
  for (const sec of sectors) {
    sectorNoise.set(sec, [0]);
  }

  for (let d = 1; d <= days; d++) {
    marketNoise.push(boxMuller(noiseRng));
    for (const sec of sectors) {
      sectorNoise.get(sec)!.push(boxMuller(noiseRng));
    }
  }

  const result: Record<string, StockTick[]> = {};
  for (const stock of stocks) {
    result[stock.symbol] = generatePriceHistory(
      stock, days, seed, events, economyPhase, sectorNoise, marketNoise,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Portfolio analytics
// ---------------------------------------------------------------------------

export type Position = { symbol: string; shares: number; avgCost: number };

export function portfolioValue(positions: Position[], prices: Record<string, number>): number {
  return positions.reduce((sum, p) => sum + p.shares * (prices[p.symbol] || 0), 0);
}

export function positionPnL(pos: Position, currentPrice: number): number {
  return (currentPrice - pos.avgCost) * pos.shares;
}

export function portfolioVolatility(
  positions: Position[],
  prices: Record<string, number>,
  economyPhase?: EconomyPhase,
): number {
  if (positions.length === 0) return 0;
  const total = portfolioValue(positions, prices);
  if (total === 0) return 0;
  const eco = economyOverridesForPhase(economyPhase);

  // Weight-adjusted volatility with correlation correction
  const weights: { sector: string; weight: number; vol: number }[] = [];
  for (const p of positions) {
    const stock = STOCKS.find((s) => s.symbol === p.symbol);
    if (!stock) continue;
    const w = (p.shares * (prices[p.symbol] || 0)) / total;
    weights.push({ sector: stock.sector, weight: w, vol: stock.vol * eco.volatilityMultiplier });
  }

  // Sum of (w_i · σ_i)² plus cross-correlation terms
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      const corr = weights[i].sector === weights[j].sector
        ? INTRA_SECTOR_CORR
        : MARKET_FACTOR_WEIGHT ** 2;
      variance += weights[i].weight * weights[j].weight
        * weights[i].vol * weights[j].vol * corr;
    }
  }

  return Math.sqrt(Math.max(0, variance));
}

export function diversificationScore(positions: Position[], prices: Record<string, number>): number {
  if (positions.length === 0) return 0;
  const total = portfolioValue(positions, prices);
  if (total === 0) return 0;
  const sectors = new Map<string, number>();
  for (const p of positions) {
    const stock = STOCKS.find((s) => s.symbol === p.symbol);
    const sec = stock?.sector || "unknown";
    const weight = (p.shares * (prices[p.symbol] || 0)) / total;
    sectors.set(sec, (sectors.get(sec) || 0) + weight);
  }
  const hhi = Array.from(sectors.values()).reduce((s, w) => s + w * w, 0);
  return Math.round(Math.max(0, Math.min(100, (1 - hhi) * 125)));
}

export function maxDrawdown(ticks: StockTick[]): number {
  let peak = ticks[0]?.price || 0;
  let maxDd = 0;
  for (const t of ticks) {
    if (t.price > peak) peak = t.price;
    const dd = (peak - t.price) / peak;
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}

// ---------------------------------------------------------------------------
// Risk analytics — forward-looking insights for the player
// ---------------------------------------------------------------------------

export type SectorExposure = {
  sector: string;
  weight: number;
  annualizedVol: number;
  /** Risk contribution = weight × vol (simplified) */
  riskContribution: number;
};

/** Compute per-sector exposure and risk contribution for the portfolio. */
export function sectorRiskMap(
  positions: Position[],
  prices: Record<string, number>,
  economyPhase?: EconomyPhase,
): SectorExposure[] {
  const total = portfolioValue(positions, prices);
  if (total === 0) return [];

  const eco = economyOverridesForPhase(economyPhase);
  const sectorMap = new Map<string, { weight: number; volSum: number; count: number }>();

  for (const p of positions) {
    const stock = STOCKS.find((s) => s.symbol === p.symbol);
    if (!stock) continue;
    const weight = (p.shares * (prices[p.symbol] || 0)) / total;
    const entry = sectorMap.get(stock.sector) ?? { weight: 0, volSum: 0, count: 0 };
    entry.weight += weight;
    entry.volSum += stock.vol * eco.volatilityMultiplier;
    entry.count += 1;
    sectorMap.set(stock.sector, entry);
  }

  return Array.from(sectorMap.entries())
    .map(([sector, data]) => {
      const avgVol = data.volSum / data.count;
      return {
        sector,
        weight: data.weight,
        annualizedVol: avgVol,
        riskContribution: data.weight * avgVol,
      };
    })
    .sort((a, b) => b.riskContribution - a.riskContribution);
}

/**
 * Value-at-Risk: estimate the worst daily loss at a given confidence level.
 * Uses the parametric (variance-covariance) method.
 * VaR(95%) = portfolio_value × portfolio_vol × √(1/252) × z_95
 */
export function portfolioVaR(
  positions: Position[],
  prices: Record<string, number>,
  economyPhase?: EconomyPhase,
  confidence: number = 0.95,
): number {
  const total = portfolioValue(positions, prices);
  if (total === 0) return 0;
  const vol = portfolioVolatility(positions, prices, economyPhase);
  // z-score for confidence level (approximation for common values)
  const zScore = confidence >= 0.99 ? 2.326 : confidence >= 0.95 ? 1.645 : 1.282;
  const dailyVol = vol * Math.sqrt(1 / 252);
  return total * dailyVol * zScore;
}

export type StressScenario = {
  id: string;
  name: string;
  description: string;
  sectorShocks: Record<string, number>;
};

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "tech_crash",
    name: "Tech Crash",
    description: "Tech sector drops 20%, others drop 5%",
    sectorShocks: { tech: -0.20, finance: -0.05, energy: -0.05, health: -0.05, bonds: 0.02 },
  },
  {
    id: "rate_spike",
    name: "Rate Spike",
    description: "Interest rates surge — bonds and finance hit hard",
    sectorShocks: { bonds: -0.08, finance: -0.10, tech: -0.03, energy: -0.02, health: -0.01 },
  },
  {
    id: "broad_rally",
    name: "Broad Rally",
    description: "Everything rallies on strong economic data",
    sectorShocks: { tech: 0.12, finance: 0.06, energy: 0.08, health: 0.05, bonds: -0.01 },
  },
  {
    id: "energy_crisis",
    name: "Energy Crisis",
    description: "Energy sector collapses on supply shock",
    sectorShocks: { energy: -0.25, tech: -0.03, finance: -0.04, health: -0.02, bonds: 0.03 },
  },
  {
    id: "pandemic",
    name: "Pandemic Scare",
    description: "Health sector rallies, everything else drops",
    sectorShocks: { health: 0.15, tech: -0.08, finance: -0.10, energy: -0.15, bonds: 0.05 },
  },
];

/** Apply a stress scenario to a portfolio and return the estimated P&L. */
export function stressTestPortfolio(
  positions: Position[],
  prices: Record<string, number>,
  scenario: StressScenario,
): { totalImpact: number; perStock: { symbol: string; impact: number; shockPct: number }[] } {
  const perStock: { symbol: string; impact: number; shockPct: number }[] = [];
  let totalImpact = 0;

  for (const pos of positions) {
    const stock = STOCKS.find((s) => s.symbol === pos.symbol);
    if (!stock) continue;
    const price = prices[pos.symbol] || 0;
    const shockPct = scenario.sectorShocks[stock.sector] ?? 0;
    const impact = pos.shares * price * shockPct;
    totalImpact += impact;
    perStock.push({ symbol: pos.symbol, impact, shockPct });
  }

  return { totalImpact, perStock };
}

/**
 * Generate a human-readable explanation of why a stock's price changed today.
 * References the causal decomposition so the player learns the mechanics.
 */
export function explainPriceMove(
  stock: StockDef,
  tick: StockTick,
  economyPhase?: EconomyPhase,
): string {
  const d = tick.decomposition;
  if (!d) return "";

  const parts: string[] = [];
  const pctTotal = (d.totalReturn * 100).toFixed(1);
  const direction = d.totalReturn >= 0 ? "up" : "down";

  // Always describe the net move
  parts.push(`${stock.symbol} moved ${direction} ${Math.abs(Number(pctTotal))}% today.`);

  // Explain the biggest contributor
  const absDrift = Math.abs(d.driftComponent);
  const absNoise = Math.abs(d.noiseComponent);
  const absShock = Math.abs(d.shockComponent);

  if (absShock > 0.001 && absShock >= absNoise) {
    parts.push(
      `The main driver was the news event: "${d.newsHeadline}" (${(d.shockComponent * 100).toFixed(1)}% shock).`
    );
    if (d.causalNote) parts.push(d.causalNote);
  } else if (absNoise > absDrift * 2) {
    const noiseDir = d.noiseComponent >= 0 ? "positive" : "negative";
    parts.push(
      `Random market fluctuation (${noiseDir} ${(absNoise * 100).toFixed(1)}%) dominated today's move.`
    );
  } else {
    parts.push(`Normal market drift and moderate noise drove the move.`);
  }

  if (economyPhase && economyPhase !== "normal") {
    const label = economyPhase === "boom" ? "Boom" : "Recession";
    parts.push(`The ${label} economy amplified this effect.`);
  }

  return parts.join(" ");
}
