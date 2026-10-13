"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { weekGoalMeta, weekWindowGoalDays } from "@/lib/week-goal";
import { trackEvent } from "@/lib/analytics";

// ------------------------------------------------------------------
// Task 129 «چیپِ هفته در هدر» — مینی‌حلقهٔ هدفِ هفتگی، همسایهٔ چیپِ
// هدفِ امروز (Task 76). روایتِ یک‌جا: چیپِ امروز می‌گوید «امروز چقدر
// مانده»، حلقهٔ هفته می‌گوید «هفته چقدر پُر شده» — و روزِ برآوردهٔ
// امروز خودبه‌خود یک پلهٔ همین حلقه است (goalAndFreezePatch روزِ هدف‌دار
// را ثبت می‌کند، این خوان همان را می‌بیند).
//
// زبانِ چهارمِ هدفِ هفته: حلقهٔ PNGِ کارتِ هفته (r121) + پانوشتِ کاغذِ
// A4 (r124) + حلقهٔ زندهٔ هفته‌نامه (r128) + این مینی‌حلقه — همه از
// week-goal.ts می‌خوانند و هم‌زبانی با تستِ توافقِ شبکه‌ای (چیپ ↔
// دایجست) قفل است. track و arc دقیقاً دوقلویِ حلقهٔ هفته‌نامه‌اند:
// track = توکنِ سنگی (در دارک خودش تیره می‌شود — صفرِ قانونِ نو)،
// arc = همان گرادیانِ PNG (#10b981→#0d9488)؛ pct=۰ هیچ arc نمی‌کشد
// (نقطهٔ کاذبِ linecap-round ممنوع — قراردادِ ۱۲۸).
//
// رفتار: یک ضربه → رویداد week_chip + بازکردنِ هفته‌نامهٔ پیشرفت
// (رویدادِ open-report — همان درِ «کارنامهٔ من»). هیچ ناوبری‌ای عوض
// نمی‌شود؛ هفته‌نامه رویِ همان نما باز می‌شود.
//
// بودجهٔ هدر: زیرِ sm پنهان (هم‌خانوادهٔ شعلهٔ زنجیره — درسِ ۱۲۳ که
// بودجهٔ هدرِ موبایل را با اندازه‌گیریِ زنده بست). در موبایل، حلقهٔ
// هفته سرِ جایش در هفته‌نامه است (کارنامهٔ من → گزارش هفتگی).
// هیدراسیون: useMounted کل دروازه است — سرور و کلاینت هر دو «هیچ».
// ------------------------------------------------------------------

export default function WeekChip() {
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const mounted = useMounted();

  // همان کلیدی که دایجست می‌خواند: daysAgoKey(0) — کلیدِ امروزیِ
  // ساعتِ دیوار (خوانِ exported، نه todayStr — هم‌منبعی با هفته‌نامه)
  const goalDays = useMemo(
    () => weekWindowGoalDays(goalMetDays, daysAgoKey(0)),
    [goalMetDays]
  );
  const meta = useMemo(() => weekGoalMeta(goalDays, "این هفته"), [goalDays]);

  const open = () => {
    trackEvent("week_chip");
    window.dispatchEvent(new CustomEvent("open-report"));
  };

  if (!mounted) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      onClick={open}
      className={`week-chip hidden sm:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border p-0 transition-all hover:-translate-y-px active:scale-90 ${
        meta.done
          ? "border-emerald-600/70 shadow-sm shadow-emerald-900/10"
          : "border c-card"
      }`}
      aria-label={meta.title}
      title={meta.title}
    >
      <svg viewBox="0 0 40 40" className="h-[22px] w-[22px] -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="week-chip-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-stone-200)" strokeWidth="4" />
        {meta.pct > 0 && (
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="url(#week-chip-arc)"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${meta.pct} ${100 - meta.pct}`}
          />
        )}
      </svg>
    </motion.button>
  );
}
