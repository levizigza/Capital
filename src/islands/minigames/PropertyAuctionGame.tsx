import { useCallback, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

const PROPERTIES = [
  { id: "p1", name: "Cozy Cottage", value: 120000, reno: 15000 },
  { id: "p2", name: "Fixer Upper", value: 85000, reno: 35000 },
  { id: "p3", name: "City Condo", value: 200000, reno: 10000 },
];

export default function PropertyAuctionGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [round, setRound] = useState(0);
  const [budget, setBudget] = useState(250000);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const property = PROPERTIES[round];

  const bid = useCallback(
    (amount: number) => {
      if (!property || done) return;
      const fair = property.value + property.reno * 0.6;
      const diff = Math.abs(amount - fair);
      const roundScore = Math.max(0, 30 - Math.round(diff / 5000));
      setScore((s) => s + roundScore);
      setBudget((b) => b - amount);
      if (round + 1 >= PROPERTIES.length) {
        setDone(true);
        const final = clampScore(score + roundScore);
        onComplete(final >= 50, final);
      } else {
        setRound((r) => r + 1);
      }
    },
    [done, property, round, score, onComplete],
  );

  return (
    <GameVisualShell
      shell="flat"
      title={def?.name ?? "Property Auction"}
      icon={def?.icon ?? "🔨"}
      genre="strategy"
      complexity="medium"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="text-sm font-bold">Budget left: ${budget.toLocaleString()} · Score {score}</div>
        {!done && property ? (
          <>
            <div className="rounded-lg border-2 border-amber-800/30 bg-amber-50 p-4">
              <div className="text-xl font-black">{property.name}</div>
              <div className="text-sm text-gray-600">
                List ${property.value.toLocaleString()} · Est. reno ${property.reno.toLocaleString()}
              </div>
            </div>
            <p className="text-sm">Bid close to fair value (list + part of reno). Don&apos;t overpay!</p>
            <div className="grid grid-cols-1 gap-2">
              {[property.value - 10000, property.value, property.value + 20000].map((amt) => (
                <GameButton key={amt} variant="outline" onClick={() => bid(amt)}>
                  Bid ${amt.toLocaleString()}
                </GameButton>
              ))}
            </div>
          </>
        ) : (
          <GameButton variant="primary" className="w-full" onClick={onClose}>
            Auction complete
          </GameButton>
        )}
      </div>
    </GameVisualShell>
  );
}
