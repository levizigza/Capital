import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameButton } from "@/game-ui";
import { CharacterCreator } from "./CharacterCreator";
import { CharacterAvatar } from "./CharacterAvatar";
import { type CapitalCharacter, DEFAULT_CHARACTER } from "../character";

type Props = {
  playerName?: string;
  character?: CapitalCharacter | null;
  islandsCount: number;
  onSaveCharacter: (c: CapitalCharacter) => void;
  onComplete: () => void;
  onSkip?: () => void;
};

const DOORS = [
  { icon: "🧑", title: "Your Character", copy: "Change your look anytime from the home base." },
  { icon: "⛵", title: "Voyage Map", copy: "Sail your boat between islands — bigger boats unlock as you earn coins." },
  { icon: "🕹️", title: "The Arcade", copy: "Quick money games sorted by type and difficulty." },
  { icon: "✨", title: "VibeCode Studio", copy: "Build and share your own levels — especially on Future Shores." },
  { icon: "🏗️", title: "Future Shores", copy: "An unfinished island for the kids of the future to carve out." },
];

export function WelcomeOnboarding({
  playerName,
  character,
  islandsCount,
  onSaveCharacter,
  onComplete,
  onSkip,
}: Props) {
  const [step, setStep] = useState(0);
  const [savedChar, setSavedChar] = useState<CapitalCharacter | null>(character ?? null);

  const next = () => setStep((s) => s + 1);

  return (
    <div className="fixed inset-0 z-[9995] overflow-y-auto cap-surface">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-t-[45%] bg-gradient-to-t from-[color-mix(in_oklab,var(--cap-tide)_22%,var(--cap-paper))] to-transparent" />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-lg cap-card p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150 }}
                className="mx-auto mb-3 text-6xl"
              >
                🏝️
              </motion.div>
              <div className="cap-eyebrow mb-1">Welcome aboard</div>
              <h1 className="cap-display text-4xl text-[var(--cap-ink)]">Capital</h1>
              <p className="mx-auto mt-3 max-w-md text-[var(--cap-ink-soft)]">
                Capital is a world of islands{playerName ? `, ${playerName}` : ""} — each one a different little
                game world with its own look, stories, and money adventures. This is your{" "}
                <span className="font-bold text-[var(--cap-tide-deep)]">home base</span>. Let's get you ready to explore.
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                <GameButton variant="primary" size="lg" className="w-full max-w-xs" onClick={next}>
                  Let's go! →
                </GameButton>
                {onSkip && (
                  <button onClick={onSkip} className="text-sm text-[var(--cap-ink-soft)] underline-offset-4 hover:underline">
                    Skip intro
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Character creation */}
          {step === 1 && (
            <motion.div
              key="character"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-md cap-card p-6"
            >
              <CharacterCreator
                character={savedChar ?? { ...DEFAULT_CHARACTER, name: playerName ?? "" }}
                defaultName={playerName}
                saveLabel="That's me! →"
                onSave={(c) => {
                  setSavedChar(c);
                  onSaveCharacter(c);
                  next();
                }}
              />
            </motion.div>
          )}

          {/* STEP 2 — Tour of the home base */}
          {step === 2 && (
            <motion.div
              key="tour"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-lg cap-card p-8 text-center"
            >
              <div className="mb-4 flex items-center justify-center gap-3">
                {savedChar && <CharacterAvatar character={savedChar} size={64} />}
                <div className="text-left">
                  <div className="cap-eyebrow">Home base</div>
                  <h2 className="cap-display text-2xl text-[var(--cap-ink)]">Here's what you can do</h2>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {DOORS.map((d, i) => (
                  <motion.div
                    key={d.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="rounded-2xl border-2 border-[var(--cap-ink)]/12 bg-[var(--cap-paper)] p-4 text-left"
                  >
                    <div className="text-3xl">{d.icon}</div>
                    <div className="mt-1 font-bold text-[var(--cap-ink)]">{d.title}</div>
                    <div className="text-sm text-[var(--cap-ink-soft)]">{d.copy}</div>
                  </motion.div>
                ))}
              </div>
              <GameButton variant="primary" size="lg" className="mt-6 w-full max-w-xs" onClick={next}>
                Show me the map →
              </GameButton>
            </motion.div>
          )}

          {/* STEP 3 — Set sail */}
          {step === 3 && (
            <motion.div
              key="sail"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-lg cap-card p-8 text-center"
            >
              <motion.div
                animate={{ x: [0, 8, 0], rotate: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2.4 }}
                className="mx-auto mb-3 text-6xl"
              >
                ⛵
              </motion.div>
              <h2 className="cap-display text-3xl text-[var(--cap-ink)]">Ready to explore</h2>
              <p className="mx-auto mt-3 max-w-md text-[var(--cap-ink-soft)]">
                {islandsCount} island{islandsCount === 1 ? "" : "s"} are waiting on the Travel Map. Start with the
                first one, then branch out wherever your curiosity takes you. Your progress saves automatically.
              </p>
              <GameButton variant="primary" size="lg" className="mt-6 w-full max-w-xs" onClick={onComplete}>
                🧭 Set sail
              </GameButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
