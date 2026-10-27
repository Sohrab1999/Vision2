// ------------------------------------------------------------------
// r413 — «پوشش شش جزوه» در کارنامهٔ من.
//
// خواستهٔ مسیرِ بعدیِ r412: کارنامه باید نشان دهد هر یک از شش جزوهٔ
// کتابخانه (g7-g12) تا کجا پوشیده شده — با همان زبانِ «پوششِ» گوشهٔ
// کنکور، اما کتاب‌به‌کتاب. این ماژول عمداً خالص است (بدون fs، بدون
// React) تا vitest و کامپوننت هر دو از یک قرارداد بخوانند:
//   • نتایجِ تست‌بانک‌ها با کلیدِ `jozve-g{N}-l{M}` ثبت می‌شوند
//     (jozve-view / book-view — قراردادِ r400+)؛
//   • پس پوششِ هر پایه = شمارِ «بانکِ متمایزِ» دیده‌شده ÷ BOOK_BANK_COUNTS؛
//   • کلیدهایِ گرامر (`-gram-`/`-tgram-`/`-kgram-`) سِشنِ همان کتاب‌اند
//     اما در شمارندهٔ بانکِ تست نمی‌روند تا پوشش با بانکِ واقعی هم‌عدد بماند.
// ------------------------------------------------------------------

import { BOOK_BANK_COUNTS, BOOKS } from "@/lib/books";
import type { QuizResult } from "@/lib/study-types";

/** پوششِ یک جزوه — همهٔ اعداد برای نمایشِ مستقیم آماده‌اند */
export interface JozveBookCoverage {
  grade: number;
  /** شمارِ بانکِ تستِ متمایزی که دست‌کم یک نتیجه برایشان ثبت شده */
  attempted: number;
  /** کلِ بانک‌هایِ تستِ آن جزوه (BOOK_BANK_COUNTS — پین‌شده r400) */
  total: number;
  /** درصدِ پوشش — گردشده ۰..۱۰۰ */
  percent: number;
  /** همهٔ سشن‌های ثبت‌شدهٔ آن کتاب (شاملِ گرامر/گرامرِ موضوعی/گرامرِ کنکور) */
  sessions: number;
  /** بهترین درصدِ ثبت‌شده در آن کتاب — ۰ اگر هیچ */
  bestPercent: number;
  /** r415 — کوچک‌ترین بانکِ پوشیده‌نشده (۱..total)؛ null اگر همه پوشیده
   * یا بی‌بانک — مصرف‌کننده: چیپِ «ادامه از بانک M» در کارنامه */
  nextBank: number | null;
  /** r416 — طولِ دویدنِ پشت‌سرهمِ بانک‌هایِ پوشیده‌نشده از nextBank
   * (شاملِ خودش)؛ ۰ اگر nextBank null — مصرف‌کننده: «K بانکِ پیاپی» */
  nextRun: number;
}

// کلیدِ بانکِ تست: jozve-g10-l5 — و کلیدِ گرامر: jozve-g11-gram-l3 و
// خانوادهٔ tgram/kgram. الگوی واحد، دو معنای متفاوت.
const TEST_BANK_RE = /^jozve-g(\d+)-l(\d+)$/;
const ANY_SESSION_RE = /^jozve-g(\d+)-/;

/**
 * پوششِ شش جزوه از نقشهٔ نتایج — همیشه هر شش پایه را به ترتیبِ ۷..۱۲
 * برمی‌گرداند (حتی صفر) تا ردیف‌هایِ کارنامه پایدار بمانند.
 */
export function jozveCoverage(results: Record<string, QuizResult>): JozveBookCoverage[] {
  const attemptedByGrade = new Map<number, Set<number>>();
  const sessionsByGrade = new Map<number, number>();
  const bestByGrade = new Map<number, number>();

  for (const [key, r] of Object.entries(results)) {
    if (!r || typeof r.percent !== "number") continue;
    const any = ANY_SESSION_RE.exec(key);
    if (!any) continue;
    const g = Number(any[1]);
    if (g < 7 || g > 12) continue;
    sessionsByGrade.set(g, (sessionsByGrade.get(g) ?? 0) + 1);
    const best = bestByGrade.get(g) ?? 0;
    if (r.percent > best) bestByGrade.set(g, r.percent);
    const bank = TEST_BANK_RE.exec(key);
    if (bank) {
      let set = attemptedByGrade.get(g);
      if (!set) {
        set = new Set<number>();
        attemptedByGrade.set(g, set);
      }
      set.add(Number(bank[2]));
    }
  }

  return BOOKS.map(({ grade }) => {
    const total = BOOK_BANK_COUNTS[grade] ?? 0;
    const set = attemptedByGrade.get(grade);
    const attempted = set?.size ?? 0;
    const capped = Math.min(attempted, total); // امانتِ داده: سرریز نمایشی نگیر
    // r415 — اولین بانکِ پوشیده‌نشده در ۱..total (اندیسِ بانک، نه درس؛
    // کلیدِ `jozve-gN-lM` با همان شمارنده ساخته می‌شود)
    let nextBank: number | null = null;
    if (total > 0 && (set?.size ?? 0) < total) {
      for (let m = 1; m <= total; m++) {
        if (!set?.has(m)) {
          nextBank = m;
          break;
        }
      }
    }
    // r416 — چند بانکِ پشت‌سرهم از همین‌جا باز مانده؟ (چیپِ «K بانکِ
    // پیاپی» فقط وقتی معنا دارد که یادگیرنده بانک‌ها را شروع کرده باشد —
    // گیتِ نمایش با percent در مصرف‌کننده است، نه اینجا)
    let nextRun = 0;
    if (nextBank != null) {
      for (let m = nextBank; m <= total; m++) {
        if (set?.has(m)) break;
        nextRun += 1;
      }
    }
    return {
      grade,
      attempted,
      total,
      percent: total > 0 ? Math.round((capped / total) * 100) : 0,
      sessions: sessionsByGrade.get(grade) ?? 0,
      bestPercent: bestByGrade.get(grade) ?? 0,
      nextBank,
      nextRun,
    };
  });
}

/** «دست‌کم یک سشن در کلِ شش جزوه»؟ — برای حالتِ خالیِ کارنامه */
export function jozveCoverageHasAny(rows: JozveBookCoverage[]): boolean {
  return rows.some((r) => r.sessions > 0);
}
