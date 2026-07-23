/** Compact HUD chip so Coin Bag’s tip is readable even when the 3D bubble is busy. */
export function CoinBagBuddyHud({
  tip,
  coach,
  track,
  guideArrows = true,
  onToggleGuide,
}: {
  tip: string;
  coach?: string;
  track?: "main" | "side";
  /** When false, wayfinder arrows are muted for free roam / side quests */
  guideArrows?: boolean;
  onToggleGuide?: () => void;
}) {
  const trackLine =
    track === "main" ? "Main Quest" : track === "side" ? "Side Quest" : null;
  return (
    <div
      className="max-w-md rounded-2xl border-2 border-amber-300/80 bg-[#14532d]/92 px-3 py-2 text-left shadow-lg"
      data-testid="coin-bag-buddy-hud"
      data-quest-track={track ?? undefined}
      data-guide-arrows={guideArrows ? "1" : "0"}
    >
      <div className="flex items-start gap-2">
        <span className="pointer-events-none text-2xl leading-none" aria-hidden>
          🐰💰
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="pointer-events-none text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
              Coin Bag · your buddy
              {trackLine ? ` · ${trackLine}` : ""}
            </div>
            {onToggleGuide ? (
              <button
                type="button"
                onClick={onToggleGuide}
                className="shrink-0 rounded-full border border-amber-200/40 bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-amber-100/95 hover:bg-black/40"
                data-testid="toggle-guide-arrows"
                title={
                  guideArrows
                    ? "Hide guide arrows — free roam / side quests"
                    : "Show guide arrows again"
                }
              >
                {guideArrows ? "Ignore arrow" : "Show guide"}
              </button>
            ) : null}
          </div>
          <div className="pointer-events-none text-sm font-semibold text-white">
            {guideArrows ? `→ ${tip}` : tip}
          </div>
          {coach ? (
            <div className="pointer-events-none mt-0.5 text-[11px] text-emerald-100/90">
              {guideArrows ? coach : "Guide muted — wander freely. Tap Show guide anytime."}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
