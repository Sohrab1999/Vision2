"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Languages,
  ListChecks,
  Volume2,
  BookMarked,
  ClipboardCheck,
  Library,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Layers,
} from "lucide-react";
import { lessons, examBank, totalVocabulary, totalQuestions } from "@/data";
import { useStudy, knownCountOfLesson, summarize } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { themeOf } from "@/lib/study-theme";
import ProgressRing from "./progress-ring";

const spineColors: Record<string, string> = {
  emerald: "bg-gradient-to-b from-emerald-500 to-emerald-800",
  amber: "bg-gradient-to-b from-amber-400 to-amber-700",
  rose: "bg-gradient-to-b from-rose-500 to-rose-800",
};

const categoryLabel: Record<string, string> = {
  vocab: "واژگان استاندارد",
  "vocab-konkuri": "واژگان کنکوری",
  grammar: "گرامر و نگارش",
  exam: "آزمون جامع",
};

export default function HomeView() {
  const openLesson = useStudy((s) => s.openLesson);
  const setView = useStudy((s) => s.setView);
  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const mounted = useMounted();

  const summary = mounted ? summarize(known, results) : { knownCount: 0, totalPercent: 0, doneCategories: 0, bestExam: null };
  const recentResults = mounted
    ? Object.entries(results)
        .sort((a, b) => (b[1].at > a[1].at ? 1 : -1))
        .slice(0, 4)
    : [];

  return (
    <div className="space-y-10">
      {/* ------------------------------ Hero ------------------------------ */}
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
            گرامر تشریحی، فلش‌کارت و بیش از {totalQuestions} تست کنکوری — همه در یک کتاب دیجیتال زنده.
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
              { icon: Languages, label: "واژگان", value: `${totalVocabulary}+` },
              { icon: ListChecks, label: "تست تعاملی", value: `${totalQuestions}+` },
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

      {/* ---------------------------- Bookshelf ---------------------------- */}
      <section aria-label="قفسهٔ کتاب">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
            <Layers size={19} className="text-emerald-600" />
            قفسهٔ کتاب — سه درس
          </h2>
          <span className="text-xs text-stone-500">برای باز کردن هر درس کلیک کنید</span>
        </div>

        {/* spines */}
        <div className="mb-6 flex items-end justify-center gap-2 rounded-t-2xl border border-b-0 border-stone-200 bg-gradient-to-b from-stone-100 to-stone-50 px-6 pt-6 sm:gap-3">
          {lessons.map((l, i) => (
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
          <div className="book-spine flex w-16 flex-col items-center justify-end rounded-t-lg bg-gradient-to-b from-stone-600 to-stone-800 pb-3 text-white shadow-lg sm:w-20" style={{ height: "140px" }}>
            <ClipboardCheck size={16} />
            <span className="mt-1 text-[10px]">آزمون</span>
          </div>
        </div>
        <div className="h-2.5 rounded-b-xl bg-gradient-to-b from-stone-300 to-stone-400 shadow-md" aria-hidden />

        {/* lesson cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {lessons.map((l, i) => {
            const t = themeOf(l.color);
            const wordsKnown = mounted ? knownCountOfLesson(known, l.id) : 0;
            const knownPercent = Math.round((wordsKnown / l.vocabulary.length) * 100);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className={`mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t.chipBg}`}>
                      درس {l.id === 1 ? "اول" : l.id === 2 ? "دوم" : "سوم"}
                    </span>
                    <h3 className={`en-text text-xl font-bold ${t.text}`} dir="ltr">
                      {l.titleEn}
                    </h3>
                    <p className="text-sm font-bold text-stone-700">{l.titleFa}</p>
                  </div>
                  <ProgressRing percent={mounted ? knownPercent : 0} size={56} stroke={5} color={l.color === "amber" ? "#d97706" : l.color === "rose" ? "#e11d48" : "#059669"}>
                    <span className="text-[11px] font-black text-stone-700">{mounted ? knownPercent : 0}٪</span>
                  </ProgressRing>
                </div>
                <p className="mb-4 flex-1 text-[13px] leading-7 text-stone-500">{l.tagline}</p>
                <div className="mb-4 flex gap-2 text-[11px] text-stone-500">
                  <span className="rounded-lg bg-stone-100 px-2 py-1">{l.vocabulary.length} واژه</span>
                  <span className="rounded-lg bg-stone-100 px-2 py-1">{l.quizzes.length} تست</span>
                  <span className="rounded-lg bg-stone-100 px-2 py-1">{l.grammar.length} بخش گرامر</span>
                </div>
                <button
                  onClick={() => openLesson(l.id)}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${t.bg} py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95`}
                >
                  ورود به درس
                  <ArrowLeft size={15} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------- Tools ---------------------------- */}
      <section aria-label="ابزارهای یادگیری">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-stone-800">
          <Sparkles size={19} className="text-amber-500" />
          ابزارهای ویژه
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookMarked, title: "دیکشنری جستجو", desc: `${totalVocabulary} واژهٔ سه درس با جستجوی فارسی و انگلیسی`, view: { type: "dictionary" as const }, color: "text-sky-600 bg-sky-50 border-sky-200" },
            { icon: ClipboardCheck, title: "آزمون جامع", desc: `${examBank.length} تست گردآوری از بانک ۳۶۰ تستی جزوه با تایمر`, view: { type: "exam" as const }, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            { icon: Library, title: "ضمیمهٔ کتاب", desc: "افعال بی‌قاعده، جدول تلفظ IPA و اجزای کلام", view: { type: "appendix" as const }, color: "text-violet-600 bg-violet-50 border-violet-200" },
            { icon: Trophy, title: "پیشرفت من", desc: "امتیاز تست‌ها و واژگان آموخته‌شده", view: { type: "dictionary" as const }, color: "text-amber-600 bg-amber-50 border-amber-200", custom: true },
          ].map((tool) => (
            <button
              key={tool.title}
              onClick={() => setView(tool.view)}
              className="rounded-2xl border border-stone-200 bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              <span className={`mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${tool.color}`}>
                <tool.icon size={19} />
              </span>
              <h3 className="mb-1 text-sm font-extrabold text-stone-800">{tool.title}</h3>
              <p className="text-[12px] leading-6 text-stone-500">{tool.desc}</p>
              {tool.custom && (
                <p className="mt-2 text-[12px] font-bold text-emerald-700">
                  {summary.knownCount} واژه بلدم · میانگین {summary.totalPercent}٪
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------- Recent results ------------------------- */}
      {recentResults.length > 0 && (
        <section aria-label="آخرین نتایج تست‌ها">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-stone-800">
            <RotateCcw size={19} className="text-stone-400" />
            آخرین نتایج شما
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentResults.map(([key, r]) => {
              const [lessonPart, cat] = key.split(":");
              const lesson = lessons.find((l) => String(l.id) === lessonPart);
              const t = themeOf(lesson?.color ?? "emerald");
              return (
                <div key={key} className={`rounded-xl border ${t.border} ${t.bgSoft} p-3`}>
                  <div className="mb-1 text-[11px] font-bold text-stone-500">
                    {lesson ? `درس ${lesson.id === 1 ? "اول" : lesson.id === 2 ? "دوم" : "سوم"} — ` : ""}
                    {categoryLabel[cat] ?? cat}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-stone-800">{r.percent}٪</span>
                    <span className="text-[12px] text-stone-500" dir="ltr">
                      {r.correct}/{r.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------ Quote ------------------------------ */}
      <section className="rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 p-6 text-center">
        <p className="en-text mb-2 text-lg font-semibold text-stone-700" dir="ltr">
          “Failure is a part of life. If you don&apos;t fail, you won&apos;t learn. If you don&apos;t learn, you will never succeed.”
        </p>
        <p className="text-[13px] font-bold text-amber-800">
          شکست بخشی از زندگیست. اگر شکست نخوری، یاد نمی‌گیری. اگر یاد نگیری، هرگز موفق نخواهی شد.
        </p>
      </section>
    </div>
  );
}
