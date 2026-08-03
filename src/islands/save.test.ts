import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  createDefaultIslandSave,
  loadIslandSave,
  migrateIslandSave,
  sanitizeIslandSave,
} from "./save";
import { HARBOR_HAVEN_ID } from "./islandIds";

/**
 * Pillar 14 — corrupt save once; Harbor stays playable.
 */
describe("Island save sanitize / corrupt fallback", () => {
  it("returns null for non-objects and wrong version", () => {
    expect(sanitizeIslandSave(null)).toBeNull();
    expect(sanitizeIslandSave("nope")).toBeNull();
    expect(sanitizeIslandSave({ version: "2" })).toBeNull();
  });

  it("coerces missing discovered / inventory so boot cannot brick", () => {
    const save = sanitizeIslandSave({
      version: "1",
      updatedAt: "2026-01-01T00:00:00.000Z",
      // poison shapes that used to pass parseSave
      inventory: "coins",
      questStatus: null,
      completedMinigames: 12,
      discovered: { islands: "harbor_haven" },
    });
    expect(save).not.toBeNull();
    expect(Array.isArray(save!.inventory)).toBe(true);
    expect(save!.inventory).toEqual([]);
    expect(save!.questStatus).toEqual({});
    expect(Array.isArray(save!.discovered.islands)).toBe(true);
    expect(save!.discovered.islands).toContain(HARBOR_HAVEN_ID);
    // Spread-safe for IslandsApp boot paths
    expect(() => [...save!.discovered.islands]).not.toThrow();
    expect(() => Object.keys(save!.questStatus)).not.toThrow();
  });

  it("drops string partyBoard / keeps object progress", () => {
    const poison = sanitizeIslandSave({
      version: "1",
      partyBoard: "not-an-object",
      onboardingComplete: true,
    });
    expect(poison?.partyBoard).toBeUndefined();
    expect(poison?.onboardingComplete).toBe(true);

    const ok = sanitizeIslandSave({
      version: "1",
      partyBoard: {
        coincraft_cove: { position: 0, seals: 0, items: ["a"], rivals: [], turns: 0 },
      },
    });
    expect(ok?.partyBoard?.coincraft_cove?.items).toEqual(["a"]);
  });

  it("preserves Cove scars while normalizing arrays", () => {
    const save = sanitizeIslandSave({
      version: "1",
      inventory: ["coin_token"],
      questStatus: { q_cc_first_coins: { started: true, completed: true } },
      discovered: { islands: ["coincraft_cove"], npcs: [], items: [], areas: [] },
      harborScars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          label: "Jar before treat",
          kind: "plaque",
          createdAt: "1",
        },
      ],
    });
    expect(save?.inventory).toEqual(["coin_token"]);
    expect(save?.questStatus.q_cc_first_coins?.completed).toBe(true);
    expect(save?.harborScars?.[0]?.label).toBe("Jar before treat");
    expect(save?.discovered.islands).toContain(HARBOR_HAVEN_ID);
  });

  it("migrate remaps pure legacy hub park to Harbor", () => {
    const legacy = migrateIslandSave({
      ...createDefaultIslandSave(),
      currentIslandId: "coincraft_cove",
      currentAreaId: undefined,
      questStatus: {},
      discovered: { npcs: [], items: [], areas: [], islands: [] },
    });
    expect(legacy.currentIslandId).toBe(HARBOR_HAVEN_ID);
    expect(legacy.currentAreaId).toBe("hh_plaza");
  });
});

describe("loadIslandSave corrupt localStorage", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
    });
    vi.stubGlobal("spark", {
      kv: {
        get: async () => null,
        set: async () => {},
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to default Harbor save on truncated JSON", async () => {
    localStorage.setItem("island_save_v1", "{version");
    const save = await loadIslandSave();
    expect(save.version).toBe("1");
    expect(save.discovered.islands).toEqual([]);
    expect(Array.isArray(save.inventory)).toBe(true);
  });

  it("sanitizes poison version-1 blob instead of throwing", async () => {
    localStorage.setItem(
      "island_save_v1",
      JSON.stringify({
        version: "1",
        inventory: null,
        discovered: null,
        questStatus: [],
      }),
    );
    const save = await loadIslandSave();
    expect(save.discovered.islands).toContain(HARBOR_HAVEN_ID);
    expect(save.inventory).toEqual([]);
    expect(save.questStatus).toEqual({});
  });
});
