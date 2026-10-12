"use client";

import { motion } from "framer-motion";
import { Flame, Snowflake, Target, RefreshCcw, Ear } from "lucide-react";
import { useStudy, srsDueTotal, firstLessonWithDue, todayStr, FREEZE_CAP } from "@/lib/study-store";
import { percent } from "@/lib/domain/percent";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

// بخش «برنامهٔ امروز» — زنجیرهٔ یادگیری + یخِ زنجیره + هدف روزانه + اقدام سریع

export default function HomeToday() {
  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const streak = useStudy((s) => s.streak);
  const bestStreak = useStudy((s) => s.bestStreak);
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeSavedDay = useStudy((s) => s.freezeSavedDay);
  const dayStat = useStudy((s) => s.dayStat);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const srs = useStudy((s) => s.srs);
  const mounted = useMounted();

  const dueTotal = mounted ? srsDueTotal(srs) : 0;
  const todayActivities = mounted && dayStat.day === todayStr() ? dayStat.reviews + dayStat.quizzes : 0;
  const goalPercent = percent(todayActivities, dailyGoal);
  const reviewLesson = mounted ? firstLessonWithDue(srs) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      aria-label="برنامهٔ امروز"
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-500 to-amber-400" />
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        {/* streak */}
        <div className="flex items-center gap-4">
          <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all ${streak > 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30" : "bg-stone-200 shadow-none"}`}>
            <Flame size={30} className={streak > 0 ? "streak-flame text-white" : "text-stone-400"} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-stone-400">زنجیرهٔ یادگیری</div>
            <div className="text-2xl font-black leading-tight text-stone-800">
              {streak > 0 ? (
                <>
                  {faNum(streak)} <span className="text-sm font-bold text-amber-600">روز پیوسته</span>
                </>
              ) : (
                <span className="text-base">امروز را شروع کن!</span>
              )}
            </div>
            {bestStreak > 1 && (
              <div className="text-[11px] text-stone-400">رکورد: {faNum(bestStreak)} روز</div>
            )}
            {mounted && freezeCount > 0 && (
              <span
                title={`یخِ زنجیره: یک روز غیبت را خودکار پوشش می‌دهد (سقف ${faNum(FREEZE_CAP)} یخ)`}
                className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10.5px] font-black text-sky-600"
              >
                <Snowflake size={11} />
                {faNum(freezeCount)} یخِ زنجیره
              </span>
            )}
            {mounted && freezeSavedDay === todayStr() && (
              <div className="mt-1 text-[10.5px] font-bold text-sky-500">امروز یخ، زنجیره را نجات داد!</div>
            )}
          </div>
        </div>

        {/* daily goal */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px] font-bold">
            <span className="flex items-center gap-1.5 text-stone-600">
              <Target size={14} className="text-emerald-600" />
              هدف امروز: {faNum(dailyGoal)} فعالیت
            </span>
            <span className={goalPercent >= 100 ? "text-emerald-600" : "text-stone-500"}>
              {goalPercent >= 100 ? "✓ انجام شد!" : `${faNum(todayActivities)} از ${faNum(dailyGoal)}`}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
            <motion.div
              className={`h-full rounded-full ${goalPercent >= 100 ? "bg-gradient-to-l from-emerald-500 to-teal-400" : "bg-gradient-to-l from-emerald-500 to-amber-400"}`}
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-stone-400">
            مرور فلش‌کارت، تست، نگارش و دیکته همه در شمارش فعالیت امروز تأثیر دارند
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <button
            onClick={() => openLesson(reviewLesson ?? 1, "smart")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95"
          >
            <RefreshCcw size={15} />
            {dueTotal > 0 ? `مرور هوشمند (${faNum(dueTotal)} واژه سررسید)` : "مرور هوشمند"}
          </button>
          <button
            onClick={() => openLessonTab(reviewLesson ?? 1, "dictation")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[13px] font-bold text-violet-700 transition-all hover:bg-violet-100 active:scale-95"
          >
            <Ear size={15} />
            دیکتهٔ امروز
          </button>
        </div>
      </div>
    </motion.section>
  );
}
