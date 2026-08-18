/**
 * Ashore Teach visuals — FTUE prove-it toys (goal → deeper).
 * Research: docs/ftue-interactive-teach.md
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

/** Fantasy / economy — poke organ toys so living money is felt, not only read. */
export function FantasyOrganToys({
  poked,
  onPoke,
  organs = ["memory", "coin"],
}: {
  poked: MoneyOrganId[];
  onPoke: (id: MoneyOrganId) => void;
  /** Limit which toys appear (economy beat = Coin only). */
  organs?: MoneyOrganId[];
}) {
  const toys: { id: MoneyOrganId; label: string }[] = [
    { id: "memory", label: "Memory keeps" },
    { id: "coin", label: "Coin holds" },
  ].filter((t) => organs.includes(t.id));
  return (
    <div
      className="mt-3 flex justify-center gap-3"
      data-testid="ashore-fantasy-toys"
    >
      {toys.map((t) => {
        const lit = poked.includes(t.id);
        const accent = MONEY_ORGANS[t.id].accentHint;
        return (
          <button
            key={t.id}
            type="button"
            data-testid={`ashore-fantasy-toy-${t.id}`}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 ring-1 transition ${
              lit ? "bg-white/15 ring-amber-200/60" : "bg-white/5 ring-white/20 hover:bg-white/10"
            }`}
            {...pointerSafeActivate(() => {
              playOrganSfx(t.id);
              onPoke(t.id);
            })}
          >
            <SpinePaintingPortal organ={t.id} lit={lit} size="sm" />
            <span className="text-[10px] font-bold" style={{ color: accent }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Goal beat — touch empty Plinth to claim the fantasy. */
export function GoalPlinthClaim({
  claimed,
  onClaim,
}: {
  claimed: boolean;
  onClaim: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="ashore-goal-plinth"
      className={`mt-4 flex flex-col items-center rounded-2xl px-6 py-4 ring-1 transition ${
        claimed
          ? "bg-amber-400/20 ring-amber-200/70"
          : "bg-white/5 ring-white/25 hover:bg-white/10"
      }`}
      {...pointerSafeActivate(() => {
        playOrganSfx("memory");
        onClaim();
      })}
    >
      <PlinthCanvas lit={claimed} className="h-36 w-36 drop-shadow-lg sm:h-40 sm:w-40" />
      <span className="mt-2 text-sm font-bold text-amber-100">
        {claimed ? "Goal claimed — Harbor will keep your mark" : "Touch the empty Plinth"}
      </span>
    </button>
  );
}

/** Decision beat — irreversible practice fork (both advance). */
export function DecisionForkShowcase({
  chosen,
  onChoose,
}: {
  chosen: string | null;
  onChoose: (label: string) => void;
}) {
  const forks = ["Jar before treat", "Treat before jar"] as const;
  return (
    <div
      className="mt-4 flex w-full max-w-md flex-col gap-3"
      data-testid="ashore-decision-fork"
    >
      {forks.map((label, i) => {
        const selected = chosen === label;
        return (
          <button
            key={label}
            type="button"
            disabled={chosen != null}
            data-testid={`ashore-decision-${i === 0 ? "a" : "b"}`}
            className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-base font-black transition ${
              selected
                ? "border-amber-200 bg-amber-400/30 text-amber-50"
                : chosen
                  ? "border-white/10 bg-white/5 text-white/40"
                  : "border-[#1c1917] bg-[#f4b942] text-[#1c1917] shadow-[3px_3px_0_#1c1917] hover:brightness-105"
            }`}
            {...pointerSafeActivate(() => {
              if (chosen != null) return;
              playOrganSfx("coin");
              onChoose(label);
            })}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Consequence beat — hush + plaque write (witness). */
export function ConsequenceHushShowcase({
  plaque,
  phase,
}: {
  plaque: string;
  phase: "hush" | "mark";
}) {
  return (
    <div
      className="mt-4 flex w-full max-w-md flex-col items-center rounded-2xl bg-[#0f172a]/80 px-5 py-6 ring-1 ring-white/20"
      data-testid="ashore-consequence-hush"
      data-hush-phase={phase}
    >
      {phase === "hush" ? (
        <p className="tracking-[0.4em] text-white/50" data-testid="ashore-hush-ellipsis">
          …
        </p>
      ) : (
        <>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
            Mark
          </p>
          <p className="mt-2 text-lg font-black text-amber-100">“{plaque}”</p>
          <p className="mt-2 text-sm text-white/70">The Coin holds. Harbor is already listening.</p>
        </>
      )}
    </div>
  );
}

/** Reward beat — tap lit Plinth. */
export function RewardPlinthShowcase({
  plaque,
  claimed,
  onClaim,
}: {
  plaque: string;
  claimed: boolean;
  onClaim: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="ashore-reward-plinth"
      className={`mt-4 flex flex-col items-center rounded-2xl px-6 py-4 ring-1 transition ${
        claimed
          ? "bg-amber-400/25 ring-amber-200/80"
          : "bg-white/5 ring-amber-300/50 hover:bg-amber-400/10"
      }`}
      {...pointerSafeActivate(() => {
        playOrganSfx("memory");
        onClaim();
      })}
    >
      <PlinthCanvas lit className="h-40 w-40 drop-shadow-[0_0_28px_#f59e0b] sm:h-44 sm:w-44" />
      <p className="mt-2 text-lg font-black text-amber-100">Harbor felt that</p>
      <p className="mt-1 text-sm text-white/75">“{plaque}”</p>
      <p className="mt-2 text-xs font-bold text-amber-200/90">
        {claimed ? "Reward claimed" : "Tap the glowing Plinth"}
      </p>
    </button>
  );
}

/** Deeper hint — Soft Beat look + dim Clock, then board Cove. */
export function DeeperStrategyShowcase({
  looked,
  boarded,
  onLook,
  onBoard,
}: {
  looked: boolean;
  boarded: boolean;
  onLook: () => void;
  onBoard: () => void;
}) {
  return (
    <div
      className="mx-auto mt-3 flex w-full max-w-xl flex-col items-center gap-4"
      data-testid="ashore-deeper-showcase"
    >
      <button
        type="button"
        data-testid="ashore-deeper-soft-beat"
        className={`rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
          looked
            ? "bg-sky-400/20 text-sky-100 ring-sky-300/50"
            : "bg-white/5 text-white/85 ring-white/25 hover:bg-white/10"
        }`}
        {...pointerSafeActivate(() => {
          playOrganSfx("coin");
          onLook();
        })}
      >
        {looked
          ? "Soft Beat — lookouts show weight, not a second Take"
          : "Peek Soft Beat — look, then leave"}
      </button>
      <div
        className="relative flex w-full flex-col items-center overflow-hidden rounded-2xl px-4 pb-4 pt-5 ring-1 ring-amber-200/35"
        style={{ background: "linear-gradient(180deg, #0c4a6e 0%, #164e63 45%, #14532d 100%)" }}
      >
        <div className="flex items-end gap-3 sm:gap-5">
          <div className="h-36 w-3 rounded-t-md bg-amber-800 sm:h-44 sm:w-3.5" />
          <button
            type="button"
            data-testid="ashore-carpet-board-cove"
            className="relative transition hover:scale-[1.03]"
            disabled={!looked}
            {...pointerSafeActivate(() => {
              if (!looked) return;
              playOrganSfx("coin");
              onBoard();
            })}
          >
            <SpinePaintingPortal organ="coin" lit={looked} size="xl" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
              <StructureHero hero="carpet" accent="#fbbf24" lit={looked} size="lg" />
            </div>
          </button>
          <div className="mb-10 flex flex-col gap-2 opacity-35" data-testid="ashore-deeper-clock-dim">
            <SpinePaintingPortal organ="clock" size="sm" />
            <p className="max-w-[4.5rem] text-center text-[9px] font-bold text-sky-100/80">
              Clock later
            </p>
          </div>
          <div className="h-36 w-3 rounded-t-md bg-amber-800 sm:h-44 sm:w-3.5" />
        </div>
        <p className="mt-8 text-sm font-bold text-amber-100">
          {!looked
            ? "Look Soft Beat first"
            : boarded
              ? "Boarded · Cove opens first"
              : "Board the lit Cove painting"}
        </p>
      </div>
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

/** Launch composition (legacy ready beat). */
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
