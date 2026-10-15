"use client";

import { useState } from "react";
import { ListTree } from "lucide-react";
import { LESSONS_META, lessonNameFa, type LessonMeta } from "@/data/lesson-meta";
import { themeOf, faNum } from "@/lib/study-theme";
import { useStudy, knownCountOfLesson } from "@/lib/study-store";
import { percent } from "@/lib/domain/percent";
import { useMounted } from "@/lib/use-mounted";

/**
 * راند ۲۳۲ — «فهرست درس‌ها»: پرشِ سریع میانِ ۱۲ درس از خودِ سرصفحهٔ درس.
 * الگویِ فهرستِ پرشِ r228 روی scopeِ درسی: دکمه با aria-expanded/aria-controls،
 * پنلِ گروه‌بندی‌شده بر پایهٔ پایه، چیپِ درسِ فعلی توپُر و بی‌اثر
 * (aria-current + disabled — صادق: همین‌جایید)؛ بقیه با openLesson پرش می‌کنند
 * و پنل می‌بندد. گروه‌بندیِ پیاپیِ پایه‌ها عینِ ترتیبِ قفسهٔ کتاب (شناسه ۱ تا ۱۲) —
 * هیچ مرتب‌سازیِ جعلی. شمارشِ هر گروه و ترتیبِ چیپ‌ها از خودِ دادهٔ منجمد.
 * صفرِ نوشتن در استورِ یادگیری — openLesson فقط ناوبریِ دید است.
 */

interface GradeGroup {
  grade: string;
  lessons: LessonMeta[];
}

/** گروه‌بندیِ پیاپیِ پایه‌ها در ترتیبِ قفسهٔ کتاب: یازدهم(۳) دوازدهم(۳) دهم(۳) هفتم هشتم نهم */
export function gradeGroupsOf(source: LessonMeta[]): GradeGroup[] {
  const out: GradeGroup[] = [];
  for (const l of source) {
    const last = out[out.length - 1];
    if (last && last.grade === l.grade) last.lessons.push(l);
    else out.push({ grade: l.grade, lessons: [l] });
  }
  return out;
}

export default function LessonJumpIndex({ currentId }: { currentId: number }) {
  const [open, setOpen] = useState(false);
  const openLesson = useStudy((s) => s.openLesson);
  const known = useStudy((s) => s.known);
  const mounted = useMounted();
  const groups = gradeGroupsOf(LESSONS_META);

  /** راند ۲۳۳ — درصدِ واژگانِ بلدشدهٔ هر درس (خواندنِ read-only از استور،
   * با useMounted تا mismatchِ هیدریشن نداشته باشیم — ایدئومِ قفسهٔ کتاب).
   * صفرِ خوانده = هیچ عددی (صداقت: نویزِ صفر بی‌معناست). */
  const percentOf = (l: LessonMeta): number | null => {
    if (!mounted) return null;
    const pct = percent(knownCountOfLesson(known, l.id), l.vocabCount);
    return pct > 0 ? pct : null;
  };

  return (
    <>
      <div className="flex">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="lesson-jump-index"
          title="پرشِ سریع به هر درس — دوازده درس در شش پایه، درسِ فعلی توپُر است"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-stone-100 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/70"
        >
          <ListTree size={13} />
          فهرست درس‌ها
          <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10.5px] font-black text-stone-500 dark:bg-stone-800 dark:text-stone-300">
            {faNum(LESSONS_META.length)}
          </span>
        </button>
      </div>
      {open && (
        <div
          id="lesson-jump-index"
          role="group"
          aria-label="فهرست پرش درس‌ها"
          className="mb-1 mt-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60"
        >
          {groups.map((g) => (
            <div key={g.grade} className="mb-3 last:mb-0">
              {/* div نه heading — پنل میانِ h1 و نوارِ تب‌هاست و قراردادِ outline (P7) پرشِ سطح نمی‌پذیرد */}
              <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-extrabold text-stone-500 dark:text-stone-300">
                <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-black text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  پایهٔ {g.grade}
                </span>
                {faNum(g.lessons.length)} درس
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {g.lessons.map((l) => {
                  const current = l.id === currentId;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        openLesson(l.id);
                        setOpen(false);
                      }}
                      disabled={current}
                      aria-current={current ? "true" : undefined}
                      aria-label={
                        current
                          ? `درسِ فعلی: ${lessonNameFa(l.id)} — ${l.titleEn}`
                          : `پرش به ${lessonNameFa(l.id)} — پایهٔ ${l.grade}: ${l.titleEn}`
                      }
                      title={current ? "درسِ فعلی — همین‌جایید" : `${l.titleFa} — پایهٔ ${l.grade}`}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-right transition-[background-color,border-color,color,box-shadow] ${
                        current
                          ? "border-violet-600 bg-violet-600/10"
                          : "border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black ${
                          current
                            ? "bg-violet-600 text-white shadow-sm"
                            : themeOf(l.color).chipBg
                        }`}
                      >
                        {faNum(l.id)}
                      </span>
                      <span
                        className="en-text min-w-0 flex-1 truncate text-[12px] font-bold text-stone-700 dark:text-stone-200"
                        dir="ltr"
                      >
                        {l.titleEn}
                      </span>
                      {percentOf(l) !== null && (
                        <span
                          className="shrink-0 text-[10px] font-black text-emerald-700 dark:text-emerald-300"
                          title={`${faNum(knownCountOfLesson(known, l.id))} از ${faNum(l.vocabCount)} واژهٔ این درس بلدی`}
                        >
                          {faNum(percentOf(l) as number)}٪
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
