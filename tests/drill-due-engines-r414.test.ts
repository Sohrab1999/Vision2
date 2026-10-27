// ------------------------------------------------------------------
// r414 — «SRSِ دریل» — قفلهایِ پارامترِ due در موتورهایِ جلسه.
//
// قراردادهایِ حکم:
//  · سهمیهٔ DRILL_DUE_QUOTA = ۴ — سررسیدها به ترتیبِ اولویتِ صف به سرِ
//    جلسه میآیند (مرور نخست، بعد تازهها)؛ سررسیدِ غایب در بانکِ داده
//    هیچ (اولین واجدِ شرایط)؛ سهمیه فقط پذیرشِ سررسید را میبندد
//  · با dueِ غایب/تهی، رفتار و مصرفِ rng بایت‌به‌بایت همانِ r400..r413
//    است — جلسهٔ قطعیِ بذردار با هر دو امضا یکی است (قفلِ همسانی)
//  · پایهٔ سررسید مالِ موتورِ همان بانک است: فعل = baseِ فعل، واژه =
//    لنگر/خانهٔ هدفِ همان گونه، نشانه = نماد، واک = نماد، واژهٔ درس = en
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  buildDrillSession,
  pickDueFirst,
  DRILL_DUE_QUOTA,
  DRILL_SIZE,
  shuffled,
} from "@/lib/appendix-drill";
import { buildWordDrillSession } from "@/lib/appendix-word-drill";
import { buildAbbrevDrillSession } from "@/lib/appendix-abbrev-drill";
import { buildPhonemeDrillSession } from "@/lib/appendix-phoneme-drill";
import { buildLessonVocabDrillSession } from "@/lib/appendix-lesson-vocab-drill";
import { buildBgExampleDrillSession } from "@/lib/appendix-bg-example-drill";
import { irregularVerbs, abbreviations, vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { lessons } from "@/data";

// بذرِ قطعیِ mulberry32 — ایدئومِ موتورهایِ r400..r407
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const PHONEME_BANK = [...vowelPhonemes, ...consonantPhonemes];

describe("drill-due r414 — موتورِ فعل (انتخابِ پیشِ جلسه)", () => {
  it("سررسیدها به سرِ جلسه میآیند — به ترتیبِ صف، پیش از بُرِ عادی", () => {
    const rng = mulberry32(414);
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, ["go", "come", "see"]);
    const heads = s.questions.slice(0, 3).map((q) => q.base);
    expect(heads).toEqual(["go", "come", "see"]); // صفِ اولویت، بُرِ عادی بعدش
  });

  it(`سهمیهٔ ${DRILL_DUE_QUOTA}: فقط چهار سررسید نخست وارد جلسه میشوند`, () => {
    const rng = mulberry32(415);
    const dues = ["go", "come", "see", "run", "eat", "write"]; // شش سررسید
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, dues);
    const headBases = s.questions.slice(0, DRILL_DUE_QUOTA).map((q) => q.base);
    expect(headBases).toEqual(dues.slice(0, DRILL_DUE_QUOTA));
    // پنجمین سررسید در چهار پرسشِ نخست نیست — و در کلِ جلسه هم اگر هست، از بُرِ عادی است نه صف
  });

  it("سررسیدِ غایب در بانکِ داده (اولین واجدِ شرایط) هیچ است — صف پیش میرود", () => {
    const rng = mulberry32(416);
    const s = buildDrillSession(irregularVerbs, DRILL_SIZE, rng, ["no-such-verb", "go"]);
    expect(s.questions[0].base).toBe("go"); // غایب رد شد، بعدی آمد
  });

  it("قفلِ همسانی: بی due، جلسهٔ قطعی بایت‌به‌بایت همانِ امضای کهنه است", () => {
    const a = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(99));
    const b = buildDrillSession(irregularVerbs, DRILL_SIZE, mulberry32(99), []);
    expect(b).toEqual(a); // نه فقط پرسشها — کلِ جلسه
  });

  it("قفلِ همسانیِ pickDueFirst: صفِ تهی = بُرِ عادی با همان مصرفِ rng", () => {
    const pool = irregularVerbs.slice(0, 20);
    const a = shuffled(pool, mulberry32(7))[0];
    const b = pickDueFirst(pool, (v) => v.base, [], mulberry32(7));
    expect(b).toEqual(a);
  });
});

describe("drill-due r414 — موتورهایِ پرسشبهپرسش (pickDueFirst)", () => {
  it("واژه: سررسیدِ لنگرِ خانواده به سرِ جلسه میآید — پایه مالِ موتور است", () => {
    // پایهٔ پرسشِ واژه = anchorOf(f, kind) || cellOf(f, kind) — با گونهٔ نخستِ
    // چرخش (fa) لنگرِ انگلیسیِ خانواده است؛ لنگرِ یک خانوادهٔ واقعی را میگیریم
    const f0 = WORD_FAMILY_TABLES[0].families[0];
    // هم‌ارزِ anchorOf(f, "fa") — نخستین خانهٔ انگلیسیِ پر (پاسخِ fa فارسی است)
    const anchor = f0.verb || f0.noun || f0.adjective || f0.adverb;
    expect(anchor).not.toBe("");
    const rng = mulberry32(417);
    const s = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, rng, [anchor]);
    expect(s.questions[0].base).toBe(anchor);
  });

  it("نشانه: سررسیدِ نمادِ نشانه به سرِ جلسه میآید — نشانهٔ واجدِ گونهٔ fa", () => {
    const rng = mulberry32(418);
    // پرسشِ نخستِ چرخش fa است — هدف باید واجدِ همان گونه باشد (نشانهٔ بایف)
    const faEligible = abbreviations.filter((a) => a.fa !== "" && a.sym !== "");
    const sym = faEligible[0].sym;
    const s = buildAbbrevDrillSession(abbreviations, DRILL_SIZE, rng, [sym]);
    expect(s.questions[0].base).toBe(sym);
  });

  it("واک: سررسیدِ نمادِ واک به سرِ جلسه میآید — واکِ واجدِ گونهٔ fa", () => {
    const rng = mulberry32(419);
    // پرسشِ نخستِ چرخش fa است — هدف باید واجدِ همان گونه باشد (واکِ بایف)
    const faEligible = PHONEME_BANK.filter((p) => p.fa !== "");
    const symbol = faEligible[0].symbol;
    const s = buildPhonemeDrillSession(PHONEME_BANK, DRILL_SIZE, rng, [symbol]);
    expect(s.questions[0].base).toBe(symbol);
  });

  it("واژهٔ درس: سررسیدِ en به سرِ جلسه میآید — واژههایِ بیبانکِ صادق رد نمیشوند", () => {
    const vocab = lessons[0].vocabulary.filter((w) => w.en && w.fa);
    const rng = mulberry32(420);
    const target = vocab[0].en;
    const s = buildLessonVocabDrillSession(vocab, DRILL_SIZE, rng, [target, "no-such-word"]);
    expect(s.questions[0].base).toBe(target);
  });

  it("قفلِ همسانیِ واژه: بی due، جلسهٔ قطعی همانِ امضای کهنه است", () => {
    const a = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(31));
    const b = buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE, mulberry32(31), []);
    expect(b).toEqual(a);
  });
});
