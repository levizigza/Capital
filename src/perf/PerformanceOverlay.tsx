import { cn } from "@/lib/utils";

import { PERF_BUDGETS } from "./budgets";
import type { BudgetStatus } from "./budgets";
import { usePerformanceMetrics, usePerformanceOverlayVisible } from "./usePerformanceMetrics";
import "./perf.css";

function StatusDot({ status }: { status: BudgetStatus }) {
  return (
    <span
      className={cn(
        "perf-dot",
        status === "ok" && "perf-dot--ok",
        status === "warn" && "perf-dot--warn",
        status === "over" && "perf-dot--over",
      )}
      aria-hidden
    />
  );
}

function Row({
  label,
  value,
  status,
  budget,
}: {
  label: string;
  value: string;
  status: BudgetStatus;
  budget?: string;
}) {
  return (
    <div className="perf-row">
      <StatusDot status={status} />
      <span className="perf-row__label">{label}</span>
      <span className="perf-row__value">{value}</span>
      {budget && <span className="perf-row__budget">{budget}</span>}
    </div>
  );
}

export function PerformanceOverlay() {
  const [visible] = usePerformanceOverlayVisible();
  const snap = usePerformanceMetrics();

  if (!visible) return null;

  const { frame, memory, assets, budgets, anyViolation } = snap;
  const memDisplay =
    memory.usedMb != null
      ? `${memory.usedMb} MB`
      : `~${memory.estimatedDomMb} MB (est)`;

  return (
    <div
      className={cn("perf-overlay", anyViolation && "perf-overlay--violation")}
      role="status"
      aria-live="polite"
      aria-label="Performance profiler"
    >
      <div className="perf-overlay__header">
        <span className="perf-overlay__title">PERF</span>
        {anyViolation && <span className="perf-overlay__badge">BUDGET</span>}
        <span className="perf-overlay__hint">` toggle</span>
      </div>

      <section className="perf-section">
        <div className="perf-section__title">Frame</div>
        <Row
          label="FPS"
          value={`${frame.fps}`}
          status={budgets.fps}
          budget={`≤ ${Math.round(1000 / PERF_BUDGETS.frameTimeMs)}`}
        />
        <Row
          label="Frame"
          value={`${frame.frameTimeMs} ms (p95 ${frame.frameTimeP95Ms})`}
          status={budgets.frameTime}
          budget={`≤ ${PERF_BUDGETS.frameTimeMs} ms`}
        />
        <Row
          label="Draw calls"
          value={`${frame.drawCalls}`}
          status={budgets.drawCalls}
          budget={`≤ ${PERF_BUDGETS.drawCallsPerFrame}`}
        />
      </section>

      <section className="perf-section">
        <div className="perf-section__title">Memory</div>
        <Row
          label="Heap"
          value={memDisplay}
          status={budgets.memory}
          budget={`≤ ${PERF_BUDGETS.memoryMb} MB`}
        />
        {memory.limitMb != null && (
          <Row label="Limit" value={`${memory.limitMb} MB`} status="ok" />
        )}
      </section>

      <section className="perf-section">
        <div className="perf-section__title">Assets ({assets.count})</div>
        <Row
          label="Total"
          value={`${assets.totalKb} KB`}
          status={budgets.assetsTotal}
          budget={`≤ ${PERF_BUDGETS.assets.totalKb} KB`}
        />
        <Row
          label="Images"
          value={`${assets.byCategory.image.count} · ${Math.round(assets.byCategory.image.bytes / 1024)} KB`}
          status={budgets.assetsImage}
        />
        <Row
          label="Audio"
          value={`${assets.byCategory.audio.count} · ${Math.round(assets.byCategory.audio.bytes / 1024)} KB`}
          status={budgets.assetsAudio}
        />
        <Row
          label="JSON"
          value={`${assets.byCategory.json.count} · ${Math.round(assets.byCategory.json.bytes / 1024)} KB`}
          status={budgets.assetsJson}
        />
      </section>
    </div>
  );
}
