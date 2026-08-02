import { SERIES_LEAD_MASCOT_IDS, getMascot } from "../moneyCast";
import { PLAYABLE_SELECT_CAST } from "../castLooks";
import { SERIES_SHEET_SPECS } from "../../art/seriesCast/seriesLeadArt";
import { SeriesCoinFace, hasSeriesCoinFace } from "../../art/seriesCast/SeriesCoinFace";

type Props = {
  selectedId: string;
  /** Prefer the 12 series leads on the SF board; classics optional. */
  ids?: readonly string[];
  /** Highlight / preview without leaving the board. */
  onFocus?: (id: string) => void;
  /** Enter full 3D body + customize. */
  onPick: (id: string) => void;
  className?: string;
};

const LEAD_IDS = SERIES_LEAD_MASCOT_IDS as readonly string[];

/**
 * Street Fighter–style select: every fighter as a spinning coin face,
 * all visible at once. HTML/CSS 3D so taps always work (no WebGL steal).
 * Tap a coin → parent opens full 3D body + customize.
 */
export function StreetFighterCoinSelect({
  selectedId,
  ids,
  onFocus,
  onPick,
  className,
}: Props) {
  const boardIds = ids ?? LEAD_IDS;
  const selected = getMascot(selectedId);

  return (
    <div
      className={`${className ?? "absolute inset-0"} z-0 overflow-hidden bg-[#0c1622]`}
      data-testid="sf-coin-select"
      data-selected={selectedId}
    >
      <div
        className="absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 35%, #1e3a5f 0%, #0c1622 72%)",
        }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col px-2 py-2 sm:px-4 sm:py-3">
        <div
          className="mx-auto grid h-full w-full max-w-5xl grid-cols-3 content-center gap-1.5 sm:grid-cols-4 sm:gap-2.5"
          role="listbox"
          aria-label="Series lead fighters"
        >
          {boardIds.map((id) => {
            const m = getMascot(id);
            const spec = SERIES_SHEET_SPECS[id];
            const active = id === selectedId;
            const faceOk = hasSeriesCoinFace(id);
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onPick(id)}
                onFocus={() => onFocus?.(id)}
                onMouseEnter={() => onFocus?.(id)}
                data-testid={`sf-coin-${id}`}
                className={`group relative flex min-h-0 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-1.5 transition sm:gap-1 sm:p-2 ${
                  active
                    ? "scale-[1.03] border-amber-300 bg-amber-200/20 shadow-[0_0_28px_rgba(251,191,36,0.4)]"
                    : "border-white/15 bg-black/40 hover:border-white/45 hover:bg-black/55"
                }`}
              >
                <div
                  className="sf-coin-spin relative aspect-square w-[72%] max-w-[5.75rem] sm:max-w-[6.5rem]"
                  style={{ perspective: "700px" }}
                >
                  <div
                    className="sf-coin-spin-inner absolute inset-0"
                    style={{
                      transformStyle: "preserve-3d",
                      animation: `sf-coin-rock ${active ? "2.4s" : "3.2s"} ease-in-out infinite`,
                    }}
                  >
                    {/* Face on both sides — rock (not full spin) so fighters stay readable. */}
                    <div
                      className="absolute inset-0 overflow-hidden rounded-full border-[3px] shadow-lg"
                      style={{
                        borderColor: active ? "#fde68a" : spec?.accent ?? "#f4b942",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {faceOk ? (
                        <SeriesCoinFace id={id} title={m.name} className="h-full w-full" />
                      ) : (
                        <span
                          className="flex h-full w-full items-center justify-center text-3xl font-black"
                          style={{
                            background: `radial-gradient(circle at 35% 30%, #fde68a, ${spec?.coin ?? "#f4b942"} 55%, #b45309)`,
                            color: "#14532d",
                          }}
                        >
                          {m.glyph ?? m.emoji}
                        </span>
                      )}
                    </div>
                    <div
                      className="absolute inset-0 overflow-hidden rounded-full border-[3px]"
                      style={{
                        borderColor: active ? "#fde68a" : spec?.accent ?? "#f4b942",
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }}
                      aria-hidden
                    >
                      {faceOk ? (
                        <SeriesCoinFace id={id} title={m.name} className="h-full w-full" />
                      ) : null}
                    </div>
                  </div>
                </div>
                <span className="w-full truncate px-0.5 text-center text-[10px] font-bold leading-tight text-white sm:text-[11px]">
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="pointer-events-none mt-1 shrink-0 text-center text-sm font-black text-white drop-shadow sm:text-base">
          {selected.name}
        </p>
        <p className="pointer-events-none mx-auto max-w-md shrink-0 text-center text-[11px] text-white/75 sm:text-xs">
          {selected.tagline}
        </p>
      </div>

      <style>{`
        @keyframes sf-coin-rock {
          0% { transform: rotateY(-32deg); }
          50% { transform: rotateY(32deg); }
          100% { transform: rotateY(-32deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sf-coin-spin-inner { animation: none !important; }
        }
      `}</style>

      <span className="sr-only" data-testid="sf-coin-count">
        {boardIds.length}
      </span>
      <span className="sr-only">{PLAYABLE_SELECT_CAST.length}</span>
    </div>
  );
}

export const SF_SELECT_LEAD_COUNT = LEAD_IDS.length;
