import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { COINCRAFT_AREA_IDS, type CoincraftAreaId } from "../coincraftArt";

const OUTLINE = "rgba(45,74,111,0.4)";
const NAVY = "#2d4a6f";

type SceneProps = { className?: string };

function SceneSvg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 360 160"
      className={className}
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec8e3" />
          <stop offset="100%" stopColor="#5bb5a3" />
        </linearGradient>
        <linearGradient id="cc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec8e3" />
          <stop offset="100%" stopColor="#c5e8f7" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

function HarborScene({ className }: SceneProps) {
  return (
    <SceneSvg className={className}>
      <rect width={360} height={160} fill="url(#cc-sky)" />
      <ellipse cx={80} cy={40} rx={36} ry={14} fill="#fff" opacity={0.7} />
      <ellipse cx={280} cy={32} rx={48} ry={16} fill="#fff" opacity={0.6} />
      <rect x={0} y={100} width={360} height={60} fill="#f5e6c8" stroke={OUTLINE} strokeWidth={2} />
      <rect x={0} y={118} width={360} height={42} fill="url(#cc-water)" stroke={OUTLINE} strokeWidth={2} />
      <rect x={40} y={92} width={120} height={12} rx={2} fill="#c4956a" stroke={OUTLINE} strokeWidth={2} />
      <rect x={40} y={88} width={120} height={6} fill="#deb887" />
      <rect x={48} y={76} width={24} height={16} rx={2} fill="#8b6914" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={80} y={80} width={20} height={12} rx={2} fill="#8b6914" stroke={OUTLINE} strokeWidth={1.5} />
      <path
        d="M200 118 L240 95 L280 118 Z"
        fill="#3d9a8a"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <rect x={228} y={88} width={6} height={30} fill="#8b6914" stroke={OUTLINE} strokeWidth={1} />
      <path d="M260 70 Q265 65 270 70" stroke={NAVY} strokeWidth={1.5} fill="none" />
      <path d="M290 75 Q295 70 300 75" stroke={NAVY} strokeWidth={1.5} fill="none" />
      <circle cx={320} cy={130} r={8} fill="#f4b942" stroke={OUTLINE} strokeWidth={1.5} opacity={0.8} />
    </SceneSvg>
  );
}

function MarketScene({ className }: SceneProps) {
  return (
    <SceneSvg className={className}>
      <rect width={360} height={160} fill="url(#cc-sky)" />
      <rect x={0} y={110} width={360} height={50} fill="#7cb87a" stroke={OUTLINE} strokeWidth={2} />
      <rect x={20} y={95} width={320} height={8} fill="#f5e6c8" stroke={OUTLINE} strokeWidth={1.5} />
      <path
        d="M30 95 L50 60 L70 95 Z"
        fill="#e8927c"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <path
        d="M70 95 L90 60 L110 95 Z"
        fill="#f4b942"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <path
        d="M110 95 L130 60 L150 95 Z"
        fill="#e8927c"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <path
        d="M150 95 L170 60 L190 95 Z"
        fill="#f4b942"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <path
        d="M190 95 L210 60 L230 95 Z"
        fill="#e8927c"
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <rect x={44} y={95} width={36} height={28} rx={2} fill="#c4956a" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={124} y={95} width={36} height={28} rx={2} fill="#c4956a" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={204} y={95} width={36} height={28} rx={2} fill="#c4956a" stroke={OUTLINE} strokeWidth={1.5} />
      <ellipse cx={62} cy={108} rx={8} ry={5} fill="#f5e6c8" stroke={OUTLINE} strokeWidth={1} />
      <ellipse cx={142} cy={108} rx={8} ry={5} fill="#e8927c" stroke={OUTLINE} strokeWidth={1} />
      <circle cx={222} cy={108} r={6} fill="#f4b942" stroke={OUTLINE} strokeWidth={1} />
    </SceneSvg>
  );
}

function LighthouseScene({ className }: SceneProps) {
  return (
    <SceneSvg className={className}>
      <rect width={360} height={160} fill="url(#cc-sky)" />
      <rect x={0} y={115} width={360} height={45} fill="#94a3b8" stroke={OUTLINE} strokeWidth={2} />
      <rect x={0} y={125} width={360} height={35} fill="#7cb87a" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={155} y={35} width={50} height={85} rx={4} fill="#fff" stroke={OUTLINE} strokeWidth={2} />
      <rect x={155} y={35} width={50} height={14} fill="#ef4444" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={155} y={63} width={50} height={14} fill="#ef4444" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={155} y={91} width={50} height={14} fill="#ef4444" stroke={OUTLINE} strokeWidth={1.5} />
      <polygon points="155,35 180,12 205,35" fill="#ef4444" stroke={OUTLINE} strokeWidth={2} />
      <circle cx={180} cy={28} r={10} fill="#fffbeb" stroke={OUTLINE} strokeWidth={1.5} />
      <path d="M180 18 L220 8 L220 48 L180 38 Z" fill="#fef08a" opacity={0.55} />
      <rect x={60} y={100} width={40} height={32} rx={6} fill="#f5e6c8" stroke={OUTLINE} strokeWidth={2} />
      <rect x={68} y={108} width={24} height={18} rx={4} fill="#fef08a" stroke={OUTLINE} strokeWidth={1.5} opacity={0.9} />
      <circle cx={80} cy={117} r={4} fill="#f4b942" />
    </SceneSvg>
  );
}

const SCENES: Record<CoincraftAreaId, ComponentType<SceneProps>> = {
  cc_harbor: HarborScene,
  cc_craft_market: MarketScene,
  cc_savings_lighthouse: LighthouseScene,
};

export type AreaSceneProps = {
  areaId: string;
  areaName?: string;
  className?: string;
  animate?: boolean;
};

export function AreaScene({ areaId, areaName, className, animate = true }: AreaSceneProps) {
  const Scene = COINCRAFT_AREA_IDS.has(areaId) ? SCENES[areaId as CoincraftAreaId] : null;

  if (!Scene) {
    return (
      <div
        className={cn(
          "cc-area-scene h-32 bg-gradient-to-b from-sky-200 to-emerald-100",
          className
        )}
        role="img"
        aria-label={areaName ? `${areaName} scene` : "Area scene"}
      />
    );
  }

  return (
    <div
      className={cn("cc-area-scene", animate && "cc-scene-bob", className)}
      role="img"
      aria-label={areaName ? `${areaName} — Coincraft Cove` : "Coincraft Cove area"}
    >
      <Scene />
    </div>
  );
}

export function CoincraftEnvironmentGallery({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {(Object.keys(SCENES) as CoincraftAreaId[]).map((id) => (
        <AreaScene key={id} areaId={id} animate={false} />
      ))}
    </div>
  );
}
