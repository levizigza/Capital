import { registerModule } from "../registry";
import type {
  MechanicModule,
  GameState,
  ModuleState,
  ModuleAction,
  ApplyResult,
  ModuleUIModel,
} from "../types";

// ---------------------------------------------------------------------------
// CreditUtilizationModule
// ---------------------------------------------------------------------------
// Teaches credit utilization: the player has a credit limit and makes
// purchases. Their utilization ratio (balance / limit) affects a simulated
// credit score. All thresholds and scoring curves come from config.
// ---------------------------------------------------------------------------

type CreditUtilConfig = {
  creditLimit?: number;
  startingBalance?: number;
  /** Utilization thresholds: [{max: 0.3, label:"Excellent", scoreDelta:+5}, ...] */
  thresholds?: { max: number; label: string; scoreDelta: number }[];
  /** Purchasable items */
  purchases?: { id: string; label: string; cost: number }[];
};

type CreditUtilState = {
  creditLimit: number;
  balance: number;
  creditScore: number;
  thresholds: { max: number; label: string; scoreDelta: number }[];
  purchases: { id: string; label: string; cost: number }[];
  history: { action: string; amount: number; utilization: number; scoreChange: number }[];
};

function parseConfig(raw: Record<string, unknown>): CreditUtilConfig {
  return {
    creditLimit: (raw.creditLimit as number) ?? 1000,
    startingBalance: (raw.startingBalance as number) ?? 0,
    thresholds: (raw.thresholds as CreditUtilConfig["thresholds"]) ?? [
      { max: 0.1, label: "Excellent", scoreDelta: 5 },
      { max: 0.3, label: "Good", scoreDelta: 2 },
      { max: 0.5, label: "Fair", scoreDelta: 0 },
      { max: 0.75, label: "Poor", scoreDelta: -3 },
      { max: 1.0, label: "Very Poor", scoreDelta: -8 },
    ],
    purchases: (raw.purchases as CreditUtilConfig["purchases"]) ?? [],
  };
}

function getUtilizationBand(
  utilization: number,
  thresholds: CreditUtilState["thresholds"],
): { label: string; scoreDelta: number } {
  for (const t of thresholds) {
    if (utilization <= t.max) return t;
  }
  return thresholds[thresholds.length - 1] ?? { label: "Unknown", scoreDelta: 0 };
}

const CreditUtilizationModule: MechanicModule = {
  id: "CreditUtilization",
  displayName: "Credit Utilization",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const state: CreditUtilState = {
      creditLimit: c.creditLimit!,
      balance: c.startingBalance!,
      creditScore: 650,
      thresholds: c.thresholds!,
      purchases: c.purchases!,
      history: [],
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    _gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as CreditUtilState;
    const now = Date.now();

    if (action.type === "purchase") {
      const cost = (action.payload?.cost as number) ?? 0;
      const id = (action.payload?.id as string) ?? "";
      const newBalance = state.balance + cost;
      if (newBalance > state.creditLimit) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "Purchase declined — over credit limit!", variant: "error" }],
          telemetry: [{ event: "credit.declined", data: { id, cost }, ts: now }],
        };
      }
      const utilization = newBalance / state.creditLimit;
      const band = getUtilizationBand(utilization, state.thresholds);
      const newScore = Math.max(300, Math.min(850, state.creditScore + band.scoreDelta));

      const newState: CreditUtilState = {
        ...state,
        balance: newBalance,
        creditScore: newScore,
        history: [
          ...state.history,
          { action: `Buy: ${id}`, amount: cost, utilization, scoreChange: band.scoreDelta },
        ],
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "showMessage", text: `Charged $${cost}. Utilization: ${Math.round(utilization * 100)}% (${band.label})`, variant: utilization <= 0.3 ? "success" : "warning" },
          { type: "addScore", amount: band.scoreDelta > 0 ? band.scoreDelta : 0 },
        ],
        telemetry: [{ event: "credit.purchase", data: { id, cost, utilization, band: band.label }, ts: now }],
      };
    }

    if (action.type === "payDown") {
      const amount = (action.payload?.amount as number) ?? 0;
      const actualPay = Math.min(amount, state.balance);
      if (actualPay <= 0) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "No balance to pay down.", variant: "info" }],
          telemetry: [],
        };
      }
      const newBalance = state.balance - actualPay;
      const utilization = newBalance / state.creditLimit;
      const band = getUtilizationBand(utilization, state.thresholds);
      const newScore = Math.max(300, Math.min(850, state.creditScore + Math.abs(band.scoreDelta)));

      const newState: CreditUtilState = {
        ...state,
        balance: newBalance,
        creditScore: newScore,
        history: [
          ...state.history,
          { action: `Payment`, amount: -actualPay, utilization, scoreChange: Math.abs(band.scoreDelta) },
        ],
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "removeMoney", amount: actualPay },
          { type: "addScore", amount: 5 },
          { type: "showMessage", text: `Paid $${actualPay}. Utilization now ${Math.round(utilization * 100)}%`, variant: "success" },
        ],
        telemetry: [{ event: "credit.paydown", data: { amount: actualPay, newBalance, utilization }, ts: now }],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, _gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as CreditUtilState;
    const utilization = state.creditLimit > 0 ? state.balance / state.creditLimit : 0;
    const band = getUtilizationBand(utilization, state.thresholds);

    return {
      moduleId: "CreditUtilization",
      label: "Credit Card",
      data: {
        creditLimit: state.creditLimit,
        balance: state.balance,
        available: state.creditLimit - state.balance,
        utilization: Math.round(utilization * 100),
        utilizationLabel: band.label,
        creditScore: state.creditScore,
        recentHistory: state.history.slice(-5),
      },
      availableActions: [
        ...state.purchases.map((p) => ({
          type: "purchase",
          label: `Buy ${p.label} ($${p.cost})`,
          disabled: state.balance + p.cost > state.creditLimit,
        })),
        { type: "payDown", label: "Make Payment", disabled: state.balance <= 0 },
      ],
    };
  },
};

registerModule(CreditUtilizationModule);
export default CreditUtilizationModule;
