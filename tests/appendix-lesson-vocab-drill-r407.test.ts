// ------------------------------------------------------------------
// r407 — قفلهای موتور «دریل واژگان درس» — ششمین بانکِ نمایِ مشترک و
// نخستین بانکِ ساکن در خودِ درس. منبعِ حقیقت: vocabularyِ هر درس —
// موتور هیچ واژه/معنی/نقشی نمیسازد؛ گاردهایِ یکتاییِ دوسویه (r406)
// رویِ دادهٔ واقعی میبندند: سرشماریِ r407 — en در هر ۱۲ درس یکتا،
// fa دوقلو تا ۱۶ در درس ۱۰، و درسِ ۹ فقط ۳ برچسبِ نقش دارد.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildLessonVocabDrillSession,
  lessonVocabDrillPlan,
  LESSON_VOCAB_DRILL_KINDS,
  LESSON_VOCAB_KIND_LABEL,
} from "@/lib/appendix-lesson-vocab-drill";
import {
  buildDrillReplay,
  scoreDrill,
  DRILL_SIZE,
} from "@/lib/appendix-drill";
import { lessons } from "@/data";
import { posLabel } from "@/lib/study-theme";

// mulberry32 — قطعیتِ جلسه زیرِ تست (مالکِ الگو: موتورهایِ r400..r406)
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

const LESSON1 = lessons[0]!;
const LESSON9 = lessons[8]!; // «ارزش دانش» — تنها درسِ کم-نقش (۳ برچسب)
const V1 = LESSON1.vocabulary;

/** نقشهٔ یکتاییِ مستقل برایِ یک بانک — عینِ سدهایِ موتور، بازسازیِ بیرونی */
function uniqueness(bank: { en: string; fa: string }[]) {
  const enFas = new Map<string, Set<string>>();
  const faEns = new Map<string, Set<string>>();
  for (const w of bank) {
    if (!enFas.has(w.en)) enFas.set(w.en, new Set());
    enFas.get(w.en)!.add(w.fa);
    if (!faEns.has(w.fa)) faEns.set(w.fa, new Set());
    faEns.get(w.fa)!.add(w.en);
  }
  return { enFas, faEns };
}

const faSet1 = new Set(V1.map((w) => w.fa));
const enSet1 = new Set(V1.map((w) => w.en));

describe("appendix-lesson-vocab-drill r407 — بانک و سرشماریِ منجمد", () => {
  it("بانکِ صادق: درس ۱ = ۲۰۴ واژه با enِ یکتا؛ هیچ سلولِ تهی در هیچ درسی", () => {
    expect(LESSON1.titleFa).toBe("فهمیدن مردم");
    expect(V1.length).toBe(204);
    for (const l of lessons) {
      for (const w of l.vocabulary) {
        expect(w.en.length).toBeGreaterThan(0);
        expect(w.fa.length).toBeGreaterThan(0);
      }
      const ens = new Set(l.vocabulary.map((w) => w.en));
      expect(ens.size).toBe(l.vocabulary.length); // en یکتا در همهٔ ۱۲ درس
    }
  });

  it("گونهها و برچسبها ثبتشدهاند — چرخشِ fa/en/pos با برچسبِ صادق", () => {
    expect(LESSON_VOCAB_DRILL_KINDS).toEqual(["fa", "en", "pos"]);
    expect(LESSON_VOCAB_KIND_LABEL["fa"]).toBe("معنی");
    expect(LESSON_VOCAB_KIND_LABEL["en"]).toBe("واژه");
    expect(LESSON_VOCAB_KIND_LABEL["pos"]).toBe("نقش کلامی");
  });

  it("برنامهٔ قطعی (بی rng): درس ۱ = ۱۰ پرسش سهگونه؛ درس ۹ = ۷ پرسش دگونه — صداقتِ r404", () => {
    const p1 = lessonVocabDrillPlan(V1);
    expect(p1).toEqual({ size: 10, kinds: ["fa", "en", "pos"], bank: 204 });
    const p9 = lessonVocabDrillPlan(LESSON9.vocabulary);
    expect(p9.kinds).toEqual(["fa", "en"]); // ۳ برچسبِ نقش < کفِ ۴ — pos بیپیشنهاد
    expect(p9.size).toBe(7); // چرخشِ ۱۰تایی بدونِ اندیسهایِ pos: ۲،۵،۸ میافتند
    expect(p9.bank).toBe(232);
  });

  it("سرشماریِ نقشِ درس ۹: فقط فعل/اسم/صفت — زیرِ کفِ ۴ گزینه؛ بقیهٔ درسها بالای کف", () => {
    const labels9 = new Set(
      LESSON9.vocabulary.filter((w) => w.pos).map((w) => posLabel[w.pos as string]),
    );
    expect([...labels9].sort()).toEqual(["اسم", "صفت", "فعل"]);
    for (const l of lessons) {
      if (l.id === LESSON9.id) continue;
      const s = new Set(
        l.vocabulary.filter((w) => w.pos).map((w) => posLabel[w.pos as string]),
      );
      expect(s.size).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("appendix-lesson-vocab-drill r407 — ساختِ جلسه", () => {
  it("جلسهٔ ۱۰تاییِ درس ۱: چرخشِ fa×۴/en×۳/pos×۳ با faOptionsِ مالکِ موتور", () => {
    const s = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(407));
    expect(s.size).toBe(10);
    expect(s.questions.map((q) => q.kind)).toEqual([
      "fa", "en", "pos", "fa", "en", "pos", "fa", "en", "pos", "fa",
    ]);
    for (const q of s.questions) {
      expect(q.faOptions).toBe(q.kind === "fa" || q.kind === "pos");
    }
  });

  it("قانونِ چیپ (r230/r404/r405): واژهٔ انگلیسیِ پرسش شنیدنی است در معنی و نقش؛ در گونهٔ واژه هیچ — شنیدنیِ پرسش هرگز پاسخ نیست", () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(seed));
      for (const q of s.questions) {
        if (q.kind === "fa") {
          expect(q.speak).toBe(q.base); // واژهٔ هدف
          expect(faSet1.has(q.options[q.answer])).toBe(true); // پاسخ فارسی — واژه پاسخ نیست
        } else if (q.kind === "en") {
          expect(q.speak).toBeUndefined(); // گزینهها واژههای انگلیسیاند — چیپ نشت میکرد
          expect(enSet1.has(q.options[q.answer])).toBe(true);
        } else {
          expect(q.speak).toBeTruthy(); // نقش: واژهٔ انگلیسیِ شنیدنی حاضر است
          expect(Object.values(posLabel)).toContain(q.options[q.answer]); // پاسخ برچسبِ نقش است
        }
      }
    }
  });

  it("گاردِ یکتاییِ دوسویه زیرِ ۲۰۰ seed: معنی فقط از enِ یکترجمه، واژه فقط از faِ یکواژه، نقش فقط از واژههایِ صاحبِ نقش", () => {
    const { enFas, faEns } = uniqueness(V1);
    for (let seed = 0; seed < 200; seed++) {
      const s = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(seed * 7 + 1));
      for (const q of s.questions) {
        if (q.kind === "fa") {
          const en = q.base;
          expect(enFas.get(en)!.size).toBe(1);
          expect(q.options[q.answer]).toBe([...enFas.get(en)!][0]);
        } else if (q.kind === "en") {
          const fa = (q.prompt.match(/«(.+)»/) || [])[1]!;
          expect(faEns.get(fa)!.size).toBe(1);
          expect(q.options[q.answer]).toBe([...faEns.get(fa)!][0]);
        } else {
          const w = V1.find((x) => x.en === q.base)!;
          expect(w.pos).toBeTruthy(); // خانهٔ تهیِ نقش پرسیدنی نیست
          expect(q.options[q.answer]).toBe(posLabel[w.pos as string]);
        }
      }
    }
  });

  it("سویپِ کاملِ هر ۱۲ درس زیرِ seedهایِ چندگانه: گزینهها از ستونِ خودِ درس، ۴تاییِ متمایز، پاسخ در بازه", () => {
    for (const l of lessons) {
      const faSet = new Set(l.vocabulary.map((w) => w.fa));
      const enSet = new Set(l.vocabulary.map((w) => w.en));
      const posSet = new Set(
        l.vocabulary.filter((w) => w.pos).map((w) => posLabel[w.pos as string]),
      );
      for (let seed = 0; seed < 12; seed++) {
        const s = buildLessonVocabDrillSession(l.vocabulary, DRILL_SIZE, mulberry32(seed * 31 + l.id));
        expect(s.size).toBe(l.id === LESSON9.id ? 7 : 10);
        for (const q of s.questions) {
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.options.length).toBe(4);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(4);
          for (const opt of q.options) {
            if (q.kind === "fa") expect(faSet.has(opt)).toBe(true);
            else if (q.kind === "en") expect(enSet.has(opt)).toBe(true);
            else expect(posSet.has(opt)).toBe(true);
          }
        }
      }
    }
  });

  it("سدِ تکرار: هیچ واژه‌ای دوبار در یک جلسهٔ ۱۰تایی نمیآید", () => {
    for (let seed = 0; seed < 60; seed++) {
      const s = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(seed * 17 + 3));
      const bases = s.questions.map((q) => `${q.kind}:${q.base}`);
      expect(new Set(bases).size).toBe(bases.length);
    }
  });

  it("قطعیت زیرِ seed و تفاوت زیرِ seedهایِ متفاوت", () => {
    const a = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(77));
    const b = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(77));
    const c = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(78));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
  });

  it("clamp: اندیسِ ۰ → یک پرسش؛ اندیسِ غول → سقفِ بانکِ ۲۰۴تایی با بازاستفادهٔ صادق", () => {
    const one = buildLessonVocabDrillSession(V1, 0, mulberry32(1));
    expect(one.size).toBe(1);
    const big = buildLessonVocabDrillSession(V1, 999, mulberry32(2));
    expect(big.size).toBe(204);
    expect(big.questions.length).toBe(204);
    for (const q of big.questions) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("بانکِ تهی → جلسهٔ تهیِ صادق", () => {
    const empty = buildLessonVocabDrillSession([], DRILL_SIZE, mulberry32(3));
    expect(empty).toEqual({ questions: [], size: 0 });
    const plan = lessonVocabDrillPlan([]);
    expect(plan).toEqual({ size: 0, kinds: [], bank: 0 });
  });

  it("ترکیبِ گونهها در جلسهٔ کاملِ ۲۰۴تایی: fa×۶۸ / en×۶۸ / pos×۶۸ (چرخشِ صادق)", () => {
    const big = buildLessonVocabDrillSession(V1, 204, mulberry32(11));
    const counts = { fa: 0, en: 0, pos: 0 };
    for (const q of big.questions) counts[q.kind as "fa" | "en" | "pos"]++;
    expect(counts).toEqual({ fa: 68, en: 68, pos: 68 });
  });

  it("درسِ ۹ واقعاً بی pos میماند زیرِ ۱۰۰ seed — کوتاهترِ صادق، نه سقوط", () => {
    for (let seed = 0; seed < 100; seed++) {
      const s = buildLessonVocabDrillSession(LESSON9.vocabulary, DRILL_SIZE, mulberry32(seed * 23 + 9));
      expect(s.size).toBe(7);
      for (const q of s.questions) expect(q.kind).not.toBe("pos");
    }
  });

  it("بانکِ مصنوعیِ دوقلو: faِ دوقلو هرگز پرامپتِ واژه نمیشود؛ enِ دوترجمه هرگز پرامپتِ معنی نمیشود (کلاس، نه نمونه)", () => {
    const SYN = [
      { en: "alpha", fa: "معنی‌یک", pos: "n" as const },
      { en: "beta", fa: "معنی‌دو", pos: "v" as const },
      { en: "gamma", fa: "معنی‌یک", pos: "adj" as const }, // faِ دوقلو با alpha
      { en: "delta", fa: "معنی‌چهار", pos: "adv" as const },
      { en: "dup", fa: "الف", pos: "prep" as const },
      { en: "dup", fa: "بِتا", pos: "phr" as const }, // enِ دوترجمه
      { en: "zeta", fa: "معنی‌هفت", pos: "phr.v" as const },
    ];
    for (let seed = 0; seed < 200; seed++) {
      const s = buildLessonVocabDrillSession(SYN, 20, mulberry32(seed * 11 + 5));
      for (const q of s.questions) {
        if (q.kind === "en") {
          expect(q.prompt).not.toContain("معنی‌یک"); // دو مالک: alpha و gamma
        }
        if (q.kind === "fa") {
          expect(q.base).not.toBe("dup"); // دو ترجمه — پرامپتِ معنی مبهم میشد
        }
      }
    }
    // و گونهٔ pos در بانکِ مصنوعی زنده است (۷ برچسب ≥ کف)
    const s = buildLessonVocabDrillSession(SYN, 10, mulberry32(9));
    expect(s.questions.some((q) => q.kind === "pos")).toBe(true);
  });

  it("بانکِ مصنوعیِ کم-نقش: ۳ برچسب → گونهٔ pos بیپیشنهاد؛ جلسه کوتاه میشود نه واژگون", () => {
    const SYN3 = [
      { en: "a1", fa: "ف", pos: "n" as const },
      { en: "b1", fa: "د", pos: "v" as const },
      { en: "c1", fa: "س", pos: "adj" as const },
      { en: "d1", fa: "چ" },
      { en: "e1", fa: "پ" },
    ];
    const plan = lessonVocabDrillPlan(SYN3);
    expect(plan.kinds).toEqual(["fa", "en"]);
    for (let seed = 0; seed < 50; seed++) {
      const s = buildLessonVocabDrillSession(SYN3, DRILL_SIZE, mulberry32(seed + 100));
      // n = min(10, 5 بانک) = ۵؛ اندیسِ pos (۲) میافتد → ۴ پرسشِ صادق
      expect(s.size).toBe(4);
      for (const q of s.questions) expect(q.kind).not.toBe("pos");
    }
  });

  it("بانکِ خطا و نمره از مالکِ مشترک — بدونِ برچسبنویسیِ دوباره (ضدِ دو-نامِ r385)", () => {
    const s = buildLessonVocabDrillSession(V1, DRILL_SIZE, mulberry32(21));
    const answers: (number | null)[] = s.questions.map((q, i) =>
      i % 3 === 0 ? null : (q.answer + 1) % q.options.length,
    );
    const score = scoreDrill(s.questions, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(0); // پاسخهایِ نادرستِ عمدی + بیپاسخِ صادق
    const replay = buildDrillReplay(s.questions, answers);
    expect(replay.size).toBe(10);
    expect(replay.questions.map((q) => q.options)).toEqual(s.questions.map((q) => q.options));
    const perfect = buildDrillReplay(s.questions, s.questions.map((q) => q.answer));
    expect(perfect.size).toBe(0); // جلسهٔ بیاشتباه — دکمهٔ مرور هم بالا نمیآید
  });

  it("قفلِ منبع: موتور بیاستور است، از مالکِ مشترک و مالکِ برچسبِ نقش میخواند و کلاسِ ممنوع ندارد", () => {
    const src = readFileSync("src/lib/appendix-lesson-vocab-drill.ts", "utf8");
    expect(src).not.toContain("study-store");
    expect(src).not.toContain("useStudy");
    expect(src).toContain('from "./appendix-drill"'); // shuffled/DRILL_SIZE/مالکِ نمره و مرور
    expect(src).toContain('from "@/lib/study-theme"'); // posLabel — دو-نامِ r385 ممنوع
    expect(src).not.toContain("Math.random()"); // rng تزریقی — هیچ فراخوانِ مستقیم
    expect(src).not.toContain("transition-all"); // نقشهٔ P4
    expect(src).not.toContain("text-stone-400"); // قراردادِ کنتراستِ r172
  });
});
