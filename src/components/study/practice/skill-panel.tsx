"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpenCheck,
  SpellCheck,
  Pencil,
  Ear,
  Headphones,
  Layers,
  Eraser,
  ClipboardCheck,
  GraduationCap,
  Zap,
  ArrowLeft,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { skillBreakdown, barColorFor, skillGradeFa, lessonIdOfKey, type SkillStat } from "@/lib/skill-stats";

// ------------------------------------------------------------------
// تحلیل مهارت‌ها — aggregates every stored quiz result into per-skill
// bars (best %), shows strongest / weakest skill and offers a
// targeted-practice jump for the weakest one.
// ------------------------------------------------------------------

const ICONS: Record<string, React.ElementType> = {
  BookOpenCheck,
  SpellCheck,
  Pencil,
  Ear,
  Headphones,
  Layers,
  Eraser,
  ClipboardCheck,
  GraduationCap,
  Zap,
};

export default function SkillPanel() {
  const results = useStudy((s) => s.results);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);
  const openReport = () => window.dispatchEvent(new CustomEvent("open-report"));
  const mounted = useMounted();

  const stats = useMemo<SkillStat[]>(() => (mounted ? skillBreakdown(results) : []), [results, mounted]);

  const weakest = useMemo(() => {
    if (stats.length === 0) return null;
    return stats.reduce((w, s) => (s.avg < w.avg ? s : w), stats[0]);
  }, [stats]);

  const targetCta = (s: SkillStat) => {
    const lessonId = s.weakest ? lessonIdOfKey(s.weakest.key) : null;
    if (s.def.id === "rush") return setView({ type: "rush" });
    if (s.def.id === "exam" || s.def.id === "final") return setView({ type: "exam" });
    if (s.def.id === "listening") return setView({ type: "listen" });
    if (lessonId) {
      const tab = s.def.id === "dictation" ? "dictation" : s.def.id === "writing" ? "writing" : "tests";
      openLessonTab(lessonId, tab);
      return;
    }
    openLessonTab(1, "tests");
  };

  return (
    <section
      aria-label="تحلیل مهارت‌ها"
      className="skill-panel overflow-hidden rounded-2xl border border-stone-200 c-card-elevated shadow-sm"
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-violet-500 via-fuchsia-500 to-amber-400" />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-fuchsia-900/20">
            <Activity size={20} />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-stone-800">تحلیل مهارت‌ها</h2>
            <p className="text-[12px] text-stone-500">
              {stats.length > 0
                ? `بر اساس ${faNum(stats.reduce((s, x) => s + x.attempts, 0))} نتیجهٔ ثبت‌شدهٔ تو`
                : "بهترین نمرهٔ هر مهارت در یک نگاه"}
            </p>
          </div>
        </div>

        {stats.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 c-stone-60 px-4 py-7 text-center">
            <TrendingUp size={22} className="mx-auto mb-2 text-stone-300" />
            <p className="text-[12.5px] font-bold text-stone-500">هنوز نتیجه‌ای ثبت نشده</p>
            <p className="mt-1 text-[11.5px] leading-5 text-stone-400">
              با حل اولین تست، نمودار مهارت‌هایت اینجا ساخته می‌شود.
            </p>
            <button
              onClick={() => setView({ type: "smart" })}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-[11.5px] font-black text-white shadow-sm shadow-violet-500/25 transition-[opacity,transform] hover:opacity-90 active:scale-95"
            >
              <Sparkles size={13} />
              شروع با جلسهٔ سنجش هوشمند
            </button>
          </div>
        ) : (
          <>
            <ul className="skill-list space-y-3">
              {stats.map((s, i) => {
                const Icon = ICONS[s.def.icon] ?? Activity;
                const grade = skillGradeFa(s.avg);
                return (
                  <motion.li
                    key={s.def.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="skill-row"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                        style={{ backgroundColor: s.def.color }}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="text-[12.5px] font-extrabold text-stone-700">{s.def.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-black ${grade.cls}`}>{grade.label}</span>
                      <span className="ml-auto shrink-0 text-[10.5px] font-bold text-stone-400">
                        {faNum(s.attempts)} نتیجه · میانگین {faNum(s.avg)}٪
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="skill-track h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                        <motion.div
                          className="skill-fill h-full rounded-full"
                          style={{ backgroundColor: barColorFor(s.avg) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(3, s.avg)}%` }}
                          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 + i * 0.05 }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-left text-[12px] font-black text-stone-700">
                        {faNum(s.avg)}٪
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            {weakest && (
              <button
                onClick={() => targetCta(weakest)}
                className="skill-weak-cta mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 px-3.5 py-3 text-right transition-[box-shadow,transform] hover:shadow-sm active:scale-[0.99]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 c-ink-amber">
                    <TrendingUp size={16} />
                  </span>
                  <span>
                    <span className="block text-[12px] font-extrabold text-stone-800">
                      مهارت پیشنهادی برای تمرین: {weakest.def.label}
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      {weakest.weakest
                        ? `ضعیف‌ترین نتیجهٔ تو ${faNum(weakest.weakest.percent)}٪ بوده — همین حالا جبران کن`
                        : "یک دور تمرین، میانگینت را بالا می‌برد"}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-[11.5px] font-black text-white shadow-sm">
                  تمرین هدفمند
                  <ArrowLeft size={13} />
                </span>
              </button>
            )}

            <button
              onClick={() => setView({ type: "smart" })}
              className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-violet-200 bg-gradient-to-l from-violet-50 to-fuchsia-50 px-3.5 py-3 text-right transition-[box-shadow,transform] hover:shadow-sm active:scale-[0.99]"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Sparkles size={16} />
                </span>
                <span>
                  <span className="block text-[12px] font-extrabold text-stone-800">جلسهٔ تمرین هوشمند</span>
                  <span className="block text-[11px] text-stone-500">
                    ترکیبی از همهٔ نقاط ضعف — ساخته‌شده از بانک خطا و مهارت‌ها
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-[11.5px] font-black text-white shadow-sm">
                شروع
                <ArrowLeft size={13} />
              </span>
            </button>

            <button
              onClick={openReport}
              className="mt-3 w-full text-center text-[11px] font-bold text-violet-600 transition-colors hover:text-violet-800"
            >
              دیدن کارنامهٔ کامل من ↗
            </button>
          </>
        )}
      </div>
    </section>
  );
}
