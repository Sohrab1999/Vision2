"use client";

// r414 — سررسیدهایِ SRS هر بانکِ تمرین برایِ میزبانِ دریل: انتخابِ بانک از
// استور (مرجعِ پایدار — قفلِ مرجعِ zustand) + فهرستِ memo با کلیدِ امروزِ
// مالکِ روز. خروجی اولویتدار است (بیشترینِ خطا نخست — drillDueBases) و
// مستقیم به پارامترِ dueِ موتورِ همان بانک میرود (سهمیه نزدِ موتور است).
// چهار میزبانِ نمایِ مشترک همین قلاب را مصرف میکنند — دو-نامِ r385 ممنوع.
import { useMemo } from "react";
import { drillDueBases } from "@/lib/drill-mistakes";
import { useStudy } from "@/lib/study-store";
import { todayStr } from "@/state/day-engine";

export default function useDrillDueBases(bankId: string): string[] {
  const bank = useStudy((s) => s.drillMistakes[bankId]);
  return useMemo(() => drillDueBases(bank, todayStr()), [bank]);
}
