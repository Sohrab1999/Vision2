"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen, Languages, ListChecks, Volume2, ClipboardCheck, ArrowLeft } from "lucide-react";
import { TOTAL_VOCABULARY, TOTAL_QUESTIONS } from "@/data/lesson-meta";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";

// بخش Hero — تیتر، دکمه‌های شروع و جلد کتاب شناور (Papermorph-style)

export default function HomeHero() {
  const openLesson = useStudy((s) => s.openLesson);
  const setView = useStudy((s) => s.setView);

  return (
    <section className="grid items-center gap-8 pt-6 md:grid-cols-2 md:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="order-2 md:order-1"
      >
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <Sparkles size={13} />
          جزوهٔ کاغذی ⇠ تبدیل به وب‌کتاب تعاملی
        </span>
        <h1 className="mb-3 text-3xl font-black leading-[1.35] text-stone-800 sm:text-4xl">
          آموزش زبان انگلیسی پایهٔ یازدهم
          <span className="mt-1 block bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
            «Vision Two» تعاملی و شنیداری
          </span>
        </h1>
        <p className="mb-6 max-w-lg text-[15px] leading-8 text-stone-600">
          هر سه درس جزوه با واژگان کامل، مکالمه و ریدینگ با <b className="text-emerald-700">روخوانی هوش مصنوعی</b>،
          گرامر تشریحی، فلش‌کارت و بیش از {faNum(TOTAL_QUESTIONS)} تست کنکوری — همه در یک کتاب دیجیتال زنده.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openLesson(1)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition-all hover:bg-emerald-700 hover:shadow-emerald-900/30 active:scale-95"
          >
            <BookOpen size={17} />
            شروع یادگیری — درس اول
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => setView({ type: "exam" })}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition-all hover:border-emerald-300 hover:text-emerald-700 active:scale-95"
          >
            <ClipboardCheck size={17} />
            آزمون جامع
          </button>
        </div>

        <div className="mt-7 grid max-w-md grid-cols-3 gap-3">
          {[
            { icon: Languages, label: "واژگان", value: `${faNum(TOTAL_VOCABULARY)}+` },
            { icon: ListChecks, label: "تست تعاملی", value: `${faNum(TOTAL_QUESTIONS)}+` },
            { icon: Volume2, label: "روخوانی TTS", value: "کل متون" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-sm"
            >
              <s.icon size={18} className="mx-auto mb-1.5 text-emerald-600" />
              <div className="text-lg font-black text-stone-800">{s.value}</div>
              <div className="text-[11px] text-stone-500">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Book cover (Papermorph-style) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="order-1 flex justify-center md:order-2"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-emerald-200/40 blur-2xl" aria-hidden />
          <button
            onClick={() => openLesson(1)}
            className="relative block w-64 overflow-hidden rounded-r-2xl rounded-l-md bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-6 text-center text-white shadow-2xl shadow-emerald-900/40 sm:w-72"
            style={{ boxShadow: "14px 18px 34px -14px rgb(6 78 59 / 0.5), inset 6px 0 12px -6px rgb(0 0 0 / 0.45)" }}
            aria-label="باز کردن کتاب"
          >
            <div className="absolute inset-y-0 right-0 w-3 bg-black/25" aria-hidden />
            <div className="pt-4 text-[11px] font-bold tracking-widest text-emerald-200/90">
              ENGLISH FOR 11TH GRADE
            </div>
            <div className="en-text mt-6 text-5xl font-bold italic" dir="ltr">
              Vision
            </div>
            <div className="en-text text-6xl font-black italic text-amber-300" dir="ltr">
              Two
            </div>
            <div className="mx-auto my-5 h-px w-2/3 bg-emerald-400/50" />
            <div className="text-[13px] font-bold leading-7">
              وب‌کتاب تعاملی
              <br />
              واژگان · مکالمه · گرامر · تست
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
              <Volume2 size={12} /> با روخوانی هوش مصنوعی
            </div>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
