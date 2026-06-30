// ---------------------------------------------------------------------------
// Asset tracker — counts and size estimates for loaded resources
// ---------------------------------------------------------------------------

export type AssetCategory = "image" | "audio" | "json" | "font" | "other";

export type TrackedAsset = {
  id: string;
  category: AssetCategory;
  bytes: number;
  source?: string;
};

type AssetTotals = Record<AssetCategory, { count: number; bytes: number }>;

const assets = new Map<string, TrackedAsset>();

function emptyTotals(): AssetTotals {
  return {
    image: { count: 0, bytes: 0 },
    audio: { count: 0, bytes: 0 },
    json: { count: 0, bytes: 0 },
    font: { count: 0, bytes: 0 },
    other: { count: 0, bytes: 0 },
  };
}

function recompute(): AssetTotals {
  const totals = emptyTotals();
  for (const a of assets.values()) {
    totals[a.category].count += 1;
    totals[a.category].bytes += a.bytes;
  }
  return totals;
}

export function registerAsset(
  id: string,
  category: AssetCategory,
  bytes: number,
  source?: string,
): void {
  assets.set(id, { id, category, bytes: Math.max(0, bytes), source });
}

export function unregisterAsset(id: string): void {
  assets.delete(id);
}

export function getAssetTotals(): AssetTotals {
  return recompute();
}

export function getTotalAssetBytes(): number {
  let sum = 0;
  for (const a of assets.values()) sum += a.bytes;
  return sum;
}

export function getAssetCount(): number {
  return assets.size;
}

export function getAssetsSnapshot(): TrackedAsset[] {
  return Array.from(assets.values());
}

function categoryFromUrl(url: string): AssetCategory {
  const path = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(path)) return "image";
  if (/\.(mp3|ogg|wav|m4a|aac|flac)$/.test(path)) return "audio";
  if (/\.(json|islands\.json)$/.test(path)) return "json";
  if (/\.(woff2?|ttf|otf)$/.test(path)) return "font";
  return "other";
}

/** Ingest PerformanceResourceTiming entries (transferSize when available). */
export function ingestResourceTimings(): void {
  if (typeof performance === "undefined") return;
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  for (const e of entries) {
    const bytes = e.transferSize || e.encodedBodySize || 0;
    if (bytes <= 0) continue;
    const id = `resource:${e.name}`;
    registerAsset(id, categoryFromUrl(e.name), bytes, e.name);
  }
}

/** Estimate bundled JSON module sizes from eager glob imports. */
export function bootstrapStaticModules(
  modules: Record<string, unknown>,
  prefix: string,
  category: AssetCategory = "json",
): void {
  for (const [path, raw] of Object.entries(modules)) {
    const data = (raw as { default?: unknown }).default ?? raw;
    const text = typeof data === "string" ? data : JSON.stringify(data);
    registerAsset(`${prefix}:${path}`, category, text.length * 2, path);
  }
}

/** Scan DOM for loaded images and estimate GPU memory (width × height × 4). */
export function scanDomImages(): void {
  if (typeof document === "undefined") return;
  const imgs = document.querySelectorAll("img");
  imgs.forEach((img, i) => {
    const w = img.naturalWidth || img.width || 0;
    const h = img.naturalHeight || img.height || 0;
    if (w <= 0 || h <= 0) return;
    const bytes = w * h * 4;
    const src = img.src || `img-${i}`;
    registerAsset(`dom-img:${src}`, "image", bytes, src);
  });
}
