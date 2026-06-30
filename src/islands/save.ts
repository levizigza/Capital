import type { IslandSaveV1, SavedEvent } from "./types";

const SAVE_KEY = "island_save_v1";

export function createDefaultIslandSave(): IslandSaveV1 {
  const now = new Date().toISOString();
  return {
    version: "1",
    updatedAt: now,
    currentIslandId: undefined,
    currentAreaId: undefined,
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: {
      npcs: [],
      items: [],
      areas: [],
      islands: [],
    },
  };
}

export async function loadIslandSave(): Promise<IslandSaveV1> {
  const fallback = createDefaultIslandSave();
  try {
    const kvPromise = window.spark.kv.get<IslandSaveV1>(SAVE_KEY);
    const existing =
      import.meta.env.VITE_QA === "1"
        ? await Promise.race([
            kvPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5_000)),
          ])
        : await kvPromise;
    if (existing && existing.version === "1") return existing;
  } catch {
    // ignore
  }
  return fallback;
}

export async function persistIslandSave(save: IslandSaveV1): Promise<void> {
  const next: IslandSaveV1 = {
    ...save,
    updatedAt: new Date().toISOString(),
  };
  await window.spark.kv.set(SAVE_KEY, next);
}

/** Max events to keep in save for replay/audit */
const MAX_EVENT_HISTORY = 50;

/**
 * Append resolved scenario events to the island save.
 * Keeps only the last MAX_EVENT_HISTORY entries.
 */
export async function appendEventHistory(newEvents: SavedEvent[]): Promise<void> {
  if (newEvents.length === 0) return;
  const save = await loadIslandSave();
  const existing = save.eventHistory ?? [];
  const merged = [...existing, ...newEvents].slice(-MAX_EVENT_HISTORY);
  await persistIslandSave({ ...save, eventHistory: merged });
}
