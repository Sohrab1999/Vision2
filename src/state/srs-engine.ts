// گام ۸ §12 — موتور تکرار فاصله‌دار (خالص)
// نردبان SM-2-lite + شمارنده‌های سررسید + رزولوشن اولین درس سررسید.
// konkurSrsEntry نگاشت «سؤال کنکور → کلید q:» را هم همین‌جا متمرکز می‌کند
// (اسلایس konkur در markKonkur مصرفش می‌کند — F11).

import type { SrsItem } from "./types";
import { faNum } from "@/lib/time-fa";

export const SRS_INTERVALS = [
  15 * 60_000, // 15 دقیقه
  86_400_000, // ۱ روز
  3 * 86_400_000, // ۳ روز
  7 * 86_400_000, // ۱ هفته
  14 * 86_400_000, // ۲ هفته
  30 * 86_400_000, // ۱ ماه
];

export const SRS_LABELS = ["۱۵ دقیقه", "۱ روز", "۳ روز", "۱ هفته", "۲ هفته", "۱ ماه"];

// ---------------------------------------------------------------
// راند ۳۹۲ — قراردادِ «سطح N از ۶» یک نام گرفت (سرشماریِ ۵ متن + ۱ نردبانِ نقطه)
// ---------------------------------------------------------------
// سرشماریِ برچسبِ سطحِ مرور: قالبِ «سطح {faNum(level+1)} از ۶» در ۴ متنِ نما
// تکرار میشد — سه جا با «۶»یِ هاردکد (srs-panel ×۲ و جملهٔ فلش‌کارت) و یکجا
// با مشتقِ درست از SRS_INTERVALS.length (danger-words). حقیقتِ مخرج همان
// SRS_INTERVALS.length است (دو گیتِ clamp در srs-engine/srs رویِ length-۱اند)
// — اگر روزی نردبان بلندتر شود، danger «از ۷» میگفت و بقیه «از ۶»: کلاسِ
// «سندِ دروغ»ِ حکمِ موافقتِ r383 (مخرج باید یکجا زندگی کند — سابقهٔ
// badgeFractionFa در r387). نردبانِ نقطههایِ فلش‌کارت هم طولِ ۶ هاردکد داشت.
// مالک: همین موتور — هم SRS_INTERVALS را می‌مالد هم برچسبش را؛ faNum از
// مالکِ قالبِ فارسی (r385) میآید — ماژول خالص میماند.
//
// حکمهای «نخیر»ِ سرشماری:
// ① titleِ «سطح مرور: N — بعدی: LABEL» فلش‌کارت گویشِ دیگری است (سطحِ تنها
//    + سررسیدِ بعدی، بی «از M») — مستند، نه خطا.
// ② نردبانِ نقطهها از SRS_INTERVALS.length مشتق میشود (نه از srsLevelFa) —
//    شکلِ آن نقطه است نه برچسب؛ رجیستریِ خودِ موتور کافی است.
export const srsLevelFa = (level: number): string =>
  `سطح ${faNum(level + 1)} از ${faNum(SRS_INTERVALS.length)}`;

export function srsDueCount(srs: Record<string, SrsItem>, lessonId: number): number {
  const now = Date.now();
  const prefix = `${lessonId}:`;
  return Object.entries(srs).filter(([k, v]) => k.startsWith(prefix) && v.dueAt <= now).length;
}

/** ids of exam-bank questions (key prefix "q:") whose review is due now */
export function srsQuestionDueIds(srs: Record<string, SrsItem>): string[] {
  const now = Date.now();
  return Object.entries(srs)
    .filter(([k, v]) => k.startsWith("q:") && v.dueAt <= now)
    .map(([k]) => k.slice(2));
}

export function srsQuestionDueTotal(srs: Record<string, SrsItem>): number {
  const now = Date.now();
  return Object.entries(srs)
    .filter(([k, v]) => k.startsWith("q:") && v.dueAt <= now).length;
}

/** all-time words-only due count (F11: exam-bank questions ride the same
 *  store under "q:" keys but must not pollute the vocabulary widgets) */
export function srsDueTotal(srs: Record<string, SrsItem>): number {
  const now = Date.now();
  return Object.entries(srs).filter(([k, v]) => !k.startsWith("q:") && v.dueAt <= now).length;
}

export function firstLessonWithDue(srs: Record<string, SrsItem>): number | null {
  for (const id of [1, 2, 3]) {
    if (srsDueCount(srs, id) > 0) return id;
  }
  return null;
}

/**
 * F11 «SRS کنکور» — یک قدم از نردبان برای کلید "q:<id>".
 * پاسخ غلط → پلهٔ صفر (۱۵ دقیقه)؛ پاسخ درست → فقط وقتی واقعاً سررسیده بود
 * یک پله بالا (تدریس زودهنگامِ ستِ سخت سطح را ناروا بالا نمی‌برد)؛
 * اولین‌بار-درست هرگز وارد صف نمی‌شود.
 * خروجی: undefined = بدون تغییر (بدون کلون — مسیر بی‌اثر ارزان می‌ماند).
 */
export function konkurSrsEntry(
  srs: Record<string, SrsItem>,
  id: string,
  ok: boolean,
  now = Date.now()
): Record<string, SrsItem> | undefined {
  const qk = `q:${id}`;
  if (!ok) {
    return { ...srs, [qk]: { level: 0, dueAt: now + SRS_INTERVALS[0] } };
  }
  const cur = srs[qk];
  if (cur && cur.dueAt <= now) {
    const level = Math.min(cur.level + 1, SRS_INTERVALS.length - 1);
    return { ...srs, [qk]: { level, dueAt: now + SRS_INTERVALS[level] } };
  }
  return undefined;
}
