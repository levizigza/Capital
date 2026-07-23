import { useCallback, useEffect } from "react";
import { GameButton } from "@/game-ui";
import type { CapitalCharacter } from "../character";
import { CHARACTER_COMPANIONS, companionEmoji } from "../character";
import { CharacterCreator } from "../views/CharacterCreator";
import { OutfitterStudio3D } from "./OutfitterStudio3D";
import { ownsCompanion, companionPrice, STARTER_COMPANION_ID } from "../harborShop";
import type { IslandSaveV1 } from "../types";

type Stage = "look" | "pet";

type Props = {
  draft: CapitalCharacter;
  setDraft: (c: CapitalCharacter | ((d: CapitalCharacter) => CapitalCharacter)) => void;
  stage: Stage;
  setStage: (s: Stage) => void;
  save: IslandSaveV1;
  defaultName?: string;
  /** Always commits the current draft (look + pet) then closes. */
  onLeave: () => void;
  onSaveLook: (c: CapitalCharacter) => void;
  /** Commit look + pet to save. Prefer passing the resolved character. */
  onAdoptPet: (character?: CapitalCharacter) => void;
  onHarborPurchase: (price: number, companionId: string) => boolean;
};

/**
 * Full-bleed 3D Outfitter — Snapchat-style layers over a live mannequin.
 * Plaza Canvas must be unmounted while this is open.
 * Leave / Esc always commits the current draft so plaza matches the fitting room.
 */
export function OutfitterStudioOverlay({
  draft,
  setDraft,
  stage,
  setStage,
  save,
  defaultName,
  onLeave,
  onSaveLook,
  onAdoptPet,
  onHarborPurchase,
}: Props) {
  const pets = CHARACTER_COMPANIONS.filter((c) => c.id !== "none");

  const commitAndLeave = useCallback(() => {
    const companionId = draft.companion === "none" ? STARTER_COMPANION_ID : draft.companion;
    const next: CapitalCharacter = { ...draft, companion: companionId };
    const price = companionPrice(companionId);
    const owned = ownsCompanion(save, companionId);

    if (!owned && price > 0) {
      const ok = onHarborPurchase(price, companionId);
      if (!ok) {
        // Stay in the fitting room — player can pick Slow Coin (free) or another pet.
        setDraft(next);
        return;
      }
    } else {
      onHarborPurchase(0, companionId);
    }
    setDraft(next);
    onAdoptPet(next);
    onLeave();
  }, [draft, save, onHarborPurchase, onAdoptPet, onLeave, setDraft]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        commitAndLeave();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [commitAndLeave]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      data-testid="outfitter-studio-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Outfitter fitting room"
    >
      <OutfitterStudio3D character={draft} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

      <header className="relative z-[2] flex items-start justify-between gap-3 p-3 sm:p-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
            Harbor Haven · 3D Outfitter
          </div>
          <h2 className="text-xl font-black text-white drop-shadow sm:text-2xl">Become you</h2>
          <p className="max-w-md text-xs text-white/80 sm:text-sm">
            Body · Coat · Gear on the live mirror. Esc or Save & leave keeps your look on the plaza.
          </p>
        </div>
        <button
          type="button"
          onClick={commitAndLeave}
          className="rounded-full border-2 border-white/35 bg-black/45 px-3 py-1.5 text-sm font-bold text-white hover:bg-black/60"
          data-testid="outfitter-leave"
        >
          ✕ Save & leave
        </button>
      </header>

      <div className="relative z-[2] mt-auto w-full px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/15 bg-black/50 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          {stage === "look" ? (
            <CharacterCreator
              character={draft}
              defaultName={defaultName}
              variant="outfitter"
              hideCompanion
              preview="none"
              saveLabel="Next: pick a pet →"
              onDraftChange={setDraft}
              onCancel={commitAndLeave}
              onSave={(c) => {
                setDraft({ ...c, companion: draft.companion });
                onSaveLook(c);
                setStage("pet");
              }}
            />
          ) : (
            <div className="flex min-h-0 flex-col gap-3 text-center text-white">
              <div>
                <div className="text-lg font-black">Companion crates</div>
                <p className="text-sm text-white/75">
                  Slow Coin is free forever. Paid pets only charge when you can afford them —
                  otherwise stay here and pick another.
                </p>
              </div>
              <div className="flex max-h-[32vh] flex-wrap justify-center gap-2 overflow-y-auto py-1">
                {pets.map((pet) => {
                  const active = draft.companion === pet.id;
                  const price = companionPrice(pet.id);
                  const owned = ownsCompanion(save, pet.id);
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, companion: pet.id }))}
                      className={`flex min-w-[5.25rem] flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition ${
                        active
                          ? "scale-105 border-amber-300 bg-amber-200/90 text-[#1c1917]"
                          : "border-white/25 bg-black/40 text-white hover:border-white/55"
                      }`}
                    >
                      <span className="text-3xl">{companionEmoji(pet.id)}</span>
                      <span className="text-xs font-bold">{pet.label}</span>
                      <span className="text-[10px] font-semibold opacity-80">
                        {owned || price === 0 ? (price === 0 ? "Free" : "Owned") : `🪙 ${price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <GameButton
                  variant="outline"
                  className="flex-1 border-white/40 bg-black/35 text-white hover:bg-black/50"
                  onClick={() => setStage("look")}
                >
                  ← Looks
                </GameButton>
                <GameButton variant="primary" className="flex-1" onClick={commitAndLeave}>
                  {draft.companion === "none"
                    ? "Take free Slow Coin ✓"
                    : ownsCompanion(save, draft.companion) || companionPrice(draft.companion) === 0
                      ? "Save & leave ✓"
                      : `Adopt · 🪙 ${companionPrice(draft.companion)}`}
                </GameButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
