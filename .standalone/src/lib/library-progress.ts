// راند ۲۹۷ «کتاب‌خانه همه‌جا» — قراردادِ خالصِ پیشرفتِ خواندنِ داستان‌های Hill.
// سه سطحِ عرضه (کارتِ «ادامهٔ خواندن» روی خانه، چیپِ هفتگیِ نمودار فعالیت،
// نوارِ هفته‌نامه) همگی از همین توابع می‌خوانند تا هیچ شمارشِ موازی‌ای
// واگرا نشود — هم‌قراردادِ «یک منبع، دو مصرف»ِ findNextStep/گامِ بعدی.
//
// ورودی همیشه رکوردِ libraryDone اسلایسِ library است:
//   Record<"s1-1", { score, total, day: "2026-10-21" }>
// توابع خالص‌اند (بدون Date داخلی) — کلیدِ روز توسطِ فراخوان داده می‌شود
// (daysAgoKey) تا آزمونِ مرزی با کلیدِ ثابت قفل شود.

import { HILL_STORIES, HILL_TOTAL_STORIES, storyById, type HillStory } from "@/data/hill-stories";
import type { LibraryDoneEntry } from "@/state/types";

export type LibraryDoneMap = Record<string, LibraryDoneEntry>;

export interface LibraryProgress {
  /** داستان‌های تمام‌شده */
  doneCount: number;
  /** کل داستان‌های سه کتاب (همیشه HILL_TOTAL_STORIES) */
  total: number;
  /** درصدِ پیشرفت — رُندِ پایین */
  percent: number;
  /** نخستین داستانِ نخوانده در ترتیبِ کتاب (s1→s2→s3)؛ null = هر ۵۱ تمام */
  nextStory: HillStory | null;
  /** سه‌گانه کامل شد؟ */
  complete: boolean;
}

/**
 * وضعیتِ پیشرفتِ کتاب‌خانه از رکوردِ done — ترتیبِ «داستانِ بعدی» همان
 * ترتیبِ آرایهٔ HILL_STORIES است (کتاب ۱ از داستان ۱ تا ۲۷، بعد کتاب ۲ …).
 */
export function libraryProgress(done: LibraryDoneMap): LibraryProgress {
  const total = HILL_TOTAL_STORIES;
  const doneCount = HILL_STORIES.reduce((acc, s) => acc + (done[s.id] ? 1 : 0), 0);
  const nextStory = HILL_STORIES.find((s) => !done[s.id]) ?? null;
  return {
    doneCount,
    total,
    percent: total > 0 ? Math.floor((doneCount / total) * 100) : 0,
    nextStory,
    complete: doneCount >= total && total > 0,
  };
}

/**
 * داستان‌های تمام‌شدهٔ یک پنجرهٔ روزی (کوچک‌تر مساوی cutoff تا امروز).
 * مقایسهٔ رشته‌ایِ کلیدهای ISO — دقیقاً قراردادِ daysAgoKey/weekly-digest.
 * برگشتی: تعداد + شناسه‌های مرتب‌شده بر اساس تازگی (روزِ نزولی) برای چیپ‌ها.
 */
export function storiesReadSince(
  done: LibraryDoneMap,
  cutoff: string,
  today: string
): { count: number; ids: string[] } {
  const ids: string[] = [];
  for (const [id, entry] of Object.entries(done)) {
    if (!entry) continue;
    // فقط کلیدهای واقعیِ داستان حساب می‌شوند (سanitizeِ SyncField از قبل
    // کلیدهای بیگانه را می‌ریزد — این گارد دوم، در برابرِ payloadِ دست‌خورده)
    if (!storyById(id)) continue;
    if (entry.day && entry.day >= cutoff && entry.day <= today) ids.push(id);
  }
  ids.sort((a, b) => (done[b]!.day || "").localeCompare(done[a]!.day || ""));
  return { count: ids.length, ids };
}
