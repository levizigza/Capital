import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { COINCRAFT_NPC_IDS, type CoincraftNpcId } from "../coincraftArt";

const OUTLINE = "rgba(45,74,111,0.55)";
const SKIN = "#f8d4c4";
const NAVY = "#2d4a6f";

type PortraitProps = { className?: string };

function PortraitFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function BaseFace({ cx = 24 }: { cx?: number }) {
  return (
    <>
      <circle cx={cx} cy={17} r={14} fill={SKIN} stroke={OUTLINE} strokeWidth={2} />
      <ellipse cx={cx - 5} cy={18} rx={4} ry={5} fill="#fff" />
      <ellipse cx={cx + 5} cy={18} rx={4} ry={5} fill="#fff" />
      <circle cx={cx - 5} cy={19} r={2} fill={NAVY} />
      <circle cx={cx + 5} cy={19} r={2} fill={NAVY} />
      <path d={`M ${cx - 3} 24 Q ${cx} 26 ${cx + 3} 24`} fill="none" stroke={NAVY} strokeWidth={1.5} strokeLinecap="round" />
    </>
  );
}

function CaptainPennyPortrait({ className }: PortraitProps) {
  return (
    <PortraitFrame className={className}>
      <rect x={8} y={28} width={32} height={18} rx={10} fill="#3d9a8a" stroke={OUTLINE} strokeWidth={2} />
      <BaseFace />
      <ellipse cx={24} cy={10} rx={16} ry={5} fill="#2d4a6f" stroke={OUTLINE} strokeWidth={2} />
      <rect x={10} y={10} width={28} height={6} rx={2} fill="#2d4a6f" stroke={OUTLINE} strokeWidth={2} />
      <circle cx={24} cy={34} r={4} fill="#f4b942" stroke={OUTLINE} strokeWidth={1.5} />
      <path d="M22 34 L24 32 L26 34" stroke={NAVY} strokeWidth={1} fill="none" />
    </PortraitFrame>
  );
}

function ArtisanAlmaPortrait({ className }: PortraitProps) {
  return (
    <PortraitFrame className={className}>
      <rect x={8} y={28} width={32} height={18} rx={10} fill="#e8927c" stroke={OUTLINE} strokeWidth={2} />
      <rect x={10} y={32} width={28} height={12} rx={4} fill="#f5e6c8" stroke={OUTLINE} strokeWidth={1.5} />
      <BaseFace />
      <ellipse cx={24} cy={9} rx={10} ry={4} fill="#5bb5a3" stroke={OUTLINE} strokeWidth={2} />
      <rect x={32} y={22} width={3} height={14} rx={1} fill="#8b6914" stroke={OUTLINE} strokeWidth={1} />
      <path d="M35 22 L38 18 L36 16" fill="#f4b942" stroke={OUTLINE} strokeWidth={1} />
    </PortraitFrame>
  );
}

function KeeperKiraPortrait({ className }: PortraitProps) {
  return (
    <PortraitFrame className={className}>
      <rect x={8} y={28} width={32} height={18} rx={10} fill="#6366f1" stroke={OUTLINE} strokeWidth={2} />
      <BaseFace />
      <rect x={14} y={4} width={20} height={14} rx={4} fill="#ef4444" stroke={OUTLINE} strokeWidth={2} />
      <rect x={14} y={10} width={20} height={4} fill="#fff" />
      <rect x={36} y={20} width={6} height={10} rx={2} fill="#f4b942" stroke={OUTLINE} strokeWidth={1.5} />
      <circle cx={39} cy={22} r={2} fill="#fffbeb" />
    </PortraitFrame>
  );
}

function ShellyPortrait({ className }: PortraitProps) {
  return (
    <PortraitFrame className={className}>
      <rect x={8} y={28} width={32} height={18} rx={10} fill="#7ec8e3" stroke={OUTLINE} strokeWidth={2} />
      <BaseFace />
      <path
        d="M30 8 Q36 12 34 18 Q32 14 28 12 Z"
        fill="#f5e6c8"
        stroke={OUTLINE}
        strokeWidth={1.5}
      />
      <ellipse cx={34} cy={14} rx={4} ry={3} fill="#e8927c" stroke={OUTLINE} strokeWidth={1.5} />
      <ellipse cx={10} cy={38} rx={6} ry={4} fill="#f5e6c8" stroke={OUTLINE} strokeWidth={1.5} />
    </PortraitFrame>
  );
}

const PORTRAITS: Record<CoincraftNpcId, ComponentType<PortraitProps>> = {
  npc_captain_penny: CaptainPennyPortrait,
  npc_artisan_alma: ArtisanAlmaPortrait,
  npc_keeper_kira: KeeperKiraPortrait,
  npc_shelly: ShellyPortrait,
};

export type NpcPortraitProps = {
  npcId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackIcon?: string;
};

const SIZE_CLASS = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
} as const;

export function NpcPortrait({ npcId, size = "md", className, fallbackIcon }: NpcPortraitProps) {
  const Portrait = COINCRAFT_NPC_IDS.has(npcId)
    ? PORTRAITS[npcId as CoincraftNpcId]
    : null;

  if (!Portrait) {
    return (
      <span className={cn("text-xl leading-none", className)} aria-hidden>
        {fallbackIcon ?? "👤"}
      </span>
    );
  }

  return (
    <span className={cn("cc-npc-portrait inline-flex", SIZE_CLASS[size], className)}>
      <Portrait className="w-full h-full" />
    </span>
  );
}

export function CoincraftNpcGallery({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {(Object.keys(PORTRAITS) as CoincraftNpcId[]).map((id) => (
        <NpcPortrait key={id} npcId={id} size="lg" />
      ))}
    </div>
  );
}
