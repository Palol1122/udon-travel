const CACHE_NAME = 'udon-travel-v1';
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './data.js',
  './manifest.json',
  './icon-512.png'
];

// ติดตั้งและเซฟไฟล์ลงเครื่องมือถือ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// เรียกใช้งานไฟล์ที่เซฟไว้เมื่อไม่มีอินเทอร์เน็ต
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
