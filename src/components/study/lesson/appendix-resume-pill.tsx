"use client";

// ---------------------------------------------------------------------
// راند ۲۳۴ — نشانگرِ «ادامهٔ مطالعه» در سرِ خودِ ضمیمه (بندِ ② پیشنهادِ ۲۳۳):
// هر وقت رکوردِ «آخرینِ دیده‌شده» موجود باشد، کنارِ زیرتاب‌ها یک دکمهٔ
// زمردیِ «ادامه از «…»» می‌روید و با یک کلیک به همان‌جا برمی‌گرداند —
// بدونِ چرخشِ استور (رفت‌وبرگشتِ کاملاً محلی: تعویضِ زیرتب + لنگرِ
// یک‌بارِ مصرفِ همان زیرتب).
//
// رکورد از storeِ خارجیِ bg-reading می‌آید (ایدئومِ r231: useSyncExternalStore
// با snapshotِ cacheشده — صفرِ mismatchِ هیدریشن؛ server snapshot = null و
// نشانگر تا نخستین نوشتنِ واقعی اصلاً رندر نمی‌شود). نوشتن در هر لایه
// (toggleِ موضوع، پرشِ جدول، روخوانیِ فعل) مشترکین را خبر می‌کند و دکمه
// بی‌درنگ تازه می‌شود.
//
// راند ۲۳۷ — کلیکِ راست رویِ نشانگر هم پاک می‌کند (تقارنِ کنترل با هدر).
//
// راند ۲۳۹ — «مسیرِ اخیر» (بندِ ① پیشنهادِ ۲۳۸): زیرِ نشانگرِ اصلی یک
// چیپِ فشرده با جدیدترینِ ورودیِ دیگرِ تاریخچه (vision2-bg-history —
// بدونِ کلیدِ تازه؛ خودِ رکوردِ فعلی هرگز چیپ نمی‌شود). کلیک = همان
// onGoِ محلیِ والد — پرش، نه نوشتن؛ رکوردِ «ادامهٔ مطالعه» دست‌نخورده
// می‌ماند. مستقل از رکوردِ اصلی (قراردادِ دو-معناییِ ۲۳۷): بعد از
// پاک‌کردنِ رکورد هم چیپ حاضر است. حلقهٔ کیبوردِ واحد (RESUME_FOCUS_RING)
// رویِ هر دو دکمه — بندِ ② پیشنهادِ ۲۳۸.
// ---------------------------------------------------------------------

import { useSyncExternalStore } from "react";
import { History, Play } from "lucide-react";
import {
  APPENDIX_SCOPE_LABELS,
  appendixHistoryServerSnapshot,
  appendixHistorySnapshot,
  appendixResumeServerSnapshot,
  appendixResumeSnapshot,
  clearAppendixResume,
  subscribeAppendixHistory,
  subscribeAppendixResume,
  type AppendixScope,
} from "@/lib/bg-reading";
import { useToast } from "@/hooks/use-toast";
import { RESUME_FOCUS_RING } from "@/lib/study-theme";

export default function AppendixResumePill({
  onGo,
}: {
  /** رفت‌وبرگشتِ محلیِ والد — زیرتبِ لایه را باز می‌کند و لنگرِ یک‌بارِ مصرفش را می‌گذارد. */
  onGo: (scope: AppendixScope, id: string) => void;
}) {
  const item = useSyncExternalStore(
    subscribeAppendixResume,
    appendixResumeSnapshot,
    appendixResumeServerSnapshot,
  );
  // راند ۲۳۹ — تاریخچه با snapshotِ جدا اما همان ایدئوم؛ فقط جدیدترینِ
  // «دیگر» به‌شکلِ یک چیپِ فشرده می‌آید (بودجهٔ سرِ ضمیمه — Task 80).
  const history = useSyncExternalStore(
    subscribeAppendixHistory,
    appendixHistorySnapshot,
    appendixHistoryServerSnapshot,
  );
  const recent = history.find(
    (h) => !(item && h.scope === item.scope && h.id === item.id),
  );
  const { toast } = useToast();
  if (!item && !recent) return null;

  // راند ۲۳۷ — کلیکِ راست رویِ نشانگر هم پاک می‌کند (تقارنِ کنترل با هدر —
  // بندِ ① پیشنهادِ ۲۳۶): پاک‌کردنِ فوری + توست، بدونِ منو و بدونِ چرخشِ استور.
  const handleClear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    clearAppendixResume();
    toast({
      title: "ادامهٔ مطالعه پاک شد",
      description: "نشانگرِ آخرین موضوع برداشته شد — با نخستین دیدنِ بعدی در ضمیمه دوباره ساخته می‌شود.",
      duration: 3000,
    });
  };

  const layer = item ? APPENDIX_SCOPE_LABELS[item.scope] : "";
  const tooltip = item
    ? `ادامهٔ مطالعه از «${item.title}» در ${layer}${item.hint ? ` — ${item.hint}` : ""}`
    : "";

  return (
    <div className="flex flex-col items-start gap-1" data-testid="appendix-resume-cluster">
      {item && (
        <button
          type="button"
          onClick={() => onGo(item.scope, item.id)}
          onContextMenu={handleClear}
          aria-label={tooltip}
          title={tooltip}
          data-testid="appendix-resume-pill"
          className={`inline-flex min-w-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-[13px] font-bold text-emerald-700 transition-[background-color,color,box-shadow] hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70 ${RESUME_FOCUS_RING}`}
        >
          <Play size={14} className="shrink-0" />
          <span className="min-w-0 truncate">
            ادامه از «{item.title}»
          </span>
        </button>
      )}
      {recent && (
        <button
          type="button"
          onClick={() => onGo(recent.scope, recent.id)}
          data-testid={`appendix-recent-chip-${recent.scope}-${recent.id}`}
          title={`پرش به «${recent.title}» در ${APPENDIX_SCOPE_LABELS[recent.scope]} — این پرش نشانگرِ «ادامهٔ مطالعه» را عوض نمی‌کند${recent.hint ? ` — ${recent.hint}` : ""}`}
          className={`inline-flex min-w-0 items-center gap-1 rounded-lg border border-stone-200 bg-transparent px-2 py-1 text-[11px] font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.96] dark:border-stone-700 dark:text-stone-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300 ${RESUME_FOCUS_RING}`}
        >
          <History size={10} className="shrink-0 text-emerald-600" />
          <span className="min-w-0 truncate">«{recent.title}»</span>
          <span className="shrink-0 text-[9px] font-bold text-stone-500 dark:text-stone-300">
            {APPENDIX_SCOPE_LABELS[recent.scope]}
          </span>
        </button>
      )}
    </div>
  );
}
