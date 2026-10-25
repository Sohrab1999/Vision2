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

import type { IrregularVerb } from "@/data/appendix";
import { percent } from "@/lib/domain/percent";

export type DrillKind = "past" | "pp" | "base";

export const DRILL_KINDS: DrillKind[] = ["past", "pp", "base"];

/** اندازهٔ پیشفرضِ جلسه — یک تمرینِ کوتاهِ دهتایی */
export const DRILL_SIZE = 10;

export interface DrillQuestion {
  /** شناسهٔ فعلِ هدف (شکلِ ساده) — صادق برای بازخوانیِ نتیجه */
  base: string;
  fa: string;
  kind: DrillKind;
  /** متنِ پرسشِ فارسی — از دادهٔ خودِ فعل، بی دستسازی */
  prompt: string;
  /** گزینه‌ها: پاسخِ درست + حواس‌پرتیها؛ ارزشها دوبهدو متمایز */
  options: string[];
  /** اندیسِ گزینهٔ درست */
  answer: number;
}

export interface DrillSession {
  questions: DrillQuestion[];
  size: number;
}

/** شکلِ پرسیدهشده بهازای هر گونه — مالکِ یگانهٔ نگاشتِ گونه→ستون */
export function drillForm(v: IrregularVerb, kind: DrillKind): string {
  if (kind === "past") return v.past;
  if (kind === "pp") return v.pp;
  return v.base;
}

function promptFor(v: IrregularVerb, kind: DrillKind): string {
  if (kind === "past") return `گذشتهٔ سادهٔ «${v.base}» — «${v.fa}» — کدام است؟`;
  if (kind === "pp") return `شکل سوم (p.p.) «${v.base}» — «${v.fa}» — کدام است؟`;
  return `شکلِ «${v.past}» متعلق به کدام فعل است؟`;
}

/** Fisher–Yates رویِ یک کپی — آرایهٔ ورودی دستنخورده (خالص) */
function shuffled<T>(arr: readonly T[], rng: () => number): T[] {
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
    };
  });
  return { questions, size: n };
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
