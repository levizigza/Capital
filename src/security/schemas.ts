import { z } from "zod";
import { sanitizePlainText } from "./safeJson";

const isoDate = z
  .string()
  .max(40)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

export const FamilyMemberSchema = z
  .object({
    id: z.string().min(1).max(64),
    name: z.string().min(1).max(64),
    joinedAt: isoDate,
  })
  .strict();

export const FamilyChallengeCompletionSchema = z
  .object({
    name: z.string().min(1).max(64),
    at: isoDate,
  })
  .strict();

/** One active household goal — human-authored, voluntary completes (no ranking). */
export const FamilyChallengeSchema = z
  .object({
    id: z.string().min(1).max(64),
    authorName: z.string().min(1).max(64),
    kind: z.enum(["studio_clear", "freedom_seal", "cove_take"]),
    targetLabel: z.string().min(1).max(120),
    targetLevelId: z.string().min(1).max(128).optional(),
    createdAt: isoDate,
    completions: z.array(FamilyChallengeCompletionSchema).max(32).default([]),
  })
  .strict();

/** Soft inbound reaction to a Harbor Felt share — never edits ledger/scar. */
export const FamilyWitnessSchema = z
  .object({
    witnessName: z.string().min(1).max(64),
    reaction: z.enum(["cheer", "caution", "curious"]),
    scarLabel: z.string().min(1).max(120),
    at: isoDate,
  })
  .strict();

export const FamilyRoomSchema = z
  .object({
    code: z
      .string()
      .regex(/^[A-Z0-9]{6}$/, "Room code must be 6 alphanumeric chars"),
    name: z.string().min(1).max(80),
    createdAt: isoDate,
    hostId: z.string().min(1).max(64),
    members: z.array(FamilyMemberSchema).min(1).max(32),
    pinnedLevelIds: z.array(z.string().min(1).max(128)).max(30).default([]),
    challenge: FamilyChallengeSchema.nullable().optional(),
    witnesses: z.array(FamilyWitnessSchema).max(24).default([]),
  })
  .strict();

export type FamilyRoomParsed = z.infer<typeof FamilyRoomSchema>;

/** Normalize untrusted import into a safe FamilyRoom shape. */
export function parseFamilyRoomImport(raw: unknown): FamilyRoomParsed {
  const parsed = FamilyRoomSchema.parse(raw);
  return {
    ...parsed,
    code: parsed.code.toUpperCase(),
    name: sanitizePlainText(parsed.name, 80) || "Family Harbor",
    members: parsed.members.map((m, i) => ({
      id: `m_imp_${i}_${Math.random().toString(36).slice(2, 8)}`,
      name: sanitizePlainText(m.name, 64) || "Voyager",
      joinedAt: new Date().toISOString(),
    })),
    hostId: `m_imp_host_${Math.random().toString(36).slice(2, 10)}`,
    pinnedLevelIds: parsed.pinnedLevelIds.slice(0, 30),
    challenge: parsed.challenge
      ? {
          ...parsed.challenge,
          authorName: sanitizePlainText(parsed.challenge.authorName, 64) || "Host",
          targetLabel: sanitizePlainText(parsed.challenge.targetLabel, 120) || "Household goal",
          targetLevelId: parsed.challenge.targetLevelId
            ? sanitizePlainText(parsed.challenge.targetLevelId, 128) || undefined
            : undefined,
          completions: parsed.challenge.completions.map((c) => ({
            name: sanitizePlainText(c.name, 64) || "Voyager",
            at: new Date().toISOString(),
          })),
        }
      : null,
    witnesses: (parsed.witnesses ?? []).slice(0, 24).map((w) => ({
      witnessName: sanitizePlainText(w.witnessName, 64) || "Witness",
      reaction: w.reaction,
      scarLabel: sanitizePlainText(w.scarLabel, 120) || "a Take",
      at: w.at,
    })),
  };
}

/** Backup / progress export envelope — only known keys. */
export const ProgressBackupSchema = z
  .object({
    version: z.string().min(1).max(32),
    timestamp: z.string().min(1).max(64),
    lastSaved: z.string().max(64).optional(),
    userProfile: z.unknown().nullable().optional(),
    gameScores: z.array(z.unknown()).max(500).optional(),
    accessibilitySettings: z.unknown().nullable().optional(),
    bankingData: z.unknown().nullable().optional(),
  })
  .strict();
