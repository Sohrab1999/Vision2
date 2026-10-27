"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlarmClock } from "lucide-react";
import { useStudy, srsDueTotal, firstLessonWithDue } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { duePillMeta } from "@/lib/due-pill";
import { trackEvent } from "@/lib/analytics";

// ------------------------------------------------------------------
// Task 73 «حبهٔ مرور سررسیده» — نشانگر زندهٔ صف SRS در هدر چسبان.
//
// چرا: داشبورد مرور (srs-panel) فقط در خانه و زیر تاخود است — روی
// دیکشنری/آزمون/درس/ضمیمه هیچ نشانی از «چند کارت امروز سررسیده» نیست
// و صف مرور بی‌استفاده می‌ماند. حبه فقط وقتی due>0 ظاهر می‌شود (برای
// تازه‌وارد صفر نویز)، با یک ضربه به فلش‌کارت هوشمندِ اولین درسِ
// دارای سررسیده می‌پرد — همان عملِ دکمهٔ «مرور هوشمند» داشبورد.
//
// استایل: رزِ یک‌رنگ (بدون گرادیان — توقف‌های گرادیان v4 در دارک فلیپ
// نمی‌شوند) تا هر سه قطعه از باندهای سراسری سرو بگیرد:
// کلاسِ معنایی c-chip-due (ترانش ۴ فاز ۱) — سطحِ دو-تمِ چیپ یک‌جا تعریف شده.
// hover با جابه‌جایی ظریف (translate) نه تغییر رنگ — در دارک امن.
// هیدراسیون: useMounted کل دروازه است — سرور و کلاینت هر دو «هیچ»
// می‌کشند تا پس از mount (شکاف‌ها از persist خوانده شد) تصمیم بگیرد.
// ------------------------------------------------------------------

export default function DuePill() {
  const srs = useStudy((s) => s.srs);
  const openLesson = useStudy((s) => s.openLesson);
  const mounted = useMounted();

  const due = mounted ? srsDueTotal(srs) : 0;
  const lesson = mounted ? firstLessonWithDue(srs) : null;
  const meta = useMemo(() => duePillMeta(due, lesson), [due, lesson]);

  const open = () => {
    trackEvent("srs_due_pill");
    openLesson(lesson ?? 1, "smart");
  };

  return (
    <AnimatePresence>
      {due > 0 && (
        <motion.button
          key="due-pill"
          initial={{ opacity: 0, scale: 0.8, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -4 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          onClick={open}
          className="due-pill mr-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border c-chip-due px-2.5 py-1.5 text-[12px] font-black transition-transform hover:-translate-y-px active:scale-95"
          aria-label={meta.title}
          title={meta.title}
        >
          <AlarmClock size={14} aria-hidden />
          <span className="hidden min-[420px]:inline">{meta.long}</span>
          <span className="min-[420px]:hidden">{meta.short}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
