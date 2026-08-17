/**
 * Default social object after scar spectacle — Plinth freeze-frame.
 * Live Harbor (and the peaked lamp) stay visible in the upper aperture;
 * the PNG freezes in the lower band — not a centered settings card.
 */

import { useEffect, useState } from "react";
import { GameButton } from "@/game-ui";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import type { MoneyOrganId } from "../moneyOrgans";
import { capitalOrganEyebrow } from "../titleVoice";
import {
  coldOrganKidSentence,
  coldRetellLine,
  nextPaintingAfterScar,
  organVerbChip,
  type HarborScar,
} from "../worldMemory";
import { triggerJuice } from "@/juice";
import { useOverlayEscape } from "./useOverlayEscape";
import type { FamilyWitnessReaction } from "../familyRoom";
import { WITNESS_REACTION_LABEL } from "../familyRoom";

type Props = {
  scarLabel: string;
  chapter?: string | null;
  organId?: MoneyOrganId | null;
  /** Optional scar ids so share can name the newly open painting */
  scarMeta?: Pick<HarborScar, "id" | "islandId"> | null;
  previewUrl: string | null;
  onShare: () => void;
  onKeepWalking: () => void;
  /**
   * Hand the device to someone nearby — their judgment is the social play.
   * Soft stamp only; never edits ledger/scar.
   */
  onWitness?: (opts: { witnessName: string; reaction: FamilyWitnessReaction }) => void;
  /** Settings high-contrast — strengthen lower-third retell panel. */
  highContrast?: boolean;
};

export function HarborFeltShareOverlay({
  scarLabel,
  chapter,
  organId = "memory",
  scarMeta = null,
  previewUrl,
  onShare,
  onKeepWalking,
  onWitness,
  highContrast = false,
}: Props) {
  const organ = organId ?? "memory";
  const [witnessOpen, setWitnessOpen] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [witnessDone, setWitnessDone] = useState(false);
  const retell = coldRetellLine({
    id: scarMeta?.id ?? "",
    islandId: scarMeta?.islandId ?? "",
    label: scarLabel,
  });
  const nextPainting = scarMeta ? nextPaintingAfterScar(scarMeta) : null;

  useOverlayEscape(onKeepWalking);

  useEffect(() => {
    // Share lands the same mute-test resolve as spectacle — Harbor felt that.
    playCapitalSfx("harbor_felt");
    playOrganSfx(organ);
    playCapitalSfx("plinth_hum");
  }, [organ]);

  const stampWitness = (reaction: FamilyWitnessReaction) => {
    if (!onWitness) return;
    onWitness({
      witnessName: witnessName.trim() || "Someone nearby",
      reaction,
    });
    setWitnessDone(true);
    setWitnessOpen(false);
  };
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[45] flex flex-col"
      role="dialog"
      aria-label="Harbor felt that share card"
      data-testid="harbor-felt-share"
      data-share-presentation="plinth-freeze"
      data-plinth-aperture="live"
      data-nav-escape="window"
      onClick={(e) => {
        if (e.target === e.currentTarget) onKeepWalking();
      }}
      style={{
        // Punch a clear hole over MEMORY_PLINTH_CINEMA_EYE framing (~62% / 36%).
        background:
          "radial-gradient(ellipse 58% 48% at 62% 34%, transparent 0%, transparent 46%, rgba(15,23,42,0.18) 70%, rgba(15,23,42,0.62) 100%)",
      }}
    >
      {/* Live Plinth aperture — keep the peaked lamp readable above the freeze */}
      <div
        className="pointer-events-none relative min-h-[22vh] flex-1"
        aria-hidden
        data-testid="harbor-felt-plinth-aperture"
      />

      {/* Freeze plane — lower band so it never covers the live lamp */}
      <div className="pointer-events-none relative z-[1] flex shrink-0 justify-center px-3 pb-1 pt-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Harbor felt that — Memory Plinth freeze"
            className="max-h-[min(28vh,240px)] w-auto max-w-[min(88vw,400px)] object-contain drop-shadow-[0_12px_40px_rgba(15,23,42,0.55)]"
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

      {/* Sticky lower-third — high-contrast panel so organ retell reads at thumbnail size */}
      <div className="relative z-10 mx-auto w-full max-w-lg shrink-0 px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <div
          className={`rounded-2xl px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md ${
            highContrast
              ? "border-2 border-white bg-[#020617] text-white"
              : "border border-amber-100/35 bg-[#0b1220]/92"
          }`}
          data-testid="harbor-felt-lower-third"
          data-high-contrast={highContrast ? "1" : "0"}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-100">
            {capitalOrganEyebrow(organId)} · Harbor felt that
          </p>
          <h2 className="cap-display mt-1.5 text-xl text-[#fffdf6] sm:text-2xl">
            Money left footprints
          </h2>
          <p
            className="mt-1.5 text-sm font-semibold leading-snug text-[#fffdf6]"
            data-testid="harbor-felt-retell"
          >
            {retell}
            {chapter ? ` (${chapter})` : ""}
          </p>
          <p
            className="mt-1 text-[12px] font-bold leading-snug text-amber-50/95"
            data-testid="harbor-felt-kid-sentence"
          >
            {coldOrganKidSentence(organ)}
          </p>
          {nextPainting ? (
            <p
              className="mt-1.5 text-[12px] font-bold tracking-wide text-amber-100"
              data-testid="harbor-felt-newly-true"
            >
              Newly true: {organVerbChip(organ)} on the Plinth · {nextPainting} open on the Carpet
            </p>
          ) : (
            <p
              className="mt-1.5 text-[12px] font-bold tracking-wide text-amber-100"
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
              className="w-full border-white/40 bg-white/15 text-white sm:min-w-[12rem] sm:flex-1"
              data-testid="harbor-felt-keep-walking"
              onClick={(e) => {
                triggerJuice("accept", { target: e.currentTarget });
                onKeepWalking();
              }}
            >
              Leave — find Piggy
            </GameButton>
          </div>
          {onWitness ? (
            <div className="mt-3 text-left" data-testid="harbor-felt-witness">
              {witnessDone ? (
                <p className="text-center text-[11px] font-semibold text-amber-100/90">
                  Witness stamped — soft myth only. Your plaque stays yours.
                </p>
              ) : witnessOpen ? (
                <div className="rounded-xl border border-white/20 bg-black/35 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-amber-100/90">
                    Hand the device — their judgment is the play
                  </p>
                  <input
                    className="mt-2 w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/40"
                    placeholder="Their name"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    data-testid="harbor-felt-witness-name"
                    maxLength={64}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["cheer", "caution", "curious"] as const).map((r) => (
                      <GameButton
                        key={r}
                        variant="outline"
                        className="flex-1 border-white/30 bg-white/10 text-white"
                        data-testid={`harbor-felt-witness-${r}`}
                        onClick={() => stampWitness(r)}
                      >
                        {WITNESS_REACTION_LABEL[r]}
                      </GameButton>
                    ))}
                  </div>
                  <GameButton
                    variant="ghost"
                    className="mt-1 w-full text-white/70"
                    onClick={() => setWitnessOpen(false)}
                  >
                    Cancel
                  </GameButton>
                </div>
              ) : (
                <GameButton
                  variant="ghost"
                  className="w-full text-amber-50/90"
                  data-testid="harbor-felt-witness-open"
                  onClick={() => setWitnessOpen(true)}
                >
                  Someone nearby? Ask them to stamp
                </GameButton>
              )}
            </div>
          ) : null}
          <p className="mt-2 text-[11px] font-semibold tracking-wide text-white/80">Esc · Leave</p>
        </div>
      </div>
    </div>
  );
}
