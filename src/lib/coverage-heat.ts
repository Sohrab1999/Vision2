// ------------------------------------------------------------------
// تسک ۱۷۵ «گریدِ حرارتیِ پوشش» — خالص و بی‌UI، رویِ شانهٔ libِ ۱۷۴.
// طبقه‌بندِ نوارِ حرارت: مرزها فقط از جدولِ یخ‌زدهٔ HEAT_BANDS خوانده
// می‌شوند (تک‌قرارداد — نثرِ راهنما و تست از همین جدول می‌خورند).
// سرد = هرگز-تلاش‌نشده؛ هیچ‌وقت عددِ ساختگی نمی‌سازد — NaN/تهی/بی‌کران
// همه «cold»، نه صفرِ دروغین. برچسب‌هایِ کوتاهِ سرستون با کلیدهایِ
// COVERAGE_SKILLS دوسویه سیم‌کشی شده‌اند (تستِ تقارن).
// خالص: هیچ Date.now()/Math.random() — ورودی همان خروجیِ buildCoverageMap.
// ------------------------------------------------------------------

import { COVERAGE_SKILLS, type CoverageLesson } from "./coverage-map";

/** نوارهایِ حرارت — صعودی بر مرزِ min؛ بالاترین نوارِ برخورده برنده است */
export const HEAT_BANDS = Object.freeze([
  { id: "faint", min: 0, label: "نوپا" },
  { id: "warming", min: 50, label: "درِ حالِ رشد" },
  { id: "strong", min: 75, label: "خوب" },
  { id: "elite", min: 90, label: "عالی" },
] as const);

export type HeatBandId = (typeof HEAT_BANDS)[number]["id"] | "cold";

/** سلولِ سرد — مستقل از نوارها چون عددی پشتِ آن نیست */
export const HEAT_COLD = { id: "cold", label: "تلاش نشده" } as const;

/**
 * برچسبِ کوتاهِ سرستونِ ماتریس — کلیدها باید با COVERAGE_SKILLS یکی باشند.
 * r316 — سنجشِ واقعیِ ۳۹۰px (اسکریپتِ qa-r316-overflow-sweep): خانهٔ سرستون
 * در موبایل ۲۶px بود و چهار برچسبِ بلند (واژگان ۳۲ / شنیداری ۴۰ / نگارش ۳۱ /
 * کنکوری ۳۵) سرریزِ چسبان داشتند — سرستونها در تصویرِ واقعی به هم میچسبیدند.
 * با کپِ ستونِ عنوان (minmax(0,64px) در موبایل) بودجهٔ هر خانه به ۳۴px رسید؛
 * «شنیداری» (۴۰) و «کنکوری» (۳۵) در ۳۴ جا نمی‌شوند → فرمِ کوتاهِ واقعی:
 * شنوا و کنکور. نامِ کامل همیشه در tooltipِ همان سرستون است (title={sk.label})
 * و برچسبهای کامل در COVERAGE_SKILLS دست‌نخورده‌اند.
 */
export const COVERAGE_SKILL_SHORT: Readonly<Record<string, string>> = {
  vocab: "واژگان",
  dictation: "دیکته",
  listening: "شنوا",
  writing: "نگارش",
  "vocab-konkuri": "کنکور",
  grammar: "گرامر",
};

/** ورودیِ خراب → cold (صادقانه)؛ بیرونِ ۰..۱۰۰ → گیرِ کران، بعدِ نوار */
export function classifyHeat(pct: number | null | undefined): HeatBandId {
  if (typeof pct !== "number" || !Number.isFinite(pct)) return "cold";
  const v = Math.max(0, Math.min(100, pct));
  for (let i = HEAT_BANDS.length - 1; i >= 0; i--) {
    if (v >= HEAT_BANDS[i].min) return HEAT_BANDS[i].id;
  }
  return "faint";
}

export interface HeatSummary {
  totalCells: number;
  attemptedCells: number;
  /** میانگینِ بهترین‌ها فقط رویِ سلول‌هایِ تلاش‌شده — هیچ‌تلاش → null */
  avgBest: number | null;
}

/** خلاصهٔ ماتریس: شمارشِ صادقانه + میانگینِ بهترینِ ثبت‌شده (گرد شده) */
export function heatSummary(lessons: CoverageLesson[]): HeatSummary {
  const bests: number[] = [];
  for (const l of lessons) {
    for (const c of l.cells) {
      if (c.best !== null) bests.push(c.best);
    }
  }
  const totalCells = lessons.reduce((s, l) => s + l.cells.length, 0);
  const attemptedCells = bests.length;
  const avgBest =
    attemptedCells > 0
      ? Math.round(bests.reduce((s, v) => s + v, 0) / attemptedCells)
      : null;
  return { totalCells, attemptedCells, avgBest };
}
