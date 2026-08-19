import { describe, expect, it } from "vitest";
import { computeEconomicsSnapshot, emptyEconomicsInputs } from "./compute";
import {
  createEmptyTrendStore,
  getSnapshot,
  listSnapshots,
  parseTrendStore,
  priorSnapshot,
  recordSnapshot,
  serializeTrendStore,
  upsertSnapshot,
} from "./trends";

describe("economics trend storage", () => {
  it("starts empty and does not invent history", () => {
    const store = createEmptyTrendStore();
    expect(store.snapshots).toEqual([]);
    expect(listSnapshots(store)).toEqual([]);
  });

  it("upserts by periodId and sorts chronologically by period id", () => {
    let store = createEmptyTrendStore();
    const a = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: emptyEconomicsInputs(),
      recordedAt: "2026-08-01T00:00:00.000Z",
    });
    const b = computeEconomicsSnapshot({
      periodId: "2026-07",
      inputs: emptyEconomicsInputs(),
      recordedAt: "2026-07-01T00:00:00.000Z",
    });
    store = recordSnapshot(store, a);
    store = recordSnapshot(store, b);
    expect(listSnapshots(store).map((s) => s.periodId)).toEqual(["2026-07", "2026-08"]);
  });

  it("replaces same period on upsert", () => {
    let store = createEmptyTrendStore();
    const first = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: { ...emptyEconomicsInputs(), grossRevenue: 1, refunds: 0 },
    });
    const second = computeEconomicsSnapshot({
      periodId: "2026-08",
      inputs: { ...emptyEconomicsInputs(), grossRevenue: 2, refunds: 0 },
    });
    store = upsertSnapshot(store, first);
    store = upsertSnapshot(store, second);
    expect(store.snapshots).toHaveLength(1);
    expect(getSnapshot(store, "2026-08")?.inputs.grossRevenue).toBe(2);
  });

  it("priorSnapshot returns previous period", () => {
    let store = createEmptyTrendStore();
    store = recordSnapshot(
      store,
      computeEconomicsSnapshot({ periodId: "2026-06", inputs: emptyEconomicsInputs() }),
    );
    store = recordSnapshot(
      store,
      computeEconomicsSnapshot({ periodId: "2026-07", inputs: emptyEconomicsInputs() }),
    );
    store = recordSnapshot(
      store,
      computeEconomicsSnapshot({ periodId: "2026-08", inputs: emptyEconomicsInputs() }),
    );
    expect(priorSnapshot(store, "2026-08")?.periodId).toBe("2026-07");
    expect(priorSnapshot(store, "2026-06")).toBeNull();
  });

  it("round-trips JSON without inventing fields", () => {
    let store = createEmptyTrendStore();
    store = recordSnapshot(
      store,
      computeEconomicsSnapshot({ periodId: "2026-08", inputs: emptyEconomicsInputs() }),
    );
    const raw = serializeTrendStore(store);
    const parsed = parseTrendStore(raw);
    expect(parsed?.snapshots).toHaveLength(1);
    expect(parseTrendStore("not-json")).toBeNull();
  });
});
