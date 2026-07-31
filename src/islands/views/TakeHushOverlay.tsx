/**
 * Signature Take beat — fires on the island the moment the choice sticks.
 * Cove → hush → carpet home → Harbor felt that.
 */

import { useEffect, useState } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import { GameButton } from "@/game-ui";
import { signatureTiming } from "@/qa/signatureLoop";
import { systemPrefersReducedMotion } from "../a11yMotion";

type Props = {
  scarLabel: string;
  organLine?: string;
  onDone: () => void;
};

export function TakeHushOverlay({
  scarLabel,
  organLine = "The Coin holds. Harbor is already listening.",
  onDone,
}: Props) {
  const [phase, setPhase] = useState<"hush" | "line">("hush");

  useEffect(() => {
    const t = signatureTiming(systemPrefersReducedMotion());
    playCapitalSfx("scar_chime");
    const t0 = window.setTimeout(() => setPhase("line"), t.hushMs);
    const t1 = window.setTimeout(onDone, t.holdEndMs);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [onDone]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-[2px]"
      role="dialog"
      aria-label="Quiet after the Take"
      data-testid="take-hush-overlay"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") onDone();
      }}
    >
      {phase === "hush" ? (
        <p className="relative text-sm font-semibold tracking-[0.3em] text-white/60">…</p>
      ) : (
        <div className="relative mx-4 max-w-md rounded-2xl border border-amber-200/50 bg-[#0f172a]/92 px-6 py-5 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
            Quiet after the Take
          </p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">A choice you can’t undo</h2>
          <p className="mt-2 text-sm text-white/85">“{scarLabel}”</p>
          <p className="mt-3 text-xs text-white/65">{organLine}</p>
          <GameButton variant="primary" className="mt-4" onClick={onDone}>
            Board the carpet home
          </GameButton>
        </div>
      )}
    </div>
  );
}
