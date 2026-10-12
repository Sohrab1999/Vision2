import { lessons, examBank } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";

export type { QuizQuestion };

// ------------------------------------------------------------------
// قراردادهای مشترک «نبرد دودنفره» — آنچه بین ماشین حالت سوکت (hook)
// و پنج نمای فاز (setup/waiting/countdown/play/done) دست‌به‌دست می‌شود.
// ------------------------------------------------------------------

export type Phase = "setup" | "waiting" | "countdown" | "play" | "done";
export type Feedback = "none" | "right" | "wrong";
export type Conn = "connecting" | "online" | "offline";

export const PER_Q_MS = 15_000;
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
