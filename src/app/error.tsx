"use client";

// Route-segment error boundary (Phase-0 safety):
// a crash in any view no longer kills the whole app — the shell
// (header/footer/store) survives and the learner can retry or go home.

import { useEffect, useState } from "react";
import { BookX, Home, RotateCcw } from "lucide-react";

// Dev/preview chunk-load races (a fetch of a not-yet-compiled chunk under
// load, e.g. right after a heavy test run) surface here as a broken module
// graph — reset() cannot heal that, but a single reload does. Patterns
// cover the wording of turbopack/webpack/Safari respectively.
const CHUNK_LOAD_ERR =
  /failed to (fetch|load)( dynamically)?( imported)? (module|chunk)|error loading dynamically imported module|loading chunk \d+ failed|importing a module script failed/i;
const CHUNK_RELOAD_KEY = "v2-chunk-reload";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    console.error("Webbook view error:", error);
    try {
      // 1) self-heal: a chunk-load failure gets exactly ONE automatic
      //    reload per session (sessionStorage guard keeps it loop-proof);
      //    every other error falls through to the recovery card.
      if (CHUNK_LOAD_ERR.test(error.message || "")) {
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
  }, [error]);

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
              setCounting(true);
              reset();
              // guard: if reset silently fails, offer home after a beat
              setTimeout(() => setCounting(false), 600);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <RotateCcw size={15} />
            تلاش دوباره
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition-all hover:bg-stone-50 active:scale-95"
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
        {counting && (
          <p className="mt-3 text-[12px] font-bold text-emerald-600">
            در حال بازیابی…
          </p>
        )}
      </div>
    </div>
  );
}
