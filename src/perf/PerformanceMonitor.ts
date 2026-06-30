// ---------------------------------------------------------------------------
// PerformanceMonitor — singleton frame/memory/asset profiler
// ---------------------------------------------------------------------------

import {
  PERF_BUDGETS,
  budgetStatus,
  budgetStatusInverse,
  type BudgetStatus,
} from "./budgets";
import {
  getAssetCount,
  getAssetTotals,
  getTotalAssetBytes,
  ingestResourceTimings,
  bootstrapStaticModules,
  scanDomImages,
} from "./assetTracker";

export type FrameMetrics = {
  fps: number;
  frameTimeMs: number;
  frameTimeP95Ms: number;
  drawCalls: number;
};

export type MemoryMetrics = {
  usedMb: number | null;
  totalMb: number | null;
  limitMb: number | null;
  estimatedDomMb: number;
};

export type AssetMetrics = {
  count: number;
  totalKb: number;
  byCategory: ReturnType<typeof getAssetTotals>;
};

export type BudgetViolations = {
  frameTime: BudgetStatus;
  fps: BudgetStatus;
  memory: BudgetStatus;
  drawCalls: BudgetStatus;
  assetsTotal: BudgetStatus;
  assetsImage: BudgetStatus;
  assetsAudio: BudgetStatus;
  assetsJson: BudgetStatus;
};

export type PerfSnapshot = {
  frame: FrameMetrics;
  memory: MemoryMetrics;
  assets: AssetMetrics;
  budgets: BudgetViolations;
  anyViolation: boolean;
};

type Listener = (snapshot: PerfSnapshot) => void;

const FRAME_HISTORY = 60;

class PerformanceMonitorImpl {
  private listeners = new Set<Listener>();
  private rafId = 0;
  private running = false;
  private lastFrameTs = 0;
  private frameTimes: number[] = [];
  private drawCallsThisFrame = 0;
  private bootstrapped = false;

  /** Start the RAF sampling loop */
  start(): void {
    if (this.running || typeof window === "undefined") return;
    this.running = true;
    this.lastFrameTs = performance.now();
    this.bootstrapOnce();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  /** Call once per GL/DOM draw batch */
  recordDrawCalls(count: number): void {
    this.drawCallsThisFrame += Math.max(0, count);
  }

  getSnapshot(): PerfSnapshot {
    const frame = this.getFrameMetrics();
    const memory = this.getMemoryMetrics();
    const assets = this.getAssetMetrics();
    const budgets = this.checkBudgets(frame, memory, assets);
    const anyViolation = Object.values(budgets).some((s) => s === "over");

    return { frame, memory, assets, budgets, anyViolation };
  }

  private bootstrapOnce(): void {
    if (this.bootstrapped) return;
    this.bootstrapped = true;

    try {
      const eventModules = import.meta.glob("../content/events/*.json", { eager: true });
      bootstrapStaticModules(eventModules, "events");

      const islandModules = import.meta.glob("../islands/content/*.islands.json", { eager: true });
      bootstrapStaticModules(islandModules, "islands");
    } catch {
      /* glob may fail in tests */
    }

    ingestResourceTimings();
    scanDomImages();

    // Refresh resource timings as new assets load
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const obs = new PerformanceObserver(() => {
          ingestResourceTimings();
          scanDomImages();
        });
        obs.observe({ type: "resource", buffered: true });
      } catch {
        /* unsupported */
      }
    }
  }

  /** Double-rAF so draw-call recordings from other loops run first */
  private tick = (): void => {
    if (!this.running) return;

    this.rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!this.running) return;
        this.sampleFrame();
        this.tick();
      });
    });
  };

  private sampleFrame(): void {
    const now = performance.now();
    const dt = now - this.lastFrameTs;
    this.lastFrameTs = now;

    if (dt > 0 && dt < 500) {
      this.frameTimes.push(dt);
      if (this.frameTimes.length > FRAME_HISTORY) this.frameTimes.shift();
    }

    let drawCalls = this.drawCallsThisFrame;
    if (drawCalls === 0 && typeof document !== "undefined") {
      drawCalls = document.querySelectorAll("canvas").length;
    }
    this.lastDrawCalls = drawCalls;

    const snapshot = this.getSnapshot();
    for (const fn of this.listeners) fn(snapshot);

    this.drawCallsThisFrame = 0;
  }

  private lastDrawCalls = 0;

  private getFrameMetrics(): FrameMetrics {
    const times = this.frameTimes;
    const avg = times.length
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted.length
      ? sorted[Math.floor(sorted.length * 0.95)] ?? avg
      : 0;
    const fps = avg > 0 ? 1000 / avg : 0;

    return {
      fps: Math.round(fps),
      frameTimeMs: Math.round(avg * 10) / 10,
      frameTimeP95Ms: Math.round(p95 * 10) / 10,
      drawCalls: this.lastDrawCalls,
    };
  }

  private getMemoryMetrics(): MemoryMetrics {
    const perfMem = (performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
    }).memory;

    let estimatedDomMb = 0;
    if (typeof document !== "undefined") {
      estimatedDomMb = document.querySelectorAll("*").length * 0.002;
    }

    if (!perfMem) {
      return { usedMb: null, totalMb: null, limitMb: null, estimatedDomMb };
    }

    return {
      usedMb: Math.round((perfMem.usedJSHeapSize / 1048576) * 10) / 10,
      totalMb: Math.round((perfMem.totalJSHeapSize / 1048576) * 10) / 10,
      limitMb: Math.round((perfMem.jsHeapSizeLimit / 1048576) * 10) / 10,
      estimatedDomMb: Math.round(estimatedDomMb * 10) / 10,
    };
  }

  private getAssetMetrics(): AssetMetrics {
    const totals = getAssetTotals();
    return {
      count: getAssetCount(),
      totalKb: Math.round(getTotalAssetBytes() / 1024),
      byCategory: totals,
    };
  }

  private checkBudgets(
    frame: FrameMetrics,
    memory: MemoryMetrics,
    assets: AssetMetrics,
  ): BudgetViolations {
    const b = PERF_BUDGETS;

    const fpsStatus = budgetStatusInverse(
      frame.fps,
      Math.floor(1000 / b.frameTimeMs),
      Math.floor(1000 / b.frameTimeWarnMs),
    );

    const frameStatus = budgetStatus(
      frame.frameTimeP95Ms,
      b.frameTimeMs,
      b.frameTimeWarnMs,
    );

    const memUsed = memory.usedMb ?? memory.estimatedDomMb;
    const memStatus = budgetStatus(memUsed, b.memoryWarnMb, b.memoryMb);

    const drawStatus = budgetStatus(
      frame.drawCalls,
      Math.floor(b.drawCallsPerFrame * 0.7),
      b.drawCallsPerFrame,
    );

    const imgKb = Math.round(assets.byCategory.image.bytes / 1024);
    const audKb = Math.round(assets.byCategory.audio.bytes / 1024);
    const jsonKb = Math.round(assets.byCategory.json.bytes / 1024);

    return {
      frameTime: frameStatus,
      fps: fpsStatus,
      memory: memStatus,
      drawCalls: drawStatus,
      assetsTotal: budgetStatus(assets.totalKb, b.assets.totalKb * 0.85, b.assets.totalKb),
      assetsImage: budgetStatus(imgKb, b.assets.imageKb * 0.85, b.assets.imageKb),
      assetsAudio: budgetStatus(audKb, b.assets.audioKb * 0.85, b.assets.audioKb),
      assetsJson: budgetStatus(jsonKb, b.assets.jsonKb * 0.85, b.assets.jsonKb),
    };
  }
}

export const perfMonitor = new PerformanceMonitorImpl();
