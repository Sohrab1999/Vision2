"use client";

// ---------------------------------------------------------------------
// راند ۲۴۶ — درِ ششمِ حلقهٔ «ادامهٔ مطالعه» (بندِ ② پیشنهادِ ۲۴۵): خطِ
// «ادامهٔ مطالعه» در تبِ تست‌ها/نتیجهٔ هر درس — جایی که یادگیرنده نتیجه
// می‌گیرد، راهِ برگشت به ضمیمه هم آن‌جاست.
//
// قراردادهایِ حلقه (عینِ درهایِ دیگر):
//   • بی‌رکورد = هیچ — غیبتِ صادقانه، نه ردیفِ بی‌کنش (قراردادِ r236).
//   • کلیک = ناوبریِ view از قلابِ مشترکِ useAppendixResumeNav (r236) —
//     پرش ≠ نوشتن؛ صفرِ نوشتن در استورِ یادگیری.
//   • واکنش‌پذیر با storeِ خارجیِ bg-reading (ایدئومِ r231): رکوردِ نو
//     یا پاک‌شده بی‌درنگ ردیف را می‌سازد/می‌برد.
//   • برچسبِ لایه از APPENDIX_SCOPE_LABELS — هیچ نسخهٔ دستیِ نگاشت.
// ---------------------------------------------------------------------

import { useSyncExternalStore } from "react";
import { BookOpen, Play } from "lucide-react";
import {
  APPENDIX_SCOPE_LABELS,
  appendixResumeServerSnapshot,
  appendixResumeSnapshot,
  subscribeAppendixResume,
} from "@/lib/bg-reading";
import { useAppendixResumeNav } from "./use-appendix-resume-nav";
import { RESUME_FOCUS_RING } from "@/lib/study-theme";

export default function AppendixResumeRow() {
  const item = useSyncExternalStore(
    subscribeAppendixResume,
    appendixResumeSnapshot,
    appendixResumeServerSnapshot,
  );
  const navigateResume = useAppendixResumeNav();

  // بی‌رکورد = هیچ (صداقتِ nav-resume — هیچ کنشِ ساختگی)
  if (!item) return null;

  const layer = APPENDIX_SCOPE_LABELS[item.scope];
  const tooltip = `ادامهٔ مطالعه از «${item.title}» در ${layer}${item.hint ? ` — ${item.hint}` : ""}`;

  return (
    <button
      type="button"
      onClick={() => navigateResume(item)}
      aria-label={tooltip}
      title={tooltip}
      data-testid="results-resume-row"
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-right shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-emerald-50 hover:shadow-md active:scale-[0.96] dark:border-emerald-800 dark:bg-emerald-900/25 dark:hover:bg-emerald-900/40 ${RESUME_FOCUS_RING}`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-600/25">
          <Play size={18} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
            ادامهٔ مطالعه از «{item.title}»
          </span>
          {/* متنِ کم‌رنگ = توکنِ بِسِ text-stone-500 — kernelِ دارک خودش روشنش می‌کند (قراردادِ r172) */}
          <span className="block truncate text-[12px] text-stone-500">
            در {layer} — تست تمام شد؟ از همین‌جا به ضمیمه برگرد
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-600/25">
        <BookOpen size={15} />
        ادامه
      </span>
    </button>
  );
}
