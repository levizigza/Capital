import { PixelAtlasSchema, type LoadedPixelAtlas, type PixelAtlas } from "./types";

const atlasJsonModules = import.meta.glob("../../content/pixel/**/atlas.json", {
  eager: true,
}) as Record<string, { default: unknown }>;

const imageUrlModules = import.meta.glob("../../content/pixel/**/spritesheet.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

let _cache: LoadedPixelAtlas[] | null = null;

function directoryFromAtlasPath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const idx = normalized.indexOf("content/pixel/");
  if (idx === -1) return normalized.replace(/\/atlas\.json$/, "");
  return normalized.slice(idx, normalized.lastIndexOf("/"));
}

function imageUrlForDirectory(directory: string): string | undefined {
  const normalizedDir = directory.replace(/\\/g, "/");
  const folder = normalizedDir.split("/").pop() ?? "";

  const exact = Object.entries(imageUrlModules).find(([p]) => {
    const np = p.replace(/\\/g, "/");
    return np.includes(`${normalizedDir}/spritesheet.png`) || np.endsWith(`/${folder}/spritesheet.png`);
  });
  return exact?.[1];
}

export function invalidatePixelAtlasCache(): void {
  _cache = null;
}

export function loadPixelAtlases(): LoadedPixelAtlas[] {
  if (_cache) return _cache;

  const atlases: LoadedPixelAtlas[] = [];
  const seenIds = new Set<string>();

  for (const [path, mod] of Object.entries(atlasJsonModules)) {
    const filename = path.split("/").pop() ?? "";
    if (filename.startsWith("_")) continue;

    const raw = mod.default ?? mod;
    const parsed: PixelAtlas = PixelAtlasSchema.parse(raw);
    const directory = directoryFromAtlasPath(path);

    if (seenIds.has(parsed.id)) {
      throw new Error(`[pixel-atlas] duplicate id: ${parsed.id} (${path})`);
    }
    seenIds.add(parsed.id);

    const imageUrl = imageUrlForDirectory(directory);
    if (!imageUrl) {
      throw new Error(
        `[pixel-atlas] missing spritesheet for ${parsed.id}: expected ${directory}/spritesheet.png`
      );
    }

    atlases.push({ ...parsed, imageUrl, directory });
  }

  atlases.sort((a, b) => a.name.localeCompare(b.name));
  _cache = atlases;
  return atlases;
}

export function getPixelAtlasById(id: string): LoadedPixelAtlas | undefined {
  return loadPixelAtlases().find((a) => a.id === id);
}

export function getPixelAtlasByEntityId(entityId: string): LoadedPixelAtlas | undefined {
  return loadPixelAtlases().find((a) => a.entityId === entityId);
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    invalidatePixelAtlasCache();
  });
}
