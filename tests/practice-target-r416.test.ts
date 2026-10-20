import { describe, expect, it } from "vitest";
import { practiceLabelOf, practiceTargetOf } from "@/lib/practice-target";
import { searchJozve } from "@/lib/jozve-search.server";
import type { JozveSearchResult } from "@/lib/jozve-search";

// ------------------------------------------------------------------
// پیمان‌های r416 — «تمرینِ همین‌جا»: مقصدِ تمرینِ هر کارتِ سؤالِ جست‌وجو.
//   • بانک‌هایِ جزوه (tests-*/grammar-*) → book با bank = bankLesson
//     (اندیسِ بانک — deep-linkِ r415 مقصد را حل می‌کند)
//   • باندل: lesson-1..3 → درسِ هم‌شماره؛ exam-360 → آزمون؛ konkur → کنکور
//   • نتیجهٔ متنی / بانکِ بی‌اندیس → null (بدونِ دکمه)
// ------------------------------------------------------------------

const Q = (over: Partial<JozveSearchResult>): JozveSearchResult =>
  ({
    kind: "question",
    grade: 10,
    doc: "tests-g10",
    bookTitle: "جزوه جامع زبان انگلیسی پایه دهم",
    text: "Choose the best option.",
    snippet: "Choose the best option.",
    score: 5,
    bankLesson: 5,
    bankTitle: "آموزشی — تست واژگان درس اول (ص۵۲-۵۳)",
    questionId: "g10-5-1",
    ...over,
  }) as JozveSearchResult;

describe("practiceTargetOf — بانک‌های جزوه (r416)", () => {
  it("tests-g10 با بانک ۵ → book/grade=10/bank=5", () => {
    expect(practiceTargetOf(Q({}))).toEqual({ type: "book", grade: 10, bank: 5 });
    expect(practiceLabelOf(Q({}))).toBe("تمرینِ همین بانک");
  });

  it("grammar-g11-konkur هم بانکِ جزوه است → book با پایهٔ درست", () => {
    const r = Q({ doc: "grammar-g11-konkur", grade: 11, bankLesson: 12 });
    expect(practiceTargetOf(r)).toEqual({ type: "book", grade: 11, bank: 12 });
  });

  it("bankLesson صفر/غایب → null (دکمه نداریم — دروغ نمی‌گوییم)", () => {
    expect(practiceTargetOf(Q({ bankLesson: 0 }))).toBeNull();
    expect(practiceTargetOf(Q({ bankLesson: undefined }))).toBeNull();
  });

  it("پایهٔ خارج از ۷..۱۲ → null", () => {
    expect(practiceTargetOf(Q({ grade: 6 }))).toBeNull();
  });

  it("نتیجهٔ متنی هرگز دکمهٔ تمرین ندارد", () => {
    const t = Q({ kind: "text", doc: "g10" }) as JozveSearchResult;
    expect(t.kind).toBe("text");
    expect(practiceTargetOf(t)).toBeNull();
    expect(practiceLabelOf(t)).toBeNull();
  });
});

describe("practiceTargetOf — بانک‌های باندل (r416)", () => {
  it("lesson-1..3 → نمایِ درسِ هم‌شماره + برچسبِ درس", () => {
    expect(practiceTargetOf(Q({ doc: "lesson-1", grade: 11, bankLesson: undefined }))).toEqual({ type: "lesson", id: 1 });
    expect(practiceTargetOf(Q({ doc: "lesson-3", grade: 11, bankLesson: undefined }))).toEqual({ type: "lesson", id: 3 });
    expect(practiceLabelOf(Q({ doc: "lesson-2", grade: 11 }))).toBe("تمرینِ همین درس");
  });

  it("exam-360 → نمایِ آزمونِ جامع؛ konkur-g10 → نمایِ کنکور", () => {
    expect(practiceTargetOf(Q({ doc: "exam-360", grade: 11, bankLesson: undefined }))).toEqual({ type: "exam" });
    expect(practiceLabelOf(Q({ doc: "exam-360", grade: 11 }))).toBe("تمرین در آزمونِ جامع");
    expect(practiceTargetOf(Q({ doc: "konkur-g10", grade: 10, bankLesson: undefined }))).toEqual({ type: "konkur" });
    expect(practiceLabelOf(Q({ doc: "konkur-g10", grade: 10 }))).toBe("تمرین در بانکِ کنکور");
  });
});

describe("practiceTargetOf — روی کورپوسِ واقعی (r416)", () => {
  it("هر نتیجهٔ سؤالیِ «passive» مقصدِ معتبر دارد یا هیچ", () => {
    const r = searchJozve("passive", { kind: "question", limit: 30 });
    expect(r.results.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    for (const x of r.results) {
      const t = practiceTargetOf(x);
      if (t == null) continue;
      if (t.type === "book") {
        expect(t.grade).toBeGreaterThanOrEqual(7);
        expect(t.grade).toBeLessThanOrEqual(12);
        expect(typeof t.bank).toBe("number");
        seen.add("book");
      } else {
        seen.add(t.type);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
  });

  it("نتایجِ متنیِ «حال کامل» هیچ مقصدِ تمرینی نمی‌گیرند", () => {
    const r = searchJozve("حال کامل", { kind: "text", limit: 20 });
    for (const x of r.results) {
      expect(practiceTargetOf(x)).toBeNull();
    }
  });
});
