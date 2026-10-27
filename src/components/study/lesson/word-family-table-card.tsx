// راند ۲۲۳ — کارتِ جدولِ «اجزای کلماتی» از خودِ جزوه‌ها: استخراج‌شده از
// appendix-view تا ضمیمه و تبِ واژگانِ درس‌ها (بندِ ① نقشهٔ ۲۲۲) هر دو از
// یک رندر بخورند — همان الگویِ TopicCard راند ۲۲۰، یک منبعِ حقیقت.
// بندِ ② نقشهٔ ۲۲۲ هم همین‌جا فرود آمد: دکمهٔ تلفظ حالا روی هر چهار ستونِ
// انگلیسیِ غیرتهی است (قبلاً فقط اسم)؛ خانهٔ خالیِ جزوه باز هم خطِ تیرهٔ
// کم‌رنگ و بدونِ هیچ دکمه‌ای — صفرِ صادقانه دست‌نخورده.
// راند ۲۲۴ — رفت‌وبرگشتِ ضمیمه↔درس (آینهٔ TopicCard راند ۲۲۱): ریشهٔ کارت
// لنگرِ DOMِ «wf-table-<id>» با scroll-mt هدرِ چسبان را حمل می‌کند و چیپِ
// «درسِ مرتبط» در هدر (کارت آکاردئون ندارد — چیپ جای خودش در ردیفِ هدر است)
// فقط در بسترِ ضمیمه رندر می‌شود؛ درس هرگز به خودش لینک نمی‌شود.
// راند ۲۲۷ — ناوبریِ پیوستهٔ جدول‌ها (آینهٔ TopicCard راند ۲۲۶):
// prevTable/nextTable/onNavigateTable/tablePosition/tableTotal فقط در بسترِ
// ضمیمه پر می‌شوند — نوارِ «قبلی/بعدی + X از Y» پانوشتِ کارت است (کارتِ جدول
// آکاردئون ندارد و همیشه باز است؛ ناوبری = اسکرولِ محلی به لنگرِ هدف، بدونِ
// چرخشِ استور). همسایه‌ها از فهرستِ رندرشده (فیلترِ فعال) می‌آیند — برچسبِ
// همسایه پایه را هم می‌گوید تا مرزِ بین‌پایه‌ای (دهم·چهارم ← یازدهم·اول) روشن بماند.
// راند ۲۵۵ — پنجمین مصرف‌کنندهٔ «کاربرد در جزوه» (بندِ ① پیشنهادِ ۲۵۴):
// هر سلولِ انگلیسیِ غیرتهی که در متنِ مکالمه‌ها/ریدینگ‌هایِ جزوه واقعاً آمده
// باشد چیپِ فشردهٔ آسمانی (آیکن + شمارش — جدولِ پنج‌ستونه متر است، متنِ کامل
// چیپ در title/aria-label) می‌گیرد و کلیکش دیالوگِ مشترکِ خانواده را باز
// می‌کند؛ بی‌کاربرد، هیچ (صداقتِ r252). چون این کارت هم در ضمیمه و هم در
// تبِ واژگانِ درس رندر می‌شود، هر دو سطح با یک رندر واردِ خانواده شدند —
// و aria-label همان قراردادِ r253 را دارد: «مکالمه‌ها و ریدینگ‌ها»، هرگز
// «جزوه»ی برهنه (کلاسِ تصادمِ کوئریِ تبِ جزوه بسته می‌ماند).
// راند ۲۵۶ — بندِ ①+② پیشنهادِ ۲۵۵: هدرِ هر جدول چیپِ سرشماریِ آسمانی
// «N از M سلول در جزوه» دارد (داده از تک‌منبعِ wordFamilyUsageCensus؛
// بی‌کاربرد، هیچ) و propِ usedOnly (لنزِ «فقط کاربرددارها»ی ضمیمه) ردیف‌ها
// را به خانواده‌هایِ کاربرددار محدود می‌کند — چیپِ «N خانواده» در حالتِ لنز
// «N از M خانواده» می‌شود و جدولِ بی‌خانوادهٔ کاربرددار ردیفِ خالیِ صادقانه
// می‌گیرد، نه سکوتِ render.
// راند ۲۵۷ — بندِ ③ پیشنهادِ ۲۵۶: لنزِ معکوسِ «فقط بی‌کاربردها» — propِ
// unusedOnly (هم‌سطحِ usedOnly؛ دوتاییِ متقابلاً انحصاری در ضمیمه): ردیف‌ها
// به خانواده‌هایِ بی‌کاربرد محدود می‌شوند («مطالعهٔ هدفمندِ واژه‌هایی که
// هنوز در متن نیامده‌اند»)؛ چیپِ «N از M خانوادهٔ بی‌کاربرد» و جدولی که
// همهٔ خانواده‌هایش در متن زندگی می‌کنند ردیفِ خالیِ صادقانهٔ معکوس می‌گیرد.
// راند ۲۵۸ — بندِ ① پیشنهادِ ۲۵۷: هدرِ هر جدول هم‌سنگِ سرشماریِ آسمانیِ
// سلولی، سرشماریِ کهرباییِ «بی‌کاربرد» را هم می‌گیرد («N خانوادهٔ این
// جدول هنوز در متن نیامده» — spanِ اطلاعاتی، نه دکمه؛ هم‌هویتِ کهرباییِ
// لنزِ معکوسِ r257: amber-50/60/200/800 با ریمپِ تاریکِ kernel — صفرِ
// قانونِ CSSِ نو). بی‌خانوادهٔ بی‌کاربرد، هیچ (صداقتِ r252 در سطحِ هدر).
// راند ۲۵۹ — بندِ ③ پیشنهادِ ۲۵۸: چیپِ کهربایی در بسترِ میزبانِ لنزدار
// (ضمیمه) دکمه می‌شود — کلیکش همان لنزِ «فقط بی‌کاربردها»ی r257 را
// می‌چرخاند (قرینهٔ کلیکِ سطرِ نوارِ مقایسه‌ایِ r258) با aria-pressed و
// حالتِ پرشدهٔ فعال (bg-amber-100 — ریمپِ تاریکِ kernel موجود)؛ در بسترِ
// بی‌لنز (آکاردئونِ درس) همان spanِ اطلاعاتیِ r258 می‌ماند — الگویِ
// relatedLesson/onOpenLesson: میزبان تصمیم می‌گیرد کنش چیپ چیست.
// راند ۴۲۸ — لنگرِ سطریِ «خانوادهٔ واژه‌ها» (الگویِ سطرِ فعلِ r234 / کارتِ
// واژهٔ r427): propِ اختیاریِ focusRowWord (خودِ واژهٔ خانواده) سطرِ حاویِ
// آن را با پالسِ زمردیِ همخانواده (bg-emerald-50 + حلقهٔ درونیِ
// shadow-emerald-300؛ شب: کرنلِ اسکوپشدهٔ wf-row-pulse در globals —
// ریمپِ سراسریِ .dark .bg-white بر utilityِ شب غلبه میکند؛ درسِ
// r334/r338 که داوریِ همین راند زنده ثابت کرد) نشانه میرود و جدولِ
// بیِ آن واژه ساکتِ صادق میماند (گاردِ عضویت روی دادهٔ خودِ جدول —
// r236). شاخصِ سطرها شناسهٔ پایدارِ DOMِ سطرِ میزبان است
// (wf-row-<tid>-<idx>) که اسکرولِ عمیقِ ضمیمه به آن تکیه میکند.
import { useEffect, useMemo, useRef, useState } from "react";
import type { WordFamilyTable } from "@/data/word-families";
import { wordFamilyTableId } from "@/data/word-families";
import { faNum } from "@/lib/study-theme";
import {
  findWordUsages,
  wordFamilyUsageCensus,
  type WordUsageSite,
} from "@/lib/word-usage";
import { ChevronLeft, ChevronRight, GraduationCap, BookOpenText, EyeOff } from "lucide-react";
import SpeakButton from "../shared/speak-button";
import WordUsageDialog, { type WordUsageTarget } from "./word-usage-dialog";

/** سلولِ انگلیسیِ غیرتهی: واژه + دکمهٔ تلفظ (راند ۲۲۳ — بندِ ② نقشهٔ ۲۲۲)
 *  + چیپِ فشردهٔ «کاربرد در جزوه» (راند ۲۵۵) — فقط با تطبیقِ واقعی؛
 *  در جدولِ متر، آیکن + شمارش کافی است و نامِ کاملِ چیپ در title/aria-label
 *  با قراردادِ «مکالمه‌ها و ریدینگ‌ها» زندگی می‌کند. */
function EnSpeakCell({
  word,
  bold,
  onUsage,
}: {
  word: string;
  bold?: boolean;
  onUsage: (en: string, sites: WordUsageSite[]) => void;
}) {
  const sites = findWordUsages(word);
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`en-text text-[12.5px] ${bold ? "font-black text-violet-700" : "text-stone-600"}`}
        dir="ltr"
      >
        {word}
      </span>
      <SpeakButton text={word} size="sm" />
      {sites.length > 0 && (
        <button
          type="button"
          data-testid={`wf-usage-chip-${word.replace(/\s+/g, "-")}`}
          onClick={() => onUsage(word, sites)}
          title="کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه"
          aria-label={`کاربرد ${word} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`}
          className="inline-flex items-center gap-0.5 rounded-md border border-sky-200 bg-sky-50/60 px-1 py-0.5 text-[10px] font-black text-sky-700 transition-[background-color,color,border-color,transform] active:scale-[0.96]"
        >
          <BookOpenText size={10} aria-hidden />
          {faNum(sites.length)}
        </button>
      )}
    </span>
  );
}

export default function WordFamilyTableCard({
  table,
  relatedLesson,
  onOpenLesson,
  usedOnly = false,
  /** راند ۲۵۷ — لنزِ معکوسِ «فقط بی‌کاربردها» (فقط بسترِ ضمیمه): ردیف‌ها به
   *  خانواده‌هایِ بی‌کاربرد محدود می‌شوند؛ با usedOnly متقابلاً انحصاری‌اند
   *  (ضمیمه هرگز هر دو را هم‌زمان نمی‌فرستد). */
  unusedOnly = false,
  prevTable,
  nextTable,
  onNavigateTable,
  tablePosition,
  tableTotal,
  onToggleUnusedLens,
  unusedLensOn,
  focusRowWord,
}: {
  table: WordFamilyTable;
  /** درسِ مرتبط از WF_TABLE_ID_TO_LESSON — نبودش = بی‌چیپ («درس چهارمِ دهم»
   * در برنامه جای ندارد؛ صفرِ صادقانه). فقط بسترِ ضمیمه پرش می‌کند. */
  relatedLesson?: number;
  onOpenLesson?: () => void;
  /** راند ۲۵۶ — لنزِ «فقط کاربرددارها» (فقط بسترِ ضمیمه): ردیف‌ها به
   *  خانواده‌هایِ کاربرددار محدود می‌شوند؛ پیش‌فرضِ خاموش = همهٔ ردیف‌ها. */
  usedOnly?: boolean;
  /** راند ۲۵۷ — لنزِ معکوسِ «فقط بی‌کاربردها»: ردیف‌ها به خانواده‌هایِ
   *  بی‌کاربرد محدود می‌شوند؛ پیش‌فرضِ خاموش = همهٔ ردیف‌ها. */
  unusedOnly?: boolean;
  /** ناوبریِ پیوسته (r227) — همسایه‌ها از فهرستِ رندرشده (فیلترِ فعال)؛
   * فقط بسترِ ضمیمه؛ برچسب = «<پایه> · <درس>». */
  prevTable?: { id: string; title: string };
  nextTable?: { id: string; title: string };
  onNavigateTable?: (id: string) => void;
  tablePosition?: number;
  tableTotal?: number;
  /** راند ۲۵۹ — بندِ ③ پیشنهادِ ۲۵۸: میزبانِ لنزدار (ضمیمه) این callback را
   *  می‌دهد و چیپِ کهربایی به دکمهٔ چرخانندهٔ لنزِ «فقط بی‌کاربردها» بدل
   *  می‌شود (قرینهٔ کلیکِ سطرِ نوارِ مقایسه‌ایِ r258)؛ بی‌callback
   *  (آکاردئونِ درس) چیپ spanِ اطلاعاتیِ r258 می‌ماند — الگویِ
   *  relatedLesson/onOpenLesson: میزبان تصمیم می‌گیرد کنشِ چیپ چیست. */
  onToggleUnusedLens?: () => void;
  /** وضعیتِ فعلیِ لنزِ معکوس در میزبان — aria-pressed و حالتِ پرشدهٔ فعال. */
  unusedLensOn?: boolean;
  /** r428 — لنگرِ سطری: خودِ واژهٔ خانواده (سلولِ انگلیسیِ واقعی)؛ سطرِ
   *  حاویِ آن پالسِ زمردیِ ۱٫۶ثانیهای میگیرد. بیِ واژه یا واژهٔ بیگانه:
   *  هیچ — نه اسکرولِ برساخته، نه کلاسِ برساخته (r236). */
  focusRowWord?: string;
}) {
  // راند ۲۵۵ — هدفِ دیالوگِ مشترکِ «کاربرد در جزوه» برایِ همین جدول
  const [usage, setUsage] = useState<WordUsageTarget | null>(null);
  // راند ۲۵۶ — سرشماریِ جدول از تک‌منبعِ lib (همان پیاده‌سازی که لنزِ ضمیمه
  // می‌خورد)؛ findWordUsages کشِ ماژول دارد — memo فقط از محاسبهٔ دوباره می‌کاهد
  const census = useMemo(() => wordFamilyUsageCensus(table.families), [table]);
  const usedIdx = useMemo(() => new Set(census.usedFamilyIdx), [census]);
  // راند ۲۵۹ — نیمهٔ پنهانِ سرشماری؛ هم در spanِ r258 و هم در دکمهٔ نو
  const unusedFamilies = census.totalFamilies - census.usedFamilies;
  // r428 — پالسِ سطری (همان ایدئومِ timerِ بیرونِ cleanupِ r234/r427):
  // کپیِ prop به استیتِ درونی تا پاکشدنِ لنگرِ میزبان پالسِ تازهراهافتاده
  // را نکشد؛ پرشِ دوباره تایمرِ قبلی را پیشِ راهاندازیِ تازه پاک میکند.
  const pulseIdx = useMemo(() => {
    if (!focusRowWord) return -1;
    return table.families.findIndex((f) =>
      [f.noun, f.verb, f.adjective, f.adverb].includes(focusRowWord),
    );
  }, [focusRowWord, table]);
  const [pulseRowIdx, setPulseRowIdx] = useState<number>(-1);
  const pulseTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (pulseIdx < 0) return;
    // پالس درونِ rAF (ایدئومِ r234/r427 — setStateِ همگام در effect ممنوع):
    // پاکشدنِ لنگرِ میزبان (prop ← undefined ← cleanup) نباید تایمرِ
    // تازهراهافتاده را بکشد؛ پرشِ دوباره تایمرِ قبلی را پیشِ راهاندازیِ
    // تازه پاک میکند.
    const raf = requestAnimationFrame(() => {
      setPulseRowIdx(pulseIdx);
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => {
        pulseTimerRef.current = null;
        setPulseRowIdx(-1);
      }, 1600);
    });
    return () => cancelAnimationFrame(raf);
  }, [pulseIdx]);
  // خاموشیِ پالس هنگامِ پیادهشدن از جدول — فقط unmount
  useEffect(
    () => () => {
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    },
    [],
  );
  return (
    // لنگرِ اسکرولِ عمیق (r224) — scroll-mt برای فاصلهٔ هدرِ چسبان
    <div id={`wf-table-${wordFamilyTableId(table)}`} className="scroll-mt-24 overflow-hidden rounded-2xl border c-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-3">
        <span className="rounded-lg bg-violet-100 px-2 py-1 text-[11.5px] font-black text-violet-700">{table.grade}</span>
        <h3 className="text-[14px] font-extrabold text-stone-800">اجزای کلماتیِ {table.lesson}</h3>
        <span className="en-text text-[11px] font-bold text-stone-500" dir="ltr">{table.vision}</span>
        {relatedLesson !== undefined && onOpenLesson && (
          <button
            onClick={onOpenLesson}
            title={`همان جدول داخلِ درسِ ${faNum(relatedLesson)} — تبِ واژگان`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-2.5 py-1.5 text-[12px] font-extrabold text-violet-700 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-900/70"
          >
            <GraduationCap size={14} />
            درسِ مرتبط: درسِ {faNum(relatedLesson)}
          </button>
        )}
        {/* راند ۲۵۶ — سرشماریِ «کاربرد در جزوه» (بندِ ① پیشنهادِ ۲۵۵):
            همان ایدئومِ آسمانیِ چیپ‌هایِ r255 (ریمپِ تاریکِ kernel)؛
            spanِ اطلاعاتی است نه دکمه — کنشِ هر سلول، چیپِ خودِ سلول است؛
            بی‌کاربرد، هیچ (صداقتِ r252 در سطحِ جدول). */}
        {census.usedCells > 0 && (
          <span
            data-testid="wf-usage-census"
            title={`سلول‌های این جدول که در متنِ مکالمه‌ها و ریدینگ‌های جزوه آمده‌اند: ${faNum(census.usedCells)} از ${faNum(census.totalCells)}`}
            className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50/60 px-2.5 py-1 text-[11px] font-black text-sky-700"
          >
            <BookOpenText size={11} aria-hidden />
            {faNum(census.usedCells)} از {faNum(census.totalCells)} سلول در جزوه
          </span>
        )}
        {/* راند ۲۵۸/۲۵۹ — سرشماریِ کهرباییِ «بی‌کاربرد» (بندِ ① پیشنهادِ ۲۵۷ +
            بندِ ③ پیشنهادِ ۲۵۸): در بسترِ لنزدار (ضمیمه) دکمهٔ چرخانندهٔ لنزِ
            «فقط بی‌کاربردها» با aria-pressed و حالتِ پرشدهٔ فعال؛ در بسترِ
            بی‌لنز (آکاردئونِ درس) spanِ اطلاعاتیِ r258 — بی‌خانوادهٔ
            بی‌کاربرد، هیچ (صداقتِ r252). */}
        {unusedFamilies > 0 &&
          (onToggleUnusedLens ? (
            <button
              type="button"
              data-testid="wf-unused-census"
              onClick={onToggleUnusedLens}
              aria-pressed={!!unusedLensOn}
              title={
                unusedLensOn
                  ? "لنزِ «فقط بی‌کاربردها» روشن است — کلیک: بازگشت به همهٔ خانواده‌ها"
                  : "خانواده‌هایی که هنوز هیچ سلولشان در متنِ مکالمه‌ها و ریدینگ‌های جزوه نیامده — کلیک: نمایشِ همین خانواده‌ها"
              }
              aria-label={`${faNum(unusedFamilies)} خانوادهٔ این جدول هنوز در متن نیامده — کلیک: ${unusedLensOn ? "بازگشت به همهٔ خانواده‌ها" : "نمایشِ همین خانواده‌ها"}`}
              className={`inline-flex items-center gap-1 rounded-full border border-amber-200 px-2.5 py-1 text-[11px] font-black text-amber-800 transition-[background-color,color,border-color,box-shadow] ${
                unusedLensOn ? "bg-amber-100 shadow-sm" : "bg-amber-50/60"
              }`}
            >
              <EyeOff size={11} aria-hidden />
              {faNum(unusedFamilies)} خانوادهٔ این جدول هنوز در متن نیامده
            </button>
          ) : (
            <span
              data-testid="wf-unused-census"
              title="خانواده‌هایی که هنوز هیچ سلولشان در متنِ مکالمه‌ها و ریدینگ‌های جزوه نیامده — برایِ مطالعهٔ هدفمند"
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/60 px-2.5 py-1 text-[11px] font-black text-amber-800"
            >
              <EyeOff size={11} aria-hidden />
              {faNum(unusedFamilies)} خانوادهٔ این جدول هنوز در متن نیامده
            </span>
          ))}
        <span className="c-track-70 ms-auto rounded-full px-2.5 py-1 text-[11px] font-black text-stone-600">
          {usedOnly && census.usedFamilies < table.families.length
            ? `${faNum(census.usedFamilies)} از ${faNum(table.families.length)} خانواده`
            : unusedOnly && census.usedFamilies > 0
              ? `${faNum(table.families.length - census.usedFamilies)} از ${faNum(table.families.length)} خانوادهٔ بی‌کاربرد`
              : `${faNum(table.families.length)} خانواده`}
        </span>
      </div>
      <div className="max-h-[52vh] overflow-auto nice-scroll">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-violet-600 text-white">
              <th className="px-3 py-2.5 text-right text-[12px]">معنی</th>
              <th className="en-text px-3 py-2.5 text-[12px]" dir="ltr">Noun</th>
              <th className="en-text px-3 py-2.5 text-[12px]" dir="ltr">Verb</th>
              <th className="en-text px-3 py-2.5 text-[12px]" dir="ltr">Adjective</th>
              <th className="en-text px-3 py-2.5 text-[12px]" dir="ltr">Adverb</th>
            </tr>
          </thead>
          <tbody>
            {usedOnly && census.usedFamilies === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-[12.5px] font-bold text-stone-500">
                  در این جدول هیچ خانواده‌ای در متنِ مکالمه‌ها و ریدینگ‌های جزوه زندگی نمی‌کند
                </td>
              </tr>
            )}
            {/* راند ۲۵۷ — صداقتِ معکوس: جدولی که همهٔ خانواده‌هایش در متن
                زندگی می‌کنند در لنزِ «بی‌کاربرد» ردیفِ خالیِ صادقانه می‌گیرد. */}
            {unusedOnly && census.usedFamilies === table.families.length && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-[12.5px] font-bold text-stone-500">
                  در این جدول همهٔ خانواده‌ها در متنِ مکالمه‌ها و ریدینگ‌های جزوه زندگی می‌کنند
                </td>
              </tr>
            )}
            {table.families.map((f, fi) => {
              const isUsed = usedIdx.has(fi);
              if (usedOnly && !isUsed) return null; // لنزِ کاربرددارها (r256)
              if (unusedOnly && isUsed) return null; // لنزِ معکوس (r257)
              const isPulseRow = pulseRowIdx === fi; // r428 — پالسِ زمردیِ سطری
              return (
              <tr
                key={`${table.vision}-${table.lesson}-${fi}`}
                id={`wf-row-${wordFamilyTableId(table)}-${fi}`}
                className={`${
                  // r431 — قراردادِ «جایگزین، نه اضافه» رویِ زبرا: سطرِ پالس‌دار
                  // هرگز bg-white/bg-stone-50 را همزمان حمل نمیکند — در CSSِ
                  // کامپایلشده هر دو Utilityِ زبرا **پسِ** bg-emerald-50 میآیند
                  // (همان لایه، همان ویژگی) و با هم-سطحیِ خاصیت، زبرا برنده
                  // میشد — پالسِ روشنِ زمردی زیرِ زبرا دفن بود (تلهٔ r430 این
                  // بار برایِ bg؛ شاهدِ ایستایِ ترتیبِ کامپایل).
                  isPulseRow
                    // روشن: هستهٔ زمردیِ r234؛ شب: wf-row-pulseِ اسکوپشدهٔ globals
                    ? "bg-emerald-50 shadow-[inset_0_0_0_2px] shadow-emerald-300 wf-row-pulse transition-[background-color,box-shadow]"
                    : fi % 2 === 0
                      ? "bg-white"
                      : "bg-stone-50"
                }`}
              >
                <td className="px-3 py-2 text-[12.5px] font-semibold text-stone-700">
                  {f.fa || <span className="font-normal text-stone-300">—</span>}
                </td>
                <td className="px-3 py-2">
                  {f.noun ? (
                    <EnSpeakCell word={f.noun} bold onUsage={(en, sites) => setUsage({ en, sites })} />
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {f.verb ? <EnSpeakCell word={f.verb} onUsage={(en, sites) => setUsage({ en, sites })} /> : <span className="text-stone-300">—</span>}
                </td>
                <td className="px-3 py-2">
                  {f.adjective ? <EnSpeakCell word={f.adjective} onUsage={(en, sites) => setUsage({ en, sites })} /> : <span className="text-stone-300">—</span>}
                </td>
                <td className="px-3 py-2">
                  {f.adverb ? <EnSpeakCell word={f.adverb} onUsage={(en, sites) => setUsage({ en, sites })} /> : <span className="text-stone-300">—</span>}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ناوبریِ پیوسته (راند ۲۲۷) — پانوشتِ کارت مثلِ صفحه‌خوانیِ کتاب؛
          فقط وقتی میزبان (ضمیمه) همسایه‌ها و callback را داده باشد */}
      {onNavigateTable && tablePosition !== undefined && tableTotal !== undefined && (prevTable || nextTable) && (
        <div className="flex items-center gap-2 border-t border-stone-100 c-track-70 p-2 dark:border-stone-700 dark:bg-stone-800/50">
          {prevTable ? (
            <button
              type="button"
              onClick={() => onNavigateTable(prevTable.id)}
              aria-label={`جدولِ قبلی: ${prevTable.title}`}
              className="inline-flex min-w-0 flex-1 items-center justify-end gap-1.5 rounded-lg px-2.5 py-2 text-right text-[12px] font-bold text-stone-600 transition-[background-color,color] hover:bg-stone-100 hover:text-stone-800 dark:text-stone-300 dark:hover:bg-stone-700/50 dark:hover:text-stone-100"
            >
              <ChevronRight size={15} className="shrink-0" />
              <span className="min-w-0 truncate">قبلی: {prevTable.title}</span>
            </button>
          ) : (
            <span className="flex-1" />
          )}
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-stone-600 shadow-sm dark:bg-stone-800 dark:text-stone-300">
            {faNum(tablePosition)} از {faNum(tableTotal)}
          </span>
          {nextTable ? (
            <button
              type="button"
              onClick={() => onNavigateTable(nextTable.id)}
              aria-label={`جدولِ بعدی: ${nextTable.title}`}
              className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-bold text-stone-600 transition-[background-color,color] hover:bg-stone-100 hover:text-stone-800 dark:text-stone-300 dark:hover:bg-stone-700/50 dark:hover:text-stone-100"
            >
              <span className="min-w-0 truncate">بعدی: {nextTable.title}</span>
              <ChevronLeft size={15} className="shrink-0" />
            </button>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      )}

      {/* راند ۲۵۵ — دیالوگِ مشترکِ «کاربرد در جزوه» (تک‌منبع با چهار
          مصرف‌کنندهٔ پیشین): هر چیپِ جدول، جایِ واژه در متنِ واقعیِ جزوه
          را با mark و ترجمهٔ فارسیِ خودِ جزوه نشان می‌دهد. */}
      <WordUsageDialog target={usage} onClose={() => setUsage(null)} />
    </div>
  );
}
