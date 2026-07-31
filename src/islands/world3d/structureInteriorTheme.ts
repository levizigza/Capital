import type { MoneyStructureTheme } from "../moneyStructures";

export type StructureShell = {
  wall: string;
  wallOp: number;
  bg: string;
  accent: string;
};

/** Readable shell — walls opaque enough that the vault never reads as void. */
export function structureShell(theme: MoneyStructureTheme): StructureShell {
  if (theme === "bank") return { wall: "#94a3b8", wallOp: 0.55, bg: "#1e293b", accent: "#fbbf24" };
  if (theme === "tower") return { wall: "#38bdf8", wallOp: 0.5, bg: "#0c4a6e", accent: "#facc15" };
  if (theme === "keep") return { wall: "#a8a29e", wallOp: 0.55, bg: "#1c1917", accent: "#fb7185" };
  return { wall: "#7dd3fc", wallOp: 0.5, bg: "#0c4a6e", accent: "#fde68a" };
}
