"use client";

// Route-segment error boundary (Phase-0 safety):
// a crash in any view no longer kills the whole app — the shell
// (header/footer/store) survives and the learner can retry or go home.

import { useEffect, useState } from "react";
import { BookX, Home, RotateCcw } from "lucide-react";

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
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl c-card p-8 text-center shadow-lg">
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
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.96]"
          >
            <RotateCcw size={15} />
            تلاش دوباره
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition-all hover:bg-stone-50 active:scale-[0.96]"
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
