/**
 * Day-2 scar echo — Soft Beat tone, not a tutorial modal.
 */

import { useEffect } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import { GameButton } from "@/game-ui";

type Props = {
  scarLabel: string;
  onVisitPlinth: () => void;
  onDismiss: () => void;
};

export function Day2EchoOverlay({ scarLabel, onVisitPlinth, onDismiss }: Props) {
  useEffect(() => {
    playCapitalSfx("plinth_hum");
  }, []);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[42] flex items-center justify-center bg-[#0f172a]/72 backdrop-blur-[1px]"
      role="dialog"
      aria-label="Still here"
      data-testid="day2-echo-surprise"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === "Escape") onDismiss();
      }}
    >
      <div
        className="relative mx-4 max-w-md rounded-2xl border border-sky-200/40 bg-[#0f172a]/92 px-6 py-5 text-center text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Still here</p>
        <h2 className="mt-2 text-xl font-black sm:text-2xl">The Plinth did not forget</h2>
        <p className="mt-3 text-sm text-white/85">
          Locals still tip their jars about “{scarLabel}.” Yesterday’s Take is today’s weather.
        </p>
        <GameButton variant="primary" className="mt-4 w-full" onClick={onVisitPlinth} autoFocus>
          Visit the Plinth
        </GameButton>
        <GameButton variant="outline" className="mt-2 w-full bg-white/10" onClick={onDismiss}>
          I hear them
        </GameButton>
      </div>
    </div>
  );
}
