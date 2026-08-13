/**
 * Ashore Teach visual showcases — one dedicated look per chamber.
 * Mirrors MoneyCarpetGate · shore play_pad · Memory Plinth · Share card (no map widen).
 */

import { useEffect, useRef } from "react";
import { MONEY_ORGANS, type MoneyOrganId } from "../moneyOrgans";
import { drawMemoryPlinthSilhouette } from "../harborIcon";
import { prefersReducedMotion } from "../a11yMotion";
import { ISLAND_THEMES } from "../themes/islandThemes";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";
import { coldOrganKidSentence, organVerbChip } from "../worldMemory";
import { pointerSafeActivate } from "../pointerSafeClick";
import { playOrganSfx } from "../audio/capitalSfx";

const ISLAND_BY_ORGAN: Record<MoneyOrganId, string> = {
  memory: HARBOR_HAVEN_ID,
  coin: COVE_ISLAND_ID,
  clock: PAYCHECK_PENINSULA_ID,
  spiral: CREDIT_KINGDOM_ID,
};

/** Hero silhouette inside a painting — matches shore play_pad / map pin language. */
export type PaintingHero = "plinth" | "jar" | "tower" | "keep" | "carpet";

export function heroForOrgan(organ: MoneyOrganId): PaintingHero {
  if (organ === "memory") return "plinth";
  if (organ === "coin") return "jar";
  if (organ === "clock") return "tower";
  return "keep";
}

function themeBackground(organ: MoneyOrganId): string {
  const islandId = ISLAND_BY_ORGAN[organ];
  return ISLAND_THEMES[islandId]?.background ?? MONEY_ORGANS[organ].accentHint;
}

export function PlinthCanvas({
  lit = true,
  className = "",
}: {
  lit?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 200;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawMemoryPlinthSilhouette(ctx, w / 2, h / 2 + 10, 1.05, lit);
  }, [lit]);
  return (
    <canvas
      ref={ref}
      className={className}
      width={200}
      height={200}
      aria-hidden
      data-testid="ashore-plinth-canvas"
    />
  );
}

export function StructureHero({
  hero,
  accent,
  lit,
  size = "md",
}: {
  hero: PaintingHero;
  accent: string;
  lit: boolean;
  size?: "md" | "lg";
}) {
  const tall = size === "lg";
  if (hero === "plinth") {
    return (
      <PlinthCanvas
        lit={lit}
        className={tall ? "h-[88%] w-auto drop-shadow-lg" : "h-[72%] w-auto drop-shadow-lg"}
      />
    );
  }
  if (hero === "jar") {
    return (
      <div
        className={`relative flex items-end justify-center ${tall ? "h-[85%]" : "h-[70%]"}`}
        data-hero="jar"
      >
        <div
          className={`${tall ? "h-[90%] w-20" : "h-[88%] w-14"} rounded-b-[1.8rem] rounded-t-md border-2 border-amber-100/50`}
          style={{
            background: `linear-gradient(180deg, ${accent}ee 0%, #fde68a 55%, #f59e0b 100%)`,
            boxShadow: lit ? `0 0 28px ${accent}99` : undefined,
          }}
        />
        <div
          className={`absolute top-[8%] rounded-full bg-amber-100/80 ${tall ? "h-3 w-24" : "h-2.5 w-16"}`}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-amber-50/40"
            style={{
              width: (tall ? 24 : 18) - i * 2,
              height: tall ? 8 : 6,
              bottom: `${22 + i * 14}%`,
              left: "50%",
              transform: "translateX(-50%)",
              background: accent,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    );
  }
  if (hero === "tower") {
    return (
      <div
        className={`relative flex items-end justify-center ${tall ? "h-[88%]" : "h-[72%]"}`}
        data-hero="tower"
      >
        <div
          className={`${tall ? "w-16" : "w-12"} h-full rounded-t-md border border-white/30`}
          style={{
            background: `linear-gradient(180deg, #e2e8f0 0%, ${accent} 100%)`,
            boxShadow: lit ? `0 0 24px ${accent}88` : undefined,
          }}
        />
        <div
          className={`absolute top-[18%] rounded-full border-2 ${tall ? "h-14 w-14" : "h-10 w-10"}`}
          style={{ borderColor: accent, background: "#0f172a88" }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-4 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-white"
            style={
              prefersReducedMotion()
                ? undefined
                : { animation: "cap-vault-dial 2.4s linear infinite" }
            }
          />
        </div>
        <div
          className={`absolute bottom-0 rounded-sm ${tall ? "h-2.5 w-24" : "h-2 w-16"}`}
          style={{ background: accent }}
        />
      </div>
    );
  }
  if (hero === "keep") {
    return (
      <div
        className={`relative flex items-end justify-center ${tall ? "h-[88%]" : "h-[72%]"}`}
        data-hero="keep"
      >
        <div
          className={`${tall ? "h-[88%] border-l-[40px] border-r-[40px] border-b-[120px]" : "h-[85%] border-l-[28px] border-r-[28px] border-b-[90px]"} w-0 border-l-transparent border-r-transparent`}
          style={{
            borderBottomColor: accent,
            filter: lit ? `drop-shadow(0 0 16px ${accent})` : undefined,
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: (tall ? 72 : 54) - i * (tall ? 18 : 14),
              height: (tall ? 72 : 54) - i * (tall ? 18 : 14),
              top: `${18 + i * 10}%`,
              borderColor: i % 2 ? accent : "#c4b5fd",
              opacity: 0.75,
              animation: prefersReducedMotion()
                ? undefined
                : `cap-spiral-spin ${2.8 - i * 0.4}s linear infinite`,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`relative rounded-sm border border-amber-100/40 shadow-lg ${tall ? "h-20 w-36" : "h-16 w-28"}`}
      data-hero="carpet"
      style={{
        background:
          "repeating-linear-gradient(90deg, #14532d 0 8px, #166534 8px 16px), linear-gradient(180deg, #fde68a 0%, #f59e0b 100%)",
        backgroundBlendMode: "multiply",
        boxShadow: lit ? "0 8px 24px #f59e0b66" : undefined,
        animation: prefersReducedMotion() ? undefined : "cap-enter-bob 2.2s ease-in-out infinite",
      }}
    >
      <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-amber-50/50" />
      <div className="absolute inset-x-3 bottom-1.5 flex justify-between">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-amber-100/70" />
        ))}
      </div>
    </div>
  );
}

type SpinePaintingPortalProps = {
  organ: MoneyOrganId;
  lit?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  hero?: PaintingHero;
};

const PORTAL_SIZE: Record<NonNullable<SpinePaintingPortalProps["size"]>, string> = {
  sm: "h-28 w-[5.5rem]",
  md: "h-40 w-32 sm:h-44 sm:w-36",
  lg: "h-52 w-40 sm:h-60 sm:w-48",
  xl: "h-64 w-48 sm:h-72 sm:w-56",
};

/** Framed living painting — same language as Harbor gate / shore play_pad. */
export function SpinePaintingPortal({
  organ,
  lit = false,
  size = "sm",
  className = "",
  hero,
}: SpinePaintingPortalProps) {
  const accent = MONEY_ORGANS[organ].accentHint;
  const bg = themeBackground(organ);
  const h = hero ?? heroForOrgan(organ);
  return (
    <div
      className={`relative overflow-hidden rounded-sm ${PORTAL_SIZE[size]} ${className}`}
      data-testid={`ashore-painting-portal-${organ}`}
      data-painting-hero={h}
      aria-hidden
      style={{
        boxShadow: lit
          ? `0 0 0 3px ${accent}, 0 16px 36px ${accent}55`
          : "0 0 0 1px rgba(255,255,255,0.2), 0 8px 18px rgba(0,0,0,0.35)",
      }}
    >
      <div className="absolute inset-0 bg-[#1c1917]" />
      <div className="absolute inset-[7%] overflow-hidden" style={{ background: bg }}>
        <div
          className="absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              organ === "spiral"
                ? "linear-gradient(180deg, transparent, #312e81aa)"
                : "linear-gradient(180deg, transparent, #0ea5e988)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${accent} 0%, transparent 62%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <StructureHero
            hero={h}
            accent={accent}
            lit={lit}
            size={size === "xl" || size === "lg" ? "lg" : "md"}
          />
        </div>
      </div>
      <div className="absolute bottom-[6%] left-[10%] h-[18%] w-1.5 rounded-t-sm bg-amber-800/80" />
      <div className="absolute bottom-[6%] right-[10%] h-[18%] w-1.5 rounded-t-sm bg-amber-800/80" />
    </div>
  );
}

export type HarborSpotId = "piggy" | "plinth" | "dock";

/** Chamber: Harbor Haven home — light each landmark. */
export function HarborHomeShowcase({
  lit,
  onLight,
}: {
  lit: HarborSpotId[];
  onLight: (id: HarborSpotId) => void;
}) {
  const spots: { id: HarborSpotId; label: string; detail: string }[] = [
    { id: "piggy", label: "Fountain · Piggy", detail: "Talk when you choose — pink ring" },
    { id: "plinth", label: "Memory Plinth", detail: "Keeps every Take scar you bring home" },
    { id: "dock", label: "Carpet Dock south", detail: "Board paintings from the pier" },
  ];
  return (
    <div
      className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl ring-1 ring-amber-200/35"
      data-testid="ashore-harbor-showcase"
      style={{ background: ISLAND_THEMES.harbor_haven.background }}
    >
      <div className="relative flex min-h-[220px] flex-col items-center justify-end px-4 pb-3 pt-6 sm:min-h-[260px]">
        <PlinthCanvas
          lit={lit.includes("plinth")}
          className="mb-2 h-40 w-40 drop-shadow-xl sm:h-48 sm:w-48"
        />
        <div className="absolute left-4 top-6 sm:left-8">
          <button
            type="button"
            data-testid="ashore-harbor-spot-piggy"
            className={`rounded-xl px-3 py-2 text-left text-xs font-bold ring-1 ${
              lit.includes("piggy")
                ? "bg-pink-300/90 text-[#1c1917] ring-pink-100"
                : "bg-[#1c1917]/70 text-pink-100 ring-pink-200/40"
            }`}
            {...pointerSafeActivate(() => {
              playOrganSfx("memory");
              onLight("piggy");
            })}
          >
            🐷 Piggy · fountain
          </button>
        </div>
        <div className="absolute right-4 top-6 sm:right-8">
          <button
            type="button"
            data-testid="ashore-harbor-spot-dock"
            className={`rounded-xl px-3 py-2 text-left text-xs font-bold ring-1 ${
              lit.includes("dock")
                ? "bg-amber-300 text-[#1c1917] ring-amber-100"
                : "bg-[#1c1917]/70 text-amber-100 ring-amber-200/40"
            }`}
            {...pointerSafeActivate(() => {
              playOrganSfx("coin");
              onLight("dock");
            })}
          >
            🧭 Carpet Dock
          </button>
        </div>
        <button
          type="button"
          data-testid="ashore-harbor-spot-plinth"
          className={`mb-1 rounded-xl px-3 py-2 text-xs font-black ring-1 ${
            lit.includes("plinth")
              ? "bg-amber-400 text-[#1c1917] ring-amber-100"
              : "bg-[#1c1917]/75 text-amber-100 ring-amber-200/50"
          }`}
          {...pointerSafeActivate(() => {
            playOrganSfx("memory");
            onLight("plinth");
          })}
        >
          Tap the Memory Plinth
        </button>
      </div>
      <ul className="grid grid-cols-1 gap-1 bg-[#0f172a]/85 px-3 py-2 sm:grid-cols-3">
        {spots.map((s) => (
          <li
            key={s.id}
            className={`rounded-lg px-2 py-1.5 text-left ${
              lit.includes(s.id) ? "bg-amber-400/20" : "bg-white/5"
            }`}
          >
            <p className="text-[11px] font-black text-amber-100">{s.label}</p>
            <p className="text-[10px] text-white/65">{s.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Chamber: Money Carpet — board the first painting. */
export function CarpetDockShowcase({
  boarded,
  onBoard,
}: {
  boarded: boolean;
  onBoard: () => void;
}) {
  return (
    <div
      className="relative mx-auto flex w-full max-w-xl flex-col items-center overflow-hidden rounded-2xl px-4 pb-4 pt-6 ring-1 ring-amber-200/35"
      data-testid="ashore-carpet-showcase"
      style={{ background: "linear-gradient(180deg, #0c4a6e 0%, #164e63 45%, #14532d 100%)" }}
    >
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100/80">
        Carpet Dock · south pier
      </p>
      <div className="flex items-end gap-3 sm:gap-5">
        <div className="h-36 w-3 rounded-t-md bg-amber-800 sm:h-44 sm:w-3.5" />
        <button
          type="button"
          data-testid="ashore-carpet-board-cove"
          className="relative transition hover:scale-[1.03]"
          {...pointerSafeActivate(() => {
            playOrganSfx("coin");
            onBoard();
          })}
        >
          <SpinePaintingPortal organ="coin" lit={boarded} size="xl" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <StructureHero hero="carpet" accent="#fbbf24" lit size="lg" />
          </div>
        </button>
        <div className="mb-10 flex flex-col gap-2 opacity-55">
          <SpinePaintingPortal organ="clock" size="sm" />
          <SpinePaintingPortal organ="spiral" size="sm" />
        </div>
        <div className="h-36 w-3 rounded-t-md bg-amber-800 sm:h-44 sm:w-3.5" />
      </div>
      <p className="mt-8 text-sm font-bold text-amber-100">
        {boarded
          ? "Boarded · Coincraft Cove painting opens first"
          : "Tap the lit Cove painting to practice boarding"}
      </p>
      <p className="mt-1 max-w-md text-center text-[11px] text-white/70">
        Paycheck and Credit wait behind Cove — same Carpet Dock, later paintings.
      </p>
    </div>
  );
}

export type PaintingLesson = {
  organ: Exclude<MoneyOrganId, "memory">;
  place: string;
  landmark: string;
  npc: string;
  playWhere: string;
  forks: [string, string];
  structure: string;
};

export const PAINTING_LESSONS: Record<Exclude<MoneyOrganId, "memory">, PaintingLesson> = {
  coin: {
    organ: "coin",
    place: "Coincraft Cove",
    landmark: "Giant Coin Jar · Savings Lighthouse",
    npc: "Keeper Kira",
    playWhere: "Jar before treat, or treat before jar — the Take sticks forever",
    forks: ["Jar before treat", "Treat before jar"],
    structure: "Coin Jar — arcade pads open worlds; lid Soft Beat is a quiet peek",
  },
  clock: {
    organ: "clock",
    place: "Paycheck Peninsula",
    landmark: "Payroll Tower · Main Street",
    npc: "Vendor Vee",
    playWhere: "Umbrella before glitter, or glitter ate the umbrella",
    forks: ["Umbrella before glitter", "Glitter ate the umbrella"],
    structure: "Payroll Tower — chute climb; umbrella loft Soft Beat peeks",
  },
  spiral: {
    organ: "spiral",
    place: "Credit Kingdom",
    landmark: "Interest Keep · Debt Canyon",
    npc: "Rex the Collector",
    playWhere: "Waited the spiral, or haste fed the spiral",
    forks: ["Waited the spiral", "Haste fed the spiral"],
    structure: "Interest Keep — anvil & dispatch arcade; battlement Soft Beat peeks",
  },
};

/** One painting = one chamber — large portal + practice Take fork. */
export function PaintingLessonShowcase({
  lesson,
  chosen,
  onChoose,
}: {
  lesson: PaintingLesson;
  chosen: string | null;
  onChoose: (fork: string) => void;
}) {
  const accent = MONEY_ORGANS[lesson.organ].accentHint;
  return (
    <div
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl ring-1 ring-white/20"
      data-testid={`ashore-painting-lesson-${lesson.organ}`}
      data-gallery="spine-paintings"
      style={{ background: themeBackground(lesson.organ) }}
    >
      <div className="flex flex-col items-center gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-center sm:gap-6">
        <SpinePaintingPortal organ={lesson.organ} lit size="xl" />
        <div className="max-w-sm text-left text-[#1c1917] sm:pb-2">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {organVerbChip(lesson.organ)} · living painting
          </p>
          <h2 className="mt-1 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
            {lesson.place}
          </h2>
          <p className="mt-1 text-sm font-semibold">{lesson.landmark}</p>
          <p className="mt-2 text-sm">
            <span className="font-bold">{lesson.npc}</span> — {lesson.playWhere}
          </p>
          <p className="mt-2 text-xs italic opacity-80">{coldOrganKidSentence(lesson.organ)}</p>
          <p className="mt-2 text-[11px] font-semibold opacity-75">{lesson.structure}</p>
        </div>
      </div>
      <div className="bg-[#0f172a]/90 px-4 py-4">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wide text-amber-100/80">
          Practice the Take · does not stick yet
        </p>
        <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
          {lesson.forks.map((fork) => {
            const on = chosen === fork;
            return (
              <button
                key={fork}
                type="button"
                data-testid={`ashore-take-fork-${lesson.organ}-${fork === lesson.forks[0] ? "a" : "b"}`}
                className={`min-h-12 flex-1 rounded-xl px-3 py-3 text-sm font-black ring-1 ${
                  on
                    ? "bg-amber-400 text-[#1c1917] ring-amber-100"
                    : "bg-white/10 text-white ring-white/25 hover:bg-white/15"
                }`}
                {...pointerSafeActivate(() => {
                  playOrganSfx(lesson.organ);
                  onChoose(fork);
                })}
              >
                {fork}
              </button>
            );
          })}
        </div>
        {chosen ? (
          <p className="mt-3 text-center text-xs font-bold text-amber-100" data-testid="ashore-take-plaque-preview">
            Plaque preview · “{chosen}” — Harbor will keep this if you choose it for real
          </p>
        ) : (
          <p className="mt-3 text-center text-xs text-white/55">
            Tap a fork — see the words that become your Memory Plinth plaque
          </p>
        )}
      </div>
    </div>
  );
}

/** Chamber: Harbor remembers after a Take. */
export function ReturnScarShowcase({
  plaque,
  glowed,
  onGlow,
}: {
  plaque: string;
  glowed: boolean;
  onGlow: () => void;
}) {
  return (
    <div
      className="relative mx-auto flex w-full max-w-xl flex-col items-center overflow-hidden rounded-2xl px-4 py-6 ring-1 ring-amber-200/40"
      data-testid="ashore-return-showcase"
      style={{
        background: "radial-gradient(circle at 50% 40%, #f59e0b66 0%, #0f172a 65%)",
      }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
        Carpet home · Harbor felt that
      </p>
      <button
        type="button"
        data-testid="ashore-return-glow"
        className="mt-3 transition hover:scale-[1.02]"
        {...pointerSafeActivate(() => {
          playOrganSfx("memory");
          onGlow();
        })}
      >
        <PlinthCanvas
          lit={glowed}
          className={`h-44 w-44 sm:h-52 sm:w-52 ${
            glowed ? "drop-shadow-[0_0_28px_#f59e0b]" : "opacity-80"
          }`}
        />
      </button>
      <p className="mt-3 text-lg font-black text-amber-100">
        {glowed ? `“${plaque}” lives on the Plinth` : "Tap the Plinth — feel the scar land"}
      </p>
      <p className="mt-1 max-w-md text-center text-sm text-white/75">
        Piggy names what changed. Day-2 echo can retell it. Share freezes this look — next chamber.
      </p>
    </div>
  );
}

export type StructurePadId = "arcade" | "soft";

/** Chamber: Enter Money Structures. */
export function EnterStructuresShowcase({
  lit,
  onLit,
}: {
  lit: StructurePadId[];
  onLit: (id: StructurePadId) => void;
}) {
  return (
    <div
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-[#0f172a] ring-1 ring-white/20"
      data-testid="ashore-enter-showcase"
    >
      <div className="grid grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-4">
        {(
          [
            ["coin", "Coin Jar"],
            ["memory", "Ledger Bank"],
            ["clock", "Payroll Tower"],
            ["spiral", "Interest Keep"],
          ] as const
        ).map(([organ, label]) => (
          <div key={organ} className="flex flex-col items-center gap-1.5">
            <SpinePaintingPortal organ={organ} lit size="md" />
            <span className="text-[10px] font-bold text-white/75">{label}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-2 border-t border-white/10 px-4 py-4 sm:grid-cols-2">
        <button
          type="button"
          data-testid="ashore-enter-arcade"
          className={`rounded-xl px-3 py-3 text-left ring-1 ${
            lit.includes("arcade")
              ? "bg-sky-400/25 ring-sky-200/60"
              : "bg-white/5 ring-white/15 hover:bg-white/10"
          }`}
          {...pointerSafeActivate(() => {
            playOrganSfx("clock");
            onLit("arcade");
          })}
        >
          <p className="text-sm font-black text-sky-100">Arcade pads</p>
          <p className="mt-1 text-[11px] text-white/70">
            Cork, spring, stamp, anvil — longer climbs that open toy worlds inside the machine.
          </p>
        </button>
        <button
          type="button"
          data-testid="ashore-enter-soft"
          className={`rounded-xl px-3 py-3 text-left ring-1 ${
            lit.includes("soft")
              ? "bg-amber-400/25 ring-amber-200/60"
              : "bg-white/5 ring-white/15 hover:bg-white/10"
          }`}
          {...pointerSafeActivate(() => {
            playOrganSfx("coin");
            onLit("soft");
          })}
        >
          <p className="text-sm font-black text-amber-100">Soft Beat peeks</p>
          <p className="mt-1 text-[11px] text-white/70">
            Lid · teller · loft · battlement — climb, look, leave. Not a second Take.
          </p>
        </button>
      </div>
    </div>
  );
}

/** Chamber: Share card social object. */
export function ShareCardShowcase({
  frozen,
  plaque,
  onFreeze,
}: {
  frozen: boolean;
  plaque: string;
  onFreeze: () => void;
}) {
  return (
    <div
      className="mx-auto flex w-full max-w-xl flex-col items-center overflow-hidden rounded-2xl px-4 py-6 ring-1 ring-amber-200/40"
      data-testid="ashore-share-showcase"
      style={{
        background: "radial-gradient(circle at 50% 40%, #f59e0b55 0%, #0f172a 70%)",
      }}
    >
      <button
        type="button"
        data-testid="ashore-share-freeze"
        className={`w-56 rounded-xl px-4 py-4 ring-1 transition sm:w-64 ${
          frozen
            ? "bg-[#1c1917] ring-amber-200/70 scale-[1.02]"
            : "bg-[#1c1917]/75 ring-amber-200/40 hover:ring-amber-200/70"
        }`}
        {...pointerSafeActivate(() => {
          playOrganSfx("memory");
          onFreeze();
        })}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/90">
          Capital · Harbor felt that
        </p>
        <PlinthCanvas lit={frozen} className="mx-auto my-2 h-28 w-28" />
        <p className="text-sm font-black text-amber-100">“{plaque}”</p>
        <p className="mt-1 text-[10px] text-white/65">
          {frozen ? "Frozen · your social object" : "Tap to freeze the Plinth"}
        </p>
      </button>
      <p className="mt-4 max-w-md text-center text-sm text-white/75">
        After spectacle, Share downloads this card — the portable proof Harbor remembered.
      </p>
    </div>
  );
}

/** Ready chamber — Carpet Dock composition with first painting lit. */
export function ReadyCarpetShowcase() {
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-lg flex-col items-center justify-end overflow-hidden rounded-2xl pb-3 ring-1 ring-amber-200/35 sm:h-56"
      data-testid="ashore-ready-showcase"
      style={{ background: "linear-gradient(180deg, #0c4a6e 0%, #164e63 45%, #14532d 100%)" }}
    >
      <div className="flex items-end gap-2 sm:gap-3">
        <div className="h-28 w-2.5 rounded-t-md bg-amber-800 sm:h-32 sm:w-3" />
        <div className="relative">
          <SpinePaintingPortal organ="coin" lit size="lg" />
          <div className="absolute -bottom-3 left-1/2 z-[1] -translate-x-1/2">
            <StructureHero hero="carpet" accent="#fbbf24" lit />
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-2 opacity-65">
          <SpinePaintingPortal organ="clock" size="sm" />
          <SpinePaintingPortal organ="spiral" size="sm" />
        </div>
        <div className="h-28 w-2.5 rounded-t-md bg-amber-800 sm:h-32 sm:w-3" />
      </div>
      <p className="mt-5 text-[11px] font-bold text-amber-100">
        Carpet Dock · first board Coincraft Cove
      </p>
    </div>
  );
}

/** Legacy aliases kept for any older imports / loop helpers. */
export type LoopBeatId = "harbor" | "carpet" | "take" | "return";
export type ToolkitVerbId = "enter" | "take" | "return" | "share";

export function LoopBeatShowcase({ beatId }: { beatId: LoopBeatId }) {
  if (beatId === "harbor") {
    return (
      <div data-testid="ashore-loop-showcase" data-loop-beat="harbor">
        <HarborHomeShowcase lit={["piggy", "plinth", "dock"]} onLight={() => {}} />
      </div>
    );
  }
  if (beatId === "carpet") {
    return (
      <div data-testid="ashore-loop-showcase" data-loop-beat="carpet">
        <CarpetDockShowcase boarded onBoard={() => {}} />
      </div>
    );
  }
  if (beatId === "take") {
    return (
      <div data-testid="ashore-loop-showcase" data-loop-beat="take">
        <PaintingLessonShowcase
          lesson={PAINTING_LESSONS.coin}
          chosen="Jar before treat"
          onChoose={() => {}}
        />
      </div>
    );
  }
  return (
    <div data-testid="ashore-loop-showcase" data-loop-beat="return">
      <ReturnScarShowcase plaque="Jar before treat" glowed onGlow={() => {}} />
    </div>
  );
}

export function ToolkitVerbShowcase({ verb }: { verb: ToolkitVerbId | null }) {
  if (verb === "enter") {
    return (
      <div data-testid="ashore-toolkit-showcase" data-toolkit-verb="enter">
        <EnterStructuresShowcase lit={["arcade", "soft"]} onLit={() => {}} />
      </div>
    );
  }
  if (verb === "share") {
    return (
      <div data-testid="ashore-toolkit-showcase" data-toolkit-verb="share">
        <ShareCardShowcase frozen plaque="Jar before treat" onFreeze={() => {}} />
      </div>
    );
  }
  return (
    <div
      className="mx-auto flex h-32 w-full max-w-md items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/15"
      data-testid="ashore-toolkit-showcase"
      data-toolkit-verb={verb ?? "none"}
    >
      <p className="text-sm text-white/60">Expanded chambers own each verb now.</p>
    </div>
  );
}
