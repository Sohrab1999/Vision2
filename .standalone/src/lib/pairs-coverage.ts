// ------------------------------------------------------------------
// «حسابِ جفت‌ها» (Task 208) — پوششِ ردیف‌های جفتِ جزوه از نگاهِ یادگیرنده.
//
// جزوه ۴۷۷ ردیفِ مترادف/متضاد دارد (۲۹۸ مترادف + ۱۷۹ متضاد — همان
// TOTAL_PAIRSِ lesson-meta). این ماژول همان ردیف‌ها را با سیگنال‌های
// واقعیِ استور گروگذاری می‌کند تا گزارشِ رسمی بتواند بگوید یادگیرنده
// چند ردیف را «دیده» و چند ردیف را «کامل» می‌شناسد:
//
//   • دیده‌شده (seen): دست‌کم یکی از دو سرِ ردیف در استور زندگی می‌کند —
//     بلد باشد، ستاره‌خورده باشد، یا در آزمون‌ها/دیکه دیده شده باشد
//     (wordSeen > 0). هیچ سیگنالِ ساختگی نیست — فقط همین سه چشمه.
//   • کامل (knownBoth): هر دو سرِ ردیف در نقشهٔ «بلدم» هستند — قوی‌ترین
//     پیمانِ داده‌محور برای «این جفت را می‌شناسم».
//   • نیمه (knownOne): دقیقاً یک سر بلد است — دامنهٔ طبیعیِ «گام بعدی».
//
// خالص است — هیچ import از store/React. کلیدها همیشه با قراردادِ رسمی
// wordKey («lessonId:en-lowercase») ساخته می‌شوند؛ همتای ردیف با
// نمایهٔ معکوسِ واژگان (normalize → همهٔ کلیدهای درسیِ آن واژه) حل
// می‌شود تا جفت‌های دودرسیِ آینه‌ای هم درست خوانده شوند. ورودیِ خراب
// (تهی/نشدنی) صفرِ صادق می‌دهد، هرگز throw نمی‌کند.
// ------------------------------------------------------------------

import type { LessonData } from "./study-types";

export interface PairsCoverageLesson {
  lessonId: number;
  titleFa: string;
  /** ردیف‌های جزوهٔ همین درس (synonyms + antonyms) */
  rows: number;
  /** ردیف‌هایی که دست‌کم یک سرشان در استور زندگی می‌کند */
  seen: number;
  /** ردیف‌هایی که هر دو سرشان «بلدم» است */
  knownBoth: number;
}

export interface PairsCoverage {
  /** جمعِ ردیف‌های جزوه — پینِ داده: ۴۷۷ */
  total: number;
  seen: number;
  knownBoth: number;
  knownOne: number;
  perLesson: PairsCoverageLesson[];
}

/** سیگنال‌های واقعیِ یادگیرنده — همه از استورِ خانه */
export interface PairsCoverageSignals {
  known: Record<string, boolean>;
  starred: readonly string[];
  /** F7 — شمارِ دیده‌شدنِ هر واژه در آزمون‌ها/دیکه */
  wordSeen: Record<string, number>;
}

const norm = (en: string) => en.trim().toLowerCase();

/** نمایهٔ معکوسِ واژگان: normalize(en) → همهٔ کلیدهای رسمیِ آن واژه */
function buildVocabKeyLookup(lessons: LessonData[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const lesson of lessons) {
    for (const w of lesson.vocabulary ?? []) {
      const n = norm(w.en);
      if (!n) continue;
      const key = `${lesson.id}:${n}`;
      const list = map.get(n);
      if (list) {
        if (!list.includes(key)) list.push(key);
      } else {
        map.set(n, [key]);
      }
    }
  }
  return map;
}

/**
 * حسابِ جفت‌ها — برای هر ردیفِ جزوه دو سر را با سیگنال‌های استور می‌سنجد.
 * سرِ سرِردیف و سرِ همتا هر دو با نمایهٔ معکوس حل می‌شوند (جفت‌های
 * بین‌درسی مثل accept(L3) ↔ refuse(L4) از هر دو سو درست می‌خوانند)؛
 * واژهٔ بیرون‌ازواژگان (نباید رخ دهد) با کلیدِ مستقیمِ همان درس فالبک می‌شود.
 */
export function buildPairsCoverage(
  lessons: LessonData[],
  signals: PairsCoverageSignals
): PairsCoverage {
  const vocabKeys = buildVocabKeyLookup(lessons);
  const starredSet = new Set(signals.starred ?? []);
  const known = signals.known ?? {};
  const wordSeen = signals.wordSeen ?? {};

  const keysOf = (en: string, lessonId: number): string[] => {
    const n = norm(en);
    const found = vocabKeys.get(n);
    if (found && found.length > 0) return found;
    return n ? [`${lessonId}:${n}`] : [];
  };

  const isKnown = (keys: string[]) => keys.some((k) => known[k] === true);
  const isSeen = (keys: string[]) =>
    keys.some((k) => known[k] === true || starredSet.has(k) || (wordSeen[k] ?? 0) > 0);

  const perLesson: PairsCoverageLesson[] = [];
  let total = 0;
  let seen = 0;
  let knownBoth = 0;
  let knownOne = 0;

  for (const lesson of lessons) {
    const stat: PairsCoverageLesson = {
      lessonId: lesson.id,
      titleFa: lesson.titleFa,
      rows: 0,
      seen: 0,
      knownBoth: 0,
    };
    for (const row of lesson.synonyms ?? []) {
      stat.rows++;
      const head = keysOf(row.en, lesson.id);
      const mate = keysOf(row.syn, lesson.id);
      const hk = isKnown(head);
      const mk = isKnown(mate);
      if (isSeen(head) || isSeen(mate)) stat.seen++;
      if (hk && mk) stat.knownBoth++;
      else if (hk !== mk) knownOne++;
    }
    for (const row of lesson.antonyms ?? []) {
      stat.rows++;
      const head = keysOf(row.en, lesson.id);
      const mate = keysOf(row.ant, lesson.id);
      const hk = isKnown(head);
      const mk = isKnown(mate);
      if (isSeen(head) || isSeen(mate)) stat.seen++;
      if (hk && mk) stat.knownBoth++;
      else if (hk !== mk) knownOne++;
    }
    total += stat.rows;
    seen += stat.seen;
    knownBoth += stat.knownBoth;
    perLesson.push(stat);
  }

  return { total, seen, knownBoth, knownOne, perLesson };
}
