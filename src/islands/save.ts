import type { IslandSaveV1, SavedEvent } from "./types";
import { createDefaultVoyagerLedger } from "./voyagerLedger";
import {
  HARBOR_HAVEN_ID,
  LEGACY_HUB_ISLAND_ID,
  normalizeHubIslandId,
} from "./islandIds";

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
    voyagerLedger: createDefaultVoyagerLedger(),
  };
}

/**
 * Harbor Haven split from Coincraft Cove.
 * Old saves treated coincraft_cove as the hub — remap hub keys, keep Cove progress.
 */
export function migrateIslandSave(save: IslandSaveV1): IslandSaveV1 {
  let next = { ...save };

  // Discover Harbor Haven; keep Cove as a discovered chapter island.
  const islands = new Set(next.discovered?.islands ?? []);
  if (islands.has(LEGACY_HUB_ISLAND_ID) || !next.currentIslandId) {
    islands.add(HARBOR_HAVEN_ID);
  }
  if (next.discovered) {
    next = {
      ...next,
      discovered: { ...next.discovered, islands: Array.from(islands) },
    };
  }

  // Capsule / practice board inventory lived under coincraft_cove — copy to Harbor.
  const boards = { ...(next.partyBoard ?? {}) };
  const legacyBoard = boards[LEGACY_HUB_ISLAND_ID];
  if (legacyBoard && !boards[HARBOR_HAVEN_ID]) {
    boards[HARBOR_HAVEN_ID] = { ...legacyBoard };
    next = { ...next, partyBoard: boards };
  } else if (legacyBoard && boards[HARBOR_HAVEN_ID]) {
    const hubItems = boards[HARBOR_HAVEN_ID]!.items ?? [];
    const legacyItems = legacyBoard.items ?? [];
    const merged = Array.from(new Set([...hubItems, ...legacyItems]));
    boards[HARBOR_HAVEN_ID] = { ...boards[HARBOR_HAVEN_ID]!, items: merged };
    next = { ...next, partyBoard: boards };
  }

  // If the player was "on hub" under the legacy id, park them on Harbor Haven.
  // Cove chapter progress (quests) stays on coincraft_cove.
  if (next.currentIslandId === LEGACY_HUB_ISLAND_ID) {
    const hasCoveProgress = Object.keys(next.questStatus ?? {}).some((qid) =>
      qid.startsWith("q_cc_"),
    );
    // Prefer Harbor as home resume; Cove remains reachable from the map.
    next = {
      ...next,
      currentIslandId: HARBOR_HAVEN_ID,
      // Preserve Cove area only if they were mid-chapter with progress.
      currentAreaId: hasCoveProgress ? next.currentAreaId : "hh_plaza",
    };
  } else if (next.currentIslandId) {
    const normalized = normalizeHubIslandId(next.currentIslandId);
    if (normalized && normalized !== next.currentIslandId) {
      next = { ...next, currentIslandId: normalized };
    }
  }

  return next;
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
    if (existing && existing.version === "1") {
      return migrateIslandSave({
        ...existing,
        voyagerLedger: existing.voyagerLedger ?? createDefaultVoyagerLedger(),
      });
    }
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
