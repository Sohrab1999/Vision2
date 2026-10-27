// ------------------------------------------------------------------
// Task 140 «دفترِ زنجیرهٔ مأموریت‌ها» — قرارداد متنیِ زنجیرهٔ پنج‌گانه.
// خالص و بی‌UI — دقیقاً الگویِ freezeBadgeMeta/goalChipMeta: meta در
// می‌آید، چیپ تصمیم می‌گیرد، wording یک‌جاست.
//
// منبعِ داده: dayHistory (پنجرهٔ ۳۵روزهٔ pushDayHistory — کامل‌ترین
// نقشهٔ روزها: reviews/quizzes/words/dictation/rush) نه historyِ
// ۳۰روزهٔ {reviews,quizzes} که برای پنج‌گانه ناکافی است. today
// پارامتری می‌آید نه ساعتِ واقعی — تست‌پذیرِ کامل.
//
// قاعدهٔ زنجیره: روزی عضو می‌شود که هر پنج مأموریتِ همان روز کامل
// شده باشند (completedQuestCount === QUESTS.length — همان قراردادی
// که «پاداش روزانه» و توستِ جشن می‌سنجند). زنجیره از امروز رو به
// گذشته راه می‌رود؛ اگر امروز هنوز پنج‌گانه ناقص است، زنجیره از راهِ
// دیروز زنده می‌ماند — همان قراردادِ applyStreak:
// lastActiveDay === daysAgoKey(1) → زنجیرهٔ مطالعه پابرجاست.
//
// صداقتِ نمایش: چیپ فقط از streak >= ۲ ظاهر می‌شود — «زنجیره» یعنی
// حداقلِ دو حلقه؛ تک‌روزِ کامل را خودِ نوارِ پاداش جشن می‌گیرد.
// (honest absence — nullِ freezeBadgeMeta.)
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { QUESTS, completedQuestCount } from "./daily-quests";
import type { DayHistoryMap } from "@/state/types";

// Task 299 — شش‌گانه شدنِ تختهٔ روزانه («داستان کتابخانه») قراردادِ زنجیره
// را عوض نمیکند: چیپِ زنجیره و دفترِ هفته رویِ پنج مأموریتِ هستهای
// میچرخند (همان «هر پنج مأموریت» که نوارِ پاداش میشناسد) — داستانِ
// کتابخانه عضوِ زنجیره نیست و در دفترِ هفته هم شمرده نمیشود.
const CORE_QUESTS = QUESTS.filter((q) => q.id !== "story");

/** چند مأموریتِ هستهای در این روز برآورده شده (زنجیره و دفترِ هفته همین را میخوانند) */
function coreCompletedCount(d: DayHistoryMap[string] | undefined): number {
  const stat = d;
  return CORE_QUESTS.reduce((n, q) => n + (stat && q.value(stat) >= q.target ? 1 : 0), 0);
}

export interface QuestStreakMeta {
  /** روزهای پیاپیِ پنج‌گانهٔ کامل، تا امروز یا دیروز */
  streak: number;
  /** امروز عضوِ زنجیره است؟ (false = زنجیره از دیروز زنده است) */
  includesToday: boolean;
  /** مأموریت‌های کامل‌شده در ۷ روز گذشته (از سقف ۳۵) */
  weekDone: number;
  /** روزهای ۵/۵ در ۷ روز گذشته */
  weekPerfect: number;
  /** «زنجیرهٔ ۳ روزه» — فقط streak>=2؛ وگرنه null (حضورِ صادقانه) */
  label: string | null;
  /** عنوانِ کامل — aria-label و tooltip چیپ (تساوی aria==title قرارداد) */
  title: string;
}

/** walk cap — سقفِ سخت برای پیمایش؛ پنجرهٔ واقعی داده ۳۵ روز است */
const WALK_CAP = 60;

export function questStreakMeta(
  dayHistory: DayHistoryMap,
  today: string
): QuestStreakMeta {
  const book: DayHistoryMap = dayHistory ?? {};
  const day5 = (offset: number): boolean =>
    coreCompletedCount(book[daysAgoKeyFrom(today, offset)]) === CORE_QUESTS.length;

  // ---- زنجیره: از امروز (یا دیروز) رو به گذشته ----
  let streak = 0;
  // امروزِ کامل عضوِ زنجیره است؛ ناقصِ امروز زنجیره را نمی‌شکند — از دیروز
  // (قرارداد applyStreak: lastActiveDay === daysAgoKey(1) → پابرجا)
  const startOffset = today && day5(0) ? 0 : 1;
  const includesToday = startOffset === 0;
  for (let off = startOffset; off <= WALK_CAP; off++) {
    if (!today || !day5(off)) break;
    streak++;
  }

  // ---- دفترِ هفته: ۷ روزِ گذشته ----
  let weekDone = 0;
  let weekPerfect = 0;
  for (let off = 0; off < 7; off++) {
    const n = coreCompletedCount(book[daysAgoKeyFrom(today, off)]);
    weekDone += n;
    if (n === CORE_QUESTS.length) weekPerfect++;
  }

  const label =
    streak >= 2 ? `زنجیرهٔ ${faNum(streak)} روزه` : null;

  const title = (() => {
    if (streak >= 2 && includesToday)
      return `زنجیرهٔ مأموریت‌ها: ${faNum(streak)} روزِ پیاپی هر پنج مأموریت کامل شده — امروز هم عضوِ زنجیره‌ای`;
    if (streak >= 2)
      return `${faNum(streak)} روزِ پیاپی هر پنج مأموریت کامل شده — امروز هم بگیر تا زنجیره قطع نشود`;
    if (streak === 1)
      return includesToday
        ? "یک روزِ کامل داری — دومین روز، زنجیرهٔ مأموریت‌ها را می‌سازد"
        : "یک روزِ کامل داری — دومین روز، زنجیرهٔ مأموریت‌ها را می‌سازد";
    return "هیچ زنجیرهٔ پنج‌گانه‌ای باز نیست — یک روزِ کامل برای آغاز کافی است";
  })();

  return { streak, includesToday, weekDone, weekPerfect, label, title };
}

/** daysAgoKey با روزِ مبنا پارامتری — همان فرمتِ local YYYY-MM-DDِ todayStr */
function daysAgoKeyFrom(today: string, offset: number): string {
  if (!today) return "";
  const d = new Date(today + "T12:00:00"); // ظهرِ محلی — مصون از جابه‌جاییِ نیمه‌شب
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
