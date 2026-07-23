import { useCallback } from "react";
import { CoinCatcherGame } from "@/game/components/games/CoinCatcherGame";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { learningProfileToTier } from "./minigameUtils";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle } from "../animationStyles";

/**
 * Mario Party–style kinesthetic opener for islands that lack a movement game.
 * Clear this first; mastery quiz gates literacy after the dash.
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
      homage={`${era.eraLabel} · move first, quiz after`}
      onClose={onClose}
    >
      <p className="mb-3 text-sm opacity-80">
        Kinesthetic warm-up on {island.name}: catch value, dodge impulse spends. Ace the mastery
        quiz after you clear the dash — that’s the Mario Party pairing.
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
