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
import { useState } from "react";
import type { WordFamilyTable } from "@/data/word-families";
import { wordFamilyTableId } from "@/data/word-families";
import { faNum } from "@/lib/study-theme";
import { findWordUsages, type WordUsageSite } from "@/lib/word-usage";
import { ChevronLeft, ChevronRight, GraduationCap, BookOpenText } from "lucide-react";
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
  prevTable,
  nextTable,
  onNavigateTable,
  tablePosition,
  tableTotal,
}: {
  table: WordFamilyTable;
  /** درسِ مرتبط از WF_TABLE_ID_TO_LESSON — نبودش = بی‌چیپ («درس چهارمِ دهم»
   * در برنامه جای ندارد؛ صفرِ صادقانه). فقط بسترِ ضمیمه پرش می‌کند. */
  relatedLesson?: number;
  onOpenLesson?: () => void;
  /** ناوبریِ پیوسته (r227) — همسایه‌ها از فهرستِ رندرشده (فیلترِ فعال)؛
   * فقط بسترِ ضمیمه؛ برچسب = «<پایه> · <درس>». */
  prevTable?: { id: string; title: string };
  nextTable?: { id: string; title: string };
  onNavigateTable?: (id: string) => void;
  tablePosition?: number;
  tableTotal?: number;
}) {
  // راند ۲۵۵ — هدفِ دیالوگِ مشترکِ «کاربرد در جزوه» برایِ همین جدول
  const [usage, setUsage] = useState<WordUsageTarget | null>(null);
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
        <span className="c-track-70 ms-auto rounded-full px-2.5 py-1 text-[11px] font-black text-stone-600">
          {faNum(table.families.length)} خانواده
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
            {table.families.map((f, fi) => (
              <tr key={`${table.vision}-${table.lesson}-${fi}`} className={fi % 2 === 0 ? "bg-white" : "bg-stone-50"}>
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
            ))}
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
