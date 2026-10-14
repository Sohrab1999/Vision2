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
  badgeProgressPct,
  buildEvalInput,
  newBadgeIds,
  unlockedBadgeIds,
  type BadgeDef,
} from "@/lib/achievements";
import { daysAgoKey } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

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

describe("نشان‌های رویدادیِ هفته — dayHistory پنجرهٔ موتور (Task 84)", () => {
  const w = (n: number) => daysAgoKey(n);
  const fullWeek = () => [w(0), w(1), w(2), w(3), w(4), w(5), w(6)];
  /** خانهٔ استاندارد dayHistory */
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });

  it("wording و تیر و آیکن قفل است — هر دو نقره‌ای (Feather/Repeat)", () => {
    expect(byId("week-no-dictation").title).toBe("هفتهٔ بی‌دیکته");
    expect(byId("week-no-dictation").tier).toBe("silver");
    expect(byId("week-no-dictation").icon).toBe("Feather");
    expect(byId("week-no-exam").title).toBe("هفتهٔ بی‌آزمون");
    expect(byId("week-no-exam").tier).toBe("silver");
    expect(byId("week-no-exam").icon).toBe("Repeat");
  });

  it("تازه‌وارد: قفل؛ هفتهٔ کامل با dayHistoryِ بی‌دیکته/بی‌آزمون: هر دو باز", () => {
    expect(ids(base())).not.toContain("week-no-dictation");
    expect(ids(base())).not.toContain("week-no-exam");
    // هفتهٔ کامل هدف‌دار + پنجره فقط مرور (reviews) → هر دو رویداد با هم
    const pure = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(1)]: dh({ day: w(1), reviews: 6 }), [w(3)]: dh({ day: w(3), reviews: 5 }) },
    });
    expect(ids(pure)).toContain("week-no-dictation");
    expect(ids(pure)).toContain("week-no-exam");
    expect(pure.dictation7).toBe(0);
    expect(pure.quizzes7).toBe(0);
  });

  it("دیکتهٔ درون‌پنجره‌ای «بی‌دیکته» را قفل می‌کند ولی «بی‌آزمون» نه — استقلالِ شمارنده‌ها", () => {
    // قراردادِ effects.ts: trackDictation فقط dictation را بالا می‌برد (نه quizzes)
    const withDictation = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(3)]: dh({ day: w(3), dictation: 2 }) },
    });
    expect(withDictation.dictation7).toBe(2);
    expect(withDictation.quizzes7).toBe(0);
    expect(ids(withDictation)).not.toContain("week-no-dictation");
    expect(ids(withDictation)).toContain("week-no-exam");
    // ۷/۷ ولی قفل — پیشرفت فریب نمی‌دهد (الگوی cage-free)
    expect(byId("week-no-dictation").progress!(withDictation)).toBe("۷ از ۷ روزِ این هفته");
  });

  it("آزمونِ درون‌پنجره‌ای «بی‌آزمون» را قفل می‌کند ولی «بی‌دیکته» نه — جهتِ مقابل", () => {
    const withQuiz = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(2)]: dh({ day: w(2), quizzes: 3 }) },
    });
    expect(withQuiz.quizzes7).toBe(3);
    expect(ids(withQuiz)).not.toContain("week-no-exam");
    expect(ids(withQuiz)).toContain("week-no-dictation");
  });

  it("مرز پنجره: دیکتهٔ w(7) بیرون می‌شمارد، w(6) (windowStart) داخل", () => {
    const outside = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(7)]: dh({ day: w(7), dictation: 1, quizzes: 1 }) },
    });
    expect(outside.dictation7).toBe(0);
    expect(ids(outside)).toContain("week-no-dictation");
    const inside = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(6)]: dh({ day: w(6), dictation: 1 }) },
    });
    expect(inside.dictation7).toBe(1);
    expect(ids(inside)).not.toContain("week-no-dictation");
  });

  it("جمعِ چندروزه + fallbackِ امروز: امروزِ غایب در dayHistory از dayStat می‌آید، حاضر دوبار شمرده نمی‌شود", () => {
    // امروز در dayHistory نیست → دیکتهٔ امروز از dayStat اضافه می‌شود
    const todayFallback = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(2)]: dh({ day: w(2), dictation: 1 }) },
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 0, dictation: 2, rush: 0 },
    });
    expect(todayFallback.dictation7).toBe(3);
    expect(ids(todayFallback)).not.toContain("week-no-dictation");
    // امروز در dayHistory هست → dayStat نادیده (بدون دوبرابرشدن)
    const todayPresent = base({
      goalMetDays: fullWeek(),
      dayHistory: { [w(0)]: dh({ day: w(0), dictation: 1 }) },
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 0, dictation: 5, rush: 0 },
    });
    expect(todayPresent.dictation7).toBe(1);
  });

  it("گاردِ ورودی خراب: خانهٔ غیرِ آبجکت نادیده، منفی/NaN کلمپ، dayHistoryِ غایب → صفر", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        goalMetDays: fullWeek(),
        dayHistory: {
          [w(1)]: null,
          [w(2)]: "junk",
          [w(3)]: dh({ day: w(3), dictation: -2, quizzes: Number.NaN }),
          [w(4)]: dh({ day: w(4), dictation: 1 }),
        },
      }) as unknown as BuildArgs
    );
    // خانه‌های خراب رد می‌شوند؛ w(3) کلمپ به صفر؛ w(4)=۱ → دیکته قفل، آزمون باز
    expect(corrupt.dictation7).toBe(1);
    expect(corrupt.quizzes7).toBe(0);
    expect(ids(corrupt)).not.toContain("week-no-dictation");
    expect(ids(corrupt)).toContain("week-no-exam");
    const absent = base({ goalMetDays: fullWeek() });
    expect(absent.dictation7).toBe(0);
    expect(absent.quizzes7).toBe(0);
    // dayHistory غایب + هفتهٔ کامل → هر دو رویداد باز (سقوطِ امن به صفر)
    expect(ids(absent)).toContain("week-no-dictation");
    expect(ids(absent)).toContain("week-no-exam");
  });
});

describe("رانِ ترکیبی — هفتهٔ دیکتهٔ پیوسته (Task 85)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const dictWeek = () =>
    Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), dictation: 1 })]));

  it("wording و تیر و آیکن — طلایی با SpellCheck2؛ رجیستری ۳۸ شد", () => {
    expect(byId("dictation-run").title).toBe("هفتهٔ دیکتهٔ پیوسته");
    expect(byId("dictation-run").tier).toBe("gold");
    expect(byId("dictation-run").icon).toBe("SpellCheck2");
    expect(BADGES.length).toBe(62);
  });

  it("قراردادِ شمارِ روز ≠ جمع: دو دیکته در یک روز هنوز یک روزِ دیکته‌دار است", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), dictation: 2 }) } });
    expect(one.dictation7).toBe(2);
    expect(one.dictationDays7).toBe(1);
    expect(ids(one)).not.toContain("dictation-run");
    expect(byId("dictation-run").progress!(one)).toBe("۱ از ۷ روزِ این هفته");
  });

  it("رانِ کامل بدونِ هیچ هدفی باز می‌شود — دیکته در جدول سیاست goal را بالا نمی‌برد (استقلالِ واقعی)", () => {
    const run = base({ dayHistory: dictWeek() });
    expect(run.dictationDays7).toBe(7);
    expect(run.goalDays7).toBe(0);
    // بی‌دیکته/بی‌آزمون/بی‌قفسه همه به goalDays7 نیاز دارند — این‌جا هیچ‌کدام باز نیست
    expect(ids(run)).toContain("dictation-run");
    expect(ids(run)).not.toContain("week-no-dictation");
    expect(ids(run)).not.toContain("week-no-exam");
    expect(ids(run)).not.toContain("cage-free-week");
  });

  it("مرز پنجره: روزِ w(6) داخل، w(7) بیرون؛ ۶ روز = قفل با پیشرفتِ صادق", () => {
    const six = base({ dayHistory: Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), dictation: 1 })])) });
    expect(six.dictationDays7).toBe(6);
    expect(ids(six)).not.toContain("dictation-run");
    expect(byId("dictation-run").progress!(six)).toBe("۶ از ۷ روزِ این هفته");
    const sevenWithOld = base({
      dayHistory: { ...dictWeek(), [w(7)]: dh({ day: w(7), dictation: 3 }) },
    });
    // w(7) بیرونِ پنجره است — نه جمع بالا می‌رود نه روزی اضافه می‌شود
    expect(sevenWithOld.dictation7).toBe(7);
    expect(sevenWithOld.dictationDays7).toBe(7);
    expect(ids(sevenWithOld)).toContain("dictation-run");
  });

  it("fallbackِ امروز: امروزِ غایب از dayStat می‌آید (روزِ هفتم)، حاضر دوبار شمرده نمی‌شود", () => {
    const sixDays = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), dictation: 1 })]));
    const viaStat = base({
      dayHistory: sixDays,
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 0, dictation: 1, rush: 0 },
    });
    expect(viaStat.dictationDays7).toBe(7);
    expect(ids(viaStat)).toContain("dictation-run");
    const viaHistory = base({
      dayHistory: { ...sixDays, [w(0)]: dh({ day: w(0), dictation: 1 }) },
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 0, dictation: 9, rush: 0 },
    });
    expect(viaHistory.dictationDays7).toBe(7);
    expect(ids(viaHistory)).toContain("dictation-run");
  });

  it("گاردِ ورودی خراب: خانهٔ منفی/NaN روز نمی‌شود، خانه‌های سالم می‌مانند، غایب → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), dictation: -3 }),
          [w(2)]: "junk",
          [w(3)]: null,
          [w(4)]: dh({ day: w(4), dictation: Number.NaN }),
          [w(5)]: dh({ day: w(5), dictation: 1 }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.dictationDays7).toBe(1);
    expect(ids(corrupt)).not.toContain("dictation-run");
    const absent = base({});
    expect(absent.dictationDays7).toBe(0);
    expect(ids(absent)).not.toContain("dictation-run");
  });
});

describe("رانِ ترکیبی دوم — هفتهٔ آزمون‌دار (Task 86)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const quizWeek = (perDay = 1) =>
    Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), quizzes: perDay })]));

  it("wording و تیر و آیکن — طلایی با ClipboardCheck؛ قراردادِ پیشرفتِ روزشماری", () => {
    expect(byId("exam-run").title).toBe("هفتهٔ آزمون‌دار");
    expect(byId("exam-run").tier).toBe("gold");
    expect(byId("exam-run").icon).toBe("ClipboardCheck");
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), quizzes: 1 }) } });
    expect(byId("exam-run").progress!(one)).toBe("۱ از ۷ روزِ این هفته");
  });

  it("قراردادِ شمارِ روز ≠ جمع: دو آزمون در یک روز هنوز یک روزِ آزمون‌دار است", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), quizzes: 2 }) } });
    expect(one.quizzes7).toBe(2);
    expect(one.quizDays7).toBe(1);
    expect(ids(one)).not.toContain("exam-run");
  });

  it("ران با آزمونِ کوچکِ روزانه باز می‌شود در حالی که هیچ هدفی کامل نشده — شرط پیوستگی است نه هدف (استقلالِ زنده از سوی دیگر)", () => {
    // قرارداد goal-chip: met = reviews+quizzes >= dailyGoal (۱۰) — یک آزمون در
    // روز به هدف نمی‌رسد ولی ران را نگه می‌دارد؛ برخلاف رانِ دیکته، آزمون به
    // هدف کمک می‌کند ولی نشان به «کامل‌شدنِ» هدف نیست به «پیوستگی» می‌نگرد.
    const run = base({ dayHistory: quizWeek(1) });
    expect(run.quizDays7).toBe(7);
    expect(run.quizzes7).toBe(7);
    expect(run.goalDays7).toBe(0);
    expect(ids(run)).toContain("exam-run");
    expect(ids(run)).not.toContain("week-no-dictation");
    expect(ids(run)).not.toContain("cage-free-week");
    // قرینهٔ متضاد: ۷ روزِ آزمون‌دار یعنی quizzes7 > 0 → بی‌آزمون هرگز هم‌زمان باز نیست
    expect(ids(run)).not.toContain("week-no-exam");
  });

  it("مرز پنجره: w(6) داخل، w(7) بیرون؛ ۶ روز = قفل با پیشرفتِ صادق", () => {
    const six = base({ dayHistory: Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), quizzes: 1 })])) });
    expect(six.quizDays7).toBe(6);
    expect(ids(six)).not.toContain("exam-run");
    expect(byId("exam-run").progress!(six)).toBe("۶ از ۷ روزِ این هفته");
    const sevenWithOld = base({
      dayHistory: { ...quizWeek(), [w(7)]: dh({ day: w(7), quizzes: 4 }) },
    });
    // w(7) بیرونِ پنجره — نه جمع (۷) بالا می‌رود نه روزی اضافه می‌شود
    expect(sevenWithOld.quizzes7).toBe(7);
    expect(sevenWithOld.quizDays7).toBe(7);
    expect(ids(sevenWithOld)).toContain("exam-run");
  });

  it("fallbackِ امروز: امروزِ غایب از dayStat می‌آید (روزِ هفتم)، حاضر دوبار و از dayStat شمرده نمی‌شود", () => {
    const sixDays = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), quizzes: 1 })]));
    const viaStat = base({
      dayHistory: sixDays,
      dayStat: { day: w(0), reviews: 0, quizzes: 1, words: 0, dictation: 0, rush: 0 },
    });
    expect(viaStat.quizDays7).toBe(7);
    expect(ids(viaStat)).toContain("exam-run");
    const viaHistory = base({
      dayHistory: { ...sixDays, [w(0)]: dh({ day: w(0), quizzes: 1 }) },
      dayStat: { day: w(0), reviews: 0, quizzes: 9, words: 0, dictation: 0, rush: 0 },
    });
    // امروز در dayHistory هست → dayStat (۹ آزمون) نادیده گرفته می‌شود: ۷ روز، جمع ۷
    expect(viaHistory.quizDays7).toBe(7);
    expect(viaHistory.quizzes7).toBe(7);
    expect(ids(viaHistory)).toContain("exam-run");
  });

  it("گاردِ ورودی خراب: خانهٔ منفی/NaN روز نمی‌شود، خانه‌های سالم می‌مانند، غایب → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), quizzes: -2 }),
          [w(2)]: "junk",
          [w(3)]: null,
          [w(4)]: dh({ day: w(4), quizzes: Number.NaN }),
          [w(5)]: dh({ day: w(5), quizzes: 1 }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.quizDays7).toBe(1);
    expect(corrupt.quizzes7).toBe(1);
    expect(ids(corrupt)).not.toContain("exam-run");
    const absent = base({});
    expect(absent.quizDays7).toBe(0);
    expect(absent.quizzes7).toBe(0);
    expect(ids(absent)).not.toContain("exam-run");
  });
});

describe("رانِ دوتایی — هفتهٔ دوبل (Task 87)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const doubleWeek = (dictPerDay = 1, quizPerDay = 1) =>
    Object.fromEntries(
      [0, 1, 2, 3, 4, 5, 6].map((n) => [
        w(n),
        dh({ day: w(n), dictation: dictPerDay, quizzes: quizPerDay }),
      ])
    );

  it("wording و تیر و آیکن — طلایی با Layers؛ از شمارنده‌های موجود می‌خواند (ورودی تازه ندارد)", () => {
    expect(byId("double-run").title).toBe("هفتهٔ دوبل");
    expect(byId("double-run").tier).toBe("gold");
    expect(byId("double-run").icon).toBe("Layers");
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), dictation: 1, quizzes: 1 }) } });
    expect(byId("double-run").progress!(one)).toBe("۱ از ۷ روزِ دوبلِ این هفته");
  });

  it("هفتهٔ دوبل کامل باز می‌شود — و بازشدنش یعنی هر دو رانِ تکی هم همان هفته بازند (هم‌پوشانیِ مستند)", () => {
    const run = base({ dayHistory: doubleWeek() });
    expect(run.dictationDays7).toBe(7);
    expect(run.quizDays7).toBe(7);
    expect(ids(run)).toContain("double-run");
    // زیرمجموعه بودن عمدی است: هر روز دوبل، روزِ دیکته‌دار و آزمون‌دار هم هست
    expect(ids(run)).toContain("dictation-run");
    expect(ids(run)).toContain("exam-run");
  });

  it("گلوگاه = minِ دو شمارنده: دیکتهٔ کامل + آزمونِ ۳روزه → قفل با پیشرفتِ صادقِ ۳", () => {
    // روزهای هم‌پوشان MERGE می‌شوند — Object.fromEntriesِ با کلیدِ تکراری "آخری" را نگه می‌دارد و خانه را می‌بُرد
    const bottleneck = base({
      dayHistory: Object.fromEntries(
        [0, 1, 2, 3, 4, 5, 6].map((n) => [
          w(n),
          dh({ day: w(n), dictation: 1, quizzes: [2, 4, 6].includes(n) ? 1 : 0 }),
        ])
      ),
    });
    expect(bottleneck.dictationDays7).toBe(7);
    expect(bottleneck.quizDays7).toBe(3);
    expect(ids(bottleneck)).not.toContain("double-run");
    expect(byId("double-run").progress!(bottleneck)).toBe("۳ از ۷ روزِ دوبلِ این هفته");
    // قرینه: آزمونِ کامل + دیکتهٔ ۶روزه → قفل با ۶ — و رانِ آزمون باز می‌ماند
    const mirror = base({
      dayHistory: Object.fromEntries(
        [0, 1, 2, 3, 4, 5, 6].map((n) => [
          w(n),
          dh({ day: w(n), quizzes: 1, dictation: n === 0 ? 0 : 1 }),
        ])
      ),
    });
    expect(mirror.dictationDays7).toBe(6);
    expect(mirror.quizDays7).toBe(7);
    expect(ids(mirror)).not.toContain("double-run");
    expect(ids(mirror)).toContain("exam-run");
    expect(byId("double-run").progress!(mirror)).toBe("۶ از ۷ روزِ دوبلِ این هفته");
  });

  it("قراردادِ شمارِ روز ≠ جمع: دو دیکته + دو آزمون در یک روز هنوز یک روزِ دوبل است", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), dictation: 2, quizzes: 2 }) } });
    expect(one.dictationDays7).toBe(1);
    expect(one.quizDays7).toBe(1);
    expect(ids(one)).not.toContain("double-run");
    expect(byId("double-run").progress!(one)).toBe("۱ از ۷ روزِ دوبلِ این هفته");
  });

  it("مرز پنجره: روزِ دوبلِ w(7) بیرون است — نه روزی اضافه می‌شود نه رانی شکل می‌گیرد", () => {
    const inside = base({ dayHistory: { ...doubleWeek(), [w(7)]: dh({ day: w(7), dictation: 1, quizzes: 1 }) } });
    expect(inside.dictationDays7).toBe(7);
    expect(inside.quizDays7).toBe(7);
    expect(ids(inside)).toContain("double-run");
    const onlyOld = base({
      dayHistory: Object.fromEntries([7, 8, 9, 10, 11, 12, 13].map((n) => [w(n), dh({ day: w(n), dictation: 1, quizzes: 1 })])),
    });
    expect(onlyOld.dictationDays7).toBe(0);
    expect(ids(onlyOld)).not.toContain("double-run");
  });

  it("گاردِ ورودی خراب: خانه‌های junk/neg/NaN روزِ دوبل نمی‌شوند؛ امروزِ غایب → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), dictation: 1, quizzes: -1 }),
          [w(2)]: "junk",
          [w(3)]: dh({ day: w(3), dictation: Number.NaN, quizzes: 1 }),
          [w(4)]: dh({ day: w(4), dictation: 1, quizzes: 1 }),
        },
      }) as unknown as BuildArgs
    );
    // w(1): دیکتهٔ سالم + آزمونِ منفی (حذف) → روزِ دیکته؛ w(3): دیکتهٔ NaN + آزمونِ سالم → روزِ آزمون؛ w(4): دوتایی
    expect(corrupt.dictationDays7).toBe(2);
    expect(corrupt.quizDays7).toBe(2);
    expect(ids(corrupt)).not.toContain("double-run");
    const absent = base({});
    expect(ids(absent)).not.toContain("double-run");
  });
});

describe("رانِ مرور — هفتهٔ مرور (Task 88)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const reviewWeek = (perDay = 1) =>
    Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), reviews: perDay })]));

  it("wording و تیر و آیکن — نقره‌ای با History؛ قراردادِ پیشرفتِ روزشماری؛ رجیستری ۳۸ شد", () => {
    expect(byId("review-run").title).toBe("هفتهٔ مرور");
    expect(byId("review-run").tier).toBe("silver");
    expect(byId("review-run").icon).toBe("History");
    expect(BADGES.length).toBe(62);
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), reviews: 1 }) } });
    expect(byId("review-run").progress!(one)).toBe("۱ از ۷ روزِ این هفته");
  });

  it("قراردادِ شمارِ روز ≠ جمع: دو مرور در یک روز هنوز یک روزِ مرور‌دار است", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), reviews: 2 }) } });
    expect(one.reviewsDays7).toBe(1);
    expect(ids(one)).not.toContain("review-run");
  });

  it("ران با مرورِ کوچکِ روزانه باز می‌شود در حالی که هیچ هدفی کامل نشده — شرط پیوستگی است نه هدف (تحلیلِ آزمون‌دار)", () => {
    // مرور به هدف کمک می‌کند (met = reviews+quizzes >= dailyGoal ۱۰) ولی نشان به
    // «کامل‌شدنِ» هدف نیست به پیوستگی می‌نگرد — مرورِ ۱تایی روزانه ران را نگه می‌دارد
    const run = base({ dayHistory: reviewWeek(1) });
    expect(run.reviewsDays7).toBe(7);
    expect(run.goalDays7).toBe(0);
    expect(ids(run)).toContain("review-run");
    expect(ids(run)).not.toContain("cage-free-week");
    expect(ids(run)).not.toContain("week-no-dictation");
  });

  it("مرز پنجره: روزِ مرورِ w(7) بیرون است — ۶ روز = قفل با پیشرفتِ صادق", () => {
    const six = base({ dayHistory: Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), reviews: 1 })])) });
    expect(six.reviewsDays7).toBe(6);
    expect(ids(six)).not.toContain("review-run");
    expect(byId("review-run").progress!(six)).toBe("۶ از ۷ روزِ این هفته");
    const sevenWithOld = base({
      dayHistory: { ...reviewWeek(), [w(7)]: dh({ day: w(7), reviews: 5 }) },
    });
    // w(7) بیرونِ پنجره — نه جمع بالا می‌رود نه روزی اضافه می‌شود
    expect(sevenWithOld.reviewsDays7).toBe(7);
    expect(ids(sevenWithOld)).toContain("review-run");
  });

  it("fallbackِ امروز: امروزِ غایب از dayStat می‌آید (روزِ هفتم)، حاضر دوبار شمرده نمی‌شود", () => {
    const sixDays = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), reviews: 1 })]));
    const viaStat = base({
      dayHistory: sixDays,
      dayStat: { day: w(0), reviews: 1, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    });
    expect(viaStat.reviewsDays7).toBe(7);
    expect(ids(viaStat)).toContain("review-run");
    const viaHistory = base({
      dayHistory: { ...sixDays, [w(0)]: dh({ day: w(0), reviews: 1 }) },
      dayStat: { day: w(0), reviews: 9, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    });
    expect(viaHistory.reviewsDays7).toBe(7);
    expect(ids(viaHistory)).toContain("review-run");
  });

  it("گاردِ ورودی خراب: خانه‌های junk/neg/NaN روزِ مرور نمی‌شوند؛ امروزِ غایب → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), reviews: -2 }),
          [w(2)]: "junk",
          [w(3)]: null,
          [w(4)]: dh({ day: w(4), reviews: Number.NaN }),
          [w(5)]: dh({ day: w(5), reviews: 1 }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.reviewsDays7).toBe(1);
    expect(ids(corrupt)).not.toContain("review-run");
    const absent = base({});
    expect(absent.reviewsDays7).toBe(0);
    expect(ids(absent)).not.toContain("review-run");
  });
});

describe("رانِ سه‌گانه — هفتهٔ سه‌گانه (Task 89)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const tripleWeek = (perDay = 1) =>
    Object.fromEntries(
      [0, 1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), reviews: perDay, quizzes: perDay, dictation: perDay })])
    );

  it("wording و تیر و آیکن — طلایی با Crown؛ گلوگاهِ minِ سه‌گانه؛ رجیستری ۳۸ شد", () => {
    expect(byId("triple-run").title).toBe("هفتهٔ سه‌گانه");
    expect(byId("triple-run").tier).toBe("gold");
    expect(byId("triple-run").icon).toBe("Crown");
    expect(BADGES.length).toBe(62);
    const mixed = base({ dayHistory: { ...tripleWeek(), [w(3)]: dh({ day: w(3), reviews: 1, quizzes: 1, dictation: 0 }) } });
    // دیکته ۶ روز / آزمون ۷ / مرور ۷ — ضعیف‌ترین حلقه پیشرفت را می‌گوید
    expect(byId("triple-run").progress!(mixed)).toBe("۶ از ۷ روزِ سه‌گانهٔ این هفته");
  });

  it("قراردادِ شمارِ روز ≠ جمع: سه فعالیت در یک روز هنوز یک روزِ سه‌گانه است", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), reviews: 3, quizzes: 2, dictation: 2 }) } });
    expect(one.dictationDays7).toBe(1);
    expect(one.quizDays7).toBe(1);
    expect(one.reviewsDays7).toBe(1);
    expect(ids(one)).not.toContain("triple-run");
  });

  it("هم‌پوشانیِ چهارنفره — قرارداد: سه‌گانهٔ باز یعنی هر سهٔ تکی و دوبل هم همان هفته بازند", () => {
    const run = base({ dayHistory: tripleWeek() });
    expect(ids(run)).toContain("triple-run");
    expect(ids(run)).toContain("dictation-run");
    expect(ids(run)).toContain("exam-run");
    expect(ids(run)).toContain("double-run");
    expect(ids(run)).toContain("review-run");
    // و برعکس: دوبلِ باز (دیکته+آزمون بدون مرور) سه‌گانه را باز نمی‌کند
    const doubleOnly = base({ dayHistory: Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), dictation: 1, quizzes: 1 })])) });
    expect(ids(doubleOnly)).toContain("double-run");
    expect(ids(doubleOnly)).not.toContain("triple-run");
  });

  it("مرز پنجره: روزِ سه‌گانهٔ w(7) بیرون است — ۶ روز = قفل با پیشرفتِ صادق", () => {
    const six = base({ dayHistory: Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), reviews: 1, quizzes: 1, dictation: 1 })])) });
    expect(six.dictationDays7).toBe(6);
    expect(six.quizDays7).toBe(6);
    expect(six.reviewsDays7).toBe(6);
    expect(ids(six)).not.toContain("triple-run");
    expect(byId("triple-run").progress!(six)).toBe("۶ از ۷ روزِ سه‌گانهٔ این هفته");
    const sevenWithOld = base({
      dayHistory: { ...tripleWeek(), [w(7)]: dh({ day: w(7), reviews: 5, quizzes: 5, dictation: 5 }) },
    });
    // w(7) بیرونِ پنجره — هیچ شمارنده‌ای بالا نمی‌رود
    expect(sevenWithOld.dictationDays7).toBe(7);
    expect(ids(sevenWithOld)).toContain("triple-run");
  });

  it("fallbackِ امروز: امروزِ غایب از dayStat می‌آید (روزِ هفتم هر سه)، حاضر دوبار شمرده نمی‌شود", () => {
    const sixDays = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [w(n), dh({ day: w(n), reviews: 1, quizzes: 1, dictation: 1 })]));
    const viaStat = base({
      dayHistory: sixDays,
      dayStat: { day: w(0), reviews: 1, quizzes: 1, dictation: 1, words: 0, rush: 0 },
    });
    expect(viaStat.dictationDays7).toBe(7);
    expect(ids(viaStat)).toContain("triple-run");
    const viaHistory = base({
      dayHistory: { ...sixDays, [w(0)]: dh({ day: w(0), reviews: 1, quizzes: 1, dictation: 1 }) },
      dayStat: { day: w(0), reviews: 9, quizzes: 9, dictation: 9, words: 0, rush: 0 },
    });
    expect(viaHistory.reviewsDays7).toBe(7);
    expect(ids(viaHistory)).toContain("triple-run");
  });

  it("گاردِ ورودی خراب: خانه‌های junk/neg/NaN هیچ روزِ سه‌گانه‌ای نمی‌شوند؛ امروزِ غایب → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), reviews: -1, quizzes: 1, dictation: 1 }),
          [w(2)]: "junk",
          [w(3)]: dh({ day: w(3), reviews: Number.NaN, quizzes: Number.NaN, dictation: 1 }),
          [w(4)]: dh({ day: w(4), reviews: 1, quizzes: 1, dictation: 1 }),
        },
      }) as unknown as BuildArgs
    );
    // w(1): مرورِ منفی حذف → فقط دوبل؛ w(3): فقط دیکته؛ w(4): سه‌گانهٔ کامل — هیچ روزی هر سه را ندارد
    expect(corrupt.dictationDays7).toBe(3);
    expect(corrupt.quizDays7).toBe(2);
    expect(corrupt.reviewsDays7).toBe(1);
    expect(ids(corrupt)).not.toContain("triple-run");
    const absent = base({});
    expect(ids(absent)).not.toContain("triple-run");
  });
});

describe("ماراتن — رانِ دوهفته‌ای (Task 90)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const marathonDays = (ns: number[]) =>
    Object.fromEntries(ns.map((n) => [w(n), dh({ day: w(n), reviews: 1, quizzes: 1, dictation: 1 })]));
  const fullFortnight = () => marathonDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

  it("wording و تیر و آیکن — طلایی با Trophy؛ گلوگاهِ minِ سه‌گانهٔ ۱۴روزه؛ رجیستری ۳۸ شد", () => {
    expect(byId("marathon-run").title).toBe("ماراتنِ دوهفته‌ای");
    expect(byId("marathon-run").tier).toBe("gold");
    expect(byId("marathon-run").icon).toBe("Trophy");
    expect(BADGES.length).toBe(62);
    // دیکته ۱۳ روز / آزمون ۱۴ / مرور ۱۴ — ضعیف‌ترین حلقه پیشرفت را می‌گوید
    const thirteen = base({
      dayHistory: {
        ...fullFortnight(),
        [w(5)]: dh({ day: w(5), reviews: 1, quizzes: 1, dictation: 0 }),
      },
    });
    expect(thirteen.dictationDays14).toBe(13);
    expect(byId("marathon-run").progress!(thirteen)).toBe("۱۳ از ۱۴ روزِ ماراتن");
  });

  it("قراردادِ شمارِ روز ≠ جمع: سه فعالیت در یک روز هنوز یک روزِ ماراتنی است", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), reviews: 4, quizzes: 3, dictation: 2 }) } });
    expect(one.dictationDays14).toBe(1);
    expect(one.quizDays14).toBe(1);
    expect(one.reviewsDays14).toBe(1);
    expect(ids(one)).not.toContain("marathon-run");
  });

  it("هم‌پوشانیِ شش‌نفره — قرارداد: ماراتنِ باز یعنی سه‌گانه و هر سهٔ تکی و دوبل هم بازند (زیرمجموعهٔ ریاضیِ پنجره‌ها)", () => {
    const run = base({ dayHistory: fullFortnight() });
    expect(run.dictationDays14).toBe(14);
    expect(run.quizDays14).toBe(14);
    expect(run.reviewsDays14).toBe(14);
    expect(ids(run)).toContain("marathon-run");
    expect(ids(run)).toContain("triple-run");
    expect(ids(run)).toContain("dictation-run");
    expect(ids(run)).toContain("exam-run");
    expect(ids(run)).toContain("double-run");
    expect(ids(run)).toContain("review-run");
    // و برعکس: سه‌گانهٔ ۷روزه (بدونِ هفتهٔ دوم) ماراتن را باز نمی‌کند
    const tripleOnly = base({
      dayHistory: marathonDays([0, 1, 2, 3, 4, 5, 6]),
    });
    expect(ids(tripleOnly)).toContain("triple-run");
    expect(ids(tripleOnly)).not.toContain("marathon-run");
  });

  it("مرز پنجره: روزِ w(13) چهاردهمین روز است و w(14) بیرون — یک غیبت ماراتن را می‌شکند", () => {
    // ۱۳ روزِ کامل + روزِ چهاردهمِ دیکته‌دارِ بیرونِ مرور: ماراتن قفل می‌ماند
    const almostDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const almost = base({ dayHistory: marathonDays(almostDays) });
    expect(almost.dictationDays14).toBe(13);
    expect(ids(almost)).not.toContain("marathon-run");
    // w(14) بیرونِ پنجره — شمارنده‌ها بالا نمی‌روند حتی با خانهٔ پر
    const withOld = base({
      dayHistory: { ...fullFortnight(), [w(14)]: dh({ day: w(14), reviews: 5, quizzes: 5, dictation: 5 }) },
    });
    expect(withOld.dictationDays14).toBe(14);
    expect(withOld.reviewsDays14).toBe(14);
    expect(ids(withOld)).toContain("marathon-run");
    // یک روزِ غایبِ وسط هفتهٔ دوم = شکستِ پیوستگی
    const gap = base({ dayHistory: { ...fullFortnight(), [w(9)]: dh({ day: w(9) }) } });
    expect(gap.dictationDays14).toBe(13);
    expect(ids(gap)).not.toContain("marathon-run");
  });

  it("fallbackِ امروز: ۱۳ روزِ تاریخ + امروزِ dayStat = روزِ چهاردهم؛ حاضرِ تاریخ دوبار شمرده نمی‌شود", () => {
    const thirteen = marathonDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const viaStat = base({
      dayHistory: thirteen,
      dayStat: { day: w(0), reviews: 1, quizzes: 1, dictation: 1, words: 0, rush: 0 },
    });
    expect(viaStat.dictationDays14).toBe(14);
    expect(ids(viaStat)).toContain("marathon-run");
    const viaHistory = base({
      dayHistory: { ...thirteen, [w(0)]: dh({ day: w(0), reviews: 1, quizzes: 1, dictation: 1 }) },
      dayStat: { day: w(0), reviews: 9, quizzes: 9, dictation: 9, words: 0, rush: 0 },
    });
    expect(viaHistory.quizDays14).toBe(14);
    expect(ids(viaHistory)).toContain("marathon-run");
  });

  it("گاردِ ورودی خراب: خانه‌های junk/neg/NaN روزِ ماراتنی نمی‌شوند؛ امروزِ غایب → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), reviews: -1, quizzes: 1, dictation: 1 }),
          [w(2)]: "junk",
          [w(3)]: dh({ day: w(3), reviews: Number.NaN, quizzes: Number.NaN, dictation: 1 }),
          [w(4)]: dh({ day: w(4), reviews: 1, quizzes: 1, dictation: 1 }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.dictationDays14).toBe(3);
    expect(corrupt.quizDays14).toBe(2);
    expect(corrupt.reviewsDays14).toBe(1);
    expect(ids(corrupt)).not.toContain("marathon-run");
    const absent = base({});
    expect(ids(absent)).not.toContain("marathon-run");
  });
});

describe("خانوادهٔ حضور — ماهِ حاضر و ماهِ درخشان (Task 92)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const presenceDays = (ns: number[], fill: Record<string, unknown> = {}) =>
    Object.fromEntries(ns.map((n) => [w(n), dh({ day: w(n), words: 1, ...fill })]));

  it("wording و تیر و آیکن — نقره/CalendarCheck و طلا/Sparkles؛ رجیستری ۴۰ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("presence-month").title).toBe("ماهِ حاضر");
    expect(byId("presence-month").tier).toBe("silver");
    expect(byId("presence-month").icon).toBe("CalendarCheck");
    expect(byId("presence-month-full").title).toBe("ماهِ درخشان");
    expect(byId("presence-month-full").tier).toBe("gold");
    expect(byId("presence-month-full").icon).toBe("Sparkles");
    expect(BADGES.length).toBe(62);
    const twentyFour = base({ dayHistory: presenceDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]) });
    expect(twentyFour.activeDays35).toBe(25);
    expect(byId("presence-month").progress!(twentyFour)).toBe("۲۵ از ۲۵ روزِ فعال");
    expect(byId("presence-month-full").progress!(twentyFour)).toBe("۲۵ از ۳۰ روزِ فعال");
  });

  it("قراردادِ روز ≠ جمع: پنج فعالیت در یک روز هنوز یک روزِ حاضره — و شرطِ گسترده با ران‌ها قاطی نیست", () => {
    const one = base({ dayHistory: { [w(2)]: dh({ day: w(2), reviews: 4, quizzes: 3, words: 2, dictation: 2, rush: 1 }) } });
    expect(one.activeDays35).toBe(1);
    expect(ids(one)).not.toContain("presence-month");
    // شرطِ گسترده: فقط واژه → روزِ حاضره ولی هیچ رانی باز نمی‌شود
    const wordsOnly = base({ dayHistory: presenceDays([0, 1, 2]) });
    expect(wordsOnly.activeDays35).toBe(3);
    expect(ids(wordsOnly)).not.toContain("dictation-run");
    expect(ids(wordsOnly)).not.toContain("exam-run");
    expect(ids(wordsOnly)).not.toContain("review-run");
    // برق‌آسا هم روز را ثبت می‌کند (پنجمین شمارندهٔ DayStat)
    const rushOnly = base({ dayHistory: { [w(1)]: dh({ day: w(1), rush: 2 }) } });
    expect(rushOnly.activeDays35).toBe(1);
  });

  it("مرزِ حافظه: w(34) آخرین روزِ پنجره است و w(35) بیرون — سقفِ dayHistory همان ۳۵ روز", () => {
    const atEdge = base({ dayHistory: { [w(34)]: dh({ day: w(34), words: 1 }) } });
    expect(atEdge.activeDays35).toBe(1);
    const beyond = base({ dayHistory: { [w(35)]: dh({ day: w(35), words: 1 }) } });
    expect(beyond.activeDays35).toBe(0);
  });

  it("زیرمجموعهٔ نردبان: ۳۰ روز هر دو نشان را باز می‌کند؛ ۲۴ روز هیچ‌کدام را", () => {
    const thirty = base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)) });
    expect(thirty.activeDays35).toBe(30);
    expect(ids(thirty)).toContain("presence-month");
    expect(ids(thirty)).toContain("presence-month-full");
    const twentyFour = base({ dayHistory: presenceDays(Array.from({ length: 24 }, (_, i) => i)) });
    expect(twentyFour.activeDays35).toBe(24);
    expect(ids(twentyFour)).not.toContain("presence-month");
    expect(ids(twentyFour)).not.toContain("presence-month-full");
  });

  it("fallbackِ امروز: ۲۴ روزِ تاریخ + امروزِ dayStatِ فقط‌واژه‌ای = روزِ بیست‌وپنجم؛ حاضرِ تاریخ دوبار شمرده نمی‌شود", () => {
    const twentyFour = presenceDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    const viaStat = base({
      dayHistory: twentyFour,
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 3, dictation: 0, rush: 0 },
    });
    expect(viaStat.activeDays35).toBe(25);
    expect(ids(viaStat)).toContain("presence-month");
    const viaHistory = base({
      dayHistory: { ...twentyFour, [w(0)]: dh({ day: w(0), words: 1 }) },
      dayStat: { day: w(0), reviews: 9, quizzes: 9, words: 9, dictation: 9, rush: 9 },
    });
    expect(viaHistory.activeDays35).toBe(25);
  });

  it("گاردِ ورودی خراب: خانه‌های junk/neg/NaN روزِ حاضر نمی‌شوند؛ غایبِ کامل → صفرِ امن", () => {
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), words: -1, reviews: 0 }),
          [w(2)]: "junk",
          [w(3)]: dh({ day: w(3), words: Number.NaN, rush: Number.NaN }),
          [w(4)]: dh({ day: w(4), quizzes: 1 }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.activeDays35).toBe(1);
    expect(ids(corrupt)).not.toContain("presence-month");
    const absent = base({});
    expect(absent.activeDays35).toBe(0);
    expect(ids(absent)).not.toContain("presence-month");
    expect(ids(absent)).not.toContain("presence-month-full");
  });
});

describe("ماهِ بی‌وقفه — پلهٔ نهاییِ خانوادهٔ حضور (Task 95)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const presenceDays = (ns: number[]) =>
    Object.fromEntries(ns.map((n) => [w(n), dh({ day: w(n), words: 1 })]));
  const all35 = base({ dayHistory: presenceDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]) });

  it("wording و تیر و آیکن — طلایی/Gem؛ رجیستری ۴۲ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("presence-month-perfect").title).toBe("ماهِ بی‌وقفه");
    expect(byId("presence-month-perfect").tier).toBe("gold");
    expect(byId("presence-month-perfect").icon).toBe("Gem");
    expect(BADGES.length).toBe(62);
    const thirtyFour = base({ dayHistory: presenceDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]) });
    expect(thirtyFour.activeDays35).toBe(34);
    expect(byId("presence-month-perfect").progress!(thirtyFour)).toBe("۳۴ از ۳۵ روزِ فعال");
  });

  it("نردبانِ زیرمجموعه: ۳۵ روز ⇒ هر سه پلهٔ حضور بازند (۳۵⇒۳۰⇒۲۵)", () => {
    expect(all35.activeDays35).toBe(35);
    expect(ids(all35)).toContain("presence-month-perfect");
    expect(ids(all35)).toContain("presence-month-full");
    expect(ids(all35)).toContain("presence-month");
  });

  it("یک غیبت حتی در روزِ دورِ حافظه پله را می‌شکند (مرزِ w(34)/w(35))", () => {
    // ۳۴ روزِ حاضر + یک سلولِ بیرونِ حافظه (w(35)) که نباید شمرده شود
    const withOutside = base({
      dayHistory: {
        ...presenceDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]),
        [w(35)]: dh({ day: w(35), words: 1 }),
      },
    });
    expect(withOutside.activeDays35).toBe(34);
    expect(ids(withOutside)).not.toContain("presence-month-perfect");
    // یک غیبتِ داخل پنجره (روزِ 20 غایب)
    const gap = base({ dayHistory: presenceDays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]) });
    expect(gap.activeDays35).toBe(34);
    expect(ids(gap)).not.toContain("presence-month-perfect");
    expect(ids(gap)).toContain("presence-month"); // ۲۵ِ پایین‌تر دست‌نخورده
  });

  it("fallbackِ امروز + روز≠جمع + گاردِ خراب برای پلهٔ ۳۵ هم برقرار است", () => {
    // امروز در dayHistory نیست ولی buildEvalInput آن از dayStat fallback می‌کند (قرارداد ۹۲)
    const todayFallback = base({
      dayHistory: presenceDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]),
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 3, dictation: 0, rush: 0 },
    });
    expect(todayFallback.activeDays35).toBe(35);
    expect(ids(todayFallback)).toContain("presence-month-perfect");
    // پنج فعالیت در یک روز = یک روزِ حضور (نه پنج)
    const mega = base({ dayHistory: { [w(0)]: dh({ day: w(0), reviews: 4, quizzes: 3, words: 2, dictation: 2, rush: 1 }) } });
    expect(mega.activeDays35).toBe(1);
    expect(ids(mega)).not.toContain("presence-month-perfect");
    // سلولِ خراب هیچ‌گاه روز نمی‌شود
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: "junk",
          [w(2)]: dh({ day: w(2), reviews: Number.NaN, words: Number.NaN }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.activeDays35).toBe(0);
    expect(ids(corrupt)).not.toContain("presence-month-perfect");
  });
});

describe("هفتهٔ پنج‌گانه — خانوادهٔ تنوع (Task 93)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });

  it("wording و تیر و آیکن — طلایی با Puzzle؛ رجیستری ۴۲ شد؛ پیشرفتِ شمارِ مهارت‌ها", () => {
    expect(byId("five-skill-week").title).toBe("هفتهٔ پنج‌گانه");
    expect(byId("five-skill-week").tier).toBe("gold");
    expect(byId("five-skill-week").icon).toBe("Puzzle");
    expect(BADGES.length).toBe(62);
    // سه مهارت حاضر → «۳ از ۵ مهارت»
    const three = base({
      dayHistory: {
        [w(1)]: dh({ day: w(1), reviews: 2 }),
        [w(2)]: dh({ day: w(2), quizzes: 1 }),
        [w(3)]: dh({ day: w(3), dictation: 1 }),
      },
    });
    expect(three.wordsDays7).toBe(0);
    expect(three.rushDays7).toBe(0);
    expect(byId("five-skill-week").progress!(three)).toBe("۳ از ۵ مهارت");
    expect(ids(three)).not.toContain("five-skill-week");
  });

  it("قراردادِ تنوع-در-پنجره: حتی یک روزِ پنج‌فعالیه شرط را برآورده می‌کند — معیار حضورِ هر پنج مهارت در پنجره است نه پراکندگی", () => {
    const mega = base({ dayHistory: { [w(3)]: dh({ day: w(3), reviews: 1, quizzes: 1, dictation: 1, words: 1, rush: 1 }) } });
    expect(mega.reviewsDays7).toBe(1);
    expect(mega.quizDays7).toBe(1);
    expect(mega.dictationDays7).toBe(1);
    expect(mega.wordsDays7).toBe(1);
    expect(mega.rushDays7).toBe(1);
    expect(byId("five-skill-week").progress!(mega)).toBe("۵ از ۵ مهارت");
    expect(ids(mega)).toContain("five-skill-week");
    // پخش‌شده روی پنج روز هم دقیقاً همین‌قدر باز می‌کند
    const spread = base({
      dayHistory: {
        [w(0)]: dh({ day: w(0), reviews: 1 }),
        [w(1)]: dh({ day: w(1), quizzes: 1 }),
        [w(2)]: dh({ day: w(2), dictation: 1 }),
        [w(4)]: dh({ day: w(4), words: 1 }),
        [w(6)]: dh({ day: w(6), rush: 1 }),
      },
    });
    expect(ids(spread)).toContain("five-skill-week");
  });

  it("قفلِ متقابل: پنج‌گانهٔ باز یعنی dictation7>0 و quizzes7>0 — بی‌دیکته و بی‌آزمون هرگز هم‌باز نمی‌شوند", () => {
    const five = base({
      dayHistory: {
        [w(0)]: dh({ day: w(0), reviews: 1 }),
        [w(1)]: dh({ day: w(1), quizzes: 1 }),
        [w(2)]: dh({ day: w(2), dictation: 1 }),
        [w(4)]: dh({ day: w(4), words: 1 }),
        [w(6)]: dh({ day: w(6), rush: 1 }),
      },
    });
    expect(ids(five)).toContain("five-skill-week");
    expect(ids(five)).not.toContain("week-no-dictation");
    expect(ids(five)).not.toContain("week-no-exam");
  });

  it("استقلال: تنوع ران نیست — پنج مهارتِ یک‌باره هیچ رانِ ۷روزه‌ای را باز نمی‌کند و به هدف هم کاری ندارد", () => {
    const five = base({
      dayHistory: {
        [w(0)]: dh({ day: w(0), reviews: 1 }),
        [w(1)]: dh({ day: w(1), quizzes: 1 }),
        [w(2)]: dh({ day: w(2), dictation: 1 }),
        [w(4)]: dh({ day: w(4), words: 1 }),
        [w(6)]: dh({ day: w(6), rush: 1 }),
      },
    });
    expect(ids(five)).toContain("five-skill-week");
    expect(ids(five)).not.toContain("dictation-run");
    expect(ids(five)).not.toContain("exam-run");
    expect(ids(five)).not.toContain("review-run");
    expect(ids(five)).not.toContain("cage-free");
    expect(ids(five)).not.toContain("goal-week");
  });

  it("مرزِ پنجره و fallbackِ امروز: مهارتِ w(6) آخرین روزِ پنجره است و w(7) بیرون؛ امروزِ dayStatِ برق‌آسا مهارتِ پنجم را کامل می‌کند", () => {
    const withEdge = base({
      dayHistory: {
        [w(6)]: dh({ day: w(6), reviews: 1 }),
        [w(1)]: dh({ day: w(1), quizzes: 1 }),
        [w(2)]: dh({ day: w(2), dictation: 1 }),
        [w(4)]: dh({ day: w(4), words: 1 }),
      },
      dayStat: { day: w(0), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 2 },
    });
    expect(withEdge.reviewsDays7).toBe(1);
    expect(withEdge.rushDays7).toBe(1);
    expect(ids(withEdge)).toContain("five-skill-week");
    const beyond = base({
      dayHistory: {
        [w(7)]: dh({ day: w(7), rush: 1 }),
        [w(1)]: dh({ day: w(1), reviews: 1, quizzes: 1, dictation: 1, words: 1 }),
      },
    });
    expect(beyond.rushDays7).toBe(0);
    expect(ids(beyond)).not.toContain("five-skill-week");
    const corrupt = buildEvalInput(
      baseRaw({
        dayHistory: {
          [w(1)]: dh({ day: w(1), reviews: 1, quizzes: 1, dictation: 1, words: 1 }),
          [w(2)]: "junk",
          [w(3)]: dh({ day: w(3), rush: Number.NaN }),
        },
      }) as unknown as BuildArgs
    );
    expect(corrupt.rushDays7).toBe(0);
    expect(corrupt.wordsDays7).toBe(1);
    expect(ids(corrupt)).not.toContain("five-skill-week");
  });
});

describe("خانوادهٔ سرعت — صاعقه و سرعتِ صوت (Task 100)", () => {
  const drec = (over: Record<string, unknown>): DuelRecord => ({
    id: "d" + Math.random().toString(36).slice(2, 8),
    day: "2026-10-13",
    outcome: "win",
    reason: "finished",
    opponent: "سینا",
    opponentColor: "rose",
    myScore: 950, // ۵ درست × ۱۰۰ + پاداشِ ۴۵۰ → میانگینِ سرعتِ ۹۰
    oppScore: 500,
    myCorrect: 5,
    oppCorrect: 3,
    answered: 10,
    total: 10,
    durationSec: 80,
    ...over,
  });

  it("wording و تیر و آیکن: صاعقه نقره/Zap، سرعتِ صوت طلا/Rocket؛ رجیستری ۵۲", () => {
    expect(byId("speed-bolt").title).toBe("صاعقه");
    expect(byId("speed-bolt").tier).toBe("silver");
    expect(byId("speed-bolt").icon).toBe("Zap");
    expect(byId("speed-sound").title).toBe("سرعتِ صوت");
    expect(byId("speed-sound").tier).toBe("gold");
    expect(byId("speed-sound").icon).toBe("Rocket");
    expect(BADGES.length).toBe(62);
  });

  it("دو گیتِ صادق: نمونهٔ کم با میانگینِ بالا باز نمی‌کند و پیشرفت روی گیتِ نمونه می‌ماند", () => {
    const small = base({ duelHistory: [drec({ myCorrect: 2, myScore: 380 })] }); // میانگینِ ۹۰
    expect(small.duelSpeedAvg).toBe(90);
    expect(small.duelSpeedCorrect).toBe(2);
    expect(ids(small)).not.toContain("speed-bolt");
    expect(ids(small)).not.toContain("speed-sound");
    // «۹۰ از ۶۰» زیرِ قفل دیده نمی‌شود — پیشرفتِ صادق روی نمونه است
    expect(byId("speed-bolt").progress!(small)).toBe("۲ از ۱۰ پاسخِ درست");
    expect(byId("speed-sound").progress!(small)).toBe("۲ از ۱۵ پاسخِ درست");
  });

  it("نمونهٔ کافی و سریع → هر دو باز — زیرمجموعهٔ (۱۵،۷۵)⇒(۱۰،۶۰) در هر دو جهت", () => {
    const fast = base({ duelHistory: [1, 2, 3].map((i) => drec({ id: "d" + i })) });
    expect(fast.duelSpeedCorrect).toBe(15);
    expect(fast.duelSpeedAvg).toBe(90);
    expect(ids(fast)).toContain("speed-bolt");
    expect(ids(fast)).toContain("speed-sound");
  });

  it("مرزِ آستانه: میانگینِ دقیقِ ۶۰ باز می‌کند، ۵۹٫۹ نه — پیشرفتِ گیتِ میانگین هم صادق", () => {
    // ۱۰ درست، پاداشِ کلِ ۶۰۰ (میانگینِ دقیقاً ۶۰)
    const at = base({ duelHistory: [drec({ myCorrect: 10, myScore: 1600 })] });
    expect(at.duelSpeedAvg).toBe(60);
    expect(ids(at)).toContain("speed-bolt");
    expect(ids(at)).not.toContain("speed-sound"); // ۱۰ < ۱۵ — نمونهٔ طلایی نه
    // یک امتیاز کمتر: میانگینِ ۵۹٫۹
    const under = base({ duelHistory: [drec({ myCorrect: 10, myScore: 1599 })] });
    expect(ids(under)).not.toContain("speed-bolt");
    expect(byId("speed-bolt").progress!(under)).toBe("میانگینِ سرعت: ۵۹ از ۶۰");
  });

  it("گیتِ نمونهٔ طلایی: میانگینِ ۹۰ با ۱۰ پاسخ برای «سرعتِ صوت» کافی نیست", () => {
    const ten = base({ duelHistory: [drec({ myCorrect: 10, myScore: 1900 })] });
    expect(ten.duelSpeedAvg).toBe(90);
    expect(ids(ten)).not.toContain("speed-sound");
    expect(byId("speed-sound").progress!(ten)).toBe("۱۰ از ۱۵ پاسخِ درست");
  });

  it("دفترچهٔ غایب/خراب: غیرآرایه → صفرِ صادق، هرگز باز نمی‌شود (گاردِ ۹۹)", () => {
    const corrupt = buildEvalInput(baseRaw({ duelHistory: "junk" }) as unknown as BuildArgs);
    expect(corrupt.duelSpeedAvg).toBe(0);
    expect(corrupt.duelSpeedCorrect).toBe(0);
    expect(ids(corrupt)).not.toContain("speed-bolt");
    expect(ids(corrupt)).not.toContain("speed-sound");
  });
});

// ---------------------------------------------------------------
// Task 105 — هشتمین خانواده: «اعتماد» — بردهای رسیددار (امضای داور).
// قرارداد: فقط win + receiptSig می‌شمارد؛ مرزها ۳/۷ دقیق؛ زیرمجموعهٔ
// ریاضیِ ۷⇒۳ در هر دو جهت؛ ledgerِ خراب → صفرِ صادق؛ پیشرفتِ شمارشیِ
// همیشه ≤ سقفِ همان پله.
// ---------------------------------------------------------------
describe("خانوادهٔ اعتماد — گواه‌گرفته و سندِ زنده (Task 105)", () => {
  const SIG1 = "a".repeat(64);
  const SIG2 = "b".repeat(64);
  const drec = (over: Partial<DuelRecord> = {}): DuelRecord => ({
    id: "d" + Math.random().toString(36).slice(2, 8),
    day: "2026-10-13",
    outcome: "win",
    reason: "finished",
    opponent: "سینا",
    opponentColor: "rose",
    myScore: 950,
    oppScore: 500,
    myCorrect: 5,
    oppCorrect: 3,
    answered: 10,
    total: 10,
    durationSec: 80,
    ...over,
  });
  /** N بردِ رسیددار + M بردِ بی‌رسید — راهِ هم‌قراردادِ خانواده‌ها: از duelHistory واقعی */
  const ledgerWith = (verifiedWins: number, plainWins = 0): Partial<BuildArgs> => ({
    duelHistory: [
      ...Array.from({ length: verifiedWins }, (_, i) => drec({ id: "v" + i, receiptSig: i % 2 ? SIG2 : SIG1 })),
      ...Array.from({ length: plainWins }, (_, i) => drec({ id: "p" + i })),
    ],
  });

  it("wording و تیر و آیکن: گواه‌گرفته نقره/ShieldCheck، سندِ زنده طلا/Stamp؛ رجیستری ۵۲", () => {
    expect(byId("receipt-trust").title).toBe("گواه‌گرفته");
    expect(byId("receipt-trust").tier).toBe("silver");
    expect(byId("receipt-trust").icon).toBe("ShieldCheck");
    expect(byId("receipt-oath").title).toBe("سندِ زنده");
    expect(byId("receipt-oath").tier).toBe("gold");
    expect(byId("receipt-oath").icon).toBe("Stamp");
    expect(BADGES.length).toBe(62);
  });

  it("سیم‌کشیِ buildEvalInput: فقط بردِ رسیددار می‌شمارد — باختِ رسیددار و بردِ بی‌رسید نه", () => {
    const input = base({
      duelHistory: [
        drec({ receiptSig: SIG1 }),
        drec({ outcome: "loss", receiptSig: SIG2 }),
        drec(),
        drec({ receiptSig: SIG1 }),
        drec({ outcome: "tie", receiptSig: SIG2 }),
      ],
    });
    expect(input.duelVerifiedWins).toBe(2);
  });

  it("مرزِ دقیقِ نقره: ۲ قفل، ۳ باز — و پیشرفتِ شمارشیِ صادق", () => {
    const two = base(ledgerWith(0, 2));
    expect(two.duelVerifiedWins).toBe(0);
    expect(ids(two)).not.toContain("receipt-trust");
    expect(byId("receipt-trust").progress!(two)).toBe("۰ از ۳ بردِ گواه‌دار");
    const three = base(ledgerWith(3));
    expect(three.duelVerifiedWins).toBe(3);
    expect(ids(three)).toContain("receipt-trust");
    expect(byId("receipt-trust").progress!(three)).toBe("۳ از ۳ بردِ گواه‌دار");
  });

  it("مرزِ دقیقِ طلا: ۶ قفل با پیشرفتِ سقف‌خورده، ۷ باز — زیرمجموعهٔ ۷⇒۳ در هر دو جهت", () => {
    const six = base(ledgerWith(6));
    expect(ids(six)).not.toContain("receipt-oath");
    expect(ids(six)).toContain("receipt-trust"); // نقره با ۶ باز است
    expect(byId("receipt-oath").progress!(six)).toBe("۶ از ۷ بردِ گواه‌دار");
    const seven = base(ledgerWith(7));
    expect(ids(seven)).toContain("receipt-oath");
    expect(ids(seven)).toContain("receipt-trust"); // طلا ⇒ نقره
    const three = base(ledgerWith(3));
    expect(ids(three)).toContain("receipt-trust");
    expect(ids(three)).not.toContain("receipt-oath"); // نقره‌تنها ⇒ قفلِ طلا
    const mid = base(ledgerWith(5));
    expect(ids(mid).includes("receipt-oath")).toBe(false);
    // سقفِ پیشرفت: هیچ‌وقت «۹ از ۷» دیده نمی‌شود (۹ بردِ رسیددار + ۲ ساده)
    const nine = base(ledgerWith(9, 2));
    expect(byId("receipt-oath").progress!(nine)).toBe("۷ از ۷ بردِ گواه‌دار");
    expect(byId("receipt-trust").progress!(nine)).toBe("۳ از ۳ بردِ گواه‌دار");
  });

  it("دفترچهٔ قدیمیِ بی‌sig و ledgerِ خراب: صفرِ صادق — هیچ‌کدام باز نمی‌شوند", () => {
    const legacy = base({ duelHistory: [drec()] });
    expect(legacy.duelVerifiedWins).toBe(0);
    expect(ids(legacy)).not.toContain("receipt-trust");
    expect(ids(legacy)).not.toContain("receipt-oath");
    const corrupt = buildEvalInput(baseRaw({ duelHistory: 42 }) as unknown as BuildArgs);
    expect(corrupt.duelVerifiedWins).toBe(0);
    expect(ids(corrupt)).not.toContain("receipt-trust");
  });
});

describe("newBadgeIds — قرارداد واحدِ «تازه» (Task 82)", () => {
  // (درسِ ۸۳) کلیدهای نسبی — seed مطلق بمبِ ساعتیِ منطقهٔ زمانی است
  const seven = base({ goalMetDays: [0, 1, 2, 3, 4, 5, 6].map((n) => daysAgoKey(n)) });

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
    // (Task 83) هفت روزِ پشت‌سرهمِ بی‌نجات = هفتهٔ بی‌قفسه هم باز است
    // (Task 84) dayHistoryِ غایب → جمعِ دیکته/آزمونِ پنجره صفر —
    // هر دو نشانِ رویدادی هم با هر هفتهٔ کاملِ هدف‌دار همراه می‌آیند
    expect(fresh).toEqual(["goal-week", "cage-free", "week-no-dictation", "week-no-exam"]);
  });

  it("seen خراب → فقط رشته‌ها معتبر؛ ورودیِ تازه‌وارد → خالی", () => {
    expect(newBadgeIds(seven, [null, 3, "goal-week"] as unknown as string[])).toEqual([
      "goal-first",
      "goal-five",
      "cage-free",
      "week-no-dictation",
      "week-no-exam",
    ]);
    expect(newBadgeIds(base(), [])).toEqual([]);
  });
});

// helper: گاردها عمداً از مسیرِ base نمی‌روند تا فیلترِ داخل buildEvalInput
// مستقیم پروب شود؛ تایپ با cast — ورودی‌ها عمداً خراب‌اند
function baseRaw(over: Record<string, unknown>): BuildArgs {
  return { ...BASE_DEFAULTS, ...over } as BuildArgs;
}

// ------------------------------------------------------------------
// Task 126 — خانوادهٔ ترکیبی «آتش و یخ»: داستانِ «دو سیستم، یک دستاورد».
// سه لایه: ① گیتِ دومطبقی — هیچ پله‌ای با یک سیستم تنها باز نمی‌شود
// ② نوار/راهنمای «محدودهٔ مقید» — همیشه بُعدِ عقب‌مانده نام می‌برد و
// نوار = minِ دو کسر ③ سلامتِ سه‌گانه (id یکتا/متن/تیر) توسطِ گاردهای
// سراسریِ همین فایل پوشش داده می‌شود؛ این‌جا قراردادِ رفتاری بسته می‌شود.
// ------------------------------------------------------------------
describe("hybrid family — fire & ice (Task 126)", () => {
  it("ice-fire (برنز): فقط با «یخِ ساخته‌شده AND چالش کامل‌شده» باز می‌شود — هیچ‌کدام به‌تنهایی کافی نیست", () => {
    expect(ids(base({ freezeEarnedDay: T }))).not.toContain("ice-fire");
    expect(ids(base({ results: { rush: { correct: 3, total: 5, percent: 60, at: new Date().toISOString() } } }))).not.toContain("ice-fire");
    expect(
      ids(
        base({
          freezeEarnedDay: T,
          results: { rush: { correct: 3, total: 5, percent: 60, at: new Date().toISOString() } },
        })
      )
    ).toContain("ice-fire");
  });

  it("speedy-chain (نقره): زنجیرهٔ ۷روزه AND پنج چالش — هر بُعد به‌تنهایی قفل می‌ماند", () => {
    expect(ids(base({ bestStreak: 7 }))).not.toContain("speedy-chain");
    expect(ids(base({ rushGames: 5 }))).not.toContain("speedy-chain");
    expect(ids(base({ bestStreak: 7, rushGames: 5 }))).toContain("speedy-chain");
    // مرزها: ۶ روز + ۵ چالش باز نمی‌شود؛ ۷ روز + ۴ چالش هم
    expect(ids(base({ bestStreak: 6, rushGames: 5 }))).not.toContain("speedy-chain");
    expect(ids(base({ bestStreak: 7, rushGames: 4 }))).not.toContain("speedy-chain");
  });

  it("shield-bolt (طلا): سه نجات AND صد امتیاز — دو قهرمانیِ هم‌زمان", () => {
    expect(ids(base({ freezeUsedDays: ["a", "b", "c"] }))).not.toContain("shield-bolt");
    expect(ids(base({ rushBest: 100 }))).not.toContain("shield-bolt");
    expect(ids(base({ freezeUsedDays: ["a", "b", "c"], rushBest: 100 }))).toContain("shield-bolt");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر، نه میانگین و نه بیشینه", () => {
    // زنجیره ۳٫۵/۷=۵۰٪ در برابر ۲/۵ چالش=۴۰٪ → نوار باید ۴۰ باشد
    expect(badgeProgressPct("speedy-chain", base({ bestStreak: 3, rushGames: 2 }))).toBe(40);
    // زنجیره کامل، چالش‌ها ۳/۵=۶۰٪ → نوار ۶۰
    expect(badgeProgressPct("speedy-chain", base({ bestStreak: 9, rushGames: 3 }))).toBe(60);
    // نجات ۱/۳≈۳۳٪ در برابر امتیاز ۹۰/۱۰۰=۹۰٪ → نوار ۳۳
    expect(badgeProgressPct("shield-bolt", base({ freezeUsedDays: ["a"], rushBest: 90 }))).toBe(33);
    // صفر مطلق → صفر
    expect(badgeProgressPct("speedy-chain", base())).toBe(0);
    expect(badgeProgressPct("shield-bolt", base())).toBe(0);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // زنجیره عقب است (۲/۷≈۰٫۲۹ < ۳/۵=۰٫۶) → «از ۷ روز»
    expect(d["speedy-chain"].progress?.(base({ bestStreak: 2, rushGames: 3 }))).toContain("از ۷ روز");
    // چالش عقب است (۶/۷ > ۳/۵) → «از ۵ چالش»
    expect(d["speedy-chain"].progress?.(base({ bestStreak: 6, rushGames: 3 }))).toContain("از ۵ چالش");
    // مرزِ تساویِ کسرها: ۷/۷ == ۵/۵ → رشتهٔ زنجیره (<=) — صادق است، هر دو کامل‌اند
    expect(d["speedy-chain"].progress?.(base({ bestStreak: 7, rushGames: 5 }))).toContain("از ۷ روز");
    // طلا: نجات عقب (۱/۳ < ۹۰/۱۰۰) → «از ۳ نجات»؛ امتیاز عقب → «از ۱۰۰ امتیاز»
    expect(d["shield-bolt"].progress?.(base({ freezeUsedDays: ["a"], rushBest: 90 }))).toContain("از ۳ نجات");
    expect(d["shield-bolt"].progress?.(base({ freezeUsedDays: ["a", "b", "c"], rushBest: 50 }))).toContain("از ۱۰۰ امتیاز");
  });

  it("برنزِ دومطبقِ یک‌باره بی‌نوار می‌ماند — هم‌قراردادِ ice-maker/rush-first", () => {
    expect(byId("ice-fire").progress).toBeUndefined();
    expect(byId("speedy-chain").progress).toBeDefined();
    expect(byId("shield-bolt").progress).toBeDefined();
  });
});

describe("چهارمین دوسیستمه — حضور و پیمان (Task 152)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const presenceDays = (ns: number[]) =>
    Object.fromEntries(ns.map((n) => [w(n), dh({ day: w(n), words: 1 })]));
  // ۱۴ روزِ هدف‌دارِ اخیر (درون پنجرهٔ حضور)
  const pledge14 = Array.from({ length: 14 }, (_, i) => w(i));

  it("wording و تیر و آیکن — طلا/Handshake؛ رجیستری ۵۶ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("presence-pledge").title).toBe("حضور و پیمان");
    expect(byId("presence-pledge").tier).toBe("gold");
    expect(byId("presence-pledge").icon).toBe("Handshake");
    const full = base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14 });
    expect(byId("presence-pledge").progress!(full)).toBe("۳۰ از ۳۰ روزِ حاضر");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — capstone×capstone نه «یا»", () => {
    const pres30 = base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)) });
    const pledge = base({ goalMetDays: pledge14 });
    expect(ids(pres30)).not.toContain("presence-pledge");
    expect(ids(pledge)).not.toContain("presence-pledge");
    expect(ids(base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14 }))).toContain("presence-pledge");
    // مرزها: ۲۹ روزِ حاضر + ۱۴ هدف → نه؛ ۳۰ روز + ۱۳ هدف → نه
    const pres29 = base({ dayHistory: presenceDays(Array.from({ length: 29 }, (_, i) => i)), goalMetDays: pledge14 });
    const pledge13 = base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14.slice(1) });
    expect(ids(pres29)).not.toContain("presence-pledge");
    expect(ids(pledge13)).not.toContain("presence-pledge");
  });

  it("پنجره‌هایِ دو بُعد مستقل‌اند — هدف‌دارِ کهنه (بیرونِ حافظهٔ ۳۵روزه) حضورِ امروز را نمی‌سازد", () => {
    // goalMetDays سقفِ ۱۴ دارد ولی هیچ قیدی بر تازگی‌اش نیست؛ dayHistory
    // ۳۵روزه است — ۱۴ هدفِ خیلی کهنه + حافظهٔ خالی → فقط بُعدِ پیمان پر است
    const oldGoals = Array.from({ length: 14 }, (_, i) => w(60 + i)); // بیرونِ هر دو حافظه
    const s = base({ goalMetDays: oldGoals });
    expect(s.goalDays).toBe(14);
    expect(s.activeDays35).toBe(0);
    expect(ids(s)).not.toContain("presence-pledge");
    // و برعکس: حضورِ کامل بدونِ هیچ هدفی → فقط بُعدِ حضور پر است
    const presOnly = base({ dayHistory: presenceDays(Array.from({ length: 35 }, (_, i) => i)) });
    expect(presOnly.activeDays35).toBe(35);
    expect(ids(presOnly)).not.toContain("presence-pledge");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    // حضور ۱۵/۳۰=۵۰٪ در برابر پیمان ۷/۱۴=۵۰٪ → ۵۰
    expect(badgeProgressPct("presence-pledge", base({ dayHistory: presenceDays(Array.from({ length: 15 }, (_, i) => i)), goalMetDays: pledge14.slice(7) }))).toBe(50);
    // حضور عقب: ۱۰/۳۰≈۳۳٪ در برابر ۱۴/۱۴=۱۰۰٪ → ۳۳
    expect(badgeProgressPct("presence-pledge", base({ dayHistory: presenceDays(Array.from({ length: 10 }, (_, i) => i)), goalMetDays: pledge14 }))).toBe(33);
    // پیمان عقب: ۳۰/۳۰=۱۰۰٪ در برابر ۵/۱۴≈۳۶٪ → ۳۶
    expect(badgeProgressPct("presence-pledge", base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14.slice(9) }))).toBe(36);
    expect(badgeProgressPct("presence-pledge", base())).toBe(0);
    expect(badgeProgressPct("presence-pledge", base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14 }))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ حضور", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // حضور عقب (۱۰/۳۰ < ۱۴/۱۴) → «از ۳۰ روزِ حاضر»
    expect(d["presence-pledge"].progress?.(base({ dayHistory: presenceDays(Array.from({ length: 10 }, (_, i) => i)), goalMetDays: pledge14 }))).toContain("از ۳۰ روزِ حاضر");
    // پیمان عقب (۳۰/۳۰ > ۵/۱۴) → «از ۱۴ روزِ هدف‌دار»
    expect(d["presence-pledge"].progress?.(base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14.slice(9) }))).toContain("از ۱۴ روزِ هدف‌دار");
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ حضور — صادق است، هیچ‌کدام کامل نیست
    expect(d["presence-pledge"].progress?.(base({ dayHistory: presenceDays(Array.from({ length: 15 }, (_, i) => i)), goalMetDays: pledge14.slice(7) }))).toContain("از ۳۰ روزِ حاضر");
  });

  it("بازشدنش دو نشانِ مقدمِ هر خانواده را هم روشن می‌کند — زیرمجموعه‌بودنِ درون‌خانواده‌ای", () => {
    // ۳۰ روزِ حاضر ⇒ presence-month (۲۵) باز است؛ ۱۴ هدف ⇒ goal-fortnight باز است
    const full = ids(base({ dayHistory: presenceDays(Array.from({ length: 30 }, (_, i) => i)), goalMetDays: pledge14 }));
    expect(full).toContain("presence-pledge");
    expect(full).toContain("presence-month");
    expect(full).toContain("goal-fortnight");
  });
});

describe("پنجمین دوسیستمه — دیکته و پیمان (Task 154)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  // روزهایِ دیکته‌دارِ پنجرهٔ ۱۴روزه — هر روز حداقل یک دیکته
  const dict14 = (ns: number[]) =>
    Object.fromEntries(ns.map((n) => [w(n), dh({ day: w(n), dictation: 1 })]));
  const dictDays = (n: number) => Array.from({ length: n }, (_, i) => i);
  const pledge14 = Array.from({ length: 14 }, (_, i) => w(i));

  it("wording و تیر و آیکن — طلا/NotebookPen؛ رجیستری ۵۷ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("dictation-pledge").title).toBe("دیکته و پیمان");
    expect(byId("dictation-pledge").tier).toBe("gold");
    expect(byId("dictation-pledge").icon).toBe("NotebookPen");
    const full = base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14 });
    expect(byId("dictation-pledge").progress!(full)).toBe("۱۴ از ۱۴ روزِ دیکته");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — مرزهایِ ۱۳ و ۱۴", () => {
    const dictOnly = base({ dayHistory: dict14(dictDays(14)) });
    const pledgeOnly = base({ goalMetDays: pledge14 });
    expect(ids(dictOnly)).not.toContain("dictation-pledge");
    expect(ids(pledgeOnly)).not.toContain("dictation-pledge");
    expect(ids(base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14 }))).toContain("dictation-pledge");
    // ۱۳ روزِ دیکته + ۱۴ هدف → نه؛ ۱۴ دیکته + ۱۳ هدف → نه
    const dict13 = base({ dayHistory: dict14(dictDays(13)), goalMetDays: pledge14 });
    const pledge13 = base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14.slice(1) });
    expect(ids(dict13)).not.toContain("dictation-pledge");
    expect(ids(pledge13)).not.toContain("dictation-pledge");
  });

  it("پنجره‌هایِ دو بُعد مستقل‌اند — پیمانِ همه‌عمر (سقف-۱۴) دیکتهٔ پنجره نمی‌سازد و برعکس", () => {
    // goalMetDays هیچ قیدی بر تازگی ندارد؛ ۱۴ هدفِ خیلی کهنه + حافظهٔ روزِ خالی
    // → فقط بُعدِ پیمان پر است، دیکته‌ی صفر
    const oldGoals = Array.from({ length: 14 }, (_, i) => w(60 + i)); // بیرونِ حافظهٔ ۳۵روزه
    const s = base({ goalMetDays: oldGoals });
    expect(s.goalDays).toBe(14);
    expect(s.dictationDays14).toBe(0);
    expect(ids(s)).not.toContain("dictation-pledge");
    // و برعکس: دو هفتهٔ دیکتهٔ کامل بدونِ هیچ هدفی → فقط بُعدِ دیکته پر است
    const dictOnly = base({ dayHistory: dict14(dictDays(14)) });
    expect(dictOnly.dictationDays14).toBe(14);
    expect(dictOnly.goalDays).toBe(0);
    expect(ids(dictOnly)).not.toContain("dictation-pledge");
  });

  it("زیرمجموعهٔ پنجره‌ای: ۱۴ روزِ دیکته‌دار ⇒ هفت‌روزه هم پر است — dictation-run روشن می‌شود", () => {
    // پنجرهٔ ۷ ⊂ پنجرهٔ ۱۴ (Task 90) — ۱۴روزهٔ کامل، هفت‌روزه را کامل می‌کند
    const full = ids(base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14 }));
    expect(full).toContain("dictation-pledge");
    expect(full).toContain("dictation-run");
    expect(full).toContain("goal-fortnight");
    // ولی برعکس: dictation-runِ تنها (۷ روز) دوبرابرش را نمی‌سازد
    const half = ids(base({ dayHistory: dict14(dictDays(7)) }));
    expect(half).toContain("dictation-run");
    expect(half).not.toContain("dictation-pledge");
    // و درونِ خانواده: presence-pledge (حضور×هدف) از دیکته تغذیه نمی‌کند و برعکس
    expect(full).not.toContain("presence-pledge");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    // دیکته ۷/۱۴=۵۰٪ در برابر پیمان ۷/۱۴=۵۰٪ → ۵۰
    expect(badgeProgressPct("dictation-pledge", base({ dayHistory: dict14(dictDays(7)), goalMetDays: pledge14.slice(7) }))).toBe(50);
    // دیکته عقب: ۵/۱۴≈۳۶٪ در برابر ۱۴/۱۴=۱۰۰٪ → ۳۶
    expect(badgeProgressPct("dictation-pledge", base({ dayHistory: dict14(dictDays(5)), goalMetDays: pledge14 }))).toBe(36);
    // پیمان عقب: ۱۴/۱۴=۱۰۰٪ در برابر ۹/۱۴≈۶۴٪ → ۶۴
    expect(badgeProgressPct("dictation-pledge", base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14.slice(5) }))).toBe(64);
    expect(badgeProgressPct("dictation-pledge", base())).toBe(0);
    expect(badgeProgressPct("dictation-pledge", base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14 }))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ دیکته", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // دیکته عقب (۵/۱۴ < ۱۴/۱۴) → «از ۱۴ روزِ دیکته»
    expect(d["dictation-pledge"].progress?.(base({ dayHistory: dict14(dictDays(5)), goalMetDays: pledge14 }))).toContain("از ۱۴ روزِ دیکته");
    // پیمان عقب (۱۴/۱۴ > ۹/۱۴) → «از ۱۴ روزِ هدف‌دار»
    expect(d["dictation-pledge"].progress?.(base({ dayHistory: dict14(dictDays(14)), goalMetDays: pledge14.slice(5) }))).toContain("از ۱۴ روزِ هدف‌دار");
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ دیکته — صادق است، هیچ‌کدام کامل نیست
    expect(d["dictation-pledge"].progress?.(base({ dayHistory: dict14(dictDays(7)), goalMetDays: pledge14.slice(7) }))).toContain("از ۱۴ روزِ دیکته");
  });
});

describe("ششمین دوسیستمه — آزمون و حضور (Task 156)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  // ترکیبِ دو بُعد در یک dayHistory: q روزِ آزمون‌دار (تازه‌ترین‌ها) + r روزِ
  // فقط-حاضرِ بی‌آزمون (مرورِ سبک) — کلیدها بی‌تصادم: آزمون 0..q-1، مرور q..q+r-1
  const mix = (q: number, r: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < q; i++) entries.push([w(i), dh({ day: w(i), quizzes: 1 })]);
    for (let i = 0; i < r; i++) entries.push([w(q + i), dh({ day: w(q + i), reviews: 1 })]);
    return Object.fromEntries(entries);
  };

  it("wording و تیر و آیکن — طلا/FileCheck2؛ رجیستری ۵۸؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("quiz-presence").title).toBe("آزمون و حضور");
    expect(byId("quiz-presence").tier).toBe("gold");
    expect(byId("quiz-presence").icon).toBe("FileCheck2");
    const full = base({ dayHistory: mix(14, 16) });
    expect(byId("quiz-presence").progress!(full)).toBe("۱۴ از ۱۴ روزِ آزمون");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — مرزهایِ ۱۳/۱۴ آزمون و ۲۹/۳۰ حضور", () => {
    const quizOnly = base({ dayHistory: mix(14, 0) }); // activeDays35=14 < 30
    const presOnly = base({ dayHistory: mix(0, 30) }); // quizDays14=0
    expect(ids(quizOnly)).not.toContain("quiz-presence");
    expect(ids(presOnly)).not.toContain("quiz-presence");
    // ۱۳ روزِ آزمون + حضورِ کامل → نه؛ ۱۴ آزمون + ۲۹ حاضر → نه
    const quiz13 = base({ dayHistory: mix(13, 17) });
    const pres29 = base({ dayHistory: mix(14, 15) });
    expect(ids(quiz13)).not.toContain("quiz-presence");
    expect(ids(pres29)).not.toContain("quiz-presence");
    expect(ids(base({ dayHistory: mix(14, 16) }))).toContain("quiz-presence");
  });

  it("پنجرهٔ ۳۵روزه حافظهٔ بُعدِ حضور است — فعالیتِ کهنه (۶۰+ روز) هیچ‌کدام از دو بُعد را نمی‌سازد", () => {
    // ۳۰ روزِ فقط-حاضرِ خیلی کهنه — بیرونِ هر دو پنجره (۱۴ و ۳۵)
    const oldActive = Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => [w(60 + i), dh({ day: w(60 + i), reviews: 1 })]),
    );
    const s = base({ dayHistory: oldActive });
    expect(s.activeDays35).toBe(0);
    expect(s.quizDays14).toBe(0);
    expect(ids(s)).not.toContain("quiz-presence");
  });

  it("زیرمجموعهٔ پنجره‌ای: ۱۴ روزِ آزمون‌دار ⇒ هفت‌روزه هم پر است — exam-run روشن می‌شود؛ ولی حضورِ ۳۰روزه را نمی‌سازد (شکافِ صادق)", () => {
    // quizDays14 نخستینِ مصرف‌کننده‌اش همین نشان است — و exam-run (۷⊂۱۴) رایگان روشن می‌شود
    const quizOnly = ids(base({ dayHistory: mix(14, 0) }));
    expect(quizOnly).not.toContain("quiz-presence");
    expect(quizOnly).toContain("exam-run");
    // شکافِ صادق: ۱۴ آزمون = ۱۴ روزِ حاضر — به ۳۰ نمی‌رسد؛ ماهِ درخشان قفل می‌ماند
    expect(quizOnly).not.toContain("presence-month-full");
    // و کاملش: هر دو بُعد پر → خودِ نشان + exam-run + ماهِ درخشان
    const full = ids(base({ dayHistory: mix(14, 16) }));
    expect(full).toContain("quiz-presence");
    expect(full).toContain("exam-run");
    expect(full).toContain("presence-month-full");
    // برعکس: exam-runِ تنها (۷ روز) دوبرابرش را نمی‌سازد؛ حضورِ تنها هم نمی‌سازد
    const half = ids(base({ dayHistory: mix(7, 0) }));
    expect(half).toContain("exam-run");
    expect(half).not.toContain("quiz-presence");
    const presOnly = ids(base({ dayHistory: mix(0, 30) }));
    expect(presOnly).toContain("presence-month-full");
    expect(presOnly).not.toContain("quiz-presence");
    // درونِ خانواده: پیمان‌ها (حضور×هدف، دیکته×هدف) از آزمون تغذیه نمی‌شوند
    expect(full).not.toContain("presence-pledge");
    expect(full).not.toContain("dictation-pledge");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    // آزمون ۷/۱۴=۵۰٪ در برابر حضور ۱۵/۳۰=۵۰٪ → ۵۰
    expect(badgeProgressPct("quiz-presence", base({ dayHistory: mix(7, 8) }))).toBe(50);
    // آزمون عقب: ۵/۱۴≈۳۶٪ در برابر ۳۰/۳۰=۱۰۰٪ → ۳۶
    expect(badgeProgressPct("quiz-presence", base({ dayHistory: mix(5, 25) }))).toBe(36);
    // حضور عقب: ۹/۱۴≈۶۴٪ در برابر ۹/۳۰=۳۰٪ → ۳۰
    expect(badgeProgressPct("quiz-presence", base({ dayHistory: mix(9, 0) }))).toBe(30);
    expect(badgeProgressPct("quiz-presence", base())).toBe(0);
    expect(badgeProgressPct("quiz-presence", base({ dayHistory: mix(14, 16) }))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ آزمون", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // آزمون عقب (۵/۱۴ < ۳۰/۳۰) → «از ۱۴ روزِ آزمون»
    expect(d["quiz-presence"].progress?.(base({ dayHistory: mix(5, 25) }))).toContain("از ۱۴ روزِ آزمون");
    // حضور عقب (۱۴/۱۴ > ۹/۳۰) → «از ۳۰ روزِ حاضر»
    expect(d["quiz-presence"].progress?.(base({ dayHistory: mix(9, 0) }))).toContain("از ۳۰ روزِ حاضر");
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ آزمون — صادق است، هیچ‌کدام کامل نیست
    expect(d["quiz-presence"].progress?.(base({ dayHistory: mix(7, 8) }))).toContain("از ۱۴ روزِ آزمون");
  });
});

describe("هفتمین دوسیستمه — مرور و دیکته (Task 158)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  // r روزِ مروردارِ بی‌دیکته (تازه‌ترین‌ها) + d روزِ فقط-دیکته — کلیدها
  // بی-تصادم: مرور 0..r-1، دیکته r..r+d-1 (توجه: r+d ≤ 14 تا درونِ
  // پنجرهٔ ۱۴روزه بمانند — پنجره = ۱۴ روزِ اخیر)
  const mix = (r: number, d: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < r; i++) entries.push([w(i), dh({ day: w(i), reviews: 1 })]);
    for (let i = 0; i < d; i++) entries.push([w(r + i), dh({ day: w(r + i), dictation: 1 })]);
    return Object.fromEntries(entries);
  };
  // دوقلو: هر روزِ پنجره هم مرور هم دیکته — reviewsDays14 = dictationDays14 = n
  const twin = (n: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < n; i++)
      entries.push([w(i), dh({ day: w(i), reviews: 1, dictation: 1 })]);
    return Object.fromEntries(entries);
  };

  it("wording و تیر و آیکن — طلا/BookCheck؛ رجیستری ۵۹ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("review-dictation").title).toBe("مرور و دیکته");
    expect(byId("review-dictation").tier).toBe("gold");
    expect(byId("review-dictation").icon).toBe("BookCheck");
    const full = base({ dayHistory: twin(14) });
    expect(byId("review-dictation").progress!(full)).toBe("۱۴ از ۱۴ روزِ مرور");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — مرزهایِ ۱۳/۱۴ در هر دو بُعد", () => {
    const revOnly = base({ dayHistory: mix(14, 0) }); // dictationDays14=0
    const dictOnly = base({ dayHistory: mix(0, 14) }); // reviewsDays14=0
    expect(ids(revOnly)).not.toContain("review-dictation");
    expect(ids(dictOnly)).not.toContain("review-dictation");
    // دوقلوی ۱۳تایی → نه؛ مرورِ کامل + دیکتهِ ۱۳ (روزِ سیزدهم فقط مرور) → نه؛ برعکس هم → نه
    expect(ids(base({ dayHistory: twin(13) }))).not.toContain("review-dictation");
    const rev14dict13 = Object.fromEntries([
      ...Object.entries(twin(13)),
      [w(13), dh({ day: w(13), reviews: 1 })],
    ]);
    expect(ids(base({ dayHistory: rev14dict13 }))).not.toContain("review-dictation");
    const dict14rev13 = Object.fromEntries([
      ...Object.entries(twin(13)),
      [w(13), dh({ day: w(13), dictation: 1 })],
    ]);
    expect(ids(base({ dayHistory: dict14rev13 }))).not.toContain("review-dictation");
    expect(ids(base({ dayHistory: twin(14) }))).toContain("review-dictation");
  });

  it("پنجرهٔ ۱۴روزه حافظهٔ هر دو بُعد است — فعالیتِ کهنه (۶۰+ روز) هیچ‌کدام را نمی‌سازد", () => {
    // ۲۰ روزِ دوقلوی خیلی کهنه — بیرونِ هر دو پنجرهٔ ۱۴روزه (و حضورِ ۳۵روزه)
    const oldBoth = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        w(60 + i),
        dh({ day: w(60 + i), reviews: 1, dictation: 1 }),
      ]),
    );
    const s = base({ dayHistory: oldBoth });
    expect(s.reviewsDays14).toBe(0);
    expect(s.dictationDays14).toBe(0);
    expect(ids(s)).not.toContain("review-dictation");
  });

  it("زیرمجموعهٔ پنجره‌ای: دوقلوی ۱۴ ⇒ review-run و dictation-run روشن — ولی ماراتنِ دوهفته‌ای تاریک می‌ماند (شکافِ صادقِ سوم)", () => {
    // ۷ ⊂ ۱۴: هر دو رانِ هفتگی رایگان روشن می‌شوند
    const full = ids(base({ dayHistory: twin(14) }));
    expect(full).toContain("review-dictation");
    expect(full).toContain("review-run");
    expect(full).toContain("dictation-run");
    // شکافِ صادقِ سوم: ماراتن هر سه بُعد را می‌خواهد — آزمونِ خالی، ماراتن را نمی‌سازد
    expect(full).not.toContain("marathon-run");
    // برعکس: دوقلوی ۷تایی هر دو ران را دارد ولی دوبرابرش را نمی‌سازد
    const half = ids(base({ dayHistory: twin(7) }));
    expect(half).toContain("review-run");
    expect(half).toContain("dictation-run");
    expect(half).not.toContain("review-dictation");
    // مرورِ تنها دیکته را نمی‌سازد و برعکس
    const revOnly = ids(base({ dayHistory: mix(14, 0) }));
    expect(revOnly).toContain("review-run");
    expect(revOnly).not.toContain("dictation-run");
    expect(revOnly).not.toContain("review-dictation");
    const dictOnly = ids(base({ dayHistory: mix(0, 14) }));
    expect(dictOnly).toContain("dictation-run");
    expect(dictOnly).not.toContain("review-run");
    // درونِ خانواده: پیمان‌ها و آزمون×حضور از مرور/دیکته تغذیه نمی‌شوند
    expect(full).not.toContain("presence-pledge");
    expect(full).not.toContain("dictation-pledge");
    expect(full).not.toContain("quiz-presence");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    // دوقلوی ۷: هر دو ۵۰٪ → ۵۰
    expect(badgeProgressPct("review-dictation", base({ dayHistory: twin(7) }))).toBe(50);
    // مرور عقب: ۵/۱۴≈۳۶٪ در برابر ۹/۱۴≈۶۴٪ → ۳۶
    expect(badgeProgressPct("review-dictation", base({ dayHistory: mix(5, 9) }))).toBe(36);
    // دیکته عقب: ۹/۱۴≈۶۴٪ در برابر ۲/۱۴≈۱۴٪ → ۱۴
    expect(badgeProgressPct("review-dictation", base({ dayHistory: mix(9, 2) }))).toBe(14);
    expect(badgeProgressPct("review-dictation", base())).toBe(0);
    expect(badgeProgressPct("review-dictation", base({ dayHistory: twin(14) }))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ مرور", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // مرور عقب (۵/۱۴ < ۹/۱۴) → «از ۱۴ روزِ مرور»
    expect(d["review-dictation"].progress?.(base({ dayHistory: mix(5, 9) }))).toContain(
      "از ۱۴ روزِ مرور",
    );
    // دیکته عقب (۹/۱۴ > ۲/۱۴) → «از ۱۴ روزِ دیکته»
    expect(d["review-dictation"].progress?.(base({ dayHistory: mix(9, 2) }))).toContain(
      "از ۱۴ روزِ دیکته",
    );
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ مرور — صادق است، هیچ‌کدام کامل نیست
    expect(d["review-dictation"].progress?.(base({ dayHistory: twin(7) }))).toContain(
      "از ۱۴ روزِ مرور",
    );
  });
});

describe("هشتمین دوسیستمه — مرور و آزمون (Task 160)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  // r روزِ مروردارِ بی‌آزمون (تازه‌ترین‌ها) + q روزِ فقط-آزمون‌دار — کلیدها
  // بی-تصادم: مرور 0..r-1، آزمون r..r+q-1 (توجه: r+q ≤ 14 تا درونِ
  // پنجرهٔ ۱۴روزه بمانند — پنجره = ۱۴ روزِ اخیر)
  const mix = (r: number, q: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < r; i++) entries.push([w(i), dh({ day: w(i), reviews: 1 })]);
    for (let i = 0; i < q; i++) entries.push([w(r + i), dh({ day: w(r + i), quizzes: 1 })]);
    return Object.fromEntries(entries);
  };
  // دوقلو: هر روزِ پنجره هم مرور هم آزمون — reviewsDays14 = quizDays14 = n
  const twin = (n: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < n; i++)
      entries.push([w(i), dh({ day: w(i), reviews: 1, quizzes: 1 })]);
    return Object.fromEntries(entries);
  };

  it("wording و تیر و آیکن — طلا/RotateCcw؛ رجیستری ۶۰ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("review-quiz").title).toBe("مرور و آزمون");
    expect(byId("review-quiz").tier).toBe("gold");
    expect(byId("review-quiz").icon).toBe("RotateCcw");
    const full = base({ dayHistory: twin(14) });
    expect(byId("review-quiz").progress!(full)).toBe("۱۴ از ۱۴ روزِ مرور");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — مرزهایِ ۱۳/۱۴ در هر دو بُعد", () => {
    const revOnly = base({ dayHistory: mix(14, 0) }); // quizDays14=0
    const quizOnly = base({ dayHistory: mix(0, 14) }); // reviewsDays14=0
    expect(ids(revOnly)).not.toContain("review-quiz");
    expect(ids(quizOnly)).not.toContain("review-quiz");
    // دوقلوی ۱۳تایی → نه؛ مرورِ کامل + آزمونِ ۱۳ (روزِ سیزدهم فقط مرور) → نه؛ برعکس هم → نه
    expect(ids(base({ dayHistory: twin(13) }))).not.toContain("review-quiz");
    const rev14quiz13 = Object.fromEntries([
      ...Object.entries(twin(13)),
      [w(13), dh({ day: w(13), reviews: 1 })],
    ]);
    expect(ids(base({ dayHistory: rev14quiz13 }))).not.toContain("review-quiz");
    const quiz14rev13 = Object.fromEntries([
      ...Object.entries(twin(13)),
      [w(13), dh({ day: w(13), quizzes: 1 })],
    ]);
    expect(ids(base({ dayHistory: quiz14rev13 }))).not.toContain("review-quiz");
    expect(ids(base({ dayHistory: twin(14) }))).toContain("review-quiz");
  });

  it("پنجرهٔ ۱۴روزه حافظهٔ هر دو بُعد است — فعالیتِ کهنه (۶۰+ روز) هیچ‌کدام را نمی‌سازد", () => {
    // ۲۰ روزِ دوقلوی خیلی کهنه — بیرونِ هر دو پنجرهٔ ۱۴روزه (و حضورِ ۳۵روزه)
    const oldBoth = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        w(60 + i),
        dh({ day: w(60 + i), reviews: 1, quizzes: 1 }),
      ]),
    );
    const s = base({ dayHistory: oldBoth });
    expect(s.reviewsDays14).toBe(0);
    expect(s.quizDays14).toBe(0);
    expect(ids(s)).not.toContain("review-quiz");
  });

  it("زیرمجموعهٔ پنجره‌ای: دوقلوی ۱۴ ⇒ review-run و exam-run روشن — ولی ماراتنِ دوهفته‌ای تاریک می‌ماند (شکافِ صادقِ چهارم)", () => {
    // ۷ ⊂ ۱۴: هر دو رانِ هفتگی رایگان روشن می‌شوند
    const full = ids(base({ dayHistory: twin(14) }));
    expect(full).toContain("review-quiz");
    expect(full).toContain("review-run");
    expect(full).toContain("exam-run");
    // شکافِ صادقِ چهارم: ماراتن هر سه بُعد را می‌خواهد — دیکتهِ خالی، ماراتن را نمی‌سازد
    expect(full).not.toContain("marathon-run");
    // برعکس: دوقلوی ۷تایی هر دو ران را دارد ولی دوبرابرش را نمی‌سازد
    const half = ids(base({ dayHistory: twin(7) }));
    expect(half).toContain("review-run");
    expect(half).toContain("exam-run");
    expect(half).not.toContain("review-quiz");
    // مرورِ تنها آزمون را نمی‌سازد و برعکس
    const revOnly = ids(base({ dayHistory: mix(14, 0) }));
    expect(revOnly).toContain("review-run");
    expect(revOnly).not.toContain("exam-run");
    expect(revOnly).not.toContain("review-quiz");
    const quizOnly = ids(base({ dayHistory: mix(0, 14) }));
    expect(quizOnly).toContain("exam-run");
    expect(quizOnly).not.toContain("review-run");
    // درونِ خانواده: پیمان‌ها و آزمون×حضور و مرور×دیکته از مرور/آزمون تغذیه نمی‌شوند
    expect(full).not.toContain("presence-pledge");
    expect(full).not.toContain("dictation-pledge");
    expect(full).not.toContain("quiz-presence");
    expect(full).not.toContain("review-dictation");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    // دوقلوی ۷: هر دو ۵۰٪ → ۵۰
    expect(badgeProgressPct("review-quiz", base({ dayHistory: twin(7) }))).toBe(50);
    // مرور عقب: ۵/۱۴≈۳۶٪ در برابر ۹/۱۴≈۶۴٪ → ۳۶
    expect(badgeProgressPct("review-quiz", base({ dayHistory: mix(5, 9) }))).toBe(36);
    // آزمون عقب: ۹/۱۴≈۶۴٪ در برابر ۲/۱۴≈۱۴٪ → ۱۴
    expect(badgeProgressPct("review-quiz", base({ dayHistory: mix(9, 2) }))).toBe(14);
    expect(badgeProgressPct("review-quiz", base())).toBe(0);
    expect(badgeProgressPct("review-quiz", base({ dayHistory: twin(14) }))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ مرور", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // مرور عقب (۵/۱۴ < ۹/۱۴) → «از ۱۴ روزِ مرور»
    expect(d["review-quiz"].progress?.(base({ dayHistory: mix(5, 9) }))).toContain(
      "از ۱۴ روزِ مرور",
    );
    // آزمون عقب (۹/۱۴ > ۲/۱۴) → «از ۱۴ روزِ آزمون»
    expect(d["review-quiz"].progress?.(base({ dayHistory: mix(9, 2) }))).toContain(
      "از ۱۴ روزِ آزمون",
    );
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ مرور — صادق است، هیچ‌کدام کامل نیست
    expect(d["review-quiz"].progress?.(base({ dayHistory: twin(7) }))).toContain(
      "از ۱۴ روزِ مرور",
    );
  });
});

describe("نهمین دوسیستمه — واژه و برق (Task 162)", () => {
  const w = (n: number) => daysAgoKey(n);
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  // wd روزِ واژه‌دارِ بی‌برق (تازه‌ترین‌ها) + rd روزِ فقط-برق‌دار — کلیدها
  // بی-تصادم: واژه 0..wd-1، برق wd..wd+rd-1 (توجه: wd+rd ≤ 14 تا درونِ
  // پنجرهٔ ۱۴روزه بمانند — پنجره = ۱۴ روزِ اخیر)
  const mix = (wd: number, rd: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < wd; i++) entries.push([w(i), dh({ day: w(i), words: 1 })]);
    for (let i = 0; i < rd; i++) entries.push([w(wd + i), dh({ day: w(wd + i), rush: 1 })]);
    return Object.fromEntries(entries);
  };
  // دوقلو: هر روزِ پنجره هم واژه هم برق — wordsDays14 = rushDays14 = n
  const twin = (n: number) => {
    const entries: [string, ReturnType<typeof dh>][] = [];
    for (let i = 0; i < n; i++)
      entries.push([w(i), dh({ day: w(i), words: 1, rush: 1 })]);
    return Object.fromEntries(entries);
  };

  it("wording و تیر و آیکن — طلا/Sprout؛ رجیستری ۶۱ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("words-rush").title).toBe("واژه و برق");
    expect(byId("words-rush").tier).toBe("gold");
    expect(byId("words-rush").icon).toBe("Sprout");
    expect(BADGES.length).toBe(62);
    const full = base({ dayHistory: twin(14) });
    expect(byId("words-rush").progress!(full)).toBe("۱۴ از ۱۴ روزِ واژه");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — مرزهایِ ۱۳/۱۴ در هر دو بُعد", () => {
    const wordsOnly = base({ dayHistory: mix(14, 0) }); // rushDays14=0
    const rushOnly = base({ dayHistory: mix(0, 14) }); // wordsDays14=0
    expect(ids(wordsOnly)).not.toContain("words-rush");
    expect(ids(rushOnly)).not.toContain("words-rush");
    // دوقلوی ۱۳تایی → نه؛ واژهِ کامل + برقِ ۱۳ (روزِ سیزدهم فقط واژه) → نه؛ برعکس هم → نه
    expect(ids(base({ dayHistory: twin(13) }))).not.toContain("words-rush");
    const words14rush13 = Object.fromEntries([
      ...Object.entries(twin(13)),
      [w(13), dh({ day: w(13), words: 1 })],
    ]);
    expect(ids(base({ dayHistory: words14rush13 }))).not.toContain("words-rush");
    const rush14words13 = Object.fromEntries([
      ...Object.entries(twin(13)),
      [w(13), dh({ day: w(13), rush: 1 })],
    ]);
    expect(ids(base({ dayHistory: rush14words13 }))).not.toContain("words-rush");
    expect(ids(base({ dayHistory: twin(14) }))).toContain("words-rush");
  });

  it("پنجرهٔ ۱۴روزه حافظهٔ هر دو بُعد است — فعالیتِ کهنه (۶۰+ روز) هیچ‌کدام را نمی‌سازد", () => {
    // ۲۰ روزِ دوقلوی خیلی کهنه — بیرونِ هر دو پنجرهٔ ۱۴روزه
    const oldBoth = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        w(60 + i),
        dh({ day: w(60 + i), words: 1, rush: 1 }),
      ]),
    );
    const s = base({ dayHistory: oldBoth });
    expect(s.wordsDays14).toBe(0);
    expect(s.rushDays14).toBe(0);
    expect(ids(s)).not.toContain("words-rush");
  });

  it("استقلالِ ابعادِ تازه: دوقلوی واژه‌برق، ماراتن و پنج‌مهارتی و خانوادهٔ قدیم را روشن نمی‌کند (شکافِ صادقِ پنجم)", () => {
    const full = ids(base({ dayHistory: twin(14) }));
    expect(full).toContain("words-rush");
    // ماراتنِ دوهفته‌ای مرور+دیکته+آزمون می‌خواهد — هر سه غریب می‌مانند
    expect(full).not.toContain("marathon-run");
    // هفتهٔ پنج‌مهارتی هر پنج مهارت را می‌خواهد — واژه+برق فقط ۲/۵ است
    expect(full).not.toContain("five-skill-week");
    // کلِ خانوادهٔ قدیمیِ ترکیبی از این دو بُعد تغذیه نمی‌شود
    expect(full).not.toContain("review-quiz");
    expect(full).not.toContain("review-dictation");
    expect(full).not.toContain("quiz-presence");
    expect(full).not.toContain("presence-pledge");
    expect(full).not.toContain("dictation-pledge");
    // دوقلوی ۷تایی هم هنوز دوبروش نمی‌سازد
    const half = ids(base({ dayHistory: twin(7) }));
    expect(half).not.toContain("words-rush");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    // دوقلوی ۷: هر دو ۵۰٪ → ۵۰
    expect(badgeProgressPct("words-rush", base({ dayHistory: twin(7) }))).toBe(50);
    // واژه عقب: ۵/۱۴≈۳۶٪ در برابر ۹/۱۴≈۶۴٪ → ۳۶
    expect(badgeProgressPct("words-rush", base({ dayHistory: mix(5, 9) }))).toBe(36);
    // برق عقب: ۹/۱۴≈۶۴٪ در برابر ۲/۱۴≈۱۴٪ → ۱۴
    expect(badgeProgressPct("words-rush", base({ dayHistory: mix(9, 2) }))).toBe(14);
    expect(badgeProgressPct("words-rush", base())).toBe(0);
    expect(badgeProgressPct("words-rush", base({ dayHistory: twin(14) }))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ واژه", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // واژه عقب (۵/۱۴ < ۹/۱۴) → «از ۱۴ روزِ واژه»
    expect(d["words-rush"].progress?.(base({ dayHistory: mix(5, 9) }))).toContain(
      "از ۱۴ روزِ واژه",
    );
    // برق عقب (۹/۱۴ > ۲/۱۴) → «از ۱۴ روزِ برق»
    expect(d["words-rush"].progress?.(base({ dayHistory: mix(9, 2) }))).toContain(
      "از ۱۴ روزِ برق",
    );
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ واژه — صادق است، هیچ‌کدام کامل نیست
    expect(d["words-rush"].progress?.(base({ dayHistory: twin(7) }))).toContain(
      "از ۱۴ روزِ واژه",
    );
  });
});

// ------------------------------------------------------------------
// Task 165 — دهمین دوسیستمه: گرامر×واژه — نخستین جفت با بُعدِ نهم.
// استخراجِ بُعد از results است نه dayHistory (نخستینِ این‌چنینی):
// شمارِ تاریخ‌هایِ متمایزِ کلیدهایِ g:* درونِ پنجرهٔ ۱۴روزه.
// ------------------------------------------------------------------
describe("دهمین دوسیستمه — گرامر و واژه (Task 165)", () => {
  const w = (n: number) => daysAgoKey(n);
  // n روزِ گرامردار — هر روز یک کلیدِ g:* متمایز با atِ همان روز؛
  // سه خانوادهٔ کلید (ایستگاه/کاوش/درس) هم‌ارز شمرده می‌شوند
  const grammarDays = (n: number, offset = 0) =>
    Object.fromEntries(
      Array.from({ length: n }, (_, i) => [
        `g:st:d${i}`,
        { correct: 3, total: 5, percent: 60, at: w(i + offset) },
      ]),
    );
  const dh = (over: Record<string, unknown>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const wordsOnly = (n: number) =>
    Object.fromEntries(
      Array.from({ length: n }, (_, i) => [w(i), dh({ day: w(i), words: 1 })]),
    );
  const twin = (n: number) => ({
    results: grammarDays(n),
    dayHistory: wordsOnly(n),
  });
  // گرامرِ g روزِ اول + واژه از روزِ g به بعد — بدونِ تصادم (g+w ≤ 14)
  const mix = (g: number, wd: number) => ({
    results: grammarDays(g),
    dayHistory: Object.fromEntries(
      Array.from({ length: wd }, (_, i) => [w(g + i), dh({ day: w(g + i), words: 1 })]),
    ),
  });

  it("wording و تیر و آیکن — طلا/TrainFront؛ رجیستری ۶۲ شد؛ پیشرفتِ سقف‌خورده", () => {
    expect(byId("grammar-words").title).toBe("گرامر و واژه");
    expect(byId("grammar-words").tier).toBe("gold");
    expect(byId("grammar-words").icon).toBe("TrainFront");
    expect(BADGES.length).toBe(62);
    const full = base(twin(14));
    expect(full.grammarDays14).toBe(14);
    expect(byId("grammar-words").progress!(full)).toBe("۱۴ از ۱۴ روزِ گرامر");
  });

  it("پیوندِ صادق: هر بُعد به‌تنهایی قفل می‌ماند — مرزهایِ ۱۳/۱۴ در هر دو بُعد", () => {
    expect(ids(base({ results: grammarDays(14) }))).not.toContain("grammar-words");
    expect(ids(base({ dayHistory: wordsOnly(14) }))).not.toContain("grammar-words");
    // دوقلوی ۱۳تایی → نه؛ گرامرِ کامل + واژهٔ ۱۳ (روزِ سیزدهم فقط گرامر) → نه؛ برعکس هم → نه
    expect(ids(base(twin(13)))).not.toContain("grammar-words");
    const grammar14words13 = {
      results: grammarDays(14),
      dayHistory: wordsOnly(13),
    };
    expect(ids(base(grammar14words13))).not.toContain("grammar-words");
    const grammar13words14 = {
      results: grammarDays(13),
      dayHistory: wordsOnly(14),
    };
    expect(ids(base(grammar13words14))).not.toContain("grammar-words");
    expect(ids(base(twin(14)))).toContain("grammar-words");
  });

  it("استخراجِ تاریخ‌پایه: روزِ تکراری یک‌بار می‌شمارد؛ کلیدهایِ غیرِ g: و کهنه (۱۴+) هیچ‌کدام", () => {
    // سه نتیجه در یک روز (ایستگاه+کاوش+درس) = یک روزِ گرامردار
    const oneDay = {
      results: {
        "g:st:g-order": { correct: 3, total: 5, percent: 60, at: w(0) },
        "g:probe:l1": { correct: 2, total: 4, percent: 50, at: w(0) },
        "g:ls:g-order": { correct: 3, total: 3, percent: 100, at: w(0) },
      },
    };
    expect(base(oneDay).grammarDays14).toBe(1);
    // کلیدهایِ غیرِ گرامری — g: نیستند (سؤالِ درس l1-g14، دیکته، انشا)
    const nonGrammar = {
      results: {
        "l1-g14": { correct: 3, total: 5, percent: 60, at: w(0) },
        "1:l1:dictation": { correct: 3, total: 5, percent: 60, at: w(1) },
        "1:l2:writing": { correct: 3, total: 5, percent: 60, at: w(2) },
      },
    };
    expect(base(nonGrammar).grammarDays14).toBe(0);
    // گرامرِ کهنه — بیرونِ پنجرهٔ ۱۴روزه (روزِ ۱۴ تا ۳۳)
    const oldGrammar = { results: grammarDays(20, 14) };
    expect(base(oldGrammar).grammarDays14).toBe(0);
    // مرزِ دقیقِ پنجره: روزِ ۱۳ (تازه‌ترینِ دور) می‌شمارد
    const edge = { results: grammarDays(1, 13) };
    expect(base(edge).grammarDays14).toBe(1);
  });

  it("استقلال: دوقلوی گرامر-واژه، ماراتن و پنج‌مهارتی و واژه‌برق و خانوادهٔ قدیم را روشن نمی‌کند (شکافِ صادقِ ششم)", () => {
    const full = ids(base(twin(14)));
    expect(full).toContain("grammar-words");
    // ماراتن مرور+دیکته+آزمون می‌خواهد — هر سه غریب می‌مانند
    expect(full).not.toContain("marathon-run");
    // هفتهٔ پنج‌مهارتی — گرامر در آن شمرده نمی‌شود؛ ۲/۵
    expect(full).not.toContain("five-skill-week");
    // واژه‌برق برق می‌خواهد — برقِ خالی
    expect(full).not.toContain("words-rush");
    // کلِ خانوادهٔ قدیمیِ ترکیبی
    expect(full).not.toContain("review-quiz");
    expect(full).not.toContain("review-dictation");
    expect(full).not.toContain("quiz-presence");
    expect(full).not.toContain("presence-pledge");
    expect(full).not.toContain("dictation-pledge");
    // برعکس: واژه‌برقِ کامل گرامر را نمی‌سازد (استخراجِ دو دنیای جدا)
    const wordsRush = ids(base({ dayHistory: Object.fromEntries(
      Array.from({ length: 14 }, (_, i) => [w(i), dh({ day: w(i), words: 1, rush: 1 })]),
    ) }));
    expect(wordsRush).toContain("words-rush");
    expect(wordsRush).not.toContain("grammar-words");
  });

  it("نوارِ پیشرفت = محدودهٔ مقید — minِ دو کسر؛ صفر مطلق صفر، کامل مطلق صد", () => {
    expect(badgeProgressPct("grammar-words", base(twin(7)))).toBe(50);
    // گرامر عقب: ۵/۱۴≈۳۶٪ در برابر ۹/۱۴≈۶۴٪ → ۳۶
    expect(badgeProgressPct("grammar-words", base(mix(5, 9)))).toBe(36);
    // واژه عقب: ۹/۱۴≈۶۴٪ در برابر ۲/۱۴≈۱۴٪ → ۱۴
    expect(badgeProgressPct("grammar-words", base(mix(9, 2)))).toBe(14);
    expect(badgeProgressPct("grammar-words", base())).toBe(0);
    expect(badgeProgressPct("grammar-words", base(twin(14)))).toBe(100);
  });

  it("راهنمای قفل بُعدِ عقب‌مانده را نام می‌برد — هم‌قرارداد با نوار؛ مرزِ تساوی → رشتهٔ گرامر", () => {
    const d = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    // گرامر عقب (۵/۱۴ < ۹/۱۴) → «از ۱۴ روزِ گرامر»
    expect(d["grammar-words"].progress?.(base(mix(5, 9)))).toContain(
      "از ۱۴ روزِ گرامر",
    );
    // واژه عقب (۹/۱۴ > ۲/۱۴) → «از ۱۴ روزِ واژه»
    expect(d["grammar-words"].progress?.(base(mix(9, 2)))).toContain(
      "از ۱۴ روزِ واژه",
    );
    // تساویِ کسرها (هر دو ۵۰٪) → <= یعنی رشتهٔ گرامر — صادق است، هیچ‌کدام کامل نیست
    expect(d["grammar-words"].progress?.(base(twin(7)))).toContain(
      "از ۱۴ روزِ گرامر",
    );
  });
});
