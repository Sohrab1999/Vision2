// ------------------------------------------------------------------
// Task 300 «کتابخانهٔ هوشمند» — قراردادِ خالصِ جست‌وجو و صافیِ فهرستِ
// داستان‌های Hill. هم‌خانوادهٔ library-progress (r297): ورودیِ «خوانده‌شده»
// همان رکوردِ libraryDone اسلایسِ library است؛ توابعِ خالص — بدونِ Date و
// بدونِ side-effect — تا آزمونِ مرزی با دادهٔ ثابت قفل شود.
// سه مصرف‌کننده: ورودیِ جست‌وجو، چیپ‌های صافی (همه/نخوانده/خوانده‌شده) و
// برچسبِ واژه/دقیقهٔ هر سطر — هیچ شمارشِ موازی‌ای واگرا نمیشود.
// ------------------------------------------------------------------

import type { HillStory } from "@/data/hill-stories";
import type { LibraryDoneMap } from "@/lib/library-progress";

/** صافیِ وضعیتِ خواندن — «همه» مرتبهٔ پیش‌فرض است. */
export type StoryFilter = "all" | "unread" | "read";

/** تعدادِ واژهٔ واقعیِ متن — پاراگراف‌ها با \n\n؛ توکنِ خالی حذف میشود. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** نرخِ خواندنِ یادگیرنده — ۱۱۰ واژه/دقیقه (دستورِ هیل برایِ سطحِ مقدماتی). */
const WORDS_PER_MINUTE = 110;

/**
 * زمانِ خواندنِ تخمینی بر حسبِ دقیقه — صادقِ سقفِ پایین:
 * صفر (یا منفی) واژه = صفر دقیقه؛ وگرنه سقفِ تقسیم بر نرخ.
 */
export function readingMinutes(words: number): number {
  if (words <= 0) return 0;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** ارقامِ فارسی/عربی → لاتین — برایِ «۳» یا «۱۲» در جست‌وجوی شمارهٔ داستان. */
export function toLatinDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (ch) => {
    const fa = FA_DIGITS.indexOf(ch);
    if (fa >= 0) return String(fa);
    const ar = AR_DIGITS.indexOf(ch);
    return ar >= 0 ? String(ar) : ch;
  });
}

/**
 * تطبیقِ یک داستان با پرس‌وجو — دو مسِ صادق:
 * ① زیررشتهٔ عنوانِ انگلیسی (بی‌حساس به بزرگیِ حرف)
 * ② شمارهٔ داستان (ارقامِ فارسی یا لاتین)
 * پرس‌وجوی خالی/فاصله = تطبیق با همه.
 */
export function matchesStory(
  story: Pick<HillStory, "title" | "num">,
  query: string
): boolean {
  const q = query.trim();
  if (!q) return true;
  if (story.title.toLowerCase().includes(q.toLowerCase())) return true;
  const latin = toLatinDigits(q);
  if (/^\d+$/.test(latin)) return story.num === Number(latin);
  return false;
}

/**
 * فهرستِ شناسه‌های هم‌نوا — پرس‌وجو ∧ صافیِ خواندن، در همان ترتیبِ آرایه.
 * کلیدهای بیگانهٔ done (بعد از sanitize یا دست‌خوردگی) هرگز چشمِ صافی را
 * نمی‌گیرند — گاردِ per-story با خودِ شناسهٔ واقعی.
 */
export function filterStoryIds(
  stories: Pick<HillStory, "id" | "title" | "num">[],
  done: LibraryDoneMap,
  query: string,
  filter: StoryFilter
): string[] {
  return stories
    .filter((s) => {
      if (!matchesStory(s, query)) return false;
      const isDone = Boolean(done[s.id]);
      if (filter === "unread" && isDone) return false;
      if (filter === "read" && !isDone) return false;
      return true;
    })
    .map((s) => s.id);
}
