/**
 * Capital SRE — Site Reliability Engineering foundation.
 *
 * Grounded in Google SRE golden signals (latency, traffic, errors, saturation)
 * and frontend SLIs: error-free sessions, critical journey success, Core Web Vitals.
 *
 * Designed for today's GitHub Pages SPA and tomorrow's multi-region / API growth:
 * - Local ring buffer always works offline
 * - Optional remote beacon via VITE_TELEMETRY_URL (batch + sample for capacity)
 * - Kill switches for graceful degradation under saturation
 */

export type GoldenSignal = "latency" | "traffic" | "errors" | "saturation";

export type SreSeverity = "info" | "warn" | "error" | "critical";

export type SreEvent = {
  id: string;
  ts: string;
  signal: GoldenSignal;
  name: string;
  severity: SreSeverity;
  value?: number;
  unit?: string;
  /** Route / screen / journey id */
  context?: string;
  tags?: Record<string, string | number | boolean>;
};

export type ClientHealthSnapshot = {
  status: "ok" | "degraded" | "down";
  version: string;
  buildId: string;
  online: boolean;
  swControlled: boolean;
  errorFreeSession: boolean;
  budgetBurnPct: number;
  vitals: {
    lcpMs?: number;
    cls?: number;
    inpMs?: number;
  };
  killSwitches: Record<string, boolean>;
  checkedAt: string;
};

/** Rolling SLO window defaults (session-scoped until remote pipeline exists). */
export const SRE_DEFAULTS = {
  /** Target: 99% of sessions error-free (uncaught JS). */
  errorFreeSessionSlo: 0.99,
  /** Target: Harbor enter → interactive within 4s for 95% of boots. */
  harborBootP95Ms: 4000,
  /** Max events kept locally for export / debug. */
  ringBufferMax: 400,
  /** Remote batch size — keeps beacon cheap as traffic grows. */
  beaconBatchSize: 25,
  /** Sample rate for high-cardinality traffic events (0–1). */
  trafficSampleRate: 0.25,
} as const;
