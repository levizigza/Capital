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
// EnvelopeBudgetModule
// ---------------------------------------------------------------------------
// Classic envelope budgeting: a fixed income is split across named
// envelopes. Players allocate funds, then expenses arrive that must be
// paid from the correct envelope. All envelope names, income, and expense
// definitions come from config.
// ---------------------------------------------------------------------------

type EnvelopeDef = { id: string; label: string; icon?: string; recommended?: number };
type ExpenseDef = { id: string; label: string; envelopeId: string; amount: number };

type EnvelopeBudgetConfig = {
  income?: number;
  envelopes?: EnvelopeDef[];
  expenses?: ExpenseDef[];
};

type EnvelopeState = {
  income: number;
  unallocated: number;
  envelopes: Record<string, { label: string; icon: string; allocated: number; spent: number }>;
  envelopeOrder: string[];
  expenses: ExpenseDef[];
  currentExpenseIndex: number;
  phase: "allocate" | "spend" | "done";
  overBudgetCount: number;
};

function parseConfig(raw: Record<string, unknown>): EnvelopeBudgetConfig {
  return {
    income: (raw.income as number) ?? 1000,
    envelopes: (raw.envelopes as EnvelopeDef[]) ?? [
      { id: "needs", label: "Needs", icon: "🏠", recommended: 50 },
      { id: "wants", label: "Wants", icon: "🎮", recommended: 30 },
      { id: "savings", label: "Savings", icon: "🏦", recommended: 20 },
    ],
    expenses: (raw.expenses as ExpenseDef[]) ?? [],
  };
}

const EnvelopeBudgetModule: MechanicModule = {
  id: "EnvelopeBudget",
  displayName: "Envelope Budget",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const envMap: EnvelopeState["envelopes"] = {};
    const order: string[] = [];
    for (const e of c.envelopes!) {
      envMap[e.id] = { label: e.label, icon: e.icon ?? "📁", allocated: 0, spent: 0 };
      order.push(e.id);
    }
    const state: EnvelopeState = {
      income: c.income!,
      unallocated: c.income!,
      envelopes: envMap,
      envelopeOrder: order,
      expenses: c.expenses ?? [],
      currentExpenseIndex: 0,
      phase: "allocate",
      overBudgetCount: 0,
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    _gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as EnvelopeState;
    const now = Date.now();

    // --- Allocation phase ---
    if (action.type === "allocate" && state.phase === "allocate") {
      const envelopeId = action.payload?.envelopeId as string;
      const amount = (action.payload?.amount as number) ?? 0;
      if (!state.envelopes[envelopeId] || amount <= 0 || amount > state.unallocated) {
        return {
          newState: moduleState,
          effects: [{ type: "showMessage", text: "Invalid allocation", variant: "warning" }],
          telemetry: [],
        };
      }
      const newEnvelopes = { ...state.envelopes };
      newEnvelopes[envelopeId] = {
        ...newEnvelopes[envelopeId],
        allocated: newEnvelopes[envelopeId].allocated + amount,
      };
      const newState: EnvelopeState = {
        ...state,
        unallocated: state.unallocated - amount,
        envelopes: newEnvelopes,
      };
      return {
        newState: newState as unknown as ModuleState,
        effects: [],
        telemetry: [{ event: "envelope.allocate", data: { envelopeId, amount }, ts: now }],
      };
    }

    // Finish allocation → move to spend phase
    if (action.type === "finishAllocating" && state.phase === "allocate") {
      const newState: EnvelopeState = { ...state, phase: state.expenses.length > 0 ? "spend" : "done" };
      return {
        newState: newState as unknown as ModuleState,
        effects: [{ type: "showMessage", text: "Budget set! Now expenses arrive...", variant: "info" }],
        telemetry: [{ event: "envelope.allocation_done", data: { unallocated: state.unallocated }, ts: now }],
      };
    }

    // --- Spend phase ---
    if (action.type === "payExpense" && state.phase === "spend") {
      const expense = state.expenses[state.currentExpenseIndex];
      if (!expense) {
        return { newState: moduleState, effects: [], telemetry: [] };
      }
      const env = state.envelopes[expense.envelopeId];
      const remaining = env ? env.allocated - env.spent : 0;
      const overBudget = expense.amount > remaining;

      const newEnvelopes = { ...state.envelopes };
      if (env) {
        newEnvelopes[expense.envelopeId] = {
          ...env,
          spent: env.spent + expense.amount,
        };
      }

      const nextIndex = state.currentExpenseIndex + 1;
      const done = nextIndex >= state.expenses.length;

      const newState: EnvelopeState = {
        ...state,
        envelopes: newEnvelopes,
        currentExpenseIndex: nextIndex,
        phase: done ? "done" : "spend",
        overBudgetCount: state.overBudgetCount + (overBudget ? 1 : 0),
      };

      const effects: ApplyResult["effects"] = [];
      if (overBudget) {
        effects.push({ type: "showMessage", text: `Over budget on "${env?.label}"!`, variant: "error" });
      } else {
        effects.push({ type: "addScore", amount: 10 });
        effects.push({ type: "showMessage", text: `Paid "${expense.label}" from ${env?.label}`, variant: "success" });
      }
      if (done) {
        effects.push({ type: "endGame", success: newState.overBudgetCount === 0 });
      }

      return {
        newState: newState as unknown as ModuleState,
        effects,
        telemetry: [{ event: "envelope.pay_expense", data: { expense: expense.id, overBudget }, ts: now }],
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, _gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as EnvelopeState;
    const currentExpense = state.phase === "spend" ? state.expenses[state.currentExpenseIndex] : null;

    return {
      moduleId: "EnvelopeBudget",
      label: "Envelope Budget",
      data: {
        phase: state.phase,
        income: state.income,
        unallocated: state.unallocated,
        envelopes: state.envelopeOrder.map((id) => ({
          id,
          ...state.envelopes[id],
          remaining: state.envelopes[id].allocated - state.envelopes[id].spent,
        })),
        currentExpense: currentExpense
          ? { label: currentExpense.label, amount: currentExpense.amount, envelopeId: currentExpense.envelopeId }
          : null,
        expenseProgress: `${state.currentExpenseIndex}/${state.expenses.length}`,
        overBudgetCount: state.overBudgetCount,
      },
      availableActions:
        state.phase === "allocate"
          ? [
              ...state.envelopeOrder.map((id) => ({
                type: "allocate",
                label: `Add to ${state.envelopes[id].label}`,
                disabled: state.unallocated <= 0,
              })),
              { type: "finishAllocating", label: "Done Allocating" },
            ]
          : state.phase === "spend"
            ? [{ type: "payExpense", label: `Pay: ${currentExpense?.label ?? ""}` }]
            : [],
    };
  },
};

registerModule(EnvelopeBudgetModule);
export default EnvelopeBudgetModule;
