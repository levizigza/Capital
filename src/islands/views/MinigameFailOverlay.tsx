/**
 * Player-facing fail after a minigame miss — dignity + retry + stay put.
 */

import { useEffect } from "react";
import { GameButton } from "@/game-ui";
import { type MinigameFailCopy } from "../minigameFail";

export type MinigameFailOverlayProps = {
  copy: MinigameFailCopy;
  onRetry: () => void;
  onKeepWalking: () => void;
};

export function MinigameFailOverlay({ copy, onRetry, onKeepWalking }: MinigameFailOverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onKeepWalking();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKeepWalking]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="minigame-fail-title"
      data-testid="minigame-fail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onKeepWalking();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--cap-ink)]/10 bg-[linear-gradient(165deg,#fffbeb_0%,#f8fafc_55%,#ecfeff_100%)] p-5 shadow-xl sm:p-6"
        data-testid="minigame-fail-card"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--cap-ink-soft)]">
          {copy.eyebrow}
        </p>
        <h2
          id="minigame-fail-title"
          className="cap-display mt-2 text-2xl text-[var(--cap-ink)]"
          data-testid="minigame-fail-title"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--cap-ink)]">{copy.body}</p>
        <p
          className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm font-semibold text-amber-950"
          data-testid="minigame-fail-hint"
        >
          {copy.hint}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <GameButton
            variant="primary"
            className="flex-1"
            data-testid="minigame-fail-retry"
            onClick={onRetry}
            autoFocus
          >
            {copy.retryLabel}
          </GameButton>
          <GameButton
            variant="outline"
            className="flex-1"
            data-testid="minigame-fail-walk"
            onClick={onKeepWalking}
          >
            {copy.walkLabel}
          </GameButton>
        </div>
        <p className="mt-3 text-center text-[11px] tracking-wide text-[var(--cap-ink-soft)]">
          Esc · stay where you are
        </p>
      </div>
    </div>
  );
}
