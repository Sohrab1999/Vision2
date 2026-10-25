// راند ۳۰۱ «استریکِ کتابخوانی» — قراردادِ خالصِ زنجیرهٔ روزهای پیوستهٔ
// خواندنِ داستان. هم‌خانوادهٔ library-progress (r297) و library-filter
// (r300): توابعِ خالص — کلیدِ روز توسطِ فراخوان داده میشود تا آزمونِ مرزی
// با کلیدِ ثابت قفل شود؛ هیچ Dateِ داخلی و هیچ شمارشِ موازی‌ای نیست.
//
// منبعِ یگانه: dayHistory (پنجرهٔ ۳۵روزهٔ DayStat) — شمارندهٔ stories از
// r299 هر اتمامِ داستان (حتی بازخوانی) را میشمارد. همین منبع با نمودار
// فعالیت و هفته‌نامه مشترک است؛ چیپِ استریک هیچ مسیرِ موازی نمی‌سازد.
//
// قراردادِ زنجیره — هم‌معنایِ streakِ اصلی در day-engine:
//   • امروز خوانده → زنجیره تا امروز و به عقبِ روزهای پیوسته
//   • امروز نه، دیروز بله → زنجیره زنده است (از دیروز به عقب) —
//     هم‌معنایِ «lastActiveDay === daysAgoKey(1) → ادامهٔ طبیعی»
//   • امروز و دیروز هر دو خالی → زنجیره صفر (شکاف، زنجیره رفته)
// طولِ زنجیره سقفِ پنجرهٔ ۳۵روزه دارد — صادق به منبعِ واقعی.

import { dayKeyBefore } from "@/lib/weekly-digest";
import type { DayHistoryMap } from "@/state/types";

export interface StoryStreak {
  /** روزهای پیوستهٔ خواندن — شاملِ امروز اگر خوانده، وگرنه از دیروز */
  current: number;
  /** امروز حداقل یک داستان خوانده؟ */
  readToday: boolean;
  /** بلندترین زنجیرهٔ درونِ پنجرهٔ موجود — رکوردِ فرد یاد میماند */
  longest: number;
}

/** storiesِ یک روز — هر ورودیِ کهنه/ناقص صفرِ صادق است، هرگز نمیترکاند */
function storiesOf(dayHistory: DayHistoryMap, key: string): number {
  return dayHistory[key]?.stories ?? 0;
}

export function storyStreak(dayHistory: DayHistoryMap, todayKey: string): StoryStreak {
  const readToday = storiesOf(dayHistory, todayKey) > 0;

  // زنجیرهٔ جاری: از امروز (یا دیروز اگر امروز خالی) به عقبِ روزهای پیوسته
  let current = 0;
  for (let i = readToday ? 0 : 1; ; i++) {
    if (storiesOf(dayHistory, dayKeyBefore(todayKey, i)) > 0) current++;
    else break;
  }

  // رکوردِ درونِ پنجره: کلیدهای مرتب + مجاورتِ رشتهای با dayKeyBefore —
  // کلیدِ بیگانه (نه دیروزِ هیچ کلیدِ دیگری) زنجیره را قطع میکند نه وصل.
  const activeKeys = Object.keys(dayHistory)
    .filter((k) => storiesOf(dayHistory, k) > 0)
    .sort();
  let longest = 0;
  let run = 0;
  let prev = "";
  for (const k of activeKeys) {
    run = prev && dayKeyBefore(k, 1) === prev ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }

  return { current, readToday, longest };
}
