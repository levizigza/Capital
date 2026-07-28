/**
 * Signature trailer cut — ~24s mute-friendly captions over Harbor.
 * Replay from Memory Plinth; QA can force via __QA__.playSignatureTrailer().
 */

import { useEffect, useState } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import {
  SIGNATURE_TRAILER_SHOTS,
  signatureTiming,
} from "@/qa/signatureLoop";

type Props = {
  open: boolean;
  onDone: () => void;
  scarLabel?: string | null;
};

export function SignatureTrailerOverlay({ open, onDone, scarLabel }: Props) {
  const [caption, setCaption] = useState(SIGNATURE_TRAILER_SHOTS[0]!.caption);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timing = signatureTiming(Boolean(reduced));
    playCapitalSfx("scar_chime");

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
          if (shot.atMs >= 7000) playCapitalSfx("plinth_hum");
          if (shot.atMs >= 12_000) playCapitalSfx("harbor_cheer");
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

  if (!open) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[45] flex flex-col items-center justify-end bg-gradient-to-t from-[#0f172a] via-[#0f172a]/55 to-transparent pb-16 pt-8"
      role="dialog"
      aria-label="Signature Harbor trailer"
      data-testid="signature-trailer"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") onDone();
      }}
    >
      <div className="mx-4 max-w-lg text-center">
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
        <p className="mt-3 text-xs text-white/55">Tap to skip · mute-friendly</p>
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
