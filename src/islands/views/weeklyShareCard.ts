/** Build a simple PNG share card for weekly Harbor challenges (no deps). */

export async function downloadWeeklyShareCard(opts: {
  voyagerName: string;
  title: string;
  progress: string;
  streak: number;
  plinthHint?: string | null;
}): Promise<void> {
  const w = 1080;
  const h = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0c4a6e");
  grad.addColorStop(0.45, "#0369a1");
  grad.addColorStop(1, "#fbbf24");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(15,23,42,0.55)";
  roundRect(ctx, 72, 120, w - 144, h - 280, 48);
  ctx.fill();

  ctx.fillStyle = "#fef3c7";
  ctx.font = "700 42px Georgia, serif";
  ctx.fillText("CAPITAL · Harbor Haven", 110, 220);

  ctx.fillStyle = "#fff";
  ctx.font = "800 64px system-ui, sans-serif";
  wrapText(ctx, opts.title, 110, 340, w - 220, 72);

  ctx.font = "600 40px system-ui, sans-serif";
  ctx.fillStyle = "#e0f2fe";
  ctx.fillText(opts.voyagerName, 110, 520);
  ctx.fillText(opts.progress, 110, 580);
  ctx.fillText(`Streak ${opts.streak} day${opts.streak === 1 ? "" : "s"}`, 110, 640);

  if (opts.plinthHint) {
    ctx.fillStyle = "#fde68a";
    ctx.font = "500 32px system-ui, sans-serif";
    wrapText(ctx, opts.plinthHint, 110, 720, w - 220, 40);
  }

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText("Money is alive — choices stick.", 110, 980);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("PNG export failed");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `capital-harbor-week-${Date.now()}.png`;
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
