type Props = {
  totalCoins: number;
  /**
   * Legacy — rank ladder was number-only progression chrome.
   * WealthHud is always pouch-only; `compact` kept for call-site compat.
   * @see docs/GAME_DESIGN_PROGRESSION.md
   */
  compact?: boolean;
};

function formatCoins(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return n.toLocaleString();
}

/**
 * Cash pouch HUD — resources only.
 * Wealth rank / “to Tycoon” meters are STATUS chrome, not progression (demoted).
 */
export function WealthHud({ totalCoins }: Props) {
  return (
    <div className="cap-card flex items-center gap-3 px-3 py-1.5" data-testid="wealth-hud">
      <div className="flex flex-col items-center leading-none">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Cash
        </span>
        <span className="flex items-center gap-1 font-display text-lg font-black text-[var(--cap-ink)] md:text-xl">
          <span aria-hidden>🪙</span>
          {formatCoins(totalCoins)}
        </span>
      </div>
    </div>
  );
}
