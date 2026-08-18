/**
 * Registry of all Capital user-data keys + hard wipe.
 * Single source of truth for privacy erasure (PIPEDA / COPPA readiness).
 */

import { destroyVaultKey } from "./vault";

/** Keys that MUST be encrypted at rest when SecureStore is active. */
export const SENSITIVE_LOCAL_KEYS = [
  "kv_user-profile",
  "kv_user-auth-profile",
  "kv_user-session",
  "financial-literacy-saves",
  "financequest-backup",
  "capital_family_room_v1",
  "capital_family_rooms_index_v1",
  "island_analytics_v1",
  "decision_timeline_v1",
  "vark_profile",
  "vark_adaptation",
] as const;

/** All known localStorage keys that hold user or ops data. */
export const ALL_USER_DATA_KEYS = [
  ...SENSITIVE_LOCAL_KEYS,
  "kv_game-scores",
  "kv_consent-settings",
  "island_settings_v1",
  "island_performance_v1",
  "learning_profile_v1",
  "financequest_community_levels_v1",
  "financequest_community_hidden_v1",
  "financequest_input_v1",
  "financequest_juice_v1",
  "capital_music_v1",
  "music-volume",
  "music-enabled",
  "high-contrast",
  "islands_tutorial_started_v1",
  "capital_ftue_v1_complete",
  "capital_ftue_v1_dismissed",
  "capital_ftue_core_loop_v1",
  "capital_sre_events_v1",
  "capital_kill_harbor3d",
  "capital_kill_serviceWorker",
  "capital_kill_telemetry",
  "capital_kill_familyRooms",
  "capital_kill_studioGallery",
  "capital_kill_partyBoard",
] as const;

/** Spark / islands KV keys (may live in spark.kv or local mock). */
export const SPARK_USER_KEYS = [
  "island_save_v1",
  "island_analytics_v1",
  "user-profile",
  "game-scores",
  "accessibility-settings",
  "banking-simulator-state",
  "learning-style",
  "anonymous-events",
] as const;

const SESSION_KEYS = [
  "capital_intro_seen_v1",
  "capital_intro_done_for_boot",
  "capital_boot_land_hub",
  "capital_stale_chunk_recover",
  "capital_harbor3d_ok",
  "capital_harbor3d_fail",
  "capital_archipelago_map3d_fail",
  "capital_shore3d_fail",
  "capital:perf-overlay",
] as const;

export type EraseReport = {
  localStorageRemoved: number;
  sessionStorageRemoved: number;
  sparkRemoved: number;
  vaultDestroyed: boolean;
  at: string;
};

/**
 * Nuclear privacy wipe — clears known keys + spark KV + device vault key.
 * Prefer this over localStorage.clear() alone (incomplete across dual stores).
 */
export async function eraseAllUserData(): Promise<EraseReport> {
  let localStorageRemoved = 0;
  let sessionStorageRemoved = 0;
  let sparkRemoved = 0;

  try {
    const { clearSecureStoreMemory } = await import("./secureStore");
    clearSecureStoreMemory();
  } catch {
    /* ignore */
  }

  try {
    for (const key of ALL_USER_DATA_KEYS) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        localStorageRemoved += 1;
      }
    }
    // Also remove any leftover kv_* / capital_* / financequest_* prefixes
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith("kv_") ||
        k.startsWith("capital_") ||
        k.startsWith("financequest") ||
        k.startsWith("island_") ||
        k === "financial-literacy-saves" ||
        k.startsWith("vark_")
      ) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) {
      localStorage.removeItem(k);
      localStorageRemoved += 1;
    }
  } catch {
    /* ignore */
  }

  try {
    for (const key of SESSION_KEYS) {
      if (sessionStorage.getItem(key) !== null) {
        sessionStorage.removeItem(key);
        sessionStorageRemoved += 1;
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const spark = (window as unknown as { spark?: { kv?: { keys: () => Promise<string[]>; delete: (k: string) => Promise<void> } } }).spark;
    if (spark?.kv?.keys && spark.kv.delete) {
      const keys = await spark.kv.keys();
      for (const k of keys) {
        await spark.kv.delete(k);
        sparkRemoved += 1;
      }
    }
  } catch {
    /* spark unavailable on Pages */
  }

  let vaultDestroyed = false;
  try {
    await destroyVaultKey();
    vaultDestroyed = true;
  } catch {
    vaultDestroyed = false;
  }

  return {
    localStorageRemoved,
    sessionStorageRemoved,
    sparkRemoved,
    vaultDestroyed,
    at: new Date().toISOString(),
  };
}
