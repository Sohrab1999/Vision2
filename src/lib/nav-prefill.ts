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

// ------------------------------------------------------------------
// prefillِ بولی (Task 71) — صفت زمان فرمان‌های پارامتری:
// «آزمون ۲۰ بدون زمان» باید هم تعداد و هم وضعیت تایمر را به نما برساند.
// هم‌قرارداد با readCountPrefill: initializer غیرمخرب useState می‌خواند،
// نما در هر دو مسیر (mount + رویداد) مصرفِ یک‌بارمصرف می‌کند.
// ------------------------------------------------------------------

/** کلیدهای صفت زمان — مرکزی تا پالت و نما هم‌کلید بمانند */
export const EXAM_TIMED_KEY = "vision2-exam-timed-prefill";
export const KONKUR_TIMED_KEY = "vision2-konkur-timed-prefill";

/** خواندن بولی از کلید prefill («1»/«0»)؛ نبود/نامعتبر → null (node-safe) */
export function readFlagPrefill(key: string): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === "1") return true;
    if (raw === "0") return false;
    return null;
  } catch {
    return null;
  }
}

/** نوشتن بولی در کلید prefill (پالت، هنگام اجرای فرمان) */
export function writeFlagPrefill(key: string, v: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, v ? "1" : "0");
  } catch {
    /* حالت خصوصی مرورگر — نادیده */
  }
}

/** پاک‌کردن prefill بولی پس از مصرف (نما، در اولین اثر — بدون setState) */
export function clearFlagPrefill(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* نادیده */
  }
}

// ------------------------------------------------------------------
// prefillِ رشته‌ای — جست‌وجوی کتابخانهٔ جزوه‌ها: پالت/کتاب پرسشِ جست‌وجو را
// به نمای جست‌وجو می‌دهند (LIBSEARCH_Q_KEY). هم‌قراردادِ Count/Boolean:
// initializer غیرمخرب useState می‌خواند، نما در نخستین اثر مصرفِ
// یک‌بارمصرف میکند (خواندن سپس پاک‌کردن — بدونِ setState).
// ------------------------------------------------------------------

/** کلیدِ prefillِ پرسشِ جست‌وجوی جزوه — تکخانه (هم پالت هم نما همین را می‌خوانند) */
export const LIBSEARCH_Q_KEY = "vision2-prefill-libsearch-q";

/** خواندن رشته از کلید prefill؛ نبود/تهی → null (node-safe) */
export function readStringPrefill(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return null;
    const v = raw.trim();
    return v === "" ? null : v;
  } catch {
    return null;
  }
}

/** نوشتن رشته در کلید prefill (پالت/کتاب، هنگام اجرای فرمان) */
export function writeStringPrefill(key: string, v: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, v);
  } catch {
    /* حالت خصوصی مرورگر — نادیده */
  }
}

/** پاک‌کردن prefillِ رشتهای پس از مصرف (نما، در اولین اثر — بدونِ setState) */
export function clearStringPrefill(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* نادیده */
  }
}
