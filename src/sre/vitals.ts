/**
 * Core Web Vitals observers — latency + saturation proxies for SPA UX.
 * Feeds golden signals without blocking render.
 */

import { recordSreEvent } from "./telemetry";

export type VitalsState = {
  lcpMs?: number;
  cls?: number;
  inpMs?: number;
};

const vitals: VitalsState = {};

export function getVitals(): VitalsState {
  return { ...vitals };
}

function observe(type: string, cb: (entry: PerformanceEntry) => void): void {
  try {
    if (typeof PerformanceObserver === "undefined") return;
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) cb(entry);
    });
    po.observe({ type, buffered: true } as PerformanceObserverInit);
  } catch {
    /* unsupported entry type */
  }
}

export function startVitalsObservers(): void {
  observe("largest-contentful-paint", (entry) => {
    const ms = Math.round(entry.startTime);
    vitals.lcpMs = ms;
    recordSreEvent({
      signal: "latency",
      name: "web_vital.lcp",
      severity: ms > 4000 ? "warn" : ms > 2500 ? "info" : "info",
      value: ms,
      unit: "ms",
    });
  });

  observe("layout-shift", (entry) => {
    const e = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
    if (e.hadRecentInput) return;
    const v = e.value ?? 0;
    vitals.cls = (vitals.cls ?? 0) + v;
    if (vitals.cls > 0.1) {
      recordSreEvent({
        signal: "saturation",
        name: "web_vital.cls",
        severity: vitals.cls > 0.25 ? "warn" : "info",
        value: Number(vitals.cls.toFixed(3)),
      });
    }
  });

  observe("event", (entry) => {
    const e = entry as PerformanceEntry & { duration?: number; name?: string };
    const dur = e.duration ?? 0;
    if (dur <= 0) return;
    // Approx INP: track worst interaction latency
    if (vitals.inpMs === undefined || dur > vitals.inpMs) {
      vitals.inpMs = Math.round(dur);
      if (dur > 200) {
        recordSreEvent({
          signal: "latency",
          name: "web_vital.inp",
          severity: dur > 500 ? "warn" : "info",
          value: vitals.inpMs,
          unit: "ms",
        });
      }
    }
  });

  // Saturation: device memory / concurrency hints
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) {
      recordSreEvent({
        signal: "saturation",
        name: "device.low_memory",
        severity: "info",
        value: nav.deviceMemory,
        unit: "GB",
      });
    }
  } catch {
    /* ignore */
  }
}
