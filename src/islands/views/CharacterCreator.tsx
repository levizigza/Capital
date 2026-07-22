import { useMemo, useState } from "react";
import { GameButton } from "@/game-ui";
import { CharacterAvatar } from "./CharacterAvatar";
import {
  type CapitalCharacter,
  type OutfitCategoryId,
  DEFAULT_CHARACTER,
  CHARACTER_BASES,
  CHARACTER_COLORS,
  CHARACTER_ACCESSORIES,
  CHARACTER_COMPANIONS,
  OUTFIT_CATEGORIES,
  baseEmoji,
  colorHex,
  accessoryEmoji,
  companionEmoji,
} from "../character";
import { getMascot } from "../moneyCast";

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
  /**
   * emoji = legacy 2D avatar (onboarding cards)
   * none = parent supplies live 3D mannequin (Outfitter studio)
   */
  preview?: "emoji" | "none";
  /** UI chrome — dark for 3D studio overlay, light for cards */
  chrome?: "light" | "dark";
  /** Live draft mirror for external 3D preview */
  onDraftChange?: (draft: CapitalCharacter) => void;
};

/**
 * Snapchat-style outfit bar — big categories + horizontal chips.
 * Body stays center-stage (3D studio or emoji); chips change layers.
 */
export function CharacterCreator({
  character,
  defaultName,
  saveLabel = "Save look",
  onSave,
  onCancel,
  variant = "default",
  hideCompanion = false,
  preview = "emoji",
  chrome,
  onDraftChange,
}: Props) {
  const [draft, setDraft] = useState<CapitalCharacter>(
    () => character ?? { ...DEFAULT_CHARACTER, name: defaultName ?? "" },
  );
  const [category, setCategory] = useState<OutfitCategoryId>("body");
  const dark = (chrome ?? (preview === "none" ? "dark" : "light")) === "dark";

  const set = (patch: Partial<CapitalCharacter>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      onDraftChange?.(next);
      return next;
    });
  };

  const isShop = variant === "outfitter";

  const commit = () =>
    onSave({ ...draft, name: draft.name.trim() || defaultName || "Adventurer" });

  const chips = useMemo(() => {
    if (category === "body") {
      return CHARACTER_BASES.map((o) => {
        const m = getMascot(o.id);
        return {
          id: o.id,
          label: o.label,
          sub: m.tagline,
          node: <span className="text-2xl leading-none">{baseEmoji(o.id)}</span>,
        };
      });
    }
    if (category === "coat") {
      return CHARACTER_COLORS.map((o) => ({
        id: o.id,
        label: o.label,
        sub: "Coat tint",
        node: (
          <span
            className="h-8 w-8 rounded-full border-2 border-white shadow-inner"
            style={{ background: colorHex(o.id) }}
          />
        ),
      }));
    }
    return CHARACTER_ACCESSORIES.map((o) => ({
      id: o.id,
      label: o.label,
      sub: "Gear",
      node: <span className="text-2xl leading-none">{accessoryEmoji(o.id) || "·"}</span>,
    }));
  }, [category]);

  const selectedId =
    category === "body" ? draft.base : category === "coat" ? draft.color : draft.accessory;

  const catMeta = OUTFIT_CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="flex min-h-0 flex-col gap-2" data-testid="character-creator-snap">
      {preview === "emoji" ? (
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          <CharacterAvatar character={draft} size={96} animationStyle="capital-default" />
          <div className="text-center">
            <div className="text-lg font-black">{isShop ? "Fitting mirror" : "Your money mascot"}</div>
            <p className="text-xs text-muted-foreground">{catMeta.hint}</p>
          </div>
        </div>
      ) : (
        <div className="shrink-0 text-center">
          <p className={`text-xs font-semibold drop-shadow ${dark ? "text-amber-100/90" : "text-muted-foreground"}`}>
            {catMeta.hint}
          </p>
        </div>
      )}

      <label className="mx-auto w-full max-w-xs shrink-0 text-center">
        <span className="sr-only">Your name</span>
        <input
          value={draft.name}
          onChange={(e) => set({ name: e.target.value.slice(0, 18) })}
          placeholder="Name your Voyager"
          className={
            dark
              ? "w-full rounded-2xl border-2 border-white/30 bg-black/45 px-3 py-2 text-center text-lg font-bold text-white placeholder:text-white/50 focus:border-amber-300 focus:outline-none"
              : "w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
          }
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

      {/* Category rail */}
      <div
        className={
          preview === "none"
            ? "flex shrink-0 justify-center gap-1.5"
            : "flex shrink-0 justify-center gap-1.5"
        }
        role="tablist"
        aria-label="Outfit layers"
      >
        {OUTFIT_CATEGORIES.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={
                dark
                  ? `rounded-full px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-amber-300 text-[#1c1917] shadow-lg"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`
                  : `rounded-full px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Horizontal Snapchat-style chip tray */}
      <div
        className={
          dark
            ? "flex shrink-0 gap-2 overflow-x-auto overscroll-contain px-1 pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex max-h-[28vh] flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-xl border border-black/10 bg-white/70 p-2"
        }
        role="listbox"
        aria-label={catMeta.label}
      >
        {chips.map((chip) => {
          const active = selectedId === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={chip.label}
              title={chip.sub}
              onClick={() => {
                if (category === "body") set({ base: chip.id });
                else if (category === "coat") set({ color: chip.id });
                else set({ accessory: chip.id });
              }}
              className={
                dark
                  ? `flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-2xl border-2 px-1.5 py-2 transition ${
                      active
                        ? "scale-105 border-amber-300 bg-amber-200/90 text-[#1c1917]"
                        : "border-white/20 bg-black/40 text-white hover:border-white/50"
                    }`
                  : `flex min-w-[4.25rem] flex-col items-center gap-1 rounded-2xl border-2 px-2 py-2 transition ${
                      active
                        ? "scale-105 border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-indigo-300"
                    }`
              }
            >
              {chip.node}
              <span className="max-w-full truncate text-[10px] font-bold leading-tight">{chip.label}</span>
            </button>
          );
        })}
      </div>

      {!hideCompanion && preview === "emoji" ? (
        <div className="flex flex-wrap justify-center gap-2">
          {CHARACTER_COMPANIONS.map((o) => {
            const active = draft.companion === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => set({ companion: o.id })}
                className={`rounded-xl border-2 px-2 py-1 text-lg ${
                  active ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"
                }`}
                aria-label={o.label}
              >
                {companionEmoji(o.id) || "🚫"}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className={
          dark
            ? "sticky bottom-0 z-10 flex gap-2 pt-2"
            : "sticky bottom-0 z-10 -mx-1 flex gap-2 border-t border-black/10 bg-[color-mix(in_oklab,var(--cap-card,#fffdf6)_94%,transparent)] px-1 pb-1 pt-3"
        }
      >
        {onCancel ? (
          <GameButton
            variant="outline"
            className={dark ? "flex-1 border-white/40 bg-black/35 text-white hover:bg-black/50" : "flex-1"}
            onClick={onCancel}
          >
            Leave
          </GameButton>
        ) : null}
        <GameButton
          variant="primary"
          className="flex-1"
          onClick={commit}
          data-testid="character-creator-save"
        >
          {saveLabel}
        </GameButton>
      </div>
    </div>
  );
}
