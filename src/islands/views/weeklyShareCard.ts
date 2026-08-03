/** Share cards — weekly ritual + iconic “Harbor felt that” social object. */

import { drawMemoryPlinthSilhouette } from "../harborIcon";
import type { MoneyOrganId } from "../moneyOrgans";
import {
  coldOrganKidSentence,
  coldRetellLine,
  organVerbChip,
  scarOrganId,
} from "../worldMemory";

export type HarborFeltCardOpts = {
  voyagerName: string;
  scarLabel: string;
  chapter?: string | null;
  scarId?: string;
  islandId?: string;
  /** Prefer explicit organ when chapter string is ambiguous. */
  organId?: MoneyOrganId | null;
};

export async function downloadWeeklyShareCard(opts: {
  voyagerName: string;
  title: string;
  progress: string;
  streak: number;
  plinthHint?: string | null;
}): Promise<void> {
  const blob = await paintCard({
    mode: "weekly",
    voyagerName: opts.voyagerName,
    title: opts.title,
    lines: [opts.progress, `Streak ${opts.streak} day${opts.streak === 1 ? "" : "s"}`],
    accent: opts.plinthHint ?? null,
    organ: "memory",
  });
  triggerDownload(blob, `capital-harbor-week-${Date.now()}.png`);
}

/** Resolve organ for felt cards — scar ids beat chapter fuzzy match. */
export function resolveFeltOrgan(opts: HarborFeltCardOpts): MoneyOrganId {
  if (
    opts.organId === "coin" ||
    opts.organId === "clock" ||
    opts.organId === "spiral" ||
    opts.organId === "memory"
  ) {
    return opts.organId;
  }
  if (opts.scarId || opts.islandId) {
    return scarOrganId({
      id: opts.scarId ?? "",
      islandId: opts.islandId ?? islandIdFromChapter(opts.chapter),
    });
  }
  return organFromChapter(opts.chapter);
}

/** Pure text stack for thumbnail hierarchy (unit-tested). */
export function feltCardCopy(opts: HarborFeltCardOpts): {
  organ: MoneyOrganId;
  seal: string;
  brand: string;
  place: string;
  title: string;
  kid: string;
  retell: string;
  chapter: string;
  tagline: string;
} {
  const organ = resolveFeltOrgan(opts);
  const retell = coldRetellLine({
    id: opts.scarId ?? "",
    islandId: opts.islandId ?? islandIdFromChapter(opts.chapter),
    label: opts.scarLabel,
  });
  return {
    organ,
    seal:
      organ === "coin"
        ? "COIN"
        : organ === "clock"
          ? "CLOCK"
          : organ === "spiral"
            ? "SPIRAL"
            : "PLINTH",
    brand: "CAPITAL",
    place: "Harbor Haven · Memory Plinth",
    title: "Harbor felt that",
    kid: coldOrganKidSentence(organ),
    retell,
    chapter: opts.chapter || "Harbor Haven",
    tagline: organTagline(organ),
  };
}

/** Build Harbor-felt PNG as blob (for preview + download + Web Share). */
export async function buildHarborFeltCardBlob(opts: HarborFeltCardOpts): Promise<Blob> {
  const copy = feltCardCopy(opts);
  return paintCard({
    mode: "felt",
    voyagerName: opts.voyagerName,
    title: copy.title,
    lines: [copy.kid, copy.retell],
    accent: copy.tagline,
    organ: copy.organ,
    scarLabel: opts.scarLabel,
    chapter: copy.chapter,
    kidSentence: copy.kid,
    sealWord: copy.seal,
  });
}

export async function harborFeltCardDataUrl(opts: HarborFeltCardOpts): Promise<string> {
  const blob = await buildHarborFeltCardBlob(opts);
  return blobToDataUrl(blob);
}

/** Post-spectacle share — the iconic social object. */
export async function downloadHarborFeltCard(opts: HarborFeltCardOpts): Promise<void> {
  const blob = await buildHarborFeltCardBlob(opts);
  triggerDownload(blob, `capital-harbor-felt-${Date.now()}.png`);
}

/** Prefer native share sheet when available; fall back to download. */
export async function shareHarborFeltCard(opts: HarborFeltCardOpts): Promise<"shared" | "downloaded"> {
  const blob = await buildHarborFeltCardBlob(opts);
  const file = new File([blob], `capital-harbor-felt-${Date.now()}.png`, { type: "image/png" });
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const copy = feltCardCopy(opts);
  if (nav && typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
    try {
      await nav.share({
        files: [file],
        title: "Harbor felt that",
        text: `Capital · ${copy.kid} · ${organVerbChip(copy.organ)}`,
      });
      return "shared";
    } catch (err) {
      // User cancel — don't force download
      if (err instanceof DOMException && err.name === "AbortError") throw err;
    }
  }
  triggerDownload(blob, file.name);
  return "downloaded";
}

type OrganTone = MoneyOrganId;

function organFromChapter(chapter?: string | null): OrganTone {
  const c = (chapter || "").toLowerCase();
  if (c.includes("paycheck")) return "clock";
  if (c.includes("credit")) return "spiral";
  if (c.includes("cove")) return "coin";
  return "memory";
}

function islandIdFromChapter(chapter?: string | null): string {
  const c = (chapter || "").toLowerCase();
  if (c.includes("paycheck")) return "paycheck_peninsula";
  if (c.includes("credit")) return "credit_kingdom";
  if (c.includes("cove")) return "coincraft_cove";
  return "";
}

function organTagline(organ: OrganTone): string {
  if (organ === "coin") return "Coin holds · Take · Hush";
  if (organ === "clock") return "Clock shelters · Earn · Stamp";
  if (organ === "spiral") return "Spiral withstands · Borrow · Weigh";
  return "Memory keeps · money is alive";
}

function organAccent(organ: OrganTone): { seal: string; glow: string; wash: string } {
  if (organ === "clock") return { seal: "#38bdf8", glow: "#7dd3fc", wash: "#0c4a6e" };
  if (organ === "spiral") return { seal: "#a78bfa", glow: "#c4b5fd", wash: "#1c1917" };
  if (organ === "coin") return { seal: "#fbbf24", glow: "#fde68a", wash: "#78350f" };
  return { seal: "#f59e0b", glow: "#fde68a", wash: "#134e6e" };
}

async function paintCard(opts: {
  mode: "weekly" | "felt";
  voyagerName: string;
  title: string;
  lines: string[];
  accent?: string | null;
  organ: OrganTone;
  scarLabel?: string;
  chapter?: string;
  kidSentence?: string;
  sealWord?: string;
}): Promise<Blob> {
  const w = 1080;
  const h = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const tone = organAccent(opts.organ);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0b1c2e");
  sky.addColorStop(0.4, tone.wash);
  sky.addColorStop(0.72, "#1d6a8a");
  sky.addColorStop(1, tone.seal);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  if (opts.mode === "felt") {
    // Plinth owns the upper square; high-contrast lower third for thumbnail retell.
    ctx.fillStyle = "rgba(8, 12, 22, 0.78)";
    ctx.fillRect(0, 640, w, 440);

    drawMemoryPlinthSilhouette(ctx, w / 2, 340, 2.05, true);

    // Large organ seal — readable when the PNG is a phone thumbnail.
    const sealX = w / 2 + 250;
    const sealY = 200;
    ctx.fillStyle = `${tone.seal}55`;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tone.seal;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fffdf6";
    ctx.font = "900 30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(opts.sealWord ?? "PLINTH", sealX, sealY + 10);
    ctx.textAlign = "left";

    // Brand first in the lower third
    ctx.fillStyle = tone.glow;
    ctx.font = "800 42px Georgia, 'Times New Roman', serif";
    ctx.fillText("CAPITAL", 64, 710);
    ctx.fillStyle = "rgba(255,253,246,0.78)";
    ctx.font = "700 28px system-ui, sans-serif";
    ctx.fillText("Harbor Haven · Memory Plinth", 64, 752);

    ctx.fillStyle = "#fffdf6";
    ctx.font = "900 58px system-ui, sans-serif";
    wrapText(ctx, opts.title, 64, 820, w - 128, 64);

    // Kid sentence — primary cold retell at thumbnail size
    ctx.fillStyle = tone.glow;
    ctx.font = "800 36px Georgia, serif";
    const kid = opts.kidSentence ?? opts.lines[0] ?? "";
    let y = 890;
    y = wrapText(ctx, kid, 64, y, w - 128, 44) + 12;

    // Plaque retell — secondary
    ctx.fillStyle = "rgba(255,253,246,0.9)";
    ctx.font = "600 30px Georgia, serif";
    const retell = opts.lines[1] ?? opts.lines[0] ?? "";
    y = wrapText(ctx, retell, 64, y, w - 128, 38) + 10;

    ctx.fillStyle = `${tone.seal}`;
    ctx.font = "700 26px system-ui, sans-serif";
    wrapText(ctx, opts.accent ?? organTagline(opts.organ), 64, Math.min(y, 1035), w - 128, 32);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "600 24px Georgia, serif";
    ctx.fillText("Money is alive — choices stick.", 64, 1060);
  } else {
    ctx.fillStyle = "rgba(253, 224, 71, 0.35)";
    ctx.beginPath();
    ctx.arc(820, 220, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
    ctx.fillRect(0, 720, w, 360);

    ctx.fillStyle = "rgba(8, 15, 28, 0.72)";
    roundRect(ctx, 64, 160, w - 128, 640, 36);
    ctx.fill();
    ctx.strokeStyle = tone.glow;
    ctx.lineWidth = 3;
    roundRect(ctx, 64, 160, w - 128, 640, 36);
    ctx.stroke();

    ctx.fillStyle = tone.glow;
    ctx.font = "700 36px Georgia, 'Times New Roman', serif";
    ctx.fillText("CAPITAL", 110, 240);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "600 28px system-ui, sans-serif";
    ctx.fillText("Harbor Haven", 110, 285);

    ctx.fillStyle = "#fff";
    ctx.font = "800 72px system-ui, sans-serif";
    wrapText(ctx, opts.title, 110, 380, w - 240, 78);

    ctx.fillStyle = "#bae6fd";
    ctx.font = "600 36px system-ui, sans-serif";
    ctx.fillText(opts.voyagerName, 110, 500);

    ctx.fillStyle = "#e0f2fe";
    ctx.font = "600 40px Georgia, serif";
    let y = 570;
    for (const line of opts.lines) {
      y = wrapText(ctx, line, 110, y, w - 240, 48) + 10;
    }

    if (opts.accent) {
      ctx.fillStyle = tone.glow;
      ctx.font = "500 30px system-ui, sans-serif";
      wrapText(ctx, opts.accent, 110, 720, w - 240, 38);
    }

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 32px Georgia, serif";
    ctx.fillText("Money is alive — choices stick.", 110, 980);
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("PNG export failed");
  return blob;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draw wrapped text; returns the y of the last baseline used. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}
