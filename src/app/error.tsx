"use client";

// Route-segment error boundary (Phase-0 safety):
// a crash in any view no longer kills the whole app — the shell
// (header/footer/store) survives and the learner can retry or go home.

import { useEffect } from "react";
import { BookX, Home, RotateCcw } from "lucide-react";

// Dev/preview chunk-load races (a fetch of a not-yet-compiled chunk under
// load, e.g. right after a heavy test run) surface here as a broken module
// graph — reset() cannot heal that, but a single reload does. Patterns
// cover the wording of turbopack/webpack/Safari plus the turbopack HMR
// stale-factory wording ("module factory is not available ... deleted in
// an HMR update") that fired the 2026-10-16 user-visible incident: the
// old regex missed it, so the self-heal never ran and the learner was
// left staring at the recovery card instead of the healed page.
const CHUNK_LOAD_ERR =
  /failed to (fetch|load)( dynamically)?( imported)? (module|chunk)|error loading dynamically imported module|loading chunk \d+ failed|importing a module script failed|module factory is not available|deleted in an HMR update/i;
const CHUNK_RELOAD_KEY = "v2-chunk-reload";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  // Next's route-boundary API still hands us reset(); it is intentionally
  // unused — see the button comment below.
  reset?: () => void;
}) {
  // A chunk-class failure can only be healed by a full document reload:
  // reset() re-renders the same broken lazy module graph. And in this
  // long-lived preview reality (parallel HMR churn + watchdog server
  // restarts), even non-chunk crashes leave a stale graph behind — the
  // 2026-10-17 "هنوزم همینه" follow-up showed the learner clicking retry
  // on a card whose reset() kept re-rendering the same broken state. So
  // whatever the error class, the primary escape is a real hard reload
  // (user-consented ⇒ cannot loop without them); the raw error stays on
  // the card and /api/client-error keeps incidents discoverable.
  const isChunkErr = CHUNK_LOAD_ERR.test(error.message || "");

  useEffect(() => {
    console.error("Webbook view error:", error);
    try {
      // 1) self-heal: a chunk-load failure gets exactly ONE automatic
      //    reload per session (sessionStorage guard keeps it loop-proof);
      //    every other error falls through to the recovery card.
      if (isChunkErr) {
        if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
          window.location.reload();
          return;
        }
      }
      // 2) report: forward the crash to the server log (dev.log) — a
      //    client-only console.error made incidents undiscoverable.
      fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          href: window.location.href,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* diagnostics must never become a crash source */
    }
  }, [error, isChunkErr]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border c-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <BookX size={26} />
        </div>
        <h1 className="mb-2 text-lg font-black text-stone-800">
          این صفحهٔ کتاب باز نشد!
        </h1>
        <p className="mb-6 text-[13px] leading-7 text-stone-500">
          مشکلی موقت پیش آمد، ولی پیشرفت و داده‌های تو سالم هستند.
          می‌توانی همین صفحه را دوباره باز کنی یا به خانه برگردی.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <button
            onClick={() => {
              // hard reload heals a broken/stale module graph whatever the
              // error class; clearing the guard key lets the fresh session
              // auto-heal once more
              try {
                sessionStorage.removeItem(CHUNK_RELOAD_KEY);
              } catch {
                /* storage may be unavailable — reload still proceeds */
              }
              window.location.reload();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-[background-color,transform] hover:bg-emerald-700 active:scale-95"
          >
            <RotateCcw size={15} />
            تلاش دوباره
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition-[background-color,transform] hover:bg-stone-50 active:scale-95"
          >
            <Home size={15} />
            بازگشت به خانه
          </a>
        </div>
        {error.digest && (
          <p className="mt-5 text-[11px] text-stone-300" dir="ltr">
            code: {error.digest}
          </p>
        )}
        {error.message && (
          // the raw cause, truncated — a screenshot of this card then
          // carries the diagnosis with it (lesson of the 2026-10-16/17
          // incidents: client-only console errors made each report blind)
          <p
            dir="ltr"
            className="mt-2 max-w-full overflow-hidden text-ellipsis break-all px-2 text-[10px] leading-4 text-stone-300"
          >
            {error.message.length > 160
              ? `${error.message.slice(0, 160)}…`
              : error.message}
          </p>
        )}
      </div>
    </div>
  );
}
