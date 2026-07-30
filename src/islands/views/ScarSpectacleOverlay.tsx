/**
 * Scar spectacle — Harbor reacts when money choices leave plaques.
 * Signature loop beat: hush → chime → “Harbor felt that” → Plinth glow.
 */

import { useEffect, useState } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import type { HarborScar } from "../worldMemory";
import { scarChapterTitle } from "../worldMemory";
import { signatureTiming } from "@/qa/signatureLoop";

type Props = {
  scars: HarborScar[];
  onDone: () => void;
};

export function ScarSpectacleOverlay({ scars, onDone }: Props) {
  const [phase, setPhase] = useState<"hush" | "in" | "hold" | "out">("hush");
  const latest = scars[scars.length - 1];
  const chapter = latest ? scarChapterTitle(latest) : "Harbor";
  const isCove = Boolean(latest?.id.startsWith("cove_"));
  const isClock = Boolean(
    latest?.id.startsWith("pp_") || latest?.islandId === "paycheck_peninsula",
  );
  const isSpiral = Boolean(
    latest?.id.startsWith("credit_") || latest?.islandId === "credit_kingdom",
  );
  const headline = isCove
    ? "Harbor felt your first Change"
    : isClock
      ? "Harbor felt the rainy-day Take"
      : isSpiral
        ? "Harbor felt the interest spiral"
        : "Harbor felt that choice";

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = signatureTiming(Boolean(reduced));
    playCapitalSfx("scar_chime");
    const t0 = window.setTimeout(() => {
      setPhase("in");
      playCapitalSfx("harbor_cheer");
      playCapitalSfx("plinth_hum");
    }, t.hushMs);
    const t1 = window.setTimeout(() => setPhase("hold"), t.revealMs);
    const t2 = window.setTimeout(() => setPhase("out"), t.holdEndMs);
    const t3 = window.setTimeout(onDone, t.doneMs);
    return () => {
      window.clearTimeout(t0);
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
      data-testid="scar-spectacle"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") onDone();
      }}
    >
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          phase === "hush"
            ? "bg-[#0f172a]/88 backdrop-blur-[1px]"
            : "bg-gradient-to-b from-[#0f172a]/75 via-[#1e3a5f]/55 to-[#7dd3fc]/35 backdrop-blur-[2px]"
        }`}
      />
      {phase !== "hush" ? (
        <div
          className={`relative mx-4 max-w-md rounded-2xl border border-amber-200/60 bg-[#0f172a]/90 px-6 py-5 text-center text-white shadow-2xl transition-transform duration-500 ${
            phase === "in" ? "scale-95" : "scale-100"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">
            Money is alive
          </p>
          <h2 className="mt-2 text-xl font-black leading-snug sm:text-2xl">
            {headline}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {chapter}
            {latest ? ` · ${latest.label}` : ""}
          </p>
          <p className="mt-3 text-xs text-white/60">
            Memory Plinth glowing · Piggy cheering · tap to continue
          </p>
        </div>
      ) : (
        <p className="relative text-sm font-semibold tracking-wide text-white/70">…</p>
      )}
    </div>
  );
}
