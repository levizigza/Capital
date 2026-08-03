import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CharacterAvatar } from "./CharacterAvatar";
import {
  type CapitalCharacter,
  type OutfitCategoryId,
  DEFAULT_CHARACTER,
  CHARACTER_COLORS,
  CHARACTER_ACCESSORIES,
  CHARACTER_COMPANIONS,
  OUTFIT_CATEGORIES,
  colorHex,
  accessoryEmoji,
  companionEmoji,
} from "../character";
import { getMascot } from "../moneyCast";
import {
  GEAR_ACCESSORY_IDS,
  TECH_ACCESSORY_IDS,
  applyLookPreset,
  lookPresetsForBase,
} from "../castLooks";
import { pointerSafeActivate } from "../pointerSafeClick";

type Props = {
  character?: CapitalCharacter | null;
  defaultName?: string;
  saveLabel?: string;
  onSave: (character: CapitalCharacter) => void;
  onCancel?: () => void;
  variant?: "default" | "outfitter";
  hideCompanion?: boolean;
  preview?: "emoji" | "none";
  chrome?: "light" | "dark";
  onDraftChange?: (draft: CapitalCharacter) => void;
  /** Show “Change fighter” to return to Street Fighter select. */
  onChangeFighter?: () => void;
  cancelLabel?: string;
  saveTestId?: string;
  /** Boot look-stage Cancel parity with Board Carpet CTA hit target. */
  cancelTestId?: string;
};

type Chip = { id: string; label: string; sub: string; node: ReactNode };

function ChipGrid({
  chips,
  selectedId,
  dark,
  ariaLabel,
  onPick,
}: {
  chips: Chip[];
  selectedId: string;
  dark: boolean;
  ariaLabel: string;
  onPick: (id: string) => void;
}) {
  return (
    <div
      className={
        dark
          ? "grid max-h-[16vh] grid-cols-4 gap-1.5 overflow-y-auto overscroll-contain py-1 sm:grid-cols-5"
          : "flex max-h-[28vh] flex-wrap justify-center gap-2 overflow-y-auto overscroll-contain rounded-xl border border-black/10 bg-white/70 p-2"
      }
      role="listbox"
      aria-label={ariaLabel}
      data-testid="outfit-options-grid"
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
            title={`${chip.label} — ${chip.sub}`}
            data-testid={`outfit-chip-${chip.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPick(chip.id);
            }}
            className={
              dark
                ? `flex min-h-[4.1rem] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-1.5 transition ${
                    active
                      ? "border-amber-300 bg-amber-200/90 text-[#1c1917]"
                      : "border-white/20 bg-black/45 text-white hover:border-white/55"
                  }`
                : `flex min-w-[4.5rem] flex-col items-center gap-1 rounded-2xl border-2 px-2 py-2 transition ${
                    active
                      ? "scale-105 border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`
            }
          >
            {chip.node}
            <span className="w-full px-0.5 text-center text-[10px] font-bold leading-tight">
              {chip.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Snapchat-style outfit bar — Looks · Shirt · Pants · Accessories · Electronics.
 * Fighter body is chosen on the Street Fighter select grid first.
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
  onChangeFighter,
  cancelLabel,
  saveTestId = "character-creator-save",
  cancelTestId = "character-creator-cancel",
}: Props) {
  const [draft, setDraft] = useState<CapitalCharacter>(
    () => character ?? { ...DEFAULT_CHARACTER, name: defaultName ?? "" },
  );
  const [category, setCategory] = useState<OutfitCategoryId>("looks");
  const dark = (chrome ?? (preview === "none" ? "dark" : "light")) === "dark";

  useEffect(() => {
    if (character) setDraft(character);
  }, [character?.base, character?.color, character?.accessory, character?.pants, character?.lookId]);

  const set = (patch: Partial<CapitalCharacter>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  // Mirror outward in an effect — never call parent setters inside setState updaters.
  useEffect(() => {
    onDraftChange?.(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror draft outward only
  }, [draft.base, draft.color, draft.accessory, draft.pants, draft.lookId, draft.companion, draft.name]);

  const isShop = variant === "outfitter";
  const mascot = getMascot(draft.base);

  const commit = () =>
    onSave({ ...draft, name: draft.name.trim() || defaultName || mascot.name || "Adventurer" });

  const chips = useMemo((): Chip[] => {
    if (category === "looks") {
      return lookPresetsForBase(draft.base).map((p) => ({
        id: p.id,
        label: p.label,
        sub: "Signature look",
        node: (
          <span
            className="h-8 w-8 rounded-full border-2 border-white shadow-inner"
            style={{ background: colorHex(p.color) }}
          />
        ),
      }));
    }
    if (category === "coat" || category === "pants") {
      return CHARACTER_COLORS.map((o) => ({
        id: o.id,
        label: o.label,
        sub: category === "coat" ? "Shirt / coat" : "Pants",
        node: (
          <span
            className="h-8 w-8 rounded-full border-2 border-white shadow-inner"
            style={{ background: colorHex(o.id) }}
          />
        ),
      }));
    }
    const ids = category === "tech" ? TECH_ACCESSORY_IDS : GEAR_ACCESSORY_IDS;
    return CHARACTER_ACCESSORIES.filter((o) => (ids as readonly string[]).includes(o.id)).map((o) => ({
      id: o.id,
      label: o.label,
      sub: category === "tech" ? "Electronics" : "Wearable gear",
      node: <span className="text-2xl leading-none">{accessoryEmoji(o.id) || "·"}</span>,
    }));
  }, [category, draft.base]);

  const selectedId =
    category === "looks"
      ? draft.lookId ?? "sheet"
      : category === "coat"
        ? draft.color
        : category === "pants"
          ? draft.pants ?? "ink"
          : draft.accessory;

  const catMeta = OUTFIT_CATEGORIES.find((c) => c.id === category)!;

  return (
    <div
      className="relative z-10 flex min-h-0 flex-col gap-2"
      data-testid="character-creator-snap"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {preview === "emoji" ? (
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          <CharacterAvatar character={draft} size={96} animationStyle="capital-default" />
          <div className="text-center">
            <div className="text-lg font-black">{isShop ? mascot.name : "Your money mascot"}</div>
            <p className="text-xs text-muted-foreground">{catMeta.hint}</p>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-2 text-left">
          <div className="min-w-0">
            <p
              className="truncate text-base font-black"
              style={dark ? { color: "#fffdf6" } : undefined}
            >
              {mascot.name}
            </p>
            <p
              className="truncate text-xs font-semibold"
              style={dark ? { color: "rgba(253,230,138,0.9)" } : undefined}
            >
              {catMeta.hint}
            </p>
          </div>
          {onChangeFighter ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChangeFighter();
              }}
              className="min-h-10 shrink-0 rounded-xl border border-amber-200/40 bg-black/40 px-3 text-xs font-bold text-amber-100 hover:bg-black/60"
              data-testid="outfitter-change-fighter"
            >
              ← Fighters
            </button>
          ) : null}
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
              ? "w-full rounded-xl border border-white/25 bg-black/40 px-3 py-1.5 text-center text-sm font-bold text-white placeholder:text-white/45 focus:border-amber-300 focus:outline-none"
              : "w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-center text-lg font-bold focus:border-indigo-500 focus:outline-none"
          }
          aria-label="Character name"
          autoComplete="nickname"
          enterKeyHint="done"
          data-testid="character-creator-name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </label>

      <div
        className="flex shrink-0 flex-wrap justify-center gap-1.5"
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
              data-testid={`outfit-tab-${c.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCategory(c.id);
              }}
              className={
                dark
                  ? `min-h-10 shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                      active
                        ? "bg-amber-300 text-[#1c1917] shadow-lg"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`
                  : `min-h-10 shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
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

      <ChipGrid
        chips={chips}
        selectedId={selectedId}
        dark={dark}
        ariaLabel={catMeta.label}
        onPick={(id) => {
          if (category === "looks") {
            setDraft((d) => {
              const preset = lookPresetsForBase(d.base).find((p) => p.id === id);
              if (!preset) return d;
              return applyLookPreset(d, preset);
            });
            return;
          }
          if (category === "coat") set({ color: id, lookId: "custom" });
          else if (category === "pants") set({ pants: id, lookId: "custom" });
          else set({ accessory: id, lookId: "custom" });
        }}
      />

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

      <div className={dark ? "flex gap-2 pt-1" : "flex gap-2 border-t border-black/10 pt-3"}>
        {onCancel ? (
          <button
            type="button"
            className={
              dark
                ? "min-h-12 flex-1 touch-manipulation rounded-2xl border-2 border-amber-100/40 bg-white/10 px-3 text-sm font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-white/15 active:translate-x-[1px] active:translate-y-[1px]"
                : "min-h-12 flex-1 touch-manipulation rounded-2xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-800"
            }
            {...pointerSafeActivate(onCancel, { stopPropagation: true })}
            data-testid={cancelTestId}
          >
            {cancelLabel ?? (dark ? (onChangeFighter ? "← Fighters" : "Save look & leave") : "Leave")}
          </button>
        ) : null}
        <button
          type="button"
          className="min-h-12 flex-1 touch-manipulation rounded-2xl border-2 border-[#1c1917] bg-[var(--cap-gold,#f4b942)] px-3 text-sm font-black text-[#1c1917] shadow-[2px_2px_0_#1c1917] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          {...pointerSafeActivate(commit, { stopPropagation: true })}
          data-testid={saveTestId}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
