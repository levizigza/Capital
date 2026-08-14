/**
 * Opt-in curiosity shelf — ?curiosity=1.
 * Lists open player questions this save can still answer. Not a completion meter.
 */

import {
  curiosityUiEnabled,
  openCuriosityQuestions,
  CURIOSITY_HOOKS,
  hasCuriosityInsight,
} from "../curiosityDiscovery";
import type { IslandSaveV1 } from "../types";

export function CuriosityShelfStrip({ save }: { save: IslandSaveV1 }) {
  if (!curiosityUiEnabled()) return null;
  const open = openCuriosityQuestions(save);
  const found = CURIOSITY_HOOKS.filter((h) => hasCuriosityInsight(save, h.id)).length;

  return (
    <div
      className="pointer-events-none absolute top-20 right-3 z-[40] w-[min(90vw,20rem)] rounded-xl border border-teal-200/80 bg-teal-50/95 px-3 py-2 text-left text-xs text-teal-950 shadow-md"
      data-testid="curiosity-shelf-strip"
      role="status"
    >
      <div className="font-bold tracking-wide text-teal-900/80">Curiosity shelf</div>
      <p className="mt-0.5 text-[10px] text-teal-800/70">
        {found} answered · {open.length} still open — investigate, don’t grind
      </p>
      {open.length > 0 ? (
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 leading-snug">
          {open.slice(0, 4).map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 leading-snug">Every wired question found a reward — climb Soft Beats anytime.</p>
      )}
    </div>
  );
}
