// ------------------------------------------------------------------
// Task 140 «دفترِ زنجیرهٔ مأموریت‌ها» — تستِ کتابخانهٔ خالص.
// قراردادها: ①قاعدهٔ زنجیره (فقط روزِ ۵/۵ عضو می‌شود) ②امروزِ ناقص
// زنجیره را نمی‌شکند — از دیروز (قرارداد applyStreak) ③شکاف زنجیره را
// قطع می‌کند ④حضورِ صادقانه — label فقط از streak>=2 ⑤دفترِ هفته
// (پنجرهٔ ۷روزه) ⑥نگهبانِ ورودیِ خراب (NaN/رشتهٔ تهی).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { questStreakMeta } from "@/lib/quest-streak";
import { QUESTS, completedQuestCount } from "@/lib/daily-quests";
import type { DayHistoryMap, DayStat } from "@/state/types";

/** روزِ کاملِ پنج‌گانه — هر پنج هدف برآورده (۱۰/۵/۳/۱/۱) */
const perfect = (day: string): DayStat => ({
  day,
  reviews: 10,
  words: 5,
  quizzes: 3,
  dictation: 1,
  rush: 1,
});
/** روزِ چهار‌پنجم — هرگز نباید عضوِ زنجیره شود */
const fourOfFive = (day: string): DayStat => ({ ...perfect(day), rush: 0 });
/** روزِ سبک — فقط کمی مرور */
const light = (day: string): DayStat => ({ day, reviews: 3, words: 0, quizzes: 0, dictation: 0, rush: 0 });

/** کلیدِ روزِ نسبی — همان فرمتِ local YYYY-MM-DD (آینهٔ todayStr) */
function dayAt(today: string, offset: number): string {
  const d = new Date(today + "T12:00:00");
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TODAY = "2026-10-14";

describe("دفترِ زنجیرهٔ مأموریت‌ها — questStreakMeta (Task 140)", () => {
  it("dayHistory خالی → زنجیرهٔ صفر، label تهی، دفترِ هفته صفر (حضورِ صادقانه)", () => {
    const meta = questStreakMeta({}, TODAY);
    expect(meta.streak).toBe(0);
    expect(meta.includesToday).toBe(false);
    expect(meta.weekDone).toBe(0);
    expect(meta.weekPerfect).toBe(0);
    expect(meta.label).toBeNull();
    expect(meta.title).toContain("هیچ زنجیرهٔ پنج‌گانه‌ای");
  });

  it("سه روزِ پیاپیِ ۵/۵ تا امروز → streak=۳، شاملِ امروز، label سه", () => {
    const book: DayHistoryMap = {};
    for (let i = 0; i < 3; i++) book[dayAt(TODAY, i)] = perfect(dayAt(TODAY, i));
    const meta = questStreakMeta(book, TODAY);
    expect(meta.streak).toBe(3);
    expect(meta.includesToday).toBe(true);
    expect(meta.label).toBe("زنجیرهٔ ۳ روزه");
    expect(meta.title).toContain("امروز هم عضوِ زنجیره‌ای");
    expect(meta.weekPerfect).toBe(3);
    expect(meta.weekDone).toBe(15);
  });

  it("امروز ناقص ولی دیروز و پریروز ۵/۵ → زنجیره از راهِ دیروز زنده (streak=۲، شاملِ امروز نه)", () => {
    const book: DayHistoryMap = {
      [dayAt(TODAY, 0)]: fourOfFive(dayAt(TODAY, 0)), // امروز ۴/۵
      [dayAt(TODAY, 1)]: perfect(dayAt(TODAY, 1)),
      [dayAt(TODAY, 2)]: perfect(dayAt(TODAY, 2)),
    };
    const meta = questStreakMeta(book, TODAY);
    expect(meta.streak).toBe(2);
    expect(meta.includesToday).toBe(false);
    expect(meta.label).toBe("زنجیرهٔ ۲ روزه");
    expect(meta.title).toContain("امروز هم بگیر تا زنجیره قطع نشود");
    // دفترِ هفته روزِ ۴/۵ را می‌شمارد ولی روزِ کامل نمی‌دهد
    expect(meta.weekPerfect).toBe(2);
    expect(meta.weekDone).toBe(14);
  });

  it("شکافِ یک‌روزه زنجیره را قطع می‌کند — فقط دنبالهٔ سرِ زنجیره شمرده می‌شود", () => {
    const book: DayHistoryMap = {
      [dayAt(TODAY, 0)]: perfect(dayAt(TODAY, 0)),
      [dayAt(TODAY, 1)]: perfect(dayAt(TODAY, 1)),
      [dayAt(TODAY, 2)]: light(dayAt(TODAY, 2)), // شکاف
      [dayAt(TODAY, 3)]: perfect(dayAt(TODAY, 3)), // گذشته از شکاف — بی‌اثر
      [dayAt(TODAY, 4)]: perfect(dayAt(TODAY, 4)),
    };
    const meta = questStreakMeta(book, TODAY);
    expect(meta.streak).toBe(2);
    // دفترِ هفته همه را می‌بیند: ۵+۵+۰+۵+۵ (دیگر روزها خالی)
    expect(meta.weekDone).toBe(20);
    expect(meta.weekPerfect).toBe(4);
  });

  it("روزِ ۴/۵ هرگز عضو نمی‌شود حتی وقتی امروز است — تک‌روز کامل جشنِ نوارِ پاداش است نه چیپ", () => {
    const book: DayHistoryMap = { [dayAt(TODAY, 0)]: fourOfFive(dayAt(TODAY, 0)) };
    const meta = questStreakMeta(book, TODAY);
    expect(meta.streak).toBe(0);
    expect(meta.label).toBeNull();
    expect(meta.title).toContain("یک روزِ کامل برای آغاز کافی است");
    // تک‌روزِ کامل → streak=۱ → چیپ نمی‌آید ولی عنوانِ تک‌روز دارد
    const one: DayHistoryMap = { [dayAt(TODAY, 0)]: perfect(dayAt(TODAY, 0)) };
    const meta1 = questStreakMeta(one, TODAY);
    expect(meta1.streak).toBe(1);
    expect(meta1.includesToday).toBe(true);
    expect(meta1.label).toBeNull();
    expect(meta1.title).toContain("دومین روز، زنجیرهٔ مأموریت‌ها را می‌سازد");
  });

  it("پنجرهٔ هفته دقیقاً ۷ روز است — روزِ هفتم داخل، روزِ هشتم بیرون", () => {
    const book: DayHistoryMap = {
      [dayAt(TODAY, 6)]: perfect(dayAt(TODAY, 6)), // آخرین روزِ پنجره
      [dayAt(TODAY, 7)]: perfect(dayAt(TODAY, 7)), // بیرونِ پنجره
    };
    const meta = questStreakMeta(book, TODAY);
    expect(meta.weekDone).toBe(5); // فقط روزِ هفتم
    expect(meta.weekPerfect).toBe(1);
    // زنجیره از امروز شروع نشده — هر دو روز بیرونِ دنباله‌اند
    expect(meta.streak).toBe(0);
  });

  it("نگهبانِ ورودیِ خراب — NaN و فیلدهایِ گم‌شده هرگز نمی‌ترکانند", () => {
    const garbage: DayHistoryMap = {
      [dayAt(TODAY, 0)]: {
        day: dayAt(TODAY, 0),
        reviews: Number.NaN,
        words: undefined as unknown as number,
        quizzes: -3,
        dictation: 1,
        rush: 1,
      },
    };
    const meta = questStreakMeta(garbage, TODAY);
    // NaN/undefined هرگز >= هدف نیستند → روز عضو نمی‌شود؛ اما dictation+rush هم هستند
    expect(completedQuestCount(garbage[dayAt(TODAY, 0)])).toBeLessThan(QUESTS.length);
    expect(meta.streak).toBe(0);
    expect(meta.label).toBeNull();
    // today تهی → همه‌چیز صفر، بدونِ خرابی
    const emptyToday = questStreakMeta({ [dayAt(TODAY, 0)]: perfect(dayAt(TODAY, 0)) }, "");
    expect(emptyToday.streak).toBe(0);
    expect(emptyToday.weekDone).toBe(0);
  });
});
