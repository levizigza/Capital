/**
 * Scar spectacle — Harbor reacts when money choices leave plaques.
 * Signature loop beat: hush → chime → “Harbor felt that” → Plinth glow.
 * World cinema: captions over the Memory Plinth (camera locks in Harbor view).
 */

import { useEffect, useRef, useState } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import type { HarborScar } from "../worldMemory";
import {
  coldRetellLine,
  coldSpectacleHeadline,
  plaqueShelfLine,
  scarOrganName,
  scarOrganId,
} from "../worldMemory";
import { signatureTiming } from "@/qa/signatureLoop";

export type SpectacleCinemaPhase = "hush" | "in" | "hold" | "out";

type Props = {
  scars: HarborScar[];
  onDone: () => void;
  onPhaseChange?: (phase: SpectacleCinemaPhase) => void;
};

export function ScarSpectacleOverlay({ scars, onDone, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<SpectacleCinemaPhase>("hush");
  const latest = scars[scars.length - 1];
  const organWord = latest ? scarOrganName(scarOrganId(latest)) : "Memory";
  const headline = latest ? coldSpectacleHeadline(latest) : "Harbor felt that choice";
  const retell = latest ? coldRetellLine(latest) : null;
  const shelf = latest ? plaqueShelfLine(latest) : null;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = signatureTiming(Boolean(reduced));
    playCapitalSfx("scar_chime");
    onPhaseChangeRef.current?.("hush");

    const t0 = window.setTimeout(() => {
      setPhase("in");
      onPhaseChangeRef.current?.("in");
      playCapitalSfx("harbor_cheer");
      playCapitalSfx("plinth_hum");
    }, t.hushMs);
    const t1 = window.setTimeout(() => {
      setPhase("hold");
      onPhaseChangeRef.current?.("hold");
    }, t.revealMs);
    const t2 = window.setTimeout(() => {
      setPhase("out");
      onPhaseChangeRef.current?.("out");
    }, t.holdEndMs);
    const t3 = window.setTimeout(() => onDoneRef.current(), t.doneMs);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const showLine = phase !== "hush";

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-[40] flex flex-col justify-end transition-opacity duration-500 ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Harbor remembers your choice"
      data-testid="scar-spectacle"
      data-cinema-phase={phase}
      tabIndex={0}
      onClick={() => onDoneRef.current()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") onDoneRef.current();
      }}
      style={{
        background:
          phase === "hush"
            ? "radial-gradient(ellipse 65% 50% at 62% 38%, transparent 0%, transparent 40%, rgba(15,23,42,0.45) 78%, rgba(15,23,42,0.72) 100%)"
            : "radial-gradient(ellipse 70% 55% at 62% 36%, transparent 0%, transparent 42%, rgba(15,23,42,0.28) 72%, rgba(15,23,42,0.55) 100%)",
      }}
    >
      <div className="pointer-events-none mx-auto w-full max-w-xl px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-8 text-center">
        {!showLine ? (
          <p className="cap-display text-sm tracking-[0.35em] text-white/55">…</p>
        ) : null}
        <div
          className={`transition-all duration-500 ${
            showLine
              ? phase === "in"
                ? "translate-y-1 opacity-95"
                : "translate-y-0 opacity-100"
              : "sr-only"
          }`}
          aria-hidden={!showLine}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/80">
            Harbor felt that · {organWord}
          </p>
          <h2 className="cap-display mt-2 text-xl text-white drop-shadow sm:text-2xl">
            {headline}
          </h2>
          <p
            className="mt-2 text-sm text-white/85 drop-shadow"
            data-testid="scar-spectacle-retell"
          >
            {retell ?? shelf}
          </p>
          <p className="mt-3 text-[11px] tracking-wide text-white/50">
            {organWord} Plinth · Money is alive · Click or Esc
          </p>
        </div>
      </div>
    </div>
  );
}
