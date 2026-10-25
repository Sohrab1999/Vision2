// ------------------------------------------------------------------
// r405 — «دریلِ جدول تلفظ» — چهارمین بانکِ ضمیمه رویِ نمایِ مشترک.
//
// منبعِ حقیقت: vowelPhonemes + consonantPhonemes (src/data/appendix.ts)
// — ۴۴ واک، عینِ جزوه؛ موتور هیچ واک/واژه/توصیفی نمی‌سازد (قراردادِ
// صداقتِ جدولِ r230 در سویچِ تمرین هم پابرجاست).
//
// طراحی (همان قوانینِ موتورهایِ فعلِ r400 / واژهٔ r403 / نشانهٔ r404 —
// مالکِ مشترک: appendix-drill):
//  · سه گونهٔ چرخشی: توصیف (واک→فارسی) / واژههای نمونه (واک→انگلیسی) /
//    شنیدنِ واک (واژهها→واک) — جلسهٔ ۱۰تایی با چرخشِ اندیسِ صادق:
//    fa چهار بار، example و symbol هر یک سه بار.
//  · هر واک حداکثر یک بار در جلسه (سدِ تکرار؛ ۴۴ واک — بازاستفاده فقط
//    در تهشدن، همان قراردادِ r403).
//  · distractorها از همان ستونِ خودِ بانک، استخرِ ارزشی + حذفِ پاسخ.
//  · **درسِ لنگرِ بی‌ابهام (تعمیمِ r403):** بانک دو واک با نمونهٔ مشترک
//    دارد (æ و k هر دو «cat, black») — گونهٔ symbol فقط با نمونههایی
//    واجد است که در ستونِ نمونه یکتا باشند؛ وگرنه یک پرامپت دو پاسخِ
//    درست میزاید. توصیفِ مشترک (ɑː و ɔː هر دو «کشیده آ /») مشکلی
//    ندارد — پاسخِ مشترک، ابهامِ لنگر نیست.
//  · درسِ روخوانیِ r230 قانونِ چیپ را میدهد: واژهٔ نمونه شنیدنی است،
//    نمادِ IPA هرگز — پس speak = نمونه، جز وقتی که خودِ نمونه پاسخ است
//    (گونهٔ example بیچیپ میماند: «شنیدنیِ پرسش هرگز پاسخ نیست» —
//     همان اصلِ r404).
//  · rng تزریقی — جلسهٔ قطعی زیرِ تست، واقعی زیرِ UI. shuffled از مالک.
//  · نمره/مرور از مالک: scoreDrill / buildDrillReplay — برچسبِ نویسی
//    دوباره ممنوع (ضدِ دو-نامِ r385).
// ------------------------------------------------------------------

import type { Phoneme } from "@/data/appendix";
import {
  shuffled,
  DRILL_SIZE,
  type DrillQuestion,
  type DrillSession,
  type PhonemeDrillKind,
} from "./appendix-drill";

export type { PhonemeDrillKind };

/** ترتیبِ چرخشِ گونهها — ۱۰ پرسش = fa×۴، example×۳، symbol×۳ */
export const PHONEME_DRILL_KINDS: PhonemeDrillKind[] = ["fa", "example", "symbol"];

/** برچسبِ فارسیِ گونهها — برایِ معرفی و بازخوانیِ صادق */
export const PHONEME_KIND_LABEL: Record<PhonemeDrillKind, string> = {
  fa: "توصیف",
  example: "واژه‌های نمونه",
  symbol: "واک",
};

/** خانهٔ هر گونه از واک — تهیِ بانک همان تهی میماند */
function cellOf(p: Phoneme, kind: PhonemeDrillKind): string {
  if (kind === "fa") return p.fa;
  if (kind === "example") return p.example;
  return p.symbol;
}

/** پرامپت از خودِ دادهٔ واک — لنگرِ هر گونه همان سلولِ پرسشِ خودش است */
function promptFor(p: Phoneme, kind: PhonemeDrillKind): string {
  if (kind === "fa") return `توصیفِ واکِ «${p.symbol}» کدام است؟`;
  if (kind === "example") return `واژههای نمونهٔ واکِ «${p.symbol}» کدام است؟`;
  return `کدام واک در واژههای «${p.example}» شنیده میشود؟`;
}

export function buildPhonemeDrillSession(
  bank: readonly Phoneme[],
  size: number = DRILL_SIZE,
  rng: () => number = Math.random,
): DrillSession {
  if (bank.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), bank.length);

  // واکهایِ واجدِ هر گونه — یکبارِ پیشمحاسبه (خالص: هیچ جهشی در داده).
  // گونهٔ symbol شرطِ اضافه دارد: نمونهٔ لنگر باید در ستونِ نمونه یکتا
  // باشد (درسِ r403 تعمیمشده — «cat, black» مشترکِ æ و k است).
  const exampleCount = new Map<string, number>();
  for (const p of bank) exampleCount.set(p.example, (exampleCount.get(p.example) ?? 0) + 1);
  const eligible = new Map<PhonemeDrillKind, Phoneme[]>();
  for (const kind of PHONEME_DRILL_KINDS) {
    eligible.set(
      kind,
      bank.filter((p) => {
        if (cellOf(p, kind) === "") return false; // پاسخِ تهی پرسیدنی نیست
        // لنگرِ پرسش هم باید پر باشد: fa/example لنگرش symbol است، symbol لنگرش example —
        // (درسِ قفلِ راند: نمونهٔ تهی با شمارشِ یکتا از فیلتر میگذشت و پرامپتِ ««»» میزد)
        if (kind === "symbol") {
          return p.example !== "" && p.symbol !== "" && exampleCount.get(p.example) === 1;
        }
        return p.symbol !== "";
      }),
    );
  }

  const used = new Set<Phoneme>();
  const questions: DrillQuestion[] = [];
  for (let i = 0; i < n; i++) {
    const kind = PHONEME_DRILL_KINDS[i % PHONEME_DRILL_KINDS.length];
    // ترجیحِ واکِ بیکاربرد؛ استخرِ تهیشده اجازهٔ بازاستفاده میدهد؛
    // گونهٔ بیپیشنهاد پرسیدنی نیست — جلسهٔ کوتاهترِ صادق (درسِ r404)
    const pool = eligible.get(kind)!;
    const fresh = pool.filter((p) => !used.has(p));
    const pickable = fresh.length > 0 ? fresh : pool;
    if (pickable.length === 0) continue;
    const p = shuffled(pickable, rng)[0];
    used.add(p);

    const correct = cellOf(p, kind);
    const column = bank.map((x) => cellOf(x, kind)).filter((v) => v !== "");
    const distractorPool = Array.from(new Set(column)).filter((v) => v !== correct);
    const distractors = shuffled(distractorPool, rng).slice(0, 3);
    const options = shuffled([correct, ...distractors], rng);
    questions.push({
      base: p.symbol, // شناسهٔ واکِ هدف برایِ بازخوانی — صادق در هر حال
      fa: p.fa,
      kind,
      prompt: promptFor(p, kind),
      options,
      answer: options.indexOf(correct),
      speak: kind === "example" ? undefined : p.example, // r230: نمونه شنیدنی است، نماد هرگز
    });
  }
  // size = شمارِ واقعیِ پرسشها — گونهٔ بیپیشنهاد جلسه را کوتاه میکند، نه واژگون
  return { questions, size: questions.length };
}
