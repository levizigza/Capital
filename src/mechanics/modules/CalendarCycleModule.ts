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
// CalendarCycleModule
// ---------------------------------------------------------------------------
// Simulates the passage of time in weekly/monthly cycles. Each cycle can
// trigger recurring income, bills, or events. The calendar length, cycle
// duration labels, and recurring items all come from config.
// ---------------------------------------------------------------------------

type RecurringItem = {
  id: string;
  label: string;
  amount: number;
  type: "income" | "expense";
  cycleInterval: number; // every N cycles
};

type CalendarCycleConfig = {
  totalCycles?: number;
  cycleLabel?: string; // e.g. "Week", "Month"
  recurringItems?: RecurringItem[];
};

type CalendarState = {
  currentCycle: number;
  totalCycles: number;
  cycleLabel: string;
  recurringItems: RecurringItem[];
  ledger: { cycle: number; itemId: string; amount: number; type: "income" | "expense" }[];
  phase: "active" | "done";
};

function parseConfig(raw: Record<string, unknown>): CalendarCycleConfig {
  return {
    totalCycles: (raw.totalCycles as number) ?? 12,
    cycleLabel: (raw.cycleLabel as string) ?? "Month",
    recurringItems: (raw.recurringItems as RecurringItem[]) ?? [],
  };
}

const CalendarCycleModule: MechanicModule = {
  id: "CalendarCycle",
  displayName: "Calendar Cycle",

  init(config: Record<string, unknown>, _gameState: GameState): ModuleState {
    const c = parseConfig(config);
    const state: CalendarState = {
      currentCycle: 1,
      totalCycles: c.totalCycles!,
      cycleLabel: c.cycleLabel!,
      recurringItems: c.recurringItems!,
      ledger: [],
      phase: "active",
    };
    return state as unknown as ModuleState;
  },

  apply(
    action: ModuleAction,
    moduleState: ModuleState,
    _gameState: GameState,
  ): ApplyResult {
    const state = moduleState as unknown as CalendarState;
    const now = Date.now();

    if (action.type === "advanceCycle" && state.phase === "active") {
      const cycle = state.currentCycle;
      const dueItems = state.recurringItems.filter(
        (item) => cycle % item.cycleInterval === 0,
      );

      const newLedger = [...state.ledger];
      const effects: ApplyResult["effects"] = [];
      const telemetry: ApplyResult["telemetry"] = [];

      for (const item of dueItems) {
        newLedger.push({ cycle, itemId: item.id, amount: item.amount, type: item.type });
        if (item.type === "income") {
          effects.push({ type: "addMoney", amount: item.amount });
        } else {
          effects.push({ type: "removeMoney", amount: item.amount });
        }
        effects.push({
          type: "showMessage",
          text: `${state.cycleLabel} ${cycle}: ${item.type === "income" ? "+" : "-"}$${item.amount} (${item.label})`,
          variant: item.type === "income" ? "success" : "info",
        });
        telemetry.push({
          event: "calendar.recurring",
          data: { cycle, itemId: item.id, amount: item.amount, type: item.type },
          ts: now,
        });
      }

      effects.push({ type: "advanceTurn" });

      const nextCycle = cycle + 1;
      const done = nextCycle > state.totalCycles;

      if (done) {
        effects.push({ type: "endGame", success: true });
      }

      const newState: CalendarState = {
        ...state,
        currentCycle: done ? cycle : nextCycle,
        ledger: newLedger,
        phase: done ? "done" : "active",
      };

      return {
        newState: newState as unknown as ModuleState,
        effects,
        telemetry,
      };
    }

    return { newState: moduleState, effects: [], telemetry: [] };
  },

  getUIModel(moduleState: ModuleState, _gameState: GameState): ModuleUIModel {
    const state = moduleState as unknown as CalendarState;
    return {
      moduleId: "CalendarCycle",
      label: `${state.cycleLabel} ${state.currentCycle} / ${state.totalCycles}`,
      data: {
        currentCycle: state.currentCycle,
        totalCycles: state.totalCycles,
        cycleLabel: state.cycleLabel,
        phase: state.phase,
        recentLedger: state.ledger.slice(-6),
        upcomingItems: state.recurringItems
          .filter((item) => state.currentCycle % item.cycleInterval === 0)
          .map((item) => ({ label: item.label, amount: item.amount, type: item.type })),
      },
      availableActions:
        state.phase === "active"
          ? [{ type: "advanceCycle", label: `Next ${state.cycleLabel}` }]
          : [],
    };
  },
};

registerModule(CalendarCycleModule);
export default CalendarCycleModule;
