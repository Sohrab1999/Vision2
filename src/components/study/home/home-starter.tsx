"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen, ListChecks, Headphones, ArrowLeft } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";

// مسیر شروع برای یادگیرندهٔ تازه (فاز-۲ «تجربه») — سه قدم متمرکز به‌جای
// پنل‌های تحلیلی خالی؛ با اولین پیشرفت واقعی، نمای کامل جایگزین می‌شود.

export default function HomeStarter() {
  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);

  const starterSteps = [
    {
      icon: BookOpen,
      title: "واژه‌ها را یاد بگیر",
      desc: "فلش‌کارت‌های درس اول با روخوانی هوش مصنوعی — واژه را ببین، بشنو، بلد شو",
      label: "شروع فلش‌کارت‌ها",
      onClick: () => openLesson(1, "smart"),
    },
    {
      icon: ListChecks,
      title: "اولین آزمونت را بزن",
      desc: "همان واژه‌های درس اول را در قالب تست چهارگزینه‌ای محک بزن",
      label: "تست‌های درس اول",
      onClick: () => openLessonTab(1, "tests"),
    },
    {
      icon: Headphones,
      title: "گوشت را تیز کن",
      desc: "تمرین شنیداری: جمله را می‌شنوی و گزینهٔ درست را انتخاب می‌کنی",
      label: "تمرین شنیداری",
      onClick: () => setView({ type: "listen" }),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      aria-label="راهنمای شروع"
      className="rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50/90 via-teal-50/60 to-emerald-50/40 p-5 shadow-sm sm:p-6"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20">
          <Sparkles size={17} />
        </span>
        <h2 className="text-base font-black text-stone-800">از کجا شروع کنم؟</h2>
      </div>
      <p className="mb-4 text-[12.5px] leading-6 text-stone-600">
        سه قدم ساده تا اولین پیشرفتت — با هر قدم، نمودارها و تحلیل‌های شخصی همین‌جا زنده می‌شوند.
      </p>
      <ol className="grid gap-3 sm:grid-cols-3">
        {starterSteps.map((step, i) => (
          <li
            key={step.title}
            className="relative flex flex-col rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
          >
            <span className="absolute -top-2.5 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-black text-white shadow-md">
              {faNum(i + 1)}
            </span>
            <step.icon size={20} className="mb-2 text-emerald-600" />
            <h3 className="mb-1 text-[13.5px] font-extrabold text-stone-800">{step.title}</h3>
            <p className="mb-3 flex-1 text-[12px] leading-6 text-stone-500">{step.desc}</p>
            <button
              onClick={step.onClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
            >
              {step.label}
              <ArrowLeft size={13} />
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center text-[11px] font-bold text-stone-500">
        آزمون جامع و چالش برق‌آسا هم در همین صفحه بالاتر منتظرت هستند 🎯
      </p>
    </motion.section>
  );
}
