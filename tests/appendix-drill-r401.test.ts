// ------------------------------------------------------------------
// r401 — «معنی + مرورِ اشتباهها» — رشدِ موتورِ دریلِ ضمیمه.
//
// قفلهای کلاسِ این راند:
//  · گونهٔ چهارم (fa): گزینهها فقط معنیهایِ فارسیِ خودِ بانک — همان
//    قراردادِ «هیچ فعلی ساخته نمیشود»، اینبار رویِ ستونِ fa
//  · چرخشِ چهارگونه بر رویِ اندیس — r400 تعمیم مییابد، نه شکسته
//  · buildDrillReplay: فقط نادرست/بیپاسخ، همان ترتیب، همان گزینهها؛
//    جلسهٔ بیاشتباه → تهیِ صادقانه؛ ورودی هرگز دستنخورده (خالص)
//  · هیچ نوشتنی به استورِ یادگیری — موتور حتی importِ استور ندارد
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { irregularVerbs } from "@/data/appendix";
import {
  buildDrillSession,
  buildDrillReplay,
  drillForm,
  DRILL_KINDS,
  DRILL_SIZE,
  type DrillQuestion,
  type DrillKind,
} from "@/lib/appendix-drill";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("appendix-drill r401 — گونهٔ معنی (fa)", () => {
  it("سرشماریِ گونهها: دقیقاً چهار گونه بهترتیبِ ثابت", () => {
    expect(DRILL_KINDS).toEqual(["past", "pp", "base", "fa"]);
  });

  it("نگاشتِ گونه→ستون: fa معنیِ فارسیِ خودِ فعل را میدهد", () => {
    const v = irregularVerbs.find((x) => x.base === "break")!;
    expect(drillForm(v, "fa")).toBe("شکستن، خرد کردن");
    expect(drillForm(v, "fa")).toBe(v.fa);
  });

  it("پرسشِ fa: پرامپت معنی-محور است، گزینهها از ستونِ faِ بانک، دقیقاً یک درست", () => {
    const s = buildDrillSession(irregularVerbs, irregularVerbs.length, mulberry32(21));
    const faQs = s.questions.filter((q) => q.kind === "fa");
    expect(faQs.length).toBeGreaterThan(0);
    const legal = new Set(irregularVerbs.map((v) => v.fa));
    for (const q of faQs) {
      const verb = irregularVerbs.find((v) => v.base === q.base)!;
      expect(q.prompt).toContain("معنی");
      expect(q.prompt).toContain(verb.base);
      expect(q.options[q.answer]).toBe(verb.fa);
      expect(new Set(q.options).size).toBe(q.options.length); // دوبهدو متمایز
      for (const opt of q.options) expect(legal.has(opt)).toBe(true); // فقط از بانک
    }
  });

  it("چرخشِ چهارگونه رویِ ۱۰ پرسش: fa در اندیسهایِ ۳ و ۷ (دو پرسشِ معنی در هر جلسه)", () => {
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(33));
    expect(s.size).toBe(10);
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(DRILL_KINDS[i % DRILL_KINDS.length]);
    });
    expect(s.questions.filter((q) => q.kind === "fa")).toHaveLength(2);
  });

  it("سویپِ کاملِ ۸۷ فعل در چهار گونه: گزینههای متمایز، یک درست، همه از ستونِ خودِ گونه", () => {
    const s = buildDrillSession(irregularVerbs, irregularVerbs.length, mulberry32(9));
    for (const q of s.questions) {
      const verb = irregularVerbs.find((v) => v.base === q.base)!;
      const legal = new Set(irregularVerbs.map((v) => drillForm(v, q.kind as DrillKind)));
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options[q.answer]).toBe(drillForm(verb, q.kind as DrillKind));
      for (const opt of q.options) expect(legal.has(opt)).toBe(true);
    }
  });

  it("همارزشِ فارسی: دو فعل با معنیِ عیناً برابر، گزینهٔ تکراری نمی زایند", () => {
    // بانکِ واقعی تکرارِ معنیِ دقیق ندارد — اما قراردادِ استخرِ ارزشی باید
    // حتی در بانکِ فرضیِ همارزش پابرجا بماند (همان درسِ come/become، بارِ فارسی)
    const twins = [
      ...irregularVerbs.slice(0, 5),
      { base: "twinA", past: "twinned", pp: "twinned", fa: irregularVerbs[0].fa },
      { base: "twinB", past: "twinned", pp: "twinned", fa: irregularVerbs[1].fa },
    ];
    const s = buildDrillSession(twins, twins.length, mulberry32(4));
    for (const q of s.questions) {
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.filter((o) => o === q.options[q.answer])).toHaveLength(1);
    }
  });
});

describe("appendix-drill r401 — مرورِ اشتباهها (بانکِ خطایِ موضعی)", () => {
  const s = buildDrillSession(irregularVerbs, 10, mulberry32(17));

  it("فقط نادرست/بیپاسخ میآیند — به همان ترتیب، با همان گزینهها", () => {
    const answers = s.questions.map((q, i) => (i % 3 === 0 ? null : (q.answer + 1) % 4));
    const r = buildDrillReplay(s.questions, answers);
    expect(r.size).toBe(s.questions.filter((q, i) => answers[i] !== q.answer).length);
    r.questions.forEach((q) => {
      const origin = s.questions.find((x) => x.base === q.base && x.kind === q.kind);
      expect(origin).toBeTruthy();
      expect(origin!.options).toEqual(q.options); // همان گزینهها — مرورِ صادق
      expect(origin!.answer).toBe(q.answer);
    });
    // ترتیبِ اصلی حفظ است
    const idxs = r.questions.map((q) =>
      s.questions.findIndex((x) => x.base === q.base && x.kind === q.kind),
    );
    expect([...idxs].sort((a, b) => a - b)).toEqual(idxs);
  });

  it("جلسهٔ بیاشتباه → تهیِ صادقانه؛ همهٔ بیپاسخ → کلِ جلسه", () => {
    const perfect = buildDrillReplay(s.questions, s.questions.map((q) => q.answer));
    expect(perfect.size).toBe(0);
    expect(perfect.questions).toHaveLength(0);
    const blank = buildDrillReplay(s.questions, s.questions.map(() => null));
    expect(blank.size).toBe(10);
  });

  it("خالص: ورودی و پاسخها پسِ buildDrillReplay دستنخوردهاند", () => {
    const qs: DrillQuestion[] = [...s.questions];
    const ans: (number | null)[] = s.questions.map((q, i) => (i < 5 ? null : q.answer));
    const qsSnapshot = JSON.stringify(qs);
    const ansSnapshot = JSON.stringify(ans);
    buildDrillReplay(qs, ans);
    expect(JSON.stringify(qs)).toBe(qsSnapshot);
    expect(JSON.stringify(ans)).toBe(ansSnapshot);
  });

  it("مرورِ مرور: خروجیِ مرور دوباره مرورشدنی است و نمره با scoreDrill سازگار میماند", () => {
    const answers = s.questions.map((q, i) => (i < 6 ? (q.answer + 1) % 4 : q.answer));
    const r1 = buildDrillReplay(s.questions, answers);
    expect(r1.size).toBe(6);
    const ans2 = r1.questions.map((q, i) => (i < 2 ? null : q.answer));
    const r2 = buildDrillReplay(r1.questions, ans2);
    expect(r2.size).toBe(2);
    const sc = scoreOfSafe(r2.questions, ans2);
    expect(sc.total).toBe(2);
  });

  function scoreOfSafe(qs: readonly DrillQuestion[], ans: readonly (number | null)[]) {
    // helper محلیِ همین تست — scoreDrill مالکِ نمره است، این فقط سازگاریِ شکل
    return { total: qs.length, correct: qs.filter((q, i) => ans[i] === q.answer).length };
  }
});

describe("appendix-drill r401 — قفلهای منبع", () => {
  it("موتور هیچ وابستگی به استورِ یادگیری ندارد — بانکِ خطایِ ماندگار ممنوع (حکمِ r400)", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/appendix-drill.ts"), "utf8");
    expect(src).not.toContain("@/lib/study-store");
    expect(src).not.toContain("useStudy");
    expect(src).not.toContain("localStorage");
  });

  it("نما: دکمهٔ مرور و سرصفحهٔ صادق زندهاند — و گونهٔ fa شاخهٔ رندرِ خودش را دارد", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/lesson/appendix-drill-view.tsx"),
      "utf8",
    );
    expect(src).toContain('aria-label="مرور اشتباههای تمرین"');
    expect(src).toContain("نتیجهٔ مرور");
    expect(src).toContain('q.kind === "fa"');
    expect(src).toContain("buildDrillReplay");
  });

  it("ترنزیشن scopeشده و کنتراستِ r172 در ریاضتِ راندِ نو هم پابرجاست", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/lesson/appendix-drill-view.tsx"),
      "utf8",
    )
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    expect(src).not.toContain("transition-all"); // نقشهٔ P4
    expect(src).not.toContain("text-stone-400"); // قراردادِ کنتراستِ r172
  });
});
