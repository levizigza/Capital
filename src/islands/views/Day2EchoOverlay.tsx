/**
 * Day-2 scar echo — Soft Beat cinema over the live Plinth, not a tutorial modal.
 * Wave 7 — organ-tinted so Coin / Clock / Spiral each cold-retell.
 */

import { useEffect } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import type { MoneyOrganId } from "../moneyOrgans";
import { day2EchoBody, scarOrganName } from "../worldMemory";
import { GameButton } from "@/game-ui";
import { useOverlayEscape } from "./useOverlayEscape";

type Props = {
  scarLabel: string;
  organId?: MoneyOrganId;
  onVisitPlinth: () => void;
  onDismiss: () => void;
};

const ORGAN_EYEBROW: Record<MoneyOrganId, string> = {
  memory: "text-amber-200",
  coin: "text-amber-200",
  clock: "text-sky-200",
  spiral: "text-violet-200",
};

export function Day2EchoOverlay({
  scarLabel,
  organId = "memory",
  onVisitPlinth,
  onDismiss,
}: Props) {
  useOverlayEscape(onDismiss);

  useEffect(() => {
    playCapitalSfx("plinth_hum");
    playOrganSfx(organId);
  }, [organId]);

  const organWord = scarOrganName(organId);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[42] flex flex-col justify-end"
      role="dialog"
      aria-label="Still here"
      data-testid="day2-echo-surprise"
      data-echo-presentation="plinth-cinema"
      data-nav-escape="window"
      onClick={onDismiss}
      style={{
        // Same Plinth aperture as spectacle / share — live lamp stays visible.
        background:
          "radial-gradient(ellipse 60% 50% at 62% 34%, transparent 0%, transparent 44%, rgba(15,23,42,0.28) 72%, rgba(15,23,42,0.62) 100%)",
      }}
    >
      <div
        className="relative z-10 mx-auto w-full max-w-lg px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ORGAN_EYEBROW[organId]}`}>
          Still here · {organWord}
        </p>
        <h2 className="cap-display mt-2 text-xl text-white drop-shadow sm:text-2xl">
          The Plinth did not forget
        </h2>
        <p className="mt-3 text-sm text-white/85 drop-shadow" data-testid="day2-echo-retell">
          {day2EchoBody(scarLabel, organId)}
        </p>
        <GameButton variant="primary" className="mt-4 w-full" onClick={onVisitPlinth} autoFocus>
          Visit the Plinth
        </GameButton>
        <GameButton
          variant="outline"
          className="mt-2 w-full bg-white/10"
          data-testid="day2-echo-leave"
          onClick={onDismiss}
        >
          Leave — I hear them
        </GameButton>
        <p className="mt-2 text-[11px] tracking-wide text-white/45">Esc · Leave</p>
      </div>
    </div>
  );
}
