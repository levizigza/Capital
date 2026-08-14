/**
 * Opt-in story strip — ?story=1 shows best emergent retell.
 */

import { buildStoryTimeline, storyUiEnabled } from "../storySim";
import type { IslandSaveV1 } from "../types";

export function StorySimStrip({ save }: { save: IslandSaveV1 }) {
  if (!storyUiEnabled()) return null;
  const { bestRetell, chains } = buildStoryTimeline(save);
  if (!bestRetell && chains.length === 0) {
    return (
      <div
        className="pointer-events-none absolute bottom-28 left-1/2 z-[40] w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-rose-200/80 bg-rose-50/95 px-3 py-2 text-center text-xs text-rose-950 shadow-md"
        data-testid="story-sim-strip"
      >
        <div className="font-bold tracking-wide text-rose-900/80">Voyage Log</div>
        <p className="mt-0.5 leading-snug">
          Play the board, take deals, survive rivals — stories appear here when systems collide.
        </p>
      </div>
    );
  }
  return (
    <div
      className="pointer-events-none absolute bottom-28 left-1/2 z-[40] w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-rose-200/80 bg-rose-50/95 px-3 py-2 text-center text-xs text-rose-950 shadow-md"
      data-testid="story-sim-strip"
      role="status"
    >
      <div className="font-bold tracking-wide text-rose-900/80">You won’t believe…</div>
      <p className="mt-0.5 leading-snug">{bestRetell}</p>
    </div>
  );
}
