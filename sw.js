const CACHE = 'animevault-v3';
const STATIC = ['/index.html', '/manifest.json'];

const SKIP_DOMAINS = [
  'api.jikan.moe',
  'consumet-api.onrender.com',
  'api.consumet.org',
  'aniwatchtv.to',
  'kaianime.com',
  'anikai.to',
  'miruro.tv',
  'animepahe.si',
  'anitaku.pe',
  'animex.one',
  'animension.to',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
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
  if (e.request.method !== 'GET') return;
  if (SKIP_DOMAINS.some(d => url.includes(d))) return;
  if (!url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
