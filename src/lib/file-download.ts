"use client";

// ------------------------------------------------------------------
// r398 — the file-download estate gets ONE owner. The census (twin-audit
// pattern, the r397-registered item): the download tail — SSR guard +
// Blob(text/csv) + createObjectURL + anchor click + revoke(1000) +
// try/catch→false — was byte-identical across SIX lib modules
// (progress-csv ×3 / coverage-csv / teacher-csv / teacher-class-ledger /
// teacher-learner-csv / pulse-csv), and the view-level failure toast
// («خطا در ساخت فایل» + «لطفاً دوباره تلاش کن.» + 3000ms) was
// byte-identical across NINE gates in six view files — the view layer
// pinned by the r397 census lock. The drawBadgeBand lesson (r285/286)
// applied at the root: the single source is only real when the shared
// painter signs it — the filename and the CSV content arrive as
// parameters, the builder runs INSIDE the guard so the failure path
// stays whole (any throw → false, byte-for-byte the old try-scope).
//
// Documented no-verdicts (the r386 lesson — dialects stay free):
//  · downloadAnkiTsv (anki-export.ts) keeps its own tail: TSV mime, no
//    SSR guard (returns count, not boolean), revoke(4000) window.
//  · exportProgress (backup.ts) is the JSON family — different mime,
//    stamped filename, its own catch dialect.
//  · CSV_BOM («\uFEFF») lives as three module-local copies
//    (teacher-csv / pulse-csv / progress-csv) — a registered candidate,
//    not migrated this round.
//  · Analytics semantics differ per family, each documented: image
//    events are success-gated (ok/blob — r287/288 contract), CSV events
//    are INTENT-gated (r351: «قصدِ خروجی قبل از تلاش» — teacher_csv /
//    pulse_csv fire before the attempt; anki_export is guarded by the
//    null check — the r344 lock). The owner fires no analytics itself
//    (the r344 rule).
// ------------------------------------------------------------------

import { toast } from "@/hooks/use-toast";

/** The byte-identical download tail, ONCE. `build` runs inside the
 * try/catch so a throwing builder still resolves to false (the old
 * per-module try-scope, preserved exactly). */
export function downloadCsvFile(build: () => string, filename: string): boolean {
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const blob = new Blob([build()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

// r398 — the file-build failure pair gets ONE name. Since r343 the
// failure toast was hand-copied across NINE gates (three weekly CSVs /
// official coverage / dictionary anki / pulse ledger / teacher ×2 /
// teacher learner card) and held equal only by source locks — the exact
// situation r397 cured for the image family (imageFailToast). Borrowing
// is a choice: the nine SUCCESS toasts stay per-context dialects.
export function fileFailToast(): void {
  toast({
    title: "خطا در ساخت فایل",
    description: "لطفاً دوباره تلاش کن.",
    duration: 3000,
  });
}
