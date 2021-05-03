const version = 'v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(version).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/client.js',
        '/sw.js',
        '/server.js',
        '/manifest.json',
        '/package.json',
        '/images/yellowmarker.png',
        '/images/arrow.png',
        '/images/icons/icon-192x192.png',
        '/images/icons/icon-256x256.png',
        '/images/icons/icon-384x384.png',
        '/images/icons/icon-512x512.png',
        '/notfound.txt',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();

        caches.open(version).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/notfound.txt');
      });
    }
  }));
});