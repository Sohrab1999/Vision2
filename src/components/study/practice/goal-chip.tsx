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
// استایل: کلاسِ معنایی c-chip-goal (ترانش ۴ فاز ۱) — سطحِ دو-تمِ چیپ
// یک‌جا تعریف شده (light + dark هم‌جا)؛ met-state توپر در شاخهٔ جدا است
// و باندهای سراسری برای سایر مصرف‌کننده‌ها سرِ جایشان مانده‌اند
// آیتم فعال ناوبری، در دارک هم بی‌نیاز؛ میکرونوار روی c-track-70
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
      className={`goal-chip relative mr-1 inline-flex min-h-11 shrink-0 items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1.5 text-[12px] font-black transition-transform hover:-translate-y-px active:scale-[0.96] ${
        meta.done
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-900/20"
          : "border c-chip-goal"
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
      <span className="absolute inset-x-0 bottom-0 h-[3px] c-track-70" aria-hidden>
        <span
          className={`block h-full transition-[background-color,color,border-color,box-shadow,transform] duration-500 ${
            meta.done ? "bg-white/90" : "bg-emerald-600"
          }`}
          style={{ width: `${meta.pct}%` }}
        />
      </span>
    </motion.button>
  );
}
