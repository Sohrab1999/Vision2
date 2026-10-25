// ------------------------------------------------------------------
// r400 — «تمرین افعال بی‌قاعده» — موتورِ خالصِ دریلِ ضمیمه.
//
// منبعِ حقیقت: irregularVerbs (src/data/appendix.ts) — ۸۷ فعلِ عینِ
// جزوه؛ موتور هیچ فعلی نمی‌سازد و هیچ شکل را دستی نمی‌نویسد (قراردادِ
// صداقتِ جدولِ r229 در سویچِ تمرین هم پابرجاست: صفرِ جست‌وجو صادقانه،
// گزینه‌ها فقط از خودِ بانک).
//
// طراحی:
//  · سه گونهٔ پرسش (چرخشی، به‌ازایِ اندیسِ سؤال): گذشتهٔ ساده / شکل سوم
//    (p.p.) / شکلِ ساده از رویِ گذشته‌اش — «base» یعنی فرمِ نشان‌داده‌شده
//    گذشتهٔ فعل است و گزینه‌ها شکلهای سادهاند.
//  · حواس‌پرتی‌ها (distractors) از همان ستونِ بقیهٔ افعال، «ارزشی» یگانه:
//    بانکِ افعال هم‌ارزشِ تکراری دارد (ppِ come و become هر دو «come»؛
//    past/pastِ cut و put...) — پس استخر با Setِ ارزشی میشود و هر ارزش
//    برابرِ پاسخِ درست حذف؛ وگرنه دو گزینهٔ یکسان یا دو پاسخِ درست
//    می‌زایید (قفلِ تستِ یکتاییِ گزینه).
//  · rng تزریقی — جلسهٔ قطعی زیرِ تست (mulberry32) و واقعی زیرِ UI
//    (Math.random). Fisher–Yates استاندارد.
//  · نمره از مالکِ درصد (r388): percent(correct, total) — «NaN٪» و
//    درصدِ خارجِ ۰..۱۰۰ ناممکن؛ بی‌پاسخ = نادرستِ صادقانه.
// ------------------------------------------------------------------

// r401 — «معنی + مرورِ اشتباهها»:
//  · گونهٔ چهارمِ پرسش (fa): «معنیِ X کدام است؟» — گزینهها معنیهایِ
//    فارسیِ خودِ بانکاند (همان ستونِ fa)؛ انگلیسیِ فعل با چیپِ TTS
//    همراهیِ سؤال را میکند (ایدئومِ چیپِ r400 برایِ گونههایِ non-base).
//  · buildDrillReplay: بانکِ خطایِ موضعیِ جلسه — فقط سؤالهایِ نادرست/
//    بیپاسخِ همان جلسه، به همان ترتیب و با همان گزینهها (مرورِ صادق:
//    نه بُرخوردنِ دوباره، نه ساختنِ پرسشِ نو). هیچ نوشتنی به استورِ
//    یادگیری — بانکِ خطایِ ماندگار پسِ طراحیِ SyncField (حکمِ r400).
// ------------------------------------------------------------------

import type { IrregularVerb } from "@/data/appendix";
import { percent } from "@/lib/domain/percent";

export type DrillKind = "past" | "pp" | "base" | "fa";

/** گونههای دریلِ خانوادهٔ واژه (r403) — معنی + چهار جزء کلام */
export type WordDrillKind = "fa" | "adjective" | "adverb" | "verb" | "noun";

/** r404 — گونههای دریلِ نشانه‌های اختصاری (سومین بانکِ ضمیمه) —
 *  معنی (نماد→فارسی) / شکلِ کامل (نماد→انگلیسی) / نمادِ معکوس (انگلیسی→نماد) */
export type AbbrevDrillKind = "fa" | "full" | "sym";

/** r405 — گونههای دریلِ تلفظ (بانکِ چهارم) — توصیف (واک→فارسی) /
 *  واژههای نمونه (واک→انگلیسی) / شنیدنِ واک (واژهها→واک) */
export type PhonemeDrillKind = "fa" | "example" | "symbol";

/** اتحادِ گونههای هر چهار دریل — نما فقط با fa/base/speak تصمیم میگیرد */
export type DrillQuestionKind = DrillKind | WordDrillKind | AbbrevDrillKind | PhonemeDrillKind;

export const DRILL_KINDS: DrillKind[] = ["past", "pp", "base", "fa"];

/** اندازهٔ پیشفرضِ جلسه — یک تمرینِ کوتاهِ دهتایی */
export const DRILL_SIZE = 10;

export interface DrillQuestion {
  /** شناسهٔ فعلِ هدف (شکلِ ساده) — صادق برای بازخوانیِ نتیجه */
  base: string;
  fa: string;
  kind: DrillQuestionKind;
  /** متنِ پرسشِ فارسی — از دادهٔ خودِ فعل، بی دستسازی */
  prompt: string;
  /** گزینه‌ها: پاسخِ درست + حواس‌پرتیها؛ ارزشها دوبهدو متمایز */
  options: string[];
  /** اندیسِ گزینهٔ درست */
  answer: number;
  /** چیپِ روخوانی (r403): اگر هست، چیپِ انگلیسی + TTS — موتورِ هر بانک مالکِ
   *  تصمیم است (فعل: همهٔ گونهها جز base؛ واژه: لنگرِ انگلیسیِ خانواده) —
   *  نما دیگر از رویِ kind حدس نمیزند. */
  speak?: string | undefined;
}

export interface DrillSession {
  questions: DrillQuestion[];
  size: number;
}

/** شکلِ پرسیدهشده بهازای هر گونه — مالکِ یگانهٔ نگاشتِ گونه→ستون */
export function drillForm(v: IrregularVerb, kind: DrillKind): string {
  if (kind === "past") return v.past;
  if (kind === "pp") return v.pp;
  if (kind === "fa") return v.fa;
  return v.base;
}

function promptFor(v: IrregularVerb, kind: DrillKind): string {
  if (kind === "past") return `گذشتهٔ سادهٔ «${v.base}» — «${v.fa}» — کدام است؟`;
  if (kind === "pp") return `شکل سوم (p.p.) «${v.base}» — «${v.fa}» — کدام است؟`;
  if (kind === "fa") return `معنیِ «${v.base}» کدام است؟`;
  return `شکلِ «${v.past}» متعلق به کدام فعل است؟`;
}

/** Fisher–Yates رویِ یک کپی — آرایهٔ ورودی دستنخورده (خالص) — مالکِ
 *  بُر خوردنِ دریلها؛ موتورِ خانوادهٔ واژه (r403) همین را مصرف میکند. */
export function shuffled<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildDrillSession(
  verbs: readonly IrregularVerb[],
  size: number = DRILL_SIZE,
  rng: () => number = Math.random,
): DrillSession {
  if (verbs.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), verbs.length);
  const picked = shuffled(verbs, rng).slice(0, n);
  const questions = picked.map((v, i): DrillQuestion => {
    const kind = DRILL_KINDS[i % DRILL_KINDS.length];
    const correct = drillForm(v, kind);
    const pool = Array.from(new Set(verbs.map((x) => drillForm(x, kind)))).filter(
      (val) => val !== correct,
    );
    const distractors = shuffled(pool, rng).slice(0, 3);
    const options = shuffled([correct, ...distractors], rng);
    return {
      base: v.base,
      fa: v.fa,
      kind,
      prompt: promptFor(v, kind),
      options,
      answer: options.indexOf(correct),
      speak: kind === "base" ? undefined : v.base, // چیپِ TTS — همه گونهها جز base
    };
  });
  return { questions, size: n };
}

/**
 * بانکِ خطایِ موضعیِ جلسه (r401): جلسهٔ «مرورِ اشتباهها» — فقط سؤالهایِ
 * نادرست یا بیپاسخِ همین جلسه، به همان ترتیب و با همان گزینهها. خالص:
 * ورودی دستنخورده، خروجیِ تازه. جلسهٔ بیاشتباه → جلسهٔ تهیِ صادقانه
 * (نما دکمهٔ مرور را اصلاً بالا نمیآورد — اینجا هم قرارداد آینه است).
 */
export function buildDrillReplay(
  questions: readonly DrillQuestion[],
  answers: readonly (number | null)[],
): DrillSession {
  const wrong = questions.filter((q, i) => answers[i] !== q.answer);
  return { questions: [...wrong], size: wrong.length };
}

export interface DrillScore {
  correct: number;
  total: number;
  /** درصدِ نمایشی ۰..۱۰۰ از مالکِ r388 — بیپاسخ = نادرستِ صادقانه */
  percentValue: number;
}

export function scoreDrill(
  questions: readonly DrillQuestion[],
  answers: readonly (number | null)[],
): DrillScore {
  const total = questions.length;
  let correct = 0;
  for (let i = 0; i < total; i++) {
    if (answers[i] != null && answers[i] === questions[i].answer) correct++;
  }
  return { correct, total, percentValue: percent(correct, total) };
}
