const CACHE = 'animevault-v2';
const STATIC = ['/index.html', '/manifest.json'];

// These are always fetched live — never cache them
const SKIP_DOMAINS = [
  'api.jikan.moe',
  'consumet-api.onrender.com',
  'api.consumet.org',
  'aniwatch.to',
  'kaianime.com',
  'animegg.org',
  'animixplay.to',
  'animedao.to',
  'yugenanime.tv',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always skip non-GET and live/streaming domains
  if (e.request.method !== 'GET') return;
  if (SKIP_DOMAINS.some(d => url.includes(d))) return;
  // Skip chrome-extension and non-http
  if (!url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Only cache same-origin successful responses
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached); // fallback to cache if offline
    })
  );
});
