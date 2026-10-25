// ---------------------------------------------------------------------
// r412 — «دریلها واردِ استور میشوند» — پیشرفتِ ماندگارِ بانکهایِ تمرین.
//
// از r400 تا r411 هفت بانکِ تمرینِ ضمیمه رویِ یک نمایِ مشترک زندگی
// میکردند ولی «هیچ چیزی به استورِ یادگیری نمینوشتند» — حکمِ r400:
// ماندگاری پسِ طراحیِ میدانِ SyncField. آن طراحی از R-1 موجود است و
// هر فیلدِ بعدی (libraryDone، starredWords) یک ردیف شد؛ این ماژول
// همان قرارداد است برایِ دریلها: یک رکوردِ کوچکِ به‌ازایِ هر بانک.
//
// قراردادهایِ حکم:
//  · «جلسهٔ کامل» شمرده میشود؛ مرورِ اشتباهها (r401) زیرِجلسهٔ همان
//    سؤالهاست و هرگز دوبارهشماری نمیشود — سرصفحهٔ صادقِ r401 پابرجاست.
//  · رکورد: {sessions, correct, total, bestPercent, lastDay} —
//    bestPercent از percentِ مالکِ §10 R-4 (نه گردِ محلیِ تازه).
//  · کلید = شناسهٔ بانک (spec.id) — الگویِ سختِ حروفِ کوچک/خطِ تیره؛
//    سقفِ ۲۴ بانک (هفت بانکِ فعلی + جا برایِ رشدهایِ آینده).
//  · sanitize/merge عینِ قراردادِ جدولِ SyncField — خالص، امن رویِ
//    هر JSON؛ ادغامِ ابری «بیشترینِ» هر شمارنده است (قراردادِ
//    round-tripِ R-1: merge(a, cloud(a)) === a — جمع رانش میسازد).
// ---------------------------------------------------------------------

import { percent } from "@/lib/domain/percent";

export interface DrillStat {
  /** تعدادِ جلسههایِ کاملِ ثبتشده (مرورِ اشتباهها شمرده نمیشود) */
  sessions: number;
  /** مجموعِ پاسخهایِ درستِ جلسههایِ کامل */
  correct: number;
  /** مجموعِ سؤالهایِ جلسههایِ کامل (مخرجِ درصدِ عمر) */
  total: number;
  /** بهترین درصدِ جلسه (۰..۱۰۰) — percentِ مالک */
  bestPercent: number;
  /** روزِ آخرین جلسهٔ کامل — کلیدِ ISOِ محلیِ اپ */
  lastDay: string;
}

export type DrillStatMap = Record<string, DrillStat>;

/** شناسهٔ بانک: حروفِ کوچک/خطِ تیره، ۲..۲۴ نویسه — هر ۷ بانکِ فعلی میگذرد */
export const DRILL_BANK_KEY_RE = /^[a-z][a-z-]{1,23}$/;

/** حداکثرِ بانکهایِ نگهداریشده (هفتِ فعلی + رشد) — نخستینهایِ درج میمانند */
export const DRILL_STAT_CAP = 24;

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const clampInt = (v: unknown, max: number): number =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(0, Math.round(v)))
    : 0;

/** sanitizeِ یک رکوردِ بانک — رکوردِ تهی/ناسازگار انداخته میشود */
function sanitizeStat(raw: unknown): DrillStat | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const sessions = clampInt(r["sessions"], 99_999);
  const correct = clampInt(r["correct"], 999_999);
  const total = clampInt(r["total"], 999_999);
  const bestPercent = clampInt(r["bestPercent"], 100);
  const lastDay =
    typeof r["lastDay"] === "string" && DAY_KEY_RE.test(r["lastDay"]) ? r["lastDay"] : "";
  // رکوردِ بیجلسه یا ناسازگار (درستِ بیشتر از کل) واقعی نیست — میافتد
  if (sessions === 0 || total === 0 || correct > total) return null;
  return { sessions, correct, total, bestPercent, lastDay };
}

/** sanitizeِ کلِ نقشه — کلیدِ بیقرارداد میافتد؛ سقفِ ۲۴ (نخستینهایِ درج میمانند) */
export function sanitizeDrillStats(v: unknown): DrillStatMap {
  const out: DrillStatMap = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!DRILL_BANK_KEY_RE.test(k)) continue;
    const s = sanitizeStat(raw);
    if (!s) continue;
    out[k] = s;
    if (Object.keys(out).length >= DRILL_STAT_CAP) break;
  }
  return out;
}

/**
 * ادغامِ ابری — سیاستِ «بیشترینِ» هر شمارنده (ایدئومِ جدول: history/dayStat/
 * wordMistakes همه maxاند). جمعِ دو دستگاه رانشِ round-trip میسازد —
 * قراردادِ سختِ R-1: merge(a, cloud(a)) === a (تستِ persist-schema قفلش
 * کرده). maxِ درست/کل هرگز ناسازگار نمیشود (هر دو سمت c ≤ t دارند).
 */
export function mergeDrillStats(
  l: DrillStatMap | undefined,
  r: DrillStatMap | undefined,
): DrillStatMap {
  const out: DrillStatMap = { ...(l ?? {}) };
  for (const [k, rs] of Object.entries(r ?? {})) {
    const ls = out[k];
    if (!ls) {
      out[k] = rs;
      continue;
    }
    out[k] = {
      sessions: Math.max(ls.sessions, rs.sessions),
      correct: Math.max(ls.correct, rs.correct),
      total: Math.max(ls.total, rs.total),
      bestPercent: Math.max(ls.bestPercent, rs.bestPercent),
      lastDay: (ls.lastDay || "") >= (rs.lastDay || "") ? ls.lastDay : rs.lastDay,
    };
  }
  return out;
}

/**
 * ثبتِ یک جلسهٔ کامل — خالص؛ ورودیِ نامعتبر (شناسه/نمره) نقشه را
 * دستنخورده برمیگرداند (گاردهایِ صادق — نه sessonِ ساختگی).
 */
export function recordDrillResult(
  map: DrillStatMap,
  bankId: string,
  correct: number,
  total: number,
  day: string,
): DrillStatMap {
  if (!DRILL_BANK_KEY_RE.test(bankId)) return map;
  if (!Number.isInteger(total) || total < 1 || total > 999) return map;
  if (!Number.isInteger(correct) || correct < 0 || correct > total) return map;
  if (!DAY_KEY_RE.test(day)) return map;
  const prev = map[bankId];
  const sessionPercent = percent(correct, total);
  const next: DrillStat = {
    sessions: Math.min(99_999, (prev?.sessions ?? 0) + 1),
    correct: Math.min(999_999, (prev?.correct ?? 0) + correct),
    total: Math.min(999_999, (prev?.total ?? 0) + total),
    bestPercent: Math.max(prev?.bestPercent ?? 0, sessionPercent),
    lastDay: !prev || day >= (prev.lastDay || "") ? day : prev.lastDay,
  };
  return { ...map, [bankId]: next };
}
