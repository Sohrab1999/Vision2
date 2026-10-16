// Static Tailwind class maps per lesson color (avoid dynamic class names)

export interface LessonTheme {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  gradient: string;
  softText: string;
  chipBg: string;
  /** نوارِ لِجند/پیشرفتِ توپرِ همان خانواده — راند ۱۹۴ (دوناتِ نه‌درسی) */
  bar: string;
}

export const lessonTheme: Record<string, LessonTheme> = {
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-700",
    bgSoft: "bg-emerald-50",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-800",
    softText: "text-emerald-600",
    chipBg: "bg-emerald-100 text-emerald-800",
    bar: "bg-emerald-500",
  },
  amber: {
    text: "text-amber-700",
    bg: "bg-amber-700",
    bgSoft: "bg-amber-50",
    border: "border-amber-200",
    gradient: "from-amber-400 to-amber-700",
    softText: "text-amber-600",
    chipBg: "bg-amber-100 text-amber-800",
    bar: "bg-amber-500",
  },
  rose: {
    text: "text-rose-700",
    bg: "bg-rose-600",
    bgSoft: "bg-rose-50",
    border: "border-rose-200",
    gradient: "from-rose-500 to-rose-800",
    softText: "text-rose-600",
    chipBg: "bg-rose-100 text-rose-800",
    bar: "bg-rose-500",
  },
  violet: {
    text: "text-violet-700",
    bg: "bg-violet-700",
    bgSoft: "bg-violet-50",
    border: "border-violet-200",
    gradient: "from-violet-500 to-violet-800",
    softText: "text-violet-600",
    chipBg: "bg-violet-100 text-violet-800",
    bar: "bg-violet-500",
  },
  sky: {
    text: "text-sky-700",
    bg: "bg-sky-700",
    bgSoft: "bg-sky-50",
    border: "border-sky-200",
    gradient: "from-sky-500 to-sky-800",
    softText: "text-sky-600",
    chipBg: "bg-sky-100 text-sky-800",
    bar: "bg-sky-500",
  },
  teal: {
    text: "text-teal-700",
    bg: "bg-teal-700",
    bgSoft: "bg-teal-50",
    border: "border-teal-200",
    gradient: "from-teal-500 to-teal-800",
    softText: "text-teal-600",
    chipBg: "bg-teal-100 text-teal-800",
    bar: "bg-teal-500",
  },
  // راند ۱۹۴ — سه خانوادهٔ جزوه‌های دهم (Vision 1)
  orange: {
    text: "text-orange-700",
    bg: "bg-orange-700",
    bgSoft: "bg-orange-50",
    border: "border-orange-200",
    gradient: "from-orange-500 to-orange-800",
    softText: "text-orange-600",
    chipBg: "bg-orange-100 text-orange-800",
    bar: "bg-orange-500",
  },
  indigo: {
    text: "text-indigo-700",
    bg: "bg-indigo-700",
    bgSoft: "bg-indigo-50",
    border: "border-indigo-200",
    gradient: "from-indigo-500 to-indigo-800",
    softText: "text-indigo-600",
    chipBg: "bg-indigo-100 text-indigo-800",
    bar: "bg-indigo-500",
  },
  fuchsia: {
    text: "text-fuchsia-700",
    bg: "bg-fuchsia-700",
    bgSoft: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    gradient: "from-fuchsia-500 to-fuchsia-800",
    softText: "text-fuchsia-600",
    chipBg: "bg-fuchsia-100 text-fuchsia-800",
    bar: "bg-fuchsia-500",
  },
  // راند ۱۹۸ — سه خانوادهٔ جزوه‌های متوسطهٔ اول (Prospect 1-3)
  pink: {
    text: "text-pink-700",
    bg: "bg-pink-700",
    bgSoft: "bg-pink-50",
    border: "border-pink-200",
    gradient: "from-pink-500 to-pink-800",
    softText: "text-pink-600",
    chipBg: "bg-pink-100 text-pink-800",
    bar: "bg-pink-500",
  },
  blue: {
    text: "text-blue-700",
    bg: "bg-blue-700",
    bgSoft: "bg-blue-50",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-800",
    softText: "text-blue-600",
    chipBg: "bg-blue-100 text-blue-800",
    bar: "bg-blue-500",
  },
  purple: {
    text: "text-purple-700",
    bg: "bg-purple-700",
    bgSoft: "bg-purple-50",
    border: "border-purple-200",
    gradient: "from-purple-500 to-purple-800",
    softText: "text-purple-700",
    chipBg: "bg-purple-100 text-purple-800",
    bar: "bg-purple-500",
  },
};

export function themeOf(color: string): LessonTheme {
  return lessonTheme[color] ?? lessonTheme.emerald;
}

export const posLabel: Record<string, string> = {
  n: "اسم",
  v: "فعل",
  adj: "صفت",
  adv: "قید",
  prep: "حرف اضافه",
  phr: "عبارت",
  "phr.v": "فعل دوکلمه‌ای",
  conj: "حرف ربط",
  pron: "ضمیر",
};

/** Convert latin digits to Persian digits */
export function faNum(v: number | string): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(v).replace(/\d/g, (d) => fa[Number(d)]);
}

/**
 * Task 109 — ثانیه با یک اعشار و ممیزِ فارسی (٫)؛ null → «—».
 * پیش‌تر دو نسخهٔ محلیِ یکسان در duel-done (secFa) و duel-setup (secThinkFa)
 * زندگی می‌کردند؛ از امروز یک قراردادِ مشترک است — کارنامهٔ نبرد، چیپِ
 * دفترچه و خطِ «فکرِ هفته» در هفته‌نامه هر سه همین را می‌خوانند.
 * گردکردنِ مرزی: ۶۴۹ms → «۰٫۶» و ۶۵۰ms → «۰٫۷».
 */
export function secFa(ms: number | null): string {
  if (ms === null) return "—";
  return faNum((Math.round(ms / 100) / 10).toFixed(1)).replace(".", "٫");
}

/** Persian relative time ("۳ دقیقه پیش") from an ISO date */
export function timeAgoFa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "لحظاتی پیش";
  if (m < 60) return `${faNum(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faNum(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${faNum(d)} روز پیش`;
  return `${faNum(Math.floor(d / 30))} ماه پیش`;
}

// گرادیان آواتار per رنگ — قبلاً در header.tsx زندگی می‌کرد؛ اکنون ثابت مشترک
// است (header، onboarding، rush-board، avatar-dot) — گام ۷.۲-ج §12
export const avatarClasses: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-emerald-700/30",
  amber: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-600/30",
  rose: "bg-gradient-to-br from-rose-400 to-rose-700 shadow-rose-700/30",
  violet: "bg-gradient-to-br from-violet-400 to-purple-700 shadow-purple-700/30",
  sky: "bg-gradient-to-br from-sky-400 to-cyan-700 shadow-cyan-700/30",
  orange: "bg-gradient-to-br from-orange-400 to-orange-700 shadow-orange-700/30",
  indigo: "bg-gradient-to-br from-indigo-400 to-indigo-700 shadow-indigo-700/30",
  fuchsia: "bg-gradient-to-br from-fuchsia-400 to-fuchsia-700 shadow-fuchsia-700/30",
  // راند ۱۹۸ — متوسطهٔ اول
  pink: "bg-gradient-to-br from-pink-400 to-pink-700 shadow-pink-700/30",
  blue: "bg-gradient-to-br from-blue-400 to-blue-700 shadow-blue-700/30",
  purple: "bg-gradient-to-br from-purple-400 to-purple-700 shadow-purple-700/30",
};

// راند ۲۳۹ — حلقهٔ کیبوردِ واحدِ درهایِ «ادامهٔ مطالعه» (بندِ ② پیشنهادِ ۲۳۸):
// یک قرارداد در همهٔ درهایی که رکوردِ «ادامه» را نشان می‌دهند و با Tab
// قابلِ رسیدن‌اند — کارتِ ضمیمهٔ خانه + چیپ‌هایِ سینیِ «اخیراً»، دکمهٔ هدر،
// نشانگرِ سرِ ضمیمه + چیپِ «مسیرِ اخیر»، و دکمهٔ «ادامه» + ردیف‌هایِ
// تاریخچه در پروفایل. درِ فرمان‌یاب مستثناست: ردیف‌هایش هرگز فوکوس
// نمی‌گیرند (الگوی aria-activedescendant — هایلایتِ ردیف با کلیدهایِ
// جهت است) و حلقه رویشان هرگز دیده نمی‌شود.
// ring-offset با رنگِ سطحِ هر تم — تا حلقه رویِ کارتِ سفید و سطوحِ
// تیره به‌یک اندازه خوانا بماند.
export const RESUME_FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900";
