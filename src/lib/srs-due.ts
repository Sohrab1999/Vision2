// ------------------------------------------------------------------
// «سررسید الآن» preview — the SRS dashboard shows how many words are
// due; this lib answers the sharper question: WHICH words, so the
// panel can render tappable chips that jump straight into review.
//
// Pure + testable: the store map comes in, resolved word cards come
// out. Exam-bank keys ("q:") are excluded — vocabulary widgets must
// never count konkur questions (same contract as srsDueTotal). Keys
// whose word no longer exists in the book (dangling) are dropped
// silently via the shared resolveStar, so content updates never
// crash the preview — and every count this lib reports counts only
// words a learner can actually review, keeping the block self-
// consistent even when content shifts.
// ------------------------------------------------------------------

import type { SrsItem } from "@/lib/study-store";
import { resolveStar } from "@/lib/my-words-resolve";

export interface SrsDueWord {
  key: string; // canonical wordKey "1:ability"
  en: string;
  fa: string;
  dueAt: number; // epoch ms — how long overdue
  level: number; // 0..5 SRS level at the time it fell due
}

export interface SrsDueSummary {
  /** capped preview, oldest-due first (most neglected words lead) */
  words: SrsDueWord[];
  /** ALL resolvable due words (uncapped) — the honest count for the badge */
  dueTotal: number;
}

/**
 * Words whose SRS review is due right now + the uncapped resolvable
 * count. One pass over the store map; `limit` caps only the chip list.
 */
export function srsDueSummary(
  srs: Record<string, SrsItem>,
  now: number,
  limit = 5
): SrsDueSummary {
  const words: SrsDueWord[] = [];
  let dueTotal = 0;
  for (const [key, it] of Object.entries(srs)) {
    if (key.startsWith("q:")) continue; // exam-bank questions are not words
    if (!Number.isFinite(it?.dueAt) || it.dueAt > now) continue;
    const star = resolveStar(key);
    if (!star) continue; // vocabulary changed → silently drop
    dueTotal++;
    if (words.length < Math.max(0, limit)) {
      words.push({ key, en: star.en, fa: star.fa, dueAt: it.dueAt, level: it.level ?? 0 });
    }
  }
  words.sort((a, b) => a.dueAt - b.dueAt || a.key.localeCompare(b.key));
  return { words, dueTotal };
}

export interface SrsForecastSummary {
  /** capped preview, soonest-first (nearest reviews lead) */
  words: SrsDueWord[];
  /** ALL resolvable words landing in this day-window (uncapped) — the honest count */
  total: number;
}

// ------------------------------------------------------------------
// r370 «پیوندِ دو داشبورد» — وضعیتِ SRSِ یک واژهٔ مشخص.
// کارتِ «واژه‌های خطرناک من» هر ردیفش را از دیدِ چرخهٔ مرور هم حرف
// میزاند: کلیدِ خطر («1:ability») عینِ کلیدِ واژه در نقشهٔ srs است، پس
// پیوندِ دو داشبورد یک lookupِ مستقیم است — بدونِ هیچ نگاشتِ میانی.
// همان منطقِ دسته‌بندیِ داشبوردِ مرور (سررسید/یادگیری/مستحکم/وارفته)
// اما تک‌حالته: سررسید برِ هر سطحی مقدم است (زمان، مقدم برِ پله).
// ورودیِ خراب/ناقص = null (الگویِ Task 293) — رندرِ نداشتن، نه دروغ.
// ------------------------------------------------------------------

export type SrsWordState = "due" | "learning" | "strong" | "mastered";

export interface SrsWordStatus {
  state: SrsWordState;
  /** 0..5 — پلهٔ واقعی در نردبان (برچسبِ «سطح N از ۶» از همین +۱ ساخته میشود) */
  level: number;
  /** epoch ms — «سررسید» یعنی همین حالا ≤ now */
  dueAt: number;
}

/** مرزِ پلهها: ۰–۲ یادگیری، ۳–۴ مستحکم، ۵ وارفته — عینِ داشبوردِ مرور */
export function srsWordStatus(
  item: { level: number; dueAt: number } | null | undefined,
  now: number
): SrsWordStatus | null {
  if (!item) return null;
  if (typeof item.dueAt !== "number" || typeof item.level !== "number") return null;
  if (!Number.isFinite(item.dueAt) || !Number.isFinite(item.level)) return null;
  if (!Number.isInteger(item.level) || item.level < 0 || item.level > 5) return null;
  const state: SrsWordState =
    item.dueAt <= now
      ? "due"
      : item.level >= 5
        ? "mastered"
        : item.level >= 3
          ? "strong"
          : "learning";
  return { state, level: item.level, dueAt: item.dueAt };
}

// ------------------------------------------------------------------
// r371 «پرش به پنلِ همسایه» (بندِ ④ پیشنهادِ r370): چیپهایِ «در چرخه/
// سررسید» و چیپِ پلِ کارتِ خطرها واقعاً کلیک‌پذیر میشوند — نه دکمهٔ
// ساختگیِ مرور (کنشِ مرور با خودِ داشبورد است)، بلکه ناوبریِ صادق به
// همان‌جا که کنش زندگی میکند. عینِ ایدئومِ focusHeaderDoor (r243):
// کتابخانهٔ دامنه مالکِ پرش و نامِ رویداد است — پرنده فقط صدا میزند و
// منطقِ نمایش با مالکِ پنل است (srs-panel؛ تک‌نقطه‌ای، درسِ r244).
// ------------------------------------------------------------------

/** رویدادِ پالسِ گذرای داشبوردِ مرور — مالکِ نمایش: خودِ srs-panel */
export const SRS_PANEL_SPOTLIGHT_EVENT = "srs-panel-spotlight";

/**
 * پرشِ کارتِ خطرها به داشبوردِ مرورِ هوشمند: اسکرولِ نرم (با احترامِ
 * prefers-reduced-motion) + فوکوسِ برنامه‌ای + رویدادِ پالس.
 * پنل هست نیست (خانه با گیتِ hasProgress رندر میشود) = هیچ و false —
 * صداقتِ r236: هیچ کنشِ ساختگی. true = پنل پیدا شد و پرش انجام شد.
 */
export function focusSrsDashboard(): boolean {
  if (typeof document === "undefined") return false;
  const panel = document.getElementById("srs-dashboard");
  if (!panel) return false;
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  panel.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  panel.focus({ preventScroll: true });
  window.dispatchEvent(new CustomEvent(SRS_PANEL_SPOTLIGHT_EVENT));
  return true;
}

// ------------------------------------------------------------------
// r372 «داشبوردِ مرور در فرمان‌یاب» (بندِ ④ پیشنهادِ r371): پرنده‌ای که
// از دنیایِ دیگر میآید (فرمانِ پالت از درس/دیکشنری/…) نمیتواند زنده
// بپرد — پنل هنوز mount نشده و رویدادِ زنده در خلأ گم میشود (درسِ
// نشانگرِ ضمیمه، r246). عینِ ایدئومِ پرچمِ یک‌بارمصرفِ مُهرِدار همان‌جا:
// پرنده پرچم را میگذارد و ناوبری میکند؛ مالکِ نمایش (srs-panel) بعد
// از mount مصرفش میکند. رویِ خودِ خانه پنل سوار است — همان مسیرِ
// focusSrsDashboard زنده، بیپرچم.
// ------------------------------------------------------------------

let srsSpotlightAt = 0;

/** درخواستِ پرشِ از جایِ دیگر — قبل از ناوبری به خانه.
 * یک‌بارمصرف: مصرفکننده فقط پنلِ سوارشده؛ مهلتِ ۲ثانیهای تا درخواستِ
 * کهنه هرگز دیرتر پالسِ کاذب نسازد (قراردادِ requestAppendixPillHint). */
export function requestSrsSpotlight(): void {
  srsSpotlightAt = Date.now();
}

/** نگاهِ تازه‌بودنِ درخواستِ معلق — بدونِ مصرف (StrictMode دو-بارِ mount
 * میکند: نگاهِ خواندنیِ بدونِ عارضه از خوردهشدنِ پرچم در mountِ اول
 * جلوگیری میکند؛ اقرارِ جدا در تایمرِ زندهٔ نهایی است). */
export function peekSrsSpotlight(): boolean {
  return srsSpotlightAt !== 0 && Date.now() - srsSpotlightAt < 2000;
}

/** اقرارِ درخواستِ معلق — فقط در تایمرِ زندهای که واقعاً میپرد. */
export function ackSrsSpotlight(): void {
  srsSpotlightAt = 0;
}

/**
 * Words landing in the forecast day-window [now + offset*DAY, now + (offset+1)*DAY).
 * offset 0 = the NEXT 24h — the already-overdue words live in srsDueSummary,
 * never here. The window math mirrors the panel's floor((dueAt-now)/DAY)
 * bucketing, so an expanded row's count always matches its bar. Words-only
 * (no "q:"), dangling keys dropped via resolveStar — same self-consistency
 * contract as srsDueSummary.
 */
export function srsForecastWords(
  srs: Record<string, SrsItem>,
  now: number,
  offset: number,
  limit = 8
): SrsForecastSummary {
  const DAY = 86_400_000;
  const from = now + offset * DAY;
  const to = from + DAY;
  const words: SrsDueWord[] = [];
  let total = 0;
  for (const [key, it] of Object.entries(srs)) {
    if (key.startsWith("q:")) continue;
    if (!Number.isFinite(it?.dueAt)) continue;
    if (it.dueAt < from || it.dueAt >= to) continue;
    const star = resolveStar(key);
    if (!star) continue;
    total++;
    if (words.length < Math.max(0, limit)) {
      words.push({ key, en: star.en, fa: star.fa, dueAt: it.dueAt, level: it.level ?? 0 });
    }
  }
  words.sort((a, b) => a.dueAt - b.dueAt || a.key.localeCompare(b.key));
  return { words, total };
}
