import type { MoneyStructureTheme } from "../moneyStructures";
import { moneyOrganForStructureTheme } from "../moneyOrgans";

export type StructureShell = {
  wall: string;
  wallOp: number;
  bg: string;
  accent: string;
  /** Floor / pad language — organ-true, not shared cyan */
  floor: string;
  exit: string;
  exitEmissive: string;
  fillLight: string;
};

/** Readable shell — walls opaque enough that the vault never reads as void. */
export function structureShell(theme: MoneyStructureTheme): StructureShell {
  const organ = moneyOrganForStructureTheme(theme);
  if (theme === "bank") {
    return {
      wall: "#94a3b8",
      wallOp: 0.55,
      bg: "#1e293b",
      accent: organ.accentHint,
      floor: "#334155",
      exit: "#f59e0b",
      exitEmissive: "#d97706",
      fillLight: "#fde68a",
    };
  }
  if (theme === "tower") {
    return {
      wall: "#38bdf8",
      wallOp: 0.5,
      bg: "#0c4a6e",
      accent: organ.accentHint,
      floor: "#0e7490",
      exit: "#38bdf8",
      exitEmissive: "#0284c7",
      fillLight: "#7dd3fc",
    };
  }
  if (theme === "keep") {
    return {
      wall: "#a8a29e",
      wallOp: 0.55,
      bg: "#1c1917",
      accent: organ.accentHint,
      floor: "#292524",
      exit: "#a78bfa",
      exitEmissive: "#7c3aed",
      fillLight: "#c4b5fd",
    };
  }
  // Jar — glass + coin gold (not tower cyan)
  return {
    wall: "#67e8f9",
    wallOp: 0.5,
    bg: "#164e63",
    accent: organ.accentHint,
    floor: "#78350f",
    exit: "#fbbf24",
    exitEmissive: "#f59e0b",
    fillLight: "#fde68a",
  };
}
