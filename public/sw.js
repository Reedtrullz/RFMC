const CACHE_NAME = 'virtual-cdu-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Network-first strategy — always try to get fresh content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Clear old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

