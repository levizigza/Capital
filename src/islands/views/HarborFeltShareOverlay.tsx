/**
 * Default social object after scar spectacle — organ-tinted share card.
 * Full-bleed cinema, not a settings modal.
 * Cold-retell polish: organ word in the kid-facing sentence.
 */

import { GameButton } from "@/game-ui";
import type { MoneyOrganId } from "../moneyOrgans";
import { scarOrganName } from "../worldMemory";

type Props = {
  scarLabel: string;
  chapter?: string | null;
  organId?: MoneyOrganId | null;
  previewUrl: string | null;
  onShare: () => void;
  onKeepWalking: () => void;
};

export function HarborFeltShareOverlay({
  scarLabel,
  chapter,
  organId = "memory",
  previewUrl,
  onShare,
  onKeepWalking,
}: Props) {
  const organWord = scarOrganName(organId ?? "memory");
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[45] flex items-center justify-center bg-[#0f172a]/78 backdrop-blur-[2px]"
      role="dialog"
      aria-label="Harbor felt that share card"
      data-testid="harbor-felt-share"
    >
      <div className="relative mx-4 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-amber-200/55 bg-[#0f172a]/94 px-5 py-5 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
          Harbor felt that · {organWord}
        </p>
        <h2 className="text-xl font-black leading-snug sm:text-2xl">
          This is the card people remember
        </h2>
        <p className="text-sm text-white/80" data-testid="harbor-felt-retell">
          Harbor remembered the {organWord}: “{scarLabel}.”
          {chapter ? ` (${chapter})` : ""}
        </p>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Harbor felt that share card"
            className="mx-auto max-h-52 w-auto rounded-xl border border-amber-200/35"
            data-testid="harbor-felt-preview"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-slate-800/80 text-xs text-white/50">
            Painting the Plinth…
          </div>
        )}
        <GameButton
          variant="primary"
          className="w-full"
          data-testid="harbor-felt-download"
          onClick={onShare}
          autoFocus
        >
          Share “Harbor felt that”
        </GameButton>
        <GameButton variant="outline" className="w-full bg-white/10" onClick={onKeepWalking}>
          Keep walking — find Piggy
        </GameButton>
      </div>
    </div>
  );
}
