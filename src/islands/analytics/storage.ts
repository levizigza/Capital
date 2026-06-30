import type { AnalyticsEvent } from "../types";

export const ANALYTICS_KV_KEY = "island_analytics_v1";
export const MAX_STORED_EVENTS = 2_000;

export async function loadAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    const events = await window.spark.kv.get<AnalyticsEvent[]>(ANALYTICS_KV_KEY);
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export async function appendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const existing = await loadAnalyticsEvents();
  const next = [...existing, event].slice(-MAX_STORED_EVENTS);
  await window.spark.kv.set(ANALYTICS_KV_KEY, next);
}

export async function clearAnalyticsEvents(): Promise<void> {
  await window.spark.kv.set(ANALYTICS_KV_KEY, []);
}

export function eventsToCsv(events: AnalyticsEvent[]): string {
  const header = "id,ts,name,sessionId,elapsedMs,screen,payload";
  const rows = events.map((e) => {
    const p = e.payload ?? {};
    const sessionId = String(p.sessionId ?? "");
    const elapsedMs = String(p.elapsedMs ?? "");
    const screen = String(p.screen ?? "");
    const payloadJson = JSON.stringify(p).replace(/"/g, '""');
    return [
      e.id,
      e.ts,
      e.name,
      sessionId,
      elapsedMs,
      screen,
      `"${payloadJson}"`,
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
