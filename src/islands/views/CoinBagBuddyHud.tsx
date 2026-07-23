/** Compact HUD chip so Coin Bag’s tip is readable even when the 3D bubble is busy. */
export function CoinBagBuddyHud({
  tip,
  coach,
  track,
}: {
  tip: string;
  coach?: string;
  track?: "main" | "side";
}) {
  const trackLine =
    track === "main" ? "Main Quest" : track === "side" ? "Side Quest" : null;
  return (
    <div
      className="pointer-events-none max-w-md rounded-2xl border-2 border-amber-300/80 bg-[#14532d]/92 px-3 py-2 text-left shadow-lg"
      data-testid="coin-bag-buddy-hud"
      data-quest-track={track ?? undefined}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl leading-none" aria-hidden>
          🐰💰
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
            Coin Bag · your buddy
            {trackLine ? ` · ${trackLine}` : ""}
          </div>
          <div className="text-sm font-semibold text-white">→ {tip}</div>
          {coach ? <div className="mt-0.5 text-[11px] text-emerald-100/90">{coach}</div> : null}
        </div>
      </div>
    </div>
  );
}
