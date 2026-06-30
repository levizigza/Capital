// Public API for the mechanics module system
export type {
  GameState,
  ModuleState,
  ModuleAction,
  Effect,
  TelemetryEntry,
  ApplyResult,
  ModuleUIModel,
  MechanicModule,
  ModuleRef,
} from "./types";

export { registerModule, getModule, listModuleIds } from "./registry";
export {
  initSession,
  dispatch,
  getUIModels,
  createDefaultGameState,
  type SessionState,
  type DispatchResult,
} from "./engine";
