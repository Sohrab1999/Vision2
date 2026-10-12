// ------------------------------------------------------------------
// پل «فرمان پارامتری → نما» (Task 69).
// پالت مقدار را می‌خواهد به یک نمای lazy بدهد (مثلاً «آزمون ۲۰»)؛
// رویداد پنجره‌ای کافی نیست چون نما ممکن است هنوز mount نشده باشد
// (AnimatePresence خروج + بارگذاری chunk = رویداد گم می‌شود). پس
// مقدار در sessionStorage می‌نشیند و نما در نخستین رندر (initializer
// غیرمخرب — هم‌الگوی loadRecents پالت) می‌خواند؛ رویداد پنجره‌ای هم
// برای وقتی که نما همین حالا باز است همراهی می‌کند.
// ------------------------------------------------------------------

/** خواندن عددِ معتبر از کلید prefill؛ نبود/نامعتبر → null (node-safe) */
export function readCountPrefill(key: string, allowed: readonly number[]): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || !allowed.includes(n)) return null;
    return n;
  } catch {
    return null;
  }
}

/** نوشتن مقدار prefill (پالت، هنگام اجرای فرمان) */
export function writeCountPrefill(key: string, n: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, String(n));
  } catch {
    /* حالت خصوصی مرورگر — نادیده */
  }
}

/** پاک‌کردن prefill پس از مصرف (نما، در اولین اثر — بدون setState) */
export function clearCountPrefill(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* نادیده */
  }
}
