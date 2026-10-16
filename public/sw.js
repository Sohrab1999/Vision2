// ------------------------------------------------------------------
// F4 «PWA نصب‌پذیر» — service worker (v2 — بازطراحی بعد از حادثهٔ
// ۲۰۲۶-۱۰-۱۷ «چندمین بار برنامه باز نمیشه»)
//
// چرا v2؟ v1 برای /_next/static «cache-first» بود — فرضِ ایمیجِ پروड.
// اما واقعیت این سرویس `next dev` ۲۴/۷ با ویرایشِ زندهٔ فایل‌هاست:
// چانک‌های dev تغییر می‌کنند ولی SW نسخهٔ کش‌شدهٔ کهنه را می‌داد ⇒
// گراف ماژولِ شکسته حتی بعد از رفرش، و اگر سرور در حال کامپایل دیرتر
// از ۳.۵s جواب می‌داد، صفحهٔ کهنهٔ کش‌شده جای صفحهٔ تازه را می‌گرفت —
// دقیقاً همان حلقهٔ تکرارشوندهٔ «باز نمیشه».
//
// Strategy v2 (dev-reality-safe):
//   • navigations       → network-first (بدون تایم‌اوتِ کوتاه) → فقط در
//     شکستِ واقعیِ شبکه → کش → "/"
//   • /api/*            → network-only (never cached)
//   • /_next/static/* و /_next/image → network-first → کش فقط آفلاین
//     (دارایی dev ایمیج‌پذیر نیست؛ هرگز کهنه سرو نشود)
//   • برندِ واقعاً ثابت (icons, logo, favicon) → cache-first
//   • بقیهٔ GET          → network → fallback کش
// Bump VERSION to invalidate every cache on deploy.
// ------------------------------------------------------------------

const VERSION = "vision2-sw-v2";
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
      // پاک‌سازی کامل انبار v1 — کش‌های کهنه همان زهرِ حادثه بودند
      await Promise.all(names.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// allow the page to trigger immediate activation after an update
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request, { cacheName, timeoutMs = 0 } = {}) {
  const cache = await caches.open(cacheName);
  try {
    let res;
    if (timeoutMs > 0) {
      res = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
        fetch(request).then(
          (r) => {
            clearTimeout(timer);
            resolve(r);
          },
          (e) => {
            clearTimeout(timer);
            reject(e);
          }
        );
      });
    } else {
      res = await fetch(request);
    }
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    // فقط شکستِ واقعیِ شبکه (آفلاین/سرور مرده) به کش پناه می‌برد —
    // کندیِ کامپایل دیگر صفحهٔ کهنه نمی‌سازد
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") {
      const home = await cache.match("/");
      if (home) return home;
      return new Response(
        "<!doctype html><html lang=\"fa\" dir=\"rtl\"><meta charset=\"utf-8\"><title>آفلاین</title><body style=\"font-family:sans-serif;text-align:center;padding-top:40vh;color:#444\">اینترنت در دسترس نیست — دوباره تلاش کن.</body></html>",
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    throw new Error("offline");
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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin (fonts CDN …) → browser default
  if (url.pathname.startsWith("/api/")) return; // network-only

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, { cacheName: PAGE_CACHE }));
    return;
  }
  if (
    url.pathname === "/icons/" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo.svg" ||
    url.pathname === "/favicon-32.png"
  ) {
    // فقط برندِ واقعاً ایمیج‌پذیر cache-first می‌ماند
    event.respondWith(cacheFirstStatic(request));
    return;
  }
  // هر چیز دیگر — از جمله /_next/static و /_next/image — اول شبکه
  event.respondWith(
    networkFirst(request, { cacheName: PAGE_CACHE }).catch(() => fetch(request))
  );
});
