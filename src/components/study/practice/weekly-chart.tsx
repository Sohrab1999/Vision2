"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Flame, ListChecks, Grid3X3 } from "lucide-react";
import { useStudy, lastNDays } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

/**
 * نمودار فعالیت — نوارهای انباشتهٔ ۷ روز اخیر + نقشهٔ حرارتی ۳۰ روزه
 */
export default function WeeklyChart() {
  const history = useStudy((s) => s.history);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const mounted = useMounted();
  const [range, setRange] = useState<"week" | "month">("week");
  const days = mounted ? lastNDays(7, history) : [];
  const monthDays = mounted ? lastNDays(30, history) : [];

  const weekTotal = days.reduce((s, d) => s + d.total, 0);
  const activeDays = days.filter((d) => d.total > 0).length;
  const maxVal = Math.max(dailyGoal, ...days.map((d) => d.total), 1);
  const goalPct = (dailyGoal / maxVal) * 100;

  const monthTotal = monthDays.reduce((s, d) => s + d.total, 0);
  const monthActive = monthDays.filter((d) => d.total > 0).length;

  if (!mounted) return null;

  /** heatmap cell color by activity count */
  const heat = (n: number): string => {
    if (n <= 0) return "bg-stone-100";
    if (n <= 3) return "bg-emerald-200";
    if (n <= 7) return "bg-emerald-400";
    if (n <= 12) return "bg-emerald-600";
    return "bg-emerald-800";
  };

  return (
    <section
      aria-label="فعالیت هفتگی"
      className="week-chart overflow-hidden rounded-2xl border c-card shadow-sm"
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-sky-400 via-cyan-500 to-emerald-500" />
      <div className="p-5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-700 text-white shadow-md shadow-cyan-700/25">
              <BarChart3 size={19} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-stone-800">
                {range === "week" ? "فعالیت ۷ روز اخیر" : "نقشهٔ حرارتی ۳۰ روز"}
              </h2>
              <p className="text-[11.5px] text-stone-500">
                {range === "week"
                  ? `${faNum(weekTotal)} فعالیت در ${faNum(activeDays)} روز — هدف روزانه: ${faNum(dailyGoal)}`
                  : `${faNum(monthTotal)} فعالیت در ${faNum(monthActive)} روزِ فعال از ۳۰ روز`}
              </p>
            </div>
          </div>

          {/* range toggle */}
          <div className="flex rounded-xl border border-stone-200 bg-stone-50 p-1" role="tablist" aria-label="بازهٔ نمودار">
            {(
              [
                { key: "week" as const, label: "هفتگی" },
                { key: "month" as const, label: "۳۰ روزه" },
              ]
            ).map((r) => (
              <button
                key={r.key}
                role="tab"
                aria-selected={range === r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-lg px-3.5 py-1.5 text-[12px] font-black transition-[color,transform] active:scale-95 ${
                  range === r.key
                    ? "bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-200"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {range === "week" ? (
          <>
            {/* chart area */}
            <div className="relative" style={{ height: 148 }}>
              {/* goal line */}
              <div
                className="absolute inset-x-0 border-t border-dashed border-stone-300"
                style={{ bottom: `${(goalPct / 100) * 116 + 26}px` }}
              >
                <span className="absolute -top-2.5 left-0 rounded-full bg-stone-100 px-1.5 py-0.5 text-[9.5px] font-bold text-stone-400">
                  هدف روزانه
                </span>
              </div>

              <div className="absolute inset-0 flex items-end justify-between gap-1.5 px-0.5 sm:gap-3">
                {days.map((d, i) => {
                  const totalH = (d.total / maxVal) * 116;
                  const quizH = d.total ? (d.quizzes / d.total) * totalH : 0;
                  const reviewH = totalH - quizH;
                  return (
                    <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                      {/* value */}
                      <div className="mb-1 h-4 text-[10.5px] font-black text-stone-500" dir="ltr">
                        {d.total > 0 ? faNum(d.total) : ""}
                      </div>
                      {/* bars */}
                      <div className="relative flex w-full max-w-[38px] flex-col justify-end" style={{ height: 116 }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: Math.max(quizH, 0) }}
                          transition={{ delay: i * 0.05, duration: 0.45, ease: "easeOut" }}
                          className={`w-full rounded-t-md bg-gradient-to-b from-emerald-400 to-emerald-700 ${d.total === 0 ? "hidden" : ""}`}
                          title={`${faNum(d.quizzes)} آزمون`}
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: Math.max(reviewH, 0) }}
                          transition={{ delay: i * 0.05 + 0.06, duration: 0.45, ease: "easeOut" }}
                          className={`w-full bg-gradient-to-b from-amber-400 to-orange-500 ${d.total === 0 ? "hidden" : ""} ${quizH === 0 ? "rounded-t-md" : ""}`}
                          title={`${faNum(d.reviews)} مرور`}
                        />
                        {d.total === 0 && (
                          <div className="h-1.5 w-full rounded-full bg-stone-100" />
                        )}
                      </div>
                      {/* weekday */}
                      <div
                        className={`mt-2 truncate rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          d.isToday
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-stone-400"
                        }`}
                      >
                        {d.isToday ? "امروز" : d.weekday}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* summary chips */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
                <ListChecks size={15} className="mx-auto mb-1 text-emerald-600" />
                <div className="text-base font-black text-stone-800">
                  {faNum(days.reduce((s, d) => s + d.quizzes, 0))}
                </div>
                <div className="text-[10px] text-stone-500">آزمون این هفته</div>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-center">
                <Flame size={15} className="mx-auto mb-1 text-amber-600" />
                <div className="text-base font-black text-stone-800">
                  {faNum(days.reduce((s, d) => s + d.reviews, 0))}
                </div>
                <div className="text-[10px] text-stone-500">مرور این هفته</div>
              </div>
              <div className="rounded-xl bg-sky-50 p-2.5 text-center">
                <BarChart3 size={15} className="mx-auto mb-1 text-sky-600" />
                <div className="text-base font-black text-stone-800">
                  {faNum(activeDays)}
                  <span className="text-[11px] font-bold text-stone-400">/۷</span>
                </div>
                <div className="text-[10px] text-stone-500">روز فعال</div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 30-day heatmap */}
            <div className="heatmap-grid grid grid-cols-10 gap-1.5" dir="rtl">
              {monthDays.map((d) => (
                <div
                  key={d.day}
                  title={`${d.weekday} ${d.day} — ${faNum(d.quizzes)} آزمون · ${faNum(d.reviews)} مرور`}
                  className={`heat-cell relative aspect-square w-full rounded-md transition-transform hover:scale-110 ${heat(d.total)} ${
                    d.isToday ? "ring-2 ring-cyan-500 ring-offset-1 ring-offset-white" : ""
                  }`}
                >
                  {d.total > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white/90">
                      {faNum(d.total)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* heatmap legend */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10.5px] text-stone-400">
                <Grid3X3 size={12} />
                کم
                <span className="flex gap-1">
                  {["bg-stone-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600", "bg-emerald-800"].map((c) => (
                    <span key={c} className={`h-3 w-3 rounded-sm ${c}`} />
                  ))}
                </span>
                زیاد
              </div>
              <div className="text-[10.5px] font-bold text-stone-500">
                میانگین روزانه: {faNum(Math.round(monthTotal / 30))} فعالیت
              </div>
            </div>

            {/* summary chips */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
                <ListChecks size={15} className="mx-auto mb-1 text-emerald-600" />
                <div className="text-base font-black text-stone-800">
                  {faNum(monthDays.reduce((s, d) => s + d.quizzes, 0))}
                </div>
                <div className="text-[10px] text-stone-500">آزمون این ماه</div>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-center">
                <Flame size={15} className="mx-auto mb-1 text-amber-600" />
                <div className="text-base font-black text-stone-800">
                  {faNum(monthDays.reduce((s, d) => s + d.reviews, 0))}
                </div>
                <div className="text-[10px] text-stone-500">مرور این ماه</div>
              </div>
              <div className="rounded-xl bg-sky-50 p-2.5 text-center">
                <BarChart3 size={15} className="mx-auto mb-1 text-sky-600" />
                <div className="text-base font-black text-stone-800">
                  {faNum(monthActive)}
                  <span className="text-[11px] font-bold text-stone-400">/۳۰</span>
                </div>
                <div className="text-[10px] text-stone-500">روز فعال</div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
