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
