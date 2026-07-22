import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameButton } from "@/game-ui";
import { CharacterCreator } from "./CharacterCreator";
import { CharacterAvatar } from "./CharacterAvatar";
import { OutfitterBuilding, OutfitterInterior } from "./OutfitterBuilding";
import {
  type CapitalCharacter,
  BASE_VOYAGER,
  CHARACTER_COMPANIONS,
  companionEmoji,
} from "../character";

type Props = {
  playerName?: string;
  character?: CapitalCharacter | null;
  islandsCount: number;
  onSaveCharacter: (c: CapitalCharacter) => void;
  onComplete: () => void;
  onSkip?: () => void;
};

type Step = "arrive" | "plaza" | "inside-look" | "inside-pet" | "party" | "ready";

/**
 * Harbor Haven tutorial — wash ashore, walk to the Outfitter building,
 * go inside for looks + pet, learn Fortune Party, then practice on Cove.
 */
export function WelcomeOnboarding({
  playerName,
  character,
  islandsCount,
  onSaveCharacter,
  onComplete,
  onSkip,
}: Props) {
  const starter = useMemo<CapitalCharacter>(
    () =>
      character?.name
        ? character
        : { ...BASE_VOYAGER, name: playerName?.trim() || "Voyager" },
    [character, playerName],
  );

  const [step, setStep] = useState<Step>("arrive");
  const [draft, setDraft] = useState<CapitalCharacter>(starter);
  const pets = CHARACTER_COMPANIONS.filter((c) => c.id !== "none");

  return (
    <div className="fixed inset-0 z-[9995] overflow-y-auto cap-surface">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/80 via-[var(--cap-paper)] to-emerald-100/70" />
      <div className="absolute bottom-0 left-0 right-0 h-2/5 rounded-t-[45%] bg-gradient-to-t from-[color-mix(in_oklab,var(--cap-tide)_28%,var(--cap-paper))] to-transparent" />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === "arrive" && (
            <motion.div
              key="arrive"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-lg cap-card p-8 text-center"
            >
              <div className="mx-auto mb-4 flex justify-center">
                <CharacterAvatar character={draft} size={96} animationStyle="capital-default" />
              </div>
              <div className="cap-eyebrow mb-1">Harbor Haven · First island</div>
              <h1 className="cap-display text-3xl text-[var(--cap-ink)]">You wash ashore</h1>
              <p className="mx-auto mt-3 max-w-md text-[var(--cap-ink-soft)]">
                This is your <strong>base Voyager</strong> — plain coat, no gear, no pet yet. Ahead is the harbor
                plaza. Walk to the <strong>Outfitter</strong> building to get ready.
              </p>
              <GameButton
                variant="primary"
                size="lg"
                className="mt-6 w-full max-w-xs"
                onClick={() => {
                  onSaveCharacter(draft);
                  setStep("plaza");
                }}
              >
                Head to the plaza →
              </GameButton>
              {import.meta.env.DEV && onSkip ? (
                <button
                  type="button"
                  onClick={onSkip}
                  className="mt-3 text-xs text-[var(--cap-ink-soft)] underline-offset-4 hover:underline"
                >
                  Dev skip
                </button>
              ) : null}
            </motion.div>
          )}

          {step === "plaza" && (
            <motion.div
              key="plaza"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-xl space-y-3"
            >
              <div className="text-center">
                <div className="cap-eyebrow mb-1">Harbor plaza</div>
                <h2 className="cap-display text-2xl text-[var(--cap-ink)]">Walk up to the Outfitter</h2>
                <p className="text-sm text-[var(--cap-ink-soft)]">Tap the building to go inside.</p>
              </div>
              <div className="harbor-plaza" style={{ minHeight: "22rem" }}>
                <div className="harbor-plaza__sun" aria-hidden />
                <div className="harbor-plaza__sea" aria-hidden />
                <div className="harbor-plaza__dock" aria-hidden />
                <div className="harbor-plaza__boat harbor-plaza__carpet" aria-hidden>
                  🪄
                </div>
                <div className="harbor-plaza__street" aria-hidden />
                <div className="harbor-plaza__coach">The striped awning — that&apos;s your shop.</div>
                <div className="harbor-plaza__row" style={{ justifyContent: "center" }}>
                  <OutfitterBuilding
                    highlighted
                    character={draft}
                    cta="Go inside →"
                    onEnter={() => setStep("inside-look")}
                  />
                </div>
                <div className="harbor-plaza__voyager">
                  <CharacterAvatar character={draft} size={48} animationStyle="capital-default" />
                  <span className="harbor-plaza__voyager-label">{draft.name}</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === "inside-look" && (
            <motion.div
              key="inside-look"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-md"
            >
              <OutfitterInterior onLeave={() => setStep("plaza")}>
                <CharacterCreator
                  character={draft}
                  defaultName={draft.name || playerName}
                  variant="outfitter"
                  hideCompanion
                  saveLabel="Next: companion crates →"
                  onSave={(c) => {
                    setDraft({ ...c, companion: "none" });
                    setStep("inside-pet");
                  }}
                  onCancel={() => setStep("plaza")}
                />
              </OutfitterInterior>
            </motion.div>
          )}

          {step === "inside-pet" && (
            <motion.div
              key="inside-pet"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-md"
            >
              <OutfitterInterior onLeave={() => setStep("inside-look")}>
                <div className="flex min-h-0 flex-col gap-4 text-center">
                  <div className="mx-auto flex shrink-0 justify-center">
                    <CharacterAvatar character={draft} size={88} animationStyle="capital-default" />
                  </div>
                  <div className="shrink-0">
                    <div className="text-lg font-black">Companion crates</div>
                    <p className="text-sm text-muted-foreground">Every captain needs a sidekick.</p>
                  </div>
                  <div className="flex max-h-[40vh] flex-wrap justify-center gap-2 overflow-y-auto py-1">
                    {pets.map((pet) => {
                      const active = draft.companion === pet.id;
                      return (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, companion: pet.id }))}
                          className={`flex min-w-[5.25rem] flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition ${
                            active
                              ? "border-[var(--cap-gold)] bg-[var(--cap-gold)]/20 scale-105"
                              : "border-[var(--cap-ink)]/15 bg-white hover:border-[var(--cap-tide)]"
                          }`}
                        >
                          <span className="text-3xl">{companionEmoji(pet.id)}</span>
                          <span className="text-xs font-bold">{pet.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="sticky bottom-0 flex gap-2 border-t border-black/10 bg-[color-mix(in_oklab,#fffdf6_94%,transparent)] pt-3">
                    <GameButton variant="outline" className="flex-1" onClick={() => setStep("inside-look")}>
                      ← Looks
                    </GameButton>
                    <GameButton
                      variant="primary"
                      className="flex-1"
                      disabled={draft.companion === "none"}
                      onClick={() => {
                        onSaveCharacter(draft);
                        setStep("party");
                      }}
                    >
                      {draft.companion === "none" ? "Pick a pet first" : "Leave Outfitter →"}
                    </GameButton>
                  </div>
                </div>
              </OutfitterInterior>
            </motion.div>
          )}

          {step === "party" && (
            <motion.div
              key="party"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-lg cap-card p-8 text-center"
            >
              <div className="mx-auto mb-3 flex justify-center">
                <CharacterAvatar character={draft} size={80} animationStyle="capital-default" />
              </div>
              <div className="text-5xl mb-2">🎲</div>
              <div className="cap-eyebrow mb-1">Fortune Party tutorial</div>
              <h2 className="cap-display text-2xl text-[var(--cap-ink)]">How every island works</h2>
              <ul className="mx-auto mt-4 max-w-md space-y-2 text-left text-sm text-[var(--cap-ink-soft)]">
                <li>
                  <strong className="text-[var(--cap-ink)]">Roll the dice</strong> and move around the island board.
                </li>
                <li>
                  <strong className="text-[var(--cap-ink)]">Minigame spaces</strong> teach money skills in that island&apos;s
                  art style.
                </li>
                <li>
                  <strong className="text-[var(--cap-ink)]">Ledger Seals</strong> are the prize — race rival captains.
                </li>
                <li>
                  <strong className="text-[var(--cap-ink)]">Fortune Capsules</strong> let you raid, shield, or fog rivals.
                </li>
                <li>
                  <strong className="text-[var(--cap-ink)]">The Collector</strong> is chance — surprise fees teach risk.
                </li>
              </ul>
              <GameButton variant="primary" size="lg" className="mt-6 w-full max-w-xs" onClick={() => setStep("ready")}>
                Got it — practice on Cove →
              </GameButton>
            </motion.div>
          )}

          {step === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="w-full max-w-lg cap-card p-8 text-center"
            >
              <div className="mx-auto mb-3 flex justify-center">
                <CharacterAvatar character={draft} size={96} animationStyle="capital-default" />
              </div>
              <h2 className="cap-display text-3xl text-[var(--cap-ink)]">Practice on Coincraft Cove</h2>
              <p className="mx-auto mt-3 max-w-md text-[var(--cap-ink-soft)]">
                Next stop: the tutorial party board. Roll a few turns, try a minigame, then open the map for the other{" "}
                {Math.max(0, islandsCount - 1)} era islands — revisit the Outfitter anytime from the plaza.
              </p>
              <GameButton variant="primary" size="lg" className="mt-6 w-full max-w-xs" onClick={onComplete}>
                🎲 Start tutorial board
              </GameButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
