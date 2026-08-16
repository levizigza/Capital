import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  createFamilyRoom,
  exportFamilyRoomJson,
  familyPlaqueMythLine,
  familyChallengeBlurb,
  familyWitnessMythLine,
  getActiveFamilyRoom,
  importFamilyRoomJson,
  joinFamilyRoom,
  leaveFamilyRoom,
  pinLevelToRoom,
  postFamilyChallenge,
  completeFamilyChallenge,
  clearFamilyChallenge,
  recordShareWitness,
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
    // Label alone still names Coin (not a silent Memory default).
    expect(familyPlaqueMythLine("Jar before treat")).toMatch(/Coin holds/);
    expect(familyPlaqueMythLine("Jar before treat", "coin")).toMatch(/Coin holds/);
    expect(familyPlaqueMythLine("Jar before treat", "coin")).toMatch(/Harbor remembered/);
    expect(familyPlaqueMythLine("Umbrella before glitter")).toMatch(/Clock shelters/);
    expect(familyPlaqueMythLine("Umbrella", "clock")).toMatch(/Clock shelters/);
    expect(familyPlaqueMythLine("Waited the spiral")).toMatch(/Spiral withstands/);
    expect(familyPlaqueMythLine("Waited the spiral", "spiral")).toMatch(/Spiral withstands/);
    expect(familyPlaqueMythLine(null)).toBeNull();
    expect(familyPlaqueMythLine("  ")).toBeNull();
  });

  it("posts one household challenge with voluntary unique completes — no ranking", () => {
    createFamilyRoom("Challenge Harbor", "Sam");
    const posted = postFamilyChallenge({
      authorName: "Sam",
      kind: "cove_take",
    });
    expect(posted?.challenge?.kind).toBe("cove_take");
    expect(familyChallengeBlurb(posted?.challenge)).toMatch(/Sam set/);

    completeFamilyChallenge("Alex");
    completeFamilyChallenge("Alex"); // idempotent
    const room = getActiveFamilyRoom();
    expect(room?.challenge?.completions).toHaveLength(1);
    expect(room?.challenge?.completions[0]?.name).toBe("Alex");

    clearFamilyChallenge();
    expect(getActiveFamilyRoom()?.challenge).toBeNull();
  });

  it("records share witnesses as soft myth without power tools", () => {
    createFamilyRoom("Witness Harbor", "Sam");
    const room = recordShareWitness({
      witnessName: "Parent",
      reaction: "caution",
      scarLabel: "Jar before treat",
    });
    expect(room?.witnesses?.[0]?.reaction).toBe("caution");
    expect(familyWitnessMythLine(room?.witnesses?.[0])).toMatch(/Parent/);
    expect(familyWitnessMythLine(room?.witnesses?.[0])).toMatch(/caution/i);
  });
});
