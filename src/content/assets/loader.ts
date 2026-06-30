import { AssetRegistryEntrySchema, type AssetRegistryEntry } from "./schema";

const modules = import.meta.glob("../../../content/assets/*.json", { eager: true });

const SKIP = new Set(["_template.json"]);

let _cache: AssetRegistryEntry[] | null = null;

export function loadAssetRegistry(): AssetRegistryEntry[] {
  if (_cache) return _cache;

  const assets: AssetRegistryEntry[] = [];
  const seenIds = new Set<string>();

  for (const [path, raw] of Object.entries(modules)) {
    const filename = path.split("/").pop() ?? "";
    if (SKIP.has(filename) || filename.startsWith("_")) continue;

    const data = (raw as { default?: unknown }).default ?? raw;
    const parsed = AssetRegistryEntrySchema.parse(data);

    if (seenIds.has(parsed.id)) {
      throw new Error(`[asset-registry] duplicate id: ${parsed.id} (${path})`);
    }
    if (filename !== `${parsed.id}.json`) {
      throw new Error(
        `[asset-registry] filename must match id: expected ${parsed.id}.json, got ${filename}`
      );
    }

    seenIds.add(parsed.id);
    assets.push(parsed);
  }

  assets.sort((a, b) => a.name.localeCompare(b.name));
  _cache = assets;
  return assets;
}

export function getAssetById(id: string): AssetRegistryEntry | undefined {
  return loadAssetRegistry().find((a) => a.id === id);
}
