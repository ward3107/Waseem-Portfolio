/* VASIA OneTap: opt-in offline cache. Other portfolio routes are network-only. */
const CACHE = 'vasia-onetap-v8-first-name-sharing';
const PAGES = ['/card', '/qr'];
const STATIC = ['/favicon.svg', '/brand/vasia-profile.png', '/onetap/vasia-qr.svg', '/onetap/vasia-v.svg', '/onetap/bit-payment.png', '/onetap/bit-qr.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll([...PAGES, ...STATIC]))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const oldKeys = keys.filter((key) => key.startsWith('vasia-onetap-') && key !== CACHE);
      await Promise.all(oldKeys.map((key) => caches.delete(key)));
      await self.clients.claim();
      // Refresh existing OneTap windows once on upgrade, including installed PWAs.
      // Retain the exact URL (language/color); leave all other site windows alone.
      if (oldKeys.length) {
        const windows = await self.clients.matchAll({ type: 'window' });
        windows.filter((client) => {
          const url = new URL(client.url);
          return url.origin === self.location.origin &&
            PAGES.includes(url.pathname.replace(/\/$/, ''));
        }).forEach((client) => {
          // Do not await navigation during activation: navigation can itself
          // wait for activation to finish.
          void client.navigate(client.url).catch(() => undefined);
        });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && PAGES.includes(url.pathname)) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' }).then((response) => {
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
