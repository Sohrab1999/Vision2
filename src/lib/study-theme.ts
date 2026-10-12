// Static Tailwind class maps per lesson color (avoid dynamic class names)

export interface LessonTheme {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  gradient: string;
  softText: string;
  chipBg: string;
}

export const lessonTheme: Record<string, LessonTheme> = {
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-600",
    bgSoft: "bg-emerald-50",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-800",
    softText: "text-emerald-600",
    chipBg: "bg-emerald-100 text-emerald-800",
  },
  amber: {
    text: "text-amber-700",
    bg: "bg-amber-500",
    bgSoft: "bg-amber-50",
    border: "border-amber-200",
    gradient: "from-amber-400 to-amber-700",
    softText: "text-amber-600",
    chipBg: "bg-amber-100 text-amber-800",
  },
  rose: {
    text: "text-rose-700",
    bg: "bg-rose-600",
    bgSoft: "bg-rose-50",
    border: "border-rose-200",
    gradient: "from-rose-500 to-rose-800",
    softText: "text-rose-600",
    chipBg: "bg-rose-100 text-rose-800",
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
};
