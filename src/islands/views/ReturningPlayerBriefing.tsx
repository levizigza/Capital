import type { ReturningBriefing, ReturningBriefingRefresher } from "../playerOnboarding/types";
import { pointerSafeActivate } from "../pointerSafeClick";

type Props = {
  briefing: ReturningBriefing;
  onDismiss: () => void;
  onRefresher?: (action: ReturningBriefingRefresher["action"]) => void;
};

/**
 * Concise reorientation for returning players — not a FTUE replay.
 */
export function ReturningPlayerBriefing({ briefing, onDismiss, onRefresher }: Props) {
  return (
    <div
      className="fixed inset-0 z-[12000] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-labelledby="returning-briefing-headline"
      aria-modal="true"
      data-testid="returning-player-briefing"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-amber-200/30 bg-[#0a1218] p-5 shadow-2xl sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200/90">
          Harbor briefing
        </p>
        <h2
          id="returning-briefing-headline"
          className="mt-1 text-2xl font-black text-white"
        >
          {briefing.headline}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Quick reorientation — your story and proofs are intact.
        </p>

        <div className="mt-4 space-y-3">
          {briefing.sections.map((section) => (
            <section
              key={section.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              data-testid={`returning-section-${section.id}`}
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100/90">
                {section.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-white/90">{section.body}</p>
            </section>
          ))}
        </div>

        {briefing.refreshers.length > 0 ? (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Optional refreshers
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {briefing.refreshers.map((ref) => (
                <li key={ref.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-amber-200/25 bg-black/30 px-3 py-2 text-left text-sm font-semibold text-amber-100 hover:bg-black/45"
                    data-testid={`returning-refresher-${ref.id}`}
                    {...pointerSafeActivate(() => onRefresher?.(ref.action))}
                  >
                    {ref.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          className="mt-5 min-h-12 w-full rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
          data-testid="returning-briefing-continue"
          {...pointerSafeActivate(onDismiss)}
        >
          Continue voyage
        </button>
      </div>
    </div>
  );
}
