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
import type { WordFamilyTable } from "@/data/word-families";
import { wordFamilyTableId } from "@/data/word-families";
import { faNum } from "@/lib/study-theme";
import { GraduationCap } from "lucide-react";
import SpeakButton from "../shared/speak-button";

/** سلولِ انگلیسیِ غیرتهی: واژه + دکمهٔ تلفظ (راند ۲۲۳ — بندِ ② نقشهٔ ۲۲۲). */
function EnSpeakCell({ word, bold }: { word: string; bold?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`en-text text-[12.5px] ${bold ? "font-black text-violet-700" : "text-stone-600"}`}
        dir="ltr"
      >
        {word}
      </span>
      <SpeakButton text={word} size="sm" />
    </span>
  );
}

export default function WordFamilyTableCard({
  table,
  relatedLesson,
  onOpenLesson,
}: {
  table: WordFamilyTable;
  /** درسِ مرتبط از WF_TABLE_ID_TO_LESSON — نبودش = بی‌چیپ («درس چهارمِ دهم»
   * در برنامه جای ندارد؛ صفرِ صادقانه). فقط بسترِ ضمیمه پرش می‌کند. */
  relatedLesson?: number;
  onOpenLesson?: () => void;
}) {
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
                    <EnSpeakCell word={f.noun} bold />
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {f.verb ? <EnSpeakCell word={f.verb} /> : <span className="text-stone-300">—</span>}
                </td>
                <td className="px-3 py-2">
                  {f.adjective ? <EnSpeakCell word={f.adjective} /> : <span className="text-stone-300">—</span>}
                </td>
                <td className="px-3 py-2">
                  {f.adverb ? <EnSpeakCell word={f.adverb} /> : <span className="text-stone-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
