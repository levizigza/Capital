import { motion } from "framer-motion";

import { GameButton } from "@/game-ui";
import type { MinigameBoardReward } from "../partyBoard";

export type PartyRewardOverlayProps = {
  reward: MinigameBoardReward;
  minigameName?: string;
  onContinue: () => void;
};

export function PartyRewardOverlay({ reward, minigameName, onContinue }: PartyRewardOverlayProps) {
  return (
    <div className="party-reward-overlay" role="dialog" aria-modal="true" data-testid="party-reward-overlay">
      <motion.div
        className="party-reward-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        <div className="party-reward-card__burst">{reward.starEarned ? "⭐" : "🎉"}</div>
        <h2 className="text-xl font-black text-[var(--cap-ink)]">
          {reward.starEarned ? "Star Earned!" : "Minigame Complete!"}
        </h2>
        {minigameName ? (
          <p className="mt-1 text-sm font-semibold text-[var(--cap-ink-soft)]">{minigameName}</p>
        ) : null}
        <p className="mt-3 text-sm text-[var(--cap-ink)]">{reward.message}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-bold">
          {reward.coins > 0 ? <span>🪙 +{reward.coins}</span> : null}
          {reward.xp > 0 ? <span>✨ +{reward.xp} XP</span> : null}
          {reward.starEarned ? <span>⭐ +1 Star</span> : null}
        </div>
        <GameButton variant="primary" className="mt-5 w-full" onClick={onContinue}>
          Back to Board
        </GameButton>
      </motion.div>
    </div>
  );
}
