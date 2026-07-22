/**
 * Nuclear cache clear for Vite+SW deploys on GitHub Pages.
 * Old index shells can keep referencing deleted /assets/*-<hash>.js chunks.
 */

const GUARD_KEY = "capital_stale_chunk_recover";

export function isStaleChunkError(message: string | undefined | null): boolean {
  if (!message) return false;
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed|error loading dynamically imported module/i.test(
    message,
  );
}

export async function hardRecoverFromStaleBuild(reason = "stale-chunk"): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* ignore */
  }

  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }

  const url = new URL(window.location.href);
  // Drop prior bust params so the URL stays clean after one recovery.
  url.searchParams.delete("cache_bust");
  url.searchParams.delete("fresh");
  url.searchParams.set("fresh", String(Date.now()));
  try {
    sessionStorage.setItem(GUARD_KEY, JSON.stringify({ reason, at: Date.now() }));
  } catch {
    /* ignore */
  }
  window.location.replace(url.toString());
}

/** Auto-recover once per tab session; prevents reload loops. */
export function autoRecoverStaleChunkOnce(message: string | undefined | null): boolean {
  if (!isStaleChunkError(message)) return false;
  try {
    const raw = sessionStorage.getItem(GUARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { at?: number };
      // Allow another attempt after 30s in case recovery itself raced a deploy.
      if (parsed.at && Date.now() - parsed.at < 30_000) return false;
    }
  } catch {
    /* ignore */
  }
  void hardRecoverFromStaleBuild("auto");
  return true;
}

export function clearStaleRecoverGuard(): void {
  try {
    sessionStorage.removeItem(GUARD_KEY);
  } catch {
    /* ignore */
  }
}
