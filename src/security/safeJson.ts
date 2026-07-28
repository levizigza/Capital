/**
 * Safe JSON — reject prototype pollution and oversized payloads.
 */

const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export class SafeJsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeJsonError";
  }
}

export type SafeParseOptions = {
  maxBytes?: number;
  maxDepth?: number;
};

function assertSafeValue(value: unknown, depth: number, maxDepth: number): void {
  if (depth > maxDepth) {
    throw new SafeJsonError("JSON nesting too deep");
  }
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) assertSafeValue(item, depth + 1, maxDepth);
    return;
  }
  for (const key of Object.keys(value as object)) {
    if (DANGEROUS_KEYS.has(key)) {
      throw new SafeJsonError(`Forbidden JSON key: ${key}`);
    }
    assertSafeValue((value as Record<string, unknown>)[key], depth + 1, maxDepth);
  }
}

/** Parse JSON with size, depth, and prototype-pollution guards. */
export function safeJsonParse<T = unknown>(
  text: string,
  options: SafeParseOptions = {},
): T {
  const maxBytes = options.maxBytes ?? 512_000;
  const maxDepth = options.maxDepth ?? 32;
  if (typeof text !== "string") {
    throw new SafeJsonError("Expected string");
  }
  if (text.length > maxBytes) {
    throw new SafeJsonError(`Payload exceeds ${maxBytes} bytes`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new SafeJsonError("Malformed JSON");
  }
  assertSafeValue(parsed, 0, maxDepth);
  return parsed as T;
}

/** Strip HTML-ish content for display names / free text (not a full HTML sanitizer). */
export function sanitizePlainText(input: string, maxLength = 120): string {
  if (!input) return "";
  let out = "";
  const normalized = input.normalize("NFKC");
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    if (code < 32 || code === 127) continue;
    const ch = normalized[i]!;
    if (ch === "<" || ch === ">" || ch === "&" || ch === '"' || ch === "`" || ch === "'") continue;
    out += ch;
  }
  return out.trim().slice(0, maxLength);
}
