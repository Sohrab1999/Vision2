/**
 * Pure domain — grade ladder (audit §10 R-6).
 *
 * نردبان نمره در همهٔ سطوح یکی است: ۹۰+ عالی، ۷۰+ خوب، ۵۰+ بد نیست،
 * پایین‌تر ضعف — و رنگ‌ها همیشه زمردی/زمردی/کهربایی/گلگلی. تنها پیام‌ها
 * برای هر سطح مال خودش است (تست عمومی، شنیداری، …). قبل از این ماژول
 * همین نردبان ۴ سطحه در چند نقطه دستی تکرار شده بود و رنگ‌ها در معرض
 * واگرایی بودند.
 */

export type GradeLevel = "elite" | "good" | "ok" | "weak";

export interface Grade {
  level: GradeLevel;
  msg: string;
  /** tailwind text color of the grade line */
  cls: string;
}

export interface GradeCopy {
  elite: string;
  good: string;
  ok: string;
  weak: string;
}

/** پیام‌های عمومی موتور تست */
export const GENERIC_GRADE_COPY: GradeCopy = {
  elite: "فوق‌العاده! تو یک قهرمان زبان انگلیسی‌ای! 🏆",
  good: "خیلی خوب! با کمی تمرین بیشتر به عالی می‌رسی.",
  ok: "بد نیست! نکات گرامری و واژگان را دوباره مرور کن.",
  weak: "نیاز به تمرین بیشتر داری. فلش‌کارت‌ها را مرور کن!",
};

const LEVEL_CLS: Record<GradeLevel, string> = {
  elite: "text-emerald-600",
  good: "text-emerald-600",
  ok: "text-amber-600",
  weak: "text-rose-600",
};

/** نردبان ۹۰/۷۰/۵۰ با رنگ‌های واحد — پیام‌ها قابل‌سفارشی‌سازی */
export function gradeFor(percent: number, copy: Partial<GradeCopy> = {}): Grade {
  const c = { ...GENERIC_GRADE_COPY, ...copy };
  const level: GradeLevel = percent >= 90 ? "elite" : percent >= 70 ? "good" : percent >= 50 ? "ok" : "weak";
  return { level, msg: c[level], cls: LEVEL_CLS[level] };
}
