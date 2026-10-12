"use client";

import { motion } from "framer-motion";
import { Users, Radio } from "lucide-react";
import { lessonMetaById } from "@/data/lesson-meta";
import { faNum, timeAgoFa } from "@/lib/study-theme";
import { useGlobalStats } from "./use-global-stats";
import { feedLabel } from "./home-constants";

// فعالیت یادگیرندگان — آمار جهانی + فید زندهٔ تازه‌ترین آزمون‌ها

export default function HomeFeed() {
  const globalStats = useGlobalStats();

  if (!globalStats || globalStats.total <= 0) return null;

  return (
    <section className="stat-band rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-teal-50 p-5">
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <Users size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-stone-800">فعالیت یادگیرندگان</h2>
              <p className="text-[12px] text-stone-500">همهٔ آزمون‌های ثبت‌شده روی این کتاب</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-black text-emerald-700" dir="ltr">
                {faNum(globalStats.total)}
              </div>
              <div className="text-[11px] text-stone-500">آزمون انجام‌شده</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700" dir="ltr">
                {faNum(globalStats.avgPercent)}٪
              </div>
              <div className="text-[11px] text-stone-500">میانگین نمرات</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700" dir="ltr">
                {faNum(globalStats.last24h)}
              </div>
              <div className="text-[11px] text-stone-500">۲۴ ساعت اخیر</div>
            </div>
          </div>
        </div>

        {/* live feed */}
        {globalStats.recent.length > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-white/70 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
              <Radio size={12} className="animate-pulse" />
              تازه‌ترین فعالیت‌ها
            </div>
            <ul className="max-h-44 space-y-1.5 overflow-y-auto nice-scroll pl-1">
              {globalStats.recent.slice(0, 7).map((a, i) => {
                const lesson = lessonMetaById(a.lesson);
                const cat = feedLabel[a.category] ?? a.category;
                const label =
                  a.lesson === 0 || !lesson
                    ? cat
                    : `${cat} · درس ${lesson.id === 1 ? "۱" : lesson.id === 2 ? "۲" : "۳"}`;
                const barColor = a.percent >= 70 ? "bg-emerald-500" : a.percent >= 50 ? "bg-amber-500" : "bg-rose-400";
                return (
                  <motion.li
                    key={`${a.createdAt}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 shadow-sm"
                  >
                    <span className="shrink-0 text-[11px] font-bold text-stone-400">{timeAgoFa(a.createdAt)}</span>
                    {a.name && (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          a.color === "amber" ? "bg-amber-500" : a.color === "rose" ? "bg-rose-500" : a.color === "violet" ? "bg-violet-500" : a.color === "sky" ? "bg-sky-500" : "bg-emerald-500"
                        }`}
                        title={a.name}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-stone-700">
                      {a.name ? (
                        <span className="text-emerald-700">{a.name} — </span>
                      ) : (
                        <span className="text-stone-400">یادگیرندهٔ ناشناس — </span>
                      )}
                      {label}
                    </span>
                    <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-stone-100 sm:block">
                      <span className={`block h-full rounded-full ${barColor}`} style={{ width: `${a.percent}%` }} />
                    </span>
                    <span className="shrink-0 text-[12px] font-black text-stone-700">{faNum(a.percent)}٪</span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
