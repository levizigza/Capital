import type { VibeLevel } from "./levelSchema";
import { VibeLevelSchema } from "./levelSchema";

const STORAGE_KEY = "financequest_community_levels_v1";

export function loadCommunityLevels(): VibeLevel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed
      .map((item) => VibeLevelSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => r.data!);
  } catch {
    return [];
  }
}

export function saveCommunityLevel(level: VibeLevel): void {
  const levels = loadCommunityLevels().filter((l) => l.id !== level.id);
  levels.unshift(level);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels.slice(0, 50)));
}

export function deleteCommunityLevel(id: string): void {
  const levels = loadCommunityLevels().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

export function bumpPlays(id: string): void {
  const levels = loadCommunityLevels();
  const idx = levels.findIndex((l) => l.id === id);
  if (idx >= 0) {
    levels[idx] = { ...levels[idx], plays: levels[idx].plays + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  }
}

export function exportLevelJson(level: VibeLevel): string {
  return JSON.stringify(level, null, 2);
}

export function importLevelJson(text: string): VibeLevel {
  const parsed = JSON.parse(text);
  return VibeLevelSchema.parse(parsed);
}
