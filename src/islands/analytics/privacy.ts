/**
 * Privacy rules for Islands gameplay telemetry.
 * Local-first (`island_analytics_v1`). Never attach PII or free-text narrative.
 */

/** Keys that must never appear in analytics payloads. */
export const ANALYTICS_BANNED_KEYS = [
  "name",
  "displayName",
  "playerName",
  "characterName",
  "email",
  "parentEmail",
  "phone",
  "address",
  "freeText",
  "message",
  "label",
  "title",
  "body",
  "text",
  "speaker",
  "rumor",
  "familyMemberName",
  "roomName",
  "hostName",
  "author",
  "ip",
  "userAgent",
] as const;

const BANNED = new Set<string>(ANALYTICS_BANNED_KEYS);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

/** Deep-scrub banned keys; keep ids, enums, numbers, booleans. */
export function scrubAnalyticsPayload(
  payload: Record<string, unknown> | undefined | null,
): Record<string, unknown> {
  if (!payload) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (BANNED.has(key)) continue;
    if (value == null) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = value
        .map((item) =>
          isPlainObject(item)
            ? scrubAnalyticsPayload(item)
            : typeof item === "string" || typeof item === "number" || typeof item === "boolean"
              ? item
              : null,
        )
        .filter((x) => x != null);
      continue;
    }
    if (isPlainObject(value)) {
      out[key] = scrubAnalyticsPayload(value);
    }
  }
  return out;
}

export function assertNoBannedKeys(payload: Record<string, unknown>): string[] {
  const hits: string[] = [];
  const walk = (obj: Record<string, unknown>, path: string) => {
    for (const [k, v] of Object.entries(obj)) {
      const p = path ? `${path}.${k}` : k;
      if (BANNED.has(k)) hits.push(p);
      if (isPlainObject(v)) walk(v, p);
    }
  };
  walk(payload, "");
  return hits;
}
