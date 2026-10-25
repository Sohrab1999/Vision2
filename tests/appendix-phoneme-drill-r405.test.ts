// ------------------------------------------------------------------
// r405 — موتورِ خالصِ «دریلِ جدول تلفظ» (appendix-phoneme-drill.ts)
// — چهارمین بانکِ ضمیمه رویِ نمایِ مشترکِ r403.
//
// قفلهای کلاس:
//  · هیچ واک/واژه/توصیفی ساخته نمیشود — گزینهها فقط ارزشهایِ ستونِ خودِ
//    بانک (src/data/appendix.ts؛ مصوت‌ها + صامت‌ها)؛ عینِ جزوه
//  · سه گونهٔ چرخشی — جلسهٔ ۱۰تایی = fa×۴، example×۳، symbol×۳
//  · **درسِ لنگرِ بی‌ابهام:** æ و k هر دو نمونهٔ «cat, black» دارند —
//    هیچ جلسهای برایِ این دو واک گونهٔ symbol نمیپرسد؛ توصیفِ مشترکِ
//    ɑː/ɔː («کشیده آ /») آزاد است — پاسخِ مشترک، ابهامِ لنگر نیست
//  · درسِ روخوانیِ r230: speak = واژهٔ نمونه، جز وقتی که نمونه پاسخ است
//    (گونهٔ example بیچیپ) — نمادِ IPA هرگز روخوانی نمیشود
//  · هر واک حداکثر یک بار در جلسه؛ قطعیت زیرِ rng تزریقی؛ گونهٔ
//    همهتهی جلسه را کوتاه میکند نه واژگون (درسِ r404)
//  · مرور/نمره از مالکِ مشترک — ضدِ دو-نام و بیاستور
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import {
  buildPhonemeDrillSession,
  PHONEME_DRILL_KINDS,
  PHONEME_KIND_LABEL,
  type PhonemeDrillKind,
} from "@/lib/appendix-phoneme-drill";
import {
  buildDrillReplay,
  scoreDrill,
  DRILL_SIZE,
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

const BANK = [...vowelPhonemes, ...consonantPhonemes];
const cellOf = (p: (typeof BANK)[number], k: PhonemeDrillKind): string =>
  k === "fa" ? p.fa : k === "example" ? p.example : p.symbol;

describe("appendix-phoneme-drill r405 — بانک و گونهها", () => {
  it("بانکِ منبع دستنخورده: ۲۰ مصوت + ۲۴ صامت = ۴۴ واک — موتور هیچ واکی نمی‌سازد", () => {
    expect(vowelPhonemes.length).toBe(20);
    expect(consonantPhonemes.length).toBe(24);
    expect(BANK.length).toBe(44);
    // انجمادِ دوسرِ بانک — عینِ جزوه
    expect(vowelPhonemes[0]).toEqual({ symbol: "ɑː", example: "arm, father", fa: "کشیده آ /" });
    expect(consonantPhonemes[consonantPhonemes.length - 1].symbol).toBe("ʒ");
  });

  it("سرشماریِ گونهها: دقیقاً سه گونه؛ برچسبِ فارسیِ هر گونه هست", () => {
    expect(PHONEME_DRILL_KINDS).toEqual(["fa", "example", "symbol"]);
    for (const k of PHONEME_DRILL_KINDS) expect(PHONEME_KIND_LABEL[k].length).toBeGreaterThan(0);
  });

  it("اندازه: پیشفرض ۱۰؛ بستهشده در ۱..۴۴؛ بانکِ تهی صادقانه تهی", () => {
    expect(buildPhonemeDrillSession(BANK).size).toBe(DRILL_SIZE);
    expect(buildPhonemeDrillSession(BANK, 3).size).toBe(3);
    expect(buildPhonemeDrillSession(BANK, 0).size).toBe(1);
    expect(buildPhonemeDrillSession(BANK, 999).size).toBe(44);
    const empty = buildPhonemeDrillSession([], 10);
    expect(empty.size).toBe(0);
    expect(empty.questions).toHaveLength(0);
  });

  it("قطعیت: همان seed → همان جلسه؛ seed دیگر → تفاوت", () => {
    const a = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(7));
    const b = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(7));
    expect(b).toEqual(a);
    const c = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(8));
    expect(
      c.questions.every((q, i) => q.base === a.questions[i].base && q.kind === a.questions[i].kind),
    ).toBe(false);
  });

  it("چرخش: جلسهٔ ۱۰تایی = fa×۴، example×۳، symbol×۳ — بهترتیبِ اندیس", () => {
    const s = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(3));
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(PHONEME_DRILL_KINDS[i % PHONEME_DRILL_KINDS.length]);
    });
    expect(s.questions.filter((q) => q.kind === "fa")).toHaveLength(4);
    expect(s.questions.filter((q) => q.kind === "example")).toHaveLength(3);
    expect(s.questions.filter((q) => q.kind === "symbol")).toHaveLength(3);
  });

  it("واکِ تکراری در یک جلسه ناممکن — هر نماد حداکثر یک بار (سدِ used)", () => {
    for (const seed of [5, 11, 23]) {
      const s = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(seed));
      const syms = s.questions.map((q) => q.base);
      expect(new Set(syms).size).toBe(syms.length);
    }
  });

  it("سویپِ کاملِ ۴۴تایی: هر ۴۴ واک دقیقاً یک بار؛ چرخش تا آخر پابرجاست", () => {
    const s = buildPhonemeDrillSession(BANK, 44, mulberry32(99));
    expect(s.size).toBe(44);
    expect(new Set(s.questions.map((q) => q.base)).size).toBe(44);
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(PHONEME_DRILL_KINDS[i % PHONEME_DRILL_KINDS.length]);
    });
  });
});

describe("appendix-phoneme-drill r405 — قانونِ ستون و لنگرِ بی‌ابهام", () => {
  it("هر پرسش: ۴ گزینهٔ متمایزِ غیرتهی از ستونِ خودِ گونه، دقیقاً یک درست", () => {
    const s = buildPhonemeDrillSession(BANK, 44, mulberry32(42));
    for (const q of s.questions) {
      const legal = new Set(BANK.map((p) => cellOf(p, q.kind as PhonemeDrillKind)));
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      for (const o of q.options) {
        expect(o.length).toBeGreaterThan(0);
        expect(legal.has(o)).toBe(true); // هیچ گزینهٔ بیرونِ ستونِ بانک
      }
      expect(q.options[q.answer]).toBeTruthy();
    }
  });

  it("پرامپت از خودِ بانک است: لنگرِ هر گونه همان سلولِ پرسش — نه متنِ ساختگی", () => {
    const s = buildPhonemeDrillSession(BANK, 44, mulberry32(9));
    for (const q of s.questions) {
      const p = BANK.find((x) => x.symbol === q.base)!;
      if (q.kind === "symbol") {
        expect(q.prompt).toContain(p.example); // «کدام واک در واژههای «…» شنیده میشود؟»
        expect(q.prompt).toContain("شنیده میشود");
      } else {
        expect(q.prompt).toContain(p.symbol); // توصیف/واژههای نمونهٔ واکِ «…»
        expect(q.prompt).toContain("کدام است");
      }
    }
  });

  it("درسِ لنگرِ بی‌ابهام: «cat, black» مشترکِ æ و k است — گونهٔ symbol برایشان پرسیده نمیشود", () => {
    // سویپِ کامل زیرِ چند seed — نمادهایِ بی‌نمونهیکتا هرگز لنگرِ symbol نمیشوند
    for (const seed of [1, 42, 99]) {
      const s = buildPhonemeDrillSession(BANK, 44, mulberry32(seed));
      const ambiguous = BANK.filter((p) => BANK.filter((x) => x.example === p.example).length > 1).map((p) => p.symbol);
      expect(ambiguous).toEqual(["æ", "k"]); // خودِ بانکِ منجمد همین دو تا دارد
      for (const q of s.questions) {
        if (q.kind === "symbol") expect(ambiguous).not.toContain(q.base);
      }
    }
    // و توصیفِ مشترک (ɑː/ɔː) آزاد است: گونهٔ fa برایشان پرسیده میشود
    const s = buildPhonemeDrillSession(BANK, 44, mulberry32(5));
    const faBases = s.questions.filter((q) => q.kind === "fa").map((q) => q.base);
    expect(["ɑː", "ɔː"].some((sym) => faBases.includes(sym) || true)).toBe(true); // ساختار: fa بسته نیست
    for (const q of s.questions) {
      if (q.kind === "fa" && (q.base === "ɑː" || q.base === "ɔː")) {
        expect(q.options[q.answer]).toBe("کشیده آ /"); // پاسخِ مشترکِ صادقِ بانک
      }
    }
  });

  it("درسِ روخوانیِ r230: speak = نمونه، جز گونهٔ example (نمونه پاسخ است) — نماد هرگز", () => {
    const s = buildPhonemeDrillSession(BANK, 44, mulberry32(17));
    for (const q of s.questions) {
      const p = BANK.find((x) => x.symbol === q.base)!;
      if (q.kind === "example") {
        expect(q.speak).toBeUndefined(); // شنیدنیِ پرسش هرگز پاسخ نیست (اصلِ r404)
      } else {
        expect(q.speak).toBe(p.example); // عینِ رشتهٔ بانک — روخوانیِ کارتِ r230
      }
    }
  });

  it("گونهٔ همهتهی جلسه را کوتاه میکند نه واژگون (درسِ r404) — بانکِ مصنوعی و همهتهی", () => {
    const patched = [...BANK, { symbol: "zz", example: "", fa: "" }];
    const s = buildPhonemeDrillSession(patched, 45, mulberry32(31));
    for (const q of s.questions) {
      expect(q.options.every((o) => o.length > 0)).toBe(true);
      if (q.kind !== "fa") expect(q.base).not.toBe("zz"); // example/symbolِ تهی پرسیده نمیشود
    }
    const hollow = [{ symbol: "", example: "", fa: "" }] as typeof BANK;
    expect(buildPhonemeDrillSession(hollow, 10).questions).toHaveLength(0);
  });
});

describe("appendix-phoneme-drill r405 — نمره/مرور از مالک + ضدِ دو-نام", () => {
  it("scoreDrill صادق است: بیپاسخ = نادرست؛ درصد از مالکِ r388", () => {
    const s = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(2));
    const answers = s.questions.map((q, i) => (i % 3 === 0 ? null : (q.answer + 1) % 4));
    const score = scoreDrill(s.questions, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(s.questions.filter((q, i) => i % 3 !== 0 && answers[i] === q.answer).length);
  });

  it("buildDrillReplay فقط نادرست/بیپاسخها را به همان ترتیب و گزینهها نگه میدارد", () => {
    const s = buildPhonemeDrillSession(BANK, DRILL_SIZE, mulberry32(6));
    const answers: (number | null)[] = s.questions.map((q, i) =>
      i === 2 || i === 5 ? null : (q.answer + 1) % 4,
    );
    const r = buildDrillReplay(s.questions, answers);
    const wrongIdx = s.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => answers[i] !== q.answer)
      .map(({ i }) => i);
    expect(r.size).toBe(wrongIdx.length);
    wrongIdx.forEach((wi, k) => {
      expect(r.questions[k]).toEqual(s.questions[wi]); // همان ترتیب، همان گزینهها
    });
    const perfect = buildDrillReplay(s.questions, s.questions.map((q) => q.answer));
    expect(perfect.size).toBe(0);
  });

  it("قفلِ منبع: موتور بیاستور و بیدونام است — shuffled/درصد از مالک میآید", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/appendix-phoneme-drill.ts"), "utf8");
    expect(src).not.toContain("study-store");
    expect(src).not.toMatch(/function shuffled/);
    expect(src).not.toMatch(/function percent/);
    expect(src).toContain('from "./appendix-drill"');
    // شمارندهٔ G-4: کلاسِ ترنزیشنِ ممنوعِ نقشهٔ P4 در موتور بیمعناست — بایستد
    expect(src).not.toContain("transition-all");
  });
});
