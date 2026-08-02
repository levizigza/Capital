import { useState } from "react";
import { GameButton } from "@/game-ui";
import { getMascot } from "../moneyCast";
import { PLAYABLE_SELECT_CAST, sheetLookForBase } from "../castLooks";
import type { CapitalCharacter } from "../character";
import { loadIslandSave, persistIslandSave } from "../save";
import { applyCompanionPurchase, STARTER_COMPANION_ID } from "../harborShop";
import type { IslandSaveV1 } from "../types";
import { OutfitterStudio3D } from "../world3d/OutfitterStudio3D";
import { CharacterCreator } from "./CharacterCreator";

type Stage = "select" | "look";

type Props = {
  defaultName?: string;
  onComplete: (character: CapitalCharacter) => void;
};

/**
 * Boot cast select — full-bleed 3D Outfitter (Snapchat-style).
 * Live 3D fighter lineup → Looks · Shirt · Pants · Gear · Tech → Money Carpet.
 */
export function BootCastSelect({ defaultName = "", onComplete }: Props) {
  const [stage, setStage] = useState<Stage>("select");
  const [draft, setDraft] = useState<CapitalCharacter>(() =>
    sheetLookForBase(PLAYABLE_SELECT_CAST[0]!, defaultName || "Voyager"),
  );
  const [busy, setBusy] = useState(false);

  const mascot = getMascot(draft.base);

  const pickFighter = (id: string) => {
    setDraft(sheetLookForBase(id, draft.name || defaultName || getMascot(id).name));
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
      <OutfitterStudio3D
        character={draft}
        className="absolute inset-0"
        mode={stage === "select" ? "lineup" : "solo"}
        lineupIds={PLAYABLE_SELECT_CAST}
        onPickFighter={pickFighter}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <header className="relative z-[2] flex items-start justify-between gap-3 p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
            Fortune Archipelago · 3D Outfitter
          </p>
          <h1 className="cap-display text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-3xl">
            {stage === "select" ? "Choose your Voyager" : "Become you"}
          </h1>
          <p className="max-w-lg text-sm text-white/80">
            {stage === "select"
              ? "Tap any 3D Money Mascot on the fitting-room floor, then customize on the live mirror."
              : "Snapchat layers — Looks · Shirt · Pants · Accessories · Electronics — then board the Money Carpet."}
          </p>
        </div>
      </header>

      <div className="pointer-events-auto relative z-[20] mt-auto w-full px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/15 bg-black/55 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          {stage === "select" ? (
            <div className="flex flex-col gap-3 text-center text-white">
              <div>
                <div className="text-lg font-black">{mascot.name}</div>
                <p className="text-sm text-white/75">{mascot.tagline}</p>
              </div>
              <label className="mx-auto w-full max-w-xs">
                <span className="sr-only">Your name</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 18) }))}
                  placeholder="Name your Voyager"
                  className="w-full rounded-2xl border-2 border-white/30 bg-black/45 px-3 py-2 text-center text-lg font-bold text-white placeholder:text-white/45 focus:border-amber-300 focus:outline-none"
                  aria-label="Character name"
                  autoComplete="nickname"
                  data-testid="boot-voyager-name"
                />
              </label>
              <GameButton
                variant="primary"
                className="w-full"
                onClick={() => setStage("look")}
                data-testid="boot-customize-look"
              >
                Customize on the 3D mirror →
              </GameButton>
              <GameButton
                variant="outline"
                className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20"
                disabled={busy}
                onClick={() => boardCarpet()}
                data-testid="boot-board-carpet-now"
              >
                {busy ? "Boarding…" : "Board the Money Carpet →"}
              </GameButton>
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
              cancelLabel="← 3D fighters"
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
