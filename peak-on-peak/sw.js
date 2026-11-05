// Offline support: app shell is cached on install; fonts are cached as they load.
const VERSION = "pop-v2";
const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: cache-first, filled on first use.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(VERSION).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") c.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Pages: network-first so updates land, cache when offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put("index.html", copy));
          return res;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // Everything else from this origin: serve from cache, refresh in the background.
  e.respondWith(
    caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => {
        if (res.ok) c.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
