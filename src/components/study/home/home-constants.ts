// ------------------------------------------------------------------
// ثابت‌ها و برچسب‌های صفحهٔ خانه — بین نمای‌های home/ مشترک است.
// ------------------------------------------------------------------

// راند ۱۹۵ — برچسب‌های آزمون پایان‌ترمِ سه‌پایه از یک منبعِ واحد می‌آیند
// (lib/domain/final-exam) تا کلیدهای final-10/final-12 روی فید خانه
// هرگز با برچسبِ خالی یا کلیدِ خام رندر نشوند.
import { FINAL_GRADES } from "@/lib/domain/final-exam";

const finalGradeLabels: Record<string, string> = Object.fromEntries(
  FINAL_GRADES.filter((g) => g.resultKey !== "final").map((g) => [g.resultKey, `آزمون پایان‌ترم ${g.label}`]),
);

// راند ۲۰۰ — برچسب‌های دیکتهٔ پایه‌محور: کلیدِ نتیجهٔ «exam-g10:dictation» و
// دستهٔ آماریِ «dict-g10» هرگز با برچسبِ خالی یا کلیدِ خام رندر نمی‌شوند
// (هم‌الگوی finalGradeLabels — از FINAL_GRADES تولید می‌شوند).
const gradeDictKeyLabels: Record<string, string> = Object.fromEntries(
  FINAL_GRADES.map((g) => [`exam-${g.id}:dictation`, `دیکتهٔ واژگان ${g.label}`]),
);
const gradeDictCategoryLabels: Record<string, string> = Object.fromEntries(
  FINAL_GRADES.map((g) => [`dict-${g.id}`, `دیکتهٔ واژگان ${g.label}`]),
);

// راند ۲۰۰ — دسته‌های آماریِ دیکته‌های شخصیِ قدیمی هم تا امروز روی فیدِ خانه
// با کلیدِ خام رندر می‌شدند («exam-dictation» بی‌برچسب) — حالا برچسبِ فارسی دارند.
const personalDictCategoryLabels: Record<string, string> = {
  "exam-dictation": "دیکتهٔ بانک آزمون",
  "my-words-dictation": "دیکتهٔ نشان‌شده‌ها",
  "danger-dictation": "دیکتهٔ واژه‌های خطرناک",
  "srs-due-dictation": "دیکتهٔ مرورِ سررسید",
};

export const spineColors: Record<string, string> = {
  emerald: "bg-gradient-to-b from-emerald-500 to-emerald-800",
  amber: "bg-gradient-to-b from-amber-400 to-amber-700",
  rose: "bg-gradient-to-b from-rose-500 to-rose-800",
  violet: "bg-gradient-to-b from-violet-500 to-violet-800",
  sky: "bg-gradient-to-b from-sky-500 to-sky-800",
  teal: "bg-gradient-to-b from-teal-500 to-teal-800",
  // راند ۱۹۴ — عصب‌های جزوه‌های دهم
  orange: "bg-gradient-to-b from-orange-500 to-orange-800",
  indigo: "bg-gradient-to-b from-indigo-500 to-indigo-800",
  fuchsia: "bg-gradient-to-b from-fuchsia-500 to-fuchsia-800",
};

// motivational one-liner per lesson card, from the known-vocab percentage
export function lessonCheer(p: number): string {
  if (p >= 90) return "🏆 درخشان! تقریباً همهٔ واژه‌ها را بلدی";
  if (p >= 70) return "🌟 عالی پیش می‌روی — ادامه بده";
  if (p >= 40) return "🌱 داری رشد می‌کنی — همین‌طور برو";
  if (p > 0) return "🚀 شروع خوبی است — فلش‌کارت‌ها منتظرند";
  return "✨ از فلش‌کارت‌ها شروع کن";
}

export const categoryLabel: Record<string, string> = {
  vocab: "واژگان استاندارد",
  "vocab-konkuri": "واژگان کنکوری",
  grammar: "گرامر و نگارش",
  writing: "تمرین نگارش",
  dictation: "آزمون دیکته",
  listening: "تمرین شنیداری",
  danger: "واژه‌های خطرناک",
  exam: "آزمون جامع",
  final: "آزمون پایان ترم",
  ...finalGradeLabels,
  ...gradeDictCategoryLabels,
  ...personalDictCategoryLabels,
  mixed: "تست ترکیبی درس",
  mistakes: "مرور اشتباهات",
  synant: "مترادف و متضاد",
  rush: "چالش برق‌آسا",
  duel: "نبرد دودنفره",
  konkur: "شبیه‌ساز کنکور",
  "konkur-hard": "تست‌های سخت من",
  "konkur-cover": "پوشش بانک ۳۶۰",
};

// friendly titles for lesson-LESS result keys ("exam", "review", "my-words"…)
// — previously these cards rendered with an empty label on the home feed
export const globalResultLabel: Record<string, string> = {
  exam: "آزمون جامع",
  final: "آزمون پایان ترم",
  ...finalGradeLabels,
  ...gradeDictKeyLabels,
  review: "مرور سریع قبل امتحان",
  rush: "چالش برق‌آسا",
  "my-words": "مرور واژه‌های نشان‌شده",
  // راند ۲۰۷ — دریلِ جفت‌ها از لنزِ «جفت‌دار» دیکشنری (کلیدِ 0:synant)
  "0:synant": "دریل جفت‌ها",
};

// and their card theme (lesson cards take their own lesson color instead)
export const globalResultTheme: Record<string, "emerald" | "amber" | "rose" | "violet"> = {
  exam: "emerald",
  final: "emerald",
  ...Object.fromEntries(FINAL_GRADES.filter((g) => g.resultKey !== "final").map((g) => [g.resultKey, "emerald" as const])),
  // راند ۲۰۰ — کارتِ آخرین‌نتیجهٔ دیکتهٔ پایه‌محور هم زمردی (هم‌خانوادهٔ دیکته‌ها)
  ...Object.fromEntries(FINAL_GRADES.map((g) => [`exam-${g.id}:dictation`, "emerald" as const])),
  review: "amber",
  "my-words": "amber",
  rush: "rose",
  // راند ۲۰۷ — کارتِ دریلِ جفت‌ها بنفش (هم‌رنگِ لنزِ «جفت‌دار»)
  "0:synant": "violet" as const,
};

// compact labels for the live feed rows
export const feedLabel: Record<string, string> = {
  vocab: "واژگان",
  "vocab-konkuri": "واژگان کنکوری",
  grammar: "گرامر",
  writing: "نگارش",
  dictation: "دیکته",
  listening: "شنیداری",
  danger: "واژه‌های خطرناک",
  exam: "آزمون جامع",
  final: "آزمون پایان ترم",
  ...finalGradeLabels,
  ...gradeDictCategoryLabels,
  ...personalDictCategoryLabels,
  mixed: "تست ترکیبی",
  mistakes: "مرور اشتباهات",
  synant: "مترادف و متضاد",
  rush: "چالش برق‌آسا",
  duel: "نبرد دو‌نفره",
  konkur: "شبیه‌ساز کنکور",
  "konkur-hard": "تست‌های سخت",
  "konkur-cover": "پوشش بانک ۳۶۰",
};

export interface RecentAttempt {
  lesson: number;
  category: string;
  total: number;
  correct: number;
  percent: number;
  createdAt: string;
  name?: string | null;
  color?: string | null;
}
