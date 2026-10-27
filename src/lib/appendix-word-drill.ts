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
  pickDueFirst,
  pickDueOnly,
  DRILL_DUE_QUOTA,
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
  /** r414 — پایههایِ سررسید به ترتیبِ اولویت — سهمیه نزدِ همین موتور اعمال میشود */
  due?: readonly string[],
  /** r415 — «تمرینِ سررسیدها»: جلسهٔ فقط از سررسیدهایِ حاضر در بانک؛
   *  پایهٔ پرسشِ خانواده در هر گونه لنگر یا خانهٔ هدف است (مالکیتِ r403) —
   *  فیلترِ سررسید هم با همین نگاشتِ وابستهبهگونه انجام میشود */
  dueOnly?: boolean,
): DrillSession {
  const families = tables.flatMap((t) => t.families);
  if (families.length === 0) return { questions: [], size: 0 };
  // r414 — صفِ سررسیدِ مشترکِ جلسه: سهمیه در ورود، ترتیبِ اولویت در مصرف؛
  // r415 — در حالتِ فقطسررسید صف بیسهمیه است
  const dueSet = dueOnly && due ? new Set(due) : null;
  const dueQueue = dueSet ? [...(due ?? [])] : (due ?? []).slice(0, DRILL_DUE_QUOTA);
  // r415 — طولِ جلسهٔ فقطسررسید بعد از واجدگان محاسبه میشود: شمارِ متمایزِ
  // پایههایِ سررسیدِ واقعاً پرسیدنی — یک ردیفِ سررسید یک پرسش میگیرد
  const dueBaseOf = (f: WordFamily, kind: WordDrillKind) => anchorOf(f, kind) || cellOf(f, kind);

  // خانوادههایِ واجدِ هر گونه — یکبارِ پیشمحاسبه (خالص: هیچ جهشی در داده)؛
  // گونهٔ fa هم به لنگرِ انگلیسی نیاز دارد (پرامپت «معنیِ «»» ناممکن است)
  const eligible = new Map<WordDrillKind, WordFamily[]>();
  for (const kind of WORD_DRILL_KINDS) {
    // r415 — واجدگان همیشه از بانکِ کامل؛ در حالتِ فقطسررسید فقط به خانوادههایی
    // که پایهٔ پرسشِ همین گونهشان سررسید است فیلتر میشود
    const full = families.filter((f) => {
      if (f.fa === "" || anchorOf(f, kind) === "") return false;
      return kind === "fa" ? true : cellOf(f, kind) !== "";
    });
    eligible.set(kind, dueSet ? full.filter((f) => dueSet.has(dueBaseOf(f, kind))) : full);
  }
  // r415 — طولِ جلسهٔ فقطسررسید = شمارِ متمایزِ پایههایِ سررسیدِ پرسیدنی
  const duePresent = dueSet
    ? new Set(
        WORD_DRILL_KINDS.flatMap((k) => eligible.get(k)!.map((f) => dueBaseOf(f, k))),
      ).size
    : families.length;
  const n = Math.min(Math.max(1, Math.floor(size)), duePresent);

  const used = new Set<WordFamily>();
  const questions: DrillQuestion[] = [];
  // r415 — در حالتِ فقطسررسید چرخشِ گونهها تا پرشدنِ جلسه بازمیگردد (سررسیدِ
  // واجدِ گونههایِ دیرترِ چرخش هم پرسیده میشود)؛ مسیرِ عادی بدونِ تغییر
  for (let i = 0; i < n * (dueSet ? WORD_DRILL_KINDS.length : 1) && questions.length < n; i++) {
    const kind = WORD_DRILL_KINDS[i % WORD_DRILL_KINDS.length];
    // ترجیحِ خانوادهٔ بیکاربرد؛ استخرِ تهیشده اجازهٔ بازاستفاده میدهد
    const pool = eligible.get(kind)!;
    const fresh = pool.filter((f) => !used.has(f));
    const pickable = fresh.length > 0 ? fresh : pool;
    // r404 — درسِ همکلاسِ دریلِ نشانهها: بانکِ غیروخالی ولی همهتهیِ یک گونه
    // نباید واژگون کند — گونهٔ بیپیشنهاد پرسیدنی نیست؛ جلسهٔ کوتاهترِ صادق
    if (pickable.length === 0) continue;
    // r414 — سررسید-نخست: پایهٔ پرسشِ خانواده در این گونه، لنگر یا خانهٔ هدف است — مالِ همین موتور
    // r415 — در حالتِ فقطسررسید گزینش سخت است: بی عضوِ صف، پرسشِ این اندیس رد میشود
    const f = dueSet
      ? pickDueOnly(pickable, (x) => anchorOf(x, kind) || cellOf(x, kind), dueQueue)
      : pickDueFirst(pickable, (x) => anchorOf(x, kind) || cellOf(x, kind), dueQueue, rng);
    if (!f) continue;
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
      faOptions: kind === "fa", // r406 — مالکیتِ جهت به موتور
    });
  }
  // r404 — size = شمارِ واقعیِ پرسشها (گونهٔ بیپیشنهاد جلسه را کوتاه میکند)
  return { questions, size: questions.length };
}
