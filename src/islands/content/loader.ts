import { IslandsContentSchema } from "../schemas";
import type { IslandDefinition, IslandsContent } from "../types";

// Auto-discover all *.islands.json files in this directory at build time
const modules = import.meta.glob("./*.islands.json", { eager: true });

let _cache: IslandsContent | null = null;

export function loadIslandsContent(): IslandsContent {
  if (_cache) return _cache;

  const allIslands: IslandsContent["islands"] = [];

  for (const [path, raw] of Object.entries(modules)) {
    try {
      const data = (raw as any).default ?? raw;
      const parsed = IslandsContentSchema.parse(data);
      allIslands.push(...parsed.islands);
    } catch (err) {
      console.error(`[islands][loader] Failed to validate ${path}:`, err);
    }
  }

  _cache = { version: "1", islands: allIslands };
  return _cache;
}

/** Bust the cache so next loadIslandsContent() re-reads from modules. Useful for dev hot-reload. */
export function invalidateContentCache(): void {
  _cache = null;
}

export const ISLANDS_CONTENT_RELOAD_EVENT = "islands:content-reloaded";

/** Notify live IslandsApp (and editor) that in-memory content changed. */
export function emitContentReload(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ISLANDS_CONTENT_RELOAD_EVENT));
  }
}

export function getIslandById(content: IslandsContent, islandId: string): IslandDefinition | undefined {
  return content.islands.find((i) => i.id === islandId);
}

// ---------------------------------------------------------------------------
// Dev hot-reload helpers — mutate in-memory content without restart
// ---------------------------------------------------------------------------

/** Replace a full island definition in the cache. Returns the new content. */
export function replaceIslandInCache(island: IslandDefinition): IslandsContent {
  const content = loadIslandsContent();
  const idx = content.islands.findIndex((i) => i.id === island.id);
  if (idx >= 0) {
    content.islands[idx] = island;
  } else {
    content.islands.push(island);
  }
  _cache = { ...content, islands: [...content.islands] };
  emitContentReload();
  return _cache;
}

/** Patch a single island by shallow-merging top-level fields. */
export function patchIslandInCache(
  islandId: string,
  patch: Partial<IslandDefinition>,
): IslandsContent {
  const content = loadIslandsContent();
  const island = content.islands.find((i) => i.id === islandId);
  if (island) {
    Object.assign(island, patch);
    _cache = { ...content, islands: [...content.islands] };
    emitContentReload();
  }
  return _cache ?? content;
}

/** Get a mutable reference to the current content cache (for the editor). */
export function getContentRef(): IslandsContent {
  return loadIslandsContent();
}
