/**
 * Signature trailer cut — ~24s mute-friendly captions + cast silhouettes over Harbor.
 * Replay from Memory Plinth; QA can force via __QA__.playSignatureTrailer().
 */

import { useEffect, useState } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import {
  SIGNATURE_TRAILER_SHOTS,
  signatureTiming,
} from "@/qa/signatureLoop";
import { GameButton } from "@/game-ui";
import { useOverlayEscape } from "./useOverlayEscape";

type Props = {
  open: boolean;
  onDone: () => void;
  scarLabel?: string | null;
};

function TrailerCastSilhouettes() {
  return (
    <div
      className="pointer-events-none mb-4 flex items-end justify-center gap-5"
      aria-hidden
      data-testid="signature-trailer-cast"
    >
      {/* Piggy silhouette */}
      <div className="relative h-16 w-14">
        <div className="absolute bottom-0 left-1/2 h-10 w-12 -translate-x-1/2 rounded-[45%] bg-rose-300/85" />
        <div className="absolute bottom-8 left-1/2 h-7 w-8 -translate-x-1/2 rounded-full bg-rose-200/90" />
        <div className="absolute bottom-10 left-[18%] h-2.5 w-2.5 rounded-full bg-rose-100/90" />
        <div className="absolute bottom-10 right-[18%] h-2.5 w-2.5 rounded-full bg-rose-100/90" />
      </div>
      {/* Memory Plinth — one Harbor icon (open ledger + scar lamp) */}
      <div
        className="relative h-[4.5rem] w-16"
        data-testid="trailer-plinth-icon"
      >
        <div className="absolute bottom-0 left-1/2 h-2 w-14 -translate-x-1/2 rounded-sm bg-stone-400/90" />
        <div className="absolute bottom-2 left-[18%] h-12 w-[1.35rem] -skew-y-6 rounded-sm bg-amber-50/95" />
        <div className="absolute bottom-2 right-[18%] h-12 w-[1.35rem] skew-y-6 rounded-sm bg-amber-50/95" />
        <div className="absolute bottom-2 left-1/2 h-12 w-1 -translate-x-1/2 bg-amber-900/70" />
        <div className="absolute bottom-[3.35rem] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.85)]" />
      </div>
      {/* Coin Bag silhouette */}
      <div className="relative h-14 w-12">
        <div className="absolute bottom-0 left-1/2 h-10 w-11 -translate-x-1/2 rounded-[40%] bg-amber-300/85" />
        <div className="absolute bottom-8 left-1/2 h-3 w-6 -translate-x-1/2 rounded-full bg-amber-200/90" />
        <div className="absolute bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-amber-100/70" />
      </div>
    </div>
  );
}

export function SignatureTrailerOverlay({ open, onDone, scarLabel }: Props) {
  const [caption, setCaption] = useState(SIGNATURE_TRAILER_SHOTS[0]!.caption);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const musicOn = capitalMusic.isEnabled();
    const timing = signatureTiming(Boolean(reduced));
    // Mute-friendly: captions carry the story; SFX only when music is on and motion is full
    const sfxOk = musicOn && !reduced;
    if (sfxOk) playCapitalSfx("scar_chime");

    const timers: number[] = [];
    const scale = timing.trailerBeatMs / 24_000;

    for (const shot of SIGNATURE_TRAILER_SHOTS) {
      timers.push(
        window.setTimeout(() => {
          setCaption(
            shot.caption === "Harbor felt that" && scarLabel
              ? `Harbor felt that — “${scarLabel}”`
              : shot.caption,
          );
          if (sfxOk && shot.atMs >= 7000) playCapitalSfx("plinth_hum");
          if (sfxOk && shot.atMs >= 12_000) playCapitalSfx("harbor_cheer");
        }, Math.round(shot.atMs * scale)),
      );
    }

    const tick = window.setInterval(() => {
      setProgress((p) => Math.min(1, p + 0.05));
    }, timing.trailerBeatMs / 20);

    timers.push(
      window.setTimeout(() => {
        onDone();
      }, timing.trailerBeatMs),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(tick);
    };
  }, [open, onDone, scarLabel]);

  useOverlayEscape(onDone, open);

  if (!open) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[45] flex flex-col items-center justify-end bg-gradient-to-t from-[#0f172a] via-[#0f172a]/55 to-transparent pb-16 pt-8"
      role="dialog"
      aria-label="Signature Harbor trailer"
      data-testid="signature-trailer"
      data-nav-escape="window"
      onClick={onDone}
    >
      <div className="mx-4 max-w-lg text-center" onClick={(e) => e.stopPropagation()}>
        <TrailerCastSilhouettes />
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-200/80">
          Capital · Signature beat
        </p>
        <h2
          key={caption}
          className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl"
          data-testid="signature-trailer-caption"
        >
          {caption}
        </h2>
        <GameButton
          variant="outline"
          className="mt-4 bg-white/10"
          data-testid="signature-trailer-leave"
          onClick={onDone}
        >
          Leave — skip trailer
        </GameButton>
        <p className="mt-2 text-xs text-white/55">Esc · Leave · mute-friendly captions</p>
      </div>
      <div className="absolute inset-x-8 bottom-6 h-1 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full bg-amber-300/90 transition-[width] duration-200"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
