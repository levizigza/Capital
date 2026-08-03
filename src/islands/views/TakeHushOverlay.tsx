/**
 * Signature Take cinema — world stays visible; captions only (combine chamber).
 * Cove / Paycheck / Credit organ landmark holds the climax — no modal card.
 * Kid sentence lands here so carpet home already knows the retell.
 */

import { useEffect, useState } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import type { MoneyOrganId } from "../moneyOrgans";
import { signatureTiming, type TakeCinemaPhase } from "@/qa/signatureLoop";
import { prefersReducedMotion } from "../a11yMotion";
import { capitalOrganEyebrow } from "../titleVoice";
import { coldOrganKidSentence, scarOrganName } from "../worldMemory";
import { triggerJuice } from "@/juice";
import { useOverlayEscape } from "./useOverlayEscape";
import { pointerSafeActivate } from "../pointerSafeClick";

export type { TakeCinemaPhase };

type Props = {
  scarLabel: string;
  /** @deprecated Prefer kid sentence from organId — kept for callers */
  organLine?: string;
  /** Wave 6 — which organ bed ducks during the hush */
  organId?: MoneyOrganId;
  islandId?: string;
  onDone: () => void;
  /** Drive Coin Jar / Tower / Keep mark flash in the shore scene */
  onPhaseChange?: (phase: TakeCinemaPhase) => void;
};

export function TakeHushOverlay({
  scarLabel,
  organId = "coin",
  islandId = "coincraft_cove",
  onDone,
  onPhaseChange,
}: Props) {
  const [phase, setPhase] = useState<TakeCinemaPhase>("hush");
  useOverlayEscape(onDone);

  useEffect(() => {
    const t = signatureTiming(prefersReducedMotion());
    playCapitalSfx("scar_chime");
    playOrganSfx(organId);
    capitalMusic.playPlace({
      kind: "shore",
      islandId,
      hush: true,
    });
    onPhaseChange?.("hush");

    const tMark = window.setTimeout(() => {
      setPhase("mark");
      onPhaseChange?.("mark");
      // Irreversible mark — distinct from Soft Beat lookout (mute-test Take beat).
      playCapitalSfx("take_mark");
      // Hit-stop nudge when the organ mark flashes (juice checklist).
      triggerJuice("reward", { burst: true });
    }, t.hushMs);

    const tLine = window.setTimeout(() => {
      setPhase("line");
      onPhaseChange?.("line");
    }, t.revealMs);

    // doneMs (not holdEndMs) — cold unseeded path needs the Carpet CTA beat.
    const tEnd = window.setTimeout(onDone, t.doneMs);
    return () => {
      window.clearTimeout(tMark);
      window.clearTimeout(tLine);
      window.clearTimeout(tEnd);
    };
  }, [onDone, onPhaseChange, organId, islandId]);

  const organWord = scarOrganName(organId);
  const kidSentence = coldOrganKidSentence(organId);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] flex flex-col justify-end"
      role="dialog"
      aria-label="Quiet after the Take"
      data-testid="take-hush-overlay"
      data-cinema-phase={phase}
      data-nav-escape="window"
      tabIndex={0}
      {...pointerSafeActivate(onDone)}
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 50% 42%, transparent 0%, transparent 45%, rgba(15,23,42,0.35) 78%, rgba(15,23,42,0.62) 100%)",
      }}
    >
      {/* Edge lower-third — same family as Plinth spectacle (no card chrome). */}
      <div className="pointer-events-none mx-auto w-full max-w-xl px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-8 text-center">
        {phase === "hush" ? (
          <p
            className="cap-display text-sm tracking-[0.35em] text-white/55"
            data-testid="take-cinema-hush"
          >
            …
          </p>
        ) : null}

        {phase === "mark" ? (
          <div data-testid="take-cinema-mark">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/80">
              {capitalOrganEyebrow(organId)}
            </p>
            <p className="cap-display mt-2 text-2xl text-white drop-shadow sm:text-3xl">
              A {organWord} choice you can’t undo
            </p>
          </div>
        ) : null}

        {phase === "line" ? (
          <div data-testid="take-cinema-line">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/80">
              Quiet after the Take · {organWord}
            </p>
            <p
              className="cap-display mt-2 text-xl text-white drop-shadow sm:text-2xl"
              data-testid="take-cinema-kid-sentence"
            >
              {kidSentence}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-amber-50 drop-shadow">
              “{scarLabel}”
            </p>
            <p
              className="mt-3 text-sm font-black tracking-wide text-amber-100 drop-shadow"
              data-testid="take-cinema-home-cta"
            >
              Carpet home — Harbor felt that
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-white/70">
              Esc · Leave · board the Money Carpet
            </p>
          </div>
        ) : (
          <p className="mt-6 text-[11px] tracking-wide text-white/55">Esc · Leave</p>
        )}
      </div>
    </div>
  );
}
