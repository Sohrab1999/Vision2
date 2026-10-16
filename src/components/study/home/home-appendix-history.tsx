"use client";

// ------------------------------------------------------------------
// راند ۲۳۸ — سینیِ «اخیراً در ضمیمه» زیرِ کارتِ ضمیمهٔ کتاب در خانه
// (بندِ ① پیشنهادِ ۲۳۷): سه چیپِ آخر از همان تاریخچهٔ vision2-bg-history
// (بدونِ کلیدِ تازه). از home-tools جدا شد چون دو گاردِ معماریِ آن فایل
// را می‌بندند: DEC-8 (کاشیِ خنثی — هیچ سطحِ پاستلی در فایلِ گریدِ
// ابزارها) و پردهٔ alpha-80/95 (سطحِ نیمه‌شفافِ سفید فقط در دکمهٔ
// سخنگو مجاز است) — چیپ‌ها پس سطحِ سفیدِ توپر دارند که باندِ سراسریِ
// .dark خودش تیره‌اش می‌کند. سطوحِ زمردی بدونِ dark: — باندِ سراسریِ
// .dark همین مقادیر را می‌پوشاند، همان ایدئومِ بخشِ «ادامهٔ مطالعه»
// در پروفایل (r237).
// کلیکِ چیپ = ناوبریِ view از قلابِ مشترک — صفرِ نوشتنِ استور؛ رکوردِ
// «ادامهٔ مطالعه» دست‌نخورده می‌ماند (پرش ≠ نوشتن). مستقل از رکوردِ
// اصلی: بعد از پاک‌کردنِ رکورد هم چیپ‌ها حاضرند (دو معنایِ جدا —
// قراردادِ ۲۳۷: «ادامه»=آخرین، «اخیراً»=چند تایِ آخر).
// ------------------------------------------------------------------

import { History } from "lucide-react";
import { APPENDIX_SCOPE_LABELS, JUMP_VS_WRITE_FA, type AppendixResumeItem } from "@/lib/bg-reading";
import { faNum, RESUME_FOCUS_RING } from "@/lib/study-theme";

export default function HomeAppendixHistory({
  items,
  onJump,
}: {
  items: AppendixResumeItem[];
  onJump: (item: AppendixResumeItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div
      data-testid="home-appendix-history"
      className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-1.5"
    >
      <div className="mb-1 flex items-center gap-1 px-0.5 text-[9px] font-black text-stone-500 dark:text-stone-300">
        <History size={9} className="shrink-0 text-emerald-600" />
        اخیراً در ضمیمه
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[8.5px] font-black text-stone-600 dark:text-stone-300">
          {faNum(items.length)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((h) => (
          <button
            key={`${h.scope}:${h.id}`}
            type="button"
            data-testid={`home-history-item-${h.scope}-${h.id}`}
            onClick={() => onJump(h)}
            title={`پرش به «${h.title}» در ${APPENDIX_SCOPE_LABELS[h.scope]} — پرش ≠ نوشتنِ دستی؛ خواندنِ همان‌جا نشانگر را تازه می‌کند${h.hint ? ` — ${h.hint}` : ""}`}
            className={`flex min-h-7 items-center justify-between gap-1.5 rounded-lg border border-stone-100 bg-white px-2 text-right transition-[background-color,color,border-color,transform] hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.96] dark:border-stone-800 dark:hover:bg-emerald-900/30 ${RESUME_FOCUS_RING}`}
          >
            <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-stone-700 dark:text-stone-300">
              «{h.title}»
            </span>
            <span className="shrink-0 text-[8.5px] font-bold text-stone-500 dark:text-stone-300">
              {APPENDIX_SCOPE_LABELS[h.scope]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
