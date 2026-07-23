import type { IslandSaveV1, SavedEvent } from "./types";
import { createDefaultVoyagerLedger } from "./voyagerLedger";
import {
  HARBOR_HAVEN_ID,
  LEGACY_HUB_ISLAND_ID,
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

function hasCoveChapterProgress(save: IslandSaveV1): boolean {
  return Object.keys(save.questStatus ?? {}).some((qid) => qid.startsWith("q_cc_"));
}

/**
 * Harbor Haven split from Coincraft Cove.
 * Old saves treated coincraft_cove as the hub — remap hub keys, keep Cove progress.
 * Never steal a live Cove chapter session back to Harbor.
 */
export function migrateIslandSave(save: IslandSaveV1): IslandSaveV1 {
  let next = { ...save };
  const discovered = new Set(next.discovered?.islands ?? []);
  const knowsHarbor = discovered.has(HARBOR_HAVEN_ID);
  const coveProgress = hasCoveChapterProgress(next);

  // Always ensure Harbor exists once we've seen the split world.
  discovered.add(HARBOR_HAVEN_ID);
  // Keep Cove discoverable if they ever touched the legacy hub or Cove quests.
  if (discovered.has(LEGACY_HUB_ISLAND_ID) || coveProgress) {
    discovered.add(LEGACY_HUB_ISLAND_ID);
  }
  if (next.discovered) {
    next = {
      ...next,
      discovered: { ...next.discovered, islands: Array.from(discovered) },
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

  // Remap coincraft_cove → Harbor ONLY for true legacy-hub resumes.
  // If the player has Cove chapter progress, coincraft_cove is Island 1 — keep it.
  if (next.currentIslandId === LEGACY_HUB_ISLAND_ID) {
    if (coveProgress || knowsHarbor) {
      // Mid-chapter (or post-split) Cove session — leave currentIslandId alone.
      return next;
    }
    // Pure legacy hub park: no Cove quests yet → land on Harbor Haven.
    next = {
      ...next,
      currentIslandId: HARBOR_HAVEN_ID,
      currentAreaId: "hh_plaza",
    };
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
