import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CharacterAvatar } from "./CharacterAvatar";
import { getMascot } from "../moneyCast";
import {
  PLAYABLE_SELECT_CAST,
  applyLookPreset,
  lookPresetsForBase,
  sheetLookForBase,
} from "../castLooks";
import type { CapitalCharacter } from "../character";
import { loadIslandSave, persistIslandSave } from "../save";
import { applyCompanionPurchase } from "../harborShop";
import type { IslandSaveV1 } from "../types";

type Props = {
  defaultName?: string;
  onComplete: (character: CapitalCharacter) => void;
};

/**
 * Street Fighter–style cast select between the title mural and the Money Carpet.
 * Picks a playable body + look preset, then boards the carpet as that Voyager.
 */
export function BootCastSelect({ defaultName = "", onComplete }: Props) {
  const [selectedId, setSelectedId] = useState<string>(PLAYABLE_SELECT_CAST[0]!);
  const [draft, setDraft] = useState<CapitalCharacter>(() =>
    sheetLookForBase(PLAYABLE_SELECT_CAST[0]!, defaultName || "Voyager"),
  );
  const [busy, setBusy] = useState(false);

  const presets = useMemo(() => lookPresetsForBase(draft.base), [draft.base]);
  const mascot = getMascot(draft.base);

  const pickFighter = (id: string) => {
    setSelectedId(id);
    setDraft(sheetLookForBase(id, draft.name || defaultName || getMascot(id).name));
  };

  const boardCarpet = async () => {
    if (busy) return;
    setBusy(true);
    const character: CapitalCharacter = {
      ...draft,
      name: draft.name.trim() || defaultName || mascot.name,
      companion: draft.companion === "none" ? "tortoise" : draft.companion,
    };
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
    onComplete(character);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col bg-[#0c1622] text-white"
      role="dialog"
      aria-label="Choose your Money Mascot"
      data-testid="boot-cast-select"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#14532d55,transparent_55%),radial-gradient(ellipse_at_bottom,#0ea5e933,transparent_50%)]" />

      <header className="relative z-[1] flex items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
            Fortune Archipelago · Cast select
          </p>
          <h1 className="cap-display text-2xl text-white sm:text-3xl">Choose your Voyager</h1>
          <p className="max-w-lg text-sm text-white/75">
            Pick a Money Mascot, lock a look, then board the Money Carpet to Harbor Haven.
          </p>
        </div>
      </header>

      <div className="relative z-[1] mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 overflow-hidden px-3 pb-3 sm:grid-cols-[1.1fr_1fr] sm:px-6 sm:pb-5">
        {/* Fighter grid */}
        <div className="flex min-h-0 flex-col rounded-3xl border border-white/15 bg-black/40 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-100/80">
            Fighters
          </div>
          <div
            className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5"
            role="listbox"
            aria-label="Playable cast"
            data-testid="boot-cast-grid"
          >
            {PLAYABLE_SELECT_CAST.map((id) => {
              const m = getMascot(id);
              const active = selectedId === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pickFighter(id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1.5 py-2 transition ${
                    active
                      ? "scale-[1.03] border-amber-300 bg-amber-200/90 text-[#1c1917] shadow-lg"
                      : "border-white/20 bg-black/35 text-white hover:border-white/50"
                  }`}
                  data-testid={`boot-cast-${id}`}
                >
                  <span className="text-2xl leading-none">{m.emoji}</span>
                  <span className="w-full truncate px-0.5 text-center text-[10px] font-bold leading-tight">
                    {m.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview + looks */}
        <div className="flex min-h-0 flex-col gap-3 rounded-3xl border border-white/15 bg-black/45 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <CharacterAvatar character={draft} size={120} animationStyle="capital-default" />
            <div className="text-center">
              <div className="text-xl font-black">{mascot.name}</div>
              <p className="text-xs text-white/70">{mascot.tagline}</p>
            </div>
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
            />
          </label>

          <div>
            <div className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-amber-100/80">
              Looks
            </div>
            <div className="flex flex-wrap justify-center gap-2" data-testid="boot-look-presets">
              {presets.map((preset) => {
                const active = draft.lookId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDraft((d) => applyLookPreset(d, preset))}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "border-amber-300 bg-amber-200 text-[#1c1917]"
                        : "border-white/25 bg-black/40 text-white hover:border-white/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.button
            type="button"
            disabled={busy}
            onClick={() => void boardCarpet()}
            className="mt-auto rounded-2xl border-2 border-[#14532d] bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-3 text-lg font-black text-[#1c1917] shadow-[0_8px_0_#14532d] transition enabled:hover:translate-y-0.5 enabled:hover:shadow-[0_6px_0_#14532d] disabled:opacity-60"
            data-testid="boot-board-carpet"
            whileTap={{ scale: 0.98 }}
          >
            {busy ? "Saving look…" : "Board the Money Carpet →"}
          </motion.button>
          <p className="text-center text-[11px] text-white/55">
            Customize more shirts, pants, and gear at the Harbor Outfitter.
          </p>
        </div>
      </div>
    </div>
  );
}
