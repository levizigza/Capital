import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  createFamilyRoom,
  exportFamilyRoomJson,
  familyPlaqueMythLine,
  getActiveFamilyRoom,
  importFamilyRoomJson,
  joinFamilyRoom,
  leaveFamilyRoom,
  pinLevelToRoom,
} from "./familyRoom";

describe("familyRoom", () => {
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates, joins, exports, and imports a room", () => {
    const room = createFamilyRoom("Test Harbor", "Sam");
    expect(room.code).toHaveLength(6);
    expect(getActiveFamilyRoom()?.code).toBe(room.code);

    const json = exportFamilyRoomJson(room);
    leaveFamilyRoom();
    expect(getActiveFamilyRoom()).toBeNull();

    const imported = importFamilyRoomJson(json);
    expect(imported.code).toBe(room.code);
    expect(imported.hostId).not.toBe(room.hostId);

    const joined = joinFamilyRoom(room.code, "Alex");
    expect(joined?.members.some((m) => m.name === "Alex")).toBe(true);

    pinLevelToRoom("lvl_demo");
    expect(getActiveFamilyRoom()?.pinnedLevelIds).toContain("lvl_demo");
  });

  it("rejects prototype-polluting family JSON", () => {
    expect(() =>
      importFamilyRoomJson('{"__proto__":{"admin":true},"code":"ABCDEF","members":[]}'),
    ).toThrow();
  });

  it("names a plaque with Harbor cold-retell mythology (suit verb)", () => {
    expect(familyPlaqueMythLine("Jar before treat")).toMatch(/Jar before treat/);
    expect(familyPlaqueMythLine("Jar before treat")).toMatch(/Local myth/i);
    expect(familyPlaqueMythLine("Jar before treat", "coin")).toMatch(/Coin holds/);
    expect(familyPlaqueMythLine("Jar before treat", "coin")).toMatch(/Harbor remembered/);
    expect(familyPlaqueMythLine("Umbrella", "clock")).toMatch(/Clock shelters/);
    expect(familyPlaqueMythLine("Waited the spiral", "spiral")).toMatch(/Spiral withstands/);
    expect(familyPlaqueMythLine(null)).toBeNull();
    expect(familyPlaqueMythLine("  ")).toBeNull();
  });
});
