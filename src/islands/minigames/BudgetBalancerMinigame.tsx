import { useCallback } from "react";
import BudgetBalancerGame from "@/game/components/games/BudgetBalancerGame";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { learningProfileToTier } from "./minigameUtils";

export default function BudgetBalancerMinigame({
  minigameId,
  island,
  learningProfile,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);

  const handleComplete = useCallback(
    (score: number) => {
      onComplete(score >= 50, score);
    },
    [onComplete],
  );

  return (
    <GameVisualShell
      shell="notebook"
      title={def?.name ?? "Budget Balancer"}
      icon={def?.icon ?? "📊"}
      genre="puzzle"
      complexity="easy"
      homage={def?.homage}
      onClose={onClose}
    >
      <BudgetBalancerGame
        userTier={learningProfileToTier(learningProfile)}
        onComplete={handleComplete}
        onExit={onClose}
      />
    </GameVisualShell>
  );
}
