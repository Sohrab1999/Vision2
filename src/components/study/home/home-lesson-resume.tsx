"use client";

// r361 — «ادامهٔ خواندن» برایِ درسها — همزادِ درسیِ کارتِ کتابخانه (r297)
// و رکوردِ ضمیمه (r235): یادگیرندهٔ برگشتی با یک کلیک به همان (درس، تب)
// آخرینِ مطالعه‌اش برمیگردد.
//
// قراردادها:
//   • رکورد از lesson-resume میآید (نویسندهٔ یکتا: lesson-view) — کارت
//     فقط خواننده است؛ بی‌رکورد ⇒ غیبتِ صادقانه (تازهوارد هیچ نمیبیند).
//   • پرش = openLessonTab (پریمیتیوِ ناوبریِ موجود) + رویدادِ
//     lesson_open — دقیقاً همان معنایِ openLesson («بازکردن درس»)؛
//     هیچ رویدادِ نو در رجیستری نیست (۵۲ میماند).
//   • برچسبِ تب از تکحقیقتِ TAB_LABELSِ همین فایل میآید (همان متونِ
//     سطرِ تبهایِ lesson-view)؛ درسِ بی‌رکورد و تبِ ناشناخته رندر
//     نمیشوند — جعلِ مقصد ممنوع.
//   • ترنزیشنهایِ اسکوپشده (قفلِ scoped-transitions)؛ ارقامِ فارسی؛
//     ariaِ انسانی؛ data-lesson-resume برایِ کاوشِ زنده.

import { motion } from "framer-motion";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum, timeAgoFa } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { useLessonResume } from "@/lib/lesson-resume";
import type { LessonTab } from "@/state/types";

// همان برچسبهایِ سطرِ تبهایِ lesson-view — تکحقیقتِ برچسبِ کارت
const TAB_LABELS: Record<LessonTab, string> = {
  vocab: "واژگان",
  conversation: "مکالمه",
  reading: "ریدینگ",
  grammar: "گرامر",
  writing: "نگارش",
  dictation: "دیکته",
  tests: "تست‌ها",
  synant: "مترادف و متضاد",
  booklet: "جزوهٔ گرامر",
};

export default function HomeLessonResume() {
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const mounted = useMounted();
  const rec = useLessonResume();

  if (!mounted || !rec) return null; // بی‌رکورد = هیچ — غیبتِ صادقانه

  const jump = () => {
    trackEvent("lesson_open"); // همان معنایِ openLesson — بازکردنِ واقعیِ درس
    openLessonTab(rec.lesson, rec.tab);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
      aria-label="ادامهٔ مطالعهٔ درس"
    >
      <button
        type="button"
        data-lesson-resume
        data-resume-lesson={rec.lesson}
        data-resume-tab={rec.tab}
        onClick={jump}
        aria-label={`ادامهٔ مطالعه از درسِ ${faNum(rec.lesson)} — ${TAB_LABELS[rec.tab]}`}
        className="group flex w-full items-center gap-3 rounded-2xl border border-emerald-200 c-card-elevated p-4 text-right shadow-sm transition-[background-color,border-color,box-shadow,transform] hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/20"
          aria-hidden
        >
          <BookOpen size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-black text-stone-800">
            از درسِ {faNum(rec.lesson)} ادامه بده — {TAB_LABELS[rec.tab]}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-bold text-stone-500">
            آخرین مطالعهٔ تو · {timeAgoFa(rec.at)}
          </span>
        </span>
        <ChevronLeft
          size={16}
          className="shrink-0 text-emerald-400 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
      </button>
    </motion.section>
  );
}
