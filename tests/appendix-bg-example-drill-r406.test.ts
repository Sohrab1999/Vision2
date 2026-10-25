// ------------------------------------------------------------------
// r406 — قفلهایِ موتورِ «دریل مثالهای درسنامهٔ جامع» — پنجمین بانکِ
// نمایِ مشترک. منبعِ حقیقت: BOOKLET_GRAMMAR_TOPICS — موتور هیچ مثال/
// ترجمه/موضوعی نمیسازد؛ گاردها یکتاییِ دوسویهٔ لنگر را میبندند
// (سرشماریِ r406: ۸ ترجمهٔ دوقلو + یک en با دو ترجمهٔ متفاوت).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildBgExampleDrillSession,
  flattenBgExamples,
  BG_EXAMPLE_DRILL_KINDS,
  BG_EXAMPLE_KIND_LABEL,
} from "@/lib/appendix-bg-example-drill";
import {
  buildDrillReplay,
  scoreDrill,
  DRILL_SIZE,
  type DrillQuestion,
} from "@/lib/appendix-drill";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";

// mulberry32 — قطعیتِ جلسه زیرِ تست (مالکِ الگو: موتورهایِ r400..r405)
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

const BANK = flattenBgExamples(BOOKLET_GRAMMAR_TOPICS);
const faSet = new Set(BANK.map((x) => x.fa));
const enSet = new Set(BANK.map((x) => x.en));
const titleSet = new Set(BANK.map((x) => x.topicTitle));

/** نقشهٔ یکتایی — عینِ سدهای موتور، مستقل بازسازی شده */
const enFas = new Map<string, Set<string>>();
const faEns = new Map<string, Set<string>>();
const enCount = new Map<string, number>();
for (const it of BANK) {
  if (!enFas.has(it.en)) enFas.set(it.en, new Set());
  enFas.get(it.en)!.add(it.fa);
  if (!faEns.has(it.fa)) faEns.set(it.fa, new Set());
  faEns.get(it.fa)!.add(it.en);
  enCount.set(it.en, (enCount.get(it.en) ?? 0) + 1);
}
const uniqueEn = [...enFas.entries()].filter(([, s]) => s.size === 1).map(([e]) => e);
const uniqueFa = [...faEns.entries()].filter(([, s]) => s.size === 1).map(([f]) => f);
const uniqueExampleEn = [...enCount.entries()].filter(([, c]) => c === 1).map(([e]) => e);

describe("appendix-bg-example-drill r406 — بانک و سرشماریِ منجمد", () => {
  it("بانکِ تختشده صادق است: ۲۰۵ مثال از ۳۲ درسنامه — هیچ فیلدی بیرونِ جزوه", () => {
    expect(BOOKLET_GRAMMAR_TOPICS.length).toBe(32);
    expect(BANK.length).toBe(205);
    for (const it of BANK) {
      expect(it.en.length).toBeGreaterThan(0);
      expect(it.fa.length).toBeGreaterThan(0);
      expect(BOOKLET_GRAMMAR_TOPICS.some((t) => t.id === it.topicId && t.title === it.topicTitle)).toBe(true);
    }
  });

  it("گروهِ راهنما و برچسبِ گونهها ثبتشدهاند — سه گونه با چرخشِ fa/ex/topic", () => {
    expect(BG_EXAMPLE_DRILL_KINDS).toEqual(["fa", "ex", "topic"]);
    expect(BG_EXAMPLE_KIND_LABEL["fa"]).toBe("ترجمه");
    expect(BG_EXAMPLE_KIND_LABEL["ex"]).toBe("جملهٔ انگلیسی");
    expect(BG_EXAMPLE_KIND_LABEL["topic"]).toBe("موضوع");
  });

  it("یکتاییِ دوسویه — سرشماریِ مستقل با گاردهایِ موتور همخوان است", () => {
    // enِ دوترجمه (درسِ لنگرِ بیابهام): «They were forced…» هرگز سؤالِ ترجمه نمیشود
    expect(enFas.get("They were forced to leave the class quickly.")!.size).toBe(2);
    expect(uniqueEn.length).toBeGreaterThan(150);
    expect(uniqueFa.length).toBeGreaterThan(150);
    expect(uniqueExampleEn.length).toBeGreaterThan(150);
  });
});

describe("appendix-bg-example-drill r406 — ساختِ جلسه", () => {
  it("جلسهٔ ۱۰تایی: چرخشِ fa×۴/ex×۳/topic×۳ با faOptionsِ مالکِ موتور", () => {
    const s = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(406));
    expect(s.size).toBe(10);
    expect(s.questions.length).toBe(10);
    const kinds = s.questions.map((q) => q.kind);
    expect(kinds).toEqual(["fa", "ex", "topic", "fa", "ex", "topic", "fa", "ex", "topic", "fa"]);
    for (const q of s.questions) {
      expect(q.faOptions).toBe(q.kind === "fa" || q.kind === "topic");
    }
  });

  it("قانونِ چیپ (r230/r404): جملهٔ پرسش شنیدنی است در ترجمه و موضوع؛ در جملهٔ انگلیسی هیچ — شنیدنیِ پرسش هرگز پاسخ نیست", () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(seed));
      for (const q of s.questions) {
        if (q.kind === "fa") {
          expect(q.speak).toBe(q.base); // خودِ جملهٔ هدف
          expect(faSet.has(q.options[q.answer])).toBe(true); // پاسخ فارسی — جمله پاسخ نیست
        } else if (q.kind === "ex") {
          expect(q.speak).toBeUndefined(); // گزینهها انگلیسیاند — چیپ نشت میکرد
          expect(enSet.has(q.options[q.answer])).toBe(true);
        } else {
          expect(q.speak).toBeTruthy(); // موضوع: جملهٔ مثالِ شنیدنی حاضر است
          expect(titleSet.has(q.options[q.answer])).toBe(true);
        }
      }
    }
  });

  it("گاردِ لنگرِ بیابهام زیرِ ۲۰۰ seed: ترجمه فقط از enِ یکترجمه، جمله فقط از faِ یکEN، موضوع فقط از enِ یکتا", () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(seed * 7 + 1));
      for (const q of s.questions) {
        if (q.kind === "fa") {
          expect(enFas.get(q.speak!)!.size).toBe(1);
          expect(q.options[q.answer]).toBe([...enFas.get(q.speak!)!][0]);
          // regressionِ سرشماری: enِ دوترجمه هرگز promptِ ترجمه نمیشود
          expect(q.speak).not.toBe("They were forced to leave the class quickly.");
        } else if (q.kind === "ex") {
          const fa = (q.prompt.match(/«(.+)»/) || [])[1]!;
          expect(faEns.get(fa)!.size).toBe(1);
          expect(q.options[q.answer]).toBe([...faEns.get(fa)!][0]);
        } else {
          const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === q.base)!;
          expect(enCount.get(q.speak!)).toBe(1); // enِ یکتا در کلِ بانک
          expect(topic.examples!.some((e) => e.en === q.speak)).toBe(true);
        }
      }
    }
  });

  it("بازخوانیِ نتیجه صادق است: base در هر گونه هدفِ واقعی را نام میبرد", () => {
    const s = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(909));
    for (const q of s.questions) {
      if (q.kind === "topic") {
        const t = BOOKLET_GRAMMAR_TOPICS.find((x) => x.id === q.base)!;
        expect(q.options[q.answer]).toBe(t.title); // پاسخ = عنوانِ همان موضوع
      } else {
        expect(enSet.has(q.base)).toBe(true); // جملهٔ هدف
      }
    }
  });

  it("استخرِ ارزشی: گزینهها دوبهدو متمایز، ۴تایی، همگی از خودِ بانک (نه ساختهٔ ماشینی)", () => {
    for (let seed = 0; seed < 60; seed++) {
      const s = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(seed * 13 + 5));
      for (const q of s.questions) {
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.options.length).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        for (const opt of q.options) {
          if (q.kind === "fa") expect(faSet.has(opt)).toBe(true);
          else if (q.kind === "ex") expect(enSet.has(opt)).toBe(true);
          else expect(titleSet.has(opt)).toBe(true);
        }
      }
    }
  });

  it("قطعیت زیرِ seed و تفاوت زیرِ seedهایِ متفاوت", () => {
    const a = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(77));
    const b = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(77));
    const c = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(78));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
  });

  it("clamp: اندیسِ ۰ → یک پرسش؛ اندیسِ غول → سقفِ بانکِ ۲۰۵تایی با بازاستفادهٔ صادق", () => {
    const one = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, 0, mulberry32(1));
    expect(one.size).toBe(1);
    const big = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, 999, mulberry32(2));
    expect(big.size).toBe(205);
    expect(big.questions.length).toBe(205);
    for (const q of big.questions) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("بانکِ تهی → جلسهٔ تهیِ صادق؛ موضوعِ بی مثال هیچ سؤالی نمیآورد", () => {
    const empty = buildBgExampleDrillSession([], DRILL_SIZE, mulberry32(3));
    expect(empty).toEqual({ questions: [], size: 0 });
    const noExamples = buildBgExampleDrillSession(
      [{ id: "t", source: "دهم", title: "x", page: "p" }],
      DRILL_SIZE,
      mulberry32(4),
    );
    expect(noExamples).toEqual({ questions: [], size: 0 });
  });

  it("ترکیبِ گونهها در جلسهٔ کاملِ ۲۰۵تایی: fa×۶۹ / ex×۶۸ / topic×۶۸ (چرخشِ صادق)", () => {
    const big = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, 205, mulberry32(11));
    const counts = { fa: 0, ex: 0, topic: 0 };
    for (const q of big.questions) counts[q.kind as "fa" | "ex" | "topic"]++;
    expect(counts).toEqual({ fa: 69, ex: 68, topic: 68 });
  });

  it("بانکِ خطا و نمره از مالکِ مشترک — بدونِ برچسبنویسیِ دوباره (ضدِ دو-نامِ r385)", () => {
    const s = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(21));
    const answers: (number | null)[] = s.questions.map((q, i) => (i % 3 === 0 ? null : (q.answer + 1) % q.options.length));
    const score = scoreDrill(s.questions, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(0); // همهٔ پاسخهایِ نادرستِ عمدی + بیپاسخِ صادق
    const replay = buildDrillReplay(s.questions, answers);
    expect(replay.size).toBe(10); // نادرست + بیپاسخ
    expect(replay.questions.map((q) => q.options)).toEqual(s.questions.map((q) => q.options));
    const perfect = buildDrillReplay(s.questions, s.questions.map((q) => q.answer));
    expect(perfect.size).toBe(0); // جلسهٔ بیاشتباه — دکمهٔ مرور هم بالا نمیآید
  });

  it("قفلِ منبع: موتور هیچ نوشتنی به استورِ یادگیری ندارد و از مالکِ مشترک میخواند", () => {
    const src = readFileSync("src/lib/appendix-bg-example-drill.ts", "utf8");
    expect(src).not.toContain("study-store");
    expect(src).not.toContain("useStudy");
    expect(src).toContain('from "./appendix-drill"'); // shuffled/DRILL_SIZE/مالکِ نمره و مرور
    expect(src).not.toContain("Math.random()"); // rng تزریقی — هیچ فراخوانِ مستقیم
  });

  it("عنوانِ موضوعها در کلِ ۳۲تایی یکتاست — گزینههایِ گونهٔ موضوع دوقلو ندارند", () => {
    const allTitles = BOOKLET_GRAMMAR_TOPICS.map((t) => t.title);
    expect(new Set(allTitles).size).toBe(32);
    // بانکِ تختشده فقط صاحبانِ مثال را میبیند (۲۶ موضوع) — همانهایی که
    // گونهٔ موضوع ازشان گزینه میسازد؛ یکتاییشان شرطِ پاسخِ بیابهام است
    expect(titleSet.size).toBe(26);
  });
});
