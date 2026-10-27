// ---------------------------------------------------------------------
// r420 — «اطلسِ برچسبِ دریل» — قفلهایِ موتورِ خالص.
//
// تکمالکِ «معنیِ faِ هر پایه» — هفت شاخه، هفت خانوادهٔ داده (حکمِ
// r403 از لامبداهایِ درونخطیِ میزبانها به همین‌جا کوچید؛ دو-نامِ
// r385 ممنوع). قفلها:
//  · هر شاخه عینِ جست‌وجویِ میزبانِ سابقش را پوشش میدهد (داده‌محور —
//    انتظار از خودِ بانکهایِ داده میآید، نه عددِ دستی)
//  · بانکِ ناشناس / پایهٔ حلنشده = تهیِ صادق — هیچ حدسِ ساختگی
//  · drillLabelFor مرجعِ پایدار برمیگرداند (ایدئومِ memoهایِ نما)
//  · عناوینِ رسمیِ بانکها + بانکِ ناشناس = تهی
//  · بهبودِ آگاهانهٔ r420: «lesson-vocab» همهٔ درسها را میپوید —
//    پایهٔ درسِ دیگر هم حالا برچسبِ صادق دارد
// ---------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  DRILL_BANK_ORDER,
  drillBankTitle,
  drillLabelFor,
  resolveDrillLabel,
} from "@/lib/drill-label-atlas";
import { irregularVerbs, vowelPhonemes, consonantPhonemes, abbreviations } from "@/data/appendix";
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { lessons } from "@/data";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { flattenBgExamples } from "@/lib/appendix-bg-example-drill";

describe("drill-label-atlas r420 — تکمالکِ برچسبِ پایه", () => {
  it("ترتیبِ رسمیِ هفت بانک — شکلِ ثابت برایِ بلوکهایِ چندبانکی", () => {
    expect([...DRILL_BANK_ORDER]).toEqual([
      "verbs",
      "phonemes",
      "words",
      "abbrev",
      "lesson-vocab",
      "dict-vocab",
      "bg-examples",
    ]);
  });

  it("عناوینِ رسمی — هم‌خانوادهٔ specهایِ میزبانها؛ بانکِ ناشناس = تهیِ صادق", () => {
    expect(drillBankTitle("verbs")).toBe("افعال بی‌قاعده");
    expect(drillBankTitle("phonemes")).toBe("جدول تلفظ");
    expect(drillBankTitle("words")).toBe("خانوادهٔ واژه‌ها");
    expect(drillBankTitle("abbrev")).toBe("نشانه‌های اختصاری");
    expect(drillBankTitle("lesson-vocab")).toBe("واژگان درس");
    expect(drillBankTitle("dict-vocab")).toBe("واژگان دیکشنری");
    expect(drillBankTitle("bg-examples")).toBe("مثال‌های درسنامهٔ جامع");
    expect(drillBankTitle("unknown-bank")).toBe("");
  });

  it("شاخهٔ فعل: base → fa — عینِ جست‌وجویِ میزبانِ r418 (بیش از آن ادعا نمیکند)", () => {
    const v = irregularVerbs.find((x) => x.base && x.fa)!;
    expect(resolveDrillLabel("verbs", v.base)).toBe(v.fa);
    expect(resolveDrillLabel("verbs", "not-a-verb-base")).toBe("");
  });

  it("شاخهٔ واک: نماد → fa از بانکِ واکها (صدادار + بیصدا)", () => {
    const sym = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!;
    expect(resolveDrillLabel("phonemes", sym.symbol)).toBe(sym.fa);
    expect(resolveDrillLabel("phonemes", "###")).toBe("");
  });

  it("شاخهٔ خانوادهٔ واژه: هر خانهٔ (نoun/verb/adjective/adverb/fa) → faِ خانواده", () => {
    const f = WORD_FAMILY_TABLES.flatMap((t) => t.families).find((x) => x.noun && x.fa)!;
    expect(resolveDrillLabel("words", f.noun!)).toBe(f.fa);
    if (f.verb) expect(resolveDrillLabel("words", f.verb)).toBe(f.fa);
    if (f.fa) expect(resolveDrillLabel("words", f.fa)).toBe(f.fa);
    expect(resolveDrillLabel("words", "not-a-family-cell")).toBe("");
  });

  it("شاخهٔ نشانه: sym → fa", () => {
    const a = abbreviations.find((x) => x.sym && x.fa)!;
    expect(resolveDrillLabel("abbrev", a.sym)).toBe(a.fa);
    expect(resolveDrillLabel("abbrev", "!!")).toBe("");
  });

  it("شاخههایِ واژگانی: en → fa از همهٔ درسها — و بهبودِ آگاهانهٔ r420 (پایهٔ درسِ دیگر هم پیداست)", () => {
    const w1 = lessons[0].vocabulary.find((x) => x.en && x.fa)!;
    expect(resolveDrillLabel("lesson-vocab", w1.en)).toBe(w1.fa);
    expect(resolveDrillLabel("dict-vocab", w1.en)).toBe(w1.fa);
    // درسِ دیگر — تا دیروز برایِ lesson-vocab تهیِ صادق بود؛ اطلس همهٔ درسها را میپوید
    const wLast = lessons[lessons.length - 1].vocabulary.find((x) => x.en && x.fa)!;
    expect(resolveDrillLabel("lesson-vocab", wLast.en)).toBe(wLast.fa);
    expect(resolveDrillLabel("lesson-vocab", "not-in-any-lesson")).toBe("");
  });

  it("شاخهٔ درسنامه: جملهٔ انگلیسی → ترجمهٔ خودِ مثال؛ topicId → عنوانِ موضوع", () => {
    const items = flattenBgExamples(BOOKLET_GRAMMAR_TOPICS);
    const ex = items.find((it) => it.en && it.fa)!;
    const tp = items.find((it) => it.topicId && it.topicTitle)!;
    expect(resolveDrillLabel("bg-examples", ex.en)).toBe(ex.fa);
    expect(resolveDrillLabel("bg-examples", tp.topicId)).toBe(tp.topicTitle);
    expect(resolveDrillLabel("bg-examples", "no-such-sentence")).toBe("");
  });

  it("بانکِ ناشناس: هم resolveDrillLabel تهی هم drillLabelFor سازندهٔ تهی‌خواه", () => {
    expect(resolveDrillLabel("unknown-bank", "go")).toBe("");
    const f = drillLabelFor("unknown-bank");
    expect(f("go")).toBe("");
  });

  it("drillLabelFor مرجعِ پایدار برمیگرداند — ایدئومِ memoهایِ نما", () => {
    expect(drillLabelFor("verbs")).toBe(drillLabelFor("verbs"));
    expect(drillLabelFor("bg-examples")).toBe(drillLabelFor("bg-examples"));
    expect(drillLabelFor("verbs")("go")).toBe(resolveDrillLabel("verbs", "go"));
  });
});
