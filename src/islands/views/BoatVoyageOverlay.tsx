import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { CapitalCharacter } from "../character";
import { getAnimationStyle, type AnimationStyleId } from "../animationStyles";
import { type BoatTier } from "../boats";

type Props = {
  boat: BoatTier;
  character?: CapitalCharacter;
  /** Morph into the destination island's art style during the crossing */
  targetAnimationStyle: AnimationStyleId;
  destinationName: string;
  onComplete: () => void;
};

/**
 * First-person POV boat crossing — you're at the wheel, looking over the bow as
 * the sea rushes toward you and the destination island grows on the horizon.
 */
export function BoatVoyageOverlay({
  boat,
  targetAnimationStyle,
  destinationName,
  onComplete,
}: Props) {
  const era = getAnimationStyle(targetAnimationStyle);
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className={`pov-voyage ${reduced ? "" : "pov-throttle"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pov-sun" aria-hidden />
      <div className="pov-sea" aria-hidden />
      <div className="pov-speed" aria-hidden />

      {/* Destination island growing as we approach */}
      <motion.div
        className="pov-island"
        aria-hidden
        initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0.25, opacity: 0.6, y: 8 }}
        animate={{ scale: reduced ? 1 : 2.4, opacity: 1, y: reduced ? 0 : -30 }}
        transition={{ duration: reduced ? 0.3 : 2.6, ease: "easeIn" }}
      >
        🏝️
      </motion.div>

      {/* Foreground boat cockpit / POV */}
      <div className="pov-bow" aria-hidden />
      <div className="pov-spray pov-spray--l" aria-hidden />
      <div className="pov-spray pov-spray--r" aria-hidden />
      <div className="pov-wheel" role="img" aria-label="steering wheel">
        🛞
      </div>

      {/* Heads-up text */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 pt-[8vh] text-center">
        <div className="cap-eyebrow text-[var(--cap-ink)]">Full speed ahead</div>
        <h2 className="cap-display text-2xl text-[var(--cap-ink)] md:text-3xl">
          Bound for {destinationName}
        </h2>
        <p className="max-w-sm text-sm text-[var(--cap-ink)]/80">
          Crossing into <span className="font-bold text-[var(--cap-ink)]">{era.eraLabel}</span> waters —{" "}
          {era.tagline}
        </p>
      </div>

      <div className="absolute bottom-3 left-0 right-0 z-10 text-center text-xs font-bold uppercase tracking-widest text-[var(--cap-ink)]/70">
        {boat.emoji} {boat.label} · at the helm
      </div>
    </motion.div>
  );
}
