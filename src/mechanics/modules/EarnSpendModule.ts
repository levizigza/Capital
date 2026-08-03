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
// EarnSpendModule
// ---------------------------------------------------------------------------
// Tracks a wallet balance. Players earn money from tasks and choose how to
// spend it. All values (earn amounts, item costs, labels) come from config.
// ---------------------------------------------------------------------------

type EarnOption = { id: string; label: string; amount: number };
type SpendOption = { id: string; label: string; cost: number };

type EarnSpendConfig = {
  /** Starting wallet balance (default 0, added on top of game.money). */
  startingBalance?: number;
  /** Named earning opportunities: { id, label, amount } */
  earnOptions?: EarnOption[];
  /** Named spending items: { id, label, cost } */
  spendOptions?: SpendOption[];
};

type EarnSpendState = {
  wallet: number;
  earnedTotal: number;
  spentTotal: number;
  earnOptions: EarnOption[];
  spendOptions: SpendOption[];
  transactions: { type: "earn" | "spend"; id: string; amount: number }[];
};

function parseConfig(raw: Record<string, unknown>): EarnSpendConfig {
  return {
    startingBalance: (raw.startingBalance as number) ?? 0,
    earnOptions: (raw.earnOptions as EarnSpendConfig["earnOptions"]) ?? [],
    spendOptions: (raw.spendOptions as EarnSpendConfig["spendOptions"]) ?? [],
  };
}

function resolveEarn(
  state: EarnSpendState,
  payload?: Record<string, unknown>,
): EarnOption | null {
  const id = typeof payload?.id === "string" ? payload.id : null;
  const label = typeof payload?.label === "string" ? payload.label : null;
  if (id) return state.earnOptions.find((o) => o.id === id) ?? null;
  if (label) return state.earnOptions.find((o) => o.label === label) ?? null;
  if (typeof payload?.amount === "number" && payload.amount > 0) {
    return {
      id: typeof payload.id === "string" ? payload.id : "earn",
      label: label ?? "Earn",
      amount: payload.amount,
    };
  }
  return state.earnOptions[0] ?? null;
}

function resolveSpend(
  state: EarnSpendState,
  payload?: Record<string, unknown>,
): SpendOption | null {
  const id = typeof payload?.id === "string" ? payload.id : null;
  const label = typeof payload?.label === "string" ? payload.label : null;
  if (id) return state.spendOptions.find((o) => o.id === id) ?? null;
  if (label) return state.spendOptions.find((o) => o.label === label) ?? null;
  if (typeof payload?.cost === "number" && payload.cost > 0) {
    return {
      id: typeof payload.id === "string" ? payload.id : "spend",
      label: label ?? "Spend",
      cost: payload.cost,
    };
  }
  return state.spendOptions[0] ?? null;
}

const EarnSpendModule: MechanicModule = {
  id: "EarnSpend",
  displayName: "Earn & Spend",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const state: EarnSpendState = {
      wallet: c.startingBalance ?? 0,
      earnedTotal: 0,
      spentTotal: 0,
      earnOptions: c.earnOptions ?? [],
      spendOptions: c.spendOptions ?? [],
      transactions: [],
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    _gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as EarnSpendState;
    const now = Date.now();

    if (action.type === "earn") {
      const opt = resolveEarn(state, action.payload as Record<string, unknown> | undefined);
      if (!opt) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "No jobs open right now.", variant: "warning" }],
          telemetry: [{ event: "earn_spend.no_option", data: {}, ts: now }],
        };
      }
      const { amount, id } = opt;
      const newState: EarnSpendState = {
        ...state,
        wallet: state.wallet + amount,
        earnedTotal: state.earnedTotal + amount,
        transactions: [...state.transactions, { type: "earn", id, amount }],
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "addMoney", amount },
          { type: "addScore", amount: Math.round(amount * 0.5) },
          { type: "showMessage", text: `Earned $${amount}!`, variant: "success" },
        ],
        telemetry: [{ event: "earn_spend.earned", data: { id, amount }, ts: now }],
      };
    }

    if (action.type === "spend") {
      const opt = resolveSpend(state, action.payload as Record<string, unknown> | undefined);
      if (!opt) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "Nothing to buy yet.", variant: "warning" }],
          telemetry: [{ event: "earn_spend.no_spend", data: {}, ts: now }],
        };
      }
      const { cost, id } = opt;
      if (state.wallet < cost) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "Not enough money!", variant: "warning" }],
          telemetry: [{ event: "earn_spend.insufficient", data: { id, cost, wallet: state.wallet }, ts: now }],
        };
      }
      const newState: EarnSpendState = {
        ...state,
        wallet: state.wallet - cost,
        spentTotal: state.spentTotal + cost,
        transactions: [...state.transactions, { type: "spend", id, amount: cost }],
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "removeMoney", amount: cost },
          { type: "showMessage", text: `Spent $${cost}`, variant: "info" },
        ],
        telemetry: [{ event: "earn_spend.spent", data: { id, cost }, ts: now }],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, _gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as EarnSpendState;
    const earnActions =
      state.earnOptions.length > 0
        ? state.earnOptions.map((o) => ({
            type: "earn",
            label: `${o.label} (+$${o.amount})`,
          }))
        : [{ type: "earn", label: "Earn" }];
    const spendActions =
      state.spendOptions.length > 0
        ? state.spendOptions.map((o) => ({
            type: "spend",
            label: `${o.label} ($${o.cost})`,
            disabled: state.wallet < o.cost,
          }))
        : [{ type: "spend", label: "Spend", disabled: state.wallet <= 0 }];
    return {
      moduleId: "EarnSpend",
      label: "Wallet",
      data: {
        wallet: state.wallet,
        earnedTotal: state.earnedTotal,
        spentTotal: state.spentTotal,
        earnOptions: state.earnOptions,
        spendOptions: state.spendOptions,
        recentTransactions: state.transactions.slice(-5),
      },
      availableActions: [...earnActions, ...spendActions],
    };
  },
};

registerModule(EarnSpendModule);
export default EarnSpendModule;
