import { SRE_DEFAULTS, type SreEvent } from "./types";
import { isKilled, SRE_DEBUG, TELEMETRY_URL } from "./flags";

const STORAGE_KEY = "capital_sre_events_v1";

let ring: SreEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let sessionErrorCount = 0;
let sessionOk = true;

function uid(): string {
  return `sre_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function persistLocal(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ring.slice(-SRE_DEFAULTS.ringBufferMax)));
  } catch {
    /* quota — drop oldest */
    ring = ring.slice(-Math.floor(SRE_DEFAULTS.ringBufferMax / 2));
  }
}

export function loadSreRingFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as SreEvent[];
    if (Array.isArray(parsed)) ring = parsed.slice(-SRE_DEFAULTS.ringBufferMax);
  } catch {
    ring = [];
  }
}

/** Test-only: reset session counters and ring. */
export function resetSreSessionForTests(): void {
  ring = [];
  sessionErrorCount = 0;
  sessionOk = true;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getSreEvents(): SreEvent[] {
  return [...ring];
}

export function sessionIsErrorFree(): boolean {
  return sessionOk;
}

export function getSessionErrorCount(): number {
  return sessionErrorCount;
}

/** Record a golden-signal event. Safe to call from any thread of UX. */
export function recordSreEvent(
  partial: Omit<SreEvent, "id" | "ts"> & { id?: string; ts?: string },
): void {
  if (isKilled("telemetry") && partial.signal !== "errors") return;

  const event: SreEvent = {
    id: partial.id ?? uid(),
    ts: partial.ts ?? new Date().toISOString(),
    signal: partial.signal,
    name: partial.name,
    severity: partial.severity,
    value: partial.value,
    unit: partial.unit,
    context: partial.context,
    tags: {
      ...partial.tags,
      release: import.meta.env.VITE_BUILD_ID ?? "dev",
    },
  };

  if (event.signal === "errors" && (event.severity === "error" || event.severity === "critical")) {
    sessionErrorCount += 1;
    sessionOk = false;
  }

  if (
    event.signal === "traffic" &&
    Math.random() > SRE_DEFAULTS.trafficSampleRate &&
    event.severity === "info"
  ) {
    // Capacity: sample noisy traffic locally too when volume grows
    if (!SRE_DEBUG) return;
  }

  ring.push(event);
  if (ring.length > SRE_DEFAULTS.ringBufferMax) {
    ring = ring.slice(-SRE_DEFAULTS.ringBufferMax);
  }
  persistLocal();

  if (SRE_DEBUG) {
    try {
      console.info("[sre]", event.signal, event.name, event.value ?? "", event.tags ?? {});
    } catch {
      /* ignore */
    }
  }

  scheduleBeaconFlush();
}

function scheduleBeaconFlush(): void {
  if (!TELEMETRY_URL || isKilled("telemetry")) return;
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushBeacon();
  }, 4000);
}

/** Flush to remote — designed for a future collector (OTel / custom). */
export async function flushBeacon(): Promise<void> {
  if (!TELEMETRY_URL || isKilled("telemetry")) return;
  const batch = ring.slice(-SRE_DEFAULTS.beaconBatchSize);
  if (batch.length === 0) return;
  try {
    const body = JSON.stringify({
      service: "capital",
      env: import.meta.env.MODE,
      events: batch,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TELEMETRY_URL, body);
    } else {
      await fetch(TELEMETRY_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* never break UX for telemetry */
  }
}

export function markJourney(name: string, ok: boolean, latencyMs?: number): void {
  recordSreEvent({
    signal: ok ? "traffic" : "errors",
    name: `journey.${name}`,
    severity: ok ? "info" : "error",
    value: latencyMs,
    unit: latencyMs !== undefined ? "ms" : undefined,
    context: name,
  });
  if (latencyMs !== undefined) {
    recordSreEvent({
      signal: "latency",
      name: `journey.${name}.latency`,
      severity: latencyMs > 4000 ? "warn" : "info",
      value: latencyMs,
      unit: "ms",
      context: name,
    });
  }
}
