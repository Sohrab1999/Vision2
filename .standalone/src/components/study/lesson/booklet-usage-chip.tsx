"use client";

// ------------------------------------------------------------------
// راند ۳۸۹ — چیپِ «در جزوه · N» یک نام گرفت: BookletUsageChip
//
// سرشماریِ r389 (الگویِ ممیزیِ دوقلویِ r382..r388): قالبِ چیپِ
// «در جزوه · {faNum(sites.length)}» در پنج نما بایتبه‌بایت تکرار می‌شد —
// دیکشنری (r252) · تبِ واژگان و پشتِ فلش‌کارت (r253) · واژهٔ روز (r254) ·
// داورِ خطر (r255) — با شش عضوِ همسان در هر سایت:
//   ۱) title: «کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه»
//   ۲) aria-label: «کاربرد {en} در مکالمه‌ها و ریدینگ‌ها — {faNum(n)} مورد»
//   ۳) آیکونِ BookOpenText(11)
//   ۴) دروازهٔ صداقتِ r252: بی‌کاربرد، هیچ — sites.length === 0 → هیچ
//   ۵) جست‌وجویِ sites از تک‌منبعِ findWordUsages (word-usage r252)
//   ۶) سیم‌کشیِ هدفِ دیالوگِ مشترک: {en, sites} | null با باز/بستن
// قراردادِ واحد: «این واژه کجای جزوه آمده؟» — کلیک، دیالوگِ مشترکِ
// word-usage-dialog (تک‌منبعِ r253) را با هدفِ واقعی باز میکند.
//
// حکمِ «نخیر»ها (درسِ r386 — فقط زیرگروهِ بایتهمسان یکجا میشود):
//   · چیپِ سرصفحهٔ دیالوگ «در جزوه · N کاربرد...» (word-usage-dialog r267) —
//     قراردادِ دیگر: عنوانِ دیالوگ با لنزِ نوع و کلِ سرشماری — دستنخورده.
//   · باندهایِ سرشماریِ «X از Y واژه/سلول در جزوه» (vocab-tab r257 ·
//     word-family-table-card r256) — نمایشِ سرشماری، نه حضورِ یک واژه.
//   · «{faNum(mistakes)} بار غلط» (danger-words) — تک‌سایت، دوقلو نیست.
// گویش‌هایِ میزبان که عمدی میمانند (host-decidesِ r259/r263):
//   · testidِ میزبان: danger-usage-chip-* / flash-usage-chip / usage-chip-*
//   · stopPropagation: پشتِ فلش‌کارت و کارتِ بلدمِ تبِ واژگان (کلیکِ کارت
//     خودش را دارد)؛ ردیفِ دیکشنری/خطا و کارتِ واژهٔ روز بی‌نیاز
//   · دروازهٔ mounted: نماهایِ رندرِ سرور؛ ردیفِ داورِ خطر فقط سمتِ کلاینت
//     زندگی میکند و mounted نمیدهد (پیشفرضِ true)
//   · گویشِ بصری: tone="sky" (پیشفرض — سه نما) / tone="flip" (پشتِ فلش‌کارت —
//     سفیدِ رویِ گرادیانِ تیره) + className پیشوندی (mt-1.5 واژهٔ روز)
// قفلهایِ پیشینِ r252..r271 (testidها، aria، رفتارِ stopPropagation،
// دروازهٔ صداقت) همگی پابرجا — استخراج، شکل را عوض نمیکند.
// ------------------------------------------------------------------

import { BookOpenText } from "lucide-react";
import { useState } from "react";
import { faNum } from "@/lib/study-theme";
import { findWordUsages, type WordUsageSite } from "@/lib/word-usage";
import type { WordUsageTarget } from "./word-usage-dialog";

/** سیم‌کشیِ هدفِ دیالوگِ «کاربرد در جزوه» — پنج نما یک قرارداد.
 *  دیالوگ خودش سمتِ میزبان رندر میشود (میزبانِ دستارمند مثلِ دیکشنری
 *  onOpenLesson خودش را میدهد — host-decidesِ r263). */
export function useBookletUsageTarget(): {
  target: WordUsageTarget | null;
  open: (t: WordUsageTarget) => void;
  close: () => void;
} {
  const [target, setTarget] = useState<WordUsageTarget | null>(null);
  return { target, open: setTarget, close: () => setTarget(null) };
}

// دو گویشِ بصریِ موجود در املاک — دقیقاً همان رشتههایِ پیشینِ نماهایِ پنجگانه
const SKY_CHIP =
  "inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50/60 px-1.5 py-0.5 text-[10.5px] font-bold text-sky-700 transition-[background-color,color,border-color,transform] active:scale-[0.96]";
const FLIP_CHIP =
  "flip-pair-chip inline-flex items-center gap-1 rounded-md border border-white/30 bg-black/20 px-1.5 py-0.5 text-[10.5px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-black/30 active:scale-[0.96]";

/** چیپِ «در جزوه · N» — مالکِ یکتایِ قالب؛ بی‌کاربرد یا پیشِ آبرسانی، هیچ.
 *  sites از تک‌منبعِ findWordUsages میآید (کشِ ماژولِ r252 — ارزان در هر رندر). */
export default function BookletUsageChip(props: {
  /** واژهٔ هدف — مالکِ aria-label و جست‌وجویِ sites */
  en: string;
  /** دروازهٔ آبرسانیِ میزبان (useMounted) — پیشفرضِ true برایِ ردیفهایِ
   *  کلاینتمحور مثلِ داورِ خطر */
  mounted?: boolean;
  /** testidِ میزبان — قراردادِ نامگذاریِ هر نما دستنخورده میماند (r252..r255) */
  testid: string;
  /** میزبانِ هدف — معمولاً openِ useBookletUsageTarget */
  onOpen: (t: WordUsageTarget) => void;
  /** کارتهایی که کلیکِ خودشان را دارند — چیپ نباید کارت را ببلعد */
  stopPropagation?: boolean;
  /** گویشِ بصری: sky (پیشفرض) / flip (پشتِ فلشکارت) */
  tone?: "sky" | "flip";
  /** پیشوندِ چیدمانِ میزبان (مثلاً mt-1.5 واژهٔ روز) */
  className?: string;
}) {
  const { en, mounted = true, testid, onOpen, stopPropagation, tone = "sky", className } = props;
  if (!mounted) return null;
  const sites: WordUsageSite[] = findWordUsages(en);
  if (sites.length === 0) return null; // صداقتِ r252: بیکاربرد، هیچ
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        onOpen({ en, sites });
      }}
      title="کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه"
      aria-label={`کاربرد ${en} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`}
      className={[className, tone === "flip" ? FLIP_CHIP : SKY_CHIP].filter(Boolean).join(" ")}
    >
      <BookOpenText size={11} aria-hidden />
      در جزوه · {faNum(sites.length)}
    </button>
  );
}
