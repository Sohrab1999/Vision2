"use client";

import { BookOpen, Keyboard, Sparkles, ShieldCheck } from "lucide-react";
import { LESSONS_META, TOTAL_VOCABULARY, TOTAL_QUESTIONS } from "@/data/lesson-meta";
import { faNum } from "@/lib/study-theme";

export default function Footer() {
  const openShortcuts = () => window.dispatchEvent(new CustomEvent("open-shortcuts"));

  return (
    <footer className="footer-band mt-auto border-t border-stone-200 c-veil-60">
      {/* thin brand gradient strip on top of the footer */}
      <div className="h-[3px] w-full bg-gradient-to-l from-emerald-600 via-teal-500 to-amber-400 opacity-80" aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-md shadow-emerald-900/20">
            <BookOpen size={17} />
          </span>
          <div className="text-[12px] leading-6 text-stone-500">
            <p className="font-extrabold text-stone-700">
              وب‌کتاب تعاملی «Vision Two» — زبان انگلیسی هفتم تا دوازدهم
            </p>
            <p>
              بر اساس جزوه‌های جامعِ درس زبان انگلیسی دبیرستان · روخوانی هوش مصنوعی · پیشرفت شما روی همین دستگاه ذخیره می‌شود
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openShortcuts}
            className="inline-flex items-center gap-1.5 rounded-xl border c-card px-3 py-2 text-[11.5px] font-bold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.96]"
            title="راهنمای میان‌برهای کیبورد (کلید ؟)"
          >
            <Keyboard size={14} />
            میان‌برها <kbd dir="ltr" className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px] text-stone-500">؟</kbd>
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] font-bold text-emerald-700">
            <ShieldCheck size={14} />
            پشتیبان خودکار
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] font-bold text-amber-700">
            <Sparkles size={14} />
            {faNum(LESSONS_META.length)} درس · {faNum(TOTAL_VOCABULARY)} واژه · {faNum(TOTAL_QUESTIONS)}+ تست
          </span>
        </div>
      </div>
    </footer>
  );
}
