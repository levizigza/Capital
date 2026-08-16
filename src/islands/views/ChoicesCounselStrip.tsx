/**
 * Optional counselor strip — ?choices=1 on Harbor while chasing Freedom.
 */

import {
  choicesCounselEnabled,
  harborChoicesBrief,
  WIRED_DECISION_CARDS,
} from "../meaningfulChoices";
import type { IslandSaveV1 } from "../types";

export function ChoicesCounselStrip({ save }: { save: IslandSaveV1 }) {
  if (!choicesCounselEnabled()) return null;
  const brief = harborChoicesBrief(save);
  if (!brief && !save.armedSoftBeat) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-24 left-1/2 z-[40] w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-amber-200/80 bg-amber-50/95 px-3 py-2 text-center text-xs text-amber-950 shadow-md"
      data-testid="choices-counsel-strip"
      role="status"
    >
      <div className="font-bold tracking-wide text-amber-900/80">Meaningful choices</div>
      <p className="mt-0.5 leading-snug">{brief ?? "Soft Beat · deals · vanity vs Freedom"}</p>
      <p className="mt-1 text-[10px] text-amber-800/70">
        {WIRED_DECISION_CARDS.length} wired relationships — see GAME_DESIGN_CHOICES.md
      </p>
    </div>
  );
}
