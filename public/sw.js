// Service Worker for offline functionality
// v7: continuous mural across puzzle pieces + clock-driven sun/moon.
const CACHE_NAME = 'capital-v8'
const RUNTIME_CACHE = 'capital-runtime-v8'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache install failed:', err)
      })
    })
  )
  // Force activation of new service worker
  self.skipWaiting()
})

// Activate event - clean up old caches (including any prior versions)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  )
})

// A response is cacheable only if it's a same-origin, successful, basic response.
function isCacheable(response) {
  return response && response.status === 200 && response.type === 'basic'
}

// Static media (images, fonts, audio) — safe to serve cache-first.
function isStaticAsset(url) {
  return /\.(?:png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|mp3|ogg|wav)$/i.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  const isNavigation =
    request.mode === 'navigate' || request.destination === 'document'

  // Network-first for navigations and code (HTML/JS/CSS): always try to get the
  // latest, fall back to cache only when offline. This prevents stale app shells
  // and stale chunks from ever masking a new release.
  if (isNavigation || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/index.html'))
        )
    )
    return
  }

  // Cache-first for static media assets.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
      })
    )
    return
  }

  // Everything else: network with cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (isCacheable(response)) {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then(
          (cached) =>
            cached ||
            new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' }),
            })
        )
      )
  )
})

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || []
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => cache.addAll(urls))
    )
  }
})
