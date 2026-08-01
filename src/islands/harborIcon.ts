/**
 * One Harbor icon — Memory Plinth as kid-drawable ledger monument.
 * Not the fountain, Bank door, Piggy, or Coin Bag: the scar shelf that remembers.
 */

export const MEMORY_PLINTH_ID = "memory";
export const MEMORY_PLINTH_LABEL = "Memory Plinth";
/** Ledger glyph — money that remembers (not a rock). */
export const MEMORY_PLINTH_ICON = "📒";
export const MEMORY_PLINTH_POSITION: [number, number, number] = [4.0, 0, 1.6];

export type MemoryPlinthHotspot = {
  id: typeof MEMORY_PLINTH_ID;
  label: string;
  icon: typeof MEMORY_PLINTH_ICON;
  position: [number, number, number];
  kind: "plinth";
};

/** Always present on Harbor — empty shelf until a Take leaves a scar. */
export function harborMemoryPlinthHotspot(opts?: {
  scarCount?: number;
}): MemoryPlinthHotspot {
  const n = opts?.scarCount ?? 0;
  return {
    id: MEMORY_PLINTH_ID,
    label: n > 0 ? `${MEMORY_PLINTH_LABEL} · ${n}` : MEMORY_PLINTH_LABEL,
    icon: MEMORY_PLINTH_ICON,
    position: MEMORY_PLINTH_POSITION,
    kind: "plinth",
  };
}

/**
 * Draw the Harbor Memory Plinth silhouette into a 2D canvas context.
 * Shape: terrace + open ledger pages + scar lamp — readable at thumbnail size.
 */
export function drawMemoryPlinthSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  lit = true,
): void {
  const s = scale;
  // Terrace
  ctx.fillStyle = lit ? "#a8a29e" : "#78716c";
  ctx.beginPath();
  ctx.moveTo(cx - 55 * s, cy + 70 * s);
  ctx.lineTo(cx + 55 * s, cy + 70 * s);
  ctx.lineTo(cx + 42 * s, cy + 52 * s);
  ctx.lineTo(cx - 42 * s, cy + 52 * s);
  ctx.closePath();
  ctx.fill();

  // Open ledger — left page
  ctx.fillStyle = lit ? "#fffbeb" : "#e7e5e4";
  ctx.beginPath();
  ctx.moveTo(cx - 4 * s, cy + 48 * s);
  ctx.lineTo(cx - 48 * s, cy + 40 * s);
  ctx.lineTo(cx - 44 * s, cy - 30 * s);
  ctx.lineTo(cx - 4 * s, cy - 22 * s);
  ctx.closePath();
  ctx.fill();

  // Open ledger — right page
  ctx.beginPath();
  ctx.moveTo(cx + 4 * s, cy + 48 * s);
  ctx.lineTo(cx + 48 * s, cy + 40 * s);
  ctx.lineTo(cx + 44 * s, cy - 30 * s);
  ctx.lineTo(cx + 4 * s, cy - 22 * s);
  ctx.closePath();
  ctx.fill();

  // Spine
  ctx.strokeStyle = lit ? "#92400e" : "#57534e";
  ctx.lineWidth = Math.max(2, 4 * s);
  ctx.beginPath();
  ctx.moveTo(cx, cy + 50 * s);
  ctx.lineTo(cx, cy - 24 * s);
  ctx.stroke();

  // Ledger lines
  ctx.strokeStyle = lit ? "rgba(120, 53, 15, 0.35)" : "rgba(68, 64, 60, 0.3)";
  ctx.lineWidth = Math.max(1, 1.5 * s);
  for (let i = 0; i < 4; i++) {
    const y = cy - 10 * s + i * 12 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 36 * s, y);
    ctx.lineTo(cx - 10 * s, y + 2 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10 * s, y + 2 * s);
    ctx.lineTo(cx + 36 * s, y);
    ctx.stroke();
  }

  // Scar lamp
  const lampR = (lit ? 18 : 14) * s;
  const lampY = cy - 48 * s;
  ctx.fillStyle = lit ? "rgba(251, 191, 36, 0.35)" : "rgba(245, 158, 11, 0.15)";
  ctx.beginPath();
  ctx.arc(cx, lampY, lampR * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lit ? "#fde68a" : "#d6d3d1";
  ctx.beginPath();
  ctx.arc(cx, lampY, lampR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lit ? "#f59e0b" : "#a8a29e";
  ctx.lineWidth = Math.max(2, 3 * s);
  ctx.stroke();
}

/** Pure description for tests — kid-drawable parts of the Harbor icon. */
export const MEMORY_PLINTH_SILHOUETTE_PARTS = [
  "terrace",
  "open ledger",
  "scar lamp",
] as const;
