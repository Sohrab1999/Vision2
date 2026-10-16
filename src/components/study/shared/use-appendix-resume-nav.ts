"use client";

// ------------------------------------------------------------------
// راند ۲۳۶ — قلابِ مشترکِ مسیرِ «ادامهٔ مطالعه»: نگاشتِ scope→view یک
// قرارداد است و در سه در تکرار شده بود (کارتِ خانه r233/r235، فرمان‌یاب
// r235، و از این راند هدرِ سراسری). یک قلاب، سه مصرف‌کننده — دیگر هیچ
// نسخهٔ دستیِ نگاشت نمی‌ماند که از رکوردِ scopeهایِ تازه عقب بماند
// (درسِ باگِ سیم‌کشیِ study-app در r235).
// ------------------------------------------------------------------

import { useStudy } from "@/lib/study-store";
import type { AppendixResumeItem } from "@/lib/bg-reading";

/** مسیرِ رفت‌وبرگشتِ «ادامهٔ مطالعه»: ناوبریِ view به لنگرِ همان لایه —
 * صفرِ نوشتن در استورِ یادگیری (همان قراردادِ r221/r224/r234/r235). */
export function useAppendixResumeNav(): (r: AppendixResumeItem) => void {
  const openAppendixTopic = useStudy((s) => s.openAppendixTopic);
  const openAppendixPosTable = useStudy((s) => s.openAppendixPosTable);
  const openAppendixVerb = useStudy((s) => s.openAppendixVerb);
  const openAppendixPhoneme = useStudy((s) => s.openAppendixPhoneme);
  const openAppendixAbbrev = useStudy((s) => s.openAppendixAbbrev);
  return (r) => {
    if (r.scope === "grammar") openAppendixTopic(r.id);
    else if (r.scope === "pos") openAppendixPosTable(r.id);
    else if (r.scope === "phonetics") openAppendixPhoneme(r.id);
    else if (r.scope === "abbrev") openAppendixAbbrev(r.id);
    else openAppendixVerb(r.id);
  };
}
