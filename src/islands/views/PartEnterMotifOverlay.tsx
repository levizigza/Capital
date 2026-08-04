/**
 * Short lower-third before structure part arcade dump —
 * jar cork-pop / bank dial-spin (not a settings card).
 */

import { useEffect } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";
import type { PartEnterMotif } from "../structurePartEnter";
import { useOverlayEscape } from "./useOverlayEscape";

type Props = {
  motif: PartEnterMotif;
  onDone: () => void;
};

export function PartEnterMotifOverlay({ motif, onDone }: Props) {
  useOverlayEscape(onDone);

  useEffect(() => {
    playOrganSfx(motif.organ);
    if (!prefersReducedMotion()) {
      playCapitalSfx(
        motif.id === "cork-pop" || motif.id === "dial-spin" ? "take_mark" : "soft_beat",
      );
    }
    const ms = Math.round(motif.durationMs * cinemaTimeScale());
    if (ms <= 0) {
      onDone();
      return;
    }
    const t = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(t);
  }, [motif.durationMs, motif.id, motif.organ, onDone]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[72] flex items-end justify-center bg-[#0f172a]/45"
      role="dialog"
      aria-label={motif.title}
      data-testid="part-enter-motif"
      data-part-enter={motif.id}
      data-organ={motif.organ}
      data-nav-escape="window"
      onClick={onDone}
    >
      <div className="mb-[12vh] w-full max-w-xl px-4 text-center text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
          {motif.eyebrow}
        </p>
        <h2 className="mt-1 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
          {motif.title}
        </h2>
        <p className="mt-2 text-sm text-white/85">{motif.line}</p>
        <p
          className="mt-2 text-sm font-semibold text-amber-100"
          data-testid="part-enter-kid-sentence"
        >
          {motif.kidSentence}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-wider text-white/45">Tap · Esc · Leave</p>
      </div>
    </div>
  );
}
