// ------------------------------------------------------------------
// r403 — موتورِ خالصِ «دریلِ خانوادهٔ واژه‌ها» (appendix-word-drill.ts)
//
// قفلهای کلاس:
//  · هیچ خانواده/خانه‌ای ساخته نمیشود — گزینهها فقط ارزشهایِ ستونِ خودِ
//    بانک (word-families.ts)؛ خانهٔ خالیِ جزوه هیچوقت گزینه یا پاسخ نیست
//  · پنج گونهٔ چرخشی — جلسهٔ ۱۰تایی = هر گونه دقیقاً ۲ بار
//  · لنگرِ بی‌نشتی: لنگرِ پرسشهایِ جزء کلام هرگز برابرِ پاسخ نیست
//    (خانوادهٔ care: فعل و اسمِ هر دو «care» — درسِ راند)
//  · قطعیت زیرِ rng تزریقی؛ خانوادهٔ تکراری در یک جلسه ناممکن
//  · مرور از مالکِ مشترک: buildDrillReplay رویِ پرسشهایِ واژه هم همان است
//  · ضدِ دو-نام: موتورِ واژه shuffled/نمره/مرور را از مالک میگیرد —
//    هیچ Fisher-Yates یا درصدِ دومی وجود ندارد
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  WORD_FAMILY_TABLES,
  WORD_FAMILY_TOTAL,
  type WordFamily,
} from "@/data/word-families";
import {
  buildWordDrillSession,
  WORD_DRILL_KINDS,
  WORD_KIND_LABEL,
} from "@/lib/appendix-word-drill";
import {
  buildDrillReplay,
  scoreDrill,
  DRILL_SIZE,
  type DrillQuestion,
  type WordDrillKind,
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

const cellOf = (f: WordFamily, k: WordDrillKind): string =>
  k === "fa" ? f.fa : k === "adjective" ? f.adjective : k === "adverb" ? f.adverb : k === "verb" ? f.verb : f.noun;

describe("appendix-word-drill r403 — بانک و گونهها", () => {
  it("بانکِ منبع دستنخورده: ۱۰ جدول، ۲۴۶ خانواده — موتور هیچ خانه‌ای نمی‌سازد", () => {
    expect(WORD_FAMILY_TABLES.length).toBe(10);
    expect(WORD_FAMILY_TOTAL).toBe(246);
  });

  it("سرشماریِ گونهها: دقیقاً پنج گونه؛ برچسبِ فارسیِ هر گونه هست", () => {
    expect(WORD_DRILL_KINDS).toEqual(["fa", "adjective", "adverb", "verb", "noun"]);
    for (const k of WORD_DRILL_KINDS) expect(WORD_KIND_LABEL[k].length).toBeGreaterThan(0);
  });

  it("اندازه: پیشفرض ۱۰؛ بستهشده در ۱..۲۴۶؛ بانکِ تهی صادقانه تهی", () => {
    expect(buildWordDrillSession(WORD_FAMILY_TABLES).size).toBe(DRILL_SIZE);
    expect(buildWordDrillSession(WORD_FAMILY_TABLES, 3).size).toBe(3);
    expect(buildWordDrillSession(WORD_FAMILY_TABLES, 0).size).toBe(1);
    expect(buildWordDrillSession(WORD_FAMILY_TABLES, 999).size).toBe(WORD_FAMILY_TOTAL);
    const empty = buildWordDrillSession([], 10);
    expect(empty.size).toBe(0);
    expect(empty.questions).toHaveLength(0);
  });

  it("قطعیت: همان seed → همان جلسه؛ seed دیگر → تفاوت", () => {
    const a = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(7));
    const b = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(7));
    expect(b).toEqual(a);
    const c = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(8));
    expect(c.questions.every((q, i) => q.base === a.questions[i].base)).toBe(false);
  });

  it("چرخش: جلسهٔ ۱۰تایی هر پنج گونه را دقیقاً دو بار دارد — بهترتیبِ اندیس", () => {
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(3));
    s.questions.forEach((q, i) => {
      expect(q.kind).toBe(WORD_DRILL_KINDS[i % WORD_DRILL_KINDS.length]);
    });
    for (const k of WORD_DRILL_KINDS) {
      expect(s.questions.filter((q) => q.kind === k)).toHaveLength(2);
    }
  });

  it("خانوادهٔ تکراری در یک جلسه ناممکن — هر (لنگر، معنی، گونه) یکتا", () => {
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(11));
    const keys = s.questions.map((q) => `${q.base}·${q.fa}·${q.kind}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("appendix-word-drill r403 — قانونِ ستون و لنگر", () => {
  it("هر پرسش: ۴ گزینهٔ متمایزِ غیرتهی از ستونِ خودِ گونه، دقیقاً یک درست", () => {
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, WORD_FAMILY_TOTAL, mulberry32(42));
    const all = WORD_FAMILY_TABLES.flatMap((t) => t.families);
    for (const q of s.questions) {
      const kind = q.kind as WordDrillKind;
      const legal = new Set(all.map((f) => cellOf(f, kind)).filter((v) => v !== ""));
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options.every((o) => o.length > 0)).toBe(true);
      expect(q.options[q.answer].length).toBeGreaterThan(0);
      for (const opt of q.options) expect(legal.has(opt)).toBe(true); // هیچ گزینهٔ ساختهشده
      // پرسش از خودِ بانک: خانواده‌ای که پاسخ در ستونِ هدفش است باید با
      // معنیِ و لنگرِ پرامپت سازگار باشد (دو خانوادهٔ هم‌معنی مجازند —
      // اثباتِ سازگاری، نه حدسِ هویت)
      const candidates = all.filter((f) => cellOf(f, kind) === q.options[q.answer]);
      expect(candidates.length).toBeGreaterThanOrEqual(1);
      const matched = candidates.some(
        (f) =>
          f.fa === q.fa &&
          (q.speak === undefined || [f.verb, f.noun, f.adjective, f.adverb].includes(q.speak)),
      );
      expect(matched).toBe(true);
    }
  });

  it("لنگرِ بی‌نشتی: در پرسشهایِ جزء کلام، لنگر (چیپ/پرامپت) هرگز برابرِ پاسخ نیست", () => {
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, WORD_FAMILY_TOTAL, mulberry32(5));
    for (const q of s.questions) {
      if (q.kind === "fa") {
        expect(q.prompt).toContain("معنیِ");
        expect(q.speak).toBeTruthy(); // لنگرِ انگلیسی همیشه هست
        expect(q.prompt).toContain(`«${q.speak}»`);
      } else {
        const label = WORD_KIND_LABEL[q.kind as WordDrillKind];
        expect(q.prompt).toContain(label);
        expect(q.prompt).toContain(`«${q.fa}»`); // خانواده با معنیِ صادق نامگذاری میشود
        if (q.speak) {
          expect(q.speak).not.toBe(q.options[q.answer]); // درسِ care — نشتی ناممکن
          expect(q.prompt).toContain(`«${q.speak}»`);
        }
        // و لنگر در گزینهها هم نیست (چیپِ پرسش گزینه نمیشود)
        expect(q.options.includes(q.speak ?? "")).toBe(false);
      }
    }
  });

  it("پرسشِ fa: گزینهها معنیهایِ فارسیِ خودِ بانکاند (ستونِ fa، RTL-محورِ نما)", () => {
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, WORD_FAMILY_TOTAL, mulberry32(9));
    const legal = new Set(WORD_FAMILY_TABLES.flatMap((t) => t.families).map((f) => f.fa).filter((v) => v !== ""));
    for (const q of s.questions.filter((x) => x.kind === "fa")) {
      for (const opt of q.options) expect(legal.has(opt)).toBe(true);
    }
  });
});

describe("appendix-word-drill r403 — مرور و نمره از مالکِ مشترک", () => {
  const s = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(17));

  it("buildDrillReplay رویِ پرسشهایِ واژه: فقط نادرست، همان ترتیب، همان گزینهها", () => {
    const answers = s.questions.map((q, i) => (i % 3 === 0 ? null : (q.answer + 1) % 4));
    const r = buildDrillReplay(s.questions, answers);
    expect(r.size).toBe(s.questions.filter((q, i) => answers[i] !== q.answer).length);
    r.questions.forEach((q) => {
      const origin = s.questions.find((x) => x.prompt === q.prompt);
      expect(origin).toBeTruthy();
      expect(origin!.options).toEqual(q.options);
    });
  });

  it("scoreDrill: نمرهٔ صادقِ همان مالک — بیپاسخ = نادرست", () => {
    const sc = scoreDrill(s.questions, s.questions.map(() => null));
    expect(sc).toEqual({ correct: 0, total: 10, percentValue: 0 });
    const full = scoreDrill(s.questions, s.questions.map((q) => q.answer));
    expect(full.percentValue).toBe(100);
  });
});

describe("appendix-word-drill r403 — قفلهای منبع", () => {
  it("ضدِ دو-نام: موتورِ واژه بُرخوردن/نمره/مرور را از مالک میگیرد — هیچ دومی نیست", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/appendix-word-drill.ts"), "utf8");
    expect(src).toContain('from "./appendix-drill"');
    expect(src).not.toContain("function shuffled"); // Fisher–Yates دومی ممنوع
    expect(src).not.toContain("Math.round"); // درصدِ دستی ممنوع (مالکِ r388)
    expect(src).not.toContain("@/lib/study-store"); // بیاستوری (حکمِ r400)
    expect(src).not.toContain("localStorage");
  });

  it("بانکِ word-families از دریل بیخبر میماند — دادهٔ منجمد", () => {
    const src = readFileSync(join(process.cwd(), "src/data/word-families.ts"), "utf8");
    expect(src).not.toContain("drill");
    expect(src).not.toContain("Drill");
  });

  it("دادههایِ پرسشِ موتورِ واژه از نوعِ مشترکِ مالکاند — DrillQuestion", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/appendix-word-drill.ts"), "utf8");
    expect(src).toContain("type DrillQuestion");
    expect(src).toContain("type DrillSession");
  });
});
