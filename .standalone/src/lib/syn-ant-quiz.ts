// ------------------------------------------------------------------
// «مترادف و متضاد» (Task 202) — موتورِ خالصِ هشتمین تبِ درس.
//
// جدول‌های SYN/ANT جزوه‌ها (۳۰۹ مترادف + ۲۱۷ متضاد روی ۱۲ درس) از
// روزِ اول در LessonData بودند اما هیچ مصرف‌کننده‌ای نداشتند — دادهٔ
// مرده. این ماژول همان جدول‌ها را به دو خروجی تبدیل می‌کند:
//   ۱) شمارنده‌ها برای چیپ‌های تب (synAntCounts)
//   ۲) آزمونِ چهارگزینه‌ایِ استانداردِ خانه (buildSynAntQuiz → QuizQuestion[])
//      که با completeQuizRun/QuizEngine بی‌ترکور ادغام می‌شود
//      (resultKey «N:synant»، دستهٔ stats «synant»، بانکِ اشتباهات).
//
// خالص است — هیچ import از store/React؛ قراردادِ خانه برای سازندهٔ
// دستهٔ جدید: id namespaceدار (l{N}-syn{i}/l{N}-ant{i}) تا با l{N}-g*/k*/v*
// برخورد نکند، گزینه‌های یکتا، پاسخ در محدوده، and no cross-direction leak.
// ------------------------------------------------------------------

import type { LessonData, QuizQuestion } from "./study-types";

/** آستانهٔ ساختِ سؤال: کمتر از ۴ ردیفِ هم‌جهت، استخرِ گزینهٔ سالم نمی‌سازد */
export const SYN_QUIZ_MIN_POOL = 4;

/** سقفِ سؤالِ یک دورِ تمرین — هم‌خانوادهٔ «تست سریع» های درس */
export const SYN_QUIZ_CAP = 8;

export interface SynAntCounts {
  syn: number;
  ant: number;
}

/** شمارندهٔ ردیف‌های جدول برای چیپ‌های تب — هر درس SYN دارد؛ ANT اختیاری است */
export function synAntCounts(lesson: LessonData): SynAntCounts {
  return {
    syn: lesson.synonyms?.length ?? 0,
    ant: lesson.antonyms?.length ?? 0,
  };
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** یک سؤالِ چهارگزینه‌ای از یک ردیفِ جدول + استخرِ حواس‌پرتیِ هم‌جهت */
function buildQuestion(
  lessonId: number,
  kind: "syn" | "ant",
  rowIndex: number,
  en: string,
  correctPair: string,
  fa: string,
  distractorPool: string[]
): QuizQuestion | null {
  const distractors = [...new Set(distractorPool.filter((d) => d !== correctPair))].slice(0, 3);
  if (distractors.length < 3) return null; // استخرِ کمتر از ۴ → سؤالِ مغشوش نمی‌سازیم
  const options = shuffle([correctPair, ...distractors]);
  const answer = options.indexOf(correctPair);
  return {
    id: `l${lessonId}-${kind}${rowIndex}`,
    category: "synant",
    question:
      kind === "syn"
        ? `کدام واژه هم‌معنیِ «${en}» است؟`
        : `کدام واژه متضادِ «${en}» است؟`,
    options,
    answer,
    translation: fa,
  };
}

/**
 * آزمونِ مترادف/متضادِ یک درس — تا SYN_QUIZ_CAP سؤال، به‌تناسبِ دو جدول و
 * درهم. درسِ بی‌متضاد (۱ و ۲) فقط مترادف می‌دهد. هر سؤال از یک ردیفِ
 * واقعیِ جزوه می‌آید؛ گزینه‌های غلط از ردیف‌های دیگرِ همان درس و همان
 * جهت (هیچ مترادفی گزینهٔ سؤالِ متضاد نمی‌شود) — تشخیصِ جهت‌بازیِ
 * «آسان‌تر از فکر» بسته می‌ماند.
 */
export function buildSynAntQuiz(lesson: LessonData): QuizQuestion[] {
  const synRows = lesson.synonyms ?? [];
  const antRows = lesson.antonyms ?? [];
  const questions: QuizQuestion[] = [];

  const synWanted = antRows.length >= SYN_QUIZ_MIN_POOL
    ? Math.ceil(SYN_QUIZ_CAP / 2)
    : SYN_QUIZ_CAP;
  const antWanted = SYN_QUIZ_CAP - synWanted;

  if (synRows.length >= SYN_QUIZ_MIN_POOL) {
    const pool = synRows.map((r) => r.syn);
    const picked = shuffle(synRows.map((_, i) => i)).slice(0, Math.min(synWanted, synRows.length));
    for (const i of picked) {
      const row = synRows[i];
      const q = buildQuestion(lesson.id, "syn", i, row.en, row.syn, row.fa, pool);
      if (q) questions.push(q);
    }
  }
  if (antRows.length >= SYN_QUIZ_MIN_POOL) {
    const pool = antRows.map((r) => r.ant);
    const picked = shuffle(antRows.map((_, i) => i)).slice(0, Math.min(antWanted, antRows.length));
    for (const i of picked) {
      const row = antRows[i];
      const q = buildQuestion(lesson.id, "ant", i, row.en, row.ant, row.fa, pool);
      if (q) questions.push(q);
    }
  }
  return shuffle(questions);
}

/**
 * دریلِ جفت‌ها روی چند درس (راند ۲۰۷) — سؤال‌های چند درس را گردِروبین
 * می‌آمیزد تا سهمِ هر درس متعادل بماند. قراردادِ ضدِ-درز دست‌نخورده:
 * هر سؤال گزینه‌هایش را از استخرِ هم‌جهتِ درسِ خودش می‌گیرد (buildSynAntQuiz)،
 * پس ترکیبِ بین‌درسیِ سؤال‌ها درز نمی‌سازد. تکرارِ id (نمی‌باید باشد) حذف
 * و خروجی تا cap بریده می‌شود. منبع: لنزِ «جفت‌دار» دیکشنری — با فیلترِ
 * درس فقط همان درس، بی‌فیلتر همهٔ درس‌ها.
 */
export function buildPairsDrillQuiz(lessons: LessonData[], cap = SYN_QUIZ_CAP): QuizQuestion[] {
  const perLesson = lessons.map(buildSynAntQuiz);
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (let i = 0; out.length < cap && i < SYN_QUIZ_CAP; i++) {
    for (const qs of perLesson) {
      if (out.length >= cap) break;
      const q = qs[i];
      if (q && !seen.has(q.id)) {
        seen.add(q.id);
        out.push(q);
      }
    }
  }
  return shuffle(out);
}
