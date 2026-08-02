import { getMascot } from "../moneyCast";
import { PLAYABLE_SELECT_CAST } from "../castLooks";

type Props = {
  selectedId: string;
  onPick: (id: string) => void;
};

/** Compact Street Fighter fighter grid for Outfitter / boot reuse. */
export function CastSelectGrid({ selectedId, onPick }: Props) {
  return (
    <div
      className="grid max-h-[42vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5"
      role="listbox"
      aria-label="Playable cast"
      data-testid="cast-select-grid"
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
            onClick={() => onPick(id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1.5 py-2 transition ${
              active
                ? "scale-[1.03] border-amber-300 bg-amber-200/90 text-[#1c1917] shadow-lg"
                : "border-white/20 bg-black/40 text-white hover:border-white/50"
            }`}
            data-testid={`cast-select-${id}`}
          >
            <span className="text-2xl leading-none">{m.emoji}</span>
            <span className="w-full truncate px-0.5 text-center text-[10px] font-bold leading-tight">
              {m.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
