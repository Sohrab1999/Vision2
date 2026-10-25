// ------------------------------------------------------------------
// r404 — موتورِ خالصِ «دریلِ نشانه‌های اختصاری» (appendix-abbrev-drill.ts)
// — سومین بانکِ ضمیمه رویِ نمایِ مشترکِ r403.
//
// قفلهای کلاس:
//  · هیچ نشانه/معنی/شکلی ساخته نمیشود — گزینهها فقط ارزشهایِ ستونِ خودِ
//    بانک (src/data/appendix.ts)؛ عینِ جزوه
//  · سه گونهٔ چرخشی — جلسهٔ ۱۰تایی = fa×۴، full×۳، sym×۳ (چرخشِ صادقِ
//    اندیس؛ ۱۰ بر ۳ بخشپذیر نیست)
//  · درسِ روخوانیِ r231: speak فقط در گونهٔ sym است (شکلِ کامل — همان
//    چیزی که کارتِ r231 رویش دکمهٔ روخوانی دارد)؛ نماد روخوانی نمیشود
//  · هر نشانه حداکثر یک بار در جلسه؛ قطعیت زیرِ rng تزریقی
//  · مرور/نمره از مالکِ مشترک — ضدِ دو-نام: هیچ Fisher-Yates یا درصدِ
//    دومی در موتور نیست و استورِ یادگیری را نمیشناسد (حکمِ r400)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { abbreviations } from "@/data/appendix";
import {
  buildAbbrevDrillSession,
  ABBREV_DRILL_KINDS,
  ABBREV_KIND_LABEL,
  type AbbrevDrillKind,
} from "@/lib/appendix-abbrev-drill";
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

const cellOf = (a: (typeof abbreviations)[number], k: AbbrevDrillKind): string =>
  k === "fa" ? a.fa : k === "full" ? a.full : a.sym;

describe("appendix-abbrev-drill r404 — بانک و گونهها", () => {
  it("بانکِ منبع دستنخورده: ۱۳ نشانه — موتور هیچ نشانه‌ای نمی‌سازد", () => {
    expect(abbreviations.length).toBe(13);
    // انجمادِ دو سرِ بانک — عینِ جزوه
    expect(abbreviations[0]).toEqual({ sym: "n", full: "(noun)", fa: "اسم" });
    expect(abbreviations[12]).toEqual({ sym: "ant", full: "(antonym)", fa: "متضاد" });
  });

  it("سرشماریِ گونهها: دقیقاً سه گونه؛ برچسبِ فارسیِ هر گونه هست", () => {
    expect(ABBREV_DRILL_KINDS).toEqual(["fa", "full", "sym"]);
    for (const k of ABBREV_DRILL_KINDS) expect(ABBREV_KIND_LABEL[k].length).toBeGreaterThan(0);
  });

  it("اندازه: پیشفرض ۱۰؛ بستهشده در ۱..۱۳؛ بانکِ تهی صادقانه تهی", () => {
    expect(buildAbbrevDrillSession(abbreviations).size).toBe(DRILL_SIZE);
    expect(buildAbbrevDrillSession(abbreviations, 3).size).toBe(3);
    expect(buildAbbrevDrillSession(abbreviations, 0).size).toBe(1);
    expect(buildAbbrevDrillSession(abbreviations, 999).size).toBe(13);
    const empty = buildAbbrevDrillSession([], 10);
    expect(empty.size).toBe(0);
    expect(empty.questions).toHaveLength(0);
  });

  it("قطعیت: همان seed → همان جلسه؛ seed دیگر → تفاوت", () => {
    const a = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(7));
    const b = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(7));
    expect(b).toEqual(a);
    const c = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(8));
    expect(
      c.questions.every((q, i) => q.base === a.questions[i].base && q.kind === a.questions[i].kind),
    ).toBe(false);
  });

  it("چرخش: جلسهٔ ۱۰تایی = fa×۴، full×۳، sym×۳ — بهترتیبِ اندیس", () => {
    const s = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(3));
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(ABBREV_DRILL_KINDS[i % ABBREV_DRILL_KINDS.length]);
    });
    expect(s.questions.filter((q) => q.kind === "fa")).toHaveLength(4);
    expect(s.questions.filter((q) => q.kind === "full")).toHaveLength(3);
    expect(s.questions.filter((q) => q.kind === "sym")).toHaveLength(3);
  });

  it("نشانهٔ تکراری در یک جلسه ناممکن — هر نماد حداکثر یک بار (سدِ used)", () => {
    for (const seed of [5, 11, 23]) {
      const s = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(seed));
      const syms = s.questions.map((q) => q.base);
      expect(new Set(syms).size).toBe(syms.length);
    }
  });

  it("سویپِ کاملِ ۱۳تایی: هر ۱۳ نشانه دقیقاً یک بار؛ چرخش تا آخر پابرجاست", () => {
    const s = buildAbbrevDrillSession(abbreviations, 13, mulberry32(99));
    expect(s.size).toBe(13);
    expect(new Set(s.questions.map((q) => q.base)).size).toBe(13);
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(ABBREV_DRILL_KINDS[i % ABBREV_DRILL_KINDS.length]);
    });
  });
});

describe("appendix-abbrev-drill r404 — قانونِ ستون و صداقتِ پرامپت", () => {
  it("هر پرسش: ۴ گزینهٔ متمایزِ غیرتهی از ستونِ خودِ گونه، دقیقاً یک درست", () => {
    const s = buildAbbrevDrillSession(abbreviations, 13, mulberry32(42));
    for (const q of s.questions) {
      const legal = new Set(abbreviations.map((a) => cellOf(a, q.kind as AbbrevDrillKind)));
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      for (const o of q.options) {
        expect(o.length).toBeGreaterThan(0);
        expect(legal.has(o)).toBe(true); // هیچ گزینهٔ بیرونِ ستونِ بانک
      }
      expect(q.options[q.answer]).toBeTruthy();
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
    }
  });

  it("پرامپت از خودِ بانک است: لنگرِ هر گونه همان سلولِ پرسش — نه متنِ ساختگی", () => {
    const s = buildAbbrevDrillSession(abbreviations, 13, mulberry32(9));
    for (const q of s.questions) {
      const a = abbreviations.find((x) => x.sym === q.base)!;
      if (q.kind === "sym") {
        expect(q.prompt).toContain(a.full); // «(verb)» با کدام نشانه کوتاه میشود؟
        expect(q.prompt).toContain("کوتاه میشود");
      } else {
        expect(q.prompt).toContain(a.sym); // معنی/شکلِ کاملِ نشانهٔ «sym»
        expect(q.prompt).toContain("کدام است");
      }
    }
  });

  it("درسِ روخوانیِ r231: فقط گونهٔ sym چیپِ TTS دارد — و همان شکلِ کاملِ واقعی است", () => {
    const s = buildAbbrevDrillSession(abbreviations, 13, mulberry32(17));
    for (const q of s.questions) {
      const a = abbreviations.find((x) => x.sym === q.base)!;
      if (q.kind === "sym") {
        expect(q.speak).toBe(a.full); // عینِ رشتهٔ بانک — روخوانیِ جدولِ r231
      } else {
        expect(q.speak).toBeUndefined(); // نمادِ اختصاری روخوانی نمیشود
      }
    }
  });

  it("خانهٔ خالی هیچوقت پرسش یا گزینه نیست — بانکِ فعلی پراست ولی قرارداد بایستد", () => {
    // بانکِ مصنوعی با خانهٔ تهی: گونهٔ full برایش پرسیدنی نمیشود
    const patched = [
      ...abbreviations,
      { sym: "xx", full: "", fa: "آزمایشی" },
    ];
    const s = buildAbbrevDrillSession(patched as typeof abbreviations, 14, mulberry32(31));
    for (const q of s.questions) {
      expect(q.options.every((o) => o.length > 0)).toBe(true);
      if (q.kind === "full") expect(q.base).not.toBe("xx"); // لنگرِ symِ تهی نمیماند ولی fullِ تهی پرسیده نمیشود
    }
    // بانکِ همهتهی از هر گونه: صادقانه تهی
    const hollow = [{ sym: "", full: "", fa: "" }] as typeof abbreviations;
    expect(buildAbbrevDrillSession(hollow, 10).questions).toHaveLength(0);
  });
});

describe("appendix-abbrev-drill r404 — نمره/مرور از مالک + ضدِ دو-نام", () => {
  it("scoreDrill صادق است: بیپاسخ = نادرست؛ درصد از مالکِ r388", () => {
    const s = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(2));
    const answers = s.questions.map((q, i) => (i % 3 === 0 ? null : (q.answer + 1) % 4));
    const score = scoreDrill(s.questions, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(s.questions.filter((q, i) => i % 3 !== 0 && answers[i] === q.answer).length);
  });

  it("buildDrillReplay فقط نادرست/بیپاسخها را به همان ترتیب و گزینهها نگه میدارد", () => {
    const s = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(6));
    const answers: (number | null)[] = s.questions.map((q, i) =>
      i === 2 || i === 5 ? null : (q.answer + 1) % 4,
    );
    // i=2 بیپاسخ؛ i=5 نادرست؛ بقیه هم نادرست‌اند (پاسخِ +۱) — جز i=0 اگر answer==… —
    // درستِ واقعی: هر جا answers[i]===q.answer درست است
    const r = buildDrillReplay(s.questions, answers);
    const wrongIdx = s.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => answers[i] !== q.answer)
      .map(({ i }) => i);
    expect(r.size).toBe(wrongIdx.length);
    wrongIdx.forEach((wi, k) => {
      expect(r.questions[k]).toEqual(s.questions[wi]); // همان ترتیب، همان گزینهها
    });
    // جلسهٔ بیاشتباه → جلسهٔ تهیِ صادقانه
    const perfect = buildDrillReplay(s.questions, s.questions.map((q) => q.answer));
    expect(perfect.size).toBe(0);
  });

  it("قفلِ منبع: موتور بیاستور و بیدونام است — shuffled/درصد از مالک میآید", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/appendix-abbrev-drill.ts"), "utf8");
    expect(src).not.toContain("study-store");
    expect(src).not.toMatch(/function shuffled/);
    expect(src).not.toMatch(/function percent/);
    expect(src).toContain('from "./appendix-drill"');
    // شمارندهٔ G-4: کلاسِ ترنزیشنِ ممنوعِ نقشهٔ P4 در موتور بیمعناست — بایستد
    expect(src).not.toContain("transition-all");
  });
});
