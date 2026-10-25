import { db } from "@/lib/db";

// ------------------------------------------------------------------
// r347 «سقفِ ماهانهٔ روخوانی» — the paid TTS backend gets a monthly
// character budget, metered per UTC day in the TtsMeter table.
//
// Contracts:
//   • ONLY cache misses meter (a cached narration is free — same rule
//     as the route's rate limit, which also guards the expensive path
//     only).
//   • every meter read/write fails OPEN: a broken meter must never
//     take narration away from a learner — it is a cost guard, not a
//     correctness feature. The route treats `null` usage as "no gate".
//   • the cap is env-tunable (TTS_MONTHLY_CHAR_CAP, chars, UTC month);
//     the default is deliberately generous (~2.5-5k narrations/month).
// ------------------------------------------------------------------

export const TTS_CAP_DEFAULT = 150_000;

export function ttsMonthCap(): number {
  const n = Number(process.env.TTS_MONTHLY_CHAR_CAP);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : TTS_CAP_DEFAULT;
}

/** YYYY-MM (UTC) — the month prefix every day row of this month shares */
export function monthDayPrefix(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

/** YYYY-MM-DD (UTC) — the meter row key for today */
export function monthDayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export async function ttsMonthUsage(now: Date = new Date()): Promise<{ used: number; cap: number }> {
  const agg = await db.ttsMeter.aggregate({
    _sum: { chars: true },
    where: { day: { startsWith: monthDayPrefix(now) } },
  });
  return { used: agg._sum.chars ?? 0, cap: ttsMonthCap() };
}

/** one UPSERT per synthesis — chars accumulate inside the day row */
export async function bumpTtsMeter(chars: number, now: Date = new Date()): Promise<void> {
  const day = monthDayKey(now);
  await db.ttsMeter.upsert({
    where: { day },
    update: { chars: { increment: chars } },
    create: { day, chars },
  });
}
