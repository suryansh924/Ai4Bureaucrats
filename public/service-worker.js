self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
  self.skipWaiting(); // Forces the new SW to take control immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          return caches.delete(cache); // Clear old caches
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages immediately
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
