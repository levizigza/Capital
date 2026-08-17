/**
 * Ashore Teach Chamber-00 visuals — Dock + Launch only.
 * Research: docs/ashore-tutorial-research.md (≤5 prove-it chambers).
 */

import { useEffect, useRef } from "react";
import { MONEY_ORGANS, type MoneyOrganId } from "../moneyOrgans";
import { drawMemoryPlinthSilhouette } from "../harborIcon";
import { prefersReducedMotion } from "../a11yMotion";
import { ISLAND_THEMES } from "../themes/islandThemes";
import { playOrganSfx } from "../audio/capitalSfx";
import { pointerSafeActivate } from "../pointerSafeClick";

export type PaintingHero = "plinth" | "jar" | "tower" | "keep" | "carpet";

export function heroForOrgan(organ: MoneyOrganId): PaintingHero {
  if (organ === "memory") return "plinth";
  if (organ === "coin") return "jar";
  if (organ === "clock") return "tower";
  return "keep";
}

function themeBackground(organ: MoneyOrganId): string {
  if (organ === "memory") return ISLAND_THEMES.harbor_haven.background;
  if (organ === "coin") return ISLAND_THEMES.coincraft_cove.background;
  if (organ === "clock") return ISLAND_THEMES.paycheck_peninsula.background;
  return (
    ISLAND_THEMES.credit_kingdom?.background ??
    "radial-gradient(circle at 50% 40%, #a78bfa55 0%, #0f172a 70%)"
  );
}

function PlinthCanvas({ lit = true, className = "" }: { lit?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 160;
    const h = 160;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawMemoryPlinthSilhouette(ctx, w / 2, h / 2 + 8, 0.9, lit);
  }, [lit]);
  return (
    <canvas
      ref={ref}
      className={className}
      width={160}
      height={160}
      aria-hidden
      data-testid="ashore-plinth-canvas"
    />
  );
}

function StructureHero({
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
    return <PlinthCanvas lit={lit} className="h-[72%] w-auto drop-shadow-lg" />;
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
        <div className={`absolute top-[8%] rounded-full bg-amber-100/80 ${tall ? "h-3 w-24" : "h-2.5 w-16"}`} />
      </div>
    );
  }
  if (hero === "tower") {
    return (
      <div className={`relative flex items-end justify-center ${tall ? "h-[88%]" : "h-[72%]"}`} data-hero="tower">
        <div
          className={`${tall ? "w-16" : "w-12"} h-full rounded-t-md border border-white/30`}
          style={{
            background: `linear-gradient(180deg, #e2e8f0 0%, ${accent} 100%)`,
            boxShadow: lit ? `0 0 24px ${accent}88` : undefined,
          }}
        />
      </div>
    );
  }
  if (hero === "keep") {
    return (
      <div className={`relative flex items-end justify-center ${tall ? "h-[88%]" : "h-[72%]"}`} data-hero="keep">
        <div
          className={`${tall ? "h-[88%] border-l-[40px] border-r-[40px] border-b-[120px]" : "h-[85%] border-l-[28px] border-r-[28px] border-b-[90px]"} w-0 border-l-transparent border-r-transparent`}
          style={{ borderBottomColor: accent }}
        />
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
    />
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
          style={{ background: "linear-gradient(180deg, transparent, #0ea5e988)" }}
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

/** Fantasy chamber — poke organ toys so living money is felt, not only read. */
export function FantasyOrganToys({
  poked,
  onPoke,
  nudge = false,
}: {
  poked: MoneyOrganId[];
  onPoke: (id: MoneyOrganId) => void;
  /** Pulse toys when Continue was pressed before a poke (clipped-CTA recovery). */
  nudge?: boolean;
}) {
  const toys: { id: MoneyOrganId; label: string }[] = [
    { id: "memory", label: "Memory keeps" },
    { id: "coin", label: "Coin holds" },
  ];
  return (
    <div
      className={`flex justify-center gap-4 ${nudge ? "animate-pulse" : ""}`}
      data-testid="ashore-fantasy-toys"
      data-nudge={nudge ? "1" : "0"}
    >
      {toys.map((t) => {
        const lit = poked.includes(t.id);
        const accent = MONEY_ORGANS[t.id].accentHint;
        return (
          <button
            key={t.id}
            type="button"
            data-testid={`ashore-fantasy-toy-${t.id}`}
            aria-pressed={lit}
            aria-label={`Poke ${t.label}`}
            className={`flex min-h-[7.5rem] min-w-[6.5rem] touch-manipulation flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 ring-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${
              lit
                ? "bg-white/15 ring-amber-200/70"
                : nudge
                  ? "bg-amber-400/20 ring-amber-200/90 hover:bg-amber-400/30"
                  : "bg-white/10 ring-white/35 hover:bg-white/15"
            }`}
            onClick={() => {
              playOrganSfx(t.id);
              onPoke(t.id);
            }}
          >
            <SpinePaintingPortal organ={t.id} lit={lit} size="sm" />
            <span className="text-[11px] font-bold" style={{ color: accent }}>
              {t.label}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              {lit ? "Lit" : "Tap to poke"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Chamber 4 — Carpet Dock: board the lit Cove painting. */
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
          <SpinePaintingPortal organ="coin" lit size="xl" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <StructureHero hero="carpet" accent="#fbbf24" lit size="lg" />
          </div>
        </button>
        <div className="mb-10 flex flex-col gap-2 opacity-40">
          <SpinePaintingPortal organ="clock" size="sm" />
          <SpinePaintingPortal organ="spiral" size="sm" />
        </div>
        <div className="h-36 w-3 rounded-t-md bg-amber-800 sm:h-44 sm:w-3.5" />
      </div>
      <p className="mt-8 text-sm font-bold text-amber-100">
        {boarded
          ? "Boarded · Coincraft Cove opens first"
          : "Tap the lit Cove painting — practice boarding"}
      </p>
      <p className="mt-1 max-w-md text-center text-[11px] text-white/65">
        Later paintings wait on this same Dock after Harbor remembers your Cove Take.
      </p>
    </div>
  );
}

/** Chamber 5 — Launch composition. */
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
        <div className="h-28 w-2.5 rounded-t-md bg-amber-800 sm:h-32 sm:w-3" />
      </div>
      <p className="mt-5 text-[11px] font-bold text-amber-100">
        Harbor first · then board Coincraft Cove
      </p>
    </div>
  );
}
