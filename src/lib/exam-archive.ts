// ------------------------------------------------------------------
// «دفترچهٔ آزمون» — آرشیو محلیِ سشن‌های آزمون جامع (راند ۲۷۲).
//
// شکاف واقعی: اسلایس results عمداً فقط «بهترین نتیجهٔ هر کلید» را نگه
// می‌دارد (قرارداد چیپ‌های خانه) — یعنی بعد از پایان یک آزمون، نتیجه
// فقط یک‌بار دیده می‌شود و هیچ تاریخچه‌ای از کارنامه‌ها نمی‌ماند. این
// ماژول همان تاریخچه است: هر سشنِ تمام‌شدهٔ آزمون (جامع/پایان‌ترم/مرور
// اشتباهات) یک رکورد فشرده می‌گیرد.
//
// چرا store نیست؟ قرارداد nav-prefill (Task 69): کمک‌تابع storage مستقیم،
// node-safe، بدون دست‌زدن به اسکیمای persist و بدون سینک ابری — دفترچه
// «این دستگاه» است و با کد یادگیرنده سفر نمی‌کند (سند شده در worklog).
//
// پایداری: ورودیِ خوانده‌شده از localStorage ورودیِ ناموثق است — هر رکورد
// فیلدبه‌فیلد اعتبارسنجی و clamp می‌شود؛ JSON خراب = آرشیو خالی، نه کرش
// (هم‌فلسفهٔ parseBackup و sanitizeDuelHistory).
// ------------------------------------------------------------------

export interface ExamArchiveEntry {
  /** پایان سشن — Date.now() */
  ts: number;
  /** نوع سشن — همان kind جلسهٔ exam-view */
  kind: "exam" | "final" | "exam-mistakes";
  /** عنوان سشن (فارسی، همان هدر QuizEngine) */
  title: string;
  total: number;
  correct: number;
  percent: number;
  /** سشن تایم‌دار بود؟ */
  timed: boolean;
  /** ترکیب منبع سؤال‌ها — کلید گروه (l1/l2/l3/x) → تعداد */
  mix: Record<string, number>;
}

export const EXAM_ARCHIVE_KEY = "vision2-exam-archive";
export const EXAM_ARCHIVE_CAP = 40;
/** سقف ذاتی هر فیلد متنی — دفترچه دفترچه است، نه پایگاه داده */
const TITLE_MAX = 80;
const MAX_TOTAL = 1000;

/** رویداد پنجره‌ای پس از هر تغییر — پنلِ باز بدون remount تازه می‌شود */
export const EXAM_ARCHIVE_EVENT = "exam-archive-updated";

const KINDS: ReadonlySet<string> = new Set(["exam", "final", "exam-mistakes"]);

/** clamp عدد به بازهٔ [min,max]؛ غیرعددی → fallback */
function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * پالایش یک رکورد خام — هر فیلد جداگانه؛ رکورد ناقص = دور انداختن.
 * خروجی همیشه یک ExamArchiveEntry معتبر است یا undefined.
 */
export function sanitizeExamEntry(raw: unknown): ExamArchiveEntry | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  const ts = clampNum(r.ts, 0, Number.MAX_SAFE_INTEGER, 0);
  if (ts <= 0) return undefined; // بدون مهر زمان بی‌معناست
  if (typeof r.kind !== "string" || !KINDS.has(r.kind)) return undefined;
  const total = clampNum(r.total, 1, MAX_TOTAL, 0);
  const correct = clampNum(r.correct, 0, total, 0);
  if (total <= 0) return undefined;
  const title = typeof r.title === "string" && r.title.trim() ? r.title.trim().slice(0, TITLE_MAX) : "آزمون جامع";
  const percent = clampNum(r.percent, 0, 100, Math.round((correct / total) * 100));
  const mix: Record<string, number> = {};
  if (typeof r.mix === "object" && r.mix !== null) {
    for (const [k, v] of Object.entries(r.mix as Record<string, unknown>)) {
      const n = clampNum(v, 0, MAX_TOTAL, 0);
      if (n > 0) mix[k.slice(0, 8)] = n;
    }
  }
  return { ts, kind: r.kind as ExamArchiveEntry["kind"], title, total, correct, percent, timed: r.timed === true, mix };
}

/**
 * پالایش آرایهٔ خام: رکوردهای خراب حذف، تکرارِ ts حذف (اولی می‌ماند)،
 * نزولیِ زمان، سقف CAP.
 */
export function sanitizeExamArchive(raw: unknown): ExamArchiveEntry[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<number>();
  const out: ExamArchiveEntry[] = [];
  for (const item of raw) {
    const e = sanitizeExamEntry(item);
    if (!e || seen.has(e.ts)) continue;
    seen.add(e.ts);
    out.push(e);
  }
  out.sort((a, b) => b.ts - a.ts);
  return out.slice(0, EXAM_ARCHIVE_CAP);
}

/** خواندن دفترچه — node-safe؛ خرابی خواندن/تجزیه = آرشیو خالی */
export function loadExamArchive(): ExamArchiveEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXAM_ARCHIVE_KEY);
    if (!raw) return [];
    return sanitizeExamArchive(JSON.parse(raw));
  } catch {
    return [];
  }
}

function dispatchUpdated(): void {
  try {
    window.dispatchEvent(new CustomEvent(EXAM_ARCHIVE_EVENT));
  } catch {
    /* محیط بدون رویداد — نادیده */
  }
}

/** ثبت سشن تمام‌شده — prepend + سقف ۴۰ + رویداد؛ quota error نادیده */
export function recordExamSession(entry: ExamArchiveEntry): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeExamEntry(entry);
  if (!safe) return;
  try {
    const prev = loadExamArchive();
    // همان ts = همان سشن (دوباره‌ثبتی) — سکوت
    if (prev.some((e) => e.ts === safe.ts)) return;
    const next = [safe, ...prev].slice(0, EXAM_ARCHIVE_CAP);
    window.localStorage.setItem(EXAM_ARCHIVE_KEY, JSON.stringify(next));
    dispatchUpdated();
  } catch {
    /* حالت خصوصی/سهمیه پر — دفترچه هرگز نباید مسیر آزمون را بشکند */
  }
}

/** پاک‌کردن دفترچه (دکمهٔ «خالی کردن» با تأیید دومرحله‌ای در پنل) */
export function clearExamArchive(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(EXAM_ARCHIVE_KEY);
    dispatchUpdated();
  } catch {
    /* نادیده */
  }
}

export interface ExamArchiveStats {
  count: number;
  /** میانگین درصد همهٔ سشن‌ها */
  avg: number;
  /** بهترین درصد */
  best: number;
  /** روند: درصد تازه‌ترین منهای کهنه‌ترین (مثبت = پیشرفت) */
  delta: number;
}

/** آمار خلاصه برای چیپ‌های پنل — روی ورودیِ پالایه‌شده */
export function archiveStats(entries: ExamArchiveEntry[]): ExamArchiveStats {
  if (entries.length === 0) return { count: 0, avg: 0, best: 0, delta: 0 };
  const n = entries.length;
  const avg = Math.round(entries.reduce((s, e) => s + e.percent, 0) / n);
  const best = entries.reduce((m, e) => Math.max(m, e.percent), 0);
  // نزولیِ زمان: [0] تازه‌ترین، [n-1] کهنه‌ترین
  const delta = entries[0].percent - entries[n - 1].percent;
  return { count: n, avg, best, delta };
}

/**
 * خلاصهٔ فارسی ترکیب منابع — «۱۰× بانک ۳۶۰ · ۵× درس اول».
 * کلید ناشناخته → خود کلید؛ ترتیب کلیدهای حاضر در mix حفظ می‌شود.
 */
export function mixSummaryFa(mix: Record<string, number>, labels: Record<string, string>): string {
  const parts: string[] = [];
  for (const [k, n] of Object.entries(mix)) {
    if (n <= 0) continue;
    parts.push(`${faDigits(n)}× ${labels[k] ?? k}`);
  }
  return parts.join(" · ");
}

/** ارقام فارسی محلی (هم‌خانوادهٔ faNum — اینجا تا ماژول self-contained بماند) */
function faDigits(v: number | string): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(v).replace(/\d/g, (d) => fa[Number(d)]);
}

/**
 * مهر زمانی فارسی — «۱۴۰۵/۸/۱۴ · ۱۸:۳۰». Intl فارسی در همهٔ موتورهای هدف
 * در دسترس است؛ خرابی → fallback دستی (تاریخ میلادی با ارقام فارسی).
 */
export function faArchiveStamp(ts: number): string {
  try {
    const d = new Date(ts);
    const date = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "numeric", day: "numeric" }).format(d);
    const time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    return `${date} · ${time}`;
  } catch {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return faDigits(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`);
  }
}
