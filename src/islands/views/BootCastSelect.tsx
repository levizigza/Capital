import { useState } from "react";
import { GameButton } from "@/game-ui";
import { getMascot, SERIES_LEAD_MASCOT_IDS } from "../moneyCast";
import { sheetLookForBase } from "../castLooks";
import type { CapitalCharacter } from "../character";
import { loadIslandSave, persistIslandSave } from "../save";
import { applyCompanionPurchase, STARTER_COMPANION_ID } from "../harborShop";
import type { IslandSaveV1 } from "../types";
import { OutfitterStudio3D } from "../world3d/OutfitterStudio3D";
import { StreetFighterCoinSelect } from "../world3d/StreetFighterCoinSelect";
import { CharacterCreator } from "./CharacterCreator";

type Stage = "select" | "look";

type Props = {
  defaultName?: string;
  onComplete: (character: CapitalCharacter) => void;
};

/**
 * Boot cast select — Street Fighter coin board → full 3D body + Snapchat customize.
 * Select: all 12 series leads as spinning face-forward coins (one screen).
 * Look: live VoyagerMesh mannequin + Looks · Shirt · Pants · Gear · Tech → carpet.
 */
export function BootCastSelect({ defaultName = "", onComplete }: Props) {
  const [stage, setStage] = useState<Stage>("select");
  const [draft, setDraft] = useState<CapitalCharacter>(() =>
    sheetLookForBase(SERIES_LEAD_MASCOT_IDS[0]!, defaultName || "Voyager"),
  );
  const [busy, setBusy] = useState(false);

  const mascot = getMascot(draft.base);

  const pickFighter = (id: string) => {
    setDraft(sheetLookForBase(id, draft.name || defaultName || getMascot(id).name));
  };

  const pickAndCustomize = (id: string) => {
    pickFighter(id);
    setStage("look");
  };

  const boardCarpet = (from: CapitalCharacter = draft) => {
    if (busy) return;
    setBusy(true);
    const character: CapitalCharacter = {
      ...from,
      name: from.name.trim() || defaultName || getMascot(from.base).name,
      companion: from.companion === "none" ? STARTER_COMPANION_ID : from.companion,
    };
    onComplete(character);
    void (async () => {
      try {
        const loaded = await loadIslandSave();
        const withChar: IslandSaveV1 = {
          ...loaded,
          character,
          updatedAt: new Date().toISOString(),
        };
        await persistIslandSave(applyCompanionPurchase(withChar, character.companion));
      } catch (e) {
        console.warn("[boot] failed to persist cast pick", e);
      }
    })();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col"
      role="dialog"
      aria-label="Choose your Money Mascot"
      data-testid="boot-cast-select"
      data-stage={stage}
    >
      {stage === "select" ? (
        <StreetFighterCoinSelect
          selectedId={draft.base}
          ids={SERIES_LEAD_MASCOT_IDS}
          onPick={pickAndCustomize}
          className="absolute inset-0"
        />
      ) : (
        <OutfitterStudio3D
          character={draft}
          className="absolute inset-0"
          mode="solo"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

      <header className="pointer-events-none relative z-[2] flex items-start justify-between gap-3 p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
            Fortune Archipelago · Fighter Select
          </p>
          <h1 className="cap-display text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-3xl">
            {stage === "select" ? "Choose your Voyager" : "Become you"}
          </h1>
          <p className="max-w-lg text-sm text-white/80">
            {stage === "select"
              ? "All 12 series leads as spinning coin faces — tap one for the full 3D body, then customize."
              : "Live 3D head + body — Looks · Shirt · Pants · Accessories · Electronics — then board the Money Carpet."}
          </p>
        </div>
      </header>

      <div className="pointer-events-auto relative z-50 mt-auto w-full px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/15 bg-black/80 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          {stage === "select" ? (
            <div className="flex flex-col gap-2 text-center text-white">
              <div>
                <div className="text-lg font-black">{mascot.name}</div>
                <p className="text-sm text-white/75">{mascot.tagline}</p>
              </div>
              <p className="text-xs font-semibold text-amber-100/90">
                Tap any spinning coin above to open their full 3D body.
              </p>
              <GameButton
                variant="primary"
                className="w-full"
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStage("look");
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStage("look");
                }}
                data-testid="boot-customize-look"
              >
                Customize {mascot.name} on the 3D mirror →
              </GameButton>
              <button
                type="button"
                disabled={busy}
                className="w-full text-center text-xs font-bold uppercase tracking-wide text-white/55 underline-offset-2 hover:text-white/90 hover:underline disabled:opacity-40"
                onClick={() => boardCarpet()}
                data-testid="boot-board-carpet-now"
              >
                {busy ? "Boarding…" : "Skip customize · Board carpet"}
              </button>
            </div>
          ) : (
            <CharacterCreator
              character={draft}
              defaultName={defaultName}
              variant="outfitter"
              hideCompanion
              preview="none"
              chrome="dark"
              saveLabel={busy ? "Boarding…" : "Board the Money Carpet →"}
              cancelLabel="← Coin select"
              saveTestId="boot-board-carpet"
              onDraftChange={setDraft}
              onChangeFighter={() => setStage("select")}
              onCancel={() => setStage("select")}
              onSave={(c) => boardCarpet(c)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
