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
// r414 — «SRSِ دریل»: حلقه بسته شد — پاسخِ درستِ پایهٔ خطادار شمارندهٔ
// ok را بالا میبرد (recordDrillCorrects — فقط ردیفِ موجود؛ بانکِ خطا
// هرگز از پاسخِ درست ردیف نمیسازد) و سیاستِ سررسید از همین دو شمارنده
// درمیآید: تسلط = ok ≥ wrong (حقها به خطاها رسید)؛ سررسید = بیِتسلط
// و lastDay < امروز (اشتباهِ روزِ پیشین، هنوز تسلطنیافته). ردیفِ
// مسلطدهنده در بانک میماند (حذف با max-merge سازگار نیست) ولی از
// مجموعهٔ سررسیدها بیرون است — چیپِ سررسید صادقانه فقط بیِتسلطها را میشمارد.
//
// r416 — «فاصلهگذاریِ پیشروندهٔ سررسید»: درِ r414 هر روزِ پسِ خطا، روزِ
// سررسید بود — حتی برایِ ردیفی که همین امروز حقِ تازه گرفته بود. از
// این راند، پاسخِ درستِ آخرین رخداد (lastOkDay ≥ lastDay) به ردیف یک
// دورهٔ نفس میدهد: فاصلهٔ پیشروندهٔ بر پایهٔ شمارِ حقها — نردبانِ
// دوبرابرشوندهٔ ۱→۲→۴→۸ (سقفِ هشت). خطایِ تازه دورهٔ نفس را باطل میکند
// (آخرین رخداد اشتباه = فردایِ اشتباه، رفتارِ r414). ok=0 (بارِ کهنهٔ
// r413) فاصلهای ندارد — رفتارِ کهنه دستنخورده.
//
// r417 — «شفافیتِ ریتم»: صفرِ صادقِ چیپِ زمردی حالا خودش صحبت میکند —
// ردیفی که درنفس است از صف غایب ولی از دید هم نیست: drillGraceRows
// هر ردیفِ بیِتسلطِ برخوردار از نفس (آخرین رخداد حق، فاصله هنوز نگذشته)
// با روزِ بازگشتِ برنامهایاش برمیگرداند؛ چیپِ آسمانیِ نما «N مورد در
// دورهٔ نفس — نزدیک‌ترین بازگشت: فردا/X روزِ دیگر» را فقط با عددِ
// بزرگتر از صفر بالا میآورد (r236). تعریف با isDrillMistakeDue ناسازگار
// نیست — هر ردیفِ بیِتسلط با روزِ معتبر یا سررسید است یا درنفس، هرگز
// هر دو (قفلِ همپوشانیِ صفر). ردیفِ اشتباهشدهٔ امروزِ بیحق نه سررسید
// است (همانروزِ r414) نه درنفس (حقی نگرفته) — چیپِ آسمانی ادعایِ
// بیپشتوانه نمیسازد.
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
//    merge(a, cloud(a)) === a — جمع رانش میسازد). فیلدهایِ ok/lastOkDay
//    اختیاریِ بارِ کهنهاند: غیابشان صفر/تهی است (سازگاریِ پسرو با r413).
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
  /** r414 — شمارشِ پاسخهایِ درستِ پسِ خطا — حلقهٔ تسلط (ok ≥ wrong = مسلط) */
  ok: number;
  /** روزِ آخرین رخدادِ نادرست — کلیدِ ISOِ محلیِ اپ */
  lastDay: string;
  /** r414 — روزِ آخرین پاسخِ درستِ ثبتشده */
  lastOkDay: string;
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

/** r416 — سقفِ دورهٔ نفس: هرچند حقِ تازه، بیش از هشت روز انتظار نمیخرد */
export const DRILL_DUE_GRACE_CAP = 8;

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

/**
 * r416 — جابهجاییِ کلیدِ روز به اندازهٔ n روز — خالص و قطعی (ظهرِ UTC،
 * بیِ لبهٔ DST). کلیدِ بیقرارداد دستنخورده برمیگردد (صداکننده گارد دارد).
 */
function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map((v) => Number(v));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return key;
  return new Date(Date.UTC(y, m - 1, d, 12) + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * r416 — فاصلهٔ پیشروندهٔ سررسید بر پایهٔ شمارِ حقها: نردبانِ دوبرابرشونده
 * ۱→۲→۴→۸ و در سقف میماند. ok=0 فاصلهای ندارد (رفتارِ r414 برایِ بارِ کهنه).
 */
export const drillDueGraceDays = (ok: number): number =>
  ok <= 0 ? 0 : Math.min(2 ** (ok - 1), DRILL_DUE_GRACE_CAP);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** کلیدِ پایهٔ پرسش: رشتهٔ ۱..۸۰ نویسه (واک، نشانه، فعل، جملهٔ کوتاه…) */
export const isDrillMistakeBase = (v: unknown): v is string =>
  typeof v === "string" && v.length >= 1 && v.length <= DRILL_MISTAKE_BASE_MAX;

function sanitizeEntry(raw: unknown): DrillMistakeEntry | null {
  if (!isPlainObject(raw)) return null;
  const r = raw["wrong"];
  const d = raw["lastDay"];
  const o = raw["ok"];
  const od = raw["lastOkDay"];
  const wrong =
    typeof r === "number" && Number.isFinite(r)
      ? Math.min(DRILL_MISTAKE_WRONG_CAP, Math.max(0, Math.round(r)))
      : 0;
  const ok =
    typeof o === "number" && Number.isFinite(o)
      ? Math.min(DRILL_MISTAKE_WRONG_CAP, Math.max(0, Math.round(o)))
      : 0; // بارِ کهنهٔ r413 — فیلدِ غایب صفرِ صادق است
  const lastDay = typeof d === "string" && DAY_KEY_RE.test(d) ? d : "";
  const lastOkDay = typeof od === "string" && DAY_KEY_RE.test(od) ? od : "";
  if (wrong === 0) return null; // رکوردِ بیخطا واقعی نیست — میافتد
  return { wrong, ok, lastDay, lastOkDay };
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
          ok: Math.max(le.ok, re.ok),
          lastDay: le.lastDay >= re.lastDay ? le.lastDay : re.lastDay,
          lastOkDay: le.lastOkDay >= re.lastOkDay ? le.lastOkDay : re.lastOkDay,
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
        ...prev,
        ok: prev.ok ?? 0,
        lastOkDay: prev.lastOkDay ?? "",
        wrong: Math.min(DRILL_MISTAKE_WRONG_CAP, prev.wrong + 1),
        lastDay: day >= prev.lastDay ? day : prev.lastDay,
      };
      changed = true;
    } else if (Object.keys(nextBank).length < DRILL_MISTAKE_BASE_CAP) {
      nextBank[base] = { wrong: 1, ok: 0, lastDay: day, lastOkDay: "" };
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

/**
 * ثبتِ پاسخهایِ درستِ یک جلسهٔ کامل — نیمهٔ دیگرِ حلقهٔ r414. فقط ردیفِ
 * موجود ok میگیرد: بانکِ خطا هرگز از پاسخِ درست ردیف نمیسازد (پایهٔ
 * بیخطا ریسک نیست). ورودیِ نامعتبر/بیاثر همان مرجع — گاردهایِ صادقِ
 * همسانِ recordDrillMistakes؛ سقفِ ok همان سقفِ wrong.
 */
export function recordDrillCorrects(
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
  if (!prevBank) return map; // بانکِ غایب: پاسخِ درستِ پایهٔ بیخطا هیچ — ردیفی ساخته نمیشود
  const nextBank: DrillMistakeBank = { ...prevBank };
  let changed = false;
  for (const base of hits) {
    const prev = nextBank[base];
    if (!prev) continue; // پایهٔ بیخطا — پاسخِ درستش ریسک نمیآفریند
    const ok = Math.min(DRILL_MISTAKE_WRONG_CAP, prev.ok + 1);
    const lastOkDay = day >= (prev.lastOkDay || "") ? day : prev.lastOkDay;
    if (ok === prev.ok && lastOkDay === prev.lastOkDay) continue; // سقفِ نشسته + همان روز
    nextBank[base] = { ...prev, ok, lastOkDay };
    changed = true;
  }
  if (!changed) return map; // هیچ رکوردی عوض نشد — همان مرجع (گاردِ صادق)
  return { ...map, [bankId]: nextBank };
}

/** تسلط (r414): حقها به خطاها رسیدهاند — ردیف میماند ولی سررسید نیست */
export const isDrillMistakeMastered = (e: DrillMistakeEntry): boolean => e.ok >= e.wrong;

/**
 * سررسید (r414 + نفسِ r416): بیِتسلط و اشتباهش روزی پیشتر از امروز بوده —
 * ردیفی که همین امروز اشتباه شده امروز دوباره پرسیده نمیشود (همان روز
 * نباید دوباره سرِ همان آمد)؛ روزِ تهیِ بارِ مسموم هم سررسید شمرده میشود
 * (ردیفِ ثبتشدهیِ بیروز — محتاطترین خوانش).
 *
 * r416 — اگر آخرین رخدادِ ردیف پاسخِ درست بوده (lastOkDay ≥ lastDay)،
 * فاصلهٔ پیشرونده از همان روزِ حق میشمارد: نردبانِ ۱→۲→۴→۸ روز — حقِ
 * تازه، نفسِ تازه. خطایِ تازهتر از آخرین حق، دورهٔ نفس را باطل میکند
 * (فردایِ اشتباه سررسید — رفتارِ r414). ok=0 فاصلهای ندارد.
 */
export const isDrillMistakeDue = (e: DrillMistakeEntry, today: string): boolean => {
  if (isDrillMistakeMastered(e)) return false;
  if (!e.lastDay) return true; // ردیفِ بیروز — محتاطترین خوانش (r414)
  if (e.lastDay >= today) return false; // اشتباهِ امروز — همان روز دوباره نه
  if (e.lastOkDay && e.lastOkDay >= e.lastDay && DAY_KEY_RE.test(e.lastOkDay)) {
    return today >= shiftDayKey(e.lastOkDay, drillDueGraceDays(e.ok));
  }
  return true; // آخرین رخداد اشتباه — فردایِ اشتباه سررسید (رفتارِ r414)
};

/**
 * فهرستِ پایههایِ سررسید به ترتیبِ اولویتِ صادق: بیشترینِ خطا نخست
 * (ریسکِ سنگینتر زودتر)، هموزنها از کهنهترین اشتباه (طولانیترین منتظر).
 * ورودی = بانکِ همان بانک (نه کلِ نقشه) — مرجعِ پایدار برایِ memoِ نما.
 */
export function drillDueBases(bank: DrillMistakeBank | undefined, today: string): string[] {
  return Object.entries(bank ?? {})
    .filter(([, e]) => isDrillMistakeDue(e, today))
    .sort((a, b) => b[1].wrong - a[1].wrong || (a[1].lastDay || "").localeCompare(b[1].lastDay || ""))
    .map(([base]) => base);
}

/** شمارشِ سررسیدها — بانکِ غایب = صفرِ صادق (چیپ فقط با عددِ بزرگتر از صفر) */
export function countDrillDue(bank: DrillMistakeBank | undefined, today: string): number {
  return drillDueBases(bank, today).length;
}

// ---------------------------------------------------------------------
// r417 — «شفافیتِ ریتم» — نیمهٔ پیدایِ دورهٔ نفس. چیپِ زمردی (r414) فقط
// سررسیدهایِ امروز را میشمارد؛ ردیفِ درنفس از آن غایب است — و یادگیرنده
// حق دارد بداند ردیفِ دیروزاش کجاست. تعریفِ خالص: ردیفِ بیِتسلط که
// آخرین رخدادش پاسخِ درستِ واجدِ فاصله است (lastOkDay ≥ lastDay، ok > 0،
// grace > 0) و امروز هنوز به روزِ بازگشت نرسیده. روزِ بازگشت =
// lastOkDay + graceDays — همان حکمی که isDrillMistakeDue برایِ «نه
// سررسید» میخواند؛ اینجا فقط روزِ آن گفته میشود.
// ---------------------------------------------------------------------

/** تفاوتِ روزِ تقویمیِ دو کلیدِ ISO — خالص (ظهرِ UTC). کلیدِ بیقرارداد = صفر */
export function drillDaysBetween(from: string, to: string): number {
  if (!DAY_KEY_RE.test(from) || !DAY_KEY_RE.test(to)) return 0;
  const [fy, fm, fd] = from.split("-").map((v) => Number(v));
  const [ty, tm, td] = to.split("-").map((v) => Number(v));
  return Math.round((Date.UTC(ty, tm - 1, td, 12) - Date.UTC(fy, fm - 1, fd, 12)) / DAY_MS);
}

/**
 * روزِ بازگشتِ برنامهایِ ردیف — تهی یعنی «درنفس نیست» (سررسید، مسلط،
 * اشتباهِ امروزِ بیحق، یا بارِ مسمومِ بیروز). همسایهٔ مستقیمِ شاخهٔ
 * نفسِ isDrillMistakeDue — روزِ همان نردبان، بیِ سیاستِ تازه.
 */
export function drillGraceNextDueDay(e: DrillMistakeEntry, today: string): string | null {
  if (isDrillMistakeMastered(e)) return null; // تسلط — درِ بسته، بازگشتی در کار نیست
  if (!e.lastDay) return null; // ردیفِ بیروزِ مسموم — سررسیدِ محتاط، نه نشسته
  if (e.lastOkDay && e.lastOkDay >= e.lastDay && DAY_KEY_RE.test(e.lastOkDay) && e.ok > 0) {
    const next = shiftDayKey(e.lastOkDay, drillDueGraceDays(e.ok));
    if (today < next) return next; // فاصله هنوز نگذشته — ردیف درنفس است
  }
  return null; // بلاحقِ نفس یا حقِ بیفاصله — سررسید (فردایِ اشتباه)
}

/** ردیفِ درنفس — با روزِ بازگشت و شمارِ روزهایِ مانده تا آن (۱ = فردا) */
export interface DrillGraceRow {
  base: string;
  nextDueDay: string;
  daysUntil: number;
}

/**
 * فهرستِ ردیفهایِ درنفس به ترتیبِ نزدیکترین بازگشت (نخستین عضو = نزدیکترین) —
 * بانکِ غایب = فهرستِ تهیِ صادق. قراردادِ همپوشانیِ صفر: هیچ عضوِ این
 * فهرست در drillDueBases نیست و برعکس (قفلِ تست).
 */
export function drillGraceRows(bank: DrillMistakeBank | undefined, today: string): DrillGraceRow[] {
  return Object.entries(bank ?? {})
    .map(([base, e]) => {
      const nextDueDay = drillGraceNextDueDay(e, today);
      return nextDueDay ? { base, nextDueDay, daysUntil: drillDaysBetween(today, nextDueDay) } : null;
    })
    .filter((r): r is DrillGraceRow => r !== null)
    .sort((a, b) => a.nextDueDay.localeCompare(b.nextDueDay));
}

/** شمارشِ ردیفهایِ درنفس — بانکِ غایب = صفرِ صادق (چیپِ آسمانی فقط با عددِ بزرگتر از صفر) */
export function countDrillGrace(bank: DrillMistakeBank | undefined, today: string): number {
  return drillGraceRows(bank, today).length;
}

/** خلاصهٔ چیپِ آسمانی: شمار + روزهایِ مانده تا نزدیکترین بازگشت (تهی = چیپ ندارد) */
export function drillGraceSummary(
  bank: DrillMistakeBank | undefined,
  today: string,
): { count: number; nearestDays: number | null } {
  const rows = drillGraceRows(bank, today);
  return { count: rows.length, nearestDays: rows.length ? rows[0].daysUntil : null };
}
