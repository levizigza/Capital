import { useCallback } from "react";
import { CoinCatcherGame } from "@/game/components/games/CoinCatcherGame";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { learningProfileToTier } from "./minigameUtils";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle } from "../animationStyles";

/**
 * Fortune Party–style kinesthetic opener for islands that lack a movement game.
 * Clear this first; optional mastery digression never gates Credit or clears.
 */
export default function PartyDashMinigame({
  minigameId,
  island,
  learningProfile,
  onComplete,
  onClose,
}: MinigameProps) {
  const theme = getIslandTheme(island.id, island.themeId);
  const era = getAnimationStyle(theme.animationStyle);

  const handleComplete = useCallback(
    (score: number) => {
      onComplete(score >= 40, score);
    },
    [onComplete],
  );

  return (
    <GameVisualShell
      shell="arcade"
      title={`${island.name} Party Dash`}
      icon="🏃"
      genre="arcade"
      complexity="easy"
      homage={`${era.eraLabel} · move first`}
      onClose={onClose}
    >
      <p className="mb-3 text-sm opacity-80">
        Kinesthetic warm-up on {island.name}: catch value, dodge impulse spends. Clear the course —
        Harbor keeps what you choose later on the shore, not a quiz gate.
      </p>
      <CoinCatcherGame
        userTier={learningProfileToTier(learningProfile)}
        onComplete={handleComplete}
        onExit={onClose}
      />
      <div className="sr-only" data-testid="party-dash" data-minigame={minigameId}>
        Party Dash
      </div>
    </GameVisualShell>
  );
}
