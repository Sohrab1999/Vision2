"use client";

// r364 — «ادامهٔ کنکور» — چهارمین درِ خوشهٔ بازگشت (ضمیمهٔ r235، کتابخانهٔ
// r297، درسِ r361): یادگیرندهای که بانکِ ۳۶۰تایی را لمس کرده با یک کلیک به
// گوشهٔ کنکور برمیگردد.
//
// قراردادها:
//   • خوانندهٔ صادقانهٔ استور: konkurSeen/konkurWrong در مرزِ persist با
//     sanitizeFlagMap پالایش میشوند؛ اینجا فقط گاردِ ?? — شمارش = تعدادِ
//     کلیدهای واقعی، نه جعل. بیپوشش (seen=0) ⇒ غیبتِ صادقانه.
//   • هیچ «۳۶۰» هاردکدی نیست (تکحقیقتِ طولِ بانک در خودِ ویوی کنکور
//     زندگی میکند — کشیدنش به خانه یعنی بارِ داده روی
//     باندلِ خانه؛ کارت فقط «چقدر دیدی» را میگوید و جزئیات یک کلیک away است).
//   • پرش = setView({type:"konkur"}) — هیچ رویدادِ تحلیلی: konkur_start
//     معنایش «جلسهٔ واقعی شروع شد» را دارد (در konkur-view) و پرشِ کارت
//     جلسهای شروع نمیکند — شمردنش دروغ به شمارندهٔ جلسههاست (قانونِ
//     chip-emit-نمیکندِ r359). رجیستریِ ۵۲ دستنخورده.
//   • همزادیِ بصری با کارتِ ابزارِ «گوشهٔ کنکور»: نارنجی + GraduationCap —
//     هر دنیا رنگِ خودش را به خوشهٔ بازگشت میآورد.
//   • ترنزیشنهایِ اسکوپشده (قفلِ scoped-transitions)؛ ارقامِ فارسی؛
//     data-konkur-resume برایِ کاوشِ زنده.

import { motion } from "framer-motion";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

export default function HomeKonkurResume() {
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();
  // گاردِ ?? بیرونِ سلکتور — همالگوی libraryDone در home-view (r297)
  const konkurSeen = useStudy((s) => s.konkurSeen) ?? {};
  const konkurWrong = useStudy((s) => s.konkurWrong) ?? {};

  const seen = Object.keys(konkurSeen).length;
  const wrong = Object.keys(konkurWrong).length;

  if (!mounted || seen === 0) return null; // بیپوشش = هیچ — غیبتِ صادقانه

  const jump = () => {
    // بدونِ رویداد: konkur_start مالِ شروعِ جلسهٔ واقعی است نه بازکردنِ نما
    setView({ type: "konkur" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.11, duration: 0.3, ease: "easeOut" }}
      aria-label="ادامهٔ گوشهٔ کنکور"
    >
      <button
        type="button"
        data-konkur-resume
        data-konkur-seen={seen}
        data-konkur-wrong={wrong}
        onClick={jump}
        aria-label={`ادامهٔ کنکور — ${faNum(seen)} تست دیده‌ای`}
        className="group flex w-full items-center gap-3 rounded-2xl border border-orange-200 c-card-elevated p-4 text-right shadow-sm transition-[background-color,border-color,box-shadow,transform] hover:border-orange-300 hover:bg-orange-50/40 hover:shadow-md active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20"
          aria-hidden
        >
          <GraduationCap size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-black text-stone-800">
            ادامهٔ کنکور — {faNum(seen)} تستِ بانک را دیدی
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-bold text-stone-500">
            {wrong > 0
              ? `${faNum(wrong)} تستِ سختِ تو منتظرِ مرور است`
              : "نقشهٔ پوشش در انتظارِ ادامهٔ توست"}
          </span>
        </span>
        <ChevronLeft
          size={16}
          className="shrink-0 text-orange-400 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
      </button>
    </motion.section>
  );
}
