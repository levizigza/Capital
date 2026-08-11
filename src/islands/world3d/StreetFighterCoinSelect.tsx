import { SERIES_LEAD_MASCOT_IDS, getMascot } from "../moneyCast";
import { PLAYABLE_SELECT_CAST } from "../castLooks";
import { SERIES_SHEET_SPECS } from "../../art/seriesCast/seriesLeadArt";
import { SeriesCoinFace, hasSeriesCoinFace } from "../../art/seriesCast/SeriesCoinFace";
import { pointerSafeActivate } from "../pointerSafeClick";

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
 * Street Fighter–style select: every fighter as a rocking coin face,
 * all visible at once. HTML/CSS 3D so taps always work (no WebGL steal).
 */
export function StreetFighterCoinSelect({
  selectedId,
  ids,
  onFocus,
  onPick,
  className,
}: Props) {
  const boardIds = ids ?? LEAD_IDS;

  return (
    <div
      className={`${className ?? "absolute inset-0"} z-0 overflow-hidden`}
      data-testid="sf-coin-select"
      data-selected={selectedId}
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 40%, #1a3a5c 0%, #0a1628 55%, #050a12 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(253,230,138,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(253,230,138,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col px-2 py-1 sm:px-4 sm:py-2">
        <div
          className="mx-auto grid h-full w-full max-w-6xl grid-cols-3 content-center gap-2 sm:grid-cols-4 sm:gap-3"
          role="listbox"
          aria-label="Series lead fighters"
        >
          {boardIds.map((id, index) => {
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
                {...pointerSafeActivate(() => onPick(id))}
                onFocus={() => onFocus?.(id)}
                onMouseEnter={() => onFocus?.(id)}
                data-testid={`sf-coin-${id}`}
                className={`relative flex min-h-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 py-2 touch-manipulation sm:gap-1.5 sm:p-2.5 ${
                  active
                    ? "border-amber-300 bg-amber-200/20 shadow-[0_0_32px_rgba(251,191,36,0.45)]"
                    : "border-white/15 bg-black/45 hover:border-amber-200/50 hover:bg-black/60"
                }`}
              >
                <span
                  className="pointer-events-none absolute left-1.5 top-1 text-[9px] font-black tracking-wider text-white/45 sm:text-[10px]"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className="sf-coin-spin relative aspect-square w-[78%] max-w-[6.75rem] sm:max-w-[7.5rem]"
                  style={{ perspective: "800px" }}
                >
                  <div
                    className="sf-coin-spin-inner absolute inset-0"
                    style={{
                      transformStyle: "preserve-3d",
                      animation: `sf-coin-rock ${active ? "2.2s" : "3.1s"} ease-in-out infinite`,
                    }}
                  >
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
                <span
                  className="w-full truncate px-0.5 text-center text-[11px] font-black leading-tight sm:text-xs"
                  style={{ color: "#fffdf6", textShadow: "0 1px 3px rgba(0,0,0,0.95)" }}
                >
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes sf-coin-rock {
          0% { transform: rotateY(-28deg); }
          50% { transform: rotateY(28deg); }
          100% { transform: rotateY(-28deg); }
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
