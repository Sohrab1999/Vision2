"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Target, Check } from "lucide-react";
import { useStudy, todayStr, type DayStat } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { goalChipMeta } from "@/lib/goal-chip";
import { trackEvent } from "@/lib/analytics";

// ------------------------------------------------------------------
// Task 76 «چیپ هدف امروز» — پیشرفت زندهٔ هدف روزانه در هدر چسبان.
//
// چرا: مکانیک انگیزشی اصلی اپ (هدف روزانه + زنجیره + یخ) فقط در خانه
// دیده می‌شد (پنل اهداف روزانه) — روی دیکشنری/آزمون/درس/تمرین هیچ
// نشانی از «امروز چقدر مانده» نیست. هم‌الگوی حبهٔ مرور (Task 73):
// یک ضربه برمی‌گرداند خانه جایی که پنل اهداف است. وقتی هدف برآورده
// شد، چیپ یک‌رنگِ زمردی می‌شود — پاداشِ دیده‌شدن، نه حذفِ زودهنگام.
//
// قرارداد شمارش: فقط reviews+quizzes (goalAndFreezePatch) — واژهٔ نو/
// دیکته/برق‌آسا وارد نمی‌شوند؛ چیپ هرگز بیش از امنیت زنجیره ادعا
// نمی‌کند. روز کهنه (dayStat.day != امروز) صفر می‌بیند.
//
// استایل: زمرد از باندهای سراسری موجود سرو می‌گیرد (bg-emerald-50 /
// border-emerald-200 / text-emerald-700 همگی قاعدهٔ دارک دارند —
// صفر قاعدهٔ دارک تازه)؛ حالت برآورده bg-emerald-600 توپر = هم‌کلاس
// آیتم فعال ناوبری، در دارک هم بی‌نیاز؛ میکرونوار روی bg-stone-200/70
// (توکن v4 خودش در دارک فلیپ می‌شود) و fill زمردی توپر.
// هیدراسیون: useMounted کل دروازه است — سرور و کلاینت هر دو «هیچ».
// ------------------------------------------------------------------

const ZERO_DAY: DayStat = {
  day: "",
  reviews: 0,
  quizzes: 0,
  words: 0,
  dictation: 0,
  rush: 0,
};

export default function GoalChip() {
  const dayStat = useStudy((s) => s.dayStat);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const goHome = useStudy((s) => s.goHome);
  const mounted = useMounted();

  const today = todayStr();
  const live = mounted && dayStat.day === today ? dayStat : { ...ZERO_DAY, day: today };
  const meta = useMemo(
    () => goalChipMeta(live.reviews, live.quizzes, dailyGoal),
    [live.reviews, live.quizzes, dailyGoal]
  );

  const open = () => {
    trackEvent("goal_chip");
    goHome();
  };

  if (!mounted) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      onClick={open}
      className={`goal-chip relative mr-1 inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1.5 text-[12px] font-black transition-transform hover:-translate-y-px active:scale-95 ${
        meta.done
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-900/20"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
      aria-label={meta.title}
      title={meta.title}
    >
      {meta.done ? <Check size={13} aria-hidden /> : <Target size={13} aria-hidden />}
      <span className="hidden min-[420px]:inline" dir="ltr">
        {meta.label}
      </span>
      <span className="min-[420px]:hidden" dir="ltr">
        {meta.fraction}
      </span>
      {/* میکرونوار پیشرفت — جزئیات زنده زیر متن */}
      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-stone-200/70" aria-hidden>
        <span
          className={`block h-full transition-all duration-500 ${
            meta.done ? "bg-white/90" : "bg-emerald-600"
          }`}
          style={{ width: `${meta.pct}%` }}
        />
      </span>
    </motion.button>
  );
}
