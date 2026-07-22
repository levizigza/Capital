// Service Worker for offline functionality
// v9: GitHub Pages–safe paths (scope-relative, not site-root).
const CACHE_NAME = "capital-v19";
const RUNTIME_CACHE = "capital-runtime-v12";

function scopeUrl(path) {
  // registration.scope ends with /
  const base = self.registration?.scope || self.location.href.replace(/[^/]+$/, "");
  return new URL(path.replace(/^\//, ""), base).href;
}

// Install event - cache static assets
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

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
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

  if (isNavigation || request.destination === "script" || request.destination === "style") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
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
        if (isCacheable(response)) {
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
  if (event.data && event.data.type === "CACHE_URLS") {
    const urls = event.data.urls || [];
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
