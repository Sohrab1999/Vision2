import { describe, expect, it } from "vitest";
import { searchGroupKind } from "@/lib/jozve-search";
import { jozveSearchCorpusSize, searchJozve } from "@/lib/jozve-search.server";

// ------------------------------------------------------------------
// پیمان‌های r411 — «جست‌وجو همه‌جا» — بانک‌هایِ باندل (سه درسِ ویژن ۲ +
// آزمونِ جامع ۳۶۰ + بانکِ کنکورِ دهم) به کورپوسِ جست‌وجو پیوستند تا
// پوششِ سؤال‌ها دقیقاً هم‌عددِ ایندکسِ گستردهٔ معلم (۷٬۸۹۶) شود.
// ------------------------------------------------------------------

describe("کورپوس — پوششِ کاملِ سؤال‌ها", () => {
  const size = jozveSearchCorpusSize();

  it("سؤال = ۶٬۲۲۲ جزوه + ۱٬۶۷۴ باندل = ۷٬۸۹۶ دقیق (هم‌عددِ teacher-bank)", () => {
    expect(size.question).toBe(7_896);
    expect(size.text).toBeGreaterThan(30_000);
  });
});

describe("بانک‌هایِ باندل — قهرمان‌هایِ هر سند", () => {
  it("«ice skater» → سؤالِ درس ۱ با شناسه و گزینه و کلیدِ معتبر", () => {
    const r = searchJozve("ice skater", { limit: 10 });
    expect(r.total).toBeGreaterThan(0);
    const hit = r.results.find((x) => x.doc === "lesson-1" && x.kind === "question");
    expect(hit).toBeTruthy();
    expect(hit!.questionId).toMatch(/^l1-/);
    expect(hit!.options!.length).toBeGreaterThan(1);
    expect(hit!.answer ?? -1).toBeLessThan(hit!.options!.length);
    expect(hit!.bankTitle).toContain("درس ۱");
  });

  it("«students were totally confused» → آزمونِ جامع (exam-360)", () => {
    const r = searchJozve("students were totally confused", { limit: 10 });
    expect(r.total).toBeGreaterThan(0);
    const hit = r.results.find((x) => x.doc === "exam-360" && x.kind === "question");
    expect(hit).toBeTruthy();
    expect(hit!.questionId).toBe("x-1");
    expect(hit!.bookTitle).toContain("ویژن ۲");
  });

  it("«Tom called» → بانکِ کنکورِ دهم (konkur-g10) با پایهٔ ۱۰", () => {
    const r = searchJozve("Tom called", { limit: 10 });
    expect(r.total).toBeGreaterThan(0);
    const hit = r.results.find((x) => x.doc === "konkur-g10" && x.kind === "question");
    expect(hit).toBeTruthy();
    expect(hit!.questionId).toBe("g10-1");
    expect(hit!.grade).toBe(10);
    expect(hit!.bookTitle).toBe("بانک کنکور دهم");
  });

  it("فیلترِ kind=question هر دو منبعِ جزوه و باندل را می‌گیرد", () => {
    const r = searchJozve("passive", { limit: 20, kind: "question" });
    expect(r.results.length).toBeGreaterThan(0);
    for (const x of r.results) {
      expect(x.kind).toBe("question");
      expect(x.questionId).toBeTruthy();
    }
  });
});

describe("searchGroupKind — نگاشتِ گروهِ نمایشی", () => {
  it("درس‌ها و آزمونِ جامع → vision2؛ کنکور → konkur؛ بقیه → booklet", () => {
    expect(searchGroupKind("lesson-1")).toBe("vision2");
    expect(searchGroupKind("lesson-3")).toBe("vision2");
    expect(searchGroupKind("exam-360")).toBe("vision2");
    expect(searchGroupKind("konkur-g10")).toBe("konkur");
    expect(searchGroupKind("g11")).toBe("booklet");
    expect(searchGroupKind("tests-g10")).toBe("booklet");
    expect(searchGroupKind("grammar-g12-topic")).toBe("booklet");
  });
});
