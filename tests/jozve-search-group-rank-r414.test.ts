import { describe, expect, it } from "vitest";
import { searchJozve } from "@/lib/jozve-search.server";
import type { JozveSearchResult } from "@/lib/jozve-search";

// ------------------------------------------------------------------
// پیمان‌های r414 — رتبه‌بندیِ سراسریِ گروه‌ها در سطحِ «کتاب».
// پیش از این راند اسناد (گروه‌های کتابی) به ترتیبِ کورپوس می‌آمدند و
// فقط درونِ هر سند امتیاز/عبارت مرتب می‌شد؛ QAِ «حال کامل» نشان داد
// tests-g12 (سرِ ۴، بی‌عبارت) جلوتر از lesson-2 (سرِ ۱۱، بی‌عبارت)
// می‌نشیند. اکنون: کلیدِ رتبه = (سرِ سند عبارتِ پیوسته دارد؟، بهترینِ
// امتیازِ سند) — نزولی، پایدار. «سرِ سند» همیشه در دورِ اولِ
// نوبت‌کشی برمی‌گردد، پس ترتیبِ گروه‌ها از خودِ نتایج بازسازی‌پذیر است.
// ------------------------------------------------------------------

/** اولین ظهورِ هر سند در آرایهٔ نتایج — بازسازیِ ترتیبِ گروه‌ها */
function docOrder(results: JozveSearchResult[]): { doc: string; head: JozveSearchResult }[] {
  const seen = new Map<string, JozveSearchResult>();
  for (const r of results) if (!seen.has(r.doc)) seen.set(r.doc, r);
  return [...seen.entries()].map(([doc, head]) => ({ doc, head }));
}

describe("searchJozve — رتبه‌بندیِ سراسریِ گروه‌ها (r414)", () => {
  it("«حال کامل»: ترتیبِ گروه‌ها نزولیِ (عبارتِ سرِ سند، امتیازِ سر) است", () => {
    const r = searchJozve("حال کامل", { limit: 30 });
    expect(r.results.length).toBeGreaterThan(0);
    const order = docOrder(r.results);
    expect(order.length).toBeGreaterThan(1);
    for (let i = 1; i < order.length; i++) {
      const prev = order[i - 1].head;
      const cur = order[i].head;
      const prevKey = [Number(prev.phraseHit ?? false), prev.score];
      const curKey = [Number(cur.phraseHit ?? false), cur.score];
      // ناوردایی: کلیدِ قبلی >= کلیدِ بعدی (نزولیِ لغت‌نامه‌ای)
      const ok =
        prevKey[0] > curKey[0] ||
        (prevKey[0] === curKey[0] && prevKey[1] >= curKey[1]);
      expect(ok, `گروهِ ${order[i].doc} (کلیدِ ${curKey}) پیشِ ${order[i - 1].doc} (کلیدِ ${prevKey}) آمده`).toBe(true);
    }
  });

  it("«حال کامل»: هیچ گروهِ بی‌عبارتی پیشِ گروهِ عبارت‌دار نمی‌نشیند (رگرسیونِ دقیقِ r414)", () => {
    const r = searchJozve("حال کامل", { limit: 30 });
    const order = docOrder(r.results);
    const lastPhraseIdx = order.map((o, i) => (o.head.phraseHit ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
    const firstNonPhraseIdx = order.findIndex((o) => !o.head.phraseHit);
    if (lastPhraseIdx >= 0 && firstNonPhraseIdx >= 0) {
      expect(firstNonPhraseIdx).toBeGreaterThan(lastPhraseIdx);
    }
    // خودِ بازسازیِ QA: در کورپوسِ واقعی هر دو دنیا حاضرند
    expect(order.some((o) => o.head.phraseHit)).toBe(true);
    expect(order.some((o) => !o.head.phraseHit)).toBe(true);
  });

  it("تک‌واژه (بدونِ عبارت): ترتیبِ گروه‌ها نزولیِ امتیازِ سرِ سند است", () => {
    const r = searchJozve("passive", { limit: 30 });
    const order = docOrder(r.results);
    expect(order.length).toBeGreaterThan(1);
    for (let i = 1; i < order.length; i++) {
      expect(order[i].head.score).toBeLessThanOrEqual(order[i - 1].head.score);
    }
  });

  it("عبارتِ چندواژه‌ایِ دیگر («passive voice»): ناورداییِ لغت‌نامه‌ای سراسری برقرار می‌ماند", () => {
    const r = searchJozve("passive voice", { limit: 60 });
    const order = docOrder(r.results);
    for (let i = 1; i < order.length; i++) {
      const prev = order[i - 1].head;
      const cur = order[i].head;
      const ok =
        Number(prev.phraseHit ?? false) > Number(cur.phraseHit ?? false) ||
        (Number(prev.phraseHit ?? false) === Number(cur.phraseHit ?? false) &&
          prev.score >= cur.score);
      expect(ok, `گروهِ ${order[i].doc} ناساز با ${order[i - 1].doc}`).toBe(true);
    }
  });

  it("تعیین‌کنندگی: دو اجرای پیاپی، دقیقاً یک ترتیبِ گروه می‌دهند (sortِ پایدار)", () => {
    const a = docOrder(searchJozve("حال کامل", { limit: 45 }).results).map((o) => o.doc);
    const b = docOrder(searchJozve("حال کامل", { limit: 45 }).results).map((o) => o.doc);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(2);
  });

  it("فیلترِ پایه (تک‌کتاب): شکلِ پاسخ دست‌نخورده — فیلدهایِ تازه به نتایج اضافه نمی‌شود", () => {
    const r = searchJozve("کامل", { grade: 10, limit: 10 });
    expect(r.results.length).toBeGreaterThan(0);
    for (const x of r.results) {
      expect(x.doc.startsWith("g10") || x.grade === 10).toBe(true);
      const keys = Object.keys(x).sort();
      // قراردادِ r410-r413 — بدونِ فیلدِ سراسریِ تازه
      for (const k of keys) {
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
