import { useCallback, useEffect } from "react";
import type { CapitalCharacter } from "../character";
import { CHARACTER_COMPANIONS, companionEmoji } from "../character";
import { CharacterCreator } from "../views/CharacterCreator";
import { OutfitterStudio3D } from "./OutfitterStudio3D";
import { StreetFighterCoinSelect } from "./StreetFighterCoinSelect";
import { ownsCompanion, companionPrice, STARTER_COMPANION_ID } from "../harborShop";
import { PLAYABLE_SELECT_CAST, sheetLookForBase } from "../castLooks";
import { getMascot, SERIES_LEAD_MASCOT_IDS } from "../moneyCast";
import type { IslandSaveV1 } from "../types";

type Stage = "select" | "look" | "pet";

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

  const boardIds = [
    ...SERIES_LEAD_MASCOT_IDS,
    ...PLAYABLE_SELECT_CAST.filter((id) => !(SERIES_LEAD_MASCOT_IDS as readonly string[]).includes(id)),
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#0c1622]"
      data-testid="outfitter-studio-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Outfitter fitting room"
    >
      <header className="relative z-10 flex shrink-0 items-start justify-between gap-3 px-3 pb-1 pt-3 sm:px-4 sm:pt-4">
        <div>
          <div
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#fde68a" }}
          >
            Harbor Haven · 3D Outfitter
          </div>
          <h2
            className="text-xl font-black sm:text-2xl"
            style={{ color: "#fffdf6", textShadow: "0 2px 12px rgba(0,0,0,0.85)" }}
          >
            {stage === "select" ? "Choose your fighter" : getMascot(draft.base).name}
          </h2>
          <p className="max-w-md text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
            {stage === "select"
              ? "Tap a coin face for the full 3D body, then Snapchat-customize."
              : "Looks · Shirt · Pants · Accessories · Electronics. Esc keeps your look on the plaza."}
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

      <div className="relative min-h-0 flex-1">
        {stage === "select" ? (
          <StreetFighterCoinSelect
            selectedId={draft.base}
            ids={boardIds}
            onFocus={(id) => {
              setDraft((d) => sheetLookForBase(id, d.name || defaultName || getMascot(id).name));
            }}
            onPick={(id) => {
              setDraft((d) => sheetLookForBase(id, d.name || defaultName || getMascot(id).name));
              setStage("look");
            }}
            className="absolute inset-0"
          />
        ) : (
          <OutfitterStudio3D
            character={draft}
            className="absolute inset-0"
            mode="solo"
            pointerEvents="none"
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45"
          aria-hidden
        />
      </div>

      <div
        className="relative z-20 shrink-0 border-t border-white/10 bg-black/90 px-3 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-4 sm:py-4"
        data-testid="outfitter-dock"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-xl">
          {stage === "select" ? (
            <div className="flex min-h-0 flex-col gap-3 text-center text-white">
              <div>
                <div className="text-lg font-black">{getMascot(draft.base).name}</div>
                <p className="text-sm text-white/75">
                  Tap a spinning coin above — full 3D body opens next.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="min-h-11 flex-1 rounded-2xl border-2 border-white/40 bg-black/45 px-3 text-sm font-bold text-white hover:bg-black/60"
                  onClick={commitAndLeave}
                >
                  Save & leave
                </button>
                <button
                  type="button"
                  className="min-h-11 flex-1 rounded-2xl border-2 border-[#1c1917] bg-[var(--cap-gold,#f4b942)] px-3 text-sm font-black text-[#1c1917] shadow-[2px_2px_0_#1c1917]"
                  onClick={() => setStage("look")}
                  data-testid="outfitter-confirm-fighter"
                >
                  Customize on mirror →
                </button>
              </div>
            </div>
          ) : stage === "look" ? (
            <CharacterCreator
              character={draft}
              defaultName={defaultName}
              variant="outfitter"
              hideCompanion
              preview="none"
              chrome="dark"
              saveLabel="Next: pick a pet →"
              onDraftChange={setDraft}
              onCancel={commitAndLeave}
              onChangeFighter={() => setStage("select")}
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
              <div className="grid max-h-[32vh] grid-cols-3 gap-2 overflow-y-auto py-1 sm:grid-cols-4">
                {pets.map((pet) => {
                  const active = draft.companion === pet.id;
                  const price = companionPrice(pet.id);
                  const owned = ownsCompanion(save, pet.id);
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, companion: pet.id }))}
                      className={`flex min-h-[5rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-2 transition ${
                        active
                          ? "scale-[1.02] border-amber-300 bg-amber-200/90 text-[#1c1917]"
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
                <button
                  type="button"
                  className="min-h-11 flex-1 rounded-2xl border-2 border-white/40 bg-black/45 px-3 text-sm font-bold text-white hover:bg-black/60"
                  onClick={() => setStage("look")}
                >
                  ← Looks
                </button>
                <button
                  type="button"
                  className="min-h-11 flex-1 rounded-2xl border-2 border-[#1c1917] bg-[var(--cap-gold,#f4b942)] px-3 text-sm font-black text-[#1c1917] shadow-[2px_2px_0_#1c1917]"
                  onClick={commitAndLeave}
                >
                  {draft.companion === "none"
                    ? "Take free Slow Coin ✓"
                    : ownsCompanion(save, draft.companion) || companionPrice(draft.companion) === 0
                      ? "Save & leave ✓"
                      : `Adopt · 🪙 ${companionPrice(draft.companion)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
