// Service Worker — Capital on GitHub Pages
// v11: never pin index.html or hashed Vite bundles. Stale shells soft-brick deploys.
const CACHE_NAME = "capital-v48";
const RUNTIME_CACHE = "capital-runtime-v32";

function scopeUrl(path) {
  const base = self.registration?.scope || self.location.href.replace(/[^/]+$/, "");
  return new URL(path.replace(/^\//, ""), base).href;
}

function isHashedBundle(url) {
  // Vite emits /assets/Name-<hash>.js|.css — caching these across deploys breaks dynamic import().
  return /\/assets\/[^/]+-[A-Za-z0-9_-]{6,}\.(?:js|css|mjs)(?:\?|$)/.test(url.pathname);
}

function isAppShell(url) {
  const path = url.pathname.replace(/\/+$/, "");
  return (
    path.endsWith("/Capital") ||
    path.endsWith("/index.html") ||
    /\/Capital\/?$/.test(url.pathname) ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/404.html")
  );
}

self.addEventListener("install", (event) => {
  // Precache only durable, non-hashed shell bits — never index.html (it embeds asset hashes).
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const assets = [scopeUrl("./manifest.json")];
      return cache.addAll(assets).catch((err) => {
        console.log("Cache install failed:", err);
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          // Drop every prior cache so old index.html / chunks cannot linger.
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() =>
        // Also purge any HTML documents that may have been stored in the current caches.
        Promise.all([caches.open(CACHE_NAME), caches.open(RUNTIME_CACHE)]).then(
          async ([shell, runtime]) => {
            for (const cache of [shell, runtime]) {
              const keys = await cache.keys();
              await Promise.all(
                keys.map((req) => {
                  const u = new URL(req.url);
                  if (isAppShell(u) || isHashedBundle(u) || req.destination === "document") {
                    return cache.delete(req);
                  }
                  return undefined;
                }),
              );
            }
          },
        ),
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: "CAPITAL_SW_ACTIVATED", cache: CACHE_NAME });
          }
        }),
      ),
  );
});

function isCacheable(response) {
  return response && response.status === 200 && response.type === "basic";
}

function isStaticAsset(url) {
  return /\.(?:png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|mp3|ogg|wav|glb|obj|mtl)$/i.test(
    url.pathname,
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  const isNavigation = request.mode === "navigate" || request.destination === "document";

  // Navigations + hashed bundles + scripts/styles: always network.
  // Never fall back to a cached index.html that points at deleted chunks.
  if (
    isNavigation ||
    isAppShell(url) ||
    isHashedBundle(url) ||
    request.destination === "script" ||
    request.destination === "style"
  ) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(
        () =>
          new Response(
            isNavigation || isAppShell(url)
              ? "<!doctype html><meta charset=utf-8><title>Capital</title><p>Network required to load Capital. Reconnect and refresh.</p>"
              : "/* capital: bundle unavailable after deploy — hard refresh */",
            {
              status: 504,
              statusText: "Bundle Gone",
              headers: {
                "Content-Type":
                  isNavigation || isAppShell(url) ? "text/html; charset=utf-8" : "text/javascript",
                "Cache-Control": "no-store",
              },
            },
          ),
      ),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (isCacheable(response) && !isHashedBundle(url) && !isAppShell(url)) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) =>
            cached ||
            new Response("Offline", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({ "Content-Type": "text/plain" }),
            }),
        ),
      ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === "CACHE_URLS") {
    // Refuse to cache app shell / hashed bundles — offline icons/audio only.
    const urls = (event.data.urls || []).filter((u) => {
      try {
        const parsed = new URL(u, self.location.href);
        return !isHashedBundle(parsed) && !isAppShell(parsed);
      } catch {
        return false;
      }
    });
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) =>
        Promise.all(
          urls.map((u) =>
            fetch(u)
              .then((r) => (isCacheable(r) ? cache.put(u, r) : undefined))
              .catch(() => undefined),
          ),
        ),
      ),
    );
  }
});
