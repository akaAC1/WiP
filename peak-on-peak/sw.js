// Offline support: app shell is cached on install; fonts are cached as they load.
// Keep VERSION in step with APP_VERSION in app.js.
const VERSION = "pop-v8";
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
  // cache: "reload" skips the browser's HTTP cache so a new version never installs old files.
  // Take over as soon as the new files are cached; the page reloads itself out of sight.
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Older pages ask for "skipWaiting" from their "Reload" button. This worker is usually
// already active by then, so reload the page that asked.
self.addEventListener("message", (e) => {
  if (e.data !== "skipWaiting") return;
  self.skipWaiting();
  if (e.source && e.source.navigate) e.source.navigate(e.source.url).catch(() => {});
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

  // Everything else from this origin: network first so the newest code always loads
  // when online; fall back to the cached copy if offline or the network takes > 3 s.
  e.respondWith(
    caches.open(VERSION).then((c) => {
      const net = fetch(req, { cache: "no-cache" }).then((res) => {
        if (res.ok) c.put(req, res.clone());
        return res;
      });
      const slow = new Promise((r) => setTimeout(r, 3000)).then(() => c.match(req));
      return Promise.race([net.catch(() => c.match(req)), slow.then((hit) => hit || net)])
        .then((res) => res || net);
    })
  );
});
