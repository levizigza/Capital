import { useCallback, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

type MonthResult = { month: number; cash: number; revenue: number; note: string };

export default function CashFlowSimGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [month, setMonth] = useState(1);
  const [cash, setCash] = useState(5000);
  const [history, setHistory] = useState<MonthResult[]>([]);
  const [done, setDone] = useState(false);

  const choices = [
    { id: "restock", label: "Restock inventory ($800)", cost: 800, revBoost: 1200 },
    { id: "save", label: "Save cash ($0 spend)", cost: 0, revBoost: 400 },
    { id: "promo", label: "Run a sale promo ($400)", cost: 400, revBoost: 900 },
  ];

  const pick = useCallback(
    (choice: (typeof choices)[0]) => {
      if (done || month > 12) return;
      const revenue = choice.revBoost + Math.floor(Math.random() * 200);
      const nextCash = cash - choice.cost + revenue;
      setCash(nextCash);
      setHistory((h) => [
        ...h,
        { month, cash: nextCash, revenue, note: choice.label },
      ]);
      if (month >= 12) {
        setDone(true);
        const score = clampScore(nextCash >= 6000 ? 85 : nextCash >= 4000 ? 65 : 40);
        onComplete(score >= 60, score);
      } else {
        setMonth((m) => m + 1);
      }
    },
    [cash, done, month, onComplete],
  );

  return (
    <GameVisualShell
      shell="retro"
      title={def?.name ?? "Cash Flow Sim"}
      icon={def?.icon ?? "💵"}
      genre="simulation"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3 font-mono text-yellow-100">
        <div className="flex justify-between text-sm">
          <span>MONTH {Math.min(month, 12)}/12</span>
          <span>CASH ${cash.toLocaleString()}</span>
        </div>
        {!done ? (
          <>
            <p className="text-xs opacity-80">Run your store — keep cash positive all year!</p>
            <div className="flex flex-col gap-2">
              {choices.map((c) => (
                <GameButton key={c.id} variant="outline" className="text-yellow-100 border-yellow-600" onClick={() => pick(c)}>
                  {c.label}
                </GameButton>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="font-bold">Year complete! Final cash: ${cash.toLocaleString()}</div>
            <GameButton variant="primary" className="w-full" onClick={onClose}>
              Close
            </GameButton>
          </div>
        )}
        {history.length > 0 ? (
          <div className="text-xs opacity-70 max-h-24 overflow-y-auto">
            {history.slice(-3).map((h) => (
              <div key={h.month}>
                M{h.month}: ${h.cash} ({h.note})
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </GameVisualShell>
  );
}
