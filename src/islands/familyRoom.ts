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
import type { MoneyOrganId } from "./moneyOrgans";
import { organVerbChip } from "./worldMemory";

const ROOM_KEY = "capital_family_room_v1";
const ROOMS_INDEX_KEY = "capital_family_rooms_index_v1";

export type FamilyMember = {
  id: string;
  name: string;
  joinedAt: string;
};

export type FamilyChallengeKind =
  | "studio_clear"
  | "freedom_seal"
  | "cove_take"
  | "digression_pair";

export type FamilyChallenge = {
  id: string;
  authorName: string;
  kind: FamilyChallengeKind;
  targetLabel: string;
  targetLevelId?: string;
  createdAt: string;
  completions: Array<{ name: string; at: string }>;
};

export type FamilyWitnessReaction = "cheer" | "caution" | "curious";

export type FamilyWitness = {
  witnessName: string;
  reaction: FamilyWitnessReaction;
  scarLabel: string;
  at: string;
};

export type FamilyRoom = {
  code: string;
  name: string;
  createdAt: string;
  hostId: string;
  members: FamilyMember[];
  /** Community level ids pinned for this room */
  pinnedLevelIds: string[];
  /** One active human-authored household goal (no ranking). */
  challenge?: FamilyChallenge | null;
  /** Soft share reactions — observation, not power. */
  witnesses?: FamilyWitness[];
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
    challenge: null,
    witnesses: [],
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
 * Local myth line for Family Room — same cold-retell mythology as Harbor
 * (suit verb + plaque). Never invents a second habit cosmos at home.
 */
/** Infer spine organ from plaque label when Family Room has no live organ id. */
function organFromPlaqueLabel(label: string): MoneyOrganId {
  const l = label.toLowerCase();
  if (l.includes("umbrella") || l.includes("glitter")) return "clock";
  if (l.includes("spiral") || l.includes("haste")) return "spiral";
  if (l.includes("jar") || l.includes("treat") || l.includes("coin")) return "coin";
  return "memory";
}

export function familyPlaqueMythLine(
  scarLabel: string | null | undefined,
  organId?: MoneyOrganId | null,
): string | null {
  const label = (scarLabel ?? "").trim();
  if (!label) return null;
  const organ: MoneyOrganId =
    organId === "coin" || organId === "clock" || organId === "spiral" || organId === "memory"
      ? organId
      : organFromPlaqueLabel(label);
  return `The ${organVerbChip(organ)} — Harbor remembered: “${label}.” Local myth — and so do you.`;
}

function persistRoom(room: FamilyRoom): FamilyRoom {
  const index = loadIndex();
  index[room.code] = room;
  saveIndex(index);
  return room;
}

export const FAMILY_CHALLENGE_KIND_LABEL: Record<FamilyChallengeKind, string> = {
  studio_clear: "Clear a pinned Studio voyage",
  freedom_seal: "Earn the Freedom Seal",
  cove_take: "Finish a spine Take (Cove or Paycheck)",
  digression_pair: "Fill a digression myth-shelf pair together",
};

/** Replace the single active challenge — human sets what matters; no ladder. */
export function postFamilyChallenge(opts: {
  authorName: string;
  kind: FamilyChallengeKind;
  targetLabel?: string;
  targetLevelId?: string;
}): FamilyRoom | null {
  const room = getActiveFamilyRoom();
  if (!room) return null;
  const authorName = sanitizePlainText(opts.authorName, 64) || "Host";
  const targetLabel =
    sanitizePlainText(opts.targetLabel, 120) || FAMILY_CHALLENGE_KIND_LABEL[opts.kind];
  const challenge: FamilyChallenge = {
    id: `ch_${Date.now().toString(36)}`,
    authorName,
    kind: opts.kind,
    targetLabel,
    targetLevelId: opts.targetLevelId
      ? sanitizePlainText(opts.targetLevelId, 128) || undefined
      : undefined,
    createdAt: new Date().toISOString(),
    completions: [],
  };
  return persistRoom({ ...room, challenge });
}

export function clearFamilyChallenge(): FamilyRoom | null {
  const room = getActiveFamilyRoom();
  if (!room) return null;
  return persistRoom({ ...room, challenge: null });
}

/** Voluntary complete — unique by name; never ranks members. */
export function completeFamilyChallenge(memberName: string): FamilyRoom | null {
  const room = getActiveFamilyRoom();
  if (!room?.challenge) return null;
  const name = sanitizePlainText(memberName, 64) || "Voyager";
  const existing = room.challenge.completions;
  if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return room;
  }
  if (existing.length >= 32) return room;
  const challenge: FamilyChallenge = {
    ...room.challenge,
    completions: [...existing, { name, at: new Date().toISOString() }],
  };
  return persistRoom({ ...room, challenge });
}

export const WITNESS_REACTION_LABEL: Record<FamilyWitnessReaction, string> = {
  cheer: "Cheered the Take",
  caution: "Urged caution",
  curious: "Asked what happens next",
};

/** Inbound human judgment on a share — soft myth only. */
export function recordShareWitness(opts: {
  witnessName: string;
  reaction: FamilyWitnessReaction;
  scarLabel: string;
}): FamilyRoom | null {
  const room = getActiveFamilyRoom();
  if (!room) return null;
  const witness: FamilyWitness = {
    witnessName: sanitizePlainText(opts.witnessName, 64) || "Witness",
    reaction: opts.reaction,
    scarLabel: sanitizePlainText(opts.scarLabel, 120) || "a Take",
    at: new Date().toISOString(),
  };
  const witnesses = [witness, ...(room.witnesses ?? [])].slice(0, 24);
  return persistRoom({ ...room, witnesses });
}

export function familyWitnessMythLine(witness: FamilyWitness | null | undefined): string | null {
  if (!witness) return null;
  return `${witness.witnessName} ${WITNESS_REACTION_LABEL[witness.reaction].toLowerCase()} on “${witness.scarLabel}.”`;
}

export function familyChallengeBlurb(challenge: FamilyChallenge | null | undefined): string | null {
  if (!challenge) return null;
  const n = challenge.completions.length;
  return `${challenge.authorName} set: ${challenge.targetLabel} — ${n} household clear${n === 1 ? "" : "s"} (no ranking).`;
}

/**
 * Pattern #82 — digression_pair challenges auto-clear when a household member
 * fills a myth-shelf scar (shared local coop without a fake backend).
 */
export function maybeCompleteDigressionPairChallenge(
  memberName: string,
  filledDigressionCount: number,
): FamilyRoom | null {
  const room = getActiveFamilyRoom();
  if (!room?.challenge || room.challenge.kind !== "digression_pair") return null;
  if (filledDigressionCount < 1) return null;
  return completeFamilyChallenge(memberName);
}
