/**
 * Family Room — local-first social for households / classrooms.
 * No server: invite codes live in localStorage; share via copy/paste JSON.
 * Never pay-to-win.
 */

import { loadCommunityLevels } from "./studio/communityStorage";
import type { VibeLevel } from "./studio/levelSchema";

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
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]!;
  }
  return out;
}

function loadIndex(): Record<string, FamilyRoom> {
  try {
    const raw = localStorage.getItem(ROOMS_INDEX_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, FamilyRoom>;
  } catch {
    return {};
  }
}

function saveIndex(index: Record<string, FamilyRoom>): void {
  localStorage.setItem(ROOMS_INDEX_KEY, JSON.stringify(index));
}

export function getActiveFamilyRoom(): FamilyRoom | null {
  try {
    const code = localStorage.getItem(ROOM_KEY);
    if (!code) return null;
    return loadIndex()[code] ?? null;
  } catch {
    return null;
  }
}

export function setActiveFamilyRoom(code: string | null): void {
  if (!code) localStorage.removeItem(ROOM_KEY);
  else localStorage.setItem(ROOM_KEY, code);
}

export function createFamilyRoom(name: string, hostName: string): FamilyRoom {
  const code = randomCode();
  const hostId = `m_${Date.now().toString(36)}`;
  const room: FamilyRoom = {
    code,
    name: name.trim() || "Family Harbor",
    createdAt: new Date().toISOString(),
    hostId,
    members: [
      {
        id: hostId,
        name: hostName.trim() || "Host",
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
  const index = loadIndex();
  const room = index[normalized];
  if (!room) return null;
  const name = memberName.trim() || "Voyager";
  if (!room.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
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
  if (!room.pinnedLevelIds.includes(levelId)) {
    room.pinnedLevelIds = [...room.pinnedLevelIds, levelId].slice(-30);
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
  return JSON.stringify(room, null, 2);
}

/** Import a shared room JSON onto this device. */
export function importFamilyRoomJson(text: string): FamilyRoom {
  const room = JSON.parse(text) as FamilyRoom;
  if (!room?.code || !Array.isArray(room.members)) {
    throw new Error("Invalid family room JSON");
  }
  const index = loadIndex();
  index[room.code] = room;
  saveIndex(index);
  setActiveFamilyRoom(room.code);
  return room;
}
