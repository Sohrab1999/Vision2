"use client";

// r412 — چیپِ پیشرفتِ ماندگارِ هر بانکِ تمرین، کنارِ دکمهٔ «تمرین»؛
// بی‌رکورد هیچ چیزی رندر نمیشود (قراردادِ صادقِ r234/r236). رکورد و
// سیاستِ سفرش نزدِ lib/drill-stats + ردیفِ drillStatsِ جدولِ SyncField است.
//
// r413 — از appendix-view به مؤلفهٔ مشترک کوچید: سه میزبانِ دیگرِ نمایِ
// دریل (vocab-tab r407 / dictionary-view r408 / booklet-grammar-view r406)
// همین چیپ را کنارِ دکمهٔ ورودِ خودشان میگیرند — دو-نامِ r385 ممنوع؛
// نخستین نسخه عیناً منتقل شد (بی تغییرِ رفتار، قفلهایِ r412 پابرجا).
//
// r419 — «ریتم، پیشِ ورود»: چیپِ بنفش فقط گذشته را میگفت (جلسهها و
// بهترین نمره) — حالِ SRSِ همین لحظه فقط پشتِ درِ تمرین بود (معرفیِ
// r414/r417). از این راند دو چیپِ فشرده کنارِ بنفش بالا میآیند: زمردیِ
// «N سررسید» و آسمانیِ «N درنفس» — عینِ خانوادههایِ معرفی (زمرد =
// دعوتِ کنش، آسمان = خبرِ برنامهای) با ariaِ کاملِ همان خانواده؛ زبانِ
// کامل نزدِ aria است، جدولِ میزبان فقط فشرده میخواهد. شمارش نزدِ همان
// مالکانِ lib است (countDrillDue / drillGraceSummary) — هیچ شمارشِ
// موازیای ساخته نمیشود؛ مسلط و تازهٔ امروزِ بیحق صادقانه شمرده
// نمیشوند (حکمِ r414/r417). بیِ بانکِ خطا هیچ SRS رندر نمیشود و بیِ
// رکوردِ جلسه هیچ چیزی — قراردادِ صفرِ صادقِ r236 پابرجا.
import { useMemo } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { faNum, percentFa } from "@/lib/study-theme";
import { countDrillDue, drillGraceSummary } from "@/lib/drill-mistakes";
import { todayStr } from "@/state/day-engine";

export default function DrillStatChip({ bankId }: { bankId: string }) {
  const stat = useStudy((s) => s.drillStats[bankId]);
  const mistakeBank = useStudy((s) => s.drillMistakes[bankId]);
  // r419 — حالِ SRSِ بانک: سررسید + دورهٔ نفس، با کلیدِ امروزِ مالکِ روز
  // (ایدئومِ use-drill-due r414 — memo رویِ مرجعِ بانک)
  const srs = useMemo(() => {
    const today = todayStr();
    return { due: countDrillDue(mistakeBank, today), grace: drillGraceSummary(mistakeBank, today) };
  }, [mistakeBank]);
  if (!stat) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700"
        aria-label={`پیشرفت این تمرین: ${faNum(stat.sessions)} جلسهٔ کامل، بهترین ${percentFa(stat.bestPercent)}`}
      >
        {faNum(stat.sessions)} جلسه · بهترین {percentFa(stat.bestPercent)}
      </span>
      {srs.due > 0 && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700"
          aria-label={`سررسیدهای مرور این تمرین: ${faNum(srs.due)} مورد`}
        >
          <RefreshCw size={11} aria-hidden />
          {faNum(srs.due)} سررسید
        </span>
      )}
      {srs.grace.count > 0 && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700"
          aria-label={
            srs.grace.nearestDays !== null
              ? `دورهٔ نفس این تمرین: ${faNum(srs.grace.count)} مورد در استراحت، نزدیکترین بازگشت ${faNum(srs.grace.nearestDays)} روز دیگر`
              : `دورهٔ نفس این تمرین: ${faNum(srs.grace.count)} مورد در استراحت`
          }
        >
          <Clock size={11} aria-hidden />
          {faNum(srs.grace.count)} درنفس
        </span>
      )}
    </span>
  );
}
