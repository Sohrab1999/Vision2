"use client";

// ------------------------------------------------------------------
// Task-37 «هفته‌نامهٔ پیشرفت» — the week-over-week digest band inside
// the report card. This week (7 days) vs the one before it, per-day
// bars, goal dots and Persian highlights — all derived from the pure
// computeWeeklyDigest() contract (unit-tested in weekly-digest.test).
// Renders inside .report-paper so the print stylesheet covers it too.
// ------------------------------------------------------------------

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingDown, TrendingUp, Minus, CalendarHeart } from "lucide-react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { computeWeeklyDigest, faWeekday, faDayLabel, type Delta } from "@/lib/weekly-digest";

const DELTA_META: { field: Delta["field"]; label: string; cls: string }[] = [
  { field: "reviews", label: "مرور", cls: "text-amber-600" },
  { field: "quizzes", label: "آزمون", cls: "text-emerald-600" },
  { field: "words", label: "واژهٔ نو", cls: "text-teal-600" },
  { field: "activities", label: "مجموع", cls: "text-stone-700" },
];

function DeltaChip({ d, label, cls }: { d: Delta; label: string; cls: string }) {
  const Icon = d.diff > 0 ? TrendingUp : d.diff < 0 ? TrendingDown : Minus;
  const tone = d.diff > 0 ? "text-emerald-700" : d.diff < 0 ? "text-rose-700" : "text-stone-500";
  return (
    <div className="flex-1 rounded-xl border border-stone-200 bg-white/70 px-2 py-2 text-center">
      <div className={`flex items-center justify-center gap-1 text-[15px] font-black ${cls}`}>
        {faNum(d.current)}
      </div>
      <div className="text-[9.5px] font-bold text-stone-500">{label}</div>
      <div className={`mt-0.5 flex items-center justify-center gap-0.5 text-[9.5px] font-black ${tone}`}>
        <Icon size={10} aria-hidden />
        {d.previous > 0 ? (
          <span dir="ltr">{`${d.diff > 0 ? "+" : ""}${faNum(d.diff)} (${Math.abs(d.percent ?? 0)}%)`}</span>
        ) : (
          <span>هفتهٔ پیش: —</span>
        )}
      </div>
    </div>
  );
}

export default function WeeklyReportSection() {
  const dayHistory = useStudy((s) => s.dayHistory);
  const history = useStudy((s) => s.history);
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const streak = useStudy((s) => s.streak);

  const digest = useMemo(
    // the digest window ends "today"; daysAgoKey(0) is the exported wall-clock
    // day key. The memo re-runs when the store's dayHistory changes — exactly
    // when the digest must.
    () => computeWeeklyDigest({ dayHistory, history, goalMetDays }, daysAgoKey(0)),
    [dayHistory, history, goalMetDays]
  );

  const maxTotal = Math.max(1, ...digest.perDay.map((p) => p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush));
  const today = daysAgoKey(0);

  return (
    <div className="report-digest rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
          <Sparkles size={13} className="text-teal-600" />
          هفته‌نامهٔ پیشرفت
        </div>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
          {faNum(digest.thisWeek.activities)} فعالیت این هفته
        </span>
      </div>

      {/* delta chips — this week vs the one before */}
      <div className="mb-3 flex gap-2">
        {DELTA_META.map((m) => {
          const d = digest.deltas.find((x) => x.field === m.field)!;
          return <DeltaChip key={m.field} d={d} label={m.label} cls={m.cls} />;
        })}
      </div>

      {/* 14-day strip: last week outlined, this week solid */}
      <div className="mb-1 flex h-16 items-end gap-[3px]" dir="ltr" aria-hidden>
        {digest.perDay.map((p, i) => {
          const total = p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush;
          const isToday = p.day === today;
          return (
            <motion.div
              key={p.day}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(total > 0 ? 10 : 3, (total / maxTotal) * 44)}px` }}
              transition={{ delay: i * 0.02, duration: 0.35, ease: "easeOut" }}
              className={`flex-1 rounded-t-[4px] ${
                p.inThisWeek
                  ? total > 0
                    ? "bg-gradient-to-t from-teal-600 via-emerald-500 to-lime-400"
                    : "bg-emerald-200/60"
                  : total > 0
                    ? "bg-stone-300"
                    : "bg-stone-200/60"
              } ${isToday ? "ring-2 ring-emerald-500/60 ring-offset-1" : ""}`}
              title={`${faDayLabel(p.day)} — ${faNum(total)} فعالیت`}
            />
          );
        })}
      </div>
      <div className="mb-3 flex justify-between text-[9px] font-bold text-stone-400" dir="ltr">
        <span>{faDayLabel(digest.perDay[0].day)}</span>
        <span>هفتهٔ پیش | این هفته</span>
        <span>امروز</span>
      </div>

      {/* goal dots — one per day of this week */}
      <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-white/60 px-2.5 py-2">
        <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
          <CalendarHeart size={12} className="text-emerald-600" aria-hidden />
          هدف روزانه ({faNum(dailyGoal)})
        </div>
        <div className="flex items-center gap-1" dir="ltr">
          {digest.perDay
            .filter((p) => p.inThisWeek)
            .map((p) => {
              const met = goalMetDays.includes(p.day);
              const active = p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush > 0;
              return (
                <span
                  key={p.day}
                  title={`${faWeekday(p.day)} — ${met ? "هدف کامل شد" : active ? "فعال ولی ناقص" : "بی‌فعالیت"}`}
                  className={`h-3.5 w-3.5 rounded-full border ${
                    met
                      ? "border-emerald-600 bg-emerald-500"
                      : active
                        ? "border-amber-400 bg-amber-200"
                        : "border-stone-300 bg-white"
                  }`}
                />
              );
            })}
        </div>
      </div>

      {/* highlights */}
      {digest.highlights.length > 0 ? (
        <ul className="space-y-1">
          {digest.highlights.slice(0, 3).map((h, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] font-bold leading-5 text-stone-600">
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] font-bold leading-5 text-stone-500">
          هنوز دادهٔ کافی برای هفته‌نامه نیست — از همین امروز با چند مرور شروع کن تا هفتهٔ بعد، گزارش پیشرفتت اینجا زنده شود.
          {streak > 0 ? " زنجیره‌ات همین حالا روشن است!" : ""}
        </p>
      )}
    </div>
  );
}
