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
  // r326 — جفت‌هایِ عمیقِ سنجیده‌شده: جوهرِ سفید باید رویِ «هر دو استاپ»
  // ≥4.5 بماند و هر دو استاپ باید از بازنگشتِ توکنِ تاریک (
  // --color-sky-700→#7dd3fc و امثالش) مصون باشند — سویپِ کنتراستِ r326:
  // سفید رویِ from-amber-400 (عineٔ L2) = ۱٫۶۳ و در تاریکِ to-sky-800 = ۱٫۵۹.
  // پس tops ≥ -600/-700 (یا -900 برایِ sky/orange که توکنهایشان بازنگشته)
  // و bottoms همه -950 (مصون از توکن‌کرنل). سنجشِ پسااصلاح در qa-r326.
  // + سه کلیدِ جاافتادهٔ r198 (pink/blue/purple) که تا امروز به fallbackِ
  // stone-600 میافتادند — راندهای r198 کلیدشان را به نقشه اضافه نکردند.
  emerald: "bg-gradient-to-b from-emerald-700 to-emerald-950",
  amber: "bg-gradient-to-b from-amber-700 to-amber-950",
  rose: "bg-gradient-to-b from-rose-700 to-rose-950",
  violet: "bg-gradient-to-b from-violet-600 to-violet-950",
  sky: "bg-gradient-to-b from-sky-900 to-sky-950",
  teal: "bg-gradient-to-b from-teal-700 to-teal-950",
  // راند ۱۹۴ — عصب‌های جزوه‌های دهم
  orange: "bg-gradient-to-b from-orange-900 to-orange-950",
  indigo: "bg-gradient-to-b from-indigo-600 to-indigo-950",
  fuchsia: "bg-gradient-to-b from-fuchsia-700 to-fuchsia-950",
  pink: "bg-gradient-to-b from-pink-700 to-pink-950",
  blue: "bg-gradient-to-b from-blue-700 to-blue-950",
  purple: "bg-gradient-to-b from-purple-700 to-purple-950",
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
  // راند ۲۸۰ — چهار دستهٔ واقعاً ارسالی که تا امروز با کلیدِ خامِ انگلیسی
  // روی فید رندر می‌شدند (سرشماریِ منبع: categoryهای sendStats/QuizEngine
  // در برابرِ همین map) — گاردِ سرشماری در tests/feed-label-census-r280
  // هر دستهٔ تازهٔ بی-برچسب را می‌گیرد.
  smart: "تمرین هوشمند",
  "spell-rush": "املا برق‌آسا",
  review: "مرور سریع",
  "my-words": "مرور نشان‌شده‌ها",
  // r269 — دو دستهٔ پیکره‌ایِ دریلِ زنده (زبانِ پنجمِ سطح)؛ برگشت با
  // آشتیِ دو-نسلی r457 — کلیدِ خامِ انگلیسی روی فید ممنوع (r280).
  livewords: "دریل واژه‌های زنده",
  gramdrill: "دریل گرامر",
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
  /** r280 — the row owner's identity; the server already sent it (stats GET
   *  select + spread) and the feed now uses it to mark YOUR own rows with
   *  «(شما)» — exact match, immune to same-name collisions in a class. */
  userId?: string | null;
}
