"use client";

import { motion } from "framer-motion";
import { Layers, ClipboardCheck, ArrowLeft } from "lucide-react";
import { LESSONS_META, lessonOrdinalFa } from "@/data/lesson-meta";
import { useStudy, knownCountOfLesson } from "@/lib/study-store";
import { percent } from "@/lib/domain/percent";
import { useMounted } from "@/lib/use-mounted";
import { themeOf, faNum } from "@/lib/study-theme";
import ProgressRing from "../practice/progress-ring";
import { spineColors, lessonCheer } from "./home-constants";
import { ring600 } from "@/lib/ui-colors";

// قفسهٔ کتاب — عine‌های کتاب + کارت درس‌ها با حلقهٔ پیشرفت واژگان
// (راند ۱۹۴: نه درس — جزوه‌های دهم + یازدهم + دوازدهم در سه پایهٔ کامل)

export default function HomeBookshelf() {
  const openLesson = useStudy((s) => s.openLesson);
  const known = useStudy((s) => s.known);
  const mounted = useMounted();

  return (
    <section aria-label="قفسهٔ کتاب">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
          <Layers size={19} className="text-emerald-600" />
          قفسهٔ کتاب — {faNum(LESSONS_META.length)} درس
        </h2>
        <span className="text-xs text-stone-500">یازدهم + دوازدهم · برای باز کردن هر درس کلیک کنید</span>
      </div>

      {/* spines — راند ۱۹۳: هفت عine دیگر در ۳۹۰px جا نمی‌شود؛ نوارِ اسکرول‌پذیرِ چپ‌راست */}
      <div className="shelf-strip nice-scroll mb-6 flex items-end justify-start gap-2 overflow-x-auto rounded-t-2xl border border-b-0 border-stone-200 bg-gradient-to-b from-stone-100 to-stone-50 px-6 pt-6 sm:justify-center sm:gap-3">
        {LESSONS_META.map((l, i) => (
          <motion.button
            key={l.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            onClick={() => openLesson(l.id)}
            className={`book-spine flex w-16 flex-col items-center justify-end rounded-t-lg pb-3 text-white shadow-lg sm:w-20 ${
              spineColors[l.color] ?? "bg-stone-600"
            }`}
            style={{ height: `${110 + i * 8}px` }}
          >
            <span className="en-text text-sm font-bold" dir="ltr">
              L{l.id}
            </span>
            <span className="mt-1 max-w-full truncate px-1 text-[10px] opacity-90">
              {l.titleFa}
            </span>
          </motion.button>
        ))}
        <div className="book-spine flex w-16 flex-col items-center justify-end rounded-t-lg bg-gradient-to-b from-stone-600 to-stone-800 pb-3 text-white shadow-lg sm:w-20" style={{ height: `${110 + LESSONS_META.length * 8}px` }}>
          <ClipboardCheck size={16} />
          <span className="mt-1 text-[10px]">آزمون</span>
        </div>
      </div>
      <div className="h-2.5 rounded-b-xl shelf-edge bg-gradient-to-b from-stone-300 to-stone-400 shadow-md" aria-hidden />

      {/* lesson cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {LESSONS_META.map((l, i) => {
          const t = themeOf(l.color);
          const wordsKnown = mounted ? knownCountOfLesson(known, l.id) : 0;
          const knownPercent = percent(wordsKnown, l.vocabCount);
          return (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group flex flex-col rounded-2xl border c-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className={`mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t.chipBg}`}>
                    درس {lessonOrdinalFa(l.id)} · پایهٔ {l.grade}
                  </span>
                  <h3 className={`en-text text-xl font-bold ${t.text}`} dir="ltr">
                    {l.titleEn}
                  </h3>
                  <p className="text-sm font-bold text-stone-700">{l.titleFa}</p>
                </div>
                <ProgressRing percent={mounted ? knownPercent : 0} size={56} stroke={5} color={ring600(l.color)}>
                  <span className="text-[11px] font-black text-stone-700">{faNum(mounted ? knownPercent : 0)}٪</span>
                </ProgressRing>
              </div>
              <p className="mb-4 flex-1 text-[13px] leading-7 text-stone-500">{l.tagline}</p>
              <div className="mb-4 flex gap-2 text-[11px] text-stone-500">
                <span className="rounded-lg bg-stone-100 px-2 py-1">{faNum(l.vocabCount)} واژه</span>
                <span className="rounded-lg bg-stone-100 px-2 py-1">{faNum(l.quizCount)} تست</span>
                <span className="rounded-lg bg-stone-100 px-2 py-1">{faNum(l.grammarCount)} بخش گرامر</span>
              </div>
              <p className="mb-3 text-[12px] font-bold text-stone-600">{lessonCheer(mounted ? knownPercent : 0)}</p>
              <button
                onClick={() => openLesson(l.id)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${t.bg} py-2.5 text-sm font-bold text-white transition-[background-color,color,border-color,transform,opacity] hover:opacity-90 active:scale-[0.96]`}
              >
                ورود به درس
                <ArrowLeft size={15} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
