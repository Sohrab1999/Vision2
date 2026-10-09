"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Sparkles, CalendarClock, CheckCircle2, TrendingUp, Sprout, BookOpenCheck } from "lucide-react";
import { useStudy, srsDueTotal, firstLessonWithDue, type SrsItem } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

// ------------------------------------------------------------------
// داشبورد مرور هوشمند — health of the SRS queue:
// due-now / learning / strong / mastered + 7-day forecast of what's
// coming up, with a one-tap smart review entry.
// ------------------------------------------------------------------

const DAY_MS = 86_400_000;

function dayLabel(offset: number): string {
  if (offset === 0) return "امروز";
  if (offset === 1) return "فردا";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
  return weekdays[d.getDay()];
}

export default function SrsPanel() {
  const srs = useStudy((s) => s.srs);
  const openLesson = useStudy((s) => s.openLesson);
  const mounted = useMounted();

  const stats = useMemo(() => {
    if (!mounted) return null;
    const now = Date.now();
    let due = 0;
    let learning = 0; // level 0..2
    let strong = 0; // level 3..4
    let mastered = 0; // level 5
    const forecast = new Array<number>(7).fill(0);
    const items = Object.values(srs) as SrsItem[];
    for (const it of items) {
      if (it.dueAt <= now) due++;
      else {
        const dayOffset = Math.floor((it.dueAt - now) / DAY_MS);
        if (dayOffset < 7) forecast[dayOffset]++;
      }
      if (it.level >= 5) mastered++;
      else if (it.level >= 3) strong++;
      else learning++;
    }
    return { due, learning, strong, mastered, total: items.length, forecast, maxForecast: Math.max(1, ...forecast) };
  }, [srs, mounted]);

  const reviewLesson = mounted ? firstLessonWithDue(srs) : null;
  const dueTotal = mounted ? srsDueTotal(srs) : 0;

  const chips = [
    { icon: CalendarClock, label: "سررسید الآن", value: stats?.due ?? 0, cls: "bg-rose-50 text-rose-600" },
    { icon: Sprout, label: "در حال یادگیری", value: stats?.learning ?? 0, cls: "bg-amber-50 text-amber-700" },
    { icon: TrendingUp, label: "مستحکم‌شده", value: stats?.strong ?? 0, cls: "bg-emerald-50 text-emerald-700" },
    { icon: BookOpenCheck, label: "وارفته", value: stats?.mastered ?? 0, cls: "bg-teal-50 text-teal-700" },
  ];

  return (
    <section
      aria-label="داشبورد مرور هوشمند"
      className="srs-panel overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-l from-teal-50/80 to-emerald-50/60 shadow-sm"
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-teal-500 via-emerald-500 to-lime-400" />
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <RefreshCcw size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-stone-800">داشبورد مرور هوشمند (SRS)</h2>
              <p className="text-[12px] text-stone-500">
                {stats && stats.total > 0
                  ? `${faNum(stats.total)} واژه در چرخهٔ مرور با فاصله`
                  : "با فلش‌کارت یا دیکته شروع کن تا برنامهٔ مرور بسازد"}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {chips.map((c) => (
              <div key={c.label} className={`rounded-xl border border-white/60 p-2.5 text-center shadow-sm ${c.cls}`}>
                <c.icon size={15} className="mx-auto mb-1" />
                <div className="text-lg font-black leading-none">{faNum(c.value)}</div>
                <div className="mt-1 text-[10.5px] font-bold opacity-80">{c.label}</div>
              </div>
            ))}
          </div>

          {/* 7-day forecast */}
          {stats && stats.total > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-stone-500">
                <CalendarClock size={12} />
                پیش‌بینی مرور ۷ روز آینده
              </div>
              <div className="flex h-16 items-end gap-1.5" dir="ltr">
                {stats.forecast.map((n, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-stone-400">{n > 0 ? faNum(n) : ""}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(n > 0 ? 14 : 3, (n / stats.maxForecast) * 40)}px` }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                      className={`w-full rounded-t-md ${n > 0 ? "bg-gradient-to-t from-teal-500 to-emerald-400" : "bg-stone-200/70"}`}
                      title={`${dayLabel(i)}: ${faNum(n)} واژه`}
                    />
                    <span className={`text-[9.5px] font-bold ${i === 0 ? "text-emerald-700" : "text-stone-400"}`}>
                      {dayLabel(i)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-stretch gap-2.5 lg:w-52">
          <button
            onClick={() => openLesson(reviewLesson ?? 1, "smart")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-emerald-900/20 transition-all hover:opacity-95 active:scale-95"
          >
            <Sparkles size={16} />
            {dueTotal > 0 ? `مرور ${faNum(dueTotal)} واژهٔ سررسید` : "شروع مرور هوشمند"}
          </button>
          {stats && stats.total > 0 && (
            <div className="rounded-xl border border-teal-100 bg-white/70 px-3 py-2 text-center text-[11px] font-bold leading-5 text-stone-500">
              {dueTotal > 0 ? (
                <span className="text-rose-600">{faNum(dueTotal)} واژه منتظر مرور است — الان بهترین وقت است!</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 size={12} />
                  همه‌چیز سر موعد است؛ دمت گرم!
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
