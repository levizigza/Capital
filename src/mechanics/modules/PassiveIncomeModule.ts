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
// PassiveIncomeModule
// ---------------------------------------------------------------------------
// Teaches passive income streams. Players purchase income-generating assets
// (e.g. rental property, dividend stocks, royalty rights) that pay out
// automatically each cycle. All asset definitions, costs, and yields come
// from config.
// ---------------------------------------------------------------------------

type PassiveAssetDef = {
  id: string;
  label: string;
  icon?: string;
  cost: number;
  /** Income per cycle */
  incomePerCycle: number;
};

type PassiveIncomeConfig = {
  assets?: PassiveAssetDef[];
};

type OwnedAsset = { assetId: string; purchasedCycle: number };

type PassiveIncomeState = {
  assets: PassiveAssetDef[];
  owned: OwnedAsset[];
  totalEarned: number;
  cycle: number;
};

function parseConfig(raw: Record<string, unknown>): PassiveIncomeConfig {
  return {
    assets: (raw.assets as PassiveAssetDef[]) ?? [
      { id: "blog", label: "Finance Blog", icon: "📝", cost: 200, incomePerCycle: 15 },
      { id: "dividendFund", label: "Dividend Fund", icon: "💹", cost: 500, incomePerCycle: 30 },
      { id: "rentalUnit", label: "Rental Unit", icon: "🏠", cost: 1000, incomePerCycle: 80 },
    ],
  };
}

const PassiveIncomeModule: MechanicModule = {
  id: "PassiveIncome",
  displayName: "Passive Income",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const state: PassiveIncomeState = {
      assets: c.assets!,
      owned: [],
      totalEarned: 0,
      cycle: 0,
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as PassiveIncomeState;
    const now = Date.now();

    if (action.type === "buyAsset") {
      const assetId = action.payload?.assetId as string;
      const def = state.assets.find((a) => a.id === assetId);
      if (!def) {
        return { newState: moduleState, effects: [], telemetry: [] };
      }
      if (gameState.money < def.cost) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: `Not enough money for ${def.label} ($${def.cost})`, variant: "warning" }],
          telemetry: [],
        };
      }
      const newState: PassiveIncomeState = {
        ...state,
        owned: [...state.owned, { assetId, purchasedCycle: state.cycle }],
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "removeMoney", amount: def.cost },
          { type: "showMessage", text: `Purchased ${def.label}! Earns $${def.incomePerCycle}/cycle`, variant: "success" },
        ],
        telemetry: [{ event: "passive.buy", data: { assetId, cost: def.cost }, ts: now }],
      };
    }

    if (action.type === "collectIncome") {
      let totalIncome = 0;
      const incomeBreakdown: { label: string; amount: number }[] = [];
      for (const owned of state.owned) {
        const def = state.assets.find((a) => a.id === owned.assetId);
        if (def) {
          totalIncome += def.incomePerCycle;
          incomeBreakdown.push({ label: def.label, amount: def.incomePerCycle });
        }
      }
      if (totalIncome === 0) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "No passive income assets yet!", variant: "info" }],
          telemetry: [],
        };
      }
      const newState: PassiveIncomeState = {
        ...state,
        totalEarned: state.totalEarned + totalIncome,
        cycle: state.cycle + 1,
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [
          { type: "addMoney", amount: totalIncome },
          { type: "addScore", amount: Math.round(totalIncome * 0.2) },
          { type: "showMessage", text: `Passive income: +$${totalIncome}!`, variant: "success" },
        ],
        telemetry: [{ event: "passive.collect", data: { totalIncome, breakdown: incomeBreakdown, cycle: newState.cycle }, ts: now }],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as PassiveIncomeState;
    const incomePerCycle = state.owned.reduce((sum, o) => {
      const def = state.assets.find((a) => a.id === o.assetId);
      return sum + (def?.incomePerCycle ?? 0);
    }, 0);

    return {
      moduleId: "PassiveIncome",
      label: "Passive Income",
      data: {
        incomePerCycle,
        totalEarned: state.totalEarned,
        ownedCount: state.owned.length,
        cycle: state.cycle,
        ownedAssets: state.owned.map((o) => {
          const def = state.assets.find((a) => a.id === o.assetId);
          return { id: o.assetId, label: def?.label ?? o.assetId, income: def?.incomePerCycle ?? 0 };
        }),
        availableAssets: state.assets.map((a) => ({
          ...a,
          affordable: gameState.money >= a.cost,
        })),
      },
      availableActions: [
        ...state.assets.map((a) => ({
          type: "buyAsset",
          label: `Buy ${a.label} ($${a.cost})`,
          disabled: gameState.money < a.cost,
        })),
        { type: "collectIncome", label: "Collect Income", disabled: state.owned.length === 0 },
      ],
    };
  },
};

registerModule(PassiveIncomeModule);
export default PassiveIncomeModule;
