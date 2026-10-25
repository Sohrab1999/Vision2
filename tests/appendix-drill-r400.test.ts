// ------------------------------------------------------------------
// r400 — موتورِ خالصِ «تمرین افعال بی‌قاعده» (appendix-drill.ts)
//
// قفلهای کلاس:
//  · هیچ فعلی ساخته نمیشود — گزینهها فقط ارزشهای بانکِ appendix.ts
//  · گزینههای هر پرسش دوبهدو متمایز و دقیقاً یکی درست
//  · distractor هرگز برابرِ پاسخِ درست (خانوادهٔ همارزش: ppِ come/become
//    هر دو «come» — استخرِ ارزشی + حذفِ پاسخ، قراردادِ موتور)
//  · قطعیت زیرِ rng تزریقی (mulberry32) — Fisher–Yates خالص
//  · نمره از مالکِ درصد (r388) — بیپاسخ = نادرستِ صادقانه
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { irregularVerbs } from "@/data/appendix";
import {
  buildDrillSession,
  scoreDrill,
  drillForm,
  DRILL_KINDS,
  DRILL_SIZE,
  type DrillKind,
} from "@/lib/appendix-drill";

/** PRNG قطعی برای تست (mulberry32) */
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

describe("appendix-drill r400 — جلسهٔ پرسش", () => {
  it("بانکِ منبع دستنخورده: ۸۷ فعل — موتور هیچ فعلی نمی‌سازد", () => {
    expect(irregularVerbs.length).toBe(87);
    for (const v of irregularVerbs) {
      expect(v.base.length).toBeGreaterThan(0);
      expect(v.past.length).toBeGreaterThan(0);
      expect(v.pp.length).toBeGreaterThan(0);
      expect(v.fa.length).toBeGreaterThan(0);
    }
  });

  it("اندازه: پیشفرض ۱۰؛ بستهشده در ۱..طولِ بانک؛ بانکِ تهی صادقانه تهی", () => {
    expect(buildDrillSession(irregularVerbs).size).toBe(DRILL_SIZE);
    expect(buildDrillSession(irregularVerbs, 3).size).toBe(3);
    expect(buildDrillSession(irregularVerbs, 0).size).toBe(1); // clampِ پایین
    expect(buildDrillSession(irregularVerbs, 999).size).toBe(irregularVerbs.length);
    const empty = buildDrillSession([], 10);
    expect(empty.size).toBe(0);
    expect(empty.questions).toHaveLength(0);
  });

  it("قطعیت: همان seed → همان جلسه؛ seed دیگر → جلسهٔ دیگر (حداقل یک تفاوت)", () => {
    const a = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(7));
    const b = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(7));
    expect(b).toEqual(a);
    const c = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(8));
    const same = c.questions.every((q, i) => q.base === a.questions[i].base);
    expect(same).toBe(false);
  });

  it("هر پرسش: گزینههای متمایز، دقیقاً یک درست در محدوده، گزینهها از خودِ بانک", () => {
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(42));
    for (const q of s.questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.options).size).toBe(q.options.length); // دوبهدو متمایز
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      const verb = irregularVerbs.find((v) => v.base === q.base)!;
      expect(q.options[q.answer]).toBe(drillForm(verb, q.kind as DrillKind)); // پاسخ = دادهٔ خودِ فعل
      const legal = new Set(irregularVerbs.map((v) => drillForm(v, q.kind as DrillKind)));
      for (const opt of q.options) expect(legal.has(opt)).toBe(true); // هیچ گزینهٔ ساختهشده
    }
  });

  it("خانوادهٔ همارزش: هیچ گزینهٔ تکراری حتی وقتی چند فعل یک شکل دارند (come/become)", () => {
    // ۸۷ پرسشِ کامل — بیشترین فشار رویِ استخرِ ارزشی
    const s = buildDrillSession(irregularVerbs, irregularVerbs.length, mulberry32(1));
    for (const q of s.questions) {
      const distinct = new Set(q.options);
      expect(distinct.size).toBe(q.options.length);
      // و هیچ ارزشِ برابرِ پاسخِ درست در حواسپرتیها (دو پاسخِ درست ناممکن)
      expect(q.options.filter((o) => o === q.options[q.answer])).toHaveLength(1);
    }
  });

  it("چرخشِ گونهها: یک جلسهٔ کامل هر سه گونه را پوشش میدهد — بهترتیبِ اندیس", () => {
    const s = buildDrillSession(irregularVerbs, irregularVerbs.length, mulberry32(3));
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(DRILL_KINDS[i % DRILL_KINDS.length]);
    });
  });

  it("پرسشِ base: گذشته در پرامپت است و گزینهها شکلِ سادهاند", () => {
    const s = buildDrillSession(irregularVerbs, irregularVerbs.length, mulberry32(5));
    const baseQ = s.questions.find((q) => q.kind === "base")!;
    const verb = irregularVerbs.find((v) => v.base === baseQ.base)!;
    expect(baseQ.prompt).toContain(verb.past);
    const legal = new Set(irregularVerbs.map((v) => v.base));
    for (const opt of baseQ.options) expect(legal.has(opt)).toBe(true);
  });
});

describe("appendix-drill r400 — نمره", () => {
  const s = buildDrillSession(irregularVerbs, 6, mulberry32(11));

  it("همه درست → ۱۰۰؛ همه بیپاسخ → ۰ صادقانه؛ نصفه → ۵۰", () => {
    const all = scoreDrill(s.questions, s.questions.map((q) => q.answer));
    expect(all).toEqual({ correct: 6, total: 6, percentValue: 100 });
    const none = scoreDrill(s.questions, s.questions.map(() => null));
    expect(none).toEqual({ correct: 0, total: 6, percentValue: 0 });
    const half = scoreDrill(s.questions, s.questions.map((q, i) => (i < 3 ? q.answer : null)));
    expect(half).toEqual({ correct: 3, total: 6, percentValue: 50 });
  });

  it("پاسخِ غلطِ اندیسدار نادرست میشمارد — نه پرتاب، نه NaN", () => {
    const wrong = scoreDrill(s.questions, s.questions.map((q) => (q.answer === 0 ? 1 : 0)));
    expect(wrong.correct).toBeLessThanOrEqual(6);
    expect(Number.isFinite(wrong.percentValue)).toBe(true);
  });
});

describe("appendix-drill r400 — قفلهای منبع", () => {
  it("نمره از مالکِ درصد (r388) میآید — نه Math.round دستی", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/appendix-drill.ts"), "utf8");
    expect(src).toContain('import { percent } from "@/lib/domain/percent"');
    expect(src).toContain("percent(correct, total)");
    expect(src).not.toContain("Math.round((part");
  });

  it("بانکِ appendix هیچ افزونهای از دریل نمیپذیرد — دادهٔ منجمد", () => {
    const src = readFileSync(join(process.cwd(), "src/data/appendix.ts"), "utf8");
    expect(src).not.toContain("drill");
    expect(src).not.toContain("Drill");
  });

  it("ترنزیشن scopeشده: در نمای دریل و سویچِ آن transition-all ممنوع (نقشهٔ P4)", () => {
    for (const f of [
      "src/components/study/lesson/appendix-drill-view.tsx",
      "src/components/study/lesson/appendix-view.tsx",
    ]) {
      const src = readFileSync(join(process.cwd(), f), "utf8")
        .split("\n")
        .filter((l) => !l.trim().startsWith("//")) // کامنتِ سند مجاز است — کد نه
        .join("\n");
      expect(src, f).not.toContain("transition-all");
    }
  });
});
