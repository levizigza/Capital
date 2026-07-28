import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { safeJsonParse, SafeJsonError, sanitizePlainText } from "./safeJson";
import { parseFamilyRoomImport, ProgressBackupSchema } from "./schemas";
import { FamilyRoomSchema } from "./schemas";

describe("safeJson", () => {
  it("rejects prototype pollution keys", () => {
    expect(() =>
      safeJsonParse('{"__proto__":{"admin":true},"code":"ABCDEF"}'),
    ).toThrow(SafeJsonError);
  });

  it("rejects oversized payloads", () => {
    expect(() => safeJsonParse('{"a":"x"}', { maxBytes: 5 })).toThrow(SafeJsonError);
  });

  it("sanitizes plain text", () => {
    expect(sanitizePlainText('<script>x</script>Sam')).toBe("scriptx/scriptSam");
  });
});

describe("family room schema", () => {
  it("re-keys imported rooms", () => {
    const raw = {
      code: "ABCDEF",
      name: "Home",
      createdAt: new Date().toISOString(),
      hostId: "evil_host",
      members: [
        { id: "evil", name: "Sam", joinedAt: new Date().toISOString() },
      ],
      pinnedLevelIds: ["lvl_1"],
    };
    const room = parseFamilyRoomImport(raw);
    expect(room.hostId).not.toBe("evil_host");
    expect(room.members[0]?.id).not.toBe("evil");
    expect(FamilyRoomSchema.safeParse(room).success).toBe(true);
  });

  it("rejects invalid progress backups with unknown keys", () => {
    const bad = {
      version: "1",
      timestamp: "now",
      hacker: true,
    };
    expect(ProgressBackupSchema.safeParse(bad).success).toBe(false);
  });
});

describe("secure store sync without vault", () => {
  beforeEach(async () => {
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
      get length() {
        return store.size;
      },
      key: (i: number) => [...store.keys()][i] ?? null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes and reads family index via sync helpers", async () => {
    const { secureSetItemSync, secureGetItemSync } = await import("./secureStore");
    secureSetItemSync("capital_family_room_v1", "ABCDEF");
    expect(secureGetItemSync("capital_family_room_v1")).toBe("ABCDEF");
  });
});
