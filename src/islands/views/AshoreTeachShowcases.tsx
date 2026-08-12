/**
 * Ashore Teach visual showcases — paintings / loop / toolkit look like the game.
 * Mirrors MoneyCarpetGate + shore play_pad + arrive motifs + Memory Plinth (no map widen).
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
    drawMemoryPlinthSilhouette(ctx, w / 2, h / 2 + 8, 0.85, lit);
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
}: {
  hero: PaintingHero;
  accent: string;
  lit: boolean;
}) {
  if (hero === "plinth") {
    return <PlinthCanvas lit={lit} className="h-[72%] w-auto drop-shadow-lg" />;
  }
  if (hero === "jar") {
    return (
      <div className="relative flex h-[70%] items-end justify-center" data-hero="jar">
        <div
          className="h-[88%] w-14 rounded-b-[1.6rem] rounded-t-md border-2 border-amber-100/50"
          style={{
            background: `linear-gradient(180deg, ${accent}ee 0%, #fde68a 55%, #f59e0b 100%)`,
            boxShadow: lit ? `0 0 28px ${accent}99` : undefined,
          }}
        />
        <div className="absolute top-[8%] h-2.5 w-16 rounded-full bg-amber-100/80" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-amber-50/40"
            style={{
              width: 18 - i * 2,
              height: 6,
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
      <div className="relative flex h-[72%] items-end justify-center" data-hero="tower">
        <div
          className="h-full w-12 rounded-t-md border border-white/30"
          style={{
            background: `linear-gradient(180deg, #e2e8f0 0%, ${accent} 100%)`,
            boxShadow: lit ? `0 0 24px ${accent}88` : undefined,
          }}
        />
        <div
          className="absolute top-[18%] h-10 w-10 rounded-full border-2"
          style={{ borderColor: accent, background: "#0f172a88" }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-3.5 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-white"
            style={
              prefersReducedMotion()
                ? undefined
                : { animation: "cap-vault-dial 2.4s linear infinite" }
            }
          />
        </div>
        <div
          className="absolute bottom-0 h-2 w-16 rounded-sm"
          style={{ background: accent }}
        />
      </div>
    );
  }
  if (hero === "keep") {
    return (
      <div className="relative flex h-[72%] items-end justify-center" data-hero="keep">
        <div
          className="h-[85%] w-0 border-l-[28px] border-r-[28px] border-b-[90px] border-l-transparent border-r-transparent"
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
              width: 54 - i * 14,
              height: 54 - i * 14,
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
  // carpet
  return (
    <div
      className="relative h-16 w-28 rounded-sm border border-amber-100/40 shadow-lg"
      data-hero="carpet"
      style={{
        background:
          "repeating-linear-gradient(90deg, #14532d 0 8px, #166534 8px 16px), linear-gradient(180deg, #fde68a 0%, #f59e0b 100%)",
        backgroundBlendMode: "multiply",
        boxShadow: lit ? "0 8px 24px #f59e0b66" : undefined,
        transform: prefersReducedMotion() ? undefined : "translateY(-4px)",
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
  large?: boolean;
  className?: string;
  /** Optional override hero (loop carpet beat). */
  hero?: PaintingHero;
};

/** Framed living painting — same language as Harbor gate / shore play_pad. */
export function SpinePaintingPortal({
  organ,
  lit = false,
  large = false,
  className = "",
  hero,
}: SpinePaintingPortalProps) {
  const accent = MONEY_ORGANS[organ].accentHint;
  const bg = themeBackground(organ);
  const h = hero ?? heroForOrgan(organ);
  return (
    <div
      className={`relative overflow-hidden rounded-sm ${large ? "h-44 w-36 sm:h-52 sm:w-40" : "h-28 w-[5.5rem]"} ${className}`}
      data-testid={`ashore-painting-portal-${organ}`}
      data-painting-hero={h}
      aria-hidden
      style={{
        boxShadow: lit
          ? `0 0 0 2px ${accent}, 0 12px 28px ${accent}55`
          : "0 0 0 1px rgba(255,255,255,0.2), 0 8px 18px rgba(0,0,0,0.35)",
      }}
    >
      {/* Dark frame */}
      <div className="absolute inset-0 bg-[#1c1917]" />
      <div
        className="absolute inset-[7%] overflow-hidden"
        style={{ background: bg }}
      >
        {/* Sea wash */}
        <div
          className="absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              organ === "spiral"
                ? "linear-gradient(180deg, transparent, #312e81aa)"
                : "linear-gradient(180deg, transparent, #0ea5e988)",
          }}
        />
        {/* Accent canvas wash */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${accent} 0%, transparent 62%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <StructureHero hero={h} accent={accent} lit={lit} />
        </div>
      </div>
      {/* Gate pillars hint */}
      <div className="absolute bottom-[6%] left-[10%] h-[18%] w-1.5 rounded-t-sm bg-amber-800/80" />
      <div className="absolute bottom-[6%] right-[10%] h-[18%] w-1.5 rounded-t-sm bg-amber-800/80" />
    </div>
  );
}

export type LoopBeatId = "harbor" | "carpet" | "take" | "return";

/** Large interactive preview for each signature-loop beat. */
export function LoopBeatShowcase({ beatId }: { beatId: LoopBeatId }) {
  if (beatId === "harbor") {
    return (
      <div
        className="relative mx-auto flex h-48 w-full max-w-md items-end justify-center overflow-hidden rounded-2xl ring-1 ring-amber-200/30 sm:h-56"
        data-testid="ashore-loop-showcase"
        data-loop-beat="harbor"
        style={{
          background: ISLAND_THEMES.harbor_haven.background,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-300/40 to-transparent" />
        <PlinthCanvas lit className="relative z-[1] mb-2 h-36 w-36 drop-shadow-xl" />
        <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] font-bold text-[#1c1917]/80">
          Memory Plinth · home plaza
        </p>
      </div>
    );
  }
  if (beatId === "carpet") {
    return (
      <div
        className="relative mx-auto flex h-48 w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl ring-1 ring-amber-200/30 sm:h-56"
        data-testid="ashore-loop-showcase"
        data-loop-beat="carpet"
        style={{ background: "linear-gradient(180deg, #0c4a6e 0%, #164e63 40%, #14532d 100%)" }}
      >
        <div className="flex items-end gap-3">
          <div className="h-28 w-3 rounded-t-md bg-amber-800" />
          <SpinePaintingPortal organ="coin" lit large hero="carpet" />
          <div className="h-28 w-3 rounded-t-md bg-amber-800" />
        </div>
        <p className="mt-3 text-[11px] font-bold text-amber-100/90">
          Carpet Dock · board a painting
        </p>
      </div>
    );
  }
  if (beatId === "take") {
    return (
      <div
        className="relative mx-auto flex h-48 w-full max-w-md items-center justify-center gap-4 overflow-hidden rounded-2xl ring-1 ring-amber-200/30 sm:h-56"
        data-testid="ashore-loop-showcase"
        data-loop-beat="take"
        style={{ background: ISLAND_THEMES.coincraft_cove.background }}
      >
        <SpinePaintingPortal organ="coin" lit large />
        <div className="flex max-w-[10rem] flex-col gap-2">
          <span className="rounded-lg bg-[#1c1917]/80 px-3 py-2 text-left text-xs font-black text-amber-100 ring-1 ring-amber-300/50">
            Jar before treat
          </span>
          <span className="rounded-lg bg-[#1c1917]/55 px-3 py-2 text-left text-xs font-bold text-white/80 ring-1 ring-white/20">
            Treat before jar
          </span>
          <p className="text-[10px] font-semibold text-[#1c1917]/85">
            Cove Take · sticks forever
          </p>
        </div>
      </div>
    );
  }
  // return
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-md items-end justify-center overflow-hidden rounded-2xl ring-1 ring-amber-200/40 sm:h-56"
      data-testid="ashore-loop-showcase"
      data-loop-beat="return"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #f59e0b66 0%, #0f172a 65%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={
          prefersReducedMotion()
            ? undefined
            : { animation: "cap-arrive-pulse 1.4s ease-in-out infinite" }
        }
      />
      <PlinthCanvas lit className="relative z-[1] mb-6 h-40 w-40 drop-shadow-[0_0_24px_#f59e0b]" />
      <p className="absolute bottom-2 text-center text-[11px] font-bold text-amber-100">
        “Jar before treat” · Harbor felt that
      </p>
    </div>
  );
}

export type ToolkitVerbId = "enter" | "take" | "return" | "share";

/** Showcase how each toolkit verb turns out in-game. */
export function ToolkitVerbShowcase({ verb }: { verb: ToolkitVerbId | null }) {
  if (!verb) {
    return (
      <div
        className="mx-auto flex h-40 w-full max-w-md items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/15 sm:h-48"
        data-testid="ashore-toolkit-showcase"
        data-toolkit-verb="none"
      >
        <p className="text-sm text-white/60">Light a verb — see how it looks in Capital.</p>
      </div>
    );
  }
  if (verb === "enter") {
    return (
      <div
        className="mx-auto flex h-40 w-full max-w-md items-end justify-around gap-2 overflow-hidden rounded-2xl bg-[#0f172a] px-3 pb-3 ring-1 ring-white/15 sm:h-48"
        data-testid="ashore-toolkit-showcase"
        data-toolkit-verb="enter"
      >
        {(
          [
            ["coin", "Coin Jar"],
            ["memory", "Ledger Bank"],
            ["clock", "Payroll Tower"],
            ["spiral", "Interest Keep"],
          ] as const
        ).map(([organ, label]) => (
          <div key={organ} className="flex flex-col items-center gap-1">
            <SpinePaintingPortal organ={organ} lit />
            <span className="text-[9px] font-bold text-white/70">{label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (verb === "take") {
    return (
      <div
        className="mx-auto flex h-40 w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl px-3 ring-1 ring-amber-200/30 sm:h-48"
        data-testid="ashore-toolkit-showcase"
        data-toolkit-verb="take"
        style={{ background: ISLAND_THEMES.coincraft_cove.background }}
      >
        <SpinePaintingPortal organ="coin" lit large />
        <div className="flex flex-col gap-2">
          <span className="rounded-lg bg-[#1c1917] px-3 py-2 text-xs font-black text-amber-100">
            Jar before treat
          </span>
          <span className="rounded-lg bg-[#1c1917]/70 px-3 py-2 text-xs font-bold text-white/85">
            Treat before jar
          </span>
          <p className="text-[10px] font-semibold text-[#1c1917]">Shore fork — not Soft Beat</p>
        </div>
      </div>
    );
  }
  if (verb === "return") {
    return (
      <div
        className="mx-auto flex h-40 w-full max-w-md items-center justify-center gap-4 overflow-hidden rounded-2xl ring-1 ring-amber-200/30 sm:h-48"
        data-testid="ashore-toolkit-showcase"
        data-toolkit-verb="return"
        style={{ background: "linear-gradient(120deg, #14532d 0%, #0f172a 55%, #f59e0b44 100%)" }}
      >
        <StructureHero hero="carpet" accent="#fbbf24" lit />
        <span className="text-2xl font-black text-amber-200">→</span>
        <PlinthCanvas lit className="h-28 w-28" />
      </div>
    );
  }
  // share
  return (
    <div
      className="mx-auto flex h-40 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl ring-1 ring-amber-200/40 sm:h-48"
      data-testid="ashore-toolkit-showcase"
      data-toolkit-verb="share"
      style={{
        background: "radial-gradient(circle at 50% 40%, #f59e0b55 0%, #0f172a 70%)",
      }}
    >
      <div className="flex w-44 flex-col items-center rounded-xl bg-[#1c1917]/80 px-3 py-3 ring-1 ring-amber-200/40">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/90">
          Capital · Harbor felt that
        </p>
        <PlinthCanvas lit className="my-1 h-20 w-20" />
        <p className="text-xs font-black text-amber-100">Jar before treat</p>
        <p className="mt-0.5 text-[10px] text-white/65">Share card · social object</p>
      </div>
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
          <SpinePaintingPortal organ="coin" lit large />
          <div className="absolute -bottom-3 left-1/2 z-[1] -translate-x-1/2">
            <StructureHero hero="carpet" accent="#fbbf24" lit />
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-2 opacity-65">
          <SpinePaintingPortal organ="clock" />
          <SpinePaintingPortal organ="spiral" />
        </div>
        <div className="h-28 w-2.5 rounded-t-md bg-amber-800 sm:h-32 sm:w-3" />
      </div>
      <p className="mt-5 text-[11px] font-bold text-amber-100">
        Carpet Dock · first board Coincraft Cove
      </p>
    </div>
  );
}
