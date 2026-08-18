import { useCallback, useEffect, useMemo, useState } from "react";

import { GameButton, GamePanel } from "@/game-ui";

import type { AnalyticsEvent } from "../types";
import { analyzeFunnel, FUNNEL_WINDOW_MS, type FunnelAnalysis } from "./funnel";
import { analyzeFtueMetrics, FTUE_PRIMARY_METRICS, type FtueMetricsSnapshot } from "./ftue";
import {
  analyzeHealthDashboard,
  type HealthCategorySnapshot,
  type HealthDamageFlag,
  type HealthMetric,
} from "./healthDashboard";
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

function formatMetric(id: string, value: number | null): string {
  if (value == null) return "—";
  if (id.startsWith("time_to_")) return formatMs(value);
  if (
    id.includes("rate") ||
    id.includes("conversion") ||
    id.includes("retention") ||
    id.includes("dependency") ||
    id.includes("diversity") ||
    id.includes("mastery") ||
    id.includes("transfer") ||
    id.includes("improvement") ||
    id.includes("continuation") ||
    id.includes("play")
  ) {
    return `${Math.round(value * 100)}%`;
  }
  return String(value);
}

function formatHealthMetric(m: HealthMetric): string {
  if (m.value == null || m.unit === "unknown") return "—";
  if (m.unit === "ms") return formatMs(m.value);
  if (m.unit === "rate") return `${Math.round(m.value * 100)}%`;
  if (m.unit === "coins") return `${Math.round(m.value)} coins`;
  return String(m.value);
}

const CATEGORY_TONE: Record<string, string> = {
  engagement: "border-sky-700/30 bg-sky-50/90",
  learning: "border-emerald-700/30 bg-emerald-50/90",
  business: "border-amber-700/30 bg-amber-50/90",
};

function DamageFlagsPanel({ flags }: { flags: HealthDamageFlag[] }) {
  if (flags.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600"
        data-testid="health-flags-clear"
      >
        No cross-category damage flags on current local data.
      </div>
    );
  }
  return (
    <div className="space-y-2" data-testid="health-flags">
      {flags.map((f) => (
        <div
          key={f.id}
          className="rounded-xl border-2 border-rose-700/40 bg-rose-50 px-3 py-2"
          data-testid={`health-flag-${f.id}`}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-950">{f.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-rose-900/90">{f.detail}</p>
        </div>
      ))}
    </div>
  );
}

function CategoryColumn({ category }: { category: HealthCategorySnapshot }) {
  return (
    <div
      className={`rounded-xl border-2 px-3 py-3 ${CATEGORY_TONE[category.id] ?? "bg-gray-50"}`}
      data-testid={`health-category-${category.id}`}
    >
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">{category.title}</h3>
      <ul className="mt-3 space-y-2">
        {category.metrics.map((m) => (
          <li key={m.id} className="border-t border-black/5 pt-2 first:border-0 first:pt-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-gray-800">{m.label}</span>
              <span className="font-mono text-sm font-bold tabular-nums text-gray-950">
                {formatHealthMetric(m)}
              </span>
            </div>
            {m.inverted ? (
              <p className="text-[10px] text-gray-600">Higher is worse</p>
            ) : null}
            {m.note ? <p className="text-[10px] leading-snug text-gray-500">{m.note}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HealthDashboardPanel({
  engagement,
  learning,
  business,
  flags,
  law,
}: {
  engagement: HealthCategorySnapshot;
  learning: HealthCategorySnapshot;
  business: HealthCategorySnapshot;
  flags: HealthDamageFlag[];
  law: string;
}) {
  return (
    <div className="space-y-3" data-testid="health-dashboard">
      <p className="text-xs font-medium leading-relaxed text-gray-700">{law}</p>
      <DamageFlagsPanel flags={flags} />
      <div className="grid gap-3 md:grid-cols-3">
        <CategoryColumn category={engagement} />
        <CategoryColumn category={learning} />
        <CategoryColumn category={business} />
      </div>
    </div>
  );
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
          <div className="h-5 overflow-hidden rounded bg-gray-100">
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

function FtueMetricsPanel({ snap }: { snap: FtueMetricsSnapshot }) {
  const primary: Record<(typeof FTUE_PRIMARY_METRICS)[number], number | null> = {
    independent_transfer_rate: snap.independent_transfer_rate,
    time_to_first_decision: snap.time_to_first_decision_ms,
    time_to_first_complete_loop: snap.time_to_first_complete_loop_ms,
    failure_recovery_rate: snap.failure_recovery_rate,
    hint_dependency: snap.hint_dependency,
    strategy_diversity: snap.strategy_diversity,
    d1_retention: snap.d1_retention,
    d7_retention: snap.d7_retention,
    d30_retention: snap.d30_retention,
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border-2 border-emerald-700/40 bg-emerald-100/90 px-3 py-3"
        data-testid="ftue-king-kpi"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/80">
          King KPI · Independent Transfer Rate
        </p>
        <p className="mt-1 text-3xl font-black tabular-nums text-emerald-950">
          {formatMetric("independent_transfer_rate", snap.independent_transfer_rate)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-900/90">
          After Capital teaches a principle once, can players reason with it in a new situation
          without being told what to do? Tutorial completion is never the primary success measure.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {FTUE_PRIMARY_METRICS.filter((id) => id !== "independent_transfer_rate").map((id) => (
          <div
            key={id}
            className="rounded-lg bg-emerald-50 px-2 py-1.5"
            data-testid={`ftue-metric-${id}`}
          >
            <div className="font-medium text-emerald-900">{id.replace(/_/g, " ")}</div>
            <div className="font-mono text-emerald-800">{formatMetric(id, primary[id])}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-500">
        Secondary — tutorial completion rate:{" "}
        <span className="font-mono">
          {snap.tutorial_completion_rate == null
            ? "—"
            : `${Math.round(snap.tutorial_completion_rate * 100)}%`}
        </span>{" "}
        (diagnostic only — never the ship metric)
      </div>
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
  const ftueSnap = useMemo(() => analyzeFtueMetrics(events), [events]);
  const health = useMemo(() => analyzeHealthDashboard(events), [events]);

  const quitSessions = useMemo(
    () => analysis.sessions.filter((s) => s.quitWithin5Min),
    [analysis.sessions],
  );

  return (
    <div className="max-h-[min(80dvh,720px)] space-y-4 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black">Health dashboard</h2>
          <p className="text-xs text-gray-500">
            ENGAGEMENT · LEARNING · BUSINESS · {events.length} events · {analysis.sessionsInWindow}{" "}
            sessions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GameButton size="sm" variant="outline" motionEnabled={false} onClick={() => void refresh()}>
            Refresh
          </GameButton>
          <GameButton
            size="sm"
            variant="outline"
            motionEnabled={false}
            onClick={() => void exportAnalyticsCsv()}
          >
            Export CSV
          </GameButton>
          <GameButton
            size="sm"
            variant="primary"
            motionEnabled={false}
            onClick={() => void exportAnalyticsJson()}
          >
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
            Play through Harbor and a chapter Take to populate privacy-safe telemetry. Events stay
            local. Business paid retention / CAC stay unavailable until instrumented.
          </p>
        </GamePanel>
      ) : (
        <>
          <GamePanel title="ENGAGEMENT · LEARNING · BUSINESS">
            <HealthDashboardPanel
              engagement={health.engagement}
              learning={health.learning}
              business={health.business}
              flags={health.flags}
              law={health.law}
            />
          </GamePanel>

          <GamePanel title="Learning detail (FTUE primary)">
            <FtueMetricsPanel snap={ftueSnap} />
          </GamePanel>

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
              <div className="max-h-48 space-y-2 overflow-y-auto">
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
              {[...events]
                .reverse()
                .slice(0, 40)
                .map((e) => (
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
