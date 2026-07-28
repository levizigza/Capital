/**
 * Bootstrap SRE: global handlers, vitals, kill switches, health probe.
 * Call once from main.tsx before React mount.
 */

import { loadPersistedKillSwitches, isKilled } from "./flags";
import { loadSreRingFromStorage, recordSreEvent, flushBeacon, markJourney } from "./telemetry";
import { startVitalsObservers } from "./vitals";
import { exposeHealthGlobal, getBuildId } from "./health";

let booted = false;
let bootStartedAt = 0;

export function bootstrapSre(): void {
  if (booted) return;
  booted = true;
  bootStartedAt = performance.now();

  loadPersistedKillSwitches();
  loadSreRingFromStorage();
  exposeHealthGlobal();
  startVitalsObservers();

  recordSreEvent({
    signal: "traffic",
    name: "session.start",
    severity: "info",
    tags: { buildId: getBuildId() },
  });

  window.addEventListener("error", (ev) => {
    recordSreEvent({
      signal: "errors",
      name: "window.error",
      severity: "error",
      context: ev.filename ?? "unknown",
      tags: {
        message: String(ev.message ?? "").slice(0, 200),
        line: ev.lineno ?? 0,
      },
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : "rejection";
    recordSreEvent({
      signal: "errors",
      name: "unhandledrejection",
      severity: "error",
      tags: { message: message.slice(0, 200) },
    });
  });

  window.addEventListener("online", () => {
    recordSreEvent({ signal: "traffic", name: "network.online", severity: "info" });
  });
  window.addEventListener("offline", () => {
    recordSreEvent({
      signal: "saturation",
      name: "network.offline",
      severity: "warn",
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void flushBeacon();
    }
  });

  // Mark first paint / app ready shortly after
  requestAnimationFrame(() => {
    const ms = Math.round(performance.now() - bootStartedAt);
    markJourney("app_boot", true, ms);
  });
}

export function reportReactError(error: Error, info?: string): void {
  recordSreEvent({
    signal: "errors",
    name: "react.boundary",
    severity: "critical",
    tags: {
      message: error.message.slice(0, 200),
      info: (info ?? "").slice(0, 200),
    },
  });
}

export function reportHarborReady(): void {
  const ms = Math.round(performance.now() - (bootStartedAt || performance.now()));
  markJourney("harbor_ready", true, ms);
}

export function shouldSkipServiceWorker(): boolean {
  return isKilled("serviceWorker");
}

export { isKilled, markJourney, recordSreEvent, flushBeacon };
