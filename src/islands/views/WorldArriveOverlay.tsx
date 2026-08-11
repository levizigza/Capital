/**
 * Astro-style world open — unique enter beat per destination.
 * Visual + organ SFX; structure enter ducks BGM via MoneyStructureInteriorView.
 */

import { useEffect, useMemo, useState } from "react";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";
import { moneyStructureForIsland } from "../moneyStructures";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { moneyOrganForIsland } from "../moneyOrgans";
import { cinemaTimeScale } from "../a11yMotion";
import { arriveEyebrow } from "../titleVoice";
import { coldOrganKidSentence } from "../worldMemory";
import { triggerJuice } from "@/juice";
import { useOverlayEscape } from "./useOverlayEscape";

export type WorldArriveKind = "carpet_land" | "structure_enter" | "painting_portal";

type Props = {
  islandId: string;
  islandName: string;
  kind?: WorldArriveKind;
  /** Override headline (structure enterTransition etc.) */
  headline?: string;
  durationMs?: number;
  onDone: () => void;
};

type ArriveTheme = {
  id: string;
  eyebrow: string;
  verb: string;
  accent: string;
  accent2: string;
  motif: "slot" | "chute" | "spiral" | "vault" | "portal";
  blurb: string;
};

function themeForIsland(islandId: string, kind: WorldArriveKind): ArriveTheme {
  const structure = moneyStructureForIsland(islandId);
  const organ = moneyOrganForIsland(islandId);
  const eyebrow = arriveEyebrow(islandId, kind, organ?.id);
  if (islandId === COVE_ISLAND_ID || structure?.theme === "jar") {
    return {
      id: "cove",
      eyebrow,
      verb: kind === "structure_enter" ? "Squeezing through the coin slot…" : "Diving through the coin slot…",
      accent: "#fbbf24",
      accent2: "#fde68a",
      motif: "slot",
      blurb: coldOrganKidSentence("coin"),
    };
  }
  if (islandId === PAYCHECK_PENINSULA_ID || structure?.theme === "tower") {
    return {
      id: "paycheck",
      eyebrow,
      verb: kind === "structure_enter" ? "Riding the paycheck chute…" : "Sucked up the payroll chute…",
      accent: "#38bdf8",
      accent2: "#e2e8f0",
      motif: "chute",
      blurb: coldOrganKidSentence("clock"),
    };
  }
  if (islandId === CREDIT_KINGDOM_ID || structure?.theme === "keep") {
    return {
      id: "credit",
      eyebrow,
      verb: kind === "structure_enter" ? "Spiraling the interest keep…" : "Twisting into the Interest Keep…",
      accent: "#a78bfa",
      accent2: "#c4b5fd",
      motif: "spiral",
      blurb: coldOrganKidSentence("spiral"),
    };
  }
  if (islandId === HARBOR_HAVEN_ID || structure?.theme === "bank") {
    return {
      id: "harbor",
      eyebrow,
      verb: kind === "structure_enter" ? "Vault door swinging open…" : "Carpet soft-landing on Harbor…",
      accent: "#f59e0b",
      accent2: "#94a3b8",
      motif: "vault",
      blurb: coldOrganKidSentence("memory"),
    };
  }
  return {
    id: "default",
    eyebrow,
    verb: "Stepping through the painting…",
    accent: "#34d399",
    accent2: "#6ee7b7",
    motif: "portal",
    blurb: `${islandId} unfolds like a toy diorama.`,
  };
}

/**
 * Full-screen Astro-Bot-style world open.
 * Motifs: coin slot iris, paycheck chute rush, interest spiral, vault door.
 */
export function WorldArriveOverlay({
  islandId,
  islandName,
  kind = "carpet_land",
  headline,
  durationMs = 1600,
  onDone,
}: Props) {
  const theme = useMemo(() => themeForIsland(islandId, kind), [islandId, kind]);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useOverlayEscape(onDone);

  useEffect(() => {
    const organ = moneyOrganForIsland(islandId);
    if (kind === "structure_enter") {
      triggerJuice("accept", { burst: true });
    }
    if (kind === "structure_enter" && organ) {
      playOrganSfx(organ.id);
      playCapitalSfx("scar_chime");
    } else if (organ && kind === "carpet_land") {
      playOrganSfx(organ.id);
    } else {
      playCapitalSfx("plinth_hum");
    }
    const dur = Math.round(durationMs * cinemaTimeScale());
    const tIn = window.setTimeout(() => setPhase("hold"), Math.round(280 * cinemaTimeScale()));
    const tOut = window.setTimeout(() => setPhase("out"), Math.max(400, dur - 280));
    const tDone = window.setTimeout(onDone, dur);
    return () => {
      window.clearTimeout(tIn);
      window.clearTimeout(tOut);
      window.clearTimeout(tDone);
    };
  }, [durationMs, kind, islandId, onDone]);

  const opacity = phase === "out" ? 0 : 1;
  const scale = phase === "in" ? 1.12 : phase === "out" ? 0.92 : 1;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center overflow-hidden"
      data-testid={kind === "structure_enter" ? "money-structure-enter-transition" : "world-arrive-overlay"}
      data-arrive-motif={theme.motif}
      data-arrive-island={islandId}
      data-nav-escape="window"
      style={{
        opacity,
        transition: "opacity 320ms ease",
        background:
          theme.motif === "chute"
            ? `linear-gradient(180deg, #0f172a 0%, ${theme.accent}33 45%, #0f172a 100%)`
            : theme.motif === "spiral"
              ? `radial-gradient(circle at 50% 45%, ${theme.accent}55 0%, #0f172a 62%)`
              : `radial-gradient(circle at 50% 40%, ${theme.accent}44 0%, #0c1622 70%)`,
      }}
    >
      {/* Motif art */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        aria-hidden
      >
        {theme.motif === "slot" ? <SlotMotif accent={theme.accent} accent2={theme.accent2} /> : null}
        {theme.motif === "chute" ? <ChuteMotif accent={theme.accent} /> : null}
        {theme.motif === "spiral" ? <SpiralMotif accent={theme.accent} accent2={theme.accent2} /> : null}
        {theme.motif === "vault" ? <VaultMotif accent={theme.accent} accent2={theme.accent2} /> : null}
        {theme.motif === "portal" ? <PortalMotif accent={theme.accent} /> : null}
      </div>

      <div className="relative z-10 mx-4 max-w-lg text-center text-white">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.28em]"
          style={{ color: theme.accent2 }}
        >
          {theme.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-black drop-shadow-lg sm:text-3xl">
          {headline ?? theme.verb}
        </h2>
        <p className="mt-2 text-lg font-bold text-white/90">{islandName}</p>
        <p className="mt-2 text-sm text-white/70">{theme.blurb}</p>
        <p className="mt-3 text-[11px] tracking-wide text-white/40">Esc · Leave</p>
      </div>
    </div>
  );
}

function SlotMotif({ accent, accent2 }: { accent: string; accent2: string }) {
  return (
    <div className="relative h-56 w-56">
      <div
        className="absolute inset-0 rounded-full border-[10px] opacity-90"
        style={{ borderColor: accent, boxShadow: `0 0 60px ${accent}` }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-24 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `linear-gradient(180deg, ${accent2}, ${accent})`,
          boxShadow: `0 0 40px ${accent}`,
          animation: "cap-arrive-pulse 1.1s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function ChuteMotif({ accent }: { accent: string }) {
  return (
    <div className="relative h-64 w-40 overflow-hidden rounded-[2rem] border-4 border-white/20"
      style={{ background: `linear-gradient(180deg, ${accent}88, transparent)` }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 h-16 w-2 -translate-x-1/2 rounded-full bg-white/70"
          style={{
            top: `${i * 22}%`,
            animation: `cap-chute-rush 0.85s linear ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SpiralMotif({ accent, accent2 }: { accent: string; accent2: string }) {
  return (
    <div className="relative h-56 w-56">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border-4"
          style={{
            borderColor: i % 2 ? accent : accent2,
            transform: `scale(${1 - i * 0.22})`,
            animation: `cap-spiral-spin ${2.4 - i * 0.35}s linear infinite`,
            opacity: 0.85 - i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function VaultMotif({ accent, accent2 }: { accent: string; accent2: string }) {
  return (
    <div className="relative h-52 w-52">
      <div
        className="absolute inset-4 rounded-full border-[12px]"
        style={{ borderColor: accent, boxShadow: `inset 0 0 40px ${accent}88` }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-3 w-20 origin-left -translate-y-1/2 rounded-full"
        style={{
          background: accent2,
          animation: "cap-vault-dial 1.6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: accent }}
      />
    </div>
  );
}

function PortalMotif({ accent }: { accent: string }) {
  return (
    <div
      className="h-48 w-36 rounded-2xl border-4 border-white/30"
      style={{
        background: `linear-gradient(160deg, ${accent}, #0f172a)`,
        boxShadow: `0 0 50px ${accent}`,
        animation: "cap-arrive-pulse 1.2s ease-in-out infinite",
      }}
    />
  );
}
