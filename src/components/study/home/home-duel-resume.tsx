"use client";

// r364 — «بازگشت به میدان» — پنجمین درِ خوشهٔ بازگشت (ضمیمهٔ r235،
// کتابخانهٔ r297، درسِ r361، کنکورِ r364): نبرندهٔ سابقه‌دار با یک کلیک به
// میدانِ نبرد برمیگردد و آخرین مصافش را همانجا میبیند.
//
// قراردادها:
//   • دفترچهٔ نبردها در استور است (arcade.duelHistory) و مرزِ persist آن را
//     با sanitizeDuelHistory پالایش میکند — کارت فقط خواننده است؛ بی‌نبرد
//     ⇒ غیبتِ صادقانه (تازهوارد هیچ نمیبیند).
//   • «آخرین» = duelHistory[0] — قراردادِ newest-firstِ pushDuelRecord؛
//     کارت ترتیب را دوباره مرتب نمیکند (یک حقیقت، یک ترتیب).
//   • گویشِ نتیجه از خانوادهٔ دودل: برد/باخت/مساوی (همان سه واژهٔ پنل
//     دفترچه) + امتیاز با الگویِ سطرهایِ دفترچه: faNum با «–» در dir=ltr.
//     زمان با timeAgoFa(r.day) — دقیقاً همان مصرفِ duel-setup.
//   • پرش = setView({type:"duel"}) — هیچ رویدادِ تحلیلی: duel_start معنایش
//     «نبردِ واقعی رویِ داور شروع شد» (در use-duel-socket) است و پرشِ کارت
//     نبردی شروع نمیکند — رجیستریِ ۵۲ دستنخورده (قانونِ r359).
//   • همزادیِ بصری با کارتِ ابزارِ «نبرد دودنفره»: گویشِ آرکیدِ مستندِ
//     P3-Route-A — چیپِ آیکون با توکنهایِ --color-arcade-* (hexِ خامِ
//     violet/fuchsia/purple در این گویش ممنوع — قفلِ arcade-dialect)؛
//     حاشیه و هاورِ کارت از تیرهٔ fuchsia میماند.
//   • ترنزیشنهایِ اسکوپشده؛ ارقامِ فارسی؛ data-duel-resume برایِ کاوش.

import { motion } from "framer-motion";
import { ChevronLeft, Swords } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum, timeAgoFa } from "@/lib/study-theme";

// سه واژهٔ نتیجه — گویشِ نمایشِ خانوادهٔ دودل (همان متونِ فیلترِ دفترچه)
const OUTCOME_LABEL = {
  win: "برد",
  loss: "باخت",
  tie: "مساوی",
} as const;

export default function HomeDuelResume() {
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();
  // گاردِ ?? بیرونِ سلکتور — رکوردها از مرزِ persist پالایششده میآیند
  const duelHistory = useStudy((s) => s.duelHistory) ?? [];

  if (!mounted || duelHistory.length === 0) return null; // بی‌نبرد = هیچ — غیبتِ صادقانه

  const latest = duelHistory[0]; // newest-first — قراردادِ pushDuelRecord

  const jump = () => {
    // بدونِ رویداد: duel_start مالِ شروعِ نبردِ واقعی رویِ داور است
    setView({ type: "duel" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.3, ease: "easeOut" }}
      aria-label="بازگشت به میدانِ نبرد"
    >
      <button
        type="button"
        data-duel-resume
        data-duel-outcome={latest.outcome}
        data-duel-opponent={latest.opponent}
        onClick={jump}
        aria-label={`بازگشت به میدان — آخرین مصاف با ${latest.opponent}: ${OUTCOME_LABEL[latest.outcome]}`}
        className="group flex w-full items-center gap-3 rounded-2xl border border-fuchsia-200 c-card-elevated p-4 text-right shadow-sm transition-[background-color,border-color,box-shadow,transform] hover:border-fuchsia-300 hover:bg-fuchsia-50/40 hover:shadow-md active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-arcade-from-soft to-arcade-to-soft text-white shadow-md shadow-fuchsia-600/20"
          aria-hidden
        >
          <Swords size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-black text-stone-800">
            بازگشت به میدان — آخرین مصاف با {latest.opponent}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-bold text-stone-500">
            {OUTCOME_LABEL[latest.outcome]} · {timeAgoFa(latest.day)}
          </span>
        </span>
        <span className="shrink-0 text-left">
          <span className="block text-[13.5px] font-black text-stone-800" dir="ltr">
            {faNum(latest.myScore)}–{faNum(latest.oppScore)}
          </span>
        </span>
        <ChevronLeft
          size={16}
          className="shrink-0 text-fuchsia-400 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
      </button>
    </motion.section>
  );
}
