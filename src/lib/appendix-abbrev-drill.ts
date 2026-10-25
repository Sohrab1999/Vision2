// ------------------------------------------------------------------
// r404 — «دریلِ نشانه‌های اختصاری» — سومین بانکِ ضمیمه رویِ نمایِ مشترک.
//
// منبعِ حقیقت: abbreviations (src/data/appendix.ts) — ۱۳ نشانه، عینِ
// جزوه؛ موتور هیچ نشانه‌ای نمی‌سازد و هیچ معنی/شکلی دستی نمی‌نویسد
// (قراردادِ صداقتِ جدولِ r231 در سویچِ تمرین هم پابرجاست).
//
// طراحی (همان قوانینِ موتورهایِ فعلِ r400 و واژهٔ r403 — مالکِ مشترک:
// appendix-drill):
//  · سه گونهٔ چرخشی: معنی (نماد→فارسی) / شکلِ کامل (نماد→انگلیسی) /
//    نمادِ معکوس (انگلیسی→نماد) — در جلسهٔ ۱۰تایی با چرخشِ اندیس:
//    fa چهار بار، full و sym هر یک سه بار (۱۰ بر ۳ بخشپذیر نیست —
//    چرخشِ صادق، نه توزیعِ برساخته).
//  · هر نشانه حداکثر یک بار در جلسه (سدِ تکرار)؛ با ۱۳ نشانه تهشدن
//    ناممکن است ولی قرارداد «اجازهٔ بازاستفاده» دارد (عینِ r403).
//  · distractorها از همان ستونِ خودِ بانک، استخرِ ارزشی + حذفِ پاسخ —
//    هر سه ستونِ این بانک بیهیچ تکراریاند ولی موتور به آن وابسته نیست.
//  · درسِ روخوانیِ r231 اینجا هم مالکیتِ چیپ را تعیین میکند: «نمادِ
//    اختصاری روخوانی نمیشود — n و v تنها بی‌معنا خوانده میشوند». پس
//    speak فقط در گونهٔ sym هست (شکلِ کاملِ انگلیسیِ پرسش — همان چیزی
//    که کارتِ r231 رویش دکمهٔ روخوانی دارد)؛ گونههای fa/full بیچیپند.
//  · rng تزریقی — جلسهٔ قطعی زیرِ تست، واقعی زیرِ UI. shuffled از مالک.
//  · نمره/مرور از مالک: scoreDrill / buildDrillReplay — برچسبِ نویسی
//    دوباره ممنوع (ضدِ دو-نامِ r385).
// ------------------------------------------------------------------

import type { Abbreviation } from "@/data/appendix";
import {
  shuffled,
  DRILL_SIZE,
  type DrillQuestion,
  type DrillSession,
  type AbbrevDrillKind,
} from "./appendix-drill";

export type { AbbrevDrillKind };

/** ترتیبِ چرخشِ گونهها — ۱۰ پرسش = fa×۴، full×۳، sym×۳ */
export const ABBREV_DRILL_KINDS: AbbrevDrillKind[] = ["fa", "full", "sym"];

/** برچسبِ فارسیِ گونهها — برایِ معرفی و بازخوانیِ صادق */
export const ABBREV_KIND_LABEL: Record<AbbrevDrillKind, string> = {
  fa: "معنی",
  full: "شکلِ کامل",
  sym: "نشانه",
};

/** خانهٔ هر گونه از نشانه — تهیِ بانک همان تهی میماند */
function cellOf(a: Abbreviation, kind: AbbrevDrillKind): string {
  if (kind === "fa") return a.fa;
  if (kind === "full") return a.full;
  return a.sym;
}

/** پرامپت از خودِ دادهٔ نشانه — لنگرِ هر گونه همان سلولِ پرسشِ خودش است */
function promptFor(a: Abbreviation, kind: AbbrevDrillKind): string {
  if (kind === "fa") return `معنیِ نشانهٔ «${a.sym}» کدام است؟`;
  if (kind === "full") return `شکلِ کاملِ نشانهٔ «${a.sym}» کدام است؟`;
  return `«${a.full}» با کدام نشانه کوتاه میشود؟`;
}

export function buildAbbrevDrillSession(
  bank: readonly Abbreviation[],
  size: number = DRILL_SIZE,
  rng: () => number = Math.random,
): DrillSession {
  if (bank.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), bank.length);

  // نشانههایِ واجدِ هر گونه — یکبارِ پیشمحاسبه (خالص: هیچ جهشی در داده)؛
  // هر گونه هم به سلولِ پاسخ و هم به سلولِ لنگرِ پرسش نیاز دارد
  // (fa/full لنگرش sym است، sym لنگرش full — خانهٔ خالی پرسیدنی نیست:
  // قراردادِ صداقتِ صفرِ صادقانهٔ r222).
  const eligible = new Map<AbbrevDrillKind, Abbreviation[]>();
  for (const kind of ABBREV_DRILL_KINDS) {
    eligible.set(
      kind,
      bank.filter((a) => {
        if (cellOf(a, kind) === "") return false;
        return kind === "sym" ? a.full !== "" : a.sym !== "";
      }),
    );
  }

  const used = new Set<Abbreviation>();
  const questions: DrillQuestion[] = [];
  for (let i = 0; i < n; i++) {
    const kind = ABBREV_DRILL_KINDS[i % ABBREV_DRILL_KINDS.length];
    // ترجیحِ نشانهٔ بیکاربرد؛ استخرِ تهیشده اجازهٔ بازاستفاده میدهد
    const pool = eligible.get(kind)!;
    const fresh = pool.filter((a) => !used.has(a));
    const pickable = fresh.length > 0 ? fresh : pool;
    // درسِ قفلِ راند: بانکِ غیروخالی ولی همهتهیِ یک گونه نباید واژگون کند —
    // گونهٔ بیپیشنهاد پرسیدنی نیست؛ جلسهٔ کوتاهترِ صادق (حکمِ r222)
    if (pickable.length === 0) continue;
    const a = shuffled(pickable, rng)[0];
    used.add(a);

    const correct = cellOf(a, kind);
    const column = bank.map((x) => cellOf(x, kind)).filter((v) => v !== "");
    const distractorPool = Array.from(new Set(column)).filter((v) => v !== correct);
    const distractors = shuffled(distractorPool, rng).slice(0, 3);
    const options = shuffled([correct, ...distractors], rng);
    questions.push({
      base: a.sym, // شناسهٔ نشانهٔ هدف برایِ بازخوانی — صادق در هر حال
      fa: a.fa,
      kind,
      prompt: promptFor(a, kind),
      options,
      answer: options.indexOf(correct),
      speak: kind === "sym" ? a.full : undefined, // درسِ r231: فقط شکلِ کامل روخوانی میشود
    });
  }
  // size = شمارِ واقعیِ پرسشها — گونهٔ بیپیشنهاد جلسه را کوتاه میکند، نه واژگون
  return { questions, size: questions.length };
}
