// ------------------------------------------------------------------
// r415 — «تمرینِ سررسیدها» — قفلهایِ جلسهٔ فقطسررسید (پارامترِ dueOnly)
// رویِ هر شش موتور.
//
// قراردادهایِ حکم:
//  · جلسهٔ فقطسررسید فقط از پایههایِ سررسیدِ حاضر در بانک ساخته میشود —
//    هر baseِ پرسش عضوِ صفِ سررسید است (سررسیدِ کهنه/بیصاحب صادقانه میافتد)
//  · سهمیهٔ DRILL_DUE_QUOTA در این حالت جایش را سقفِ خودِ جلسه میگیرد —
//    بیش از چهار سررسید هم همه وارد جلسه میشوند (به ترتیبِ اولویت)
//  · استخرِ بدلها همیشه از بانکِ کامل است — یک سررسید هم گزینهٔ چهارگانه
//    دارد (کیفیتِ گزینه مستقل از کوچکیِ مجموعهٔ سررسید)
//  · چرخشِ گونهها فقط در این حالت تا پرشدنِ جلسه بازمیگردد (سررسیدِ
//    واجدِ گونههایِ دیرتر هم پرسیده میشود — حتی فقطموضوعِ درسنامه)
//  · امضای کهنه (بی dueOnly) بایت‌به‌بایت همانِ r414 است — قفلِ همسانی
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  buildDrillSession,
  DRILL_SIZE,
} from "@/lib/appendix-drill";
import { buildWordDrillSession } from "@/lib/appendix-word-drill";
import { buildAbbrevDrillSession } from "@/lib/appendix-abbrev-drill";
import { buildPhonemeDrillSession } from "@/lib/appendix-phoneme-drill";
import {
  buildLessonVocabDrillSession,
  flattenLessonVocab,
} from "@/lib/appendix-lesson-vocab-drill";
import {
  buildBgExampleDrillSession,
  flattenBgExamples,
} from "@/lib/appendix-bg-example-drill";
import { irregularVerbs, abbreviations, vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { lessons } from "@/data";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";

// بذرِ قطعیِ mulberry32 — ایدئومِ موتورهایِ r400..r407
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const PHONEME_BANK = [...vowelPhonemes, ...consonantPhonemes];

describe("drill-mistake r415 — موتورِ فعل (dueOnly)", () => {
  it("جلسه فقط از سررسیدهاست — شش سررسید، شش پرسش، به ترتیبِ اولویت (سهمیه دور زده شد)", () => {
    const rng = mulberry32(515);
    const dues = ["go", "come", "see", "run", "eat", "write"]; // شش سررسید — بیش از سهمیهٔ ۴
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, dues, true);
    expect(s.size).toBe(6);
    expect(s.questions.map((q) => q.base)).toEqual(dues); // ترتیبِ صفِ اولویت، بی بُر
  });

  it("سررسیدِ کهنه/بیصاحب صادقانه میافتد — فقط سررسیدهایِ حاضر در بانک", () => {
    const rng = mulberry32(516);
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, ["no-such-verb", "go", "ghost"], true);
    expect(s.size).toBe(1);
    expect(s.questions[0].base).toBe("go");
  });

  it("بی سررسیدِ حاضر: جلسهٔ تهیِ صادق — نه واژگونی، نه پرسشِ بیدue", () => {
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(517), ["ghost-1", "ghost-2"], true);
    expect(s.questions).toEqual([]);
    expect(s.size).toBe(0);
  });

  it("سقفِ جلسه: پانزده سررسید، ده پرسش — دهِ نخستِ صفِ اولویت", () => {
    const rng = mulberry32(518);
    const dues = irregularVerbs.slice(0, 15).map((v) => v.base);
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, dues, true);
    expect(s.size).toBe(DRILL_SIZE);
    expect(s.questions.map((q) => q.base)).toEqual(dues.slice(0, DRILL_SIZE));
  });

  it("استخرِ بدل از بانکِ کامل است — یک سررسید هم گزینهٔ چهارگانه دارد", () => {
    const rng = mulberry32(519);
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, ["go"], true);
    expect(s.size).toBe(1);
    expect(s.questions[0].options.length).toBe(4);
    expect(new Set(s.questions[0].options).size).toBe(4); // ارزشها دوبهدو متمایز
  });
});

describe("drill-mistake r415 — موتورهایِ پرسشبهپرسش (dueOnly)", () => {
  it("واژه: جلسه فقط از خانوادههایِ سررسید — نخستین پرسش لنگرِ نخستین سررسید", () => {
    const f0 = WORD_FAMILY_TABLES[0].families[0];
    const f1 = WORD_FAMILY_TABLES[0].families[1];
    const anchorOf = (f: typeof f0) => f.verb || f.noun || f.adjective || f.adverb; // هم‌ارزِ گونهٔ fa
    const [a0, a1] = [anchorOf(f0), anchorOf(f1)];
    expect(a0).not.toBe("");
    expect(a1).not.toBe("");
    const rng = mulberry32(520);
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, rng, [a0, a1], true);
    expect(s.size).toBe(2); // دو خانوادهٔ سررسید — دو پرسش
    expect(s.questions[0].base).toBe(a0);
    for (const q of s.questions) expect([a0, a1]).toContain(q.base);
  });

  it("نشانه: دو سررسید، دو پرسش — هر base عضوِ صفِ سررسید", () => {
    const faEligible = abbreviations.filter((a) => a.fa !== "" && a.sym !== "");
    const [s0, s1] = [faEligible[0].sym, faEligible[1].sym];
    const rng = mulberry32(521);
    const out = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, rng, [s0, s1], true);
    expect(out.size).toBe(2);
    for (const q of out.questions) expect([s0, s1]).toContain(q.base);
    expect(out.questions[0].base).toBe(s0);
  });

  it("واک: دو سررسید، دو پرسش — استخرِ بدل از بانکِ کامل (گزینههایِ چهارگانه)", () => {
    const faEligible = PHONEME_BANK.filter((p) => p.fa !== "");
    const [p0, p1] = [faEligible[0].symbol, faEligible[1].symbol];
    const rng = mulberry32(522);
    const out = buildPhonemeDrillSession(PHONEME_BANK, DRILL_SIZE, rng, [p0, p1], true);
    expect(out.size).toBe(2);
    for (const q of out.questions) {
      expect([p0, p1]).toContain(q.base);
      expect(q.options.length).toBe(4);
    }
  });

  it("واژهٔ درس: دو سررسید، دو پرسش — و ستونِ بدل از بانکِ کاملِ درس میآید", () => {
    const vocab = lessons[0].vocabulary.filter((w) => w.en && w.fa);
    const [w0, w1] = [vocab[0].en, vocab[1].en];
    expect(w0).not.toBe(w1);
    const rng = mulberry32(523);
    const out = buildLessonVocabDrillSession(vocab, DRILL_SIZE, rng, [w0, w1], true);
    expect(out.size).toBe(2);
    for (const q of out.questions) expect([w0, w1]).toContain(q.base);
    // ستونِ بدلِ گونهٔ fa از کلِ درس است، نه از دو سررسید — گزینهها چهارگانه
    const faQ = out.questions.find((q) => q.kind === "fa");
    if (faQ) expect(faQ.options.length).toBe(4);
  });

  it("درسنامه: سررسیدِ فقطموضوع هم پرسیده میشود — چرخشِ بازگشتیِ dueOnly (fa/ex تهی، topic میزند)", () => {
    const bank = flattenBgExamples(BOOKLET_GRAMMAR_TOPICS);
    // مثالی که در گونهٔ topic واجد است (en یکتا) ولی enاش سررسید نیست —
    // فقط topicIdاش سررسید است: چرخشِ غیربازگشتِ کهنه جلسهٔ تهی میزد
    const enCount = new Map<string, number>();
    for (const it of bank) enCount.set(it.en, (enCount.get(it.en) ?? 0) + 1);
    const target = bank.find((it) => it.en !== "" && it.topicTitle !== "" && enCount.get(it.en) === 1)!;
    const enPeers = bank.filter((x) => x.en === target.en);
    expect(enPeers.length).toBeGreaterThan(0);
    const rng = mulberry32(524);
    const out = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, rng, [target.topicId], true);
    expect(out.size).toBe(1);
    expect(out.questions[0].kind).toBe("topic");
    expect(out.questions[0].base).toBe(target.topicId);
  });

  it("درسنامه: سررسیدِ جملهٔ انگلیسی — base همان en است (گونهٔ fa)", () => {
    const bank = flattenBgExamples(BOOKLET_GRAMMAR_TOPICS);
    const enFas = new Map<string, Set<string>>();
    for (const it of bank) {
      if (!enFas.has(it.en)) enFas.set(it.en, new Set());
      enFas.get(it.en)!.add(it.fa);
    }
    const target = bank.find((it) => it.en !== "" && it.fa !== "" && enFas.get(it.en)!.size === 1)!;
    const rng = mulberry32(525);
    const out = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, rng, [target.en], true);
    expect(out.size).toBe(1);
    expect(out.questions[0].kind).toBe("fa");
    expect(out.questions[0].base).toBe(target.en);
  });
});

describe("drill-mistake r415 — قفلِ همسانیِ امضای کهنه", () => {
  it("فعل: بی dueOnly، امضای پنجپارامتری همانِ چهارپارامتریِ r414 است", () => {
    const dues = ["go", "come", "see"];
    const a = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(77), dues);
    const b = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(77), dues, undefined);
    expect(b).toEqual(a);
    const c = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(77), dues, false);
    expect(c).toEqual(a);
  });

  it("واژه/نشانه/واک/واژهٔ درس/درسنامه: بی dueOnly همانِ r414 — و بی due هم همین", () => {
    const anchor = (() => {
      const f0 = WORD_FAMILY_TABLES[0].families[0];
      return f0.verb || f0.noun || f0.adjective || f0.adverb;
    })();
    const vocab = flattenLessonVocab(lessons).filter((w) => w.en && w.fa);
    const cases: Array<() => unknown> = [
      () =>
        buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(81), [anchor], false),
      () =>
        buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(81), [anchor]),
      () =>
        buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(82), [abbreviations[0].sym], false),
      () =>
        buildAbbrevDrillSession(abbreviations, DRILL_SIZE, mulberry32(82), [abbreviations[0].sym]),
      () =>
        buildPhonemeDrillSession(PHONEME_BANK, DRILL_SIZE, mulberry32(83), [PHONEME_BANK[0].symbol], false),
      () =>
        buildPhonemeDrillSession(PHONEME_BANK, DRILL_SIZE, mulberry32(83), [PHONEME_BANK[0].symbol]),
      () =>
        buildLessonVocabDrillSession(vocab, DRILL_SIZE, mulberry32(84), [vocab[0].en], false),
      () =>
        buildLessonVocabDrillSession(vocab, DRILL_SIZE, mulberry32(84), [vocab[0].en]),
      () =>
        buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(85), [flattenBgExamples(BOOKLET_GRAMMAR_TOPICS)[0].en], false),
      () =>
        buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, mulberry32(85), [flattenBgExamples(BOOKLET_GRAMMAR_TOPICS)[0].en]),
    ];
    for (let i = 0; i < cases.length; i += 2) {
      expect(cases[i]()).toEqual(cases[i + 1]());
    }
  });

  it("دیکشنریِ سراسری (flattenLessonVocab): جلسهٔ فقطسررسید رویِ بانکِ ۴۰۳۲تایی هم فقطسررسید است", () => {
    const all = flattenLessonVocab(lessons).filter((w) => w.en && w.fa);
    const [w0, w1] = [all[0].en, all[1].en];
    const rng = mulberry32(526);
    const out = buildLessonVocabDrillSession(all, DRILL_SIZE, rng, [w0, w1], true);
    expect(out.size).toBe(2);
    for (const q of out.questions) expect([w0, w1]).toContain(q.base);
  });
});
