// ------------------------------------------------------------------
// Task 169 — «خروجیِ CSV از پیشرفت» — the progress table as a
// spreadsheet-friendly CSV file, a new tool for the reports family.
//
// What it is: the full 35-day dayHistory memory rendered as a flat
// table (one row per calendar day, zero-filled gaps included) so a
// teacher or parent can open it in Excel and chart the learner's
// real rhythm. This is deliberately NOT another backup format — the
// JSON backup (lib/backup.ts) stays the full-fidelity restore path;
// the CSV is a one-way, human-analysis presentation of the DayStat
// counters only.
//
// Contract mirrors computeWeeklyDigest (weekly-digest.ts): the pure
// builder takes an explicit anchor day key instead of calling
// new Date(), so tests are deterministic and the caller decides the
// "today" (daysAgoKey(0) at the call site, same as the digest).
// Rows run oldest → newest; line endings are CRLF (RFC 4180 — Excel
// friendly); the caller prepends CSV_BOM so Excel detects UTF-8 and
// renders the Persian headers correctly.
//
// Column set is the five DayStat counters + their sum + identity
// columns. All values are bare numbers / plain strings — no quoting
// ever needed (guarded by a structural test). Raw ASCII digits are
// intentional: the CSV is for spreadsheet computation, the Persian
// numerals live in the UI around it.
// ------------------------------------------------------------------

import { dayKeyBefore, faWeekday } from "@/lib/weekly-digest";
import { normDayStat } from "@/state/day-engine";
import type { DayHistoryMap } from "@/state/types";

/** UTF-8 BOM — prepended by the downloader so Excel reads Persian headers. */
export const CSV_BOM = "\uFEFF";

/** Persian header row — order is the file contract, never reorder casually. */
export const PROGRESS_CSV_COLUMNS = [
  "تاریخ",
  "روز هفته",
  "مرور",
  "آزمون",
  "واژهٔ نو",
  "دیکته",
  "برق‌آسا",
  "مجموع",
] as const;

/** dayHistory memory cap (state/types.ts) — the honest full window. */
export const PROGRESS_CSV_DAYS = 35;

/**
 * Build the CSV body (no BOM): header line + one row per day of the
 * window ending at `today`, oldest first. Missing/legacy/partial
 * entries are normalized through normDayStat so every cell is a
 * number — never "undefined".
 */
export function buildProgressCsv(history: DayHistoryMap, today: string, days = PROGRESS_CSV_DAYS): string {
  const lines: string[] = [PROGRESS_CSV_COLUMNS.join(",")];
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKeyBefore(today, i);
    const s = normDayStat(history[key]);
    const total = s.reviews + s.quizzes + s.words + s.dictation + s.rush;
    lines.push(
      [key, faWeekday(key), s.reviews, s.quizzes, s.words, s.dictation, s.rush, total].join(",")
    );
  }
  return lines.join("\r\n") + "\r\n";
}

/**
 * Trigger a browser download of the full progress window.
 * Returns false outside the DOM (SSR/tests) or when the download
 * could not be triggered — the caller decides how to surface it.
 */
export function downloadProgressCsv(history: DayHistoryMap, today: string, days = PROGRESS_CSV_DAYS): boolean {
  try {
    if (typeof document === "undefined") return false;
    const csv = CSV_BOM + buildProgressCsv(history, today, days);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-progress-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
