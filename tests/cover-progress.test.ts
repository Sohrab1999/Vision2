// ------------------------------------------------------------------
// Task 111 «کتابِ زنده» — قراردادِ خالصِ حلقهٔ گنجینهٔ روی جلدِ هیرو.
// coverProgress: از رکوردِ known استور به {percent, fa, count, countFa} —
// percentِ دامنه (سقفِ ۱۰۰، مخرجِ صفر → ۰) + ارقامِ فارسی؛ ورودیِ خراب
// (تهی/آرایه/رشته/عدد) صفرِ صادق می‌دهد، هرگز throw نمی‌کند.
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { coverProgress } from "@/lib/cover-progress";
import { TOTAL_VOCABULARY } from "@/data/lesson-meta";

describe("coverProgress — حلقهٔ گنجینهٔ جلد", () => {
  it("رکوردِ عادی: شمارِ مقادیرِ درست → درصدِ گِرد + ارقامِ فارسی", () => {
    const cp = coverProgress({ "1:ability": true, "1:access": true, "1:accept": false, "1:achieve": true }, TOTAL_VOCABULARY);
    expect(cp.count).toBe(3);
    expect(cp.percent).toBe(0); // ۳ از ۳۵۶۶ → ۰٫۱٪ → گِرد به ۰
    expect(cp.fa).toBe("۰");
    expect(cp.countFa).toBe("۳");
  });

  it("درصدِ معنادار: ۱۷۹ از ۳۵۶۶ → ۵٪ با رقمِ فارسی (راندِ ۲۱۰ — جامع‌ها)", () => {
    const known = Object.fromEntries(
      Array.from({ length: 179 }, (_, i) => [`w${i}`, true])
    );
    const cp = coverProgress(known, TOTAL_VOCABULARY);
    expect(cp.percent).toBe(5);
    expect(cp.fa).toBe("۵");
    expect(cp.countFa).toBe("۱۷۹");
  });

  it("تازه‌وارد: رکوردِ تهی → صفرِ صادق — حلقه خالی، نه صفرِ دروغ", () => {
    const cp = coverProgress({}, TOTAL_VOCABULARY);
    expect(cp.percent).toBe(0);
    expect(cp.count).toBe(0);
    expect(cp.fa).toBe("۰");
  });

  it("بیش‌ازصد: ۴۰۰۰ «بلدم» از ۳۵۶۶ → سقفِ ۱۰۰ (percentِ دامنه)", () => {
    const known = Object.fromEntries(
      Array.from({ length: 4000 }, (_, i) => [`w${i}`, true])
    );
    expect(coverProgress(known, TOTAL_VOCABULARY).percent).toBe(100);
  });

  it("ورودیِ خراب هر شکل → صفرِ صادق: تهی/آرایه/رشته/عدد/آرایهٔ دروغین", () => {
    for (const bad of [null, undefined, [], "پر", 42, true]) {
      const cp = coverProgress(bad as unknown, TOTAL_VOCABULARY);
      expect(cp.percent).toBe(0);
      expect(cp.count).toBe(0);
    }
  });

  it("مخرجِ نامعتبر/صفر → ۰ — هرگز throw نه، NaN نه", () => {
    expect(coverProgress({ a: true }, 0).percent).toBe(0);
    expect(coverProgress({ a: true }, -5).percent).toBe(0);
    expect(coverProgress({ a: true }, Number.NaN).percent).toBe(0);
  });

  it("خلوص: رکوردِ ورودی دست‌نخورده می‌ماند و دو بارِ هم‌نتیجه است", () => {
    const known = { a: true, b: false, c: true };
    const snap = JSON.stringify(known);
    const a = coverProgress(known, TOTAL_VOCABULARY);
    const b = coverProgress(known, TOTAL_VOCABULARY);
    expect(JSON.stringify(known)).toBe(snap);
    expect(a).toEqual(b);
  });
});
