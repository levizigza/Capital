/**
 * Procedural banknote face for the Money Carpet.
 * Stylized Fortune Archipelago note — not a real-world bill.
 */

import * as THREE from "three";

let cached: THREE.CanvasTexture | null = null;

function drawGuilloche(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  loops: number,
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const a = (i / 180) * Math.PI;
    const wobble = Math.sin(a * loops) * (r * 0.08);
    const x = cx + Math.cos(a) * (r + wobble);
    const y = cy + Math.sin(a) * (r * 0.72 + wobble * 0.6);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

/** Build (and cache) the flying-carpet banknote albedo. */
export function getMoneyCarpetTexture(): THREE.CanvasTexture {
  if (cached) return cached;

  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Field — deep money green with slight vignette
  const field = ctx.createLinearGradient(0, 0, w, h);
  field.addColorStop(0, "#1a5c38");
  field.addColorStop(0.45, "#217a4a");
  field.addColorStop(1, "#14532d");
  ctx.fillStyle = field;
  ctx.fillRect(0, 0, w, h);

  // Woven rug crosshatch — reads as carpet cloth, not plastic card stock
  ctx.strokeStyle = "rgba(245,230,200,0.08)";
  ctx.lineWidth = 1;
  for (let x = 24; x < w; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x + 3, h - 18);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(15,61,40,0.18)";
  for (let y = 30; y < h; y += 10) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(w - 30, y);
    ctx.stroke();
  }

  // Cream / ivory ornamental border (reads as printed currency edge)
  ctx.strokeStyle = "#f5e6c8";
  ctx.lineWidth = 22;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 6;
  ctx.strokeRect(42, 42, w - 84, h - 84);
  ctx.strokeStyle = "#0f3d28";
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 52, w - 104, h - 104);

  // Corner denomination medallions
  const corners: [number, number][] = [
    [110, 110],
    [w - 110, 110],
    [110, h - 110],
    [w - 110, h - 110],
  ];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.fillStyle = "#f5e6c8";
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#14532d";
    ctx.font = "bold 52px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("1", cx, cy + 2);
  }

  // Side serial strips
  ctx.fillStyle = "rgba(245,230,200,0.85)";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("FA · 010101 · COVE", 80, 78);
  ctx.textAlign = "right";
  ctx.fillText("HAVEN · 777 · CREDIT", w - 80, h - 68);

  // Central oval portrait frame (coin face — original, not a real portrait)
  const ox = w * 0.5;
  const oy = h * 0.48;
  drawGuilloche(ctx, ox, oy, 148, 14, "rgba(245,230,200,0.35)");
  drawGuilloche(ctx, ox, oy, 118, 10, "rgba(201,162,39,0.45)");

  ctx.beginPath();
  ctx.ellipse(ox, oy, 108, 128, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0f3d28";
  ctx.fill();
  ctx.strokeStyle = "#f5e6c8";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(ox, oy, 92, 110, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Coin face inside oval
  const coinGrad = ctx.createRadialGradient(ox - 20, oy - 30, 10, ox, oy, 70);
  coinGrad.addColorStop(0, "#fde68a");
  coinGrad.addColorStop(0.55, "#eab308");
  coinGrad.addColorStop(1, "#a16207");
  ctx.beginPath();
  ctx.arc(ox, oy + 4, 62, 0, Math.PI * 2);
  ctx.fillStyle = coinGrad;
  ctx.fill();
  ctx.strokeStyle = "#713f12";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#14532d";
  ctx.font = "bold 72px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", ox, oy + 8);

  // Giant flanking dollar marks — silhouette reads at a glance
  ctx.fillStyle = "rgba(245,230,200,0.92)";
  ctx.font = "bold 160px Georgia, 'Times New Roman', serif";
  ctx.fillText("$", w * 0.22, oy + 18);
  ctx.fillText("$", w * 0.78, oy + 18);

  // Title banners
  ctx.fillStyle = "#f5e6c8";
  ctx.font = "bold 36px Georgia, 'Times New Roman', serif";
  ctx.fillText("FORTUNE ARCHIPELAGO", ox, 86);
  ctx.font = "bold 28px Georgia, 'Times New Roman', serif";
  ctx.fillText("MONEY CARPET · ONE RIDE", ox, h - 86);

  // Small “magic carpet” tassel hints printed along short edges
  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 11; i++) {
    const x = 90 + i * ((w - 180) / 10);
    ctx.fillRect(x - 3, 8, 6, 16);
    ctx.fillRect(x - 3, h - 24, 6, 16);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cached = tex;
  return tex;
}

/** Dispose helper for tests / HMR. */
export function disposeMoneyCarpetTexture(): void {
  cached?.dispose();
  cached = null;
}
