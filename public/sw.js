// Hello Calc service worker (NFR-2: offline-capable static PWA).
// Runtime caching — stale-while-revalidate for same-origin GETs, with an
// offline navigation fallback to the cached app shell. Cross-origin requests
// (e.g. the Pyodide CDN for the heavy CAS tier) are left to the network, so
// heavy CAS is the one feature that needs connectivity. Base-path agnostic:
// everything is relative to the registration scope.
const CACHE = "hellocalc-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // don't intercept the CDN

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) {
        // refresh in the background (stale-while-revalidate)
        void fetch(req)
          .then((res) => res.ok && cache.put(req, res.clone()))
          .catch(() => {});
        return cached;
      }
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        if (req.mode === "navigate") {
          const shell =
            (await cache.match(self.registration.scope)) ||
            (await cache.match(new URL("index.html", self.registration.scope).href));
          if (shell) return shell;
        }
        throw err;
      }
    }),
  );
});
