// ------------------------------------------------------------------
// راند ۲۹۸ — خانوادهٔ نشان‌های «کتاب‌خوان» (story-5 / story-12 / story-51).
// قراردادها با کلیدِ ثابت قفل می‌شوند (هم‌الگوی achievements.test):
//   ① شمارشِ صادق: storiesDone فقط کلیدهایِ معتبرِ سه‌گانه را میشمارد —
//     payloadِ خراب/کلیدِ بیگانه هرگز شمارش نمیشود، هرگز نمیترکاند
//   ② گیت‌های ۵/۱۲/۵۱ مرزی — ۴→۵ و ۱۱→۱۲ و ۵۰→۵۱
//   ③ پیشرفتِ کاشیِ قفل — progress همیشه راه نشان میدهد
//   ④ رجیستری: سه نشان با تیر/آیکنِ درست و سرشماریِ ۵۶
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";

type BuildArgs = Parameters<typeof buildEvalInput>[0];

const base = (over: Partial<BuildArgs> = {}) =>
  buildEvalInput({
    known: {},
    results: {},
    history: {},
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    streak: 0,
    bestStreak: 0,
    mistakes: {},
    ...over,
  } as unknown as Parameters<typeof buildEvalInput>[0]);

const done = (ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, { score: 6, total: 6, day: "2026-10-22" }]));

const ids = (input: ReturnType<typeof buildEvalInput>) => [...unlockedBadgeIds(input)];

describe("r298 — خانوادهٔ کتاب‌خوان: شمارشِ صادق (storiesDone)", () => {
  it("بدونِ libraryDone → صفر؛ با کلیدهایِ معتبر → شمارشِ درست", () => {
    expect(base({}).storiesDone).toBe(0);
    expect(base({ libraryDone: done(["s1-1", "s1-2"]) }).storiesDone).toBe(2);
  });

  it("کلیدِ بیگانه و payloadِ خراب شمرده نمیشود و نمیترکاند", () => {
    expect(
      base({ libraryDone: { "s1-1": { score: 6, total: 6, day: "2026-10-22" }, "hack-x": { score: 6, total: 6, day: "2026-10-22" } } }).storiesDone,
    ).toBe(1);
    expect(base({ libraryDone: "broken" as unknown as Record<string, never> }).storiesDone).toBe(0);
    expect(base({ libraryDone: null as unknown as Record<string, never> }).storiesDone).toBe(0);
  });
});

describe("r298 — گیت‌های مرزیِ ۵/۱۲/۵۱", () => {
  it("۴ داستان → هیچ‌کدام؛ ۵ داستان → فقط کتاب‌خوان (برنز)", () => {
    const four = base({ libraryDone: done(["s1-1", "s1-2", "s1-3", "s1-4"]) });
    expect(ids(four)).not.toContain("story-5");
    const five = base({ libraryDone: done(["s1-1", "s1-2", "s1-3", "s1-4", "s1-5"]) });
    expect(ids(five)).toContain("story-5");
    expect(ids(five)).not.toContain("story-12");
  });

  it("۱۱ داستان → هنوز نه؛ ۱۲ داستان → داستان‌دان (نقره) و کتاب‌خوان هم میماند", () => {
    const eleven = base({
      libraryDone: done(["s1-1", "s1-2", "s1-3", "s1-4", "s1-5", "s1-6", "s1-7", "s1-8", "s1-9", "s1-10", "s1-11"]),
    });
    expect(ids(eleven)).toContain("story-5");
    expect(ids(eleven)).not.toContain("story-12");
    const twelve = base({
      libraryDone: done(["s1-1", "s1-2", "s1-3", "s1-4", "s1-5", "s1-6", "s1-7", "s1-8", "s1-9", "s1-10", "s1-11", "s1-12"]),
    });
    expect(ids(twelve)).toContain("story-12");
  });

  it("۵۰ داستان → سه‌گانه بسته نیست؛ ۵۱ → سه‌گانهٔ هیل (طلا)", () => {
    const all: string[] = [];
    for (let i = 1; i <= 27; i++) all.push(`s1-${i}`);
    for (let i = 1; i <= 12; i++) all.push(`s2-${i}`);
    for (let i = 1; i <= 12; i++) all.push(`s3-${i}`);
    expect(all.length).toBe(51);
    expect(ids(base({ libraryDone: done(all.slice(0, 50)) }))).not.toContain("story-51");
    expect(ids(base({ libraryDone: done(all) }))).toContain("story-51");
  });
});

describe("r298 — کاشیِ قفل و رجیستری", () => {
  it("پیشرفتِ قفل — progress همیشه راه را نشان میدهد (حتی صفر)", () => {
    const b5 = BADGES.find((b) => b.id === "story-5")!;
    const b12 = BADGES.find((b) => b.id === "story-12")!;
    const b51 = BADGES.find((b) => b.id === "story-51")!;
    expect(b5.progress!(base({}))).toBe("۰ از ۵ داستان");
    expect(b5.progress!(base({ libraryDone: done(["s1-1", "s1-2", "s1-3"]) }))).toBe("۳ از ۵ داستان");
    expect(b12.progress!(base({ libraryDone: done(Array.from({ length: 7 }, (_, i) => `s1-${i + 1}`)) }))).toBe("۷ از ۱۲ داستان");
    expect(b51.progress!(base({ libraryDone: done(Array.from({ length: 20 }, (_, i) => `s1-${i + 1}`)) }))).toBe("۲۰ از ۵۱ داستان");
    // سقف — بیشتر از سهمی که نشان میخواهد هرگز نمایش داده نمیشود
    expect(b12.progress!(base({ libraryDone: done(Array.from({ length: 30 }, (_, i) => `s1-${i + 1}`)) }))).toBe("۱۲ از ۱۲ داستان");
  });

  it("تیر و آیکن — برنز/نقره/طلا با BookOpen/BookMarked/Library", () => {
    expect(BADGES.find((b) => b.id === "story-5")).toMatchObject({ tier: "bronze", icon: "BookOpen" });
    expect(BADGES.find((b) => b.id === "story-12")).toMatchObject({ tier: "silver", icon: "BookMarked" });
    expect(BADGES.find((b) => b.id === "story-51")).toMatchObject({ tier: "gold", icon: "Library" });
  });

  it("سرشماریِ رجیستری — ۵۶ نشان (r298: +۳ کتاب‌خوان)", () => {
    expect(BADGES.length).toBe(56);
  });
});
