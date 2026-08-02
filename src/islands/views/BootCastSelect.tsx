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

function resolvePickName(
  nextId: string,
  draft: CapitalCharacter,
  defaultName: string,
): string {
  const prevName = getMascot(draft.base).name;
  const custom =
    draft.name &&
    draft.name !== prevName &&
    draft.name !== "Voyager" &&
    draft.name.trim().length > 0;
  return custom ? draft.name : defaultName || "";
}

/**
 * Boot cast select — Street Fighter coin board → full 3D body + Snapchat customize.
 * Stage and dock are flex siblings so WebGL/coins never cover the controls.
 */
export function BootCastSelect({ defaultName = "", onComplete }: Props) {
  const [stage, setStage] = useState<Stage>("select");
  const [draft, setDraft] = useState<CapitalCharacter>(() =>
    sheetLookForBase(SERIES_LEAD_MASCOT_IDS[0]!, defaultName || ""),
  );
  const [busy, setBusy] = useState(false);

  const mascot = getMascot(draft.base);

  const pickFighter = (id: string) => {
    setDraft(sheetLookForBase(id, resolvePickName(id, draft, defaultName)));
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
      className="fixed inset-0 z-[10000] flex flex-col bg-[#071018]"
      role="dialog"
      aria-label="Choose your Money Mascot"
      data-testid="boot-cast-select"
      data-stage={stage}
      style={{ color: "#fff" }}
    >
      <header className="relative z-10 shrink-0 px-3 pb-1 pt-3 sm:px-5 sm:pt-4">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200"
          style={{ color: "#fde68a" }}
        >
          Capital · Fortune Archipelago
        </p>
        <h1
          className="mt-0.5 text-3xl font-black tracking-tight sm:text-4xl"
          style={{ color: "#fffdf6", textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
        >
          {stage === "select" ? "Choose your Voyager" : `${mascot.name}`}
        </h1>
        <p className="max-w-xl text-sm font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
          {stage === "select"
            ? "Meet your Voyager. Click a coin face to see them in 3D — then dress them, or board the carpet now."
            : "Dress your Voyager on the mirror — then board the Money Carpet to Harbor Haven."}
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/55"
          aria-hidden
        />
      </div>

      <div
        className="relative z-20 max-h-[44vh] shrink-0 overflow-y-auto overscroll-contain border-t border-amber-200/20 bg-[#050a10]/95 px-3 py-3 shadow-[0_-16px_48px_rgba(0,0,0,0.65)] backdrop-blur-md sm:max-h-[40vh] sm:px-5 sm:py-4"
        data-testid="boot-cast-dock"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-full max-w-xl">
          {stage === "select" ? (
            <div className="flex flex-col gap-2.5 text-center text-white">
              <div className="rounded-2xl border border-amber-200/25 bg-black/35 px-3 py-2">
                <div className="text-xl font-black tracking-tight" style={{ color: "#fffdf6" }}>
                  {mascot.name}
                </div>
                <p className="text-sm" style={{ color: "rgba(253,230,138,0.9)" }}>
                  {mascot.tagline}
                </p>
              </div>
              <button
                type="button"
                className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
                Customize {mascot.name} →
              </button>
              <button
                type="button"
                disabled={busy}
                className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-amber-100/40 bg-white/10 px-4 py-3 text-sm font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-white/15 active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-40"
                onPointerUp={(e) => {
                  if (e.button !== 0 || busy) return;
                  e.preventDefault();
                  e.stopPropagation();
                  boardCarpet();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!busy) boardCarpet();
                }}
                data-testid="boot-board-carpet-now"
              >
                {busy ? "Boarding…" : "Board Money Carpet now →"}
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
              cancelLabel="← Back to coin faces"
              saveTestId="boot-board-carpet"
              cancelTestId="boot-cancel-look"
              onDraftChange={setDraft}
              onChangeFighter={() => setStage("select")}
              onCancel={() => {
                if (!busy) setStage("select");
              }}
              onSave={(c) => {
                if (!busy) boardCarpet(c);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
