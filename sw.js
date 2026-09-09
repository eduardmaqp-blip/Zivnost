// Service worker — офлайн-робота калькуляторів
// Версію міняти при кожному оновленні файлів, щоб браузер підтягнув нове
const CACHE = 'kalkulacky-v1';

const FILES = [
  './',
  './index.html',
  './dane-odvody.html',
  './ipoteka-v2.html',
  './manifest-dane.json',
  './manifest-ipoteka.json',
  './icon-dane-192.png',
  './icon-dane-512.png',
  './icon-dane-maskable.png',
  './icon-ipoteka-192.png',
  './icon-ipoteka-512.png',
  './icon-ipoteka-maskable.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.all(FILES.map(function(url) {
        return cache.add(url).catch(function() {
          console.warn('Не вдалось закешувати:', url);
        });
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function(cache) {
        cache.put(e.request, copy).catch(function() {});
      });
      return resp;
    }).catch(function() {
      return caches.match(e.request).then(function(hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
