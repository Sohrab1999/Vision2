// @vitest-environment node
// ------------------------------------------------------------------
// راند ۲۸۲ — نشانِ واقعیِ «اولین دیده‌شدن»: پرچمِ شبه‌نشانِ ر279
// ("first-visible" در seenBadges) تا امروز در رجیستریِ نشانها بیخانه بود —
// کاشیِ گرید هرگز نشانش نمیداد. این راند همان پرچم را به BADGES میآورد:
//   • check همان پرچم را میخواند — کاربری که جشنِ ر279 را گرفته (حتی
//     ماهها پیش) نشانش خودکار باز است (صداقتِ پسرونده)
//   • newBadgeIds هرگز آن را دوباره جشن نمیگیرد (باز−دیده = تهی بهساخت)
//     — جشنِ یکباره فقط مالِ toastِ پاپآورِ ر279 است
//   • پیشرفتِ صادقِ دوشاخه: نامدار/بینام دو متنِ متفاوت میبینند
// بدونِ تغییرِ schema — همان خطِ لولهٔ seenBadges (persist/merge/sync).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BADGES,
  buildEvalInput,
  newBadgeIds,
  unlockedBadgeIds,
  type BadgeDef,
} from "@/lib/achievements";
import { FIRST_VISIBLE_BADGE_ID } from "@/lib/identity";

const SRC = join(process.cwd(), "src", "lib", "achievements.ts");
const src = readFileSync(SRC, "utf8");

type BuildArgs = Parameters<typeof buildEvalInput>[0];

const BASE_DEFAULTS = {
  known: {},
  results: {},
  history: {},
  dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
  streak: 0,
  bestStreak: 0,
  mistakes: {},
  seenBadges: [] as string[],
  userName: "",
} as unknown as BuildArgs;

const base = (over: Partial<BuildArgs> = {}) =>
  buildEvalInput({ ...BASE_DEFAULTS, ...over });

const byId = (id: string): BadgeDef => BADGES.find((b) => b.id === id)!;

describe("نشانِ «اولین دیده‌شدن» — رجیستری", () => {
  it("دقیقاً یک مدخل با شناسهٔ ثابتِ ر279؛ تیرِ برنز؛ آیکونِ Eye؛ عنوانِ یکتا", () => {
    const entries = BADGES.filter((b) => b.id === FIRST_VISIBLE_BADGE_ID);
    expect(entries.length).toBe(1);
    const b = entries[0];
    expect(b.title).toBe("اولین دیده‌شدن");
    expect(b.tier).toBe("bronze");
    expect(b.icon).toBe("Eye");
    // عنوانها در کلِ رجیستری یکتا بمانند (قفلِ ساختاریِ قدیمی، اینجا هم صریح)
    const titles = BADGES.map((x) => x.title);
    expect(new Set(titles).size).toBe(BADGES.length);
    // متنِ توضیح هم به وعدهٔ r278 اشاره دارد (جدول/فید) — روایتِ پیوسته
    expect(b.desc).toContain("جدول");
  });

  it("کاتالوگ از ثابتِ identity استفاده میکند نه رشتهٔ خام — تک‌حقیقت", () => {
    // مدخلِ رجیستری با ثابت ساخته شده (نه id: "first-visible" لیتِرال)
    expect(src.includes("id: FIRST_VISIBLE_BADGE_ID")).toBe(true);
    // و ثابت فقط یک‌بار در کل فایل بهعنوان شناسهٔ مدخل مصرف شده
    expect(src.split("id: FIRST_VISIBLE_BADGE_ID").length - 1).toBe(1);
    // ثابت همچنان تنها در identity.ts تعریف میشود (achievements فقط import میکند)
    expect(src.includes('export const FIRST_VISIBLE_BADGE_ID')).toBe(false);
  });

  it("check = پرچمِ seenBadges — بی‌نامِ محض هرگز بازش نمیکند؛ بازِ پسرونده صادق است", () => {
    // بیپرچم → قفل (حتی با فعالیت و نام)
    const locked = base({
      userName: "آرش ر",
      results: { "1:quiz": { correct: 5, total: 5, percent: 100, at: "2026-10-21T10:00:00.000Z" } },
    });
    expect(unlockedBadgeIds(locked).has(FIRST_VISIBLE_BADGE_ID)).toBe(false);
    // باپرچم → باز (حتی با صفرِ فعالیت — کاربری که ماهها پیش جشن گرفته)
    const opened = base({
      userName: "آرش ر",
      seenBadges: [FIRST_VISIBLE_BADGE_ID],
    });
    expect(unlockedBadgeIds(opened).has(FIRST_VISIBLE_BADGE_ID)).toBe(true);
  });

  it("newBadgeIds هرگز این نشان را جشن نمیگیرد — جشنِ یکباره فقط مالِ پاپآورِ r279", () => {
    const input = base({ userName: "آرش ر", seenBadges: [FIRST_VISIBLE_BADGE_ID] });
    // بازِ دیدهشده → تازه = تهی
    expect(newBadgeIds(input, [FIRST_VISIBLE_BADGE_ID])).toEqual([]);
    // حتی اگر seen خالی بماند، نشان بههیچروی باز نمیشود (check همان پرچم است)
    const noFlag = base({ userName: "آرش ر", seenBadges: [] });
    expect(newBadgeIds(noFlag, [])).not.toContain(FIRST_VISIBLE_BADGE_ID);
  });

  it("پیشرفتِ صادقِ دوشاخه: نامدار/بینام دو متنِ متفاوت میبینند", () => {
    const b = byId(FIRST_VISIBLE_BADGE_ID);
    expect(b.progress).toBeTruthy();
    const named = b.progress!(base({ userName: "آرش ر" }));
    const anon = b.progress!(base({ userName: "" }));
    expect(named).toContain("نخستین فعالیتِ نام‌دار");
    expect(anon).toContain("نامت را انتخاب کن");
    expect(named).not.toBe(anon);
  });

  it("گاردِ ورودیِ خراب: آرایهٔ شکسته → خالی، نامِ غیررشته → بینام، آشغالِ آرایه فیلتر", () => {
    const corrupt = base({ seenBadges: "junk" as unknown as string[] });
    expect(corrupt.seenBadges).toEqual([]);
    expect(unlockedBadgeIds(corrupt).has(FIRST_VISIBLE_BADGE_ID)).toBe(false);
    const junkArr = base({
      seenBadges: [FIRST_VISIBLE_BADGE_ID, 42, null, { x: 1 }] as unknown as string[],
    });
    // فقط رشتههای معتبر میمانند — پرچمِ واقعی سالم میماند
    expect(junkArr.seenBadges).toEqual([FIRST_VISIBLE_BADGE_ID]);
    expect(unlockedBadgeIds(junkArr).has(FIRST_VISIBLE_BADGE_ID)).toBe(true);
    const badName = base({ userName: 42 as unknown as string });
    expect(badName.userName).toBe("");
    const b = byId(FIRST_VISIBLE_BADGE_ID);
    expect(b.progress!(badName)).toContain("نامت را انتخاب کن");
  });
});
