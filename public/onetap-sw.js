/* VASIA OneTap: opt-in offline cache. Other portfolio routes are network-only. */
const CACHE = 'vasia-onetap-v1';
const PAGES = ['/card', '/qr'];
const STATIC = ['/favicon.svg', '/brand/vasia-profile.png', '/onetap/vasia-qr.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll([...PAGES, ...STATIC]))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('vasia-onetap-') && key !== CACHE)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && PAGES.includes(url.pathname)) {
    event.respondWith(
      fetch(request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(url.pathname, copy)));
        return response;
      }).catch(async () => (await caches.match(url.pathname)) || Response.error())
    );
    return;
  }

  const knownAsset = STATIC.includes(url.pathname) || url.pathname.startsWith('/onetap/');
  if (knownAsset) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    })));
    return;
  }

  if (url.pathname.startsWith('/assets/') && event.clientId) {
    event.respondWith(self.clients.get(event.clientId).then(async (client) => {
      if (!client || !PAGES.includes(new URL(client.url).pathname)) return fetch(request);
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    }));
  }
});
