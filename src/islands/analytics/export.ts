import type { AnalyticsEvent } from "../types";

import type { FunnelAnalysis } from "./funnel";
import { analyzeFunnel } from "./funnel";
import { analyzeFtueMetrics, type FtueMetricsSnapshot } from "./ftue";

export const ANALYTICS_KV_KEY = "island_analytics_v1";
export const MAX_ANALYTICS_EVENTS = 2_000;

export async function loadAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    const data = await window.spark.kv.get<AnalyticsEvent[]>(ANALYTICS_KV_KEY);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function clearAnalyticsEvents(): Promise<void> {
  try {
    await window.spark.kv.set(ANALYTICS_KV_KEY, []);
  } catch {
    /* ignore */
  }
}

export function eventsToCsv(events: AnalyticsEvent[]): string {
  const headers = ["id", "ts", "name", "sessionId", "elapsedMs", "screen", "payload"];
  const rows = events.map((e) => [
    e.id,
    e.ts,
    e.name,
    String(e.payload?.sessionId ?? ""),
    String(e.payload?.elapsedMs ?? ""),
    String(e.payload?.screen ?? ""),
    JSON.stringify(e.payload ?? {}),
  ]);
  return [headers.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n");
}

function csvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function eventsToJson(
  events: AnalyticsEvent[],
  analysis: FunnelAnalysis,
  ftue?: FtueMetricsSnapshot,
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      eventCount: events.length,
      /** Primary FTUE KPIs — tutorial completion is secondary only. */
      ftueMetrics: ftue ?? analyzeFtueMetrics(events),
      primarySuccessNote:
        "Do not treat tutorial_completion_rate as the primary success metric. Prefer freeplay_conversion, independent_transfer_rate, failure_recovery_rate, and time_to_first_core_loop.",
      funnel: analysis,
      events,
    },
    null,
    2,
  );
}

export function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAnalyticsCsv(): Promise<void> {
  const events = await loadAnalyticsEvents();
  downloadText(eventsToCsv(events), `islands-analytics-${dateStamp()}.csv`, "text/csv");
}

export async function exportAnalyticsJson(): Promise<void> {
  const events = await loadAnalyticsEvents();
  const analysis = analyzeFunnel(events);
  const ftue = analyzeFtueMetrics(events);
  downloadText(
    eventsToJson(events, analysis, ftue),
    `islands-analytics-${dateStamp()}.json`,
    "application/json",
  );
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}
