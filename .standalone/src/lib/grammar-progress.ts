// ---------------------------------------------------------------------
// متروی گرامر — قراردادهای خالص پیشرفت (Task 39 / مرحلهٔ ۱)
// هیچ وابستگی به React/Store ندارد؛ استور و تست‌ها همین توابع را صدا
// می‌زنند تا «وضعیت نقشه» همیشه از یک منطق واحد بیاید.
//
// منبع پیشرفت = results map موجود در استور (همان نقشهٔ نتایج آزمون‌ها،
// هم‌گام با بک‌آپ/سینک ابری). کلید ایستگاه: "g:<stationId>"،
// کلید آزمون شناخت خط: "g:probe:l<lineId>".
// ---------------------------------------------------------------------

import type { QuizQuestion } from "@/lib/study-types";
import { lessons } from "@/data";
import { percent } from "@/lib/domain/percent";
import { GRAMMAR_LINES, type GrammarLine, type GrammarStation } from "@/data/grammar-map";

/** آستانهٔ تسلط — ایستگاه سبز می‌شود (قابل تنظیم در فازهای بعد) */
export const GRAMMAR_GREEN = 80;

/** حداقل تعداد سؤال آزمونک ایستگاه (اگر سؤال اختصاصی کم بود، از استخر درس پر می‌شود) */
export const STATION_QUIZ_MIN = 4;

/** تعداد سؤال «آزمون شناخت» هر خط */
export const PROBE_LENGTH = 5;

/** کوچک‌ترین برشِ موردنیاز از نقشهٔ نتایج استور */
export type PercentMap = Record<string, { percent: number }>;

export const stationKey = (stationId: string): string => `g:${stationId}`;
export const probeKey = (lineId: number): string => `g:probe:l${lineId}`;

/** بهترین درصد ثبت‌شده برای یک کلید (null = هنوز تلاشی نشده) */
export function bestPercent(results: PercentMap, key: string): number | null {
  const r = results[key];
  return r && typeof r.percent === "number" ? r.percent : null;
}

export type StationStatus = "green" | "open" | "locked";

/**
 * وضعیت ایستگاه با ایندکس idx در خط: ایستگاه اولِ خط همیشه باز است؛
 * ایستگاه‌های بعدی فقط با سبز شدن قبلی. سبز = best ≥ GRAMMAR_GREEN.
 */
export function stationStatus(
  line: GrammarLine,
  idx: number,
  results: PercentMap
): StationStatus {
  const station = line.stations[idx];
  if (!station) return "locked";
  const best = bestPercent(results, stationKey(station.id));
  if (best !== null && best >= GRAMMAR_GREEN) return "green";
  if (idx === 0) return "open";
  const prev = line.stations[idx - 1];
  const prevBest = bestPercent(results, stationKey(prev.id));
  return prevBest !== null && prevBest >= GRAMMAR_GREEN ? "open" : "locked";
}

/** تعداد ایستگاه‌های سبز خط و درصد کل */
export function lineStats(
  line: GrammarLine,
  results: PercentMap
): { green: number; total: number; percent: number } {
  const green = line.stations.filter(
    (s) => (bestPercent(results, stationKey(s.id)) ?? 0) >= GRAMMAR_GREEN
  ).length;
  const total = line.stations.length;
  return { green, total, percent: percent(green, total) };
}

/** جمع کل نقشه (همهٔ خط‌ها) */
export function mapSummary(results: PercentMap): {
  green: number;
  total: number;
  percent: number;
} {
  let green = 0;
  let total = 0;
  for (const line of GRAMMAR_LINES) {
    const s = lineStats(line, results);
    green += s.green;
    total += s.total;
  }
  return { green, total, percent: percent(green, total) };
}

// ---------------- استخر سؤال‌ها ----------------

/** سؤال‌های گرامر یک درس از بانک کتاب (category === "grammar") — راند ۱۹۸: شش‌پایه */
export function lessonGrammarPool(lesson: GrammarStation["lesson"]): QuizQuestion[] {
  const data = lessons[lesson - 1];
  return data ? data.quizzes.filter((q) => q.category === "grammar") : [];
}

/**
 * سؤال‌های آزمونک یک ایستگاه: اول سؤال‌های ترجیحی (به همان ترتیب)؛
 * اگر کمتر از STATION_QUIZ_MIN شد، بدون تکرار از استخر گرامرِ همان درس
 * پر می‌شود. هرگز سؤال تکراری برنمی‌گرداند و هرگز خطا نمی‌دهد.
 */
export function stationQuestions(station: GrammarStation): QuizQuestion[] {
  const pool = lessonGrammarPool(station.lesson);
  const byId = new Map(pool.map((q) => [q.id, q]));
  const picked: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (const id of station.quizIds) {
    const q = byId.get(id);
    if (q && !seen.has(q.id)) {
      picked.push(q);
      seen.add(q.id);
    }
  }
  for (const q of pool) {
    if (picked.length >= Math.max(STATION_QUIZ_MIN, station.quizIds.length)) break;
    if (!seen.has(q.id)) {
      picked.push(q);
      seen.add(q.id);
    }
  }
  return picked;
}

/** استخر آزمون شناخت خط: یکتاسازی سؤال‌های گرامرِ همهٔ درس‌های آن خط */
export function lineProbePool(line: GrammarLine): QuizQuestion[] {
  const seen = new Set<string>();
  const pool: QuizQuestion[] = [];
  for (const station of line.stations) {
    for (const q of lessonGrammarPool(station.lesson)) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        pool.push(q);
      }
    }
  }
  return pool;
}

/** هش سادهٔ رشته‌ای برای seed نمونه‌گیری قطعی (FNV-1a) */
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * نمونه‌گیری قطعی n عضو با seed (LCG + برگ‌زنی جزئی) — همان ورودی،
 * همان خروجی؛ آزمون شناختِ یک روز معین برای همه ثابت است.
 */
export function seededPicks<T>(arr: readonly T[], n: number, seed: string): T[] {
  if (arr.length <= n) return [...arr];
  let state = hashStr(seed) || 1;
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const copy = [...arr];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rand() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** پنج سؤال «آزمون شناخت» خط — با کلید روز قطعی می‌شود */
export function lineProbe(line: GrammarLine, dayKey: string): QuizQuestion[] {
  return seededPicks(lineProbePool(line), PROBE_LENGTH, `${dayKey}:line${line.id}`);
}

/** پیشنهاد مسیر بعد از آزمون شناخت — پیام فارسی کوتاه و صادقانه */
export function probeRecommendation(
  line: GrammarLine,
  percent: number,
  results: PercentMap
): string {
  if (percent >= GRAMMAR_GREEN) {
    const firstNonGreen = line.stations.findIndex(
      (s) => (bestPercent(results, stationKey(s.id)) ?? 0) < GRAMMAR_GREEN
    );
    if (firstNonGreen === -1) return "این خط را کامل سبز کرده‌ای — وقت گواهی‌گرفتن است!";
    return "مسیر باز است — مستقیم برو سراغ ایستگاه‌های سبزنشدهٔ همین خط.";
  }
  if (percent >= 50) {
    return "پایه‌ات خوب است — از اولین ایستگاه سبزنشده شروع کن و سریع رد شو.";
  }
  return "از ایستگاه اول شروع کن؛ هر ایستگاه یک درس ۹۰ثانیه‌ای دارد — با خیال راحت برو.";
}
