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
  unlockedBadgeIds,
  type BadgeDef,
} from "@/lib/achievements";

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

// helper: گاردها عمداً از مسیرِ base نمی‌روند تا فیلترِ داخل buildEvalInput
// مستقیم پروب شود؛ تایپ با cast — ورودی‌ها عمداً خراب‌اند
function baseRaw(over: Record<string, unknown>): BuildArgs {
  return { ...BASE_DEFAULTS, ...over } as BuildArgs;
}
