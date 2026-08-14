import { getBoatTier, nextBoatTier } from "../boats";
import { wealthProgress } from "../wealth";

type Props = {
  totalCoins: number;
  /** Compact hides the carpet tier + progress (for simplified profiles). */
  compact?: boolean;
};

function formatCoins(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return n.toLocaleString();
}

/**
 * Pouch HUD + carpet tier — one progress metaphor (no parallel wealth ranks).
 * Canon: GAME_DESIGN_COMPLEXITY.md
 */
export function WealthHud({ totalCoins, compact }: Props) {
  const tier = getBoatTier(totalCoins);
  const next = nextBoatTier(totalCoins);
  const progress = wealthProgress(totalCoins);

  return (
    <div className="cap-card flex items-center gap-3 px-3 py-1.5" data-testid="wealth-hud">
      <div className="flex flex-col items-center leading-none">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Pouch
        </span>
        <span className="flex items-center gap-1 font-display text-lg font-black text-[var(--cap-ink)] md:text-xl">
          <span aria-hidden>🪙</span>
          {formatCoins(totalCoins)}
        </span>
      </div>

      {!compact ? (
        <div className="flex min-w-[6.5rem] flex-col gap-1" data-testid="wealth-hud-carpet">
          <span className="flex items-center gap-1 text-xs font-bold text-[var(--cap-ink)]">
            <span aria-hidden>{tier.emoji}</span>
            {tier.label}
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--cap-paper-2)]">
            <div
              className="h-full rounded-full bg-[var(--cap-gold)] transition-[width] duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          {next ? (
            <span className="text-[0.6rem] font-semibold text-[var(--cap-ink-soft)]">
              {formatCoins(Math.max(0, next.minCoins - totalCoins))} to {next.label}
            </span>
          ) : (
            <span className="text-[0.6rem] font-semibold text-[var(--cap-ink-soft)]">
              Top carpet reached
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
