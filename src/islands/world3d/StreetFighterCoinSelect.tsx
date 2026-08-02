import { SERIES_LEAD_MASCOT_IDS, getMascot } from "../moneyCast";
import { PLAYABLE_SELECT_CAST } from "../castLooks";
import { SERIES_SHEET_SPECS } from "../../art/seriesCast/seriesLeadArt";
import { SeriesLeadPortrait } from "../../art/seriesCast/SeriesLeadPortrait";

type Props = {
  selectedId: string;
  /** Prefer the 12 series leads on the SF board; classics optional. */
  ids?: readonly string[];
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
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #1e3a5f 0%, #0c1622 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col px-3 pb-[11.5rem] pt-20 sm:px-5 sm:pb-44 sm:pt-24">
        <div
          className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-3 content-center gap-2 sm:grid-cols-4 sm:gap-3"
          role="listbox"
          aria-label="Series lead fighters"
        >
          {boardIds.map((id) => {
            const m = getMascot(id);
            const spec = SERIES_SHEET_SPECS[id];
            const active = id === selectedId;
            const isLead = LEAD_IDS.includes(id);
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onPick(id)}
                data-testid={`sf-coin-${id}`}
                className={`group relative flex flex-col items-center gap-1 rounded-2xl border-2 p-1.5 transition sm:p-2 ${
                  active
                    ? "scale-[1.03] border-amber-300 bg-amber-200/15 shadow-[0_0_24px_rgba(251,191,36,0.35)]"
                    : "border-white/15 bg-black/35 hover:border-white/45 hover:bg-black/50"
                }`}
              >
                <div
                  className="sf-coin-spin relative h-[4.6rem] w-[4.6rem] sm:h-[5.6rem] sm:w-[5.6rem]"
                  style={{ perspective: "600px" }}
                >
                  <div
                    className="sf-coin-spin-inner absolute inset-0"
                    style={{
                      transformStyle: "preserve-3d",
                      animation: `sf-coin-y ${active ? "2.4s" : "3.6s"} linear infinite`,
                    }}
                  >
                    <div
                      className="absolute inset-0 overflow-hidden rounded-full border-[3px] shadow-lg"
                      style={{
                        borderColor: active ? "#fde68a" : spec?.accent ?? "#f4b942",
                        background: `radial-gradient(circle at 35% 30%, #fde68a, ${spec?.coin ?? "#f4b942"} 55%, #b45309)`,
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {isLead ? (
                        <SeriesLeadPortrait
                          id={id}
                          title={m.name}
                          className="h-full w-full scale-110"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-3xl font-black text-[#14532d]">
                          {m.glyph ?? m.emoji}
                        </span>
                      )}
                    </div>
                    <div
                      className="absolute inset-0 rounded-full border-[3px]"
                      style={{
                        borderColor: "#92400e",
                        background: `radial-gradient(circle at 65% 40%, #fbbf24, #d97706 60%, #78350f)`,
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }}
                      aria-hidden
                    />
                  </div>
                </div>
                <span className="w-full truncate px-0.5 text-center text-[10px] font-bold leading-tight text-white sm:text-[11px]">
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="pointer-events-none mt-2 text-center text-sm font-black text-white drop-shadow sm:text-base">
          {selected.name}
        </p>
        <p className="pointer-events-none mx-auto max-w-md text-center text-[11px] text-white/75 sm:text-xs">
          {selected.tagline}
        </p>
      </div>

      <style>{`
        @keyframes sf-coin-y {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
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
