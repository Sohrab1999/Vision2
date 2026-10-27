// ---------------------------------------------------------------------
// r425 — «لنگرِ پرشِ خانهٔ امروز» — قفلهایِ دفترِ دومِ اطلس.
//
// drillJumpAnchorFor مالکِ یگانهٔ «مقصدِ پرشِ هر پایه» است — از همان
// دادهٔ خودِ بانکها (wordFamilyTableId مالکِ هویتِ r224، topicId از
// تختکنندهٔ خودِ r418، idِ خودِ lessons) با گاردهایِ عضویتِ نقشههایِ
// برچسبِ همان فایل. قفلها:
//  · هر هفت بانک لنگرِ درستِ خودش را میدهد (داده‌محور — هیچ کلیدِ
//    دستنویسیِ بانک)
//  · بانکِ ناشناس / پایهٔ حلنشده / پایهٔ تهی = nullِ صادق (r236 —
//    هیچ مقصدِ بیپشتوانهای وعده نمیشود)
//  · واژهٔ درسِ دیگر و جملهٔ بیرونِ بانک هم null — گاردِ عضویت از
//    نقشههایِ برچسب است، نه حدسِ ناوبری
//  · test-ids: هویتِ جدولِ خانواده با مالکِ خودش (wordFamilyTableId)
//    قفل میشود — هویتِ موازی ممنوع (r224/r385)
// ---------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  drillJumpAnchorFor,
  resolveDrillLabel,
} from "@/lib/drill-label-atlas";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { flattenBgExamples } from "@/lib/appendix-bg-example-drill";
import { lessons } from "@/data";
import { abbreviations, irregularVerbs, vowelPhonemes, consonantPhonemes } from "@/data/appendix";

/** نمادِ واقعیِ نخستین واک — داده‌محور (عینِ ایدئومِ r422) */
const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;

describe("r425 — لنگرِ پرشِ هفت بانک از دادهٔ خودشان", () => {
  it("verbs: پایهٔ واقعی → verbBase؛ پایهٔ بیرونِ بانک → null", () => {
    const base = irregularVerbs.find((v) => v.base && v.fa)!.base;
    expect(drillJumpAnchorFor("verbs", base)).toEqual({ kind: "verbBase", id: base });
    expect(drillJumpAnchorFor("verbs", "zzz-not-a-verb")).toBeNull();
  });

  it("phonemes: نمادِ واقعی → phonemeId؛ نمادِ بیرونِ بانک → null", () => {
    expect(drillJumpAnchorFor("phonemes", SYM)).toEqual({ kind: "phonemeId", id: SYM });
    expect(drillJumpAnchorFor("phonemes", "888-nope")).toBeNull();
  });

  it("words: خانهٔ واقعیِ خانواده → posTableId با هویتِ مالکِ r224 + خودِ واژه (عمقِ سطریِ r428)", () => {
    const t = WORD_FAMILY_TABLES[0];
    const f = t.families.find((x) => x.noun)!;
    const anchor = drillJumpAnchorFor("words", f.noun);
    expect(anchor).toEqual({
      kind: "posTableId",
      id: wordFamilyTableId(t),
      word: f.noun, // r428 — لنگرِ سطری: سطرِ خانواده در دید با پالس
    });
    // واژهٔ بیرونِ همهٔ جدولها — nullِ صادق
    expect(drillJumpAnchorFor("words", "zzz-not-a-family-word")).toBeNull();
  });

  it("abbrev: نشانهٔ واقعی → abbrevSym؛ بیرونِ بانک → null", () => {
    const sym = abbreviations.find((a) => a.sym && a.fa)!.sym;
    expect(drillJumpAnchorFor("abbrev", sym)).toEqual({ kind: "abbrevSym", id: sym });
    expect(drillJumpAnchorFor("abbrev", "##-nope")).toBeNull();
  });

  it("lesson-vocab: واژهٔ واقعی → lessonTab با idِ همان درس + خودِ واژه (عمقِ سطریِ r427)؛ dict-vocab: همان واژه → dictWordِ عمیقِ r430", () => {
    const lesson = lessons.find((l) => l.vocabulary.some((w) => w.en && w.fa))!;
    const en = lesson.vocabulary.find((w) => w.en && w.fa)!.en;
    expect(drillJumpAnchorFor("lesson-vocab", en)).toEqual({
      kind: "lessonTab",
      lessonId: lesson.id,
      wordEn: en,
    });
    // r430 — لنگرِ عمیقِ دیکشنری: خودِ واژه با لنگر میرود (کارتِ واژه با عدسی + پالس)
    expect(drillJumpAnchorFor("dict-vocab", en)).toEqual({ kind: "dictWord", en });
    expect(drillJumpAnchorFor("dict-vocab", "zzz-not-a-dictionary-word")).toBeNull();
  });

  it("bg-examples: جملهٔ واقعی → topicId + لنگرِ سطریِ مثال (عمقِ r431)؛ خودِ topicId → فرودِ موضوعیِ صادق", () => {
    const it0 = flattenBgExamples(BOOKLET_GRAMMAR_TOPICS).find((e) => e.en && e.fa)!;
    // r431 — عمقِ سطری: جملهٔ واقعی خودِ en را هم حمل میکند تا سطرِ مثال پالس بزند
    expect(drillJumpAnchorFor("bg-examples", it0.en)).toEqual({
      kind: "topicId",
      id: it0.topicId,
      en: it0.en,
    });
    // پایهٔ گونهٔ topic — خودِ topicId هم لنگرِ خودش است (قراردادِ baseِ r406)؛ بیِ en — پالسِ برساخته ممنوع
    expect(drillJumpAnchorFor("bg-examples", it0.topicId)).toEqual({ kind: "topicId", id: it0.topicId });
    expect(drillJumpAnchorFor("bg-examples", "zzz-not-a-sentence")).toBeNull();
  });

  it("بانکِ ناشناس و پایهٔ تهی: nullِ صادق — هیچ مقصدِ حدسیای (r236)", () => {
    expect(drillJumpAnchorFor("ghost-bank", "go")).toBeNull();
    expect(drillJumpAnchorFor("verbs", "")).toBeNull();
    expect(drillJumpAnchorFor("", "go")).toBeNull();
  });

  it("همخوانیِ لنگر و برچسب: پایهای که برچسب ندارد لنگر هم ندارد (گاردِ همان نقشهها)", () => {
    // برایِ هر بانکِ هویتدار: resolveDrillLabel تهی ⇔ drillJumpAnchorFor تهی
    const base = irregularVerbs.find((v) => v.base && v.fa)!.base;
    expect(resolveDrillLabel("verbs", base)).not.toBe("");
    expect(drillJumpAnchorFor("verbs", base)).not.toBeNull();
    expect(resolveDrillLabel("verbs", "zzz-not-a-verb")).toBe("");
    expect(drillJumpAnchorFor("verbs", "zzz-not-a-verb")).toBeNull();
  });
});
