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
// ChangeMakingModule
// ---------------------------------------------------------------------------
// Presents a target price and asks the player to select the correct
// combination of coins/bills to make exact change. Denominations, target
// range, and time limits all come from config.
// ---------------------------------------------------------------------------

type Denomination = { label: string; value: number; icon?: string };

type ChangeMakingConfig = {
  /** Available denominations, e.g. [{label:"Quarter", value:25, icon:"🪙"}] */
  denominations?: Denomination[];
  /** Min target price in cents (default 10). */
  minTarget?: number;
  /** Max target price in cents (default 100). */
  maxTarget?: number;
  /** Points awarded per correct answer (default 10). */
  pointsPerCorrect?: number;
  /** Points deducted per wrong answer (default 5). */
  penaltyPerWrong?: number;
};

type ChangeMakingState = {
  denominations: Denomination[];
  targetCents: number;
  selectedCents: number;
  selectedCoins: { label: string; value: number }[];
  correctCount: number;
  wrongCount: number;
  pointsPerCorrect: number;
  penaltyPerWrong: number;
  minTarget: number;
  maxTarget: number;
  lastResult: "correct" | "wrong" | null;
};

function parseConfig(raw: Record<string, unknown>): ChangeMakingConfig {
  return {
    denominations: (raw.denominations as Denomination[]) ?? [
      { label: "Penny", value: 1, icon: "🟤" },
      { label: "Nickel", value: 5, icon: "⚪" },
      { label: "Dime", value: 10, icon: "🔘" },
      { label: "Quarter", value: 25, icon: "🪙" },
    ],
    minTarget: (raw.minTarget as number) ?? 10,
    maxTarget: (raw.maxTarget as number) ?? 100,
    pointsPerCorrect: (raw.pointsPerCorrect as number) ?? 10,
    penaltyPerWrong: (raw.penaltyPerWrong as number) ?? 5,
  };
}

function randomTarget(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ChangeMakingModule: MechanicModule = {
  id: "ChangeMaking",
  displayName: "Change Making",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const state: ChangeMakingState = {
      denominations: c.denominations!,
      targetCents: randomTarget(c.minTarget!, c.maxTarget!),
      selectedCents: 0,
      selectedCoins: [],
      correctCount: 0,
      wrongCount: 0,
      pointsPerCorrect: c.pointsPerCorrect!,
      penaltyPerWrong: c.penaltyPerWrong!,
      minTarget: c.minTarget!,
      maxTarget: c.maxTarget!,
      lastResult: null,
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    _gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as ChangeMakingState;
    const now = Date.now();

    if (action.type === "addCoin") {
      const value = (action.payload?.value as number) ?? 0;
      const label = (action.payload?.label as string) ?? "";
      const newSelected = state.selectedCents + value;
      const newState: ChangeMakingState = {
        ...state,
        selectedCents: newSelected,
        selectedCoins: [...state.selectedCoins, { label, value }],
        lastResult: null,
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [],
        telemetry: [{ event: "change_making.add_coin", data: { label, value, total: newSelected }, ts: now }],
      };
    }

    if (action.type === "removeLast") {
      if (state.selectedCoins.length === 0) {
        return { newState: moduleState, effects: [], telemetry: [] };
      }
      const removed = state.selectedCoins[state.selectedCoins.length - 1];
      const newState: ChangeMakingState = {
        ...state,
        selectedCents: state.selectedCents - removed.value,
        selectedCoins: state.selectedCoins.slice(0, -1),
        lastResult: null,
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [],
        telemetry: [{ event: "change_making.remove_coin", data: { removed: removed.label }, ts: now }],
      };
    }

    if (action.type === "submit") {
      const isCorrect = state.selectedCents === state.targetCents;
      if (isCorrect) {
        const newState: ChangeMakingState = {
          ...state,
          correctCount: state.correctCount + 1,
          selectedCents: 0,
          selectedCoins: [],
          targetCents: randomTarget(state.minTarget, state.maxTarget),
          lastResult: "correct",
        };
        return {
          newState: newState as unknown as ModuleState,
          effects: [
            { type: "addScore", amount: state.pointsPerCorrect },
            { type: "showMessage", text: "Correct! Exact change!", variant: "success" },
          ],
          telemetry: [{ event: "change_making.correct", data: { target: state.targetCents }, ts: now }],
        };
      } else {
        const newState: ChangeMakingState = {
          ...state,
          wrongCount: state.wrongCount + 1,
          selectedCents: 0,
          selectedCoins: [],
          lastResult: "wrong",
        };
        return {
          newState: newState as unknown as ModuleState,
          effects: [
            { type: "addScore", amount: -state.penaltyPerWrong },
            {
              type: "showMessage",
              text: `Not quite — you had ${state.selectedCents}¢ but needed ${state.targetCents}¢`,
              variant: "warning",
            },
          ],
          telemetry: [
            {
              event: "change_making.wrong",
              data: { target: state.targetCents, submitted: state.selectedCents },
              ts: now,
            },
          ],
        };
      }
    }

    if (action.type === "reset") {
      const newState: ChangeMakingState = {
        ...state,
        selectedCents: 0,
        selectedCoins: [],
        lastResult: null,
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [],
        telemetry: [],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, _gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as ChangeMakingState;
    return {
      moduleId: "ChangeMaking",
      label: "Make Change",
      data: {
        targetCents: state.targetCents,
        selectedCents: state.selectedCents,
        selectedCoins: state.selectedCoins,
        denominations: state.denominations,
        correctCount: state.correctCount,
        wrongCount: state.wrongCount,
        lastResult: state.lastResult,
      },
      availableActions: [
        ...state.denominations.map((d) => ({
          type: "addCoin",
          label: `${d.icon || "🪙"} ${d.label} (${d.value}¢)`,
        })),
        { type: "removeLast", label: "Undo", disabled: state.selectedCoins.length === 0 },
        { type: "submit", label: "Submit", disabled: state.selectedCents === 0 },
        { type: "reset", label: "Clear", disabled: state.selectedCents === 0 },
      ],
    };
  },
};

registerModule(ChangeMakingModule);
export default ChangeMakingModule;
