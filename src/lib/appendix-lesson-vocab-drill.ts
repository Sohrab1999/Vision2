// ------------------------------------------------------------------
// r407 — «دریل واژگان درس» — ششمین بانک روی نمایِ مشترکِ r403 و
// نخستین بانکِ ساکن در خودِ درس (تبِ واژگان)، نه ضمیمه و نه درسنامه.
//
// منبعِ حقیقت: vocabularyِ خودِ درس (LessonData.vocabulary — عینِ
// واژه‌های جزوه با ستونِ en/fa/pos). موتور هیچ واژه‌ای نمی‌سازد و هیچ
// معنیای دستی نمینویسد (قراردادِ صداقتِ بانکهایِ r400..r406). کارت‌های
// واژه، فلش‌کارت، دیکته و آزمونکِ خودِ درس پیشتر مصرف بشردهاند — این
// موتور سراغشان نمیرود؛ تنها ستونهایِ واژه↔معنی↔نقش را پرسیدنی
// میکند که تا امروز فقط خواندنی بودند.
//
// طراحی (همان قوانینِ پنج بانکِ پیشین — مالکِ مشترک: appendix-drill):
//  · سه گونهٔ چرخشی: معنی (fa: واژه→فارسی) / واژه (en: فارسی→واژه) /
//    نقشِ کلامی (pos: واژه→برچسبِ نقش) — جلسهٔ ۱۰تایی با چرخشِ اندیسِ
//    صادق: معنی×۴، واژه×۳، نقش×۳ (۱۰ بر ۳ بخشپذیر نیست — تقارنِ
//    برساخته ممنوع، درسِ r404).
//  · **یکتاییِ دوسویه (تعمیمِ r403/r405/r406):** سرشماریِ r407 رویِ
//    هر ۱۲ درس نشان داد en در همه یکتاست، ولی fa دوقلو دارد (درس ۱۰:
//    ۱۶ دوقلو، درس ۱۲: ۱۲، درس ۱۱: ۴، ...) — پس:
//      - گونهٔ معنی فقط با واژههایی واجد است که enشان در بانکِ درس به
//        دقیقاً یک fa میرسد (en تکراری = دو پاسخِ درستِ ساختگی)؛
//      - گونهٔ واژه فقط با ترجمههایی که به دقیقاً یک en میرسند —
//        «بطری» اگر دو واژه باشد، پرامپتش دو پاسخِ درست میزاد؛
//      - گونهٔ نقش فقط با واژههایِ صاحبِ pos (خانهٔ تهیِ جزوه پرسیدنی
//        نیست) و فقط در درسی که دستکم ۴ برچسبِ نقش دارد — کمتر =
//        پرامپتِ کمگزینه؛ گونهٔ بیپیشنهاد جلسه را کوتاه میکند، نه
//        واژگون (درسِ r404).
//  · درسِ روخوانیِ r230/r404/r405 قانونِ چیپ را میدهد: واژهٔ انگلیسیِ
//    پرسش شنیدنی است (معنی و نقش)؛ در گونهٔ واژه خودِ گزینهها
//    انگلیسیاند — «شنیدنیِ پرسش هرگز پاسخ نیست» — بیچیپ.
//  · r406 — جهتِ گزینهها نزدِ موتور: معنی و نقش فارسی (RTL)، واژه
//    انگلیسی (LTR) — نما از فیلدِ faOptions میخواند، حدس نمیزند.
//  · برچسبِ نقش از مالکِ یکتا posLabel (lib/study-theme) — دو-نامِ
//    r385 ممنوع؛ موتور نقش را دوباره نامگذاری نمیکند.
//  · سدِ تکرار: هر واژه حداکثر یک بار در جلسه؛ تهشدنِ استخر اجازهٔ
//    بازاستفاده میدهد (قراردادِ r403).
//  · rng تزریقی — جلسهٔ قطعی زیرِ تست، واقعی زیرِ UI. shuffled از مالک.
//  · نمره/مرور از مالک: scoreDrill / buildDrillReplay — برچسبنویسیِ
//    دوباره ممنوع (ضدِ دو-نامِ r385). موتور خالص است — نوشتنیِ جلسه
//    (رکوردِ r412 و بانکِ خطایِ ماندگارِ r413) نزدِ نمایِ مشترک است؛
//    بلدم/ستارهٔ کارت‌های واژه دستنخورده میماند.
// ------------------------------------------------------------------

import type { VocabWord } from "@/lib/study-types";
import { posLabel } from "@/lib/study-theme";
import {
  shuffled,
  DRILL_SIZE,
  type DrillQuestion,
  type DrillSession,
} from "./appendix-drill";

/** گونههای دریل واژگان درس (r407 — ششمین بانک) —
 *  معنی (واژه→فارسی) / واژه (فارسی→واژه) / نقشِ کلامی (واژه→برچسب) */
export type LessonVocabDrillKind = "fa" | "en" | "pos";

/** ترتیبِ چرخشِ گونهها — ۱۰ پرسش = معنی×۴، واژه×۳، نقش×۳ */
export const LESSON_VOCAB_DRILL_KINDS: LessonVocabDrillKind[] = ["fa", "en", "pos"];

/** برچسبِ فارسیِ گونهها — برایِ معرفیِ صادق و تست */
export const LESSON_VOCAB_KIND_LABEL: Record<LessonVocabDrillKind, string> = {
  fa: "معنی",
  en: "واژه",
  pos: "نقش کلامی",
};

/** دستکمِ برچسبهایِ نقش برایِ پر کردنِ ۴ گزینه (پاسخ + ۳ بدل) */
const POS_OPTION_FLOOR = 4;

/** واجدانهایِ هر گونه — قطعی (بی rng): واجدبودن به شانس وابسته نیست.
 *  هم build و هم برنامهٔ قطعیِ معرفی از همین تکمنبع میخوانند.
 *  r408 — درسِ مقیاسِ سراسری: همان en در درسهایِ مختلف میتواند posهایِ
 *  متفاوت داشته باشد — نقشِ مبهم هم مثلِ ترجمهٔ مبهم (r406) پرسیدنی نیست:
 *  گونهٔ pos فقط از enهایی میآید که در کلِ بانک به یک برچسبِ نقش میرسند. */
function computeEligible(
  bank: readonly VocabWord[],
): Map<LessonVocabDrillKind, VocabWord[]> {
  // یکتاییِ دوسویه — یکبارِ پیشمحاسبه (خالص: هیچ جهشی در داده):
  // en→مجموعهٔ ترجمهها / fa→مجموعهٔ واژهها (دقیقاً نقشهٔ r406) و
  // en→مجموعهٔ نقشها (r408 — تعمیمِ سومِ درسِ لنگرِ بی‌ابهام)
  const enFas = new Map<string, Set<string>>();
  const faEns = new Map<string, Set<string>>();
  const enPoss = new Map<string, Set<string>>();
  for (const w of bank) {
    if (!enFas.has(w.en)) enFas.set(w.en, new Set());
    enFas.get(w.en)!.add(w.fa);
    if (!faEns.has(w.fa)) faEns.set(w.fa, new Set());
    faEns.get(w.fa)!.add(w.en);
    if (w.pos) {
      if (!enPoss.has(w.en)) enPoss.set(w.en, new Set());
      enPoss.get(w.en)!.add(w.pos);
    }
  }

  // ستونِ برچسبهایِ نقشِ همین درس — از مالکِ یکتا (posLabel)؛ کدِ
  // ناشناخته به رشتهٔ تهی میرسد و بیرون میافتد (گزینهٔ تهی ناممکن)
  const posLabelSet = new Set(
    bank.filter((w) => w.pos).map((w) => posLabel[w.pos as string] ?? ""),
  );
  posLabelSet.delete("");

  const eligible = new Map<LessonVocabDrillKind, VocabWord[]>();
  eligible.set("fa", bank.filter((w) => enFas.get(w.en)!.size === 1));
  eligible.set("en", bank.filter((w) => faEns.get(w.fa)!.size === 1));
  eligible.set(
    "pos",
    posLabelSet.size >= POS_OPTION_FLOOR
      ? bank.filter(
          (w) =>
            w.pos &&
            enFas.get(w.en)!.size === 1 &&
            enPoss.get(w.en)!.size === 1,
        )
      : [],
  );
  return eligible;
}

export interface LessonVocabDrillPlan {
  /** اندازهٔ واقعیِ جلسه در این درس — گونهٔ بیپیشنهاد کوتاهش میکند */
  size: number;
  /** گونههایِ زندهٔ این درس — معرفیِ صادقِ هر درس از همین میآید */
  kinds: LessonVocabDrillKind[];
  /** شمارِ بانکِ صادق (سلولِ تهی پرسیدنی نیست) */
  bank: number;
}

/** برنامهٔ قطعیِ جلسه — بی rng؛ معرفیِ سرصفحه همین را میگوید، نه وعدهٔ
 *  برساختهٔ «۱۰» برایِ درسی که گونهاش نمیتواند ساخته شود (صداقتِ r404). */
export function lessonVocabDrillPlan(
  vocab: readonly VocabWord[],
  size: number = DRILL_SIZE,
): LessonVocabDrillPlan {
  const bank = vocab.filter((w) => w.en !== "" && w.fa !== "");
  if (bank.length === 0) return { size: 0, kinds: [], bank: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), bank.length);
  const eligible = computeEligible(bank);
  const kinds = LESSON_VOCAB_DRILL_KINDS.filter((k) => eligible.get(k)!.length > 0);
  let live = 0;
  for (let i = 0; i < n; i++) {
    const kind = LESSON_VOCAB_DRILL_KINDS[i % LESSON_VOCAB_DRILL_KINDS.length];
    if (eligible.get(kind)!.length > 0) live++;
  }
  return { size: live, kinds, bank: bank.length };
}

/** r408 — تختکردنِ صادقِ همهٔ درسها به یک بانکِ سراسری — مقیاسِ دیکشنریِ
 *  بانکِ واژگان: کلِ ۴۰۳۲ واژه با ترتیبِ خودِ داده (درس به درس). تکمنبعِ
 *  تختکردن — نما، تست و شاهد از همین میخوانند (الگویِ flattenBgExamplesِ r406).
 *  ساختارِ ورودی عمداً حداقلی است — هر چیزِ صاحبِ vocabulary میآید. */
export function flattenLessonVocab(
  lessons: readonly { vocabulary: readonly VocabWord[] }[],
): VocabWord[] {
  const bank: VocabWord[] = [];
  for (const l of lessons) {
    for (const w of l.vocabulary) bank.push(w);
  }
  return bank;
}

export function buildLessonVocabDrillSession(
  vocab: readonly VocabWord[],
  size: number = DRILL_SIZE,
  rng: () => number = Math.random,
): DrillSession {
  // بانکِ صادق: خانهٔ تهیِ جزوه (بی en یا بی fa) پرسیدنی نیست
  const bank = vocab.filter((w) => w.en !== "" && w.fa !== "");
  if (bank.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), bank.length);
  const eligible = computeEligible(bank);

  // ستونِ برچسبهایِ نقش — گزینههایِ گونهٔ pos از همین میآیند
  const posLabelSet = new Set(
    bank.filter((w) => w.pos).map((w) => posLabel[w.pos as string] ?? ""),
  );
  posLabelSet.delete("");

  const used = new Set<string>(); // کلیدِ جفتیِ en|fa — r408: در بانکِ سراسری جفتِ واحد با اشیایِ متعدد میآید
  const questions: DrillQuestion[] = [];
  for (let i = 0; i < n; i++) {
    const kind = LESSON_VOCAB_DRILL_KINDS[i % LESSON_VOCAB_DRILL_KINDS.length];
    // ترجیحِ واژهٔ بیکاربرد؛ استخرِ تهیشده اجازهٔ بازاستفاده میدهد
    const pool = eligible.get(kind)!;
    const fresh = pool.filter((w) => !used.has(`${w.en}\u0000${w.fa}`));
    const pickable = fresh.length > 0 ? fresh : pool;
    if (pickable.length === 0) continue; // جلسهٔ کوتاهترِ صادق — نه واژگونی
    const w = shuffled(pickable, rng)[0];
    used.add(`${w.en}\u0000${w.fa}`);
    // (سدِ تکرار و ترجیحِ بیکاربرد: قراردادِ r403 — بازاستفاده فقط در تهشدن)

    if (kind === "fa") {
      // معنی: پرسش = واژهٔ انگلیسی (چیپِ شنیدنی)؛ گزینهها فارسیِ خودِ درس (RTL)
      const correct = w.fa;
      const column = Array.from(new Set(bank.map((x) => x.fa))).filter((v) => v !== correct);
      const distractors = shuffled(column, rng).slice(0, 3);
      const options = shuffled([correct, ...distractors], rng);
      questions.push({
        base: w.en, // واژهٔ هدف برایِ بازخوانی — صادق در هر حال
        fa: w.fa,
        kind,
        prompt: `معنیِ «${w.en}» کدام است؟`,
        options,
        answer: options.indexOf(correct),
        speak: w.en, // r230: واژهٔ پرسش شنیدنی است — پاسخ فارسی است و هرگز
        faOptions: true,
      });
    } else if (kind === "en") {
      // واژه: پرسش = معنیِ فارسی؛ گزینهها واژههایِ انگلیسیِ خودِ درس (LTR) —
      // بیچیپ: شنیدنیِ پرسش هرگز پاسخ نیست (خودِ گزینهها پاسخاند)
      const correct = w.en;
      const column = Array.from(new Set(bank.map((x) => x.en))).filter((v) => v !== correct);
      const distractors = shuffled(column, rng).slice(0, 3);
      const options = shuffled([correct, ...distractors], rng);
      questions.push({
        base: w.en,
        fa: w.fa,
        kind,
        prompt: `کدام واژه معنیِ «${w.fa}» را دارد؟`,
        options,
        answer: options.indexOf(correct),
        speak: undefined,
        faOptions: false,
      });
    } else {
      // نقشِ کلامی: پرسش = واژهٔ انگلیسی (چیپِ شنیدنی)؛ گزینهها برچسبهایِ
      // نقشِ همین درس (RTL) — از مالکِ یکتا، نه نامگذاریِ دوبارهٔ موتور
      const correct = posLabel[w.pos as string];
      const column = Array.from(posLabelSet).filter((v) => v !== correct);
      const distractors = shuffled(column, rng).slice(0, 3);
      const options = shuffled([correct, ...distractors], rng);
      questions.push({
        base: w.en,
        fa: w.fa,
        kind,
        prompt: `نقشِ کلامیِ «${w.en}» کدام است؟`,
        options,
        answer: options.indexOf(correct),
        speak: w.en,
        faOptions: true,
      });
    }
  }
  // size = شمارِ واقعیِ پرسشها — گونهٔ بیپیشنهاد جلسه را کوتاه میکند، نه واژگون
  return { questions, size: questions.length };
}
