import { useCallback, useEffect, useMemo, useState } from "react";

import { GameButton, GamePanel } from "@/game-ui";

import type { AnalyticsEvent } from "../types";
import { analyzeFunnel, FUNNEL_WINDOW_MS, type FunnelAnalysis } from "./funnel";
import {
  clearAnalyticsEvents,
  exportAnalyticsCsv,
  exportAnalyticsJson,
  loadAnalyticsEvents,
} from "./export";

function formatMs(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function FunnelChart({ analysis }: { analysis: FunnelAnalysis }) {
  const max = Math.max(...analysis.stages.map((s) => s.reached), 1);

  return (
    <div className="space-y-2">
      {analysis.stages.map((stage) => (
        <div key={stage.id} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-2 text-xs">
          <span className="truncate text-gray-600" title={stage.label}>
            {stage.label}
          </span>
          <div className="h-5 rounded bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded bg-blue-500 transition-all"
              style={{ width: `${(stage.reached / max) * 100}%` }}
            />
          </div>
          <span className="text-right font-mono font-semibold">{stage.reached}</span>
        </div>
      ))}
    </div>
  );
}

export type AnalyticsExportViewProps = {
  onClose?: () => void;
};

export default function AnalyticsExportView({ onClose }: AnalyticsExportViewProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadAnalyticsEvents();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const analysis = useMemo(() => analyzeFunnel(events), [events]);

  const quitSessions = useMemo(
    () => analysis.sessions.filter((s) => s.quitWithin5Min),
    [analysis.sessions],
  );

  return (
    <div className="space-y-4 max-h-[min(80dvh,720px)] overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black">📊 Analytics Export</h2>
          <p className="text-xs text-gray-500">
            First {formatMs(FUNNEL_WINDOW_MS)} funnel · {events.length} events ·{" "}
            {analysis.sessionsInWindow} sessions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GameButton size="sm" variant="outline" motionEnabled={false} onClick={() => void refresh()}>
            Refresh
          </GameButton>
          <GameButton size="sm" variant="outline" motionEnabled={false} onClick={() => void exportAnalyticsCsv()}>
            Export CSV
          </GameButton>
          <GameButton size="sm" variant="primary" motionEnabled={false} onClick={() => void exportAnalyticsJson()}>
            Export JSON
          </GameButton>
          {onClose ? (
            <GameButton size="sm" variant="ghost" motionEnabled={false} onClick={onClose}>
              Close
            </GameButton>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading events…</p>
      ) : events.length === 0 ? (
        <GamePanel title="No data yet">
          <p className="text-sm text-gray-600">
            Play through the islands hub, travel map, and a quest to populate analytics. Events are stored locally.
          </p>
        </GamePanel>
      ) : (
        <>
          <GamePanel title={`Onboarding funnel (first ${formatMs(FUNNEL_WINDOW_MS)})`}>
            <FunnelChart analysis={analysis} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {analysis.stages.map((s) => (
                <div key={s.id} className="rounded-lg bg-gray-50 px-2 py-1.5">
                  <div className="font-medium text-gray-700">{s.label}</div>
                  <div className="text-gray-500">
                    {s.conversionPct}% reach · {s.dropOffPct}% drop
                  </div>
                </div>
              ))}
            </div>
          </GamePanel>

          <GamePanel title="Where players quit (screen_exit)">
            {analysis.dropOffPoints.length === 0 ? (
              <p className="text-sm text-gray-500">No screen exits recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-2 pr-2">Screen</th>
                      <th className="py-2 pr-2">Exits</th>
                      <th className="py-2 pr-2">Avg time</th>
                      <th className="py-2">% sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.dropOffPoints.map((d) => (
                      <tr key={d.screen} className="border-b border-gray-100">
                        <td className="py-2 pr-2 font-mono">{d.screen}</td>
                        <td className="py-2 pr-2">{d.exits}</td>
                        <td className="py-2 pr-2">{formatMs(d.avgElapsedMs)}</td>
                        <td className="py-2">{d.pctOfSessions}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GamePanel>

          <GamePanel title="Sessions that quit within 5 minutes">
            {quitSessions.length === 0 ? (
              <p className="text-sm text-gray-500">No early quits detected in this window.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {quitSessions.slice(0, 20).map((s) => (
                  <div
                    key={s.sessionId}
                    className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs"
                  >
                    <div className="font-semibold text-amber-900">
                      Quit at {s.lastScreen ?? s.lastEvent ?? "unknown"} · {formatMs(s.durationMs)}
                    </div>
                    <div className="text-amber-800/80">
                      Max stage: {s.maxStage ?? "none"} · {s.events.length} events
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GamePanel>

          <GamePanel title="Recent events">
            <div className="max-h-40 overflow-y-auto font-mono text-[10px] leading-relaxed text-gray-700">
              {[...events].reverse().slice(0, 40).map((e) => (
                <div key={e.id} className="border-b border-gray-100 py-0.5">
                  <span className="text-gray-400">{e.ts.slice(11, 19)}</span>{" "}
                  <span className="font-semibold">{e.name}</span>{" "}
                  {e.payload?.screen ? `@${String(e.payload.screen)}` : ""}{" "}
                  {typeof e.payload?.elapsedMs === "number"
                    ? `+${formatMs(e.payload.elapsedMs as number)}`
                    : ""}
                </div>
              ))}
            </div>
          </GamePanel>

          <GameButton
            size="sm"
            variant="danger"
            motionEnabled={false}
            onClick={() => {
              if (confirm("Clear all stored analytics events?")) {
                void clearAnalyticsEvents().then(refresh);
              }
            }}
          >
            Clear analytics data
          </GameButton>
        </>
      )}
    </div>
  );
}
