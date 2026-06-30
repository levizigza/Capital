import { useCallback } from "react";
import { CoinCatcherGame } from "@/game/components/games/CoinCatcherGame";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { learningProfileToTier } from "./minigameUtils";

export default function CoinCatcherMinigame({
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
      shell="arcade"
      title={def?.name ?? "Coin Catcher"}
      icon={def?.icon ?? "🕹️"}
      genre="arcade"
      complexity="easy"
      onClose={onClose}
    >
      <CoinCatcherGame
        userTier={learningProfileToTier(learningProfile)}
        onComplete={handleComplete}
        onExit={onClose}
      />
    </GameVisualShell>
  );
}
