import { useCallback, useMemo, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

/**
 * Startup Budget — allocate $100k seed across product, marketing, ops, and
 * reserve, then survive 4 quarters. Misallocation shows up as burn spikes,
 * stalled growth, or a crisis that wipes thin reserves.
 */

const SEED = 100_000;
const QUARTERS = 4;

type CatId = "product" | "marketing" | "ops" | "reserve";

type Category = {
  id: CatId;
  label: string;
  ideal: number;
  color: string;
  blurb: string;
};

const CATEGORIES: Category[] = [
  { id: "product", label: "Product", ideal: 35, color: "bg-blue-500", blurb: "Ship features & retain users" },
  { id: "marketing", label: "Marketing", ideal: 25, color: "bg-orange-500", blurb: "Acquire customers" },
  { id: "ops", label: "Operations", ideal: 25, color: "bg-emerald-500", blurb: "Keep the lights on" },
  { id: "reserve", label: "Cash Reserve", ideal: 15, color: "bg-violet-500", blurb: "Survive surprises" },
];

type QuarterEvent = {
  id: string;
  title: string;
  /** Which category softens the hit (or amplifies upside) */
  lever: CatId;
  baseImpact: number;
  note: string;
};

const EVENTS: QuarterEvent[] = [
  {
    id: "churn",
    title: "Churn spike",
    lever: "product",
    baseImpact: -12000,
    note: "Users leave if product underfunded.",
  },
  {
    id: "campaign",
    title: "Viral campaign window",
    lever: "marketing",
    baseImpact: 15000,
    note: "Marketing spend turns the window into growth.",
  },
  {
    id: "compliance",
    title: "Compliance crunch",
    lever: "ops",
    baseImpact: -10000,
    note: "Ops budget absorbs fines and fire drills.",
  },
  {
    id: "downturn",
    title: "Sudden runway scare",
    lever: "reserve",
    baseImpact: -18000,
    note: "Reserve is the only thing between you and a down round.",
  },
];

type QResult = {
  q: number;
  event: string;
  cash: number;
  mrr: number;
  note: string;
};

export default function StartupBudgetGame({
  minigameId,
  island,
  difficulty,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const burnBase = difficulty === "easy" ? 14000 : difficulty === "hard" ? 22000 : 18000;

  const [alloc, setAlloc] = useState<Record<CatId, number>>({
    product: 25,
    marketing: 25,
    ops: 25,
    reserve: 25,
  });
  const [phase, setPhase] = useState<"allocate" | "run" | "done">("allocate");
  const [quarter, setQuarter] = useState(0);
  const [cash, setCash] = useState(SEED);
  const [mrr, setMrr] = useState(2000);
  const [log, setLog] = useState<QResult[]>([]);
  const [feedback, setFeedback] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  const total = CATEGORIES.reduce((s, c) => s + alloc[c.id], 0);

  const setCat = (id: CatId, value: number) => {
    setAlloc((a) => ({ ...a, [id]: value }));
  };

  const balanceHint = useMemo(() => {
    const diffs = CATEGORIES.map((c) => Math.abs(alloc[c.id] - c.ideal));
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avg < 6) return "Balanced plan — close to a durable mix.";
    if (alloc.reserve < 10) return "Thin reserve: one shock can end the runway.";
    if (alloc.marketing > 40) return "Growth-heavy: acquisition without product sticks poorly.";
    if (alloc.product > 50) return "Build-heavy: great product, quiet pipeline.";
    return "Tilted mix — expect trade-offs each quarter.";
  }, [alloc]);

  const allocQuality = useMemo(() => {
    let pts = 0;
    for (const cat of CATEGORIES) {
      pts += Math.max(0, 25 - Math.abs(alloc[cat.id] - cat.ideal));
    }
    return pts; // 0..100
  }, [alloc]);

  const runQuarter = useCallback(() => {
    const q = quarter + 1;
    const ev = EVENTS[(q - 1) % EVENTS.length];
    const leverPct = alloc[ev.lever] / 100;

    // Burn scales with ops underfunding; growth with product+marketing
    const opsGap = Math.max(0, 0.2 - alloc.ops / 100);
    const burn = Math.round(burnBase * (1 + opsGap * 2));
    const growthRate =
      0.08 + (alloc.product / 100) * 0.25 + (alloc.marketing / 100) * 0.35 - opsGap * 0.1;
    const nextMrr = Math.max(500, Math.round(mrr * (1 + growthRate)));

    // Event softened when lever is funded; amplified when starved
    const cushion = leverPct / (CATEGORIES.find((c) => c.id === ev.lever)!.ideal / 100);
    const impact = Math.round(ev.baseImpact * (ev.baseImpact < 0 ? 2 - Math.min(1.5, cushion) : Math.min(1.4, cushion)));

    const reserveDollars = (alloc.reserve / 100) * SEED * (1 - (q - 1) * 0.15);
    let nextCash = cash - burn + nextMrr * 3 + impact;
    // Emergency draw from conceptual reserve buffer
    if (nextCash < 0 && reserveDollars > 0) {
      const draw = Math.min(reserveDollars, -nextCash);
      nextCash += draw;
    }

    const note =
      impact < 0
        ? `${ev.note} Hit ${impact.toLocaleString()} (lever: ${ev.lever} @ ${alloc[ev.lever]}%).`
        : `${ev.note} Gain +${impact.toLocaleString()} thanks to ${ev.lever}.`;

    const row: QResult = { q, event: ev.title, cash: nextCash, mrr: nextMrr, note };
    const nextLog = [...log, row];
    setLog(nextLog);
    setCash(nextCash);
    setMrr(nextMrr);
    setFeedback(note);
    setQuarter(q);

    if (nextCash <= 0) {
      const score = clampScore(20 + allocQuality * 0.2);
      setFinalScore(score);
      setPhase("done");
      onComplete(false, score);
      return;
    }

    if (q >= QUARTERS) {
      const growthPts = clampScore(((nextCash - SEED) / SEED) * 80 + 50);
      const mrrPts = clampScore((nextMrr / 8000) * 40);
      const score = clampScore(allocQuality * 0.45 + growthPts * 0.35 + mrrPts * 0.2);
      setFinalScore(score);
      setPhase("done");
      onComplete(score >= 65, score);
      return;
    }
  }, [alloc, allocQuality, burnBase, cash, log, mrr, onComplete, quarter]);

  const launch = () => {
    if (total !== 100) return;
    setPhase("run");
    setFeedback("Quarter 1 starts. Watch burn, MRR, and the shock of the quarter.");
  };

  return (
    <GameVisualShell
      shell="flat"
      title={def?.name ?? "Startup Budget"}
      icon={def?.icon ?? "💰"}
      genre="simulation"
      complexity="hard"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3">
        {phase === "allocate" ? (
          <>
            <p className="text-sm text-gray-600">
              Split ${SEED.toLocaleString()} seed. Ideals: Product 35% · Marketing 25% · Ops 25% · Reserve 15%.
              Then survive {QUARTERS} quarters of burn and shocks.
            </p>
            {CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>
                    {cat.label}{" "}
                    <span className="font-normal text-gray-500 text-xs">({cat.blurb})</span>
                  </span>
                  <span>{alloc[cat.id]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={alloc[cat.id]}
                  onChange={(e) => setCat(cat.id, Number(e.target.value))}
                  className="w-full"
                  aria-label={cat.label}
                />
                <div className={`h-1.5 rounded ${cat.color} opacity-70`} style={{ width: `${alloc[cat.id]}%` }} />
              </div>
            ))}
            <div className={`text-sm font-bold ${total === 100 ? "text-green-700" : "text-red-600"}`}>
              Total: {total}% {total !== 100 ? "(must equal 100%)" : "✓"}
            </div>
            <p className="text-xs text-gray-500">{balanceHint}</p>
            <GameButton variant="primary" className="w-full" disabled={total !== 100} onClick={launch}>
              Lock allocation & run quarters
            </GameButton>
          </>
        ) : null}

        {phase === "run" ? (
          <>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <Stat label="Quarter" value={`${quarter}/${QUARTERS}`} />
              <Stat label="Cash" value={`$${Math.round(cash).toLocaleString()}`} warn={cash < 40000} />
              <Stat label="MRR" value={`$${mrr.toLocaleString()}`} />
            </div>
            <div className="flex h-12 items-end gap-1 rounded-lg bg-gray-100 p-1">
              {[SEED, ...log.map((r) => r.cash)].map((v, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${v < SEED * 0.6 ? "bg-red-400" : "bg-emerald-500"}`}
                  style={{ height: `${Math.max(10, Math.min(100, (v / SEED) * 80))}%` }}
                />
              ))}
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              {feedback || "Advance to resolve this quarter's event."}
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] font-bold">
              {CATEGORIES.map((c) => (
                <span key={c.id} className="rounded bg-black/5 px-2 py-0.5">
                  {c.label} {alloc[c.id]}%
                </span>
              ))}
            </div>
            <GameButton variant="primary" className="w-full" onClick={runQuarter}>
              {quarter >= QUARTERS ? "Finish" : `Resolve Q${quarter + 1} →`}
            </GameButton>
            {log.length > 0 ? (
              <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-gray-600">
                {[...log].reverse().map((r) => (
                  <div key={r.q}>
                    Q{r.q} {r.event}: cash ${Math.round(r.cash).toLocaleString()} · MRR ${r.mrr.toLocaleString()}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {phase === "done" ? (
          <div className="space-y-3 text-center">
            <div className="text-lg font-black">
              {cash <= 0 ? "Runway gone" : "Year one in the books"}
            </div>
            <div className="text-sm">
              Cash ${Math.max(0, Math.round(cash)).toLocaleString()} · MRR ${mrr.toLocaleString()} · Score{" "}
              {finalScore}/100
            </div>
            <p className="text-xs text-gray-600">
              Allocation quality mattered as much as luck: underfunded reserves and ops turn normal shocks into
              existential ones. Balanced burn buys time for product and marketing to compound.
            </p>
            <GameButton variant="primary" className="w-full" onClick={onClose}>
              Close
            </GameButton>
          </div>
        ) : null}
      </div>
    </GameVisualShell>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-black/5 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-sm font-black ${warn ? "text-red-600" : ""}`}>{value}</div>
    </div>
  );
}
