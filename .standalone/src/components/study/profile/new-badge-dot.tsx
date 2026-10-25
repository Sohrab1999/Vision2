"use client";

import { useFreshBadges } from "@/hooks/use-fresh-badges";
import { faNum } from "@/lib/study-theme";

// ------------------------------------------------------------------
// نقطهٔ شمارندهٔ نشان تازه (Task 82) — قهرمان‌سازیِ دستاورد در هدر:
 // روی گوشهٔ آواتار می‌نشیند و تعداد نشان‌های دیده‌نشده را با رقم
// فارسی نشان می‌دهد. کلاس‌های پایدار برای قفلِ تست:
//   .new-badge-dot  → خودِ نقطه (کهرباییِ اشباعِ خام — در هر دو تم یکسان،
//                      مثل حلقهٔ زمردیِ «امروز»؛ صفر قاعدهٔ دارک تازه)
// choreography: ring روی آواتار در profile-popover.tsx با همان قرارداد.
// ------------------------------------------------------------------

export const NEW_BADGE_DOT_TITLE = "نشان تازه! به «خانه» برو و کاشی‌هایش را ببین";

export default function NewBadgeDot() {
  const fresh = useFreshBadges();
  if (fresh.length === 0) return null;
  return (
    <span
      role="status"
      aria-label={`${faNum(fresh.length)} نشان تازه`}
      title={NEW_BADGE_DOT_TITLE}
      // r330 — کهربایِ خامِ -۵۰۰ زیرِ نقطهٔ شمارنده = ۱٫۵۲ (زنده با بوم)؛ -۷۰۰ = ۵٫۰۳.
      // ضربنبض حذف شد: پولسِ رویِ خودِ شمارنده آلفایش را نصف میکرد (وسطِ پولس
      // ۲٫۴–۳٫۳ زنده)؛ پولس حالا هالهٔ ping پشتِ عدد است — شمارنده همیشه مات
      // (الگویِ دودوییِ دوتِ سررسیدِ srs)
      className="new-badge-dot pointer-events-none absolute -left-1.5 -top-1.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/90 bg-amber-700 px-1 text-[9px] font-black leading-none text-white shadow-md shadow-amber-900/30"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-amber-700/60"
      />
      <span className="relative">{faNum(fresh.length)}</span>
    </span>
  );
}
