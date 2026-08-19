/**
 * Legacy Creative-mode trophy diorama.
 * Product path (Fortune Archipelago) keeps scars/plaques — not trophy fill-%.
 * This component stays as a no-op shell so old imports do not resurrect badge chrome.
 */

import { BIBLE_RUNTIME_LAWS } from "@/design/designBible";

const TrophyRoom3D = ({ trophies }: { trophies: Array<{ color: string }> }) => {
  if (BIBLE_RUNTIME_LAWS.hideAchievementDashboardsOnProductPath) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-center text-xs text-stone-500"
        data-testid="trophy-room-retired"
      >
        Trophy room retired — Harbor remembers plaques, not badge shelves.
        {trophies.length > 0 ? (
          <span className="sr-only">{trophies.length} legacy trophies ignored</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="h-40 rounded-xl bg-stone-100" data-testid="trophy-room-legacy">
      {/* Legacy placeholder — never the product progress surface. */}
    </div>
  );
};

export default TrophyRoom3D;
