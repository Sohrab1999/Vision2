// ---------------------------------------------------------------------
// r413 — «بانکِ خطایِ ماندگارِ دریلها» — نقشهٔ ریسکِ سطحِ پایه، عینِ
// ایدئومِ wordMistakes/wordSeen برایِ بانکهایِ تمرین.
//
// از r401 «مرورِ اشتباهها» بانکِ خطایِ موضعیِ جلسه بود — با پایانِ
// جلسه میمُرد. r412 پیشرفتِ ماندگارِ بانکها را به استور آورد و
// پیشنهادِ ثبتشدهٔ همان راند این نقطه بود: خطاها هم ماندگار شوند،
// با کلیدِ «بانک + پایهٔ پرسش» (شناسهٔ بانک + baseِ DrillQuestion —
// واحدِ ریسک واژه/فعل/واک است، نه گونهٔ پرسش؛ «go» در هر گونه که
// اشتباه شود، همین یک ردیف پررنگتر میشود).
//
// قراردادهایِ حکم:
//  · هر رخدادِ نادرست/بیپاسخ یک واحد — dedup با صداکننده است (نما
//    همهٔ پایههایِ نادرستِ جلسه را به ترتیب میفرستد؛ دو پرسشِ نادرست
//    رویِ یک پایه = ۲+. شمارشِ صادقِ رخداد، نه شمارشِ ساختگی).
//  · ردیفِ خطا هرگز حذف نمیشود (ادغامِ ابریِ «بیشترین» با حذف سازگار
//    نیست — حذفِ محلی، رستاخیزِ ابری میزاید؛ همان حکمِ wordMistakes).
//    چیپِ نما میگوید «ثبتشده» — ادعایِ «باز/حلشده» ندارد.
//  · sanitize/merge عینِ قراردادِ جدولِ SyncField — خالص، امن رویِ هر
//    JSON؛ ادغامِ ابری بیشترینِ هر شمارنده (قراردادِ round-tripِ R-1:
//    merge(a, cloud(a)) === a — جمع رانش میسازد).
//  · سقفها: ۲۴ بانک (عینِ drillStats)، ۴۰۰ پایه به‌ازایِ هر بانک،
//    ۸۰ نویسه برایِ کلیدِ پایه (واکهایِ IPA و نشانههایِ اختصاری هم
//    جا میشوند) — نخستینهایِ درج میمانند (ایدئومِ drill-stats).
//  · رکوردِ wrong=0 خطا نیست — میافتد (صداقتِ r222: خانهٔ تهی هیچ
//    گزینه/پاسخ/پرسشی نیست، اینجا هم هیچ رکوردی نیست).
// ---------------------------------------------------------------------

import { DRILL_BANK_KEY_RE } from "./drill-stats";

export interface DrillMistakeEntry {
  /** شمارشِ عمرِ رخدادهایِ نادرست/بیپاسخ رویِ این پایه — هرگز کم نمیشود */
  wrong: number;
  /** روزِ آخرین رخداد — کلیدِ ISOِ محلیِ اپ */
  lastDay: string;
}

/** کلیدِ درونی = baseِ DrillQuestion (فعل/واژه/واک/نشانه/…) */
export type DrillMistakeBank = Record<string, DrillMistakeEntry>;

/** کلیدِ بیرونی = شناسهٔ بانک (spec.id — همان الگویِ سختِ drillStats) */
export type DrillMistakeMap = Record<string, DrillMistakeBank>;

/** سقفِ نویسههایِ کلیدِ پایه — بلندترینِ بانکها (جملههایِ درسنامه) هم میگذرند */
export const DRILL_MISTAKE_BASE_MAX = 80;

/** حداکثرِ بانکهایِ نگهداریشده — همسانِ DRILL_STAT_CAP */
export const DRILL_MISTAKE_BANK_CAP = 24;

/** حداکثرِ پایههایِ خطادار به‌ازایِ هر بانک — شیرِ اطمینان، نه سهمیه */
export const DRILL_MISTAKE_BASE_CAP = 400;

export const DRILL_MISTAKE_WRONG_CAP = 9999;

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** کلیدِ پایهٔ پرسش: رشتهٔ ۱..۸۰ نویسه (واک، نشانه، فعل، جملهٔ کوتاه…) */
export const isDrillMistakeBase = (v: unknown): v is string =>
  typeof v === "string" && v.length >= 1 && v.length <= DRILL_MISTAKE_BASE_MAX;

function sanitizeEntry(raw: unknown): DrillMistakeEntry | null {
  if (!isPlainObject(raw)) return null;
  const r = raw["wrong"];
  const d = raw["lastDay"];
  const wrong =
    typeof r === "number" && Number.isFinite(r)
      ? Math.min(DRILL_MISTAKE_WRONG_CAP, Math.max(0, Math.round(r)))
      : 0;
  const lastDay = typeof d === "string" && DAY_KEY_RE.test(d) ? d : "";
  if (wrong === 0) return null; // رکوردِ بیخطا واقعی نیست — میافتد
  return { wrong, lastDay };
}

/** sanitizeِ کلِ نقشه — بانکِ بیقرارداد/پایهٔ بیقرارداد/رکوردِ تهی میافتد */
export function sanitizeDrillMistakes(v: unknown): DrillMistakeMap {
  const out: DrillMistakeMap = {};
  if (!isPlainObject(v)) return out;
  for (const [bankId, rawBank] of Object.entries(v)) {
    if (!DRILL_BANK_KEY_RE.test(bankId) || !isPlainObject(rawBank)) continue;
    const bank: DrillMistakeBank = {};
    for (const [base, rawEntry] of Object.entries(rawBank)) {
      if (!isDrillMistakeBase(base)) continue;
      const e = sanitizeEntry(rawEntry);
      if (!e) continue;
      bank[base] = e;
      if (Object.keys(bank).length >= DRILL_MISTAKE_BASE_CAP) break;
    }
    if (Object.keys(bank).length === 0) continue; // بانکِ تهی رکورد نیست
    out[bankId] = bank;
    if (Object.keys(out).length >= DRILL_MISTAKE_BANK_CAP) break;
  }
  return out;
}

/**
 * ادغامِ ابری — بیشترینِ هر شمارنده (ایدئومِ wordMistakes/drillStats).
 * unionِ بانکها و پایهها؛ maxِ wrong و maxِ روز — round-tripِ R-1 پابرجا.
 */
export function mergeDrillMistakes(
  l: DrillMistakeMap | undefined,
  r: DrillMistakeMap | undefined,
): DrillMistakeMap {
  const out: DrillMistakeMap = {};
  for (const bankId of new Set([...Object.keys(l ?? {}), ...Object.keys(r ?? {})])) {
    const lb = l?.[bankId];
    const rb = r?.[bankId];
    const bank: DrillMistakeBank = {};
    for (const base of new Set([...Object.keys(lb ?? {}), ...Object.keys(rb ?? {})])) {
      const le = lb?.[base];
      const re = rb?.[base];
      if (le && re) {
        bank[base] = {
          wrong: Math.max(le.wrong, re.wrong),
          lastDay: le.lastDay >= re.lastDay ? le.lastDay : re.lastDay,
        };
      } else {
        bank[base] = { ...(le ?? re!) };
      }
    }
    out[bankId] = bank;
  }
  return out;
}

/**
 * ثبتِ رخدادهایِ نادرستِ یک جلسهٔ کامل — خالص. هر عضوِ bases یک واحدِ
 * wrong میگیرد (بدونِ dedup — سیاستِ شمارش با صداکننده). ورودیِ نامعتبر
 * (بانک/روز/تهیِ پسِ پالایش) نقشه را همان‌طورِ همان‌مرجع برمیگرداند
 * (گاردهایِ صادق — نه رکوردِ ساختگی). سقفها: بانکِ بیستوپنجم و پایهٔ
 * چهارصدویکمِ هر بانک پذیرفته نمیشوند (شیرِ اطمینانِ صادق).
 */
export function recordDrillMistakes(
  map: DrillMistakeMap,
  bankId: string,
  bases: readonly string[],
  day: string,
): DrillMistakeMap {
  if (!DRILL_BANK_KEY_RE.test(bankId)) return map;
  if (!DAY_KEY_RE.test(day)) return map;
  const hits = bases.filter((b) => isDrillMistakeBase(b));
  if (hits.length === 0) return map;
  const prevBank = map[bankId];
  if (!prevBank && Object.keys(map).length >= DRILL_MISTAKE_BANK_CAP) return map;
  const nextBank: DrillMistakeBank = { ...(prevBank ?? {}) };
  let changed = false;
  for (const base of hits) {
    const prev = nextBank[base];
    if (prev) {
      nextBank[base] = {
        wrong: Math.min(DRILL_MISTAKE_WRONG_CAP, prev.wrong + 1),
        lastDay: day >= prev.lastDay ? day : prev.lastDay,
      };
      changed = true;
    } else if (Object.keys(nextBank).length < DRILL_MISTAKE_BASE_CAP) {
      nextBank[base] = { wrong: 1, lastDay: day };
      changed = true;
    }
    // سقفِ ۴۰۰ پر و پایهٔ نو — میافتد (شیرِ اطمینانِ صادق، نه برشِ خاموش)
  }
  if (!changed) return map; // هیچ رکوردی عوض نشد — همان مرجع (گاردِ صادق)
  return { ...map, [bankId]: nextBank };
}

/** شمارشِ پایههایِ خطادارِ یک بانک — بانکِ غایب = صفرِ صادق */
export function countDrillMistakes(map: DrillMistakeMap, bankId: string): number {
  const bank = map[bankId];
  return bank ? Object.keys(bank).length : 0;
}
