/**
 * Historical trend storage for economics snapshots.
 * In-memory + optional localStorage adapter. Does not invent periods.
 */

import type { EconomicsPeriodId, EconomicsSnapshot } from "./types";

export const ECONOMICS_TREND_STORAGE_KEY = "capital_business_economics_trends_v1";

export type EconomicsTrendStore = {
  version: 1;
  snapshots: EconomicsSnapshot[];
};

export function createEmptyTrendStore(): EconomicsTrendStore {
  return { version: 1, snapshots: [] };
}

/** Upsert by periodId (replace if same period recorded again). */
export function upsertSnapshot(
  store: EconomicsTrendStore,
  snapshot: EconomicsSnapshot,
): EconomicsTrendStore {
  const rest = store.snapshots.filter((s) => s.periodId !== snapshot.periodId);
  const snapshots = [...rest, snapshot].sort((a, b) =>
    a.periodId.localeCompare(b.periodId),
  );
  return { version: 1, snapshots };
}

export function getSnapshot(
  store: EconomicsTrendStore,
  periodId: EconomicsPeriodId,
): EconomicsSnapshot | null {
  return store.snapshots.find((s) => s.periodId === periodId) ?? null;
}

export function listSnapshots(store: EconomicsTrendStore): EconomicsSnapshot[] {
  return [...store.snapshots].sort((a, b) => a.periodId.localeCompare(b.periodId));
}

export function priorSnapshot(
  store: EconomicsTrendStore,
  periodId: EconomicsPeriodId,
): EconomicsSnapshot | null {
  const sorted = listSnapshots(store);
  const idx = sorted.findIndex((s) => s.periodId === periodId);
  if (idx <= 0) {
    // If period not present, prior is last before this id lexicographically
    const before = sorted.filter((s) => s.periodId < periodId);
    return before.length ? before[before.length - 1]! : null;
  }
  return sorted[idx - 1] ?? null;
}

export function serializeTrendStore(store: EconomicsTrendStore): string {
  return JSON.stringify(store);
}

export function parseTrendStore(raw: string): EconomicsTrendStore | null {
  try {
    const parsed = JSON.parse(raw) as EconomicsTrendStore;
    if (parsed?.version !== 1 || !Array.isArray(parsed.snapshots)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Browser localStorage adapter — no-op safe outside window. */
export function loadTrendStoreFromLocalStorage(
  key = ECONOMICS_TREND_STORAGE_KEY,
): EconomicsTrendStore {
  if (typeof localStorage === "undefined") return createEmptyTrendStore();
  const raw = localStorage.getItem(key);
  if (!raw) return createEmptyTrendStore();
  return parseTrendStore(raw) ?? createEmptyTrendStore();
}

export function saveTrendStoreToLocalStorage(
  store: EconomicsTrendStore,
  key = ECONOMICS_TREND_STORAGE_KEY,
): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, serializeTrendStore(store));
}

/**
 * Record a snapshot into a store, attaching alerts vs prior period.
 * Caller must pass an already-computed snapshot (from computeEconomicsSnapshot).
 */
export function recordSnapshot(
  store: EconomicsTrendStore,
  snapshot: EconomicsSnapshot,
): EconomicsTrendStore {
  return upsertSnapshot(store, snapshot);
}
