// ------------------------------------------------------------------
// r403 — «دریلِ خانوادهٔ واژه‌ها» — موتورِ خالصِ واژه‌سازیِ ضمیمه.
//
// منبعِ حقیقت: WORD_FAMILY_TABLES (src/data/word-families.ts) — ۱۰ جدول،
// ۲۴۳ خانواده، عینِ جدول‌های انتهای جزوه‌های جامع (دهم/یازدهم/دوازدهم).
// هیچ خانواده یا خانه‌ای ساخته نمیشود؛ خانهٔ خالیِ جزوه = رشتهٔ تهی و
// «پرسیدنی» نیست (قراردادِ صداقتِ صفرِ صادقانهٔ r222 — اینجا به شکلِ
// «گزینهٔ تهی ناممکن، خانوادهٔ بی‌خانه نامعلوم»).
//
// طراحی (همان قوانینِ موتورِ فعلِ r400 — مالکِ مشترک: appendix-drill):
//  · پنج گونهٔ چرخشی: معنی (fa) + چهار جزء کلام (صفت/قید/فعل/اسم) —
//    در جلسهٔ ۱۰تایی هر گونه دقیقاً دو بار (چرخش رویِ اندیس).
//  · distractorها از همان ستونِ همان جدولها، استخرِ ارزشی + حذفِ پاسخ؛
//    گزینهٔ تهی ناممکن (خانههای خالی از استخر بیروناند).
//  · لنگرِ انگلیسی (anchor): نخستین خانهٔ پر از میانِ ستونهایِ دیگرِ
//    خانواده (فعل→اسم→صفت→قید، ستونِ هدف مستثنا) — هم در پرامپت میآید
//    هم چیپِ TTS میشود (فیلدِ speak — نما از رویِ kind حدس نمیزند).
//  · هر خانواده حداکثر یک بار در جلسه (سدِ تکرار)؛ با ۲۴۳ خانواده،
//    تهشدنِ استخر ناممکن است ولی قرارداد «اجازهٔ بازاستفاده» دارد.
//  · rng تزریقی — جلسهٔ قطعی زیرِ تست، واقعی زیرِ UI. shuffled از مالک.
//  · نمره/مرور از مالک: scoreDrill / buildDrillReplay — برچسبِ نویسی
//    دوباره ممنوع (ضدِ دو-نامِ r385).
// ------------------------------------------------------------------

import type { WordFamily, WordFamilyTable } from "@/data/word-families";
import {
  shuffled,
  DRILL_SIZE,
  type DrillQuestion,
  type DrillSession,
  type WordDrillKind,
} from "./appendix-drill";

export type { WordDrillKind };

/** ترتیبِ چرخشِ گونهها — ۱۰ پرسش = هر گونه دقیقاً ۲ بار */
export const WORD_DRILL_KINDS: WordDrillKind[] = ["fa", "adjective", "adverb", "verb", "noun"];

/** برچسبِ فارسیِ ستونهای جزئ کلام — عینِ نامگذاریِ جدولِ r222 */
export const WORD_KIND_LABEL: Record<WordDrillKind, string> = {
  fa: "معنی",
  adjective: "صفت",
  adverb: "قید",
  verb: "فعل",
  noun: "اسم",
};

/** خانهٔ هر گونه از خانواده — تهیِ جزوه همان تهی میماند */
function cellOf(f: WordFamily, kind: WordDrillKind): string {
  if (kind === "fa") return f.fa;
  if (kind === "adjective") return f.adjective;
  if (kind === "adverb") return f.adverb;
  if (kind === "verb") return f.verb;
  return f.noun;
}

/** لنگرِ انگلیسیِ خانواده: نخستین خانهٔ پر از ستونهایِ دیگر (هدف مستثنا).
 *  درسِ r403: لنگر نباید «هم‌ارزشِ پاسخ» هم باشد — خانوادهٔ care فعل و اسمِ
 *  هر دو «care» دارد؛ لنگرِ برابرِ پاسخ، جواب را در پرامپت لو میدهد. */
function anchorOf(f: WordFamily, target: WordDrillKind): string {
  const answer = cellOf(f, target);
  for (const k of ["verb", "noun", "adjective", "adverb"] as WordDrillKind[]) {
    if (k === target) continue;
    const v = cellOf(f, k);
    if (v && v !== answer) return v;
  }
  return "";
}

function promptFor(f: WordFamily, kind: WordDrillKind, anchor: string): string {
  if (kind === "fa") return `معنیِ «${anchor}» کدام است؟`;
  const label = WORD_KIND_LABEL[kind];
  return anchor
    ? `${label}ِ خانوادهٔ «${f.fa}» — «${anchor}» — کدام است؟`
    : `${label}ِ خانوادهٔ «${f.fa}» کدام است؟`;
}

export function buildWordDrillSession(
  tables: readonly WordFamilyTable[],
  size: number = DRILL_SIZE,
  rng: () => number = Math.random,
): DrillSession {
  const families = tables.flatMap((t) => t.families);
  if (families.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), families.length);

  // خانوادههایِ واجدِ هر گونه — یکبارِ پیشمحاسبه (خالص: هیچ جهشی در داده)؛
  // گونهٔ fa هم به لنگرِ انگلیسی نیاز دارد (پرامپت «معنیِ «»» ناممکن است)
  const eligible = new Map<WordDrillKind, WordFamily[]>();
  for (const kind of WORD_DRILL_KINDS) {
    eligible.set(
      kind,
      families.filter((f) => {
        if (f.fa === "" || anchorOf(f, kind) === "") return false;
        return kind === "fa" ? true : cellOf(f, kind) !== "";
      }),
    );
  }

  const used = new Set<WordFamily>();
  const questions: DrillQuestion[] = [];
  for (let i = 0; i < n; i++) {
    const kind = WORD_DRILL_KINDS[i % WORD_DRILL_KINDS.length];
    // ترجیحِ خانوادهٔ بیکاربرد؛ استخرِ تهیشده اجازهٔ بازاستفاده میدهد
    const pool = eligible.get(kind)!;
    const fresh = pool.filter((f) => !used.has(f));
    const pickable = fresh.length > 0 ? fresh : pool;
    const f = shuffled(pickable, rng)[0];
    used.add(f);

    const correct = cellOf(f, kind);
    const anchor = anchorOf(f, kind);
    const column = families.map((x) => cellOf(x, kind)).filter((v) => v !== "");
    // لنگر هم از استخرِ حواسپرتی بیرون میماند — چیپِ پرسش نباید گزینه باشد
    const distractorPool = Array.from(new Set(column)).filter(
      (v) => v !== correct && v !== anchor,
    );
    const distractors = shuffled(distractorPool, rng).slice(0, 3);
    const options = shuffled([correct, ...distractors], rng);
    questions.push({
      base: anchor || correct, // کلیدِ یکتا برایِ بازخوانی؛ صادق در هر حال
      fa: f.fa,
      kind,
      prompt: promptFor(f, kind, anchor),
      options,
      answer: options.indexOf(correct),
      speak: anchor || undefined,
    });
  }
  return { questions, size: n };
}
