/**
 * Default social object after scar spectacle — Plinth freeze-frame.
 * Live Harbor (and the peaked lamp) stay visible in the upper aperture;
 * the PNG freezes in the lower band — not a centered settings card.
 */

import { useEffect } from "react";
import { GameButton } from "@/game-ui";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import type { MoneyOrganId } from "../moneyOrgans";
import { capitalOrganEyebrow } from "../titleVoice";
import {
  coldRetellLine,
  nextPaintingAfterScar,
  organVerbChip,
  type HarborScar,
} from "../worldMemory";
import { triggerJuice } from "@/juice";

type Props = {
  scarLabel: string;
  chapter?: string | null;
  organId?: MoneyOrganId | null;
  /** Optional scar ids so share can name the newly open painting */
  scarMeta?: Pick<HarborScar, "id" | "islandId"> | null;
  previewUrl: string | null;
  onShare: () => void;
  onKeepWalking: () => void;
};

export function HarborFeltShareOverlay({
  scarLabel,
  chapter,
  organId = "memory",
  scarMeta = null,
  previewUrl,
  onShare,
  onKeepWalking,
}: Props) {
  const organ = organId ?? "memory";
  const retell = coldRetellLine({
    id: scarMeta?.id ?? "",
    islandId: scarMeta?.islandId ?? "",
    label: scarLabel,
  });
  const nextPainting = scarMeta ? nextPaintingAfterScar(scarMeta) : null;

  useEffect(() => {
    playOrganSfx(organ);
    playCapitalSfx("plinth_hum");
  }, [organ]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[45] flex flex-col"
      role="dialog"
      aria-label="Harbor felt that share card"
      data-testid="harbor-felt-share"
      data-share-presentation="plinth-freeze"
      data-plinth-aperture="live"
      style={{
        // Punch a clear hole over MEMORY_PLINTH_CINEMA_EYE framing (~62% / 36%).
        background:
          "radial-gradient(ellipse 58% 48% at 62% 34%, transparent 0%, transparent 46%, rgba(15,23,42,0.18) 70%, rgba(15,23,42,0.62) 100%)",
      }}
    >
      {/* Live Plinth aperture — keep the peaked lamp readable above the freeze */}
      <div className="pointer-events-none relative min-h-[28vh] flex-1" aria-hidden data-testid="harbor-felt-plinth-aperture" />

      {/* Freeze plane — lower band so it never covers the live lamp */}
      <div className="pointer-events-none relative z-[1] flex shrink-0 justify-center px-3 pb-1 pt-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Harbor felt that — Memory Plinth freeze"
            className="max-h-[min(32vh,280px)] w-auto max-w-[min(88vw,400px)] object-contain drop-shadow-[0_12px_40px_rgba(15,23,42,0.55)]"
            data-testid="harbor-felt-preview"
          />
        ) : (
          <div
            className="flex h-28 w-48 items-center justify-center text-center text-xs text-white/55"
            data-testid="harbor-felt-preview-loading"
          >
            Freezing the Plinth…
          </div>
        )}
      </div>

      {/* Lower-third cinema chrome — retell + share actions */}
      <div className="relative z-10 mx-auto w-full max-w-lg px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/80">
          {capitalOrganEyebrow(organId)} · Harbor felt that
        </p>
        <h2 className="cap-display mt-1.5 text-xl text-white drop-shadow sm:text-2xl">
          Money left footprints
        </h2>
        <p className="mt-1.5 text-sm text-white/85 drop-shadow" data-testid="harbor-felt-retell">
          {retell}
          {chapter ? ` (${chapter})` : ""}
        </p>
        {nextPainting ? (
          <p
            className="mt-1.5 text-[12px] font-semibold tracking-wide text-amber-100/85"
            data-testid="harbor-felt-newly-true"
          >
            Newly true: {organVerbChip(organ)} on the Plinth · {nextPainting} open on the Carpet
          </p>
        ) : (
          <p
            className="mt-1.5 text-[12px] font-semibold tracking-wide text-amber-100/85"
            data-testid="harbor-felt-newly-true"
          >
            Newly true: {organVerbChip(organ)} on the Plinth
          </p>
        )}
        <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <GameButton
            variant="primary"
            className="w-full sm:min-w-[12rem] sm:flex-1"
            data-testid="harbor-felt-download"
            onClick={(e) => {
              triggerJuice("accept", { target: e.currentTarget });
              triggerJuice("reward", {
                burst: true,
                target: e.currentTarget,
                x: typeof window !== "undefined" ? window.innerWidth * 0.5 : undefined,
                y: typeof window !== "undefined" ? window.innerHeight * 0.72 : undefined,
              });
              onShare();
            }}
            autoFocus
          >
            Share “Harbor felt that”
          </GameButton>
          <GameButton
            variant="outline"
            className="w-full bg-white/10 sm:min-w-[12rem] sm:flex-1"
            data-testid="harbor-felt-keep-walking"
            onClick={(e) => {
              triggerJuice("accept", { target: e.currentTarget });
              onKeepWalking();
            }}
          >
            Keep walking — find Piggy
          </GameButton>
        </div>
      </div>
    </div>
  );
}
