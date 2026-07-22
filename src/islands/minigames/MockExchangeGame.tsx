import { useCallback, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

const TOKENS = [
  { id: "coinz", name: "Coinz", price: 100 },
  { id: "block", name: "BlockToken", price: 50 },
  { id: "moon", name: "MoonCoin", price: 10 },
];

export default function MockExchangeGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [cash, setCash] = useState(1000);
  const [holdings, setHoldings] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(TOKENS.map((t) => [t.id, t.price])),
  );
  const [ticks, setTicks] = useState(0);
  const [done, setDone] = useState(false);

  const tick = useCallback(() => {
    setPrices((p) => {
      const next = { ...p };
      for (const t of TOKENS) {
        const delta = (Math.random() - 0.48) * 15;
        next[t.id] = Math.max(5, Math.round((next[t.id] + delta) * 10) / 10);
      }
      return next;
    });
    setTicks((t) => t + 1);
  }, []);

  const buy = (id: string) => {
    const price = prices[id];
    if (cash < price) return;
    setCash((c) => c - price);
    setHoldings((h) => ({ ...h, [id]: (h[id] ?? 0) + 1 }));
  };

  const sell = (id: string) => {
    if (!holdings[id]) return;
    setCash((c) => c + prices[id]);
    setHoldings((h) => ({ ...h, [id]: h[id] - 1 }));
  };

  const finish = () => {
    let portfolio = cash;
    for (const t of TOKENS) {
      portfolio += (holdings[t.id] ?? 0) * prices[t.id];
    }
    const score = clampScore(Math.min(100, Math.round((portfolio / 1000) * 50 + ticks * 3)));
    setDone(true);
    onComplete(score >= 55, score);
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
        <div className="flex justify-between text-sm">
          <span>CASH ${cash.toFixed(0)}</span>
          <span>TICK {ticks}/8</span>
        </div>
        {!done ? (
          <>
            {TOKENS.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded border border-emerald-600/40 p-2">
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs">${prices[t.id].toFixed(1)} · hold {holdings[t.id] ?? 0}</div>
                </div>
                <div className="flex gap-1">
                  <GameButton size="sm" variant="outline" onClick={() => buy(t.id)}>
                    Buy
                  </GameButton>
                  <GameButton size="sm" variant="outline" onClick={() => sell(t.id)}>
                    Sell
                  </GameButton>
                </div>
              </div>
            ))}
            <GameButton variant="primary" className="w-full" disabled={ticks >= 8} onClick={tick}>
              Next tick
            </GameButton>
            {ticks >= 8 ? (
              <GameButton variant="secondary" className="w-full" onClick={finish}>
                Close exchange
              </GameButton>
            ) : null}
          </>
        ) : (
          <GameButton variant="primary" className="w-full" onClick={onClose}>
            Done
          </GameButton>
        )}
      </div>
    </GameVisualShell>
  );
}
