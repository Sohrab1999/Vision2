// ------------------------------------------------------------------
// r408 — قفلهایِ «دریل دیکشنری» — مقیاسِ سراسریِ بانکِ واژگانِ r407
// رویِ کلِ ۴۰۳۲ واژهٔ هر ۱۲ درس. موتور دستنخورده؛ گاردهایِ یکتاییِ
// دوسویه رویِ دادهٔ واقعیِ مقیاسِ بزرگ میبندند: ۲۶۴۰ enِ یکتا (۳۹۴
// enِ چندترجمهای — «ability» دو معنی، «amazing» سه معنی!) و ۲۹۴۰
// faِ یکمالک. هیچ سطحِ مصرفشدهای لمس نمیشود (جفتآزمونِ دیکشنریِ
// buildPairsDrillQuiz بانکِ syn/ant است — اینجا بانکِ واژگان).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildLessonVocabDrillSession,
  lessonVocabDrillPlan,
  flattenLessonVocab,
} from "@/lib/appendix-lesson-vocab-drill";
import {
  buildDrillReplay,
  scoreDrill,
  DRILL_SIZE,
} from "@/lib/appendix-drill";
import { lessons } from "@/data";
import { posLabel } from "@/lib/study-theme";

// mulberry32 — قطعیتِ جلسه زیرِ تست (مالکِ الگو: موتورهایِ r400..r407)
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

const BANK = flattenLessonVocab(lessons);
const enFas = new Map<string, Set<string>>();
const faEns = new Map<string, Set<string>>();
for (const w of BANK) {
  if (!enFas.has(w.en)) enFas.set(w.en, new Set());
  enFas.get(w.en)!.add(w.fa);
  if (!faEns.has(w.fa)) faEns.set(w.fa, new Set());
  faEns.get(w.fa)!.add(w.en);
}
const faSet = new Set(BANK.map((w) => w.fa));
const enSet = new Set(BANK.map((w) => w.en));
const MULTI_FA_ENS = ["ability", "absolutely", "age", "amazing"]; // regressionِ سرشماری

describe("dictionary-vocab-drill r408 — بانکِ سراسریِ منجمد", () => {
  it("تختکردنِ تکمنبع: ۴۰۳۲ واژه با ترتیبِ درس به درس و هیچ سلولِ تهی", () => {
    expect(BANK.length).toBe(4032);
    expect(lessons.reduce((n, l) => n + l.vocabulary.length, 0)).toBe(4032);
    // ترتیب: نخستین ۲۰۴ = واژگانِ درس ۱؛ آخرین ۱۲ = درس ۱۲
    expect(BANK[0]!.en).toBe(lessons[0]!.vocabulary[0]!.en);
    expect(BANK[203]!.en).toBe(lessons[0]!.vocabulary[203]!.en);
    expect(BANK[204]!.en).toBe(lessons[1]!.vocabulary[0]!.en);
    expect(BANK[BANK.length - 1]!.en).toBe(lessons[11]!.vocabulary.at(-1)!.en);
    for (const w of BANK) {
      expect(w.en.length).toBeGreaterThan(0);
      expect(w.fa.length).toBeGreaterThan(0);
    }
  });

  it("سرشماریِ یکتاییِ سراسری: ۲۶۴۰ enِ یکتا (۳۹۴ چندترجمهای) و ۲۹۴۰ faِ یکمالک", () => {
    expect(enFas.size).toBe(2640);
    expect([...enFas.values()].filter((s) => s.size > 1).length).toBe(394);
    expect(faEns.size).toBe(3019);
    expect(faEns.size - [...faEns.values()].filter((s) => s.size > 1).length).toBe(2940);
    // regressionهایِ واقعی — واگراییِ ترجمه میانِ جزوهها
    expect(enFas.get("ability")!.size).toBe(2);
    expect(enFas.get("amazing")!.size).toBe(3);
  });

  it("برنامهٔ قطعی رویِ بانکِ سراسری: ۱۰ پرسش سهگونه از ۴۰۳۲ — همهٔ گونهها زنده", () => {
    expect(lessonVocabDrillPlan(BANK)).toEqual({
      size: 10,
      kinds: ["fa", "en", "pos"],
      bank: 4032,
    });
  });
});

describe("dictionary-vocab-drill r408 — ساختِ جلسه در مقیاسِ سراسری", () => {
  it("جلسهٔ ۱۰تایی: چرخشِ fa×۴/en×۳/pos×۳ با faOptionsِ مالکِ موتور", () => {
    const s = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(408));
    expect(s.size).toBe(10);
    expect(s.questions.map((q) => q.kind)).toEqual([
      "fa", "en", "pos", "fa", "en", "pos", "fa", "en", "pos", "fa",
    ]);
    for (const q of s.questions) {
      expect(q.faOptions).toBe(q.kind === "fa" || q.kind === "pos");
    }
  });

  it("گاردِ دوسویه زیرِ ۲۰۰ seed: معنی هرگز از enِ چندترجمه نمیآید؛ واژه هرگز از faِ چندمالک", () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(seed * 7 + 2));
      for (const q of s.questions) {
        if (q.kind === "fa") {
          expect(enFas.get(q.base)!.size).toBe(1);
          // regressionِ سرشماری: واگراهایِ واقعی هرگز پرامپتِ معنی نمیشوند
          expect(MULTI_FA_ENS).not.toContain(q.base);
          expect(q.options[q.answer]).toBe([...enFas.get(q.base)!][0]);
        } else if (q.kind === "en") {
          const fa = (q.prompt.match(/«(.+)»/) || [])[1]!;
          expect(faEns.get(fa)!.size).toBe(1);
          expect(q.options[q.answer]).toBe([...faEns.get(fa)!][0]);
        } else {
          // r408 — یکتاییِ en→pos در کلِ بانک: همهٔ صاحبانِ posِ همین en
          // یک برچسب مشترک دارند (تعمیمِ سومِ درسِ لنگرِ بی‌ابهام)
          const owners = BANK.filter((x) => x.en === q.base && x.pos);
          expect(owners.length).toBeGreaterThan(0);
          const labels = new Set(owners.map((x) => posLabel[x.pos as string]));
          expect(labels.size).toBe(1);
          expect([...labels][0]).toBe(q.options[q.answer]);
          expect(q.speak).toBe(q.base); // چیپِ واژهٔ هدف — r230/r404/r405
        }
      }
    }
  });

  it("سویپِ زیرِ seedهایِ چندگانه: گزینهها از ستونهایِ سراسری، ۴تاییِ متمایز، پاسخ در بازه", () => {
    for (let seed = 0; seed < 15; seed++) {
      const s = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(seed * 41 + 3));
      for (const q of s.questions) {
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.options.length).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        for (const opt of q.options) {
          if (q.kind === "fa") expect(faSet.has(opt)).toBe(true);
          else if (q.kind === "en") expect(enSet.has(opt)).toBe(true);
          else expect(opt.length).toBeGreaterThan(1); // برچسبِ نقش — همیشه فارسیِ چندحرفی
        }
      }
    }
  });

  it("سدِ تکرار: هیچ (گونه، en، fa) تکراری در جلسهٔ ۱۰تایی", () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(seed * 19 + 4));
      const ids = s.questions.map((q) => `${q.kind}:${q.base}:${q.fa}`);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("قطعیت زیرِ seed و تفاوت زیرِ seedهایِ متفاوت", () => {
    const a = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(88));
    const b = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(88));
    const c = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(89));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
  });

  it("clamp: اندیسِ ۰ → یک پرسش؛ اندیسِ غول → سقفِ بانکِ ۴۰۳۲تایی با بازاستفادهٔ صادق", () => {
    const one = buildLessonVocabDrillSession(BANK, 0, mulberry32(1));
    expect(one.size).toBe(1);
    const big = buildLessonVocabDrillSession(BANK, 9999, mulberry32(2));
    expect(big.size).toBe(4032);
    expect(big.questions.length).toBe(4032);
    for (const q of big.questions) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("ترکیبِ گونهها در جلسهٔ کامل: fa×۱۳۴۴ / en×۱۳۴۴ / pos×۱۳۴۴ (چرخشِ صادقِ ۴۰۳۲)", () => {
    const big = buildLessonVocabDrillSession(BANK, 4032, mulberry32(11));
    const counts = { fa: 0, en: 0, pos: 0 };
    for (const q of big.questions) counts[q.kind as "fa" | "en" | "pos"]++;
    expect(counts).toEqual({ fa: 1344, en: 1344, pos: 1344 });
  });

  it("بانکِ تهی → جلسهٔ تهیِ صادق؛ plan هم تهی", () => {
    const empty = buildLessonVocabDrillSession([], DRILL_SIZE, mulberry32(3));
    expect(empty).toEqual({ questions: [], size: 0 });
    expect(lessonVocabDrillPlan([])).toEqual({ size: 0, kinds: [], bank: 0 });
  });

  it("بانکِ خطا و نمره از مالکِ مشترک — بدونِ برچسبنویسیِ دوباره (ضدِ دو-نامِ r385)", () => {
    const s = buildLessonVocabDrillSession(BANK, DRILL_SIZE, mulberry32(21));
    const answers: (number | null)[] = s.questions.map((q, i) =>
      i % 3 === 0 ? null : (q.answer + 1) % q.options.length,
    );
    const score = scoreDrill(s.questions, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(0);
    const replay = buildDrillReplay(s.questions, answers);
    expect(replay.size).toBe(10);
    expect(replay.questions.map((q) => q.options)).toEqual(s.questions.map((q) => q.options));
    const perfect = buildDrillReplay(s.questions, s.questions.map((q) => q.answer));
    expect(perfect.size).toBe(0);
  });

  it("قفلِ منبع: موتور بیاستور است، از مالکها میخواند و کلاسِ ممنوع ندارد (حکمِ r407 پابرجا)", () => {
    const src = readFileSync("src/lib/appendix-lesson-vocab-drill.ts", "utf8");
    expect(src).not.toContain("study-store");
    expect(src).not.toContain("useStudy");
    expect(src).toContain('from "./appendix-drill"');
    expect(src).toContain('from "@/lib/study-theme"'); // posLabel — مالکِ برچسب
    expect(src).not.toContain("Math.random()");
    expect(src).not.toContain("transition-all"); // نقشهٔ P4
    expect(src).not.toContain("text-stone-400"); // قراردادِ کنتراستِ r172
  });
});
