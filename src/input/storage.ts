import { DEFAULT_BINDINGS } from "./defaultBindings";
import type { InputBindingsMap, InputSettingsV1 } from "./types";

const STORAGE_KEY = "financequest_input_v1";

export function loadInputSettings(): InputSettingsV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSettings();
    const parsed = JSON.parse(raw) as InputSettingsV1;
    if (parsed.version !== 1) return createDefaultSettings();
    return {
      ...createDefaultSettings(),
      ...parsed,
      bindings: mergeBindings(DEFAULT_BINDINGS, parsed.bindings),
    };
  } catch {
    return createDefaultSettings();
  }
}

export function persistInputSettings(settings: InputSettingsV1): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota */
  }
}

export function createDefaultSettings(): InputSettingsV1 {
  return {
    version: 1,
    bindings: structuredClone(DEFAULT_BINDINGS),
    promptTheme: "dark",
  };
}

function mergeBindings(
  defaults: InputBindingsMap,
  overrides?: Partial<InputBindingsMap>
): InputBindingsMap {
  const out = structuredClone(defaults);
  if (!overrides) return out;
  for (const key of Object.keys(overrides) as (keyof InputBindingsMap)[]) {
    if (overrides[key]) out[key] = structuredClone(overrides[key]!);
  }
  return out;
}

export function resetBindingsToDefault(): InputSettingsV1 {
  const next = createDefaultSettings();
  persistInputSettings(next);
  return next;
}
