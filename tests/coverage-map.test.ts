// تسک ۱۷۴ «نقشهٔ پوشش» — قراردادِ خالص: جدولِ درس × مهارت از maps استور.
// قراردادِ results: فقط بهترینِ درصد هر کلید — سلول = بهترین٪ یا nullِ صادق.
// gap = نخستین ستونِ خالی در ترتیبِ کانونی؛ کلیدِ 0:listening («همهٔ درس‌ها»)
// هرگز نباید واردِ درسِ ۱ شود (پیشوندِ کلید = مرزِ خانواده).

import { describe, it, expect } from "vitest";
import { buildCoverageMap, COVERAGE_SKILLS } from "@/lib/coverage-map";

const LESSONS = [
  { id: 1, title: "درس اول", words: 50, color: "emerald" },
  { id: 2, title: "درس دوم", words: 40, color: "amber" },
];

const FRESH: Record<string, { percent: number; at?: string }> = {};
const KNOWN_EMPTY: Record<string, boolean> = {};

describe("نقشهٔ پوشش — قراردادِ خالص (Task 174)", () => {
  it("تازه‌کار: هر شش سلول nullِ صادق، gap = نخستین ستونِ کانونی (vocab)، هیچ‌چیز پوشیده نیست", () => {
    const m = buildCoverageMap(FRESH, KNOWN_EMPTY, LESSONS);
    expect(m.lessons).toHaveLength(2);
    expect(m.totalSkills).toBe(12);
    expect(m.attemptedSkills).toBe(0);
    const l1 = m.lessons[0];
    expect(l1.cells.every((c) => c.best === null && c.at === null)).toBe(true);
    expect(l1.gap?.key).toBe("vocab");
    expect(l1.covered).toBe(false);
  });

  it("بهترینِ ثبت‌شده در سلولِ درستش می‌نشیند و at عبور می‌کند", () => {
    const m = buildCoverageMap({ "1:vocab": { percent: 85, at: "2026-10-14" } }, KNOWN_EMPTY, LESSONS);
    const c = m.lessons[0].cells.find((x) => x.key === "vocab");
    expect(c?.best).toBe(85);
    expect(c?.at).toBe("2026-10-14");
    // بقیهٔ سلول‌های همان درس همچنان صادقانه null
    expect(m.lessons[0].cells.filter((x) => x.best === null)).toHaveLength(5);
    expect(m.lessons[0].gap?.key).toBe("dictation");
  });

  it("کلیدِ شنیداریِ «همهٔ درس‌ها» (0:listening) هرگز واردِ درسِ ۱ نمی‌شود", () => {
    const m = buildCoverageMap({ "0:listening": { percent: 70 } }, KNOWN_EMPTY, LESSONS);
    expect(m.lessons[0].cells.find((c) => c.key === "listening")?.best).toBeNull();
    expect(m.lessons[0].gap?.key).toBe("vocab");
  });

  it("درصدِ خراب (NaN/بی‌کران) هرگز سلول را نمی‌شکند — گیرِ کران ۰..۱۰۰", () => {
    const m = buildCoverageMap(
      {
        "1:vocab": { percent: 10 },
        "1:dictation": { percent: 142 },
        "1:listening": { percent: -7 },
        "1:writing": { percent: 64.6 },
        "2:grammar": { percent: Number.NaN },
      },
      KNOWN_EMPTY,
      LESSONS
    );
    const l1 = m.lessons[0];
    expect(l1.cells.find((c) => c.key === "vocab")?.best).toBe(10);
    expect(l1.cells.find((c) => c.key === "dictation")?.best).toBe(100);
    expect(l1.cells.find((c) => c.key === "listening")?.best).toBe(0);
    expect(l1.cells.find((c) => c.key === "writing")?.best).toBe(65); // گردِ بانکی
    expect(l1.gap?.key).toBe("vocab-konkuri"); // چهار ستونِ اول پر، پنجمی gap
    // NaN صادقانه null است — درس ۲ همین‌طور gapِ خودش را دارد (گرامرِ دیرتر از واژگان نیست)
    expect(m.lessons[1].cells.find((c) => c.key === "grammar")?.best).toBeNull();
    expect(m.lessons[1].gap?.key).toBe("vocab"); // ستون‌های پیش از گرامر هم خالی‌اند
  });

  it("شمارشِ known با پیشوندِ درس جدا می‌شود و درصدِ واژه گیرِ کران دارد", () => {
    const known: Record<string, boolean> = {};
    for (let i = 0; i < 30; i++) known[`1:w${i}`] = true;
    known["2:w1"] = true;
    known["12:w1"] = true; // پیشوندِ "12:" نباید در درسِ ۱ شمرده شود
    const m = buildCoverageMap(FRESH, known, LESSONS);
    expect(m.lessons[0].known).toBe(30);
    expect(m.lessons[0].wordPct).toBe(60); // 30/50
    expect(m.lessons[1].known).toBe(1);
    expect(m.lessons[1].wordPct).toBe(3); // 1/40 → 2.5 گرد → 3؟ نه: Math.round(2.5)=3
  });

  it("همه‌پوشیده: شش ستونِ پر = gap null + covered true + جمعِ نرخِ تلاش کامل", () => {
    const results: Record<string, { percent: number }> = {};
    for (const sk of COVERAGE_SKILLS) results[`1:${sk.key}`] = { percent: 50 };
    const m = buildCoverageMap(results, KNOWN_EMPTY, LESSONS);
    expect(m.lessons[0].covered).toBe(true);
    expect(m.lessons[0].gap).toBeNull();
    expect(m.attemptedSkills).toBe(6);
    expect(m.totalSkills).toBe(12);
  });

  it("results/knownِ undefined-مانند خراب نمی‌شکنند (نگهبانِ persist)", () => {
    const m = buildCoverageMap({} as Record<string, { percent: number }>, {}, LESSONS);
    expect(m.lessons).toHaveLength(2);
    expect(m.lessons[0].known).toBe(0);
    const m2 = buildCoverageMap({ "1:vocab": undefined as never }, KNOWN_EMPTY, LESSONS);
    expect(m2.lessons[0].cells.find((c) => c.key === "vocab")?.best).toBeNull();
  });

  it("خلوص: همان ورودی، همان خروجی (بدون نویزِ زمان/تصادف)", () => {
    const a = buildCoverageMap({ "1:writing": { percent: 40 } }, { "2:x": true }, LESSONS);
    const b = buildCoverageMap({ "1:writing": { percent: 40 } }, { "2:x": true }, LESSONS);
    expect(a).toEqual(b);
  });

  it("ترتیبِ کانونیِ ستون‌ها قراردادِ ثابت است (vocab، دیکته، شنیداری، نگارش، کنکوری، گرامر)", () => {
    expect(COVERAGE_SKILLS.map((s) => s.key)).toEqual([
      "vocab",
      "dictation",
      "listening",
      "writing",
      "vocab-konkuri",
      "grammar",
    ]);
  });
});
