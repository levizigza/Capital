/**
 * Always-on 2D room silhouette under the WebGL canvas.
 * If GL stalls, the Structure still reads as a place (never a void).
 */

import type { MoneyStructureTheme } from "../moneyStructures";

const THEME: Record<
  MoneyStructureTheme,
  { bg: string; floor: string; wall: string; glow: string; label: string }
> = {
  bank: {
    bg: "#1e293b",
    floor: "#0f172a",
    wall: "#64748b",
    glow: "#fbbf24",
    label: "Ledger vault",
  },
  jar: {
    bg: "#0c4a6e",
    floor: "#082f49",
    wall: "#38bdf8",
    glow: "#fde68a",
    label: "Coin jar",
  },
  tower: {
    bg: "#0c4a6e",
    floor: "#075985",
    wall: "#7dd3fc",
    glow: "#facc15",
    label: "Payroll tower",
  },
  keep: {
    bg: "#1c1917",
    floor: "#0c0a09",
    wall: "#a8a29e",
    glow: "#fb7185",
    label: "Interest keep",
  },
};

export function StructureRoomBackdrop({
  theme,
  name,
}: {
  theme: MoneyStructureTheme;
  name: string;
}) {
  const t = THEME[theme];
  return (
    <div
      className="pointer-events-none absolute inset-0"
      data-testid="structure-room-backdrop"
      aria-hidden
      style={{
        background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${t.wall}55 0%, ${t.bg} 62%, ${t.floor} 100%)`,
      }}
    >
      {/* Floor ellipse */}
      <div
        className="absolute left-1/2 top-[58%] h-[38%] w-[72%] -translate-x-1/2 rounded-[100%] opacity-90"
        style={{
          background: `radial-gradient(ellipse at center, ${t.glow}44 0%, ${t.floor} 45%, transparent 72%)`,
        }}
      />
      {/* Three glowing part pads (silhouette) */}
      {[18, 50, 82].map((left, i) => (
        <div
          key={i}
          className="absolute top-[46%] h-10 w-10 -translate-x-1/2 rounded-full"
          style={{
            left: `${left}%`,
            background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
            opacity: 0.55 + i * 0.1,
          }}
        />
      ))}
      <p
        className="absolute bottom-[22%] left-1/2 -translate-x-1/2 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/50"
      >
        {t.label} · {name}
      </p>
    </div>
  );
}
