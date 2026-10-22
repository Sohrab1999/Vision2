// راند ۳۰۴ «ماه‌نامهٔ خواندن» — نگاهِ ۳۰روزه به داستان‌های کتاب‌خانه.
// هم‌خانوادهٔ library-streak (r301): توابعِ خالص، کلیدِ روز توسطِ فراخوان
// داده میشود تا آزمونِ مرزی با کلیدِ ثابت قفل شود؛ هیچ Dateِ داخلی و هیچ
// شمارشِ موازی‌ای نیست.
//
// منبعِ یگانه: dayHistory.stories (از r299؛ هر اتمامِ داستان حتی بازخوانی).
// همین منبع با چیپِ خانه، سربرگِ کتاب‌خانه، هفته‌نامه و کارتِ PNG مشترک است.
//
// پنجره: ۳۰ خانه (شاملِ امروز) — کهنه‌ترین خانه = ۲۹ روزِ پیش از امروز؛
// کلیدِ ۳۰روزِ پیش پنجره را از دست داده و صادقانه نادیده گرفته میشود
// (سقفِ پنجره، هم‌الگوی پنجرهٔ ۳۵روزهٔ DayStat).

import { dayKeyBefore } from "@/lib/weekly-digest";
import type { DayHistoryMap } from "@/state/types";

/** طولِ ماه‌نامه — شاملِ امروز */
export const MONTH_WINDOW = 30;

export interface MonthReads {
  /** مجموعِ داستان‌های خوانده‌شده در پنجرهٔ ۳۰روزه */
  total: number;
  /** روزهایی که حداقل یک داستان خوانده شده */
  activeDays: number;
  /** پرکارترین روز — تساوی = روزِ کهنه‌تر (اولینِ بیشینه) */
  best: { day: string; count: number } | null;
  /** ۳۰ خانه، کهنه → امروز؛ برای نوارِ ماه‌نامه */
  perDay: { day: string; count: number }[];
  /** هیچ داستانی در پنجره نیست — سیاستِ بوم‌محور: بی‌سابقه مخفی */
  empty: boolean;
}

/** storiesِ یک روز — هر ورودیِ کهنه/ناقص صفرِ صادق است، هرگز نمیترکاند */
function storiesOf(dayHistory: DayHistoryMap, key: string): number {
  return dayHistory[key]?.stories ?? 0;
}

export function monthReads(dayHistory: DayHistoryMap, todayKey: string): MonthReads {
  const perDay: { day: string; count: number }[] = [];
  let total = 0;
  let activeDays = 0;
  let best: { day: string; count: number } | null = null;

  // کهنه → امروز؛ پیمایشِ یک‌طرفه، تساویِ best به کهنه‌تر میرسد
  for (let i = MONTH_WINDOW - 1; i >= 0; i--) {
    const day = dayKeyBefore(todayKey, i);
    const count = storiesOf(dayHistory, day);
    perDay.push({ day, count });
    if (count > 0) {
      total += count;
      activeDays++;
      if (!best || count > best.count) best = { day, count };
    }
  }

  return { total, activeDays, best, perDay, empty: total === 0 };
}
