'use strict';

// Cache version — bump on content release to force refresh
const CACHE = 'ad-implement-v1-2026-11-17';

// Core shell to precache
const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/og-image.svg',
  './assets/entra-ds-cloud-only.svg',
  './assets/entra-ds-hybrid.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only handle same-origin and Google Fonts
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  // Network-first for HTML so content updates land quickly
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Stale-while-revalidate for everything else (CSS/JS/SVG/fonts)
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetcher = fetch(req).then((res) => {
        if (res && res.status === 200 && (sameOrigin || isFont)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetcher;
    })
  );
});

// Allow the page to request skipWaiting for an immediate update
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
