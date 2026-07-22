// Service Worker for offline functionality
// v10: never cache hashed JS/CSS — stale Vite chunks soft-brick GitHub Pages.
const CACHE_NAME = "capital-v29";
const RUNTIME_CACHE = "capital-runtime-v22";

function scopeUrl(path) {
  const base = self.registration?.scope || self.location.href.replace(/[^/]+$/, "");
  return new URL(path.replace(/^\//, ""), base).href;
}

function isHashedBundle(url) {
  // Vite emits /assets/Name-<hash>.js|.css — caching these across deploys breaks dynamic import().
  return /\/assets\/[^/]+-[A-Za-z0-9_-]{6,}\.(?:js|css|mjs)(?:\?|$)/.test(url.pathname);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const assets = [scopeUrl("./"), scopeUrl("./index.html"), scopeUrl("./manifest.json")];
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
          // Drop every old cache — including prior RUNTIME — so stale chunks cannot linger.
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name)),
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

  // Hashed Vite bundles: network-only. Never fall back to a stale cached chunk.
  if (isHashedBundle(url) || request.destination === "script" || request.destination === "style") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response("/* capital: bundle unavailable after deploy — hard refresh */", {
            status: 504,
            statusText: "Bundle Gone",
            headers: { "Content-Type": "text/javascript" },
          }),
      ),
    );
    return;
  }

  const isNavigation = request.mode === "navigate" || request.destination === "document";

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(scopeUrl("./index.html"), copy.clone());
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(scopeUrl("./index.html"))),
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
        if (isCacheable(response) && !isHashedBundle(url)) {
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
    const urls = (event.data.urls || []).filter((u) => {
      try {
        return !isHashedBundle(new URL(u, self.location.href));
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
