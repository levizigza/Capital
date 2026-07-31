/**
 * Slim objective strip — one glanceable next-step (BOTW / Hades style).
 * Persistent HUD stays thin; detail lives in menus / Talk, not stacked banners.
 */

type Props = {
  tip: string;
  /** Short supporting line — shown only when present and not redundant with tip */
  detail?: string;
  guideArrows?: boolean;
  onToggleGuide?: () => void;
  /** Optional quest track tag */
  track?: "main" | "side";
};

export function CoinBagBuddyHud({
  tip,
  detail,
  guideArrows = true,
  onToggleGuide,
  track,
}: Props) {
  // Quieter plaza: tip wins; coach detail stays collapsed unless it adds a new fact.
  const showDetail =
    Boolean(detail) &&
    detail!.trim().length > 0 &&
    detail!.trim().length <= 72 &&
    !tip.toLowerCase().includes(detail!.toLowerCase().slice(0, 18));

  return (
    <div
      className="cap-objective"
      data-testid="coin-bag-buddy-hud"
      data-quest-track={track ?? undefined}
      data-guide-arrows={guideArrows ? "1" : "0"}
      role="status"
      aria-live="polite"
    >
      <span className="cap-objective__icon" aria-hidden>
        🐰
      </span>
      <div className="cap-objective__body">
        <p className="cap-objective__tip">
          {guideArrows ? (
            <>
              <span className="cap-objective__arrow" aria-hidden>
                →
              </span>{" "}
              {tip}
            </>
          ) : (
            tip
          )}
        </p>
        {showDetail ? <p className="cap-objective__detail">{detail}</p> : null}
      </div>
      {onToggleGuide ? (
        <button
          type="button"
          onClick={onToggleGuide}
          className="cap-objective__mute"
          data-testid="toggle-guide-arrows"
          title={guideArrows ? "Hide guide arrows" : "Show guide arrows"}
          aria-pressed={!guideArrows}
        >
          {guideArrows ? "Hide guide" : "Show guide"}
        </button>
      ) : null}
    </div>
  );
}
