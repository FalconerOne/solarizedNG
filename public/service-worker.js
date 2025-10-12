const CACHE_NAME = "solarizedng-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable_icon.png"
];

// ✅ Install: Precache essential assets
self.addEventListener("install", (event) => {
  console.log("📦 Installing service worker and caching assets...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ✅ Activate: Clean up old caches when updated
self.addEventListener("activate", (event) => {
  console.log("🔁 Activating new service worker...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// ✅ Fetch: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Optionally cache new resources dynamically
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, responseClone)
            );
          }
          return response;
        })
        .catch(() => caches.match("/")); // fallback to homepage when offline
    })
  );
});

// ✅ Notify clients (tabs) when new SW version is available
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("controllerchange", () => {
  console.log("⚡ New service worker activated — refreshing clients...");
});
