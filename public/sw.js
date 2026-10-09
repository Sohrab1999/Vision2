// ------------------------------------------------------------------
// F4 «PWA نصب‌پذیر» — service worker (نقشهٔ راه فیچرها، اسپرینت ۳)
//
// Strategy (dev-safe by design):
//   • navigations  → network-first (3.5s timeout) → cached copy → cached "/"
//   • /api/*       → network-only (never cached — rate-limit & sync stay live)
//   • immutable-ish static (/_next/static, /icons, fonts) → cache-first
//   • everything else GET → network, fallback to cache
// Bump VERSION to invalidate every cache on deploy.
// ------------------------------------------------------------------

const VERSION = "vision2-sw-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

const PRECACHE = ["/", "/logo.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      // best-effort precache — never block install on a single failure
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// allow the page to trigger immediate activation after an update
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetchWithTimeout(request, 3500);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const home = await cache.match("/");
    if (home) return home;
    return new Response(
      "<!doctype html><html lang=\"fa\" dir=\"rtl\"><meta charset=\"utf-8\"><title>آفلاین</title><body style=\"font-family:sans-serif;text-align:center;padding-top:40vh;color:#444\">اینترنت در دسترس نیست — دوباره تلاش کن.</body></html>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && res.ok && (res.type === "basic" || res.type === "default")) {
    cache.put(request, res.clone());
  }
  return res;
}

async function networkFallbackCache(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw new Error("offline");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin (fonts CDN …) → browser default
  if (url.pathname.startsWith("/api/")) return; // network-only

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo.svg" ||
    url.pathname === "/favicon-32.png" ||
    url.pathname.startsWith("/_next/image")
  ) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }
  event.respondWith(networkFallbackCache(request).catch(() => fetch(request)));
});
