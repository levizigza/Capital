import { useState } from "react";
import { motion } from "framer-motion";
import { GameButton, GamePanel } from "@/game-ui";
import { CharacterAvatar } from "./CharacterAvatar";
import {
  type CapitalCharacter,
  DEFAULT_CHARACTER,
  CHARACTER_BASES,
  CHARACTER_COLORS,
  CHARACTER_ACCESSORIES,
  CHARACTER_COMPANIONS,
  baseEmoji,
  colorHex,
  accessoryEmoji,
  companionEmoji,
} from "../character";

type Props = {
  character?: CapitalCharacter | null;
  defaultName?: string;
  saveLabel?: string;
  onSave: (character: CapitalCharacter) => void;
  onCancel?: () => void;
  /** Outfitter copy — fitting room instead of generic creator */
  variant?: "default" | "outfitter";
  /** Hide companion row (pet chosen at the dock crates separately) */
  hideCompanion?: boolean;
};

function SwatchRow<T extends { id: string; label: string }>({
  title,
  options,
  selected,
  render,
  onPick,
  scrollable,
}: {
  title: string;
  options: T[];
  selected: string;
  render: (o: T) => React.ReactNode;
  onPick: (id: string) => void;
  /** Cap height so long catalogs don't push actions off-screen */
  scrollable?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div
        className={
          scrollable
            ? "flex max-h-[min(28vh,220px)] flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-xl border border-black/10 bg-white/60 p-2"
            : "flex flex-wrap gap-2"
        }
      >
        {options.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              aria-pressed={active}
              aria-label={o.label}
              className={`flex h-11 min-w-11 items-center justify-center rounded-xl border-2 px-2 text-xl transition-all ${
                active
                  ? "border-indigo-500 bg-indigo-50 shadow-md scale-105"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              {render(o)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Character / Outfitter form — sticky Cancel + Save so players never get stuck
 * behind a tall mascot catalog.
 */
export function CharacterCreator({
  character,
  defaultName,
  saveLabel = "Save character",
  onSave,
  onCancel,
  variant = "default",
  hideCompanion = false,
}: Props) {
  const [draft, setDraft] = useState<CapitalCharacter>(
    () => character ?? { ...DEFAULT_CHARACTER, name: defaultName ?? "" },
  );

  const set = (patch: Partial<CapitalCharacter>) => setDraft((d) => ({ ...d, ...patch }));
  const isShop = variant === "outfitter";

  const commit = () =>
    onSave({ ...draft, name: draft.name.trim() || defaultName || "Adventurer" });

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="shrink-0 text-center">
        <div className="text-xl font-black">{isShop ? "🪞 Fitting mirror" : "🎨 Make your money mascot"}</div>
        <p className="text-sm text-muted-foreground">
          {isShop
            ? "Pick a look, type your name, then tap Next. You can leave anytime."
            : "Pick your body, tint, and flair — then save."}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2">
        <motion.div
          key={`${draft.base}-${draft.color}-${draft.accessory}-${draft.companion}`}
          initial={{ scale: 0.9, rotate: -3 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <CharacterAvatar character={draft} size={88} animationStyle="capital-default" />
        </motion.div>
        <label className="w-full max-w-xs text-center">
          <span className="sr-only">Your name</span>
          <input
            value={draft.name}
            onChange={(e) => set({ name: e.target.value.slice(0, 18) })}
            placeholder="Name your Voyager"
            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
            aria-label="Character name"
            autoComplete="nickname"
            enterKeyHint="done"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
          />
        </label>
      </div>

      <GamePanel padding="default" className="min-h-0 space-y-3">
        <SwatchRow
          title="Money mascot"
          options={CHARACTER_BASES}
          selected={draft.base}
          scrollable
          render={(o) => (
            <span className="flex flex-col items-center gap-0.5 leading-none">
              <span>{baseEmoji(o.id)}</span>
              <span className="max-w-[3.6rem] truncate text-[7px] font-bold text-slate-600">
                {o.label.split(" ")[0]}
              </span>
            </span>
          )}
          onPick={(id) => set({ base: id })}
        />
        <SwatchRow
          title="Color"
          options={CHARACTER_COLORS}
          selected={draft.color}
          render={(o) => (
            <span className="h-5 w-5 rounded-full" style={{ background: colorHex(o.id) }} />
          )}
          onPick={(id) => set({ color: id })}
        />
        <SwatchRow
          title="Accessory"
          options={CHARACTER_ACCESSORIES}
          selected={draft.accessory}
          render={(o) => <span>{accessoryEmoji(o.id) || "🚫"}</span>}
          onPick={(id) => set({ accessory: id })}
        />
        {!hideCompanion ? (
          <SwatchRow
            title="Companion"
            options={CHARACTER_COMPANIONS}
            selected={draft.companion}
            render={(o) => <span>{companionEmoji(o.id) || "🚫"}</span>}
            onPick={(id) => set({ companion: id })}
          />
        ) : null}
      </GamePanel>

      <div className="sticky bottom-0 z-10 -mx-1 flex gap-2 border-t border-black/10 bg-[color-mix(in_oklab,var(--cap-card,#fffdf6)_94%,transparent)] px-1 pb-1 pt-3">
        {onCancel ? (
          <GameButton variant="outline" className="flex-1" onClick={onCancel}>
            Cancel / Leave
          </GameButton>
        ) : null}
        <GameButton variant="primary" className="flex-1" onClick={commit} data-testid="character-creator-save">
          {saveLabel}
        </GameButton>
      </div>
    </div>
  );
}
