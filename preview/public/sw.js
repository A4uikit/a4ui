// Minimal service worker for the A4ui docs PWA. Network-first so a redeploy is
// always picked up when online; falls back to the runtime cache offline. Bump
// CACHE to force old caches out.
const CACHE = 'a4ui-docs-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // let cross-origin (fonts, tiles) hit the network

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req)
        if (res && res.ok) {
          const cache = await caches.open(CACHE)
          cache.put(req, res.clone())
        }
        return res
      } catch {
        const cached = await caches.match(req)
        if (cached) return cached
        if (req.mode === 'navigate') {
          const shell = await caches.match('/index.html')
          if (shell) return shell
        }
        throw new Error('offline: not cached')
      }
    })(),
  )
})
