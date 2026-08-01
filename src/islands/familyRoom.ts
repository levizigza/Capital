/**
 * Family Room — local-first social for households / classrooms.
 * No server: invite codes live in encrypted local storage; share via copy/paste JSON.
 * Never pay-to-win. Imports are Zod-validated + re-keyed (never trust foreign hostIds).
 * Wave 5: device-local myth lines name Harbor plaques (no multiplayer sync).
 */

import { loadCommunityLevels } from "./studio/communityStorage";
import type { VibeLevel } from "./studio/levelSchema";
import {
  parseFamilyRoomImport,
  FamilyRoomSchema,
  sanitizePlainText,
  safeJsonParse,
  secureGetItemSync,
  secureSetItemSync,
  secureRemoveItem,
} from "@/security";

const ROOM_KEY = "capital_family_room_v1";
const ROOMS_INDEX_KEY = "capital_family_rooms_index_v1";

export type FamilyMember = {
  id: string;
  name: string;
  joinedAt: string;
};

export type FamilyRoom = {
  code: string;
  name: string;
  createdAt: string;
  hostId: string;
  members: FamilyMember[];
  /** Community level ids pinned for this room */
  pinnedLevelIds: string[];
};

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[bytes[i]! % alphabet.length]!;
  }
  return out;
}

function loadIndex(): Record<string, FamilyRoom> {
  try {
    const raw = secureGetItemSync(ROOMS_INDEX_KEY);
    if (!raw) return {};
    const parsed = safeJsonParse<Record<string, unknown>>(raw, { maxBytes: 200_000 });
    const out: Record<string, FamilyRoom> = {};
    for (const [code, room] of Object.entries(parsed)) {
      const result = FamilyRoomSchema.safeParse(room);
      if (result.success) out[code] = result.data;
    }
    return out;
  } catch {
    return {};
  }
}

function saveIndex(index: Record<string, FamilyRoom>): void {
  secureSetItemSync(ROOMS_INDEX_KEY, JSON.stringify(index));
}

export function getActiveFamilyRoom(): FamilyRoom | null {
  try {
    const code = secureGetItemSync(ROOM_KEY);
    if (!code) return null;
    return loadIndex()[code] ?? null;
  } catch {
    return null;
  }
}

export function setActiveFamilyRoom(code: string | null): void {
  if (!code) secureRemoveItem(ROOM_KEY);
  else secureSetItemSync(ROOM_KEY, code);
}

export function createFamilyRoom(name: string, hostName: string): FamilyRoom {
  const code = randomCode();
  const hostId = `m_${Date.now().toString(36)}`;
  const room: FamilyRoom = {
    code,
    name: sanitizePlainText(name, 80) || "Family Harbor",
    createdAt: new Date().toISOString(),
    hostId,
    members: [
      {
        id: hostId,
        name: sanitizePlainText(hostName, 64) || "Host",
        joinedAt: new Date().toISOString(),
      },
    ],
    pinnedLevelIds: [],
  };
  const index = loadIndex();
  index[code] = room;
  saveIndex(index);
  setActiveFamilyRoom(code);
  return room;
}

export function joinFamilyRoom(code: string, memberName: string): FamilyRoom | null {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(normalized)) return null;
  const index = loadIndex();
  const room = index[normalized];
  if (!room) return null;
  const name = sanitizePlainText(memberName, 64) || "Voyager";
  if (!room.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
    if (room.members.length >= 32) return room;
    room.members.push({
      id: `m_${Date.now().toString(36)}`,
      name,
      joinedAt: new Date().toISOString(),
    });
    index[normalized] = room;
    saveIndex(index);
  }
  setActiveFamilyRoom(normalized);
  return room;
}

export function leaveFamilyRoom(): void {
  setActiveFamilyRoom(null);
}

export function pinLevelToRoom(levelId: string): FamilyRoom | null {
  const room = getActiveFamilyRoom();
  if (!room) return null;
  const safeId = sanitizePlainText(levelId, 128);
  if (!safeId) return room;
  if (!room.pinnedLevelIds.includes(safeId)) {
    room.pinnedLevelIds = [...room.pinnedLevelIds, safeId].slice(-30);
    const index = loadIndex();
    index[room.code] = room;
    saveIndex(index);
  }
  return room;
}

export function roomPinnedLevels(room: FamilyRoom): VibeLevel[] {
  const all = loadCommunityLevels();
  return room.pinnedLevelIds
    .map((id) => all.find((l) => l.id === id))
    .filter((l): l is VibeLevel => Boolean(l));
}

/** Export room for another device / parent paste. */
export function exportFamilyRoomJson(room: FamilyRoom): string {
  return JSON.stringify(FamilyRoomSchema.parse(room), null, 2);
}

/** Import a shared room JSON onto this device (validated + re-keyed). */
export function importFamilyRoomJson(text: string): FamilyRoom {
  const raw = safeJsonParse(text, { maxBytes: 100_000 });
  const room = parseFamilyRoomImport(raw);
  const index = loadIndex();
  index[room.code] = room;
  saveIndex(index);
  setActiveFamilyRoom(room.code);
  return room;
}

/**
 * Local myth line for Family Room — names a Harbor plaque without inventing multiplayer sync.
 * Wave 7 — organ word so cold retell stays true at home.
 */
export function familyPlaqueMythLine(
  scarLabel: string | null | undefined,
  organId?: import("./moneyOrgans").MoneyOrganId | null,
): string | null {
  const label = (scarLabel ?? "").trim();
  if (!label) return null;
  const organ =
    organId === "coin"
      ? "Coin"
      : organId === "clock"
        ? "Clock"
        : organId === "spiral"
          ? "Spiral"
          : "Memory";
  const habit =
    organId === "clock"
      ? "still stamps about"
      : organId === "spiral"
        ? "still weighs"
        : organId === "memory"
          ? "still names"
          : "still tips jars about";
  return `This household ${habit} the ${organ} — “${label}.” Local myth — the Plinth remembered, and so do you.`;
}
