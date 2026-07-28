/**
 * Scar spectacle — Harbor reacts when money choices leave plaques.
 * CSS/DOM only so perfSoft Harbor still feels alive.
 */

import { useEffect, useState } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import type { HarborScar } from "../worldMemory";
import { scarChapterTitle } from "../worldMemory";

type Props = {
  scars: HarborScar[];
  onDone: () => void;
};

export function ScarSpectacleOverlay({ scars, onDone }: Props) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const latest = scars[scars.length - 1];
  const chapter = latest ? scarChapterTitle(latest) : "Harbor";

  useEffect(() => {
    playCapitalSfx("scar_chime");
    playCapitalSfx("harbor_cheer");
    const t1 = window.setTimeout(() => setPhase("hold"), 500);
    const t2 = window.setTimeout(() => setPhase("out"), 3200);
    const t3 = window.setTimeout(onDone, 3900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-[40] flex items-center justify-center transition-opacity duration-500 ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Harbor remembers your choice"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") onDone();
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/75 via-[#1e3a5f]/55 to-[#7dd3fc]/35 backdrop-blur-[2px]" />
      <div
        className={`relative mx-4 max-w-md rounded-2xl border border-amber-200/60 bg-[#0f172a]/90 px-6 py-5 text-center text-white shadow-2xl transition-transform duration-500 ${
          phase === "in" ? "scale-95" : "scale-100"
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">
          Money is alive
        </p>
        <h2 className="mt-2 text-xl font-black leading-snug sm:text-2xl">
          Harbor felt that choice
        </h2>
        <p className="mt-2 text-sm text-white/85">
          {chapter}
          {latest ? ` · ${latest.label}` : ""}
        </p>
        <p className="mt-3 text-xs text-white/60">
          Plaques on the Memory Plinth · Piggy is cheering · tap to continue
        </p>
      </div>
    </div>
  );
}
