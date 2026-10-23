import { db } from "@/lib/db";
import { monthDayKey, monthDayPrefix } from "@/lib/tts-meter";

// ------------------------------------------------------------------
// r348 «سقفِ ماهانهٔ توضیحِ هوشمند» — the paid AI explain endpoint gets
// a monthly generation budget, metered per UTC day in the ExplainMeter
// table (same cost family as the r347 TTS budget).
//
// Contracts:
//   • ONLY real ai generations meter (+1 each). Cached reads are free
//     AND unmetered (one paid generation, many reads — the F8 rule),
//     and SDK-down fallback text never cost anything so it never meters.
//   • every meter read/write fails OPEN: a broken meter must never take
//     the explanation away from a learner — it is a cost guard, not a
//     correctness feature. The route treats `null` usage as "no gate".
//   • the cap is env-tunable (EXPLAIN_MONTHLY_GEN_CAP, generations, UTC
//     month); the default is deliberately generous (a whole classroom's
//     month of «چرا غلط شد؟» questions).
// ------------------------------------------------------------------

export const EXPLAIN_CAP_DEFAULT = 3_000;

export function explainMonthCap(): number {
  const n = Number(process.env.EXPLAIN_MONTHLY_GEN_CAP);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : EXPLAIN_CAP_DEFAULT;
}

export async function explainMonthUsage(now: Date = new Date()): Promise<{ used: number; cap: number }> {
  const agg = await db.explainMeter.aggregate({
    _sum: { gens: true },
    where: { day: { startsWith: monthDayPrefix(now) } },
  });
  return { used: agg._sum.gens ?? 0, cap: explainMonthCap() };
}

/** one UPSERT per real ai generation — gens accumulate inside the day row */
export async function bumpExplainMeter(now: Date = new Date()): Promise<void> {
  const day = monthDayKey(now);
  await db.explainMeter.upsert({
    where: { day },
    update: { gens: { increment: 1 } },
    create: { day, gens: 1 },
  });
}
