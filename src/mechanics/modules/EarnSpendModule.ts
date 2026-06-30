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

type EarnSpendConfig = {
  /** Starting wallet balance (default 0, added on top of game.money). */
  startingBalance?: number;
  /** Named earning opportunities: { id, label, amount } */
  earnOptions?: { id: string; label: string; amount: number }[];
  /** Named spending items: { id, label, cost } */
  spendOptions?: { id: string; label: string; cost: number }[];
};

type EarnSpendState = {
  wallet: number;
  earnedTotal: number;
  spentTotal: number;
  transactions: { type: "earn" | "spend"; id: string; amount: number }[];
};

function parseConfig(raw: Record<string, unknown>): EarnSpendConfig {
  return {
    startingBalance: (raw.startingBalance as number) ?? 0,
    earnOptions: (raw.earnOptions as EarnSpendConfig["earnOptions"]) ?? [],
    spendOptions: (raw.spendOptions as EarnSpendConfig["spendOptions"]) ?? [],
  };
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
      const amount = (action.payload?.amount as number) ?? 0;
      const id = (action.payload?.id as string) ?? "unknown";
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
      const cost = (action.payload?.cost as number) ?? 0;
      const id = (action.payload?.id as string) ?? "unknown";
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
    return {
      moduleId: "EarnSpend",
      label: "Wallet",
      data: {
        wallet: state.wallet,
        earnedTotal: state.earnedTotal,
        spentTotal: state.spentTotal,
        recentTransactions: state.transactions.slice(-5),
      },
      availableActions: [
        { type: "earn", label: "Earn" },
        { type: "spend", label: "Spend", disabled: state.wallet <= 0 },
      ],
    };
  },
};

registerModule(EarnSpendModule);
export default EarnSpendModule;
