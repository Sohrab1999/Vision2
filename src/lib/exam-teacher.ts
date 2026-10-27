// ------------------------------------------------------------------
// Task 117 «معلمِ کارنامه» — pure contract for the AI session review.
//
// The teacher judges a FINISHED quiz session. Same constrained economy
// as F8 explain and the story forge (Task 116):
//   • the client ships ONLY ids + raw chosen indices — question text,
//     options and the answer key stay server-side; correctness is
//     recomputed HERE from the bundled keys, so a tampered client can
//     never flatter the teacher into praising a failed session
//   • the review is cached per session fingerprint → every learner
//     finishing the same session pattern reads the same controlled text
//   • when the AI is unavailable the fallback is an honest review built
//     from the REAL digest — never a fabricated praise
//
// This module is UI-free and bank-free: it depends only on the domain
// percent helper, the static faNum digit map, and the plain shapes below
// (TeacherQuestionLike mirrors the QuizQuestion slice the route gets
// from explain-source without importing the content banks).
// ------------------------------------------------------------------

import { percent } from "@/lib/domain/percent";
import { faNum } from "@/lib/study-theme";

/** the QuizQuestion slice the teacher needs (route supplies real banks) */
export interface TeacherQuestionLike {
  id: string;
  category: string;
  question: string;
  options: string[];
  answer: number;
}

/** client-sent pair: question id + chosen index
 *  (null = unanswered, -1 = typed wrong with no option match — r403) */
export interface TeacherAnswer {
  id: string;
  ans: number | null;
}

/** the three documented sections of a teacher review */
export interface TeacherReview {
  intro: string;
  strength: string;
  advice: string;
}

/** one wrong question's prompt-safe detail */
export interface WrongDetail {
  /** question text, truncated to WRONG_TEXT_LIMIT */
  text: string;
  /** the option the learner picked (null = left unanswered OR typed-wrong) */
  chosen: string | null;
  /** r403 — the learner TYPED a wrong answer that matched no option
   *  (machine sentinel -1); answered + wrong, never «بی‌پاسخ» */
  typedWrong: boolean;
  /** the correct option text */
  correct: string;
  /** raw category key (route maps it to Persian via categoryFa) */
  category: string;
}

export interface SessionDigest {
  total: number;
  answered: number;
  unanswered: number;
  correct: number;
  wrong: number;
  /** domain percent — 0..100, zero denominator → 0 */
  percent: number;
  /** per-category accuracy in first-seen order */
  perCategory: { category: string; total: number; correct: number }[];
  /** wrong items with prompt detail, capped at WRONG_DETAIL_CAP */
  wrongDetail: WrongDetail[];
  /** wrong items beyond the cap — counted, never detailed */
  wrongExtra: number;
}

/** session size ceiling — matches the app's biggest run (the 40-item mixed exam) */
export const TEACHER_MAX_IDS = 40;
/** wrong items that get per-question detail in the prompt; the rest count only */
export const WRONG_DETAIL_CAP = 12;
/** question-text truncation inside the prompt */
export const WRONG_TEXT_LIMIT = 90;
/** section ceilings — hard caps applied after parsing */
export const INTRO_LIMIT = 400;
export const SECTION_LIMIT = 260;

/** Persian labels for the fallback's category mentions (values mirror
 *  categoryFa in explain-source — kept local to keep this module bank-free) */
const CAT_FA: Record<string, string> = {
  vocab: "واژگان",
  "vocab-konkuri": "واژگان کنکوری",
  grammar: "گرامر",
};

function catFa(c: string): string {
  return CAT_FA[c] ?? c;
}

/**
 * Cache fingerprint of a session: sorted id:answer pairs joined by "|".
 * Order-insensitive (the same questions in a different sequence is the
 * same session for the teacher) but sensitive to every answer change —
 * a different answer pattern is a different report worth its own text.
 */
export function reviewFingerprint(items: TeacherAnswer[]): string {
  return [...items]
    .map((it) => `${it.id}:${it.ans ?? "-"}`)
    .sort()
    .join("|");
}

/** out-of-range or non-integer answers degrade to "unanswered", never crash.
 *  r403 — the typed-wrong sentinel -1 (lib/typed-answer.ts) SURVIVES as its
 *  own state: the learner did answer (typed something wrong), so the digest
 *  must count it answered+wrong, not «بی‌پاسخ». Any other negative or an
 *  index ≥ options.length still degrades to null. */
export function normalizeAnswer(ans: number | null, q: TeacherQuestionLike): number | null {
  if (ans === -1) return -1;
  if (ans === null || !Number.isInteger(ans) || ans < 0 || ans >= q.options.length) return null;
  return ans;
}

/**
 * The honest digest of a resolved session — correctness is computed from
 * the bundled answer key, not from anything the client claimed.
 */
export function buildSessionDigest(
  resolved: { q: TeacherQuestionLike; ans: number | null }[]
): SessionDigest {
  const perCategory = new Map<string, { category: string; total: number; correct: number }>();
  const bump = (category: string, correct: boolean) => {
    const row = perCategory.get(category) ?? { category, total: 0, correct: 0 };
    row.total += 1;
    if (correct) row.correct += 1;
    perCategory.set(category, row);
  };

  let correct = 0;
  let answered = 0;
  const wrongDetail: WrongDetail[] = [];
  let wrongExtra = 0;

  for (const { q, ans: rawAns } of resolved) {
    const ans = normalizeAnswer(rawAns, q);
    const ok = ans !== null && ans === q.answer;
    if (ans !== null) answered += 1;
    if (ok) correct += 1;
    bump(q.category, ok);
    if (!ok) {
      if (wrongDetail.length < WRONG_DETAIL_CAP) {
        const text =
          q.question.length > WRONG_TEXT_LIMIT
            ? `${q.question.slice(0, WRONG_TEXT_LIMIT)}…`
            : q.question;
        wrongDetail.push({
          text,
          chosen: ans !== null && ans >= 0 ? (q.options[ans] ?? null) : null,
          typedWrong: ans === -1,
          correct: q.options[q.answer] ?? "",
          category: q.category,
        });
      } else {
        wrongExtra += 1;
      }
    }
  }

  const total = resolved.length;
  return {
    total,
    answered,
    unanswered: total - answered,
    correct,
    wrong: total - correct,
    percent: percent(correct, total),
    perCategory: [...perCategory.values()],
    wrongDetail,
    wrongExtra,
  };
}

/** strip markdown noise before parsing (same class of junk as explain) */
function stripMarkdown(raw: string): string {
  return raw.replace(/[*_`#>]/g, "");
}

function cap(text: string, limit: number): string {
  const t = text.trim();
  return t.length > limit ? t.slice(0, limit).trim() : t;
}

/**
 * Parse the documented three-section format:
 *   <one or two intro sentences>
 *   نقطهٔ قوت: <…>
 *   تمرینِ پیشنهادی: <…>
 * Both markers are mandatory and must appear in order; ZWNJ and plain
 * space variants are accepted. Anything else → null (garbage is never
 * cached or shown — the route falls back instead).
 */
export function parseReview(raw: string): TeacherReview | null {
  const text = stripMarkdown(raw);
  // «نقطهٔ» carries U+0654 (combining hamza) and «تمرینِ» U+0650 (kasra);
  // ZWNJ and plain-space separators are accepted too
  const strengthRe = /نقطه\u0654?(?:\u200c|\s)?قوت\s*:/;
  const adviceRe = /تمرین\u0650?(?:\u200c|\s)?پیشنهادی\s*:/;
  const strengthMatch = strengthRe.exec(text);
  const adviceMatch = adviceRe.exec(text);
  if (!strengthMatch || !adviceMatch) return null;
  if (strengthMatch.index >= adviceMatch.index) return null;

  const intro = cap(text.slice(0, strengthMatch.index), INTRO_LIMIT);
  const strength = cap(text.slice(strengthMatch.index + strengthMatch[0].length, adviceMatch.index), SECTION_LIMIT);
  const advice = cap(text.slice(adviceMatch.index + adviceMatch[0].length), SECTION_LIMIT);
  if (!intro || !strength || !advice) return null;
  return { intro, strength, advice };
}

/**
 * The offline teacher: an honest review composed from the REAL digest —
 * real counts, real best/worst skill, real unanswered honesty. Persian
 * digits via the shared faNum; deterministic for the same digest.
 */
export function fallbackReview(d: SessionDigest): TeacherReview {
  if (d.total === 0) {
    return {
      intro: "جلسه‌ای برای داوری نیست — هیچ سؤالی به معلم نرسید.",
      strength: "چیزی برای سنجش وجود نداشت؛ صادقانه‌ترین پاسخ همین است.",
      advice: `یک آزمون را کامل کن تا معلم بتواند کارنامه‌ات را بخواند.`,
    };
  }

  if (d.percent === 100 && d.unanswered === 0) {
    return {
      intro: `همهٔ ${faNum(d.total)} سؤال این جلسه درست بود — کارنامه‌ای بی‌لک، آفرین.`,
      strength: "تسلط کامل روی مهارت‌های این جلسه؛ پاسخ‌ها هم پایدار بودند هم مطمئن.",
      advice:
        "برای تثبیت، واژه‌های کلیدی همین جلسه را در «واژه‌های من» ستاره کن تا در مرور روزهای بعد زنده بمانند.",
    };
  }

  const ranked = [...d.perCategory].sort(
    (a, b) => b.correct / b.total - a.correct / a.total
  );
  const best = ranked.find((c) => c.correct > 0);
  // the weakest skill is the LAST qualifying row of the descending list
  // (the first one would just be the best skill that still had a miss)
  const worstCandidates = ranked.filter((c) => c.correct < c.total);
  const worst = worstCandidates[worstCandidates.length - 1];

  const unansweredPart =
    d.unanswered > 0 ? ` و ${faNum(d.unanswered)} سؤال بی‌پاسخ ماند` : "";
  const intro = `در این جلسه ${faNum(d.correct)} از ${faNum(d.total)} سؤال درست بود (${faNum(d.percent)}٪)${unansweredPart}.`;
  const strength = best
    ? `در «${catFa(best.category)}» بهترین عملکرد را داشتی — ${faNum(best.correct)} پاسخ درست از ${faNum(best.total)}.`
    : "هنوز هیچ مهارتی نمرهٔ قابل ذکری نگرفته — طبیعیِ مسیر یادگیری است، ادامه بده.";
  const adviceParts: string[] = [];
  if (worst) {
    adviceParts.push(`روی «${catFa(worst.category)}» تمرکز کن — فلش‌کارت‌های همان درس را مرور کن`);
    if (d.wrong > 0) adviceParts.push(`و ${faNum(d.wrong)} سؤالِ اشتباهِ همین جلسه را دوباره با گزینهٔ درست بخوان`);
  } else if (d.unanswered > 0) {
    adviceParts.push("به سؤال‌های بی‌پاسخ برگرد و حتی اشتباه حدس زدن به یادگیری کمک می‌کند");
  } else {
    adviceParts.push("برای تثبیت، واژه‌های کلیدی همین جلسه را در «واژه‌های من» ستاره کن");
  }
  return { intro, strength, advice: adviceParts.join(" ") + "." };
}
