import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { centerOffset, computeIntegerScale, scaledSize } from "./scaling";
import type { LoadedPixelAtlas } from "./types";

export type PixelCanvasProps = {
  atlas: LoadedPixelAtlas;
  frameKey: string;
  /** Display scale multiplier (still integer). Defaults to auto-fit. */
  integerScale?: number;
  className?: string;
  showGrid?: boolean;
  background?: string;
};

export function PixelCanvas({
  atlas,
  frameKey,
  integerScale,
  className,
  showGrid = false,
  background = "transparent",
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const frame = atlas.frames[frameKey];
  const fw = frame?.w ?? atlas.meta.frameWidth;
  const fh = frame?.h ?? atlas.meta.frameHeight;

  useEffect(() => {
    const img = new Image();
    img.src = atlas.imageUrl;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
    return () => {
      imageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlas.imageUrl]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey, integerScale, showGrid, fw, fh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || integerScale != null) return;

    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integerScale]);

  function draw() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current;
    if (!canvas || !container || !img || !frame) return;

    const scale =
      integerScale ??
      computeIntegerScale(container.clientWidth, container.clientHeight, {
        nativeWidth: fw,
        nativeHeight: fh,
        maxScale: 12,
      });

    const { width, height } = scaledSize(fw, fh, scale);
    const offset = centerOffset(container.clientWidth, container.clientHeight, width, height);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.marginLeft = `${offset.x}px`;
    canvas.style.marginTop = `${offset.y}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, frame.x, frame.y, fw, fh, 0, 0, width, height);

    if (showGrid) {
      ctx.strokeStyle = "rgba(45, 74, 111, 0.25)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= fw; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale + 0.5, 0);
        ctx.lineTo(x * scale + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= fh; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale + 0.5);
        ctx.lineTo(width, y * scale + 0.5);
        ctx.stroke();
      }
    }
  }

  if (!frame) {
    return (
      <div className={cn("text-sm text-red-600", className)} role="alert">
        Unknown frame: {frameKey}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ imageRendering: "pixelated" }}
    >
      <canvas
        ref={canvasRef}
        className="pixel-canvas block"
        style={{ imageRendering: "pixelated" }}
        aria-hidden
      />
    </div>
  );
}
