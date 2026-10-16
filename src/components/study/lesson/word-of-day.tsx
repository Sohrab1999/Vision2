"use client";

// ------------------------------------------------------------------
// Word of the day — deterministic daily pick from all 3 lessons.
// Same word for everyone on the same day; changes at midnight.
// ------------------------------------------------------------------

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, BookOpen, Sparkles } from "lucide-react";
import { lessons } from "@/data";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum, posLabel } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";

export default function WordOfDay() {
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);
  const known = useStudy((s) => s.known);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const mounted = useMounted();

  const pick = useMemo(() => {
    // build flat vocab list with lesson ref
    const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
    const d = new Date();
    const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    const w = all[seed % all.length];
    return { ...w, key: `${w.lessonId}:${w.en.toLowerCase()}` };
  }, []);

  const isKnown = mounted ? Boolean(known[pick.key]) : false;
  const lesson = lessons.find((l) => l.id === pick.lessonId);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      aria-label="واژهٔ امروز"
      className="word-day relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-l from-teal-50 via-emerald-50 to-lime-50 shadow-sm"
    >
      {/* decorative watermark */}
      <span className="pointer-events-none absolute -left-6 -top-8 select-none text-[110px] font-black leading-none text-emerald-900/5" aria-hidden>
        W
      </span>

      <div className="relative grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
        {/* icon + label */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg shadow-emerald-900/25">
            <CalendarDays size={26} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[12px] font-black text-emerald-700">
              <Sparkles size={12} />
              واژهٔ امروز
            </div>
            <div className="text-[11px] text-stone-500">هر روز یک واژهٔ تازه از سه درس</div>
          </div>
        </div>

        {/* word + meaning */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="en-text text-2xl font-black text-stone-800" dir="ltr">
              {pick.en}
            </span>
            {pick.pos && (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-bold text-teal-800">
                {posLabel[pick.pos] ?? pick.pos}
              </span>
            )}
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
              درس {pick.lessonId === 1 ? "اول" : pick.lessonId === 2 ? "دوم" : "سوم"}
            </span>
          </div>
          <p className="mt-1 truncate text-[13.5px] font-bold text-stone-600">{pick.fa}</p>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2">
          <SpeakButton text={pick.en} size="md" />
          <button
            onClick={() => toggleKnown(pick.key)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-[background-color,transform] active:scale-95 ${
              isKnown
                ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
            aria-pressed={isKnown}
          >
            {isKnown ? "✓ بلدم" : "بلدم؟"}
          </button>
          <button
            onClick={() => openLessonTab(pick.lessonId, "vocab")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12px] font-bold text-stone-600 transition-[color,border-color,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-95"
          >
            <BookOpen size={14} />
            فلش‌کارت درس
          </button>
          <button
            onClick={() => setView({ type: "dictionary" })}
            className="hidden items-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-bold text-teal-700 transition-[color,transform] hover:text-teal-900 active:scale-95 sm:inline-flex"
          >
            در دیکشنری ↗
          </button>
        </div>
      </div>

      {/* bottom strip */}
      <div className="h-1.5 w-full bg-gradient-to-l from-teal-500 via-emerald-500 to-lime-400" />
      {mounted && lesson && (
        <span className="sr-only">
          واژهٔ امروز از {lesson.titleFa} انتخاب شده است. مجموع واژگان {faNum(lesson.vocabulary.length)} واژه.
        </span>
      )}
    </motion.section>
  );
}
