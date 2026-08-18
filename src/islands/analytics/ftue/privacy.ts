import { FTUE_PAYLOAD_ALLOWLIST } from "./types";

const MAX_STRING_LEN = 64;
const TAXONOMY_ID = /^[a-z0-9][a-z0-9_.:-]{0,63}$/i;

/** Keys that must never leave the client in FTUE payloads. */
const BLOCKED_KEYS = new Set([
  "name",
  "characterName",
  "playerName",
  "email",
  "userId",
  "user_id",
  "text",
  "body",
  "message",
  "dialogue",
  "choiceText",
  "label",
  "description",
  "coach",
  "instruction",
]);

/**
 * Privacy sanitize: allowlist keys, drop PII/freeform, clamp taxonomy ids.
 * Returns a flat Record safe for local analytics export.
 */
export function sanitizeFtuePayload(
  raw: Record<string, unknown> | undefined | null,
): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (BLOCKED_KEYS.has(key)) continue;
    if (!FTUE_PAYLOAD_ALLOWLIST.has(key)) continue;
    const cleaned = sanitizeValue(key, value);
    if (cleaned !== undefined) out[key] = cleaned;
  }
  return out;
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined;
    return Math.round(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim().slice(0, MAX_STRING_LEN);
    if (!trimmed) return undefined;
    // Taxonomy-ish keys must match id pattern; opaque enums (platform, mode) are short.
    if (
      key.endsWith("Id") ||
      key === "concept_id" ||
      key === "questId" ||
      key === "minigameId" ||
      key === "islandId" ||
      key === "organId" ||
      key === "scenarioId" ||
      key === "choiceId" ||
      key === "graphId" ||
      key === "nodeId" ||
      key === "npcId" ||
      key === "gateId" ||
      key === "sessionId"
    ) {
      return TAXONOMY_ID.test(trimmed) ? trimmed : undefined;
    }
    if (trimmed.length > MAX_STRING_LEN) return trimmed.slice(0, MAX_STRING_LEN);
    return trimmed;
  }
  return undefined;
}

export function assertNoPiiInPayload(payload: Record<string, unknown>): boolean {
  for (const key of Object.keys(payload)) {
    if (BLOCKED_KEYS.has(key)) return false;
    if (!FTUE_PAYLOAD_ALLOWLIST.has(key)) return false;
  }
  return true;
}
