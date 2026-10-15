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
// ---------------------------------------------------------------------

import { useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import {
  APPENDIX_SCOPE_LABELS,
  appendixResumeServerSnapshot,
  appendixResumeSnapshot,
  subscribeAppendixResume,
  type AppendixScope,
} from "@/lib/bg-reading";

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
  if (!item) return null;

  const layer = APPENDIX_SCOPE_LABELS[item.scope];
  const tooltip = `ادامهٔ مطالعه از «${item.title}» در ${layer}${item.hint ? ` — ${item.hint}` : ""}`;

  return (
    <button
      type="button"
      onClick={() => onGo(item.scope, item.id)}
      aria-label={tooltip}
      title={tooltip}
      data-testid="appendix-resume-pill"
      className="inline-flex min-w-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-[13px] font-bold text-emerald-700 transition-[background-color,color,box-shadow] hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
    >
      <Play size={14} className="shrink-0" />
      <span className="min-w-0 truncate">
        ادامه از «{item.title}»
      </span>
    </button>
  );
}
