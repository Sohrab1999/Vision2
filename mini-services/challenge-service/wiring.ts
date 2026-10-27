// ------------------------------------------------------------------
// Task 146 — «زیرساختِ دومین تستِ ۳۰۰۳» — قطعاتِ تصمیمِ سیم‌کشیِ داور.
// index.ts از تسکِ ۱۲۲ «فقط سیم» بود ولی سه تصمیمش هنوز داخلِ خودش
// ماند: گیتِ بلیت، انتخابِ سؤال، تاسِ کدِ اتاق. هر سه اینجا کارخانه‌اند
// با راز/گنبد/تاسِ تزریقی — هرمتیکِ کامل: بدونِ سوکت، بدونِ شبکه،
// بدونِ رازِ واقعی (همان مسیری که room-manager در تسکِ ۱۲۲ رفت).
// رفتارِ سیمی حرف‌به‌حرف همان است؛ تنها تفاوتِ ساختاری: تاسِ تزریقی به
// shuffle هم می‌رسد (پارامترِ دومِ دامنه) — با Math.randomِ پیش‌فرض،
// رفتارِ زنده عینِ سیمِ قدیم است.
// ------------------------------------------------------------------
import type { QuizQuestion } from "../../src/lib/study-types";
import { shuffle, type Rng } from "../../src/lib/domain/shuffle";
import { verifyTicket } from "../../src/lib/duel-ticket-server";
import { ticketRejectMessage, type TicketVault } from "../../src/lib/duel-ticket";

/** الفبای کدِ اتاق — بدونِ نویسه‌های مبهم (I/L/O و ۰/۱) */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** یک سؤال مسابقه: id + جایگشت گزینه‌ها + کلید واقعی (فقط سمت سرور) */
export interface DuelQuestion {
  id: string;
  perm: number[];
  answerReal: number;
}

export type EntryTicketGuard = (
  raw: unknown,
) => { error: string; ticketError: true } | null;

/**
 * گیتِ بلیت برای duel:create/duel:join — رشتهٔ خطا یا null.
 * ترتیب بازبینی: ساختار → امضا → پنجره → یک‌بارمصرف. nonce فقط هنگام
 * بلیتِ درستِ از-نظر-امضا سوزانده می‌شود تا دست‌کاریِ امضا، nonceِ کسی
 * را نسوزاند. خروجی همیشه پرچمِ ticketError دارد تا کلاینت بداند
 * گرفتاریِ خودِ بلیت است (نه اتاق/گلوگاه) و یک‌بارِ تازه ضرب کند.
 * (قرارداد از index.ts نقل شد — اکنون اینجا تک‌منبعِ منطق است.)
 */
export function createEntryTicketGuard(deps: {
  secret: string | null;
  vault: Pick<TicketVault, "consume">;
}): EntryTicketGuard {
  return (raw) => {
    const ticket = (raw as { ticket?: unknown } | null)?.ticket;
    const verdict = verifyTicket(ticket, deps.secret);
    if (!verdict.ok) return { error: ticketRejectMessage(verdict.reason), ticketError: true };
    if (!deps.vault.consume(verdict.n)) {
      return { error: ticketRejectMessage("replayed"), ticketError: true };
    }
    return null;
  };
}

/**
 * انتخابِ سؤال مسابقه از بانک با تاسِ تزریقی؛ بُرِ گزینه‌ها با همان
 * Fisher–Yatesِ یکتای دامنه (task 122 — کپیِ نهم حذف شده بود) و تاسِ
 * همان. خروجی هرگز خودِ سؤال نیست: فقط id/perm/answerReal — کلیدِ
 * پاسخ و متن هرگز از داور بیرون نمی‌روند (قراردادِ ضد نشت).
 */
export function createQuestionPicker(deps: {
  bank: QuizQuestion[];
  rng: Rng;
}): () => DuelQuestion {
  return () => {
    const q = deps.bank[Math.floor(deps.rng() * deps.bank.length)];
    const perm = shuffle([0, 1, 2, 3], deps.rng);
    return { id: q.id, perm, answerReal: perm.indexOf(q.answer) };
  };
}

/** تاسِ کدِ اتاق: ۵ نویسه از الفبای بی‌ابهام با تاسِ تزریقی */
export function createRoomCodeMaker(deps: { rng: Rng }): () => string {
  return () => {
    let code = "";
    for (let i = 0; i < 5; i++)
      code += CODE_ALPHABET[Math.floor(deps.rng() * CODE_ALPHABET.length)];
    return code;
  };
}
