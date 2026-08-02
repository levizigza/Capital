import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GameButton } from "@/game-ui";
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
};

type Chip = { id: string; label: string; sub: string; node: ReactNode };

function ChipCarousel({
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
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [chips]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.65), behavior: "smooth" });
  };

  const arrowClass = dark
    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-black/55 text-lg font-black text-white disabled:opacity-30"
    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-lg font-black text-slate-800 disabled:opacity-30";

  return (
    <div className="flex items-center gap-1.5" data-testid="outfit-chip-carousel">
      <button
        type="button"
        className={arrowClass}
        aria-label="Scroll options left"
        disabled={!canLeft}
        onClick={() => scrollBy(-1)}
        data-testid="outfit-carousel-left"
      >
        ←
      </button>
      <div
        ref={scroller}
        className={
          dark
            ? "flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-contain scroll-smooth px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex max-h-[28vh] min-w-0 flex-1 flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-xl border border-black/10 bg-white/70 p-2"
        }
        role="listbox"
        aria-label={ariaLabel}
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
              onClick={() => onPick(chip.id)}
              className={
                dark
                  ? `flex w-[5.1rem] shrink-0 flex-col items-center gap-1 rounded-2xl border-2 px-1.5 py-2 transition ${
                      active
                        ? "scale-105 border-amber-300 bg-amber-200/90 text-[#1c1917]"
                        : "border-white/20 bg-black/40 text-white hover:border-white/50"
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
      <button
        type="button"
        className={arrowClass}
        aria-label="Scroll options right"
        disabled={!canRight}
        onClick={() => scrollBy(1)}
        data-testid="outfit-carousel-right"
      >
        →
      </button>
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
    setDraft((d) => {
      const next = { ...d, ...patch };
      onDraftChange?.(next);
      return next;
    });
  };

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
    <div className="flex min-h-0 flex-col gap-2" data-testid="character-creator-snap">
      {preview === "emoji" ? (
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          <CharacterAvatar character={draft} size={96} animationStyle="capital-default" />
          <div className="text-center">
            <div className="text-lg font-black">{isShop ? mascot.name : "Your money mascot"}</div>
            <p className="text-xs text-muted-foreground">{catMeta.hint}</p>
          </div>
        </div>
      ) : (
        <div className="shrink-0 text-center">
          <p className={`text-sm font-black drop-shadow ${dark ? "text-amber-100" : ""}`}>
            {mascot.name}
          </p>
          <p className={`text-xs font-semibold drop-shadow ${dark ? "text-amber-100/90" : "text-muted-foreground"}`}>
            {catMeta.hint}
          </p>
          {onChangeFighter ? (
            <button
              type="button"
              onClick={onChangeFighter}
              className="mt-1 text-xs font-bold text-amber-200 underline-offset-2 hover:underline"
              data-testid="outfitter-change-fighter"
            >
              ← Change fighter
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

      <div className="flex shrink-0 justify-center gap-1 overflow-x-auto" role="tablist" aria-label="Outfit layers">
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
                  ? `shrink-0 rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                      active
                        ? "bg-amber-300 text-[#1c1917] shadow-lg"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`
                  : `shrink-0 rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
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

      <ChipCarousel
        chips={chips}
        selectedId={selectedId}
        dark={dark}
        ariaLabel={catMeta.label}
        onPick={(id) => {
          if (category === "looks") {
            const preset = lookPresetsForBase(draft.base).find((p) => p.id === id);
            if (preset) set(applyLookPreset(draft, preset));
          } else if (category === "coat") set({ color: id, lookId: "custom" });
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
            {cancelLabel ?? (dark ? (onChangeFighter ? "← Fighters" : "Save look & leave") : "Leave")}
          </GameButton>
        ) : null}
        <GameButton
          variant="primary"
          className="flex-1"
          onClick={commit}
          data-testid={saveTestId}
        >
          {saveLabel}
        </GameButton>
      </div>
    </div>
  );
}
