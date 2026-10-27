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
//    نه بُرخوردنِ دوباره، نه ساختنِ پرسشِ نو). موتور خالص است؛ بانکِ
//    خطایِ ماندگار از r413 نزدِ نمایِ مشترک ثبت میشود (lib/drill-mistakes).
// ------------------------------------------------------------------

// r400 — «تمرین افعال بی‌قاعده» — موتورِ خالصِ دریلِ ضمیمه.
// r407 — «دریل واژگان درس» (بانکِ ششم) به اتحادِ بالا پیوست —
//   گونهها در appendix-lesson-vocab-drill تعریف و از آنجا وارد میشوند
//   (تک-نامیِ نوعها — دو-نامِ r385 ممنوع).

import type { IrregularVerb } from "@/data/appendix";
import type { LessonVocabDrillKind } from "./appendix-lesson-vocab-drill";
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

/** r406 — گونههای دریلِ مثالهای درسنامهٔ جامع (بانکِ پنجم، نخستین بانکِ
 *  بیرون از چهار بانکِ جدولی) — ترجمه (مثال→فارسی) / جملهٔ انگلیسی
 *  (فارسی→مثال) / تشخیصِ موضوع (مثال→عنوانِ درسنامه) */
export type BgExampleDrillKind = "fa" | "ex" | "topic";

/** اتحادِ گونههای هر شش دریل — نما با faOptions/speak تصمیم میگیرد؛
 *  r406: جهتِ گزینهها هم دیگر از رویِ kind حدس زده نمیشود؛
 *  r407: واژگانِ درس (fa/en/pos) — ششمین بانک پیوست */
export type DrillQuestionKind =
  | DrillKind
  | WordDrillKind
  | AbbrevDrillKind
  | PhonemeDrillKind
  | BgExampleDrillKind
  | LessonVocabDrillKind;

export const DRILL_KINDS: DrillKind[] = ["past", "pp", "base", "fa"];

/** اندازهٔ پیشفرضِ جلسه — یک تمرینِ کوتاهِ دهتایی */
export const DRILL_SIZE = 10;

/**
 * r414 — سهمیهٔ سررسید در هر جلسه: بیشترینِ چهار پرسش از پایههایِ سررسیدِ
 * بانک (به ترتیبِ اولویتِ drillDueBases)؛ بقیهٔ جلسه بُرِ عادی — مرورِ
 * موازنهشده، نه جلسهٔ همهسررسید.
 */
export const DRILL_DUE_QUOTA = 4;

/**
 * r414 — گزینشِ «سررسید-نخست» برایِ موتورهایِ پرسشبهپرسش: نخستین عضوِ
 * صفِ سررسید که در استخرِ پرسیدنیِ همین پرسش حاضر است (به ترتیبِ اولویتِ
 * صف)، وگرنه بُرِ عادی. صف، صفِ مشترکِ جلسهاست (سررسیدِ مصرفشده بیرون
 * میآید) و سازندهٔ صف سهمیه را رویش اعمال کرده. با صفِ تهی، رفتار و
 * مصرفِ rng بایت‌به‌بایت همانِ پیش است — قفلهایِ r400..r413 پابرجا.
 * baseOf مالِ هر موتور است (درسِ مالکیتِ r403 — نما/کیت حدس نمیزند).
 */
export function pickDueFirst<T>(
  pickable: readonly T[],
  baseOf: (t: T) => string,
  dueQueue: string[],
  rng: () => number,
): T {
  for (let i = 0; i < dueQueue.length; i++) {
    const hit = pickable.find((t) => baseOf(t) === dueQueue[i]);
    if (hit) {
      dueQueue.splice(i, 1);
      return hit;
    }
  }
  return shuffled(pickable, rng)[0];
}

/**
 * r415 — گزینشِ فقطسررسیدِ سخت: نخستین عضوِ صفِ سررسید حاضر در استخرِ
 * همین پرسش — وگرنه هیچ (پرسشِ این اندیس رد میشود؛ چرخشِ بازگشتیِ جلسهٔ
 * فقطسررسید گونهٔ بعدی را میآورد). برخلافِ pickDueFirst بُرِ عادی ندارد —
 * پرسشِ فقطسررسید هرگز از بیرونِ صفِ سررسید نمیآید و rng مصرف نمیکند.
 * یک ردیفِ سررسید (یک base) یک پرسش میگیرد — نه چند پرسش برساخته.
 */
export function pickDueOnly<T>(
  pickable: readonly T[],
  baseOf: (t: T) => string,
  dueQueue: string[],
): T | undefined {
  for (let i = 0; i < dueQueue.length; i++) {
    const hit = pickable.find((t) => baseOf(t) === dueQueue[i]);
    if (hit) {
      dueQueue.splice(i, 1);
      return hit;
    }
  }
  return undefined;
}

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
  /** r406 — جهتِ گزینهها نزدِ موتورِ بانک: true یعنی گزینهها فارسیاند
   *  (RTL، بی en-text) و false یعنی انگلیسی (LTR، en-text) — تکمیلِ درسِ
   *  مالکیتِ r403: نما از رویِ kind حدس نمیزد؛ گونههایِ fa/topicِ بانکِ
   *  درسنامه هر دو فارسیاند و این را فقط خودِ موتور میداند. */
  faOptions: boolean;
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
  /** r414 — پایههایِ سررسید به ترتیبِ اولویت — سهمیه نزدِ همین موتور اعمال میشود */
  due?: readonly string[],
  /** r415 — «تمرینِ سررسیدها»: جلسهٔ ساختهشده فقط از پایههایِ سررسیدِ حاضر
   *  در بانک (صفِ سررسید بیسهمیه، به ترتیبِ اولویت). استخرِ بدلها همان
   *  بانکِ کامل میماند — کیفیتِ گزینه مستقل از کوچکیِ مجموعهٔ سررسید. */
  dueOnly?: boolean,
): DrillSession {
  if (verbs.length === 0) return { questions: [], size: 0 };
  // r415 — جهانِ برگشتنی در حالتِ فقطسررسید به پایههایِ سررسیدِ حاضر در بانک
  // محدود میشود (سررسیدِ کهنه/بیصاحب صادقانه میافتد)؛ مسیرِ عادی همان verbs است
  const dueSet = dueOnly && due ? new Set(due) : null;
  const universe = dueSet ? verbs.filter((v) => dueSet.has(v.base)) : verbs;
  if (universe.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), universe.length);
  // r414 — سررسیدها در سهمیهٔ خود به سرِ جلسه میآیند (مرور نخست، بعد تازهها)؛
  // r415 — در حالتِ فقطسررسید سهمیه جایش را سقفِ خودِ جلسه میگیرد؛
  // با dueِ غایب/تهی: shuffled(rest) با همان ترتیب و مصرفِ rngِ shuffled(verbs) — رفتارِ r400 بایت‌به‌بایت
  const duePicked: IrregularVerb[] = [];
  const remaining = new Map(universe.map((v) => [v.base, v]));
  for (const base of due ?? []) {
    if (duePicked.length >= (dueSet ? n : DRILL_DUE_QUOTA)) break;
    const hit = remaining.get(base);
    if (hit) {
      duePicked.push(hit);
      remaining.delete(base);
    }
  }
  const rest = universe.filter((v) => remaining.has(v.base));
  const picked = [...duePicked, ...shuffled(rest, rng)].slice(0, n);
  const questions = picked.map((v, i): DrillQuestion => {
    const kind = DRILL_KINDS[i % DRILL_KINDS.length];
    const correct = drillForm(v, kind);
    // استخرِ بدل همیشه از بانکِ کامل — r415: در جلسهٔ فقطسررسید هم گزینهها
    // همچگالیِ جلسهٔ عادی دارند (دو سررسید = دو گزینه نمیشود)
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
      faOptions: kind === "fa", // r406 — مالکیتِ جهت به موتور
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
