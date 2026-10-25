"use client";

// r412 — چیپِ پیشرفتِ ماندگارِ هر بانکِ تمرین، کنارِ دکمهٔ «تمرین»؛
// بی‌رکورد هیچ چیزی رندر نمیشود (قراردادِ صادقِ r234/r236). رکورد و
// سیاستِ سفرش نزدِ lib/drill-stats + ردیفِ drillStatsِ جدولِ SyncField است.
//
// r413 — از appendix-view به مؤلفهٔ مشترک کوچید: سه میزبانِ دیگرِ نمایِ
// دریل (vocab-tab r407 / dictionary-view r408 / booklet-grammar-view r406)
// همین چیپ را کنارِ دکمهٔ ورودِ خودشان میگیرند — دو-نامِ r385 ممنوع؛
// نخستین نسخه عیناً منتقل شد (بی تغییرِ رفتار، قفلهایِ r412 پابرجا).
import { useStudy } from "@/lib/study-store";
import { faNum, percentFa } from "@/lib/study-theme";

export default function DrillStatChip({ bankId }: { bankId: string }) {
  const stat = useStudy((s) => s.drillStats[bankId]);
  if (!stat) return null;
  return (
    <span
      className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700"
      aria-label={`پیشرفت این تمرین: ${faNum(stat.sessions)} جلسهٔ کامل، بهترین ${percentFa(stat.bestPercent)}`}
    >
      {faNum(stat.sessions)} جلسه · بهترین {percentFa(stat.bestPercent)}
    </span>
  );
}
