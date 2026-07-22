/**
 * The Outfitter — a real Harbor Haven storefront you walk up to.
 * Exterior for the plaza; interior for look + pet fitting.
 */

import { motion } from "framer-motion";
import type { CapitalCharacter } from "../character";
import { CharacterAvatar } from "./CharacterAvatar";

type ExteriorProps = {
  onEnter: () => void;
  highlighted?: boolean;
  character?: CapitalCharacter;
  /** Small label under the door */
  cta?: string;
};

export function OutfitterBuilding({
  onEnter,
  highlighted = false,
  character,
  cta = "Enter shop",
}: ExteriorProps) {
  return (
    <motion.button
      type="button"
      className={`outfitter-building ${highlighted ? "outfitter-building--pulse" : ""}`}
      onClick={onEnter}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Enter the Outfitter shop"
      data-testid="outfitter-building"
    >
      <div className="outfitter-building__roof" aria-hidden>
        <span className="outfitter-building__chimney" />
      </div>
      <div className="outfitter-building__awning" aria-hidden>
        <span>OUTFITTER</span>
      </div>
      <div className="outfitter-building__facade">
        <div className="outfitter-building__window outfitter-building__window--l" aria-hidden>
          <span className="outfitter-building__mannequin">🧥</span>
        </div>
        <div className="outfitter-building__door">
          <span className="outfitter-building__door-knob" />
          {character ? (
            <div className="outfitter-building__visitor">
              <CharacterAvatar character={character} size={36} animationStyle="capital-default" />
            </div>
          ) : (
            <span className="outfitter-building__door-icon" aria-hidden>
              🚪
            </span>
          )}
        </div>
        <div className="outfitter-building__window outfitter-building__window--r" aria-hidden>
          <span className="outfitter-building__mannequin">🧢</span>
        </div>
      </div>
      <div className="outfitter-building__porch" aria-hidden />
      <div className="outfitter-building__sign">
        <span className="outfitter-building__sign-icon">🏪</span>
        <span>
          <strong>The Outfitter</strong>
          <em>{cta}</em>
        </span>
      </div>
    </motion.button>
  );
}

type InteriorProps = {
  children: React.ReactNode;
  onLeave: () => void;
};

/** Shop interior chrome — wood counter, hanging gear, warm lamps. */
export function OutfitterInterior({ children, onLeave }: InteriorProps) {
  return (
    <div className="outfitter-interior" data-testid="outfitter-interior">
      <div className="outfitter-interior__beams" aria-hidden />
      <div className="outfitter-interior__rail" aria-hidden>
        <span>🧥</span>
        <span>🎩</span>
        <span>🥽</span>
        <span>🎧</span>
        <span>🏮</span>
      </div>
      <header className="outfitter-interior__header">
        <div>
          <div className="cap-eyebrow">Harbor Haven</div>
          <h2 className="cap-display text-2xl text-[var(--cap-ink)]">Inside the Outfitter</h2>
          <p className="text-sm text-[var(--cap-ink-soft)]">
            Try on looks at the fitting mirror. Pick a companion from the dock crates.
          </p>
        </div>
        <button type="button" className="outfitter-interior__leave" onClick={onLeave}>
          ← Plaza
        </button>
      </header>
      <div className="outfitter-interior__counter">{children}</div>
    </div>
  );
}
