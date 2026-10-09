"use client";

import { motion } from "framer-motion";
import { BarChart3, Flame, ListChecks } from "lucide-react";
import { useStudy, lastNDays, DAILY_TARGET } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

/**
 * نمودار فعالیت ۷ روز اخیر — نوارهای انباشته (مرور + آزمون)
 */
export default function WeeklyChart() {
  const history = useStudy((s) => s.history);
  const mounted = useMounted();
  const days = mounted ? lastNDays(7, history) : [];

  const weekTotal = days.reduce((s, d) => s + d.total, 0);
  const activeDays = days.filter((d) => d.total > 0).length;
  const maxVal = Math.max(DAILY_TARGET, ...days.map((d) => d.total), 1);
  const goalPct = (DAILY_TARGET / maxVal) * 100;

  if (!mounted) return null;

  return (
    <section
      aria-label="فعالیت هفتگی"
      className="week-chart overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-sky-400 via-cyan-500 to-emerald-500" />
      <div className="p-5">
        <div className="mb-5 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-700 text-white shadow-md shadow-cyan-700/25">
              <BarChart3 size={19} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-stone-800">فعالیت ۷ روز اخیر</h2>
              <p className="text-[11.5px] text-stone-500">
                {faNum(weekTotal)} فعالیت در {faNum(activeDays)} روز — هدف روزانه: {faNum(DAILY_TARGET)}
              </p>
            </div>
          </div>
          <div className="hidden gap-3 text-[10.5px] font-bold text-stone-500 sm:flex">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-emerald-500 to-emerald-700" />
              آزمون
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-amber-400 to-orange-500" />
              مرور فلش‌کارت
            </span>
          </div>
        </div>

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
      </div>
    </section>
  );
}
