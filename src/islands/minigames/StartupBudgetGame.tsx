import { useCallback, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

const CATEGORIES = [
  { id: "product", label: "Product", ideal: 35, color: "bg-blue-500" },
  { id: "marketing", label: "Marketing", ideal: 25, color: "bg-orange-500" },
  { id: "ops", label: "Operations", ideal: 25, color: "bg-emerald-500" },
  { id: "reserve", label: "Cash Reserve", ideal: 15, color: "bg-violet-500" },
];

export default function StartupBudgetGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [alloc, setAlloc] = useState<Record<string, number>>({
    product: 25,
    marketing: 25,
    ops: 25,
    reserve: 25,
  });
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(alloc).reduce((a, b) => a + b, 0);

  const score = useCallback(() => {
    let pts = 0;
    for (const cat of CATEGORIES) {
      const diff = Math.abs(alloc[cat.id] - cat.ideal);
      pts += Math.max(0, 25 - diff);
    }
    return clampScore(pts);
  }, [alloc]);

  const submit = () => {
    setSubmitted(true);
    const s = score();
    onComplete(s >= 65, s);
  };

  return (
    <GameVisualShell
      shell="flat"
      title={def?.name ?? "Startup Budget"}
      icon={def?.icon ?? "💰"}
      genre="simulation"
      complexity="hard"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You have $100k seed funding. Slide to allocate — balanced startups survive longer!
        </p>

        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>{cat.label}</span>
              <span>{alloc[cat.id]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={alloc[cat.id]}
              disabled={submitted}
              onChange={(e) =>
                setAlloc((a) => ({ ...a, [cat.id]: Number(e.target.value) }))
              }
              className="w-full"
            />
            <div className={`h-2 rounded ${cat.color} opacity-60`} style={{ width: `${alloc[cat.id]}%` }} />
          </div>
        ))}

        <div className={`text-sm font-bold ${total === 100 ? "text-green-700" : "text-red-600"}`}>
          Total: {total}% {total !== 100 ? "(must equal 100%)" : "✓"}
        </div>

        {submitted ? (
          <div className="text-center font-bold text-lg">Score: {score()}/100</div>
        ) : (
          <GameButton variant="primary" className="w-full" disabled={total !== 100} onClick={submit}>
            Launch startup
          </GameButton>
        )}
      </div>
    </GameVisualShell>
  );
}
