import { registerModule } from "../registry";
import type {
  MechanicModule,
  GameState,
  ModuleState,
  ModuleAction,
  ApplyResult,
  ModuleUIModel,
} from "../types";
import { getPhaseModifiers } from "@/islands/economy";

// ---------------------------------------------------------------------------
// PortfolioDriftModule
// ---------------------------------------------------------------------------
// Simulates a simple investment portfolio that drifts each turn based on
// configurable asset classes, their expected returns, and volatility.
// Players allocate across asset classes and watch the portfolio change.
// All asset definitions and drift parameters come from config.
// ---------------------------------------------------------------------------

type AssetClassDef = {
  id: string;
  label: string;
  icon?: string;
  /** Expected return per cycle, e.g. 0.02 = +2% */
  expectedReturn: number;
  /** Volatility (std dev), e.g. 0.05 = ±5% swing */
  volatility: number;
};

type PortfolioDriftConfig = {
  assetClasses?: AssetClassDef[];
  startingCapital?: number;
};

type Holding = { assetId: string; shares: number; avgCost: number };

type PortfolioDriftState = {
  assetClasses: AssetClassDef[];
  prices: Record<string, number>; // current price per unit
  holdings: Holding[];
  cash: number;
  startingCapital: number;
  priceHistory: Record<string, number[]>;
  cycle: number;
};

function parseConfig(raw: Record<string, unknown>): PortfolioDriftConfig {
  return {
    assetClasses: (raw.assetClasses as AssetClassDef[]) ?? [
      { id: "bonds", label: "Bonds", icon: "📜", expectedReturn: 0.01, volatility: 0.02 },
      { id: "stocks", label: "Stocks", icon: "📈", expectedReturn: 0.03, volatility: 0.08 },
      { id: "savings", label: "Savings", icon: "🏦", expectedReturn: 0.005, volatility: 0.001 },
    ],
    startingCapital: (raw.startingCapital as number) ?? 1000,
  };
}

function gaussianRandom(): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function driftPrice(price: number, expectedReturn: number, volatility: number): number {
  const drift = expectedReturn + volatility * gaussianRandom();
  return Math.max(0.01, price * (1 + drift));
}

const PortfolioDriftModule: MechanicModule = {
  id: "PortfolioDrift",
  displayName: "Portfolio Drift",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const prices: Record<string, number> = {};
    const priceHistory: Record<string, number[]> = {};
    for (const ac of c.assetClasses!) {
      prices[ac.id] = 100; // all start at 100
      priceHistory[ac.id] = [100];
    }
    const state: PortfolioDriftState = {
      assetClasses: c.assetClasses!,
      prices,
      holdings: [],
      cash: c.startingCapital!,
      startingCapital: c.startingCapital!,
      priceHistory,
      cycle: 0,
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    _gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as PortfolioDriftState;
    const now = Date.now();

    if (action.type === "buy") {
      const assetId = action.payload?.assetId as string;
      const amount = (action.payload?.amount as number) ?? 0;
      const price = state.prices[assetId];
      if (!price || amount <= 0) {
        return { newState: moduleState, effects: [], telemetry: [] };
      }
      const cost = price * amount;
      if (cost > state.cash) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "Not enough cash!", variant: "warning" }],
          telemetry: [],
        };
      }
      const existingIdx = state.holdings.findIndex((h) => h.assetId === assetId);
      const newHoldings = [...state.holdings];
      if (existingIdx >= 0) {
        const old = newHoldings[existingIdx];
        const totalShares = old.shares + amount;
        const totalCost = old.avgCost * old.shares + price * amount;
        newHoldings[existingIdx] = { assetId, shares: totalShares, avgCost: totalCost / totalShares };
      } else {
        newHoldings.push({ assetId, shares: amount, avgCost: price });
      }
      const newState: PortfolioDriftState = { ...state, holdings: newHoldings, cash: state.cash - cost };
      const ac = state.assetClasses.find((a) => a.id === assetId);
      return {
        newState: newState as unknown as ModuleState,
        effects: [{ type: "showMessage", text: `Bought ${amount} ${ac?.label ?? assetId} at $${price.toFixed(2)}`, variant: "success" }],
        telemetry: [{ event: "portfolio.buy", data: { assetId, amount, price }, ts: now }],
      };
    }

    if (action.type === "sell") {
      const assetId = action.payload?.assetId as string;
      const amount = (action.payload?.amount as number) ?? 0;
      const price = state.prices[assetId];
      const holdingIdx = state.holdings.findIndex((h) => h.assetId === assetId);
      if (holdingIdx < 0 || !price || amount <= 0) {
        return { newState: moduleState, effects: [], telemetry: [] };
      }
      const holding = state.holdings[holdingIdx];
      const sellShares = Math.min(amount, holding.shares);
      const revenue = sellShares * price;
      const newHoldings = [...state.holdings];
      if (sellShares >= holding.shares) {
        newHoldings.splice(holdingIdx, 1);
      } else {
        newHoldings[holdingIdx] = { ...holding, shares: holding.shares - sellShares };
      }
      const newState: PortfolioDriftState = { ...state, holdings: newHoldings, cash: state.cash + revenue };
      const profit = revenue - sellShares * holding.avgCost;
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "addMoney", amount: Math.round(revenue) },
          { type: "addScore", amount: profit > 0 ? Math.round(profit * 0.1) : 0 },
          { type: "showMessage", text: `Sold ${sellShares} for $${revenue.toFixed(2)} (${profit >= 0 ? "+" : ""}${profit.toFixed(2)})`, variant: profit >= 0 ? "success" : "warning" },
        ],
        telemetry: [{ event: "portfolio.sell", data: { assetId, amount: sellShares, price, profit }, ts: now }],
      };
    }

    if (action.type === "simulateCycle") {
      // Apply economy-phase volatility multiplier
      const volMult = _gameState.economyPhase
        ? getPhaseModifiers(_gameState.economyPhase).volatilityMultiplier
        : 1;
      const newPrices: Record<string, number> = {};
      const newHistory: Record<string, number[]> = {};
      for (const ac of state.assetClasses) {
        const newPrice = driftPrice(state.prices[ac.id], ac.expectedReturn, ac.volatility * volMult);
        newPrices[ac.id] = Math.round(newPrice * 100) / 100;
        newHistory[ac.id] = [...(state.priceHistory[ac.id] ?? []), newPrices[ac.id]];
      }
      const newState: PortfolioDriftState = {
        ...state,
        prices: newPrices,
        priceHistory: newHistory,
        cycle: state.cycle + 1,
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "advanceTurn" },
          { type: "showMessage", text: "Markets updated!", variant: "info" },
        ],
        telemetry: [{ event: "portfolio.cycle", data: { cycle: newState.cycle, prices: newPrices }, ts: now }],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, _gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as PortfolioDriftState;
    const portfolioValue = state.holdings.reduce(
      (sum, h) => sum + h.shares * (state.prices[h.assetId] ?? 0),
      0,
    );
    const totalValue = state.cash + portfolioValue;
    const gain = totalValue - state.startingCapital;

    return {
      moduleId: "PortfolioDrift",
      label: "Portfolio",
      data: {
        cash: Math.round(state.cash * 100) / 100,
        portfolioValue: Math.round(portfolioValue * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        gain: Math.round(gain * 100) / 100,
        cycle: state.cycle,
        assetClasses: state.assetClasses.map((ac) => ({
          ...ac,
          currentPrice: state.prices[ac.id],
          held: state.holdings.find((h) => h.assetId === ac.id)?.shares ?? 0,
        })),
      },
      availableActions: [
        { type: "simulateCycle", label: "Next Period" },
        ...state.assetClasses.map((ac) => ({
          type: "buy",
          label: `Buy ${ac.label}`,
          disabled: state.cash < state.prices[ac.id],
        })),
        ...state.holdings.map((h) => {
          const ac = state.assetClasses.find((a) => a.id === h.assetId);
          return { type: "sell", label: `Sell ${ac?.label ?? h.assetId}`, disabled: h.shares <= 0 };
        }),
      ],
    };
  },
};

registerModule(PortfolioDriftModule);
export default PortfolioDriftModule;
