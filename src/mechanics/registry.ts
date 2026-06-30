// ---------------------------------------------------------------------------
// Mechanic Module Registry
// ---------------------------------------------------------------------------
// Maps module id strings (as referenced in island JSON) to module instances.
// Import and register each module here.
// ---------------------------------------------------------------------------

import type { MechanicModule } from "./types";

const MODULES: Record<string, MechanicModule> = {};

/** Register a module. Throws if id is already taken. */
export function registerModule(mod: MechanicModule): void {
  if (MODULES[mod.id]) {
    throw new Error(`[mechanics] Duplicate module id: "${mod.id}"`);
  }
  MODULES[mod.id] = mod;
}

/** Look up a module by id. Returns undefined if not found. */
export function getModule(id: string): MechanicModule | undefined {
  return MODULES[id];
}

/** Get all registered module ids. */
export function listModuleIds(): string[] {
  return Object.keys(MODULES);
}
