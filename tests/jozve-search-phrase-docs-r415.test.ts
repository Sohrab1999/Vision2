import { describe, expect, it } from "vitest";
import { searchJozve } from "@/lib/jozve-search.server";

// ------------------------------------------------------------------
// پیمان‌های r415 — phraseDocs: اسنادِ عبارت‌دار در «کلِ تطبیق‌ها».
// چیپِ سرگروهِ «عبارت کامل در این کتاب» منبعش سرور است — کتابی که حتی
// یکی از تطبیق‌هایش عبارتِ پیوسته دارد، حتی اگر آن رکورد در سقفِ
// ۱۲تاییِ نمایش نیفتاده باشد، باید در phraseDocs باشد؛ برعکس، سندی
// که در phraseDocs نیست نباید هیچ نتیجهٔ برگشتیِ عبارت‌دار داشته باشد.
// ------------------------------------------------------------------

describe("searchJozve — phraseDocs (r415)", () => {
  it("«حال کامل»: هر سندِ نتیجهٔ عبارت‌دارِ برگشتی در phraseDocs است", () => {
    const r = searchJozve("حال کامل", { limit: 30 });
    expect(r.results.length).toBeGreaterThan(0);
    expect(Array.isArray(r.phraseDocs)).toBe(true);
    const returnedPhraseDocs = new Set(r.results.filter((x) => x.phraseHit).map((x) => x.doc));
    expect(returnedPhraseDocs.size).toBeGreaterThan(0);
    for (const doc of returnedPhraseDocs) {
      expect(r.phraseDocs).toContain(doc);
    }
  });

  it("هیچ سندِ بی‌عبارتِ برگشتی در phraseDocs نیست (ندادهٔ کاذب صفر)", () => {
    const r = searchJozve("حال کامل", { limit: 30 });
    for (const x of r.results) {
      if (!x.phraseHit) {
        expect(r.phraseDocs).not.toContain(x.doc);
      }
    }
  });

  it("پرس‌وجوی تک‌واژه (عبارتِ ممکن نیست) → phraseDocs خالی", () => {
    const r = searchJozve("passive", { limit: 20 });
    expect(r.results.length).toBeGreaterThan(0);
    expect(r.phraseDocs).toEqual([]);
  });

  it("پرس‌وجوی خالی/تک‌نویسه → شکلِ خالیِ کامل", () => {
    expect(searchJozve("a", { limit: 5 })).toEqual({ total: 0, results: [], phraseDocs: [] });
  });

  it("تعیین‌کنندگی: دو اجرای پیاپی phraseDocs یکسان می‌دهد", () => {
    const a = searchJozve("حال کامل", { limit: 15 }).phraseDocs;
    const b = searchJozve("حال کامل", { limit: 15 }).phraseDocs;
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("شکلِ پاسخِ سیم دست‌نخورده — فقط کلیدهایِ قراردادی", () => {
    const r = searchJozve("کامل", { grade: 10, limit: 5 });
    for (const x of r.results) {
      for (const k of Object.keys(x)) {
        expect([
          "kind", "grade", "doc", "bookTitle", "text", "snippet", "score",
          "chapterId", "chapterTitle", "sectionTitle", "sectionType", "lineIdx",
          "bankLesson", "bankTitle", "questionId", "options", "answer", "translation",
          "phraseHit",
        ]).toContain(k);
      }
    }
  });
});
