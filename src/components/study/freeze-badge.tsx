"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Snowflake } from "lucide-react";
import { useStudy, todayStr } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { freezeBadgeMeta } from "@/lib/freeze-badge";
import { trackEvent } from "@/lib/analytics";

// ------------------------------------------------------------------
// Task 77 «نشانگر یخِ زنجیره» — چیپ آسمانی کنار شعله در هدر چسبان.
//
// چرا: یخ (F9 نگهبان زنجیره) آخرین قطعهٔ نامرئی سیستم انگیزشی بود —
// شعله/هدف/مرور هر سه از راندهای ۷۳-۷۶ در هدر حضور دارند ولی دارندهٔ
// یخ هیچ‌جا به‌جز خانه (پایینِ فولد) نمی‌دید که تور نجات دارد یا یخِ
// امروز زنجیره را نجات داده. هم‌الگوی حبهٔ مرور و چیپ هدف: یک ضربه
// برمی‌گرداند خانه، جایی که خطّ کامل یخ (مخزن + پیشرفتِ ساختن) است.
//
// استایل: کلاسِ معنایی c-chip-freeze (ترانش ۴ فاز ۱) — سطحِ دو-تمِ
// چیپ یخ یک‌جا تعریف شده؛ ارزش‌ها = همان باندهای قبلی (پروب-اثبات)،
// توکن v4)، صفر قاعدهٔ دارک تازه؛ hover با -translate-y-px نه رنگ
// (امن در دارک)؛ بریک‌پوینت هم‌شعله (hidden sm:inline-flex) — موبایل
// بودجهٔ هدر را برای حبهٔ مرور/هدف نگه می‌دارد و خانه سطح کامل دارد.
// هیدراسیون: useMounted کل دروازه — سرور و کلاینت هر دو «هیچ».
// ------------------------------------------------------------------

export default function FreezeBadge() {
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeSavedDay = useStudy((s) => s.freezeSavedDay);
  const goHome = useStudy((s) => s.goHome);
  const mounted = useMounted();

  const meta = useMemo(
    () =>
      mounted
        ? freezeBadgeMeta({ freezeCount, freezeSavedDay, today: todayStr() })
        : null,
    [mounted, freezeCount, freezeSavedDay]
  );

  const open = () => {
    trackEvent("freeze_badge");
    goHome();
  };

  if (!mounted || !meta) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      onClick={open}
      className="freeze-badge mr-1 hidden items-center gap-1 rounded-full border c-chip-freeze px-2.5 py-1.5 text-[12px] font-black transition-transform hover:-translate-y-px active:scale-95 sm:inline-flex"
      aria-label={meta.title}
      title={meta.title}
    >
      <Snowflake size={13} aria-hidden />
      <span>{meta.label}</span>
    </motion.button>
  );
}
