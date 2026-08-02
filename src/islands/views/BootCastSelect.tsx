import { useState } from "react";
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
 * Stage and dock are flex siblings so WebGL/coins never cover the controls.
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
      className="fixed inset-0 z-[10000] flex flex-col bg-[#0c1622]"
      role="dialog"
      aria-label="Choose your Money Mascot"
      data-testid="boot-cast-select"
      data-stage={stage}
    >
      <header className="relative z-10 shrink-0 px-3 pb-1 pt-3 sm:px-4 sm:pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
          Fortune Archipelago · Fighter Select
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-3xl">
          {stage === "select" ? "Choose your Voyager" : "Become you"}
        </h1>
        <p className="max-w-lg text-sm text-white/80">
          {stage === "select"
            ? "All 12 series leads as spinning coin faces — tap one for the full 3D body, then customize."
            : "Live 3D head + body — Looks · Shirt · Pants · Accessories · Electronics — then board the Money Carpet."}
        </p>
      </header>

      <div className="relative min-h-0 flex-1">
        {stage === "select" ? (
          <StreetFighterCoinSelect
            selectedId={draft.base}
            ids={SERIES_LEAD_MASCOT_IDS}
            onFocus={pickFighter}
            onPick={pickAndCustomize}
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50"
          aria-hidden
        />
      </div>

      <div
        className="relative z-20 max-h-[46vh] shrink-0 overflow-y-auto overscroll-contain border-t border-white/10 bg-black/92 px-3 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:max-h-[42vh] sm:px-4 sm:py-4"
        data-testid="boot-cast-dock"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-xl">
          {stage === "select" ? (
            <div className="flex flex-col gap-2 text-center text-white">
              <div>
                <div className="text-lg font-black">{mascot.name}</div>
                <p className="text-sm text-white/75">{mascot.tagline}</p>
              </div>
              <p className="text-xs font-semibold text-amber-100/90">
                Tap a coin to jump straight into their 3D body — or customize the highlighted fighter.
              </p>
              <button
                type="button"
                className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] bg-[var(--cap-gold,#f4b942)] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                onPointerUp={(e) => {
                  if (e.button !== 0) return;
                  e.preventDefault();
                  setStage("look");
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setStage("look");
                }}
                data-testid="boot-customize-look"
              >
                Customize {mascot.name} on the 3D mirror →
              </button>
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
