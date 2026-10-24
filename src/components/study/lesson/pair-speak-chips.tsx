"use client";

// ------------------------------------------------------------------
// راند ۳۹۰ — چیپِ «روخوانی جفت» یک نام گرفت: PairSpeakChips
//
// سرشماریِ r390 (الگویِ ممیزیِ دوقلویِ r382..r389): دکمهٔ جفتِ
// مترادف/متضاد با شش عضوِ همسان در شش نما تکرار می‌شد — دیکشنری (r252
// خانوادهٔ جفت‌ها)، تبِ واژگان، فلش‌کارت، واژهٔ روز، واژه‌هایِ من،
// داورِ خطر — با ارکانِ بایتهمسان:
//   ۱) key: `${p.kind}-${p.other}-${p.lessonId}`
//   ۲) title: «روخوانی جفت»
//   ۳) aria-label: «{مترادف|متضاد}ِ {en}: {p.other} — روخوانی»
//   ۴) آیکونِ kind: ≈ (syn) / ↔ (ant) با dir="ltr" برایِ همتا
//   ۵) کلیک: speak(p.other, 0.95, undefined, onError) — سرعتِ ۰٫۹۵ و
//      درگاهِ خطا (r345: شکستِ صدا ساکت نمی‌ماند — زبانِ خانوادهٔ
//      «🔇 پخش صدا ممکن نشد» سمتِ میزبان میماند)
//   ۶) چیپِ سرریزِ «+N» با faNum — فقط وقتی جفت‌ها از سقف بیشترند
// قراردادِ واحد: «کلیکِ همتا را روخوانی میکند» — و هیچ فراخوانِ
// بی-onErrorای در املاک زنده نمیماند.
//
// گویشهایِ میزبانِ عمدی (host-decides؛ مستند در سرشماریِ راند):
//   · ظرفِ چیدمان سمتِ میزبان میماند (mt-1/mt-1.5 · div/span ·
//     max-w-full justify-center) — کامپوننت فقط چیپها + سرریز میدهد.
//   · stopPropagation: کارتِ بلدمِ تبِ واژگان و پشتِ فلش‌کارت (کلیکِ
//     کارت خودش را دارد)؛ ردیفِ دیکشنری/واژه‌هایِ من/خطر و کارتِ
//     واژهٔ روز بی‌نیاز
//   · دروازهٔ mounted/مشتقِ pairs سمتِ میزبان — نماهایِ رندرِ سرور
//     قبلِ آبرسانی چیپ نمیدهند
//   · دو گویشِ بصریِ نامدار: tone="sky" (پیشفرض — emerald/rose با
//     dict-pair-chip) / tone="flip" (پشتِ فلش‌کارت — سفیدِ رویِ
//     گرادیان با حجابِ تیرهٔ چیپ، حکمِ r333 — رشته در FLIP_CHIP)
//   · گویشِ فشردهٔ ردیفِ خطر: compact (text-[10px]) + max={2} +
//     overflowTitle («ردیف‌های جفت دیگر در تبِ مترادف و متضاد درس»)
// حکمهایِ «نخیر»: SpeakButton (درگاهِ ۱۵فایله) و روخوانیهایِ
// تک‌واژه/جمله قراردادهایِ خودشان را دارند؛ قفلهایِ r345 (زبانِ
// خانوادهٔ شکست) و testidها/کلاسها (dict-pair-chip/flip-pair-chip)
// همگی پابرجا — استخراج، شکل را عوض نمیکند.
// ------------------------------------------------------------------

import { faNum } from "@/lib/study-theme";
import { speak } from "@/lib/speak";
import type { SynAntPairEntry } from "@/lib/syn-ant-lookup";

// رشتههایِ دقیقاً پیشینِ نماهایِ ششگانه — دو گویشِ بصری + سرریز
const skyKind = (kind: "syn" | "ant", compact?: boolean): string =>
  `dict-pair-chip inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[${compact ? "10" : "10.5"}px] font-bold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
    kind === "syn"
      ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
      : "border-rose-200 bg-rose-50/60 text-rose-700"
  }`;
const FLIP_CHIP =
  "flip-pair-chip inline-flex items-center gap-0.5 rounded-md border border-white/30 bg-black/20 px-1.5 py-0.5 text-[10.5px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-black/30 active:scale-[0.96]";
const skyOverflow = (compact?: boolean): string =>
  `rounded-md bg-stone-100 px-1.5 py-0.5 text-[${compact ? "10" : "10.5"}px] font-bold text-stone-500`;
const FLIP_OVERFLOW =
  "rounded-md bg-black/20 px-1.5 py-0.5 text-[10.5px] font-bold text-white/90";

/** چیپهایِ «روخوانی جفت» + سرریزِ «+N» — مالکِ یکتایِ قالب؛ ظرفِ چیدمان
 *  سمتِ میزبان است (مستند در سرصفحه). بی‌جفت چیزی نمیدهد. */
export default function PairSpeakChips(props: {
  /** جفتهایِ synAntPairsFor — میزبانِ دروازهٔ mounted را خودش میدهد */
  pairs: SynAntPairEntry[];
  /** واژهٔ هدف — مالکِ slotِ aria */
  en: string;
  /** درگاهِ خطایِ r345 — از r394 مالکِ نامدارِ توستِ خانواده: speakFailToast (speak.ts) */
  onSpeakError: () => void;
  /** سقفِ چیپها — پیشفرضِ ۳؛ ردیفِ خطر ۲ میفرستد (گویشِ فشرده) */
  max?: number;
  /** کارتهایی که کلیکِ خودشان را دارند — چیپ نباید کارت را ببلعد */
  stopPropagation?: boolean;
  /** گویشِ بصری: sky (پیشفرض) / flip (پشتِ فلشکارت) */
  tone?: "sky" | "flip";
  /** گویشِ فشردهٔ ردیفِ خطر: text-[10px] */
  compact?: boolean;
  /** titleِ چیپِ سرریز — فقط داورِ خطر میدهد */
  overflowTitle?: string;
}) {
  const { pairs, en, onSpeakError, max = 3, stopPropagation, tone = "sky", compact, overflowTitle } = props;
  return (
    <>
      {pairs.slice(0, max).map((p) => (
        <button
          key={`${p.kind}-${p.other}-${p.lessonId}`}
          type="button"
          onClick={(e) => {
            if (stopPropagation) e.stopPropagation();
            void speak(p.other, 0.95, undefined, onSpeakError);
          }}
          title="روخوانی جفت"
          aria-label={`${p.kind === "syn" ? "مترادف" : "متضاد"}ِ ${en}: ${p.other} — روخوانی`}
          className={tone === "flip" ? FLIP_CHIP : skyKind(p.kind, compact)}
        >
          <span aria-hidden className="font-black">{p.kind === "syn" ? "≈" : "↔"}</span>
          <span dir="ltr">{p.other}</span>
        </button>
      ))}
      {pairs.length > max && (
        <span className={tone === "flip" ? FLIP_OVERFLOW : skyOverflow(compact)} title={overflowTitle}>
          +{faNum(pairs.length - max)}
        </span>
      )}
    </>
  );
}
