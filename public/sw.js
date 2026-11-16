/*
 * IBDA / STORE-STARTER PWA service worker.
 *
 *   • Static assets: cache-first.
 *   • Storefront navigations: network-first with cached fallback and a real
 *     offline HTML fallback (never a bare "Offline" string).
 *   • /admin, /api and /offline navigations: ALWAYS go to network. We never
 *     serve a cached version of /admin because stale caches once produced a
 *     white "Offline" screen when the admin shell wasn't reachable.
 *
 * Bump SW_VERSION whenever precache contents or caching logic change so
 * clients get the fresh shell on next load.
 */
const SW_VERSION = "store-pwa-4";
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGES_CACHE = `${SW_VERSION}-pages`;

const PRECACHE_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/brand/store-icon.svg",
];

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isAdminRequest(url) {
  return url.pathname === "/admin" || url.pathname.startsWith("/admin/");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

/** Minimal self-contained offline HTML. Used as a last-resort fallback so
 *  we never return a raw "Offline" string in the body. */
function offlineHtmlResponse() {
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Offline</title>
  <style>
    body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#FAF9F6;color:#242424;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;}
    main{max-width:360px;padding:32px;text-align:center;}
    h1{font-size:20px;margin:16px 0 8px;}
    p{color:#5B544C;line-height:1.5;margin:0 0 20px;font-size:14px;}
    button{appearance:none;border:none;background:#087F83;color:#fff;font:inherit;padding:10px 20px;border-radius:9999px;cursor:pointer;}
  </style>
</head>
<body>
  <main>
    <h1>You're offline</h1>
    <p>Check your connection and try again.</p>
    <button onclick="location.reload()">Reload</button>
  </main>
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match("/offline");
    if (offline) return offline;
    return offlineHtmlResponse();
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // Precache failing (e.g. /offline not yet built) shouldn't block install.
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(SW_VERSION)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API calls — always let the network handle them.
  if (isApiRequest(url)) return;

  // Never intercept the admin dashboard. A stale SW previously returned a
  // bare "Offline" fallback for /admin, producing a white screen with the
  // single word "Offline". Admin pages must always come from the server.
  if (isAdminRequest(url)) return;

  // Don't intercept the offline page itself.
  if (url.pathname === "/offline") return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
  }
});
