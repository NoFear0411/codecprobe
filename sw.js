/**
 * CodecProbe Service Worker
 * Cache-first for static assets, network-first for navigation
 */

const CACHE_VERSION = '1770642964174';
const CACHE_NAME = `codecprobe-v${CACHE_VERSION}`;

const CORE_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/main.js',
    './js/codec-database.js',
    './js/codec-tester.js',
    './js/ui-renderer.js',
    './js/device-detection.js',
    './js/drm-detection.js',
    './js/theme-manager.js',
    './js/url-state.js',
    './js/vendor/ua-parser.min.js',
    './manifest.json',
    './favicon.svg'
];

// Precache all core assets on install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Delete old caches on activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith('codecprobe-') && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests from our origin
    if (request.method !== 'GET') return;
    if (!request.url.startsWith(self.location.origin)) return;

    // Navigation (HTML) — network first, cache fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets — cache first, network fallback
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                });
            })
    );
});
