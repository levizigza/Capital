/** Share cards — weekly ritual + iconic “Harbor felt that” social object. */

export async function downloadWeeklyShareCard(opts: {
  voyagerName: string;
  title: string;
  progress: string;
  streak: number;
  plinthHint?: string | null;
}): Promise<void> {
  await paintAndDownload({
    mode: "weekly",
    voyagerName: opts.voyagerName,
    title: opts.title,
    lines: [opts.progress, `Streak ${opts.streak} day${opts.streak === 1 ? "" : "s"}`],
    accent: opts.plinthHint ?? null,
    filename: `capital-harbor-week-${Date.now()}.png`,
  });
}

/** Post-spectacle share — the iconic social object. */
export async function downloadHarborFeltCard(opts: {
  voyagerName: string;
  scarLabel: string;
  chapter?: string | null;
}): Promise<void> {
  await paintAndDownload({
    mode: "felt",
    voyagerName: opts.voyagerName,
    title: "Harbor felt that",
    lines: [opts.chapter || "Coincraft Cove", `“${opts.scarLabel}”`],
    accent: "Memory Plinth · money is alive",
    filename: `capital-harbor-felt-${Date.now()}.png`,
    scarLabel: opts.scarLabel,
  });
}

async function paintAndDownload(opts: {
  mode: "weekly" | "felt";
  voyagerName: string;
  title: string;
  lines: string[];
  accent?: string | null;
  filename: string;
  scarLabel?: string;
}): Promise<void> {
  const w = 1080;
  const h = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Atmosphere — dusk Harbor wash (not flat purple AI default)
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0b1c2e");
  sky.addColorStop(0.4, "#134e6e");
  sky.addColorStop(0.72, "#1d6a8a");
  sky.addColorStop(1, "#f0b429");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Soft sun disk
  ctx.fillStyle = "rgba(253, 224, 71, 0.35)";
  ctx.beginPath();
  ctx.arc(820, 220, 140, 0, Math.PI * 2);
  ctx.fill();

  // Horizon water band
  ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
  ctx.fillRect(0, 720, w, 360);

  // Card panel
  ctx.fillStyle = "rgba(8, 15, 28, 0.72)";
  roundRect(ctx, 64, 160, w - 128, 640, 36);
  ctx.fill();
  ctx.strokeStyle = "rgba(253, 230, 138, 0.55)";
  ctx.lineWidth = 3;
  roundRect(ctx, 64, 160, w - 128, 640, 36);
  ctx.stroke();

  ctx.fillStyle = "#fde68a";
  ctx.font = "700 36px Georgia, 'Times New Roman', serif";
  ctx.fillText("CAPITAL", 110, 240);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("Harbor Haven", 110, 285);

  if (opts.mode === "felt") {
    // Plaque seal
    ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
    ctx.beginPath();
    ctx.arc(900, 280, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(900, 280, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fef3c7";
    ctx.font = "800 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PLINTH", 900, 288);
    ctx.textAlign = "left";
  }

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
    wrapText(ctx, line, 110, y, w - 240, 48);
    y += 58;
  }

  if (opts.accent) {
    ctx.fillStyle = "#fde68a";
    ctx.font = "500 30px system-ui, sans-serif";
    wrapText(ctx, opts.accent, 110, 720, w - 240, 38);
  }

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 32px Georgia, serif";
  ctx.fillText("Money is alive — choices stick.", 110, 980);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("PNG export failed");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename;
  a.click();
  URL.revokeObjectURL(url);
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
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
}
