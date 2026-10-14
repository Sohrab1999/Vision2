"use client";

import { motion } from "framer-motion";
import { PieChart, BookA, ArrowLeft } from "lucide-react";
import { lessons, totalVocabulary } from "@/data";
import { useStudy, knownCountOfLesson } from "@/lib/study-store";
import { percent as percentOf } from "@/lib/domain/percent";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

/**
 * دونات پیشرفت واژگان — سهم واژه‌های «بلدم» هر درس از کل ۶۳۳ واژهٔ کتاب.
 * سه کمان رنگی (زمرد/کهربا/سرخابی) + شمارندهٔ مرکزی + لِجند تفصیلی.
 */

const R = 52;
const CIRC = 2 * Math.PI * R;

const SEGMENTS = [
  { id: 1, color: "#059669", track: "text-emerald-600", soft: "bg-emerald-50", bar: "bg-emerald-500" },
  { id: 2, color: "#d97706", track: "text-amber-600", soft: "bg-amber-50", bar: "bg-amber-500" },
  { id: 3, color: "#e11d48", track: "text-rose-600", soft: "bg-rose-50", bar: "bg-rose-500" },
] as const;

export default function VocabDonut() {
  const known = useStudy((s) => s.known);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const mounted = useMounted();

  const perLesson = SEGMENTS.map((seg) => {
    const lesson = lessons.find((l) => l.id === seg.id)!;
    const count = mounted ? knownCountOfLesson(known, seg.id) : 0;
    return { ...seg, lesson, count, total: lesson.vocabulary.length };
  });

  const knownTotal = perLesson.reduce((s, x) => s + x.count, 0);
  const percent = percentOf(knownTotal, totalVocabulary);

  // donut arc offsets (start from top, clockwise) — computed immutably
  const arcs = perLesson.map((x, i) => {
    const frac = x.total > 0 ? x.count / totalVocabulary : 0;
    const accBefore = perLesson
      .slice(0, i)
      .reduce((s, p) => s + (p.total > 0 ? p.count / totalVocabulary : 0), 0);
    return { ...x, frac, dash: frac * CIRC, offset: -accBefore * CIRC };
  });

  const openFirstTab = (id: number) => openLessonTab(id, "vocab");

  return (
    <section
      aria-label="پیشرفت واژگان"
      className="vocab-donut overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-amber-400 to-rose-500" />
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-900/25">
            <PieChart size={19} />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-stone-800">پیشرفت واژگان کتاب</h2>
            <p className="text-[11.5px] text-stone-500">
              سهم واژه‌های «بلدم» از {faNum(totalVocabulary)} واژهٔ سه درس
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          {/* ---------------- donut ---------------- */}
          <div className="relative shrink-0" dir="ltr">
            <svg width="150" height="150" viewBox="0 0 130 130" role="img" aria-label={`دونات پیشرفت واژگان: ${percent} درصد`}>
              {/* track */}
              <circle cx="65" cy="65" r={R} fill="none" stroke="#e7e5e4" strokeWidth="15" />
              {/* arcs */}
              {arcs.map(
                (a) =>
                  a.dash > 0 && (
                    <motion.circle
                      key={a.id}
                      cx="65"
                      cy="65"
                      r={R}
                      fill="none"
                      stroke={a.color}
                      strokeWidth="15"
                      strokeLinecap="butt"
                      strokeDasharray={`${a.dash} ${CIRC - a.dash}`}
                      initial={{ strokeDashoffset: -a.offset - a.dash }}
                      animate={{ strokeDashoffset: -a.offset }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                      transform="rotate(-90 65 65)"
                    />
                  )
              )}
            </svg>
            {/* center counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center" dir="rtl">
              <motion.span
                key={knownTotal}
                initial={{ scale: 0.85, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-black leading-none text-stone-800"
              >
                {faNum(knownTotal)}
              </motion.span>
              <span className="mt-0.5 text-[10.5px] font-bold text-stone-500">از {faNum(totalVocabulary)} واژه</span>
              <span className="mt-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-black text-emerald-700 ring-1 ring-emerald-200">
                {faNum(percent)}٪
              </span>
            </div>
          </div>

          {/* ---------------- legend ---------------- */}
          <ul className="w-full flex-1 space-y-2.5">
            {arcs.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <button
                  onClick={() => openFirstTab(a.id)}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-right transition-colors hover:bg-stone-50"
                  aria-label={`رفتن به واژگان درس ${a.id}`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-sm shadow-sm" style={{ backgroundColor: a.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12.5px] font-extrabold text-stone-700">{a.lesson.titleFa}</span>
                      <span className="shrink-0 text-[11px] font-black text-stone-500" dir="ltr">
                        {faNum(a.count)}/{faNum(a.total)}
                      </span>
                    </span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <motion.span
                        className={`block h-full rounded-full ${a.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentOf(a.count, a.total)}%` }}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                      />
                    </span>
                  </span>
                  <ArrowLeft size={13} className="shrink-0 text-stone-300 transition-all group-hover:-translate-x-0.5 group-hover:text-stone-500" />
                </button>
              </motion.li>
            ))}

            <li className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-2.5 py-2 text-[11px] font-bold text-stone-500">
              <BookA size={13} className="shrink-0 text-emerald-600" />
              {knownTotal === 0
                ? "با زدن تیک «بلدم» روی واژه‌ها یا فلش‌کارت‌ها، دونات رنگی می‌شود!"
                : percent >= 80
                  ? "عالی! تقریباً همهٔ واژگان کتاب را بلدی."
                  : percent >= 40
                    ? "در مسیر خوبی هستی — ادامه بده!"
                    : "قدم‌به‌قدم؛ هر واژهٔ جدید دونات را بزرگ‌تر می‌کند."}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
