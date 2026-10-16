"use client";

// ------------------------------------------------------------------
// راند ۲۳۶ — دکمهٔ «ادامهٔ مطالعه» در هدرِ سراسری (بندِ ① پیشنهادِ ۲۳۴/۲۳۵):
// از هر نمایِ غیرِضمیمه‌ای یک‌کلیکی به همان‌جایِ آخرینِ دیده‌شده — درِ
// چهارمِ حلقه (کارتِ خانه، نشانگرِ سرِ ضمیمه، فرمان‌یاب و حالا هدر).
//
// صداقت‌ها:
//   • بی‌رکورد = هیچ دکمه‌ای رندر نمی‌شود (هیچ کنشِ ساختگی) — همان
//     قراردادِ نشانگرِ r234؛ snapshotِ سرور null است پس صفرِ ناسازگاریِ
//     هیدریشن (ایدئومِ r231/r234).
//   • روی خودِ نمایِ ضمیمه پنهان می‌شود — نشانگرِ سرِ ضمیمه همان‌جاست و
//     بودجهٔ هدر (Task 80) نباید خرجِ دکمهٔ تکراری شود.
//   • واکنش‌پذیر با storeِ خارجیِ bg-reading: شنیدنِ یک واک در ضمیمه
//     دکمهٔ هدر را بی‌درنگ تازه می‌کند (تولوتیپ و مقصد).
//   • کلیک = ناوبریِ view از قلابِ مشترکِ سه‌دره (r236) — صفرِ نوشتنِ
//     استورِ یادگیری.
// ------------------------------------------------------------------

import { useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import {
  APPENDIX_SCOPE_LABELS,
  appendixResumeServerSnapshot,
  appendixResumeSnapshot,
  clearAppendixResume,
  subscribeAppendixResume,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { useAppendixResumeNav } from "../shared/use-appendix-resume-nav";
import { useToast } from "@/hooks/use-toast";

export default function HeaderResumeButton() {
  const item = useSyncExternalStore(
    subscribeAppendixResume,
    appendixResumeSnapshot,
    appendixResumeServerSnapshot,
  );
  const view = useStudy((s) => s.view);
  const navigateResume = useAppendixResumeNav();
  const { toast } = useToast();

  // راند ۲۳۷ — کلیکِ راست رویِ دکمهٔ هدر = پاک‌کردنِ رکورد (بندِ ① پیشنهادِ
  // ۲۳۶). پاک‌کردنِ فوری + توست — همان سبکِ قطعِ همگام‌سازی؛ رکوردِ پاک‌شده
  // با نخستین دیدنِ بعدی در ضمیمه دوباره ساخته می‌شود، پس کنشِ کم‌خطر است.
  const handleClear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    clearAppendixResume();
    toast({
      title: "ادامهٔ مطالعه پاک شد",
      description: "نشانگرِ آخرین موضوع برداشته شد — با نخستین دیدنِ بعدی در ضمیمه دوباره ساخته می‌شود.",
      duration: 3000,
    });
  };

  // بی‌رکورد یا خودِ ضمیمه = هیچ (قراردادِ صداقت + بودجهٔ هدر)
  if (!item || view.type === "appendix") return null;

  const layer = APPENDIX_SCOPE_LABELS[item.scope];
  const tooltip = `ادامهٔ مطالعه از «${item.title}» در ${layer}${item.hint ? ` — ${item.hint}` : ""}`;

  return (
    <button
      type="button"
      onClick={() => navigateResume(item)}
      onContextMenu={handleClear}
      aria-label={tooltip}
      title={tooltip}
      data-testid="header-resume-button"
      className="flex h-11 min-w-11 max-w-[13rem] shrink-0 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 shadow-sm transition-[background-color,color,border-color,transform] hover:bg-emerald-100 hover:border-emerald-300 active:scale-[0.96] dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
    >
      <Play size={15} className="shrink-0" />
      <span className="hidden min-w-0 truncate text-[12.5px] font-extrabold min-[420px]:inline">
        ادامه از «{item.title}»
      </span>
    </button>
  );
}
