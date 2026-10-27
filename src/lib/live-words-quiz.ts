// ------------------------------------------------------------------
// راند ۲۵۷ — «دریل واژه‌های زنده»: کلوزِ جمله‌های واقعیِ جزوه از دلِ
// لنزِ «کاربرددار» (بندِ ① پیشنهادِ ۲۵۴-۲۵۶ — الگویِ دریلِ جفت‌ها).
//
// هر سؤال یک جملهٔ واقعیِ خودِ جزوه است که واژهٔ زندهٔ آن جاخالی
// شده؛ گزینه‌ها واژه‌های واقعیِ واژگان‌اند — نه جمله‌ای ساخته، نه
// تعریفی بیرونی (مأموریتِ «استخراجِ دقیق»). ترتیبِ سؤال‌ها =
// کاربردِ بیشتر اول (همان سیمِ مرتب‌سازیِ r256 — sites.length از
// findWordUsages) تا learner با پرکاربردترین واژه‌های جزوه گرم شود.
//
// راند ۲۶۱ — «منبعِ سومِ سؤال» (بندِ ① پیشنهادِ ۲۶۰): دریلِ مثال‌هایِ
// درسنامهٔ جامع. پیکرهٔ مکالمه/ریدینگ منبعِ متنِ نمایه‌شده است و
// درسنامه نیست (کشفِ r259: واژه‌هایِ «حاضر در نثر ولی بی‌سایت»)؛
// ولی درسنامهٔ جامع ۲۰۵ مثالِ ساختاریافته دارد (BgExample — en/fa
// خودِ جزوه، بدونِ استخراجِ جمله از HTML). buildGrammarExampleQuiz
// همان قراردادِ کلوز را رویِ این مثال‌ها می‌سازد: نامزدها واژه‌های
// یکتای واژگان که در حداقل یک مثال زندگی می‌کنند، نزولیِ پایدارِ
// شمارشِ کاربردِ پیکره (همان سیمِ r256)، نخستین مثالِ ترتیبِ خودِ
// جزوه، ترجمه = فارسیِ خودِ مثال، note = منبعِ موضوع. id با پیشوندِ
// lg- تا هرگز با سؤال‌هایِ lw- پیکره برخورد نکند.
//
// قراردادِ ضدِ-درز (هم‌الگویِ دریلِ جفت‌ها):
//   · سؤالِ مغشوش نمی‌سازیم — واژهٔ جاافتاده اگر کمتر از ۳
//     حواس‌پرتِ سالم داشته باشد، از دریل حذف می‌شود (skip صادقانه).
//   · حواس‌پرتِ سالم = واژه‌ای که هیچ فرمِ مجازش در همان جمله
//     زندگی نمی‌کند (wordFormRegex — مرزِ واژه + پسوندهایِ مجاز)؛
//     وگرنه دو گزینه «پیدا شدنی» می‌شدند و سؤال مبهم.
//   · جاخالی فقط فرم‌هایِ تطبیق‌یافتهٔ خودِ واژه را می‌پوشاند
//     (highlightParts — همان معناشناسیِ چیپ‌ها)، بقیهٔ جمله دست‌نخورده.
//
// خالص است — هیچ import از store/React؛ خروجی QuizQuestion استاندارد
// تا با completeQuizRun/QuizEngine بی‌ترکور ادغام شود (دستهٔ
// «livewords»/«gramdrill»، بانکِ اشتباهات).
// ------------------------------------------------------------------

import type { LessonData, QuizCategory, QuizQuestion } from "./study-types";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { findWordUsages, highlightParts, wordFormRegex } from "./word-usage";

/** سقفِ سؤالِ یک دورِ دریل — هم‌خانوادهٔ دریل جفت‌ها */
export const LIVE_DRILL_CAP = 8;

/** سقفِ سؤالِ دریلِ مثال‌هایِ درسنامه — همان خانوادهٔ ۸تایی (r261) */
export const GRAMMAR_DRILL_CAP = 8;

/** راند ۲۶۵ — آستانه‌هایِ «حداقل کاربرد» دریلِ مثال‌هایِ درسنامه —
 * همان سه‌تاییِ آستانه‌هایِ لنزِ دیکشنری (MIN_USED_THRESHOLDSِ r258)؛
 * پیش‌سنجهٔ r265: ۱۵۹/۹۵/۴۱ نامزد — هر سه بالاتر از سقفِ ۸، پس هر سه
 * چیپ زنده می‌مانند و هیچ‌کدام دریلِ خالی نمی‌سازد. */
export const GRAM_DRILL_THRESHOLDS = [5, 10, 20];

/** نشانِ جاخالی — در متنِ انگلیسیِ LTR چهار زیرخطِ پیوسته */
export const LIVE_BLANK = "____";

/** نام‌گذاریِ یکتا — dedupِ هم‌نام‌ها پیش از ساخت، پس id برخورد ندارد */
const liveIdOf = (en: string): string => `lw-${en.toLowerCase().replace(/\s+/g, "-")}`;

/** نام‌گذاریِ دریلِ مثال‌هایِ درسنامه — پیشوندِ lg- جدا از lw- پیکره (r261) */
const gramIdOf = (en: string): string => `lg-${en.toLowerCase().replace(/\s+/g, "-")}`;

/** ورودیِ سازندهٔ مشترک کلوز — جمله و هویتِ سؤال از بیرون می‌آید */
interface ClozeSource {
  id: string;
  category: QuizCategory;
  /** جملهٔ واقعیِ جزوه که واژه در آن زندگی می‌کند */
  sentence: string;
  /** ترجمهٔ فارسیِ خودِ جزوه — فقط پس از پاسخ رندر می‌شود */
  fa: string;
  /** نشانِ منبع (مکالمه/ریدینگ یا موضوعِ درسنامه) */
  note: string;
  /** واژهٔ درستِ جاخالی */
  en: string;
  /** استخرِ حواس‌پرت از واژه‌هایِ واقعیِ همان دامنه */
  pool: string[];
}

/** گزینهٔ درست + ۳ حواس‌پرتِ سالم از استخرِ همان دامنه — وگرنه null */
function buildClozeFrom(src: ClozeSource): QuizQuestion | null {
  const parts = highlightParts(src.sentence, src.en);
  if (!parts.some((p) => p.hit)) return null;
  // حواس‌پرتِ سالم: هیچ فرمِ مجازش در جملهٔ نمایش‌داده‌شده زندگی نمی‌کند
  const distractors = [
    ...new Set(
      src.pool.filter(
        (d) => d.toLowerCase() !== src.en.toLowerCase() && !wordFormRegex(d).test(src.sentence)
      )
    ),
  ].slice(0, 3);
  if (distractors.length < 3) return null; // استخرِ کمتر از ۴ → سؤالِ مبهم نمی‌سازیم
  const options = [...distractors];
  // بُر زدنِ گزینه‌ها — هم‌الگویِ دریل جفت‌ها؛ پاسخ بعد از چینش پیدا می‌شود
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  const correctAt = Math.floor(Math.random() * (options.length + 1));
  options.splice(correctAt, 0, src.en);
  return {
    id: src.id,
    category: src.category,
    question: parts.map((p) => (p.hit ? LIVE_BLANK : p.text)).join(""),
    options,
    answer: correctAt,
    translation: src.fa,
    note: src.note,
    // راند ۲۶۹ — واژهٔ اصلیِ سؤال رویِ خودِ سؤال زندگی می‌کند (مسیرِ
    // مستقیم، نه بازگشتیِ id) — کارتِ نتیجه از آن «ترکیبِ سطحِ راند» را
    // می‌سازد و هر مصرف‌کنندهٔ آینده هم همان را می‌خواند.
    word: src.en,
  };
}

/** سؤالِ پیکره‌ای — نخستین سایتِ مکالمه/ریدینگِ واژه (منبعِ یک و دو) */
function buildClozeQuestion(en: string, distractorPool: string[]): QuizQuestion | null {
  const site = findWordUsages(en)[0];
  if (!site) return null;
  return buildClozeFrom({
    id: liveIdOf(en),
    category: "livewords",
    sentence: site.en,
    fa: site.fa,
    note: `${site.kind === "reading" ? "ریدینگ" : "مکالمه"} — ${site.titleFa}`,
    en,
    pool: distractorPool,
  });
}

/**
 * نامزدهایِ دریل واژه‌های زنده — سیمِ واحدِ r272 (ایدئومِ
 * grammarExampleCandidatesِ r265): هم سازندهٔ سؤال و هم شمارندهٔ
 * «از N نامزد» نوارِ دریل از همین تابع می‌خوانند (یعنی شمارنده هیچ‌وقت
 * با دریلِ ساخته‌شده از همان دامنه دوقلو-عدد نمی‌شود). نامزدها:
 * واژه‌های کاربرددارِ دامنه (دسته‌بندیِ هم‌نام‌ها به یک نامزد — ددوپِ
 * بین‌درسی) به ترتیبِ نزولیِ پایدارِ شمارشِ کاربرد — هم‌شمارها ترتیبِ
 * واژگانِ جزوه را نگه می‌دارند. minCount: آستانهٔ «حداقل کاربرد»ِ لنز
 * (راند ۲۵۸) — مرزِ شمول: count >= max(1, minCount)؛ این دریل ذاتاً
 * پیکره‌ای است و صفر همیشه بیرون می‌ماند (برخلافِ مثال‌هایِ درسنامه).
 */
export function liveWordsCandidates(
  scope: LessonData[],
  minCount = 0
): { en: string; count: number }[] {
  const seen = new Set<string>();
  const candidates: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count >= Math.max(1, minCount)) candidates.push({ en: w.en, count });
    }
  }
  // مرتب‌سازیِ نزولیِ پایدار — هم‌شمارها ترتیبِ واژگانِ جزوه را نگه می‌دارند
  candidates.sort((a, b) => b.count - a.count);
  return candidates;
}

/**
 * دریل واژه‌های زندهٔ یک دامنه — با فیلترِ درس فقط همان درس، بی‌فیلتر
 * همهٔ درس‌ها. نامزدها از سیمِ واحدِ liveWordsCandidates (r272)؛ خروجی
 * تا cap؛ واژه‌های بدونِ سؤالِ سالم، صادقانه حذف می‌شوند.
 */
export function buildLiveWordsQuiz(scope: LessonData[], cap = LIVE_DRILL_CAP, minCount = 0): QuizQuestion[] {
  const candidates = liveWordsCandidates(scope, minCount);
  const pool = candidates.map((c) => c.en);
  const questions: QuizQuestion[] = [];
  for (const c of candidates) {
    if (questions.length >= cap) break;
    const q = buildClozeQuestion(c.en, pool);
    if (q) questions.push(q);
  }
  return questions;
}

// ------------------------------------------------------------------
// راند ۲۶۱ — منبعِ سومِ سؤال: مثال‌هایِ ساختاریافتهٔ درسنامهٔ جامع.
// فهرستِ تخت در سطحِ ماژول یک بار ساخته می‌شود (دادهٔ ایستا — همان
// الگویِ کشِ ماژولِ word-usage)؛ هر مثال عنوانِ موضوعِ خودش را برای
// نشانِ منبع حمل می‌کند.
// ------------------------------------------------------------------

const BG_EXAMPLES: { en: string; fa: string; title: string }[] = BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
  (t.examples ?? []).map((ex) => ({ en: ex.en, fa: ex.fa, title: t.title }))
);

/**
 * نامزدهایِ دریلِ مثال‌هایِ درسنامه — سیمِ واحدِ r265: هم سازندهٔ سؤال
 * و هم شمارندهٔ چیپ‌هایِ آستانه از همین تابع می‌خوانند (یعنی چیپِ «N+ · M»
 * هیچ‌وقت با دریلِ ساخته‌شده از همان آستانه دوقلو-عدد نمی‌شود — درسِ
 * راندِ ۲۵۸ در مقیاسِ دریل). نامزدها: واژه‌هایِ یکتای واژگانِ دامنه
 * که در حداقل یک مثالِ ساختاریافته زندگی می‌کنند (wordFormRegex —
 * همان معناشناسیِ هفت سطحِ چیپ‌ها)، نزولیِ پایدارِ شمارشِ کاربردِ
 * پیکره — هم‌شمارها ترتیبِ واژگانِ جزوه را نگه می‌دارند. minCount:
 * آستانهٔ «حداقل کاربرد» — دامنهٔ باریک‌ترِ همان سیم (مرزِ شمولِ دقیق:
 * count >= t). آستانهٔ ۰ = دامنهٔ کامل — شاملِ واژه‌هایِ بی‌سایتِ
 * پیکره (count=۰) که حقِ سؤالِ r259 دارند؛ برخلافِ buildLiveWordsQuiz
 * که ذاتاً پیکره‌ای است و صفر همیشه بیرون می‌ماند.
 */
export function grammarExampleCandidates(
  scope: LessonData[],
  minCount = 0
): { en: string; count: number }[] {
  const seen = new Set<string>();
  const candidates: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      if (!BG_EXAMPLES.some((ex) => wordFormRegex(w.en).test(ex.en))) continue;
      const count = findWordUsages(w.en).length;
      // راند ۲۶۵ — آستانه فقط وقتی فعال است اعمال می‌شود؛ آستانهٔ ۰ =
      // دامنهٔ کاملِ r261 شاملِ واژه‌هایِ بی‌سایت (حقِ سؤالِ r259)
      if (minCount > 0 && count < minCount) continue;
      candidates.push({ en: w.en, count });
    }
  }
  // مرتب‌سازیِ نزولیِ پایدار — هم‌شمارها ترتیبِ واژگانِ جزوه را نگه می‌دارند
  candidates.sort((a, b) => b.count - a.count);
  return candidates;
}

/**
 * دریل مثال‌های درسنامهٔ جامع — کلوزِ جمله‌هایِ مثالِ خودِ جزوه‌های
 * جامع (منبعِ سومِ سؤال — بندِ ① پیشنهادِ ۲۶۰). نامزدها از سیمِ واحدِ
 * grammarExampleCandidates (r265 — با آستانه‌ی اختیاریِ minCount)؛
 * جمله = نخستین مثالِ ترتیبِ خودِ جزوه، ترجمه = فارسیِ خودِ مثال،
 * note = موضوعِ مبدأ. خروجی تا cap؛ واژه‌های بدونِ سؤالِ سالم،
 * صادقانه حذف می‌شوند. واژه‌هایِ بی‌سایتِ پیکره هم حقِ سؤال دارند —
 * مثالِ درسنامه خودش جای زندگیِ واژه است (کشفِ r259).
 */
export function buildGrammarExampleQuiz(
  scope: LessonData[],
  cap = GRAMMAR_DRILL_CAP,
  minCount = 0
): QuizQuestion[] {
  const candidates = grammarExampleCandidates(scope, minCount);
  const pool = candidates.map((c) => c.en);
  const questions: QuizQuestion[] = [];
  for (const c of candidates) {
    if (questions.length >= cap) break;
    const ex = BG_EXAMPLES.find((e) => wordFormRegex(c.en).test(e.en));
    if (!ex) continue;
    const q = buildClozeFrom({
      id: gramIdOf(c.en),
      category: "gramdrill",
      sentence: ex.en,
      fa: ex.fa,
      note: `درسنامهٔ جامع — ${ex.title}`,
      en: c.en,
      pool,
    });
    if (q) questions.push(q);
  }
  return questions;
}
