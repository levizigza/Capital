/**
 * FinanceQuest pixel viewport — logical resolution matches cozy 16:9 playfield.
 * All on-screen pixel art uses integer scaling only (no fractional upscale).
 */
export const PIXEL_VIEWPORT = {
  /** Logical game width in pixels (before integer scale). */
  width: 320,
  /** Logical game height in pixels (before integer scale). */
  height: 180,
  /** Default NPC / character frame size in source art. */
  frameSize: 32,
  minScale: 1,
  maxScale: 8,
} as const;

export type IntegerScaleOptions = {
  nativeWidth?: number;
  nativeHeight?: number;
  minScale?: number;
  maxScale?: number;
};

/**
 * Largest integer scale that fits container without cropping native resolution.
 * Never returns fractional values — preserves crisp pixel edges.
 */
export function computeIntegerScale(
  containerWidth: number,
  containerHeight: number,
  options: IntegerScaleOptions = {}
): number {
  const nativeWidth = options.nativeWidth ?? PIXEL_VIEWPORT.width;
  const nativeHeight = options.nativeHeight ?? PIXEL_VIEWPORT.height;
  const minScale = options.minScale ?? PIXEL_VIEWPORT.minScale;
  const maxScale = options.maxScale ?? PIXEL_VIEWPORT.maxScale;

  if (containerWidth <= 0 || containerHeight <= 0) return minScale;

  const scaleX = Math.floor(containerWidth / nativeWidth);
  const scaleY = Math.floor(containerHeight / nativeHeight);
  const scale = Math.min(scaleX, scaleY);

  return Math.max(minScale, Math.min(maxScale, scale || minScale));
}

/** Canvas / CSS size for a native region at integer scale. */
export function scaledSize(
  nativeWidth: number,
  nativeHeight: number,
  integerScale: number
): { width: number; height: number } {
  return {
    width: nativeWidth * integerScale,
    height: nativeHeight * integerScale,
  };
}

/** Center a scaled viewport inside a container (letterbox offsets). */
export function centerOffset(
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number
): { x: number; y: number } {
  return {
    x: Math.floor((containerWidth - contentWidth) / 2),
    y: Math.floor((containerHeight - contentHeight) / 2),
  };
}
