"use client";

import { motion } from "framer-motion";
import { Headphones, Zap } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

// دو بنر دعوت: تمرین شنیداری (F6) و چالش برق‌آسا

export function ListenBanner() {
  const setView = useStudy((s) => s.setView);
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      aria-label="تمرین شنیداری"
      className="listen-hero relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-l from-cyan-50 via-teal-50 to-emerald-50 shadow-sm"
    >
      <div className="absolute -right-5 -top-8 text-teal-500 opacity-[0.07]" aria-hidden>
        <Headphones size={170} />
      </div>
      <div className="relative flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-teal-500/30">
          <Headphones size={26} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-stone-800">تمرین شنیداری — بشنو و انتخاب کن</h2>
            <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">جدید</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-6 text-stone-600">
            مثل امتحان واقعی Vision: جمله و واژه را می‌شنوی و گزینهٔ درست را انتخاب می‌کنی — با ۳ نوع تمرین (واژه، ترجمهٔ جمله، ادامهٔ مکالمه) و حداکثر ۲ بار پخش.
          </p>
        </div>
        <button
          onClick={() => setView({ type: "listen" })}
          className="inline-flex w-full flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-l from-cyan-700 to-teal-700 px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-teal-600/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96] sm:w-auto sm:flex-none"
        >
          <Headphones size={16} />
          شروع تمرین شنیداری
        </button>
      </div>
    </motion.section>
  );
}

export function RushBanner() {
  const setView = useStudy((s) => s.setView);
  const rushBest = useStudy((s) => s.rushBest);
  const mounted = useMounted();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      aria-label="چالش برق‌آسا"
      className="rush-banner relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-l from-amber-100 via-orange-50 to-rose-50 shadow-sm"
    >
      <div className="rush-banner-bolt absolute -left-4 -top-6 text-orange-500 opacity-[0.08]" aria-hidden>
        <Zap size={170} />
      </div>
      <div className="relative flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
          <Zap size={26} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-stone-800">چالش برق‌آسا</h2>
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-stone-900 shadow-sm">
              {faNum(60)} ثانیه
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-6 text-stone-600">
            در یک دقیقه چه‌قدر تست می‌توانی جواب بدهی؟ کمبوی پاسخ‌های درست امتیازت را چند برابر می‌کند.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {mounted && rushBest > 0 && (
            <span className="hidden shrink-0 rounded-xl border border-amber-200 c-veil-80 px-3 py-2 text-[12px] font-black text-amber-800 sm:block">
              🏆 رکورد: {faNum(rushBest)}
            </span>
          )}
          {/* r327 — سفید رویِ from-amber-500 میمرد (۲٫۱۳ در هر دو تم)؛
              جفتِ عمیق در هر دو تم ≥۵٫۰ — تهِ گرادیان باید -۹۵۰ باشد نه
              -۷۰۰: توکنِ --color-orange-700 در تاریک به #fdba74 بازمیگردد
              (globals:201) و سفید رویِ آن ۱٫۶۹ میشد — سنجشِ زنده پسااصلاح */}
          <button
            onClick={() => setView({ type: "rush" })}
            className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-l from-amber-700 to-orange-950 px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-orange-600/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96] sm:flex-none"
          >
            <Zap size={16} />
            شروع چالش
          </button>
        </div>
      </div>
    </motion.section>
  );
}
