// ------------------------------------------------------------------
// r420 — «اطلسِ برچسبِ دریل» — مالکِ یگانهٔ «معنیِ faِ هر پایه».
//
// r403 حکم کرد: معنیِ هر پایه نزدِ میزبانِ همان بانک است — و r418
// هفت لامبداى درونخطی در پنج میزبان ساخت که همین جست‌وجوها را
// تکرار میکردند. r418 پیشنهادِ ② را داد: صادرِ تقویمِ «همهٔ بانکها»
// در یک فایل — و آن فایل به برچسبِ همهٔ بانکها نیاز دارد، در حالی که
// هیچ میزبانی همهٔ خانوادهها را نمیشناسد. از این راند هفت شاخهٔ
// جست‌وجو نزدِ همین اطلس است: همان خانوادهٔ دادهٔ هر بانک (فعل از
// irregularVerbs، واک از بانکِ واکها، واژه از خانوادهٔ جدولها، نشانه،
// واژگانِ درسها، دیکشنری، مثالهایِ درسنامه) — تکمالک، دو-نامِ r385
// ممنوع؛ میزبانها فقط مصرف میکنند و رفتارِ r418شان عیناً میماند.
//
// تنها بهبودِ رفتاریِ آگاهانه: «lesson-vocab» تا دیروز فقط واژگانِ
// درسِ بازشده را میشناخت (پایهٔ درسِ دیگر = خانهٔ تهیِ صادق)؛ اطلس
// همهٔ درسها را میپوید — برچسبِ پایهٔ درسِ دیگر هم حالا پیداست
// (صادقتر، نه ساختگیتر).
//
// قراردادِ حکم:
//  · بانکِ ناشناس / پایهٔ حلنشده = رشتهٔ تهیِ صادق — نه حدسِ ساختگی
//    (عینِ حکمِ r403/r418).
//  · نقشهها یکبار در سطحِ ماژول ساخته میشوند (دادهٔ ایستا، بیِ React) —
//    جست‌وجو O(1) و مرجعِ سازندهٔ هر بانک پایدار (برایِ memoهایِ نما).
//  · ترتیبِ رسمیِ بانکها (DRILL_BANK_ORDER) مالِ مصرفهایِ چندبانکی
//    است — تقویمِ همهٔ بانکها (r420) به آن بلوکهایِ پایدار میدهد.
// ------------------------------------------------------------------

import {
  abbreviations,
  consonantPhonemes,
  irregularVerbs,
  vowelPhonemes,
  type Phoneme,
} from "@/data/appendix";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";
import { lessons } from "@/data";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { flattenBgExamples } from "./appendix-bg-example-drill";

/** ترتیبِ رسمیِ بانکهایِ دریل — بلوکهایِ پایدارِ تقویمِ چندبانکی */
export const DRILL_BANK_ORDER = [
  "verbs",
  "phonemes",
  "words",
  "abbrev",
  "lesson-vocab",
  "dict-vocab",
  "bg-examples",
] as const;

export type DrillBankId = (typeof DRILL_BANK_ORDER)[number];

/** عنوانِ رسمیِ هر بانک — هم‌خانوادهٔ عنوانِ specهایِ میزبانها */
const DRILL_BANK_TITLES: Record<DrillBankId, string> = {
  verbs: "افعال بی‌قاعده",
  phonemes: "جدول تلفظ",
  words: "خانوادهٔ واژه‌ها",
  abbrev: "نشانه‌های اختصاری",
  "lesson-vocab": "واژگان درس",
  "dict-vocab": "واژگان دیکشنری",
  "bg-examples": "مثال‌های درسنامهٔ جامع",
};

/** عنوانِ بانک — بانکِ ناشناس = تهیِ صادق */
export const drillBankTitle = (bankId: string): string =>
  (DRILL_BANK_ORDER as readonly string[]).includes(bankId)
    ? DRILL_BANK_TITLES[bankId as DrillBankId]
    : "";

// ------------------------------------------------ نقشههایِ یکبارساخته

const phonemeBank: Phoneme[] = [...vowelPhonemes, ...consonantPhonemes];

const verbFa = new Map<string, string>();
for (const v of irregularVerbs) {
  if (v.base && v.fa && !verbFa.has(v.base)) verbFa.set(v.base, v.fa);
}

const phonemeFa = new Map<string, string>();
for (const p of phonemeBank) {
  if (p.symbol && p.fa && !phonemeFa.has(p.symbol)) phonemeFa.set(p.symbol, p.fa);
}

const familyFa = new Map<string, string>();
for (const t of WORD_FAMILY_TABLES) {
  for (const f of t.families) {
    for (const cell of [f.noun, f.verb, f.adjective, f.adverb, f.fa]) {
      if (cell && f.fa && !familyFa.has(cell)) familyFa.set(cell, f.fa);
    }
  }
}

const abbrevFa = new Map<string, string>();
for (const a of abbreviations) {
  if (a.sym && a.fa && !abbrevFa.has(a.sym)) abbrevFa.set(a.sym, a.fa);
}

// واژگانِ همهٔ درسها — یک نقشه برایِ هر دو بانکِ واژگانی (هم‌خانوادهٔ داده)
const lessonVocabFa = new Map<string, string>();
for (const l of lessons) {
  for (const w of l.vocabulary) {
    if (w.en && w.fa && !lessonVocabFa.has(w.en)) lessonVocabFa.set(w.en, w.fa);
  }
}

// مثالهایِ درسنامه — از همان تختکنندهٔ خودِ موتور (r418: هیچ حدسِ موازی)
const bgFa = new Map<string, string>();
for (const it of flattenBgExamples(BOOKLET_GRAMMAR_TOPICS)) {
  if (it.en && it.fa && !bgFa.has(it.en)) bgFa.set(it.en, it.fa);
  if (it.topicId && it.topicTitle && !bgFa.has(it.topicId)) bgFa.set(it.topicId, it.topicTitle);
}

const RESOLVERS: Record<DrillBankId, (base: string) => string> = {
  verbs: (base) => verbFa.get(base) ?? "",
  phonemes: (base) => phonemeFa.get(base) ?? "",
  words: (base) => familyFa.get(base) ?? "",
  abbrev: (base) => abbrevFa.get(base) ?? "",
  "lesson-vocab": (base) => lessonVocabFa.get(base) ?? "",
  "dict-vocab": (base) => lessonVocabFa.get(base) ?? "",
  "bg-examples": (base) => bgFa.get(base) ?? "",
};

/** برچسبِ faِ یک پایه در یک بانک — بانکِ ناشناس/پایهٔ حلنشده = تهیِ صادق */
export const resolveDrillLabel = (bankId: string, base: string): string =>
  (DRILL_BANK_ORDER as readonly string[]).includes(bankId)
    ? RESOLVERS[bankId as DrillBankId](base)
    : "";

/**
 * سازندهٔ پایدارِ resolverِ هر بانک — مرجعِ یکسان در هر فراخوانی
 * (memoهایِ نما رویِ مرجع تکیه میکنند؛ ایدئومِ مرجعِ پایدارِ zustand)
 */
export function drillLabelFor(bankId: string): (base: string) => string {
  if (!(DRILL_BANK_ORDER as readonly string[]).includes(bankId)) return () => "";
  return RESOLVERS[bankId as DrillBankId];
}

// ------------------------------------------------------------------
// r425 — «لنگرِ پرشِ خانهٔ امروز» — دومین دفترِ همان اطلس.
//
// خانهٔ «امروز»ِ نوارِ هفته (r422) با پیشنهادِ ②ِ r422 از نمایشِ محض
// به ناوبری میرسد: کلیک = پرش به میزبانِ تمرینِ همان بانک. قراردادِ
// خانوادهٔ پرش (r234/r235/r297/r361): پرش با لنگرِ عمیقِ همان نما
// (سطر/کارت در دید با پالس) و «پرش ≠ نوشتن» — هیچ جلسهای خودکار
// شروع نمیشود؛ یادگیرنده پشتِ درِ میزبان میایستد و خودش دکمهٔ
// تمرین/تمرینِ سررسیدها (r415) را میزند. دیپلینکِ هرگز جلسه را
// باز نمیکند — همان حکمِ «فقط با کلیکِ کاربر» (r234/r400/r403/r404).
//
// مالکیت: لنگرِ هر پایه از همان دادهٔ خودِ بانک میآید — هویتِ
// جدولِ خانواده با wordFamilyTableId (مالکِ هویتِ r224 — هیچ
// هویتِ موازیای)، موضوعِ درسنامه با topicIdِ همان تختکنندهٔ r418،
// درسِ واژه با idِ خودِ lessons، و گاردهایِ عضویت از نقشههایِ
// برچسبِ همین فایل (پایهای که برچسب ندارد لنگر هم ندارد — بانکِ
// ناشناس/پایهٔ حلنشده = nullِ صادق، نه مقصدِ حدسی).
// ------------------------------------------------------------------

/** لنگرِ پرش — همان شکلِ عمیقِ View که میزبانها میشناسند */
export type DrillJumpAnchor =
  | { kind: "verbBase"; id: string } // زیرتبِ verbs — سطرِ فعل با پالس (r234)
  | { kind: "phonemeId"; id: string } // زیرتبِ phonetics — کارتِ واک (r235)
  | { kind: "posTableId"; id: string; word?: string } // زیرتبِ pos — جدولِ خانواده (r224)؛ r428 — عمقِ سطری: خودِ واژه (پالسِ سطر)
  | { kind: "abbrevSym"; id: string } // زیرتبِ abbrev — کارتِ نشانه (r235)
  | { kind: "topicId"; id: string; en?: string } // درسنامهٔ جامع — موضوع (r221)؛ r431 — عمقِ سطری: خودِ مثال (پالسِ سطر — پایهای که جملهٔ واقعیِ مثال است en را هم حمل میکند؛ پایهٔ topicIdِ خام فرودِ موضوعیِ صادق است)
  | { kind: "lessonTab"; lessonId: number; wordEn: string } // درس — تبِ واژگان + لنگرِ کارتِ واژه (میزبانِ r407؛ عمقِ سطریِ r427)
  | { kind: "dictWord"; en: string }; // r430 — دیکشنری — کارتِ واژه با عدسیِ جست‌وجو (الگویِ r427؛ "dictionary"ِ بی‌لنگرِ کهنه بازنشسته شد)

// هویتِ جدولِ خانواده — با مالکِ r224 (هیچ هویتِ موازیای)
const wordTableIdByBase = new Map<string, string>();
for (const t of WORD_FAMILY_TABLES) {
  const id = wordFamilyTableId(t);
  for (const f of t.families) {
    for (const cell of [f.noun, f.verb, f.adjective, f.adverb]) {
      if (cell && !wordTableIdByBase.has(cell)) wordTableIdByBase.set(cell, id);
    }
  }
}

// درسِ هر واژه — نخستین درسِ دارایِ واژه (ترتیبِ خودِ داده — قطعی)
const lessonIdByWord = new Map<string, number>();
for (const l of lessons) {
  for (const w of l.vocabulary) {
    if (w.en && !lessonIdByWord.has(w.en)) lessonIdByWord.set(w.en, l.id);
  }
}

// موضوعِ درسنامه برایِ هر پایه — پایه یا جملهٔ انگلیسی است یا topicId
// (قراردادِ baseِ خودِ موتورِ r406: «جملهٔ هدف / موضوعِ هدف»)
const bgTopicIdByBase = new Map<string, string>();
// r431 — مجموعهٔ جملههایِ واقعیِ مثالها — تفکیکِ پایهٔ جملهای از پایهٔ topicIdِ خام:
// فقط جملهٔ واقعی حقِ حملِ لنگرِ سطری (en) را دارد.
const bgExampleEnSet = new Set<string>();
for (const it of flattenBgExamples(BOOKLET_GRAMMAR_TOPICS)) {
  if (it.en && it.topicId && !bgTopicIdByBase.has(it.en)) {
    bgTopicIdByBase.set(it.en, it.topicId);
    bgExampleEnSet.add(it.en);
  }
  if (it.topicId && !bgTopicIdByBase.has(it.topicId)) bgTopicIdByBase.set(it.topicId, it.topicId);
}

/**
 * لنگرِ پرشِ یک پایه در یک بانک — بانکِ ناشناس/پایهٔ حلنشده = nullِ
 * صادق (نما خانهٔ امروز را ساکت نگه میدارد — r236: هیچ مقصدِ بیپشتوانهای
 * وعده نمیشود). گاردِ عضویت از نقشههایِ برچسبِ همین فایل است.
 */
export function drillJumpAnchorFor(bankId: string, base: string): DrillJumpAnchor | null {
  if (!base) return null;
  switch (bankId) {
    case "verbs":
      return verbFa.has(base) ? { kind: "verbBase", id: base } : null;
    case "phonemes":
      return phonemeFa.has(base) ? { kind: "phonemeId", id: base } : null;
    case "words": {
      const id = wordTableIdByBase.get(base);
      // r428 — لنگرِ عمیقِ سطری (الگویِ سطرِ فعلِ r234 / کارتِ واژهٔ r427):
      // خودِ واژه هم با لنگر میرود تا سطرِ خانوادهاش در جدول در دید با
      // پالسِ زمردی باز شود؛ گاردِ عضویت پیشتر است — سلولی که جدولی
      // ندارد همینجا null است.
      return id ? { kind: "posTableId", id, word: base } : null;
    }
    case "abbrev":
      return abbrevFa.has(base) ? { kind: "abbrevSym", id: base } : null;
    case "lesson-vocab": {
      const id = lessonIdByWord.get(base);
      // r427 — لنگرِ عمیقِ سطری: خودِ واژه هم با لنگر میرود تا کارتِ آن در
      // تبِ واژگان در دید با پالسِ زمردی باز شود (الگویِ سطرِ فعلِ r234)؛
      // گاردِ عضویتِ برچسب پیشتر است — واژهٔ بیبرچسب همینجا null است.
      return id != null && lessonVocabFa.has(base)
        ? { kind: "lessonTab", lessonId: id, wordEn: base }
        : null;
    }
    case "dict-vocab":
      // r430 — لنگرِ عمیق: خودِ واژه با لنگر میرود تا کارتش در دیکشنری با
      // عدسیِ جست‌وجو در دید با پالسِ زمردی باز شود (الگویِ کارتِ واژهٔ r427)؛
      // گاردِ عضویتِ برچسب پیشتر است — واژهٔ بیبرچسب همینجا null است.
      return lessonVocabFa.has(base) ? { kind: "dictWord", en: base } : null;
    case "bg-examples": {
      const id = bgTopicIdByBase.get(base);
      if (!id) return null;
      // r431 — عمقِ سطری (الگویِ سطرِ فعلِ r234/سطرِ خانوادهٔ r428): پایهای که
      // جملهٔ واقعیِ یک مثال است، خودِ جمله هم با لنگر میرود تا سطرِ مثال در
      // موضوعِ لنگرخورده با پالسِ زمردی باز شود؛ پایهای که topicIdِ خام است
      // مثالِ مشخصی ندارد — فرودِ موضوعیِ صادقِ r221 (بیِ پالسِ برساخته).
      return bgExampleEnSet.has(base) ? { kind: "topicId", id, en: base } : { kind: "topicId", id };
    }
    default:
      return null;
  }
}
