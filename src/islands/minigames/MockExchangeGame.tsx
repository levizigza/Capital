import { useCallback, useMemo, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

/**
 * Mock Exchange — trade a tiny multi-token book over 10 ticks. News shocks hit
 * sectors differently; scoring rewards positive P/L plus diversification
 * (don't YOLO one moonshot). Teaching beat: timing + spread risk.
 */

const TOTAL_TICKS = 10;
const START_CASH = 1000;

type Token = {
  id: string;
  name: string;
  start: number;
  /** Typical random swing per tick */
  vol: number;
  sector: "stable" | "growth" | "meme";
};

const TOKENS: Token[] = [
  { id: "coinz", name: "Coinz", start: 100, vol: 6, sector: "stable" },
  { id: "block", name: "BlockToken", start: 50, vol: 10, sector: "growth" },
  { id: "moon", name: "MoonCoin", start: 12, vol: 18, sector: "meme" },
  { id: "yield", name: "YieldBit", start: 40, vol: 5, sector: "stable" },
];

type News = {
  tick: number;
  headline: string;
  shocks: Partial<Record<string, number>>;
};

const NEWS: News[] = [
  { tick: 2, headline: "Regulators eye meme tokens", shocks: { moon: -0.18, yield: 0.04 } },
  { tick: 4, headline: "Enterprise blockchain deal", shocks: { block: 0.14, coinz: 0.03 } },
  { tick: 6, headline: "Risk-off — flight to stables", shocks: { moon: -0.12, coinz: 0.05, yield: 0.06, block: -0.05 } },
  { tick: 8, headline: "Influencer pumps MoonCoin", shocks: { moon: 0.22, block: 0.04 } },
];

function portfolioValue(cash: number, holdings: Record<string, number>, prices: Record<string, number>) {
  let v = cash;
  for (const t of TOKENS) v += (holdings[t.id] ?? 0) * prices[t.id];
  return v;
}

/** Herfindahl-style: 1 = all in one token, ~0.25 = even across 4 */
function concentration(holdings: Record<string, number>, prices: Record<string, number>) {
  const values = TOKENS.map((t) => (holdings[t.id] ?? 0) * prices[t.id]);
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  return values.reduce((s, v) => s + Math.pow(v / total, 2), 0);
}

export default function MockExchangeGame({
  minigameId,
  island,
  difficulty,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const volMult = difficulty === "easy" ? 0.7 : difficulty === "hard" ? 1.35 : 1;
  const divNeed = difficulty === "easy" ? 0.55 : difficulty === "hard" ? 0.4 : 0.45;

  const [cash, setCash] = useState(START_CASH);
  const [holdings, setHoldings] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(TOKENS.map((t) => [t.id, t.start])),
  );
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState<number[]>([START_CASH]);
  const [flash, setFlash] = useState<string | null>("Build a book — diversify before the news hits.");
  const [tradeLog, setTradeLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [qty, setQty] = useState(1);

  const value = portfolioValue(cash, holdings, prices);
  const pnl = value - START_CASH;
  const conc = concentration(holdings, prices);
  const invested = value - cash;

  const peak = useMemo(() => Math.max(...history, value), [history, value]);

  const buy = (id: string) => {
    if (done || tick >= TOTAL_TICKS) return;
    const price = prices[id];
    const cost = price * qty;
    if (cash < cost) {
      setFlash(`Need $${cost.toFixed(0)} — only $${cash.toFixed(0)} cash.`);
      return;
    }
    setCash((c) => c - cost);
    setHoldings((h) => ({ ...h, [id]: (h[id] ?? 0) + qty }));
    setTradeLog((l) => [`T${tick}: BUY ${qty} ${id} @ ${price.toFixed(1)}`, ...l].slice(0, 8));
    setFlash(`Bought ${qty} ${id}. Concentration now ${(concentration({ ...holdings, [id]: (holdings[id] ?? 0) + qty }, prices) * 100).toFixed(0)}%.`);
  };

  const sell = (id: string) => {
    if (done || tick >= TOTAL_TICKS) return;
    const have = holdings[id] ?? 0;
    if (have < qty) {
      setFlash(`Only hold ${have} ${id}.`);
      return;
    }
    const price = prices[id];
    setCash((c) => c + price * qty);
    setHoldings((h) => ({ ...h, [id]: have - qty }));
    setTradeLog((l) => [`T${tick}: SELL ${qty} ${id} @ ${price.toFixed(1)}`, ...l].slice(0, 8));
    setFlash(`Sold ${qty} ${id} for $${(price * qty).toFixed(0)}.`);
  };

  const advance = useCallback(() => {
    if (done || tick >= TOTAL_TICKS) return;
    const nextTick = tick + 1;
    const news = NEWS.find((n) => n.tick === nextTick);

    setPrices((prev) => {
      const next = { ...prev };
      for (const t of TOKENS) {
        const noise = (Math.random() - 0.48) * t.vol * volMult;
        let px = next[t.id] + noise;
        if (news?.shocks[t.id]) px *= 1 + news.shocks[t.id]!;
        next[t.id] = Math.max(2, Math.round(px * 10) / 10);
      }
      const nv = portfolioValue(cash, holdings, next);
      setHistory((h) => [...h, nv]);
      return next;
    });

    if (news) setFlash(`📰 ${news.headline}`);
    else setFlash(`Tick ${nextTick}: quiet tape — noise only.`);

    setTick(nextTick);
    if (nextTick >= TOTAL_TICKS) {
      // finalize on last tick after price update — use timeout-free deferred calc in finish button
    }
  }, [cash, done, holdings, tick, volMult]);

  const finish = () => {
    const endVal = portfolioValue(cash, holdings, prices);
    const endPnl = endVal - START_CASH;
    const endConc = concentration(holdings, prices);
    const traded = tradeLog.length > 0;
    const growthScore = clampScore(50 + (endPnl / START_CASH) * 80);
    const divScore = traded ? clampScore((1 - endConc) * 100) : 35;
    const timingBonus = Math.max(...history) > START_CASH * 1.08 ? 8 : 0;
    const score = clampScore(growthScore * 0.55 + divScore * 0.35 + timingBonus);
    const diversified = endConc < divNeed + 0.15 || invested / Math.max(1, endVal) < 0.35;
    const success = score >= 55 && endPnl > 0 && diversified;
    setFinalScore(score);
    setDone(true);
    setFlash(
      success
        ? `Closed +$${endPnl.toFixed(0)} with manageable concentration.`
        : `P/L $${endPnl.toFixed(0)} · concentration ${(endConc * 100).toFixed(0)}% — diversify or take profit next time.`,
    );
    onComplete(success, score);
  };

  return (
    <GameVisualShell
      shell="neon"
      title={def?.name ?? "Mock Exchange"}
      icon={def?.icon ?? "🔄"}
      genre="simulation"
      complexity="hard"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3 font-mono text-emerald-100">
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span>TICK {tick}/{TOTAL_TICKS}</span>
          <span className={pnl >= 0 ? "text-emerald-300" : "text-red-300"}>
            NAV ${value.toFixed(0)} ({pnl >= 0 ? "+" : ""}
            {pnl.toFixed(0)})
          </span>
        </div>

        <div className="flex h-12 items-end gap-0.5 rounded border border-emerald-600/40 bg-black/40 p-1">
          {history.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${v >= START_CASH ? "bg-emerald-400" : "bg-red-400"}`}
              style={{ height: `${Math.max(8, Math.min(100, (v / peak) * 100))}%` }}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="rounded border border-emerald-700/50 px-2 py-0.5">Cash ${cash.toFixed(0)}</span>
          <span className="rounded border border-emerald-700/50 px-2 py-0.5">
            Conc {(conc * 100).toFixed(0)}% {conc > 0.55 ? "⚠️" : "✓"}
          </span>
          <span className="rounded border border-emerald-700/50 px-2 py-0.5">Qty</span>
          <input
            type="range"
            min={1}
            max={5}
            value={qty}
            disabled={done}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 accent-emerald-400"
            aria-label="Trade quantity"
          />
          <span>×{qty}</span>
        </div>

        {flash ? (
          <div className="rounded border border-emerald-500/40 bg-emerald-950/50 px-2 py-1.5 text-xs">
            {flash}
          </div>
        ) : null}

        {!done ? (
          <>
            {TOKENS.map((t) => {
              const held = holdings[t.id] ?? 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded border border-emerald-600/40 p-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate">
                      {t.name}{" "}
                      <span className="text-[10px] opacity-60 uppercase">{t.sector}</span>
                    </div>
                    <div className="text-xs">
                      ${prices[t.id].toFixed(1)} · hold {held} · vol ±{Math.round(t.vol * volMult)}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <GameButton size="sm" variant="outline" disabled={tick >= TOTAL_TICKS} onClick={() => buy(t.id)}>
                      Buy
                    </GameButton>
                    <GameButton size="sm" variant="outline" disabled={tick >= TOTAL_TICKS || held < qty} onClick={() => sell(t.id)}>
                      Sell
                    </GameButton>
                  </div>
                </div>
              );
            })}

            {tick < TOTAL_TICKS ? (
              <GameButton variant="primary" className="w-full" onClick={advance}>
                Next tick ({tick + 1}/{TOTAL_TICKS})
              </GameButton>
            ) : (
              <GameButton variant="secondary" className="w-full" onClick={finish}>
                Close exchange & score
              </GameButton>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="font-bold text-center">Session score {finalScore}/100</div>
            <p className="text-xs opacity-80">
              Lesson: meme spikes feel great until concentration meets a headline. Spread across uncorrelated
              names, and size trades so one tick cannot erase the book.
            </p>
            <GameButton variant="primary" className="w-full" onClick={onClose}>
              Done
            </GameButton>
          </div>
        )}

        {tradeLog.length > 0 ? (
          <div className="max-h-20 overflow-y-auto text-[10px] opacity-60 space-y-0.5">
            {tradeLog.map((line, i) => (
              <div key={`${line}-${i}`}>{line}</div>
            ))}
          </div>
        ) : null}
      </div>
    </GameVisualShell>
  );
}
