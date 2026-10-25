import { lessons, examBank } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";
import type { DuelReceipt } from "@/lib/duel-receipt";

export type { QuizQuestion };

// ------------------------------------------------------------------
// قراردادهای مشترک «نبرد دودنفره» — آنچه بین ماشین حالت سوکت (hook)
// و پنج نمای فاز (setup/waiting/countdown/play/done) دست‌به‌دست می‌شود.
// ------------------------------------------------------------------

// Task 107 «ریتمِ نبرد» — سقفِ زمانِ هر سؤال دیگر ثابتِ این فایل نیست؛
// داور در duel:start/duel:state عددِ ریتمِ خودِ اتاق را می‌فرستد و
// ماشینِ سوکت آن را به تایمرِ play و چیپِ لابی می‌رساند (use-duel-socket).
export type Phase = "setup" | "waiting" | "countdown" | "play" | "done";
export type Feedback = "none" | "right" | "wrong";
export type Conn = "connecting" | "online" | "offline";

export const LETTERS = ["A", "B", "C", "D"];

/** همان شکلی که سرویس ۳۰۰۳ می‌فرستد */
export interface PublicPlayer {
  sid: string;
  name: string;
  color: string;
  qi: number;
  score: number;
  correct: number;
  answered: number;
  done: boolean;
  disconnected: boolean;
}

export interface DuelQ {
  id: string;
  perm: number[];
}

export interface EndPayload {
  reason: "finished" | "forfeit";
  winner: string | null;
  total: number;
  startedAt: number | null;
  players: PublicPlayer[];
  /** Task 94 — رسیدِ امضاشدهٔ داور (۳۰۰۳)؛ کلاینت آن را عیناً به /api/stats می‌رساند */
  receipt?: DuelReceipt;
  /**
   * Task 106 «زمانِ فکر» — نمونه‌های دیدن→پاسخ هر بازیکن بر سید (ms؛ ساعتِ
   * خودِ سرور). نمایشی و بیرونِ رسیدِ امضاشده؛ سرویسِ قدیمی این فیلد را
   * نمی‌فرستد → undefined (بلوکِ کارنامه غایب — صداقتِ زیرمجموعه).
   */
  think?: Record<string, (number | null)[]>;
}

/**
 * بانک متن سؤال‌ها: کلاینت فقط id + perm از سرور می‌گیرد و متن را از بانک
 * استاتیک خودش رندر می‌کند؛ درستی پاسخ‌ها روی سرور اعتبارسنجی می‌شود.
 */
export function buildDuelBank(): Map<string, QuizQuestion> {
  const m = new Map<string, QuizQuestion>();
  for (const l of lessons) for (const q of l.quizzes) m.set(q.id, q);
  for (const q of examBank) m.set(q.id, q);
  return m;
}
