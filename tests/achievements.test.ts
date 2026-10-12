// ------------------------------------------------------------------
// Task 81 — قرارداد خالص دستاوردها: رجیستری نشان‌ها + خانوادهٔ یخ.
// این فایل «اولین» تست‌های ماژول achievements است (۲۲ نشانِ قبلی بدون
// تست بودند) — سه لایه قفل می‌شود:
//   ① سلامت رجیستری: شناسه‌های یکتا، متنی غیرخالی، تیر معتبر
//   ② خانوادهٔ یخ (۴ نشان تازه): دقیقاً قرارداد F9 — ساخت/نجات/انبار/سپر
//   ③ گاردهای buildEvalInput: مخزن NaN/منفی/کسری، آرایهٔ نجات خراب
// ورودی‌ها همه با buildEvalInput واقعی ساخته می‌شوند (قراردادِ اتصال
// store→eval هم پوشش داده می‌شود، نه فقط checkهای ایزوله).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  BADGES,
  TIER_STYLE,
  buildEvalInput,
  newBadgeIds,
  unlockedBadgeIds,
  type BadgeDef,
} from "@/lib/achievements";
import { daysAgoKey } from "@/lib/study-store";

const T = "2026-10-13";

type BuildArgs = Parameters<typeof buildEvalInput>[0];

const BASE_DEFAULTS = {
  known: {},
  results: {},
  history: {},
  dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
  streak: 0,
  bestStreak: 0,
  mistakes: {},
} as unknown as BuildArgs;

/** همهٔ فیلدهای لازم با صفرهای امن؛ over روی آن‌ها سوار می‌شود */
const base = (over: Partial<BuildArgs> = {}) =>
  buildEvalInput({ ...BASE_DEFAULTS, ...over });

const ids = (input: ReturnType<typeof buildEvalInput>) => [...unlockedBadgeIds(input)].sort();
const byId = (id: string): BadgeDef => BADGES.find((b) => b.id === id)!;

describe("رجیستری نشان‌ها — سلامت ساختاری", () => {
  it("شناسه‌ها یکتا هستند و هر نشان متن/تیر معتبر دارد", () => {
    const set = new Set(BADGES.map((b) => b.id));
    expect(set.size).toBe(BADGES.length);
    // عنوان‌ها هم باید یکتا باشند — Task 82: «هفتهٔ کامل» دو بار ثبت شد و
    // getByText در تستِ کامپوننت آن را لو داد (دو کاشیِ هم‌نام = ابهامِ UX)
    const titles = new Set(BADGES.map((b) => b.title));
    expect(titles.size).toBe(BADGES.length);
    for (const b of BADGES) {
      expect(b.title.length, `title of ${b.id}`).toBeGreaterThan(0);
      expect(b.desc.length, `desc of ${b.id}`).toBeGreaterThan(0);
      expect(b.icon.length, `icon of ${b.id}`).toBeGreaterThan(0);
      expect(TIER_STYLE[b.tier], `tier of ${b.id} must have style`).toBeTruthy();
      expect(typeof b.check).toBe("function");
    }
  });

  it("خانوادهٔ یخ با ۴ نشان حاضر است — wording و تیر قفل است", () => {
    expect(byId("ice-maker").title).toBe("یخ‌ساز");
    expect(byId("ice-maker").tier).toBe("bronze");
    expect(byId("ice-maker").icon).toBe("Snowflake");
    expect(byId("chain-rescuer").tier).toBe("silver");
    expect(byId("ice-stockpile").icon).toBe("Package");
    expect(byId("ice-shield").tier).toBe("gold");
    expect(byId("ice-shield").icon).toBe("Shield");
  });
});

describe("خانوادهٔ یخ — دقیقاً قرارداد F9", () => {
  it("تازه‌وارد: هیچ‌کدام از ۴ نشان یخ باز نیست", () => {
    const u = ids(base());
    expect(u).not.toContain("ice-maker");
    expect(u).not.toContain("chain-rescuer");
    expect(u).not.toContain("ice-stockpile");
    expect(u).not.toContain("ice-shield");
  });

  it("یخ‌ساز: فقط با تاریخِ ساختِ ثبت‌شده باز می‌شود (مخزنِ خرج‌شده هم کافی است)", () => {
    // freezeCount=0 (خرج شده) ولی freezeEarnedDay ثبت → ساختِ تاریخی
    expect(ids(base({ freezeEarnedDay: T, freezeCount: 0 }))).toContain("ice-maker");
    // مخزن پر ولی هرگز نساخته (ورودی خراب/legacy) → یخ‌ساز باز نمی‌شود
    expect(ids(base({ freezeCount: 2 }))).not.toContain("ice-maker");
  });

  it("نجات‌گر: یک نجات کافی است؛ بدون نجات باز نمی‌شود", () => {
    expect(ids(base({ freezeUsedDays: ["2026-10-10"] }))).toContain("chain-rescuer");
    expect(ids(base({ freezeUsedDays: [] }))).not.toContain("chain-rescuer");
  });

  it("انبار یخ: فقط روی سقف ۲؛ زیرِ سقف با پیشرفتِ قفل‌شده", () => {
    expect(ids(base({ freezeCount: 2 }))).toContain("ice-stockpile");
    expect(ids(base({ freezeCount: 1 }))).not.toContain("ice-stockpile");
    expect(byId("ice-stockpile").progress!(base({ freezeCount: 1 }))).toBe("۱ از ۲ یخ در انبار");
  });

  it("سپر یخی: ۳ نجات؛ ۲ نجات هنوز نه — پیشرفتِ فارسی", () => {
    const two = base({ freezeUsedDays: ["2026-10-11", "2026-10-10"] });
    expect(ids(two)).not.toContain("ice-shield");
    expect(byId("ice-shield").progress!(two)).toBe("۲ از ۳ نجات");
    const three = base({ freezeUsedDays: ["2026-10-12", "2026-10-08", "2026-09-30"] });
    expect(ids(three)).toContain("ice-shield");
    expect(ids(three)).toContain("chain-rescuer");
  });

  it("نجات‌ها بدون تاریخِ ساخت هم معتبرند (legacy) — نشان‌ها مستقل قفل می‌شوند", () => {
    const u = ids(base({ freezeUsedDays: ["2026-10-10", "2026-10-05", "2026-09-28"] }));
    expect(u).toContain("chain-rescuer");
    expect(u).toContain("ice-shield");
    expect(u).not.toContain("ice-maker");
  });
});

describe("گاردهای buildEvalInput — ورودی خرابِ persist", () => {
  it("مخزن NaN/منفی/کسری → مهارشده (floor + clamp صفر)", () => {
    expect(buildEvalInput(baseRaw({ freezeCount: Number.NaN })).freezeCount).toBe(0);
    expect(buildEvalInput(baseRaw({ freezeCount: -3 })).freezeCount).toBe(0);
    expect(buildEvalInput(baseRaw({ freezeCount: 2.9 })).freezeCount).toBe(2);
  });

  it("آرایهٔ نجات خراب (null/عدد/آبجکت) → فقط رشته‌ها شمرده می‌شوند", () => {
    const corrupt = [null, 7, { day: "2026-10-10" }, "2026-10-10"] as unknown as string[];
    const input = buildEvalInput(baseRaw({ freezeUsedDays: corrupt }));
    expect(input.freezeRescues).toBe(1);
    expect(ids(input)).toContain("chain-rescuer");
    expect(ids(input)).not.toContain("ice-shield");
  });

  it("نبودِ کامل فیلدهای یخ (فراخوانی قدیمی) → صفرهای امن", () => {
    const input = buildEvalInput({
      known: {},
      results: {},
      history: {},
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      streak: 0,
      bestStreak: 0,
      mistakes: {},
    });
    expect(input.freezeCount).toBe(0);
    expect(input.freezeRescues).toBe(0);
    expect(input.hasFreezeEver).toBe(false);
  });
});

describe("نشان‌های هسته‌ای — نمونه‌های مرزی", () => {
  it("اولین قدم: با یک فعالیت در تاریخ باز می‌شود", () => {
    const fresh = base();
    expect(ids(fresh)).not.toContain("first-step");
    const active = buildEvalInput(baseRaw({
      history: { [T]: { reviews: 2, quizzes: 0 } },
    }));
    expect(ids(active)).toContain("first-step");
  });

  it("مرز زنجیره: bestStreak=۳ باز می‌کند، ۲ نه", () => {
    expect(ids(base({ bestStreak: 3 }))).toContain("streak-3");
    expect(ids(base({ bestStreak: 2 }))).not.toContain("streak-3");
  });

  it("بی‌نقص: ۱۰۰٪ با حداقل ۵ سؤال — ۱۰۰٪ با ۴ سؤال کافی نیست", () => {
    const big = buildEvalInput(baseRaw({ results: { "1:quiz": { correct: 5, total: 5, percent: 100 } } }));
    expect(ids(big)).toContain("perfect");
    const small = buildEvalInput(baseRaw({ results: { "1:quiz": { correct: 4, total: 4, percent: 100 } } }));
    expect(ids(small)).not.toContain("perfect");
  });
});

// ------------------------------------------------------------------
// Task 82 — خانوادهٔ هدف: قراردادِ دادهٔ گزارش‌محور (goalMetDays).
// نکتهٔ قراردادی: goalMetDays فقط روزِ واقعاً هدف‌دار را ثبت می‌کند
// (goalAndFreezePatch) و سقف حافظه‌اش ۱۴ است — پس نشانِ ۱۴روزه بعد از
// رسیدن، برای همیشه باز می‌ماند (slice(-14) طول را زیرِ ۱۴ نگه می‌دارد).
// ------------------------------------------------------------------

describe("خانوادهٔ هدف — دقیقاً دادهٔ goalMetDays", () => {
  it("wording و تیر و آیکنِ ۴ نشان قفل است", () => {
    expect(byId("goal-first").title).toBe("اولین هدف");
    expect(byId("goal-first").tier).toBe("bronze");
    expect(byId("goal-first").icon).toBe("Flag");
    expect(byId("goal-five").tier).toBe("silver");
    expect(byId("goal-five").icon).toBe("CalendarDays");
    expect(byId("goal-week").title).toBe("هفتهٔ هدف‌دار");
    expect(byId("goal-week").tier).toBe("gold");
    expect(byId("goal-week").icon).toBe("CalendarRange");
    expect(byId("goal-fortnight").title).toBe("دو هفتهٔ درخشان");
    expect(byId("goal-fortnight").icon).toBe("Sun");
  });

  it("تازه‌وارد: هیچ‌کدام از ۴ نشان هدف باز نیست", () => {
    const u = ids(base());
    expect(u).not.toContain("goal-first");
    expect(u).not.toContain("goal-five");
    expect(u).not.toContain("goal-week");
    expect(u).not.toContain("goal-fortnight");
  });

  it("نردبان: ۱ روز → اولین هدف؛ ۴ → هنوز پنج‌روزه نه؛ ۵ → پنج‌روزه", () => {
    expect(ids(base({ goalMetDays: ["2026-10-12"] }))).toContain("goal-first");
    const four = base({ goalMetDays: ["2026-10-12", "2026-10-11", "2026-10-10", "2026-10-09"] });
    expect(ids(four)).toContain("goal-first");
    expect(ids(four)).not.toContain("goal-five");
    const five = base({ goalMetDays: [...new Array(5)].map((_, i) => `2026-10-${String(12 - i).padStart(2, "0")}`) });
    expect(ids(five)).toContain("goal-five");
    expect(ids(five)).not.toContain("goal-week");
  });

  it("مرز هفته: ۶ روز هنوز نه، ۷ روز «هفتهٔ کامل» — پیشرفتِ فارسی زیرِ قفل", () => {
    const six = base({ goalMetDays: ["2026-10-12", "2026-10-11", "2026-10-10", "2026-10-09", "2026-10-08", "2026-10-07"] });
    expect(ids(six)).not.toContain("goal-week");
    expect(byId("goal-week").progress!(six)).toBe("۶ از ۷ روزِ هدف‌دار");
    const seven = base({ goalMetDays: ["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12"] });
    expect(ids(seven)).toContain("goal-week");
  });

  it("سقف حافظه = سقف نشان: ۱۴ روز باز می‌کند و ۱۵ روز (slice) هم باز می‌ماند", () => {
    const fourteen = base({ goalMetDays: Array.from({ length: 14 }, (_, i) => `2026-09-${String(30 - i).padStart(2, "0")}`) });
    expect(ids(fourteen)).toContain("goal-fortnight");
    // بعد از سقفِ ۱۴، آرایه در engine با slice(-14) طولش ثابت می‌ماند — نشان پس گرفته نمی‌شود
    expect(byId("goal-fortnight").check({ ...fourteen, goalDays: 14 })).toBe(true);
    expect(byId("goal-fortnight").progress!(fourteen)).toBe("۱۴ از ۱۴ روزِ هدف‌دار");
  });

  it("استقلال سطل‌ها: روزِ هدف‌دار با streak و یخ فرقی نمی‌کند", () => {
    const u = ids(base({ goalMetDays: ["2026-10-12", "2026-10-11", "2026-10-10", "2026-10-09", "2026-10-08", "2026-10-07", "2026-10-06"] }));
    expect(u).toContain("goal-week");
    expect(u).not.toContain("streak-3");
    expect(u).not.toContain("ice-maker");
  });

  it("گارد ورودی خراب: آرایهٔ ناهم‌نوع → فقط رشته‌ها؛ نبودِ فیلد → صفر امن", () => {
    const corrupt = buildEvalInput(baseRaw({ goalMetDays: [null, 5, { day: "x" }, "2026-10-12"] }));
    expect(corrupt.goalDays).toBe(1);
    expect(ids(corrupt)).toContain("goal-first");
    const absent = buildEvalInput({
      known: {},
      results: {},
      history: {},
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      streak: 0,
      bestStreak: 0,
      mistakes: {},
    });
    expect(absent.goalDays).toBe(0);
  });
});

// ------------------------------------------------------------------
// Task 83 — هفتهٔ بی‌قفسه: پنجرهٔ ۷روزهٔ موتور (daysAgoKey(6)) با
// مقایسهٔ رشته‌ای >= — کلیدهای نسبی می‌کاریم تا تست به ساعتِ واقعی
// مقاوم باشد؛ مرزها همان مقایسهٔ رشته‌ای‌اند.
// ------------------------------------------------------------------

describe("هفتهٔ بی‌قفسه — پنجرهٔ موتور (Task 83)", () => {
  const w = (n: number) => daysAgoKey(n);
  const fullWeek = () => [w(0), w(1), w(2), w(3), w(4), w(5), w(6)];

  it("wording و تیر و آیکن قفل است — Bird طلایی", () => {
    expect(byId("cage-free").title).toBe("هفتهٔ بی‌قفسه");
    expect(byId("cage-free").tier).toBe("gold");
    expect(byId("cage-free").icon).toBe("Bird");
  });

  it("تازه‌وارد: قفل؛ هفتهٔ کاملِ بی‌نجات: باز", () => {
    expect(ids(base())).not.toContain("cage-free");
    const pure = base({ goalMetDays: fullWeek() });
    expect(ids(pure)).toContain("cage-free");
    expect(pure.goalDays7).toBe(7);
    expect(pure.rescues7).toBe(0);
  });

  it("مرز پنجره: روزِ ششم-پیش (windowStart) می‌شمارد، هفتم-پیش نه", () => {
    // هفت روزِ هدف‌دار ولی قدیمی‌ترین‌ش دقیقاً بیرون پنجره → goalDays7=۶ → قفل
    const shifted = base({ goalMetDays: [w(1), w(2), w(3), w(4), w(5), w(6), w(7)] });
    expect(shifted.goalDays7).toBe(6);
    expect(ids(shifted)).not.toContain("cage-free");
    expect(byId("cage-free").progress!(shifted)).toBe("۶ از ۷ روزِ این هفته");
    // همان روزِ مرزِ داخل: w(6) در پنجره است (مقایسهٔ >=)
    const inside = base({ goalMetDays: fullWeek() });
    expect(inside.goalDays7).toBe(7);
  });

  it("نجاتِ درون‌پنجره‌ای قفل می‌کند؛ نجاتِ بیرونِ پنجره نه", () => {
    const rescuedInside = base({ goalMetDays: fullWeek(), freezeUsedDays: [w(3)] });
    expect(rescuedInside.rescues7).toBe(1);
    expect(ids(rescuedInside)).not.toContain("cage-free");
    // هفت‌از-هفت ولی قفل — پیشرفت فریب نمی‌دهد، desc توضیح می‌دهد
    expect(byId("cage-free").progress!(rescuedInside)).toBe("۷ از ۷ روزِ این هفته");
    const rescuedOutside = base({ goalMetDays: fullWeek(), freezeUsedDays: [w(7), w(10)] });
    expect(rescuedOutside.rescues7).toBe(0);
    expect(ids(rescuedOutside)).toContain("cage-free");
    // هم‌زمانیِ نشان‌ها: نجات‌گر با همان seed باز است — استقلالِ سطل‌ها
    expect(ids(rescuedOutside)).toContain("chain-rescuer");
  });

  it("گارد ورودی خراب: آرایه‌های ناهم‌نوع → فقط رشته‌ها؛ نبودِ فیلد → صفر", () => {
    const corrupt = buildEvalInput(baseRaw({
      goalMetDays: [null, 5, w(0), w(1)],
      freezeUsedDays: [null, { day: "x" }, w(2)],
    }));
    expect(corrupt.goalDays7).toBe(2);
    expect(corrupt.rescues7).toBe(1);
    const absent = buildEvalInput({
      known: {},
      results: {},
      history: {},
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      streak: 0,
      bestStreak: 0,
      mistakes: {},
    });
    expect(absent.goalDays7).toBe(0);
    expect(absent.rescues7).toBe(0);
  });
});

describe("newBadgeIds — قرارداد واحدِ «تازه» (Task 82)", () => {
  const seven = base({ goalMetDays: ["2026-10-12", "2026-10-11", "2026-10-10", "2026-10-09", "2026-10-08", "2026-10-07", "2026-10-06"] });

  it("بازهای دیده‌نشده به ترتیب رجیستری برمی‌گردند", () => {
    const fresh = newBadgeIds(seven, []);
    // این seed فقط روزِ هدف‌دار دارد (history خالی) — اولین قدم باز نمی‌شود
    expect(fresh).not.toContain("first-step");
    expect(fresh).toContain("goal-first");
    expect(fresh.indexOf("goal-first")).toBeLessThan(fresh.indexOf("goal-five"));
    expect(fresh.indexOf("goal-five")).toBeLessThan(fresh.indexOf("goal-week"));
  });

  it("دیده‌شده‌ها فیلتر می‌شوند — فقط نام‌دیده‌ها برمی‌گردند", () => {
    const fresh = newBadgeIds(seven, ["goal-first", "goal-five"]);
    // (Task 83) هفت روزِ پشت‌سرهمِ بی‌نجات = هفتهٔ بی‌قفسه هم باز است —
    // seed با تاریخِ مطلق است و امروزِ دستگاه UTC است؛ cage-free همراهش می‌آید
    expect(fresh).toEqual(["goal-week", "cage-free"]);
  });

  it("seen خراب → فقط رشته‌ها معتبر؛ ورودیِ تازه‌وارد → خالی", () => {
    expect(newBadgeIds(seven, [null, 3, "goal-week"] as unknown as string[])).toEqual([
      "goal-first",
      "goal-five",
      "cage-free",
    ]);
    expect(newBadgeIds(base(), [])).toEqual([]);
  });
});

// helper: گاردها عمداً از مسیرِ base نمی‌روند تا فیلترِ داخل buildEvalInput
// مستقیم پروب شود؛ تایپ با cast — ورودی‌ها عمداً خراب‌اند
function baseRaw(over: Record<string, unknown>): BuildArgs {
  return { ...BASE_DEFAULTS, ...over } as BuildArgs;
}
