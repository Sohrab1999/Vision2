"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";
import { useStudy, todayStr } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { streakComboMeta } from "@/lib/streak-combo";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";

// ------------------------------------------------------------------
// Task 150 «نشانِ ترکیبی زنجیره» — چیپِ یکپارچهٔ شعله×یخ در هدر چسبان.
//
// چرا: شعله (اسپنِ غیرکلیک‌پذیرِ header.tsx) و نشانگر یخ (FreezeBadge)
// دو چیپِ جدا برای «یک» سیستم بودند — نگهبانی زنجیره. ادغام:
//   ① یک جای بودجهٔ هدر به‌جای دو (Task ۸۰ — هدر شلوغ‌ترین نوار است)
//   ② عنوانِ یک‌پارچه: «زنجیرهٔ ۹ روزه مطالعه؛ ۲ یخِ زنجیره داری…» —
//     قصهٔ کامل در یک aria، هم‌قرارداد چیپ‌های هدر (aria==title)
//   ③ ضربهٔ شعله برای نخستین‌بار تحلیل می‌شود (streak_badge) — تا
//     دیروز تنها عضوِ انگیزشیِ هدر با صفرِ تحلیل بود؛ ضربهٔ یخ همان
//     freeze_badge می‌ماند (دیکشنِ رویداد دست‌نخورده).
// استایل: پایه = c-chip-flame (هویتِ گرمِ شعله — عضوِ خانوادهٔ c-chip)
// + مهمانِ یخ با جوهرِ آسمانی در streak-badge.css کنارِ مالک (۲ قاعده —
// ارزش‌ها = همان c-chip-freeze پروب‌شده؛ صفر قانونِ دارکِ تازهٔ بی‌سابقه).
// بریک‌پوینت و فنر و کلیک‌رفتن‌به‌خانه: هم‌FreezeBadge قدیم (Task ۷۷).
// هیدراسیون: useMounted کل دروازه — سرور و کلاینت هر دو «هیچ».
// ------------------------------------------------------------------

export default function StreakBadge() {
  const streak = useStudy((s) => s.streak);
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeSavedDay = useStudy((s) => s.freezeSavedDay);
  const goHome = useStudy((s) => s.goHome);
  const mounted = useMounted();

  const meta = useMemo(
    () =>
      mounted
        ? streakComboMeta({ streak, freezeCount, freezeSavedDay, today: todayStr() })
        : null,
    [mounted, streak, freezeCount, freezeSavedDay]
  );

  const open = () => {
    trackEvent(meta?.ice ? "freeze_badge" : "streak_badge");
    goHome();
  };

  if (!mounted || !meta) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      onClick={open}
      className="streak-badge mr-1 hidden items-center gap-1 rounded-full border c-chip-flame px-2.5 py-1.5 text-[12px] font-black transition-transform hover:-translate-y-px active:scale-[0.96] sm:inline-flex"
      aria-label={meta.title}
      title={meta.title}
    >
      <Flame size={14} className="streak-flame" />
      <span>{faNum(meta.streak)}</span>
      {meta.ice && (
        <span className="streak-ice inline-flex items-center gap-1">
          <Snowflake size={13} aria-hidden />
          <span>{meta.ice.label}</span>
        </span>
      )}
    </motion.button>
  );
}
