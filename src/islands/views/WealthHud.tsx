import { getWealthRank, nextWealthRank, wealthProgress } from "../wealth";

type Props = {
  totalCoins: number;
  /** Compact hides the rank label + progress bar (for simplified profiles). */
  compact?: boolean;
};

function formatCoins(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return n.toLocaleString();
}

/**
 * The points HUD — a prominent cash counter + wealth rank that sits at the top
 * of the island. You start "Flat broke" at 🪙 0 and climb toward "Tycoon".
 */
export function WealthHud({ totalCoins, compact }: Props) {
  const rank = getWealthRank(totalCoins);
  const next = nextWealthRank(totalCoins);
  const progress = wealthProgress(totalCoins);

  return (
    <div className="cap-card flex items-center gap-3 px-3 py-1.5">
      <div className="flex flex-col items-center leading-none">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Cash
        </span>
        <span className="flex items-center gap-1 font-display text-lg font-black text-[var(--cap-ink)] md:text-xl">
          <span aria-hidden>🪙</span>
          {formatCoins(totalCoins)}
        </span>
      </div>

      {!compact ? (
        <div className="flex min-w-[6.5rem] flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-bold text-[var(--cap-ink)]">
            <span aria-hidden>{rank.emoji}</span>
            {rank.label}
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--cap-paper-2)]">
            <div
              className="h-full rounded-full bg-[var(--cap-gold)] transition-[width] duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          {next ? (
            <span className="text-[0.6rem] font-semibold text-[var(--cap-ink-soft)]">
              {formatCoins(Math.max(0, next.min - totalCoins))} to {next.label}
            </span>
          ) : (
            <span className="text-[0.6rem] font-semibold text-[var(--cap-ink-soft)]">Top rank reached</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
